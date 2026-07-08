/**
 * Удалить дубликаты календаря, найденные при сверке с web.archive.org (2015–2024).
 *
 * Usage:
 *   npx tsx backend/scripts/migrate/remove-archive-extra-ids.ts
 *   npx tsx backend/scripts/migrate/remove-archive-extra-ids.ts --dry-run
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { rebuildCalendarIndexes } from '../rebuild-calendar-index'

const DRY_RUN = process.argv.includes('--dry-run')
const CALENDAR_DIR = path.join('data', 'v1', 'calendar')

/** id из отчёта report-archive-extra-ids.ts + 6 скрытых дублей 2024. */
const REMOVE_IDS = new Set([
  1359,
  1364, 1365,
  1373, 1374, 1376, 1379,
  1385, 1386,
  1393, 1394, 1395, 1402,
  1411, 1415, 1416, 1419, 1420,
  1427, 1429, 1431, 1441, 1442, 1443, 1446,
  1226, 1230, 1231, 1234, 1235, 1243, 1247,
  1449, 1452, 1454, 1458, 1463, 1470, 1471, 1474,
])

interface CalendarEvent {
  id: number
  year: number
  date_start: string
  location?: string | null
  rank_label?: string | null
  has_results?: boolean
  results_file?: string | null
  results_url?: string | null
  [key: string]: unknown
}

interface CalendarFile {
  schema: string
  year: number
  exported_at?: string
  event_count: number
  with_results: number
  events: CalendarEvent[]
}

async function main() {
  const files = (await fs.readdir(CALENDAR_DIR)).filter((f) => f.endsWith('.json')).sort()
  const removed: CalendarEvent[] = []
  let totalBefore = 0
  let totalAfter = 0

  for (const file of files) {
    const filePath = path.join(CALENDAR_DIR, file)
    const calendar = JSON.parse(await fs.readFile(filePath, 'utf-8')) as CalendarFile
    const events = calendar.events || []
    totalBefore += events.length

    const kept = events.filter((e) => {
      if (REMOVE_IDS.has(e.id)) {
        removed.push(e)
        return false
      }
      return true
    })

    totalAfter += kept.length

    const removedHere = events.length - kept.length
    if (removedHere > 0) {
      console.log(`${file}: ${events.length} → ${kept.length} (−${removedHere})`)
    }

    if (!DRY_RUN && removedHere > 0) {
      const withResults = kept.filter((e) => e.has_results).length
      const updated: CalendarFile = {
        ...calendar,
        exported_at: new Date().toISOString(),
        event_count: kept.length,
        with_results: withResults,
        events: kept,
      }
      await fs.writeFile(filePath, JSON.stringify(updated, null, 2) + '\n', 'utf-8')
    }
  }

  const missing = [...REMOVE_IDS].filter((id) => !removed.some((e) => e.id === id))
  if (missing.length) {
    console.warn(`Не найдены в календаре (уже удалены?): ${missing.join(', ')}`)
  }

  const stamp = new Date().toISOString().slice(0, 10)
  const backupDir = path.join('data', 'backup', `${stamp}-archive-extra-ids`)
  await fs.mkdir(backupDir, { recursive: true })

  const report = {
    source: 'web.archive.org calendar comparison',
    removed_ids: [...REMOVE_IDS].sort((a, b) => a - b),
    before: totalBefore,
    after: totalAfter,
    removed: removed.length,
    removed_events: removed.map((e) => ({
      id: e.id,
      year: e.year,
      date_start: e.date_start,
      location: e.location,
      rank_label: e.rank_label,
      has_results: e.has_results,
      results_file: e.results_file,
      results_url: e.results_url,
    })),
  }

  await fs.writeFile(path.join(backupDir, 'removed-archive-extra-ids.json'), JSON.stringify(report, null, 2))

  console.log(`\nBackup: ${backupDir}`)
  console.log(`Calendar: ${totalBefore} → ${totalAfter} (removed ${removed.length})`)

  if (DRY_RUN) {
    console.log('DRY RUN — calendar files not written')
    return
  }

  const indexStats = rebuildCalendarIndexes()
  console.log(`Indexes rebuilt: calendar-index ${indexStats.total} events`)

  let eventsWithResults = 0
  for (const file of files) {
    const calendar = JSON.parse(await fs.readFile(path.join(CALENDAR_DIR, file), 'utf-8')) as CalendarFile
    eventsWithResults += (calendar.events || []).filter((e) => e.has_results).length
  }

  const manifestPath = path.join('data', 'v1', 'manifest.json')
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8')) as {
    counts: { events: number; events_with_results: number }
    exported_at: string
    source: string
  }
  manifest.counts.events = indexStats.total
  manifest.counts.events_with_results = eventsWithResults
  manifest.exported_at = new Date().toISOString()
  manifest.source = 'archive-extra-ids-cleanup'
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf-8')
  console.log(`manifest.json: events ${manifest.counts.events}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
