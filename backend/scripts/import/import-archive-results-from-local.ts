/**
 * Импорт результатов 2023–2024 из локального архива data/archive/results/.
 *
 * Usage:
 *   npm run import-archive-results-local
 *   npm run import-archive-results-local -- --dry-run
 *   npm run import-archive-results-local -- --year 2024
 *   npm run import-archive-results-local -- --force
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCoursingHTML } from '../../parsers/coursing/index'
import { parseBzmpHTML } from '../../parsers/bzmp/index'
import { parseRacingHTML } from '../../parsers/racing/index'
import { normalizeDogName, normalizeBreed } from '../../parsers/coursing/utils'
import {
  ROOT,
  competitionRelPath,
  dogKey,
  monthFolder,
  writeJson,
} from '../export/d1-export-utils'

const V1 = path.join(ROOT, 'data/v1')
const ARCHIVE_RESULTS_DIR = path.join(ROOT, 'data/archive/results')
const MANIFEST_PATH = path.join(ARCHIVE_RESULTS_DIR, 'manifest.json')

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const FORCE = args.includes('--force')
const YEAR_FILTER = (() => {
  const i = args.indexOf('--year')
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : null
})()

interface ManifestEntry {
  results_url: string
  year: number
  local_file?: string
  status: string
  event_ids?: number[]
  rank_labels?: string[]
  dates?: string[]
  locations?: string[]
}

interface CalendarEvent {
  id: number
  year: number
  date_start: string
  date_end?: string | null
  title?: string | null
  rank_label?: string | null
  event_type?: string | null
  competition_kind?: string | null
  competition_type?: string | null
  host_club?: string | null
  region?: string | null
  location?: string | null
  catalog_url?: string | null
  results_url?: string | null
  confirmed?: number
  has_results?: boolean
  results_file?: string | null
  result_count?: number
  participants_count?: number
  judges?: string | null
  [key: string]: unknown
}

interface DogPayload {
  id: number
  dog_key: string
  name_lat: string
  name_ru: string | null
  breed: string
  sex: string | null
  owner: string | null
  competition_ids: number[]
  competition_files: string[]
  schema?: string
  exported_at?: string
}

function norm(s: string | null | undefined): string {
  return (s || '').replace(/\s+/g, ' ').trim().toLowerCase()
}

function normLoc(s: string | null | undefined): string {
  return norm(s)
    .replace(/обл\./g, 'область')
    .replace(/г\./g, 'город')
    .replace(/д\./g, 'деревня')
}

function rankMatches(a: string | null | undefined, b: string | null | undefined): boolean {
  const na = norm(a).replace(/-/g, ' ')
  const nb = norm(b).replace(/-/g, ' ')
  if (!na || !nb) return false
  if (na === nb) return true
  return na.includes(nb.slice(0, 28)) || nb.includes(na.slice(0, 28))
}

function resolveParserType(event: CalendarEvent, resultsUrl: string): 'coursing' | 'bzmp' | 'racing' | null {
  const m = resultsUrl.match(/Complete_Results_\d{4}-\d{2}-\d{2}_?([CBR])?\.html/i)
  const suffix = m?.[1]?.toUpperCase()
  if (suffix === 'C') return 'coursing'
  if (suffix === 'B') return 'bzmp'
  if (suffix === 'R') return 'racing'

  const rank = norm(event.rank_label)
  if (rank.includes('курсинг')) return 'coursing'
  if (rank.includes('бзмп') || rank.includes('механическ')) return 'bzmp'
  if (rank.includes('рейсинг') || rank.includes('бега')) return 'racing'
  if (rank.includes('монопородн') || rank.includes('национальн')) return 'coursing'
  if (rank.includes('свор') || rank.includes('тройк')) return null

  const et = (event.event_type || '').toLowerCase()
  if (et === 'coursing' || et === 'bzmp' || et === 'racing') return et
  return null
}

function findEventByManifest(
  entry: ManifestEntry,
  events: CalendarEvent[],
  byId: Map<number, CalendarEvent>,
): CalendarEvent | null {
  for (const id of entry.event_ids ?? []) {
    const hit = byId.get(id)
    if (hit) return hit
  }

  const date = entry.dates?.[0]
  const location = entry.locations?.[0]
  if (!date) return null

  for (const rank of entry.rank_labels ?? [null]) {
    const hit = events.find(
      (e) =>
        e.date_start === date &&
        normLoc(e.location) === normLoc(location) &&
        (rank == null || rankMatches(e.rank_label, rank)),
    )
    if (hit) return hit
  }

  return events.find(
    (e) => e.date_start === date && normLoc(e.location) === normLoc(location),
  ) ?? null
}

function scanMaxIds(): { maxDogId: number; maxResultId: number } {
  let maxDogId = 0
  let maxResultId = 0

  const dogsDir = path.join(V1, 'dogs/by-id')
  for (const file of fs.readdirSync(dogsDir)) {
    const id = Number(file.replace('.json', ''))
    if (!Number.isNaN(id)) maxDogId = Math.max(maxDogId, id)
  }

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.json')) {
        const data = JSON.parse(fs.readFileSync(full, 'utf-8')) as {
          results?: Array<{ id?: number }>
        }
        for (const r of data.results ?? []) {
          if (r.id) maxResultId = Math.max(maxResultId, Number(r.id))
        }
      }
    }
  }

  const compDir = path.join(V1, 'competitions')
  if (fs.existsSync(compDir)) walk(compDir)

  return { maxDogId, maxResultId }
}

function loadDogsByKey(): Map<string, DogPayload> {
  const map = new Map<string, DogPayload>()
  const dir = path.join(V1, 'dogs/by-key')
  for (const file of fs.readdirSync(dir)) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8')) as DogPayload
    map.set(data.dog_key, data)
  }
  return map
}

function saveDog(dog: DogPayload, exportedAt: string) {
  const payload = {
    schema: 'coursing-stats/dog-v1',
    exported_at: exportedAt,
    ...dog,
  }
  writeJson(path.join(V1, `dogs/by-id/${dog.id}.json`), payload)
  writeJson(path.join(V1, `dogs/by-key/${dog.dog_key}.json`), payload)
}

function loadCalendar(year: number): { events: CalendarEvent[]; byId: Map<number, CalendarEvent> } {
  const calPath = path.join(V1, `calendar/${year}.json`)
  const calendar = JSON.parse(fs.readFileSync(calPath, 'utf-8')) as { events: CalendarEvent[] }
  const byId = new Map(calendar.events.map((e) => [e.id, e]))
  return { events: calendar.events, byId }
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8')) as {
    entries: ManifestEntry[]
  }

  const entries = manifest.entries.filter((e) => {
    if (e.status !== 'ok' || !e.local_file) return false
    if (YEAR_FILTER && e.year !== YEAR_FILTER) return false
    return true
  })

  const exportedAt = new Date().toISOString()
  const { maxDogId: startDogId, maxResultId: startResultId } = scanMaxIds()
  let nextDogId = startDogId
  let nextResultId = startResultId

  const dogsByKey = loadDogsByKey()
  const report: Array<Record<string, unknown>> = []
  const calendars = new Map<number, { events: CalendarEvent[]; byId: Map<number, CalendarEvent> }>()
  const touchedYears = new Set<number>()

  let imported = 0
  let skipped = 0
  let failed = 0
  const importedByYear = new Map<number, number>()

  for (const entry of entries) {
    const year = entry.year
    if (!calendars.has(year)) calendars.set(year, loadCalendar(year))
    const { events, byId } = calendars.get(year)!

    const event = findEventByManifest(entry, events, byId)
    if (!event) {
      failed++
      report.push({
        year,
        status: 'no_event',
        local_file: entry.local_file,
        event_ids: entry.event_ids,
      })
      console.log(`[${year}] нет события в календаре: ${entry.local_file}`)
      continue
    }

    const resultsUrl = entry.results_url
    const rel = competitionRelPath(event, event.id)
    const absComp = path.join(V1, rel)
    if (!FORCE && fs.existsSync(absComp)) {
      const existing = JSON.parse(fs.readFileSync(absComp, 'utf-8')) as { results?: unknown[] }
      if ((existing.results?.length ?? 0) > 0) {
        skipped++
        report.push({ year, event_id: event.id, status: 'exists', local_file: entry.local_file })
        continue
      }
    }

    const localPath = path.join(ARCHIVE_RESULTS_DIR, entry.local_file.replace(/\\/g, '/'))
    if (!fs.existsSync(localPath)) {
      failed++
      report.push({ year, event_id: event.id, status: 'file_missing', local_file: entry.local_file })
      console.log(`[${year}] id=${event.id} файл не найден: ${localPath}`)
      continue
    }

    const parserType = resolveParserType(event, resultsUrl)
    if (!parserType) {
      failed++
      report.push({
        year,
        event_id: event.id,
        status: 'unknown_type',
        results_url: resultsUrl,
      })
      continue
    }

    console.log(`[${year}] id=${event.id} ${parserType} ${entry.local_file}`)
    const html = fs.readFileSync(localPath, 'utf-8')

    let parsed: {
      results: Array<Record<string, unknown>>
      judges?: string | null
      track_schemes?: unknown
      telegram_url?: string | null
      full_title?: string | null
      event_date?: string | null
      protocol_location?: string | null
    }

    try {
      if (parserType === 'coursing') parsed = await parseCoursingHTML(html)
      else if (parserType === 'bzmp') parsed = await parseBzmpHTML(html)
      else parsed = await parseRacingHTML(html)
    } catch (err) {
      failed++
      report.push({
        year,
        event_id: event.id,
        status: 'parse_error',
        local_file: entry.local_file,
        error: (err as Error).message,
      })
      console.log(`  → ошибка парсера: ${(err as Error).message}`)
      continue
    }

    if (!parsed.results?.length) {
      failed++
      report.push({ year, event_id: event.id, status: 'empty', local_file: entry.local_file })
      console.log('  → 0 строк результатов')
      continue
    }

    const competitionResults = []
    for (const row of parsed.results) {
      const nameLat = normalizeDogName(String(row.name ?? ''))
      const breed = normalizeBreed(String(row.breed ?? ''))
      const dk = dogKey(nameLat, breed)

      let dog = dogsByKey.get(dk)
      if (!dog) {
        nextDogId += 1
        dog = {
          id: nextDogId,
          dog_key: dk,
          name_lat: nameLat,
          name_ru: (row.name_ru as string) || String(row.name ?? nameLat),
          breed,
          sex: null,
          owner: null,
          competition_ids: [],
          competition_files: [],
        }
        dogsByKey.set(dk, dog)
      }

      if (!dog.competition_ids.includes(event.id)) {
        dog.competition_ids.push(event.id)
        dog.competition_ids.sort((a, b) => a - b)
      }
      if (!dog.competition_files.includes(rel)) {
        dog.competition_files.push(rel)
      }

      nextResultId += 1
      let rawScores = row.raw_scores_json
      if (typeof rawScores === 'string') {
        try {
          rawScores = JSON.parse(rawScores)
        } catch {
          /* keep string */
        }
      }

      competitionResults.push({
        id: nextResultId,
        event_id: event.id,
        dog_id: dog.id,
        breed_class: row.breed_class ?? null,
        catalog_no: row.catalog_no ?? null,
        placement: row.placement ?? null,
        total_score: row.total_score ?? null,
        judge_count: row.judge_count ?? 3,
        qualification: row.qualification ?? '',
        vc: row.vc ?? '',
        status: row.status ?? 'finished',
        raw_scores_json: rawScores ?? {},
        raw_text: String(row.raw_text ?? '').replace(/\n/g, ' '),
        judges: row.judges ?? '',
        status_reason: row.status_reason ?? null,
        dog_key: dk,
        dog: {
          id: dog.id,
          dog_key: dk,
          name_lat: dog.name_lat,
          name_ru: dog.name_ru,
          breed: dog.breed,
          sex: dog.sex,
          owner: dog.owner,
        },
      })
    }

    const eventPayload = {
      ...event,
      results_url: resultsUrl,
      judges: parsed.judges ?? event.judges ?? null,
      track_schemes: parsed.track_schemes ?? null,
      telegram_url: parsed.telegram_url ?? null,
      full_title: parsed.full_title ?? null,
      event_date: parsed.event_date ?? null,
      protocol_location: parsed.protocol_location ?? null,
      month: monthFolder(event.date_start),
    }

    event.results_url = resultsUrl
    event.has_results = true
    event.results_file = rel
    event.result_count = competitionResults.length
    event.participants_count = new Set(competitionResults.map((r) => r.dog_id)).size
    event.judges = parsed.judges ?? event.judges ?? null
    event.full_title = parsed.full_title ?? event.full_title ?? null

    if (!DRY_RUN) {
      writeJson(absComp, {
        schema: 'coursing-stats/competition-v1',
        exported_at: exportedAt,
        source: 'data/archive/results',
        event_id: event.id,
        event: eventPayload,
        result_count: competitionResults.length,
        results: competitionResults,
      })

      for (const dog of dogsByKey.values()) {
        if (dog.competition_ids.includes(event.id)) {
          saveDog(dog, exportedAt)
        }
      }
    }

    imported++
    importedByYear.set(year, (importedByYear.get(year) ?? 0) + 1)
    touchedYears.add(year)
    console.log(`  → ${competitionResults.length} результатов`)
    report.push({
      year,
      event_id: event.id,
      status: 'imported',
      results_url: resultsUrl,
      parser: parserType,
      result_count: competitionResults.length,
      file: rel,
      local_file: entry.local_file,
    })
  }

  if (!DRY_RUN) {
    for (const year of touchedYears) {
      const calPath = path.join(V1, `calendar/${year}.json`)
      const calendar = JSON.parse(fs.readFileSync(calPath, 'utf-8')) as {
        events: CalendarEvent[]
        event_count?: number
        with_results?: number
        exported_at?: string
      }
      const { events } = calendars.get(year)!
      calendar.events = events
      calendar.with_results = events.filter((e) => e.has_results).length
      calendar.event_count = events.length
      calendar.exported_at = exportedAt
      writeJson(calPath, calendar)
    }
  }

  const stamp = new Date().toISOString().slice(0, 10)
  const reportDir = path.join(ROOT, 'data/backup', `${stamp}-archive-local-import`)
  fs.mkdirSync(reportDir, { recursive: true })
  fs.writeFileSync(path.join(reportDir, 'report.json'), JSON.stringify(report, null, 2))

  console.log(`\nИмпорт: ${imported}, пропущено: ${skipped}, ошибки: ${failed}`)
  for (const [year, count] of [...importedByYear.entries()].sort((a, b) => a[0] - b[0])) {
    console.log(`  ${year}: ${count} событий`)
  }
  console.log(`Отчёт: ${reportDir}/report.json`)
  if (DRY_RUN) console.log('DRY RUN — файлы не записаны')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
