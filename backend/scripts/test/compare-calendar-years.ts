/**
 * Сравнение календаря procoursing.ru с БД (D1).
 * Usage: npx tsx backend/scripts/test/compare-calendar-years.ts [--local|--remote]
 */
import { execSync } from 'node:child_process'
import { fetchWin1251, sleep } from '../../lib/fetch-win1251'
import { scrapeYearPageFromHtml } from '../../parsers/calendar/scrape-year-page'

const USE_LOCAL = process.argv.includes('--local')
const YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]
const BASE = 'http://procoursing.ru'

interface ScrapedEvent {
  year: number
  date_start: string
  date_end: string | null
  title: string
  location: string
  event_type: string | null
  results_url: string | null
  rank_label: string
  cancelled: boolean
}

interface DbEvent {
  id: number
  year: number
  date_start: string
  title: string
  location: string
  event_type: string | null
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

function matchesScraped(row: DbEvent, scraped: ScrapedEvent): boolean {
  if (scraped.results_url && row.results_url === scraped.results_url) return true
  return (
    row.date_start === scraped.date_start &&
    row.location === scraped.location &&
    (row.event_type || 'unknown') === (scraped.event_type || 'unknown')
  )
}

function eventKey(e: { date_start: string; location: string; event_type: string | null; results_url?: string | null }) {
  return `${e.date_start}|${e.location}|${e.event_type || 'unknown'}|${e.results_url || ''}`
}

async function scrapeYear(year: number): Promise<ScrapedEvent[]> {
  const url = `${BASE}/s_${year}.html`
  const html = await fetchWin1251(url)
  return scrapeYearPageFromHtml(html, year) as ScrapedEvent[]
}

async function main() {
  const dbLabel = USE_LOCAL ? 'local D1' : 'remote D1 (prod)'
  console.log(`\nСравнение календаря procoursing.ru с ${dbLabel}\n`)

  const dbEvents = queryDb<DbEvent>(
    `SELECT id, year, date_start, title, location, event_type, results_url, rank_label
     FROM events WHERE year BETWEEN 2015 AND 2025 ORDER BY year, date_start`
  )

  const summary: Array<{
    year: number
    scraped: number
    scrapedActive: number
    db: number
    missingInDb: ScrapedEvent[]
    extraInDb: DbEvent[]
  }> = []

  for (const year of YEARS) {
    process.stderr.write(`Скрап ${year}... `)
    let scraped: ScrapedEvent[]
    try {
      scraped = await scrapeYear(year)
      process.stderr.write(`${scraped.length} строк\n`)
    } catch (err) {
      process.stderr.write(`ОШИБКА: ${(err as Error).message}\n`)
      continue
    }

    const active = scraped.filter((e) => !e.cancelled)
    const dbYear = dbEvents.filter((e) => e.year === year)

    const missingInDb = active.filter((s) => !dbYear.some((d) => matchesScraped(d, s)))
    const extraInDb = dbYear.filter((d) => !active.some((s) => matchesScraped(d, s)))

    summary.push({
      year,
      scraped: scraped.length,
      scrapedActive: active.length,
      db: dbYear.length,
      missingInDb,
      extraInDb,
    })

    await sleep(800)
  }

  console.log('| Год | На сайте РКФ | В БД | Не в БД | Лишние в БД |')
  console.log('|-----|-------------|------|---------|-------------|')
  let totalMissing = 0
  let totalExtra = 0

  for (const row of summary) {
    const miss = row.missingInDb.length
    const extra = row.extraInDb.length
    totalMissing += miss
    totalExtra += extra
    console.log(
      `| ${row.year} | ${row.scrapedActive} (${row.scraped} всего) | ${row.db} | ${miss} | ${extra} |`
    )
  }

  console.log(`\n**Итого не в БД:** ${totalMissing}  |  **Лишние в БД:** ${totalExtra}\n`)

  for (const row of summary) {
    if (row.missingInDb.length === 0) continue
    console.log(`\n### ${row.year} — отсутствуют в БД (${row.missingInDb.length})\n`)
    for (const e of row.missingInDb) {
      const kind = e.rank_label.split('\n')[0].slice(0, 60)
      console.log(`- **${e.date_start}** | ${e.location}`)
      console.log(`  ${kind}`)
      if (e.results_url) console.log(`  ${e.results_url}`)
      else console.log(`  _(без ссылки на протокол)_`)
    }
  }

  for (const row of summary) {
    if (row.extraInDb.length === 0) continue
    console.log(`\n### ${row.year} — есть в БД, нет в календаре (${row.extraInDb.length})\n`)
    for (const e of row.extraInDb.slice(0, 15)) {
      console.log(`- id=${e.id} **${e.date_start}** | ${e.location} | ${e.event_type}`)
    }
    if (row.extraInDb.length > 15) {
      console.log(`  … и ещё ${row.extraInDb.length - 15}`)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
