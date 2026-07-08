/**
 * Импорт результатов 2023–2024 из web.archive.org в data/v1/competitions/.
 *
 * Usage:
 *   npx tsx backend/scripts/import/import-calendar-results-from-archive.ts
 *   npx tsx backend/scripts/import/import-calendar-results-from-archive.ts --dry-run
 *   npx tsx backend/scripts/import/import-calendar-results-from-archive.ts --year 2024
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCoursingHTML } from '../../parsers/coursing/index'
import { parseBzmpHTML } from '../../parsers/bzmp/index'
import { parseRacingHTML } from '../../parsers/racing/index'
import { scrapeYearPageFromHtml } from '../../parsers/calendar/scrape-year-page'
import { normalizeDogName, normalizeBreed } from '../../parsers/coursing/utils'
import { fetchArchiveWin1251, sleep } from '../../lib/fetch-archive-win1251'
import {
  ROOT,
  competitionRelPath,
  dogKey,
  monthFolder,
  writeJson,
} from '../export/d1-export-utils'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const V1 = path.join(ROOT, 'data/v1')
const ARCHIVE_DIR = path.join(ROOT, 'data/tmp/archive')
const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const YEAR_FILTER = (() => {
  const i = args.indexOf('--year')
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : null
})()
const YEARS = YEAR_FILTER ? [YEAR_FILTER] : [2023, 2024]

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

function findArchiveResultsUrl(
  event: CalendarEvent,
  archive: ReturnType<typeof scrapeYearPageFromHtml>,
): string | null {
  if (event.results_url) return event.results_url

  const hit = archive.find(
    (a) =>
      a.date_start === event.date_start &&
      normLoc(a.location) === normLoc(event.location) &&
      rankMatches(a.rank_label, event.rank_label),
  )
  return hit?.results_url ?? null
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

async function main() {
  const exportedAt = new Date().toISOString()
  const { maxDogId: startDogId, maxResultId: startResultId } = scanMaxIds()
  let nextDogId = startDogId
  let nextResultId = startResultId

  const dogsByKey = loadDogsByKey()
  const report: Array<Record<string, unknown>> = []

  let imported = 0
  let skipped = 0
  let failed = 0

  for (const year of YEARS) {
    const calPath = path.join(V1, `calendar/${year}.json`)
    const calendar = JSON.parse(fs.readFileSync(calPath, 'utf-8')) as {
      events: CalendarEvent[]
      event_count: number
      with_results: number
    }

    const archiveHtmlPath = path.join(ARCHIVE_DIR, `s_${year}.html`)
    const archive = fs.existsSync(archiveHtmlPath)
      ? scrapeYearPageFromHtml(fs.readFileSync(archiveHtmlPath, 'utf-8'), year)
      : []

    for (const event of calendar.events) {
      const resultsUrl = findArchiveResultsUrl(event, archive)
      if (!resultsUrl) {
        report.push({ year, event_id: event.id, status: 'no_url', date: event.date_start })
        continue
      }

      const rel = competitionRelPath(event, event.id)
      const absComp = path.join(V1, rel)
      if (fs.existsSync(absComp)) {
        const existing = JSON.parse(fs.readFileSync(absComp, 'utf-8')) as { results?: unknown[] }
        if ((existing.results?.length ?? 0) > 0) {
          skipped++
          report.push({ year, event_id: event.id, status: 'exists', results_url: resultsUrl })
          continue
        }
      }

      const parserType = resolveParserType(event, resultsUrl)
      if (!parserType) {
        failed++
        report.push({ year, event_id: event.id, status: 'unknown_type', results_url: resultsUrl })
        continue
      }

      console.log(`[${year}] id=${event.id} ${parserType} ${resultsUrl}`)
      const html = await fetchArchiveWin1251(resultsUrl)
      await sleep(600)

      if (!html) {
        failed++
        report.push({ year, event_id: event.id, status: 'archive_miss', results_url: resultsUrl })
        console.log('  → нет снимка в archive.org')
        continue
      }

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
          results_url: resultsUrl,
          error: (err as Error).message,
        })
        console.log(`  → ошибка парсера: ${(err as Error).message}`)
        continue
      }

      if (!parsed.results?.length) {
        failed++
        report.push({ year, event_id: event.id, status: 'empty', results_url: resultsUrl })
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
          source: 'web.archive.org',
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
      console.log(`  → ${competitionResults.length} результатов`)
      report.push({
        year,
        event_id: event.id,
        status: 'imported',
        results_url: resultsUrl,
        parser: parserType,
        result_count: competitionResults.length,
        file: rel,
      })
    }

    if (!DRY_RUN) {
      calendar.with_results = calendar.events.filter((e) => e.has_results).length
      calendar.event_count = calendar.events.length
      writeJson(calPath, {
        ...JSON.parse(fs.readFileSync(calPath, 'utf-8')),
        exported_at: exportedAt,
        event_count: calendar.event_count,
        with_results: calendar.with_results,
        events: calendar.events,
      })
    }
  }

  const stamp = new Date().toISOString().slice(0, 10)
  const reportDir = path.join(ROOT, 'data/backup', `${stamp}-archive-results-import`)
  fs.mkdirSync(reportDir, { recursive: true })
  fs.writeFileSync(path.join(reportDir, 'report.json'), JSON.stringify(report, null, 2))

  console.log(`\nИмпорт: ${imported}, пропущено: ${skipped}, ошибки: ${failed}`)
  console.log(`Отчёт: ${reportDir}/report.json`)
  if (DRY_RUN) console.log('DRY RUN — файлы не записаны')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
