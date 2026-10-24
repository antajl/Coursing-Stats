/**
 * Пересобрать indexes/calendar-index.json и indexes/events-by-id.json
 * из актуальных data/v1/calendar/{year}.json (после dedupe или ручных правок).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { monthFolder, writeJson } from './export/d1-export-utils'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const V1 = path.join(ROOT, 'data/v1')
const CALENDAR_DIR = path.join(V1, 'calendar')

interface CalendarEvent {
  id: number
  year: number
  date_start: string
  title?: string | null
  has_results?: boolean
  results_file?: string | null
  result_count?: number
  participants_count?: number
  [key: string]: unknown
}

/** Legacy aliases from old 4-digit D1 competition IDs to canonical archive IDs */
const LEGACY_EVENT_ALIASES: Record<string, string> = {
  '1224': '20240408',
  '1227': '20240512',
  '1233': '20240617',
  '1455': '20240609',
  '1456': '20240615',
  '1238': '20240825',
  '1464': '20240833',
  '1466': '20240908',
  '1245': '20240923',
  '1249': '20241028',
}

/** Путь относительно data/v1/ для fetchJson на фронте. */
export function resolveResultsFilePath(
  resultsFile: string | null | undefined,
  year: number,
  month: string,
): string | null {
  if (!resultsFile) return null
  const rf = String(resultsFile)
  if (rf.startsWith('competitions/')) return rf
  return `competitions/${year}/${month}/${rf}`
}

export function rebuildCalendarIndexes(): { total: number; years: number } {
  const files = fs
    .readdirSync(CALENDAR_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()

  const calendarManifest: Array<CalendarEvent & { calendar_file: string; month: string }> = []

  for (const file of files) {
    const year = Number(file.replace('.json', ''))
    const filePath = path.join(CALENDAR_DIR, file)
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as {
      events?: CalendarEvent[]
      event_count?: number
      with_results?: number
      [key: string]: unknown
    }

    let fileChanged = false

    for (const event of data.events ?? []) {
      const month = monthFolder(String(event.date_start ?? ''))
      const resolved = resolveResultsFilePath(event.results_file, Number(event.year ?? year), month)

      if (resolved) {
        const fullCompPath = path.join(V1, resolved)
        if (fs.existsSync(fullCompPath)) {
          try {
            const compDoc = JSON.parse(fs.readFileSync(fullCompPath, 'utf-8')) as {
              result_count?: number
              results?: Array<{ dog_id?: number }>
            }
            const results = Array.isArray(compDoc.results) ? compDoc.results : []
            const compResultCount =
              typeof compDoc.result_count === 'number' && compDoc.result_count > 0
                ? compDoc.result_count
                : results.length
            const uniqueDogs =
              new Set(
                results
                  .map((r) => r.dog_id)
                  .filter((id): id is number => typeof id === 'number'),
              ).size || compResultCount

            if (compResultCount > 0) {
              if (event.has_results !== true) {
                event.has_results = true
                fileChanged = true
              }
              if (event.result_count !== compResultCount) {
                event.result_count = compResultCount
                fileChanged = true
              }
              if (event.participants_count !== uniqueDogs) {
                event.participants_count = uniqueDogs
                fileChanged = true
              }
            }
          } catch (err) {
            console.warn(`Failed to inspect competition file ${resolved}:`, err)
          }
        }
      }

      calendarManifest.push({
        ...event,
        year: Number(event.year ?? year),
        month,
        calendar_file: `calendar/${year}.json`,
      })
    }

    if (fileChanged) {
      data.event_count = (data.events ?? []).length
      data.with_results = (data.events ?? []).filter((e) => e.has_results).length
      writeJson(filePath, data)
    }
  }

  calendarManifest.sort((a, b) => {
    const byDate = String(a.date_start).localeCompare(String(b.date_start))
    if (byDate !== 0) return byDate
    return Number(a.id) - Number(b.id)
  })

  writeJson(path.join(V1, 'indexes/calendar-index.json'), calendarManifest)

  // Same numeric id can appear in archive years and later calendars (e.g. 1557).
  // Prefer the entry that has results_file / has_results.
  const eventsById: Record<
    string,
    {
      results_file: string | null
      date_start: string
      title: string | null
      has_results: boolean
    }
  > = {}

  const putById = (
    key: string,
    next: {
      results_file: string | null
      date_start: string
      title: string | null
      has_results: boolean
    },
  ) => {
    const prev = eventsById[key]
    if (!prev) {
      eventsById[key] = next
      return
    }
    const prevScore = (prev.has_results ? 2 : 0) + (prev.results_file ? 1 : 0)
    const nextScore = (next.has_results ? 2 : 0) + (next.results_file ? 1 : 0)
    if (nextScore > prevScore) eventsById[key] = next
  }

  for (const e of calendarManifest) {
    const next = {
      results_file: resolveResultsFilePath(e.results_file, e.year, e.month),
      date_start: e.date_start,
      title: e.title ?? null,
      has_results: Boolean(e.has_results),
    }
    putById(String(e.id), next)
    // Alias competition file id (1567-….json) so /event/1567 resolves protocols
    // even when calendar row uses YYYYMMDD and a later year reused the numeric id.
    const m = next.results_file?.match(/\/(\d+)-[^/]+\.json$/)
    if (m && m[1] !== String(e.id)) {
      putById(m[1], next)
    }
  }

  // Alias legacy 4-digit IDs to canonical archive events so old bookmarks and links resolve
  for (const [legacyId, canonicalId] of Object.entries(LEGACY_EVENT_ALIASES)) {
    if (eventsById[canonicalId] && !eventsById[legacyId]) {
      eventsById[legacyId] = eventsById[canonicalId]
    }
  }

  writeJson(path.join(V1, 'indexes/events-by-id.json'), eventsById)

  return { total: calendarManifest.length, years: files.length }
}

const isMain =
  Boolean(process.argv[1]) &&
  path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1])

if (isMain) {
  const stats = rebuildCalendarIndexes()
  console.log(`calendar-index: ${stats.total} events across ${stats.years} years`)
}
