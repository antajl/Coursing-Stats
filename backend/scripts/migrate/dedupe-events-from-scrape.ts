import { execSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

const args = process.argv.slice(2)
const USE_LOCAL = args.includes('--local')
const DRY_RUN = args.includes('--dry-run')
const EVENTS_FILE = args.find((a) => !a.startsWith('--')) || 'data/events/events.json'

interface ScrapedEvent {
  year: number
  date_start: string
  title: string
  location: string
  event_type: string | null
  results_url: string | null
  rank_label: string
}

interface DbEvent {
  id: number
  year: number
  date_start: string
  title: string
  location: string
  event_type: string
  results_url: string | null
  rank_label: string
}

function queryDb<T>(sql: string): T[] {
  const flag = USE_LOCAL ? '--local' : '--remote'
  const command = `npx wrangler d1 execute pc-db ${flag} --command="${sql.replace(/"/g, '\\"')}" --json`
  const output = execSync(command, { cwd: process.cwd(), encoding: 'utf-8' })
  const parsed = JSON.parse(output)
  if (parsed?.[0]?.results) return parsed[0].results as T[]
  return []
}

function scoreRow(row: DbEvent, scraped: ScrapedEvent, resultsCount: number): number {
  let score = resultsCount * 10_000
  if (row.title === scraped.title) score += 100
  if (row.rank_label.includes('\n')) score += 50
  if (row.rank_label === scraped.rank_label) score += 40
  if (row.results_url && row.results_url === scraped.results_url) score += 30
  score += row.id / 1_000_000
  return score
}

function matchesScraped(row: DbEvent, scraped: ScrapedEvent): boolean {
  if (scraped.results_url && row.results_url === scraped.results_url) return true
  return (
    row.date_start === scraped.date_start &&
    row.location === scraped.location &&
    (row.event_type || 'unknown') === (scraped.event_type || 'unknown')
  )
}

async function main() {
  const scraped = JSON.parse(await fs.readFile(EVENTS_FILE, 'utf-8')) as ScrapedEvent[]
  const scrapedYears = [...new Set(scraped.map((e) => e.year))].sort()
  const yearFilter = scrapedYears.map((y) => `year = ${y}`).join(' OR ')

  const dbEvents = queryDb<DbEvent>(
    `SELECT id, year, date_start, title, location, event_type, results_url, rank_label FROM events WHERE ${yearFilter} ORDER BY id`
  )

  const allIds = dbEvents.map((e) => e.id)
  const resultCounts =
    allIds.length > 0
      ? queryDb<{ event_id: number; n: number }>(
          `SELECT event_id, COUNT(*) as n FROM results WHERE event_id IN (${allIds.join(',')}) GROUP BY event_id`
        )
      : []
  const resultsByEvent = new Map(resultCounts.map((r) => [r.event_id, r.n]))

  const keepIds = new Set<number>()
  const reassignResults: { from: number; to: number }[] = []

  for (const scrape of scraped) {
    const candidates = dbEvents.filter((row) => matchesScraped(row, scrape))
    if (candidates.length === 0) continue
    const canonical = [...candidates].sort(
      (a, b) => scoreRow(b, scrape, resultsByEvent.get(b.id) || 0) - scoreRow(a, scrape, resultsByEvent.get(a.id) || 0)
    )[0]
    keepIds.add(canonical.id)

    for (const row of candidates) {
      if (row.id === canonical.id) continue
      const n = resultsByEvent.get(row.id) || 0
      if (n > 0) reassignResults.push({ from: row.id, to: canonical.id })
    }
  }

  const toDelete = dbEvents.filter((row) => !keepIds.has(row.id))
  const stamp = new Date().toISOString().slice(0, 10)
  const backupDir = path.join('data', 'backup', `${stamp}-calendar-dedupe`)
  await fs.mkdir(backupDir, { recursive: true })

  const ids = toDelete.map((e) => e.id)

  const deleteSql = [
    ...reassignResults.map(
      ({ from, to }) => `UPDATE results SET event_id = ${to} WHERE event_id = ${from};`
    ),
    ...toDelete.flatMap((row) => [
      `DELETE FROM results WHERE event_id = ${row.id};`,
      `DELETE FROM events WHERE id = ${row.id};`,
    ]),
  ]

  await fs.writeFile(
    path.join(backupDir, 'events-removed.json'),
    JSON.stringify(
      toDelete.map((row) => ({ ...row, results_count: resultsByEvent.get(row.id) || 0 })),
      null,
      2
    )
  )
  await fs.writeFile(path.join(backupDir, 'delete-events.sql'), deleteSql.join('\n'))
  await fs.writeFile(
    path.join(backupDir, 'README.md'),
    `# Backup: dedupe calendar events (${stamp})

Создано скриптом \`backend/scripts/migrate/dedupe-events-from-scrape.ts\`.

## Файлы

- \`events-removed.json\` — удалённые события
- \`delete-events.sql\` — SQL удаления (results + events)

## Статистика

- Scrape: ${scraped.length} событий, годы ${scrapedYears.join(', ')}
- В БД: ${dbEvents.length}, оставлено ${keepIds.size}, удалено ${toDelete.length}
`
  )

  console.log(`Backup: ${backupDir}`)
  console.log(`Keep: ${keepIds.size}, delete: ${toDelete.length}`)
  if (DRY_RUN || toDelete.length === 0) return

  execSync(
    `npx wrangler d1 execute pc-db ${USE_LOCAL ? '--local' : '--remote'} --file=./${path.join(backupDir, 'delete-events.sql').replace(/\\/g, '/')}`,
    { stdio: 'inherit' }
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
