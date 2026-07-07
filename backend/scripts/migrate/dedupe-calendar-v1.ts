/**
 * Удалить дубликаты из data/v1/calendar/{year}.json.
 *
 * Одно соревнование = одинаковые дата, локация, дисциплина и название.
 * Без procoursing — только наша база.
 *
 * Usage:
 *   npm run dedupe-calendar
 *   npm run dedupe-calendar -- --dry-run
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { rebuildCalendarIndexes } from '../rebuild-calendar-index'
import {
  eventDedupeKey,
  scoreCanonicalEvent,
  type EventIdentityFields,
} from '../../lib/event-identity'

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const CALENDAR_DIR = path.join('data', 'v1', 'calendar')

interface CalendarEvent extends EventIdentityFields {
  id: number
  year: number
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

interface RemovedEvent extends CalendarEvent {
  year_file: string
  kept_id: number
}

function pickCanonical(group: CalendarEvent[]): CalendarEvent {
  return [...group].sort((a, b) => scoreCanonicalEvent(b) - scoreCanonicalEvent(a))[0]
}

async function main() {
  const files = (await fs.readdir(CALENDAR_DIR))
    .filter((f) => f.endsWith('.json'))
    .sort()

  const allRemoved: RemovedEvent[] = []
  const idRemap = new Map<number, number>()
  let totalBefore = 0
  let totalAfter = 0

  for (const file of files) {
    const filePath = path.join(CALENDAR_DIR, file)
    const calendar = JSON.parse(await fs.readFile(filePath, 'utf-8')) as CalendarFile
    const events = calendar.events || []
    totalBefore += events.length

    const groups = new Map<string, CalendarEvent[]>()
    for (const event of events) {
      const key = eventDedupeKey(event)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(event)
    }

    const keepIds = new Set<number>()
    for (const group of groups.values()) {
      const canonical = pickCanonical(group)
      keepIds.add(canonical.id)
      for (const row of group) {
        if (row.id !== canonical.id) {
          idRemap.set(row.id, canonical.id)
          allRemoved.push({ ...row, year_file: file, kept_id: canonical.id })
        }
      }
    }

    const kept = events.filter((row) => keepIds.has(row.id))
    totalAfter += kept.length

    if (allRemoved.some((r) => r.year_file === file)) {
      const removedHere = allRemoved.filter((r) => r.year_file === file).length
      console.log(`${file}: ${events.length} → ${kept.length} (−${removedHere})`)
    }

    if (!DRY_RUN) {
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

  const stamp = new Date().toISOString().slice(0, 10)
  const backupDir = path.join('data', 'backup', `${stamp}-calendar-dedupe`)
  await fs.mkdir(backupDir, { recursive: true })

  const report = {
    rule: 'date_start + location + discipline + competition name',
    before: totalBefore,
    after: totalAfter,
    removed: allRemoved.length,
    groups: allRemoved.length,
    id_remap: Object.fromEntries([...idRemap.entries()].map(([from, to]) => [String(from), to])),
    removed_events: allRemoved.map((r) => ({
      id: r.id,
      kept_id: r.kept_id,
      year_file: r.year_file,
      date_start: r.date_start,
      location: r.location,
      event_type: r.event_type,
      rank_label: r.rank_label,
      title: r.title,
      has_results: r.has_results,
    })),
  }

  await fs.writeFile(path.join(backupDir, 'calendar-dedupe-report.json'), JSON.stringify(report, null, 2))
  await fs.writeFile(
    path.join(backupDir, 'README.md'),
    `# Dedupe calendar (${stamp})

Правило: **дата + локация + дисциплина + название**.

- До: ${totalBefore}
- После: ${totalAfter}
- Удалено: ${allRemoved.length}
${DRY_RUN ? '\n**DRY RUN** — файлы не изменены.\n' : ''}

См. \`calendar-dedupe-report.json\`.
`
  )

  console.log(`\nBackup: ${backupDir}`)
  console.log(`Calendar: ${totalBefore} → ${totalAfter} (removed ${allRemoved.length})`)
  if (DRY_RUN) {
    console.log('DRY RUN — calendar files not written')
    return
  }

  const indexStats = rebuildCalendarIndexes()
  console.log(`Indexes rebuilt: calendar-index ${indexStats.total} events`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
