/**
 * One-off: fetch Full_Results_* HTML from Wayback and import into data/v1/competitions.
 *
 * Usage:
 *   npx tsx backend/scripts/import/import-full-results-archive.ts
 *   npx tsx backend/scripts/import/import-full-results-archive.ts --dry-run
 *   npx tsx backend/scripts/import/import-full-results-archive.ts --limit 2
 *   npx tsx backend/scripts/import/import-full-results-archive.ts --only 2015_03 --overwrite
 */
import fs from 'node:fs'
import path from 'node:path'
import iconv from 'iconv-lite'
import { parseCoursingHTML } from '../../parsers/coursing/index'
import { parseBzmpHTML } from '../../parsers/bzmp/index'
import { parseRacingHTML } from '../../parsers/racing/index'
import { parseLegacyFullResultsHTML } from '../../parsers/legacy-full-results/index'
import { normalizeBreed, normalizeDogName } from '../../parsers/coursing/utils'
import {
  ROOT,
  competitionRelPath,
  dogKey,
  writeJson,
} from '../export/d1-export-utils'

const V1 = path.join(ROOT, 'data/v1')
const OUT_HTML = path.join(ROOT, 'data/tmp/full-results-archive')
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CoursingStatsBot/0.1 (non-commercial)'

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
/** Re-parse into competitions that already have results (preserves dog_ids by dog_key). */
const OVERWRITE = args.includes('--overwrite')
const LIMIT = (() => {
  const i = args.indexOf('--limit')
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : null
})()
/** Substring match on Full_Results basename, e.g. `--only 2015_03` */
const ONLY = (() => {
  const i = args.indexOf('--only')
  return i >= 0 && args[i + 1] ? String(args[i + 1]) : null
})()

/** Wayback viewer URLs → we fetch id_ (raw) snapshots */
const SOURCES: string[] = [
  'https://web.archive.org/web/20171005153223/http://procoursing.ru/Full_Results_2015_08.html',
  'https://web.archive.org/web/20171005153249/http://procoursing.ru/Full_Results_2015_03.html',
  'https://web.archive.org/web/20171005153314/http://procoursing.ru/Full_Results_2016_02.html',
  'https://web.archive.org/web/20170421200413/http://procoursing.ru/Full_Results_2016_08.html',
  'https://web.archive.org/web/20170525160826/http://procoursing.ru/Full_Results_2017_02.html',
  'https://web.archive.org/web/20170818144457/http://procoursing.ru/Full_Results_2017_08.html',
  'https://web.archive.org/web/20170925161303/http://procoursing.ru/Full_Results_2017_09_by_points.html',
  'https://web.archive.org/web/20190822134921/http://procoursing.ru/Full_Results_2018_03.html',
  'https://web.archive.org/web/20190822132021/http://procoursing.ru/Full_Results_2018-06-11_by_points.html',
  'https://web.archive.org/web/20190822134840/http://procoursing.ru/Full_Results_2018-08-12.html',
  'https://web.archive.org/web/20190822140510/http://procoursing.ru/Full_Results_2018-08-26.html',
  'https://web.archive.org/web/20180919124248/http://procoursing.ru/Full_Results_2018-09-15.html',
  'https://web.archive.org/web/20190822132005/http://procoursing.ru/Full_Results_2019-03-03.html',
  'https://web.archive.org/web/20190806040649/http://procoursing.ru/Full_Results_2019-04-27.html',
  'https://web.archive.org/web/20190719131534/http://procoursing.ru/Full_Results_2019-06-15.html',
  'https://web.archive.org/web/20190919230532/http://procoursing.ru/Full_Results_2019-08-25.html',
  'https://web.archive.org/web/20190919230542/http://procoursing.ru/Full_Results_2019-09-01.html',
  'https://web.archive.org/web/20190919235708/http://procoursing.ru/Full_Results_2019-09-15.html',
  'https://web.archive.org/web/20191017124012/http://procoursing.ru/Full_Results_2019-09-22.html',
  'https://web.archive.org/web/20220506133530/http://procoursing.ru/Full_Results_2020-08-15_2.html',
  'https://web.archive.org/web/20220321114137/http://procoursing.ru/Full_Results_2020-08-15_1.html',
  'https://web.archive.org/web/20220311190554/http://procoursing.ru/Full_Results_2020-09-12.html',
  'https://web.archive.org/web/20211220183932/http://procoursing.ru/Full_Results_2020-09-20.html',
  'https://web.archive.org/web/20220311190531/http://procoursing.ru/Full_Results_2021-04-18_BegaChR.html',
  'https://web.archive.org/web/20220311190500/http://procoursing.ru/Full_Results_2021-04-17_ChRKF.html',
  'https://web.archive.org/web/20220407140232/http://procoursing.ru/Full_Results_2021-04-24.html',
  'https://web.archive.org/web/20220419104824/http://procoursing.ru/Full_Results_2021-05-02.html',
  'https://web.archive.org/web/20220311190533/http://procoursing.ru/Full_Results_2021-05-22.html',
  'https://web.archive.org/web/20220419105248/http://procoursing.ru/Full_Results_2021-06-19.html',
  'https://web.archive.org/web/20220419104827/http://procoursing.ru/Full_Results_2021-08-07.html',
  'https://web.archive.org/web/20220419105606/http://procoursing.ru/Full_Results_2021-08-21.html',
  'https://web.archive.org/web/20220419104822/http://procoursing.ru/Full_Results_2021-09-04_ChRKF.html',
  'https://web.archive.org/web/20220407140403/http://procoursing.ru/Full_Results_2021-09-04_CACL.html',
  'https://web.archive.org/web/20220405083623/http://procoursing.ru/Full_Results_2021-09-18.html',
  'https://web.archive.org/web/20220422210910/http://procoursing.ru/Full_Results_2021-10-02.html',
]

function toRawArchiveUrl(waybackUrl: string): string {
  return waybackUrl.replace(/\/web\/(\d{14})\//, '/web/$1id_/')
}

function basenameFromUrl(url: string): string {
  const m = url.match(/Full_Results_[^/?#]+/i)
  return m ? m[0].replace(/\.html$/i, '') : 'unknown'
}

function guessDateFromFilename(name: string): string | null {
  // Full_Results_2018-06-11_by_points / Full_Results_2021-04-18_BegaChR
  let m = name.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (m) return `${m[1]}-${m[2]}-${m[3]}`
  // Full_Results_2015_08 / Full_Results_2017_02 → month only, use day 01 as placeholder? Better leave null and parse from HTML
  m = name.match(/(\d{4})_(\d{2})$/)
  if (m) return `${m[1]}-${m[2]}-01`
  m = name.match(/(\d{4})_(\d{2})_/)
  if (m) return `${m[1]}-${m[2]}-01`
  return null
}

function guessParserType(name: string, html: string): 'coursing' | 'bzmp' | 'racing' {
  const n = name.toLowerCase()
  if (n.includes('bega') || n.includes('racing') || /бега/i.test(html.slice(0, 2000))) return 'racing'
  if (n.includes('bzmp') || /бзмп|механическ/i.test(html.slice(0, 2000))) return 'bzmp'
  return 'coursing'
}

function extractTitleFromHtml(html: string): string | null {
  const t = html.match(/<title[^>]*>([^<]+)/i)?.[1]?.trim()
  if (t && t.length > 3 && !/procoursing/i.test(t)) return t.replace(/\s+/g, ' ')
  // common header patterns
  const h = html.match(/<(?:h1|h2|b)[^>]*>\s*([^<]{10,120})/i)?.[1]?.trim()
  return h ? h.replace(/\s+/g, ' ') : null
}

function extractDateFromHtml(html: string): string | null {
  const m =
    html.match(/(\d{2})\.(\d{2})\.(\d{4})/) ||
    html.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return null
  if (m[0].includes('-')) return `${m[1]}-${m[2]}-${m[3]}`
  return `${m[3]}-${m[2]}-${m[1]}`
}

async function fetchHtml(waybackUrl: string): Promise<string | null> {
  const raw = toRawArchiveUrl(waybackUrl)
  const res = await fetch(raw, { headers: { 'User-Agent': UA } })
  if (!res.ok) {
    console.warn(`  HTTP ${res.status} ${raw}`)
    return null
  }
  const buf = Buffer.from(await res.arrayBuffer())
  const html = iconv.decode(buf, 'win1251')
  if (!html.includes('<') || html.length < 200) return null
  return html
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

type DogPayload = {
  id: number
  dog_key: string
  name_lat: string
  name_ru: string | null
  breed: string
  sex: null
  owner: null
  competition_ids: number[]
  competition_files: string[]
}

function loadDogsByKey(): Map<string, DogPayload> {
  const map = new Map<string, DogPayload>()
  const dir = path.join(V1, 'dogs/by-key')
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.json')) continue
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8')) as DogPayload
    map.set(data.dog_key, data)
  }
  return map
}

function maxDogId(dogs: Map<string, DogPayload>): number {
  let max = 0
  for (const d of dogs.values()) max = Math.max(max, d.id)
  return max
}

function saveDog(dog: DogPayload, exportedAt: string) {
  const payload = { schema: 'coursing-stats/dog-v1', exported_at: exportedAt, ...dog }
  try {
    writeJson(path.join(V1, `dogs/by-id/${dog.id}.json`), payload)
    writeJson(path.join(V1, `dogs/by-key/${dog.dog_key}.json`), payload)
  } catch (e) {
    console.warn(`  warn: could not write dog ${dog.id}: ${(e as Error).message}`)
  }
}

/** Next id among "normal" sport ids (< 100000), ignoring YYYYMMDD-style filenames. */
function allocateSportEventId(): number {
  const root = path.join(V1, 'competitions')
  let max = 0
  const walk = (dir: string) => {
    if (!fs.existsSync(dir)) return
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name)
      if (ent.isDirectory()) walk(full)
      else if (ent.name.endsWith('.json')) {
        const m = ent.name.match(/^(\d+)-/)
        if (!m) continue
        const id = Number(m[1])
        if (Number.isFinite(id) && id < 100_000) max = Math.max(max, id)
      }
    }
  }
  walk(root)
  return max + 1
}

/**
 * Find competition file by date_start + title hint.
 * Without --overwrite: only empty protocols (first-time fill).
 * With --overwrite: prefer archive-full-results* files / matching results_url basename.
 */
async function findExistingByDate(
  dateStart: string,
  hint: string,
  opts?: { overwrite?: boolean; resultsUrl?: string | null },
): Promise<{ id: number; filePath: string; data: any } | null> {
  const comps = path.join(V1, 'competitions')
  const year = dateStart.slice(0, 4)
  const yearDir = path.join(comps, year)
  if (!fs.existsSync(yearDir)) return null

  const hintNorm = norm(hint).replace(/-/g, ' ')
  const urlBase = opts?.resultsUrl ? basenameFromUrl(opts.resultsUrl).toLowerCase() : ''
  const candidates: Array<{ id: number; filePath: string; data: any; score: number }> = []

  for (const month of fs.readdirSync(yearDir)) {
    const monthDir = path.join(yearDir, month)
    if (!fs.statSync(monthDir).isDirectory()) continue
    for (const file of fs.readdirSync(monthDir)) {
      if (!file.endsWith('.json')) continue
      const filePath = path.join(monthDir, file)
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      const ev = data.event
      if (!ev || ev.date_start !== dateStart) continue
      const hasResults = (data.result_count || data.results?.length || 0) > 0
      if (hasResults && !opts?.overwrite) continue

      const title = norm(`${ev.title || ''} ${ev.rank_label || ''}`)
      let score = 0
      if (hintNorm && title && (title.includes(hintNorm.slice(0, 20)) || hintNorm.includes(title.slice(0, 20)))) {
        score += 10
      }
      const src = String(data.source || '')
      if (src.includes('archive-full-results')) score += 5
      if (urlBase && String(ev.results_url || '').toLowerCase().includes(urlBase.replace(/^full_results_/, ''))) {
        score += 8
      }
      if (score < 10) continue
      candidates.push({ id: Number(ev.id), filePath, data, score })
    }
  }
  candidates.sort((a, b) => b.score - a.score)
  return candidates[0] || null
}

function norm(s: string | null | undefined): string {
  return (s || '').replace(/\s+/g, ' ').trim().toLowerCase()
}

async function main() {
  fs.mkdirSync(OUT_HTML, { recursive: true })
  const dogsByKey = DRY_RUN ? new Map<string, DogPayload>() : loadDogsByKey()
  let nextDogId = DRY_RUN ? 900000 : maxDogId(dogsByKey) + 1
  let nextEventId = DRY_RUN ? 900000 : allocateSportEventId()
  const exportedAt = new Date().toISOString()
  const report: any[] = []

  let list = LIMIT ? SOURCES.slice(0, LIMIT) : SOURCES
  if (ONLY) {
    list = list.filter((u) => basenameFromUrl(u).toLowerCase().includes(ONLY.toLowerCase()))
  }
  console.log(
    `Importing ${list.length} Full_Results pages (dryRun=${DRY_RUN} overwrite=${OVERWRITE} only=${ONLY || '*'})`,
  )

  for (const waybackUrl of list) {
    const base = basenameFromUrl(waybackUrl)
    console.log(`\n→ ${base}`)
    const htmlPath = path.join(OUT_HTML, `${base}.html`)
    let html: string | null = null
    if (fs.existsSync(htmlPath) && (OVERWRITE || ONLY)) {
      html = fs.readFileSync(htmlPath, 'utf-8')
      console.log(`  using cached ${htmlPath}`)
    } else {
      html = await fetchHtml(waybackUrl)
      await sleep(400)
    }
    if (!html) {
      report.push({ base, status: 'fetch_failed', waybackUrl })
      continue
    }

    if (!DRY_RUN) fs.writeFileSync(htmlPath, html, 'utf-8')

    const dateGuess =
      extractDateFromHtml(html) || guessDateFromFilename(base) || '1970-01-01'
    const titleGuess = extractTitleFromHtml(html) || base.replace(/_/g, ' ')
    let parserType = guessParserType(base, html)

    // Prefer legacy Full_Results layout (archive era); fall back to modern parsers
    let parsedRows: any[] = []
    let legacyMeta: ReturnType<typeof parseLegacyFullResultsHTML> | null = null
    let parseError: string | null = null
    let parseSource: 'legacy' | 'modern' | 'none' = 'none'

    try {
      legacyMeta = parseLegacyFullResultsHTML(html)
      if (legacyMeta.results.length > 0) {
        parsedRows = legacyMeta.results
        parseSource = 'legacy'
      }
    } catch (e) {
      parseError = (e as Error).message
    }

    if (parsedRows.length === 0) {
      try {
        let modern: any = null
        if (parserType === 'racing') modern = await parseRacingHTML(html)
        else if (parserType === 'bzmp') modern = await parseBzmpHTML(html)
        else modern = await parseCoursingHTML(html)
        parsedRows = modern?.results || []
        if (parsedRows.length > 0) parseSource = 'modern'
      } catch (e) {
        parseError = (e as Error).message
      }
    }

    const resultCount = parsedRows.length
    const okParse = resultCount > 0
    if (!okParse) {
      console.log(`  parse failed or empty (${parserType}): ${parseError || '0 results'}`)
    } else {
      console.log(`  parsed ${resultCount} rows via ${parseSource} (${parserType})`)
    }

    const dateStart =
      legacyMeta?.date_start ||
      extractDateFromHtml(html) ||
      guessDateFromFilename(base) ||
      dateGuess
    const dateEnd = legacyMeta?.date_end || null
    const year = Number(String(dateStart).slice(0, 4))
    const titleFinal = legacyMeta?.title || titleGuess
    const locationFinal = legacyMeta?.location || null
    // Refine type from header/title after legacy parse
    {
      const blob = `${titleFinal} ${base}`.toLowerCase()
      if (blob.includes('bega') || blob.includes('бега')) parserType = 'racing'
      else if (blob.includes('бзмп') || blob.includes('механическ')) parserType = 'bzmp'
      else if (blob.includes('курсинг')) parserType = 'coursing'
    }

    const existing =
      dateStart && dateStart !== '1970-01-01'
        ? await findExistingByDate(dateStart, titleFinal, {
            overwrite: OVERWRITE,
            resultsUrl: waybackUrl,
          })
        : null

    let eventId: number
    let filePath: string
    let prev: any

    if (existing) {
      eventId = existing.id
      filePath = existing.filePath
      prev = existing.data
      console.log(`  match existing event ${eventId}`)
    } else {
      eventId = nextEventId++
      const eventStub = {
        id: eventId,
        year,
        date_start: dateStart,
        rank_label: titleFinal,
        title: titleFinal,
      }
      const rel = competitionRelPath(eventStub as any, eventId)
      filePath = path.join(V1, ...rel.split('/'))
      prev = null
      console.log(`  create new event ${eventId} → ${rel}`)
    }

    const event = {
      ...(prev?.event || {}),
      id: eventId,
      year,
      date_start: dateStart,
      date_end: dateEnd ?? prev?.event?.date_end ?? null,
      rank_label: prev?.event?.rank_label || titleFinal,
      event_type: parserType,
      competition_kind: prev?.event?.competition_kind ?? null,
      competition_type: prev?.event?.competition_type ?? null,
      title: prev?.event?.title || titleFinal,
      host_club: prev?.event?.host_club ?? null,
      region: prev?.event?.region ?? null,
      location: prev?.event?.location || locationFinal,
      catalog_url: prev?.event?.catalog_url ?? null,
      results_url: waybackUrl,
      confirmed: prev?.event?.confirmed ?? 0,
      last_modified: null,
      scraped_at: exportedAt,
      telegram_url: null,
      full_title: prev?.event?.full_title ?? null,
      event_date: dateStart,
      protocol_location: prev?.event?.protocol_location ?? null,
      judges: prev?.event?.judges || null,
      track_schemes: prev?.event?.track_schemes || [],
      admin_verified_at: prev?.event?.admin_verified_at ?? null,
    }

    const competitionRel = path.relative(V1, filePath).split(path.sep).join('/')
    const competitionResults: any[] = []

    if (okParse) {
      for (const row of parsedRows) {
        const nameLat = normalizeDogName(String(row.name_lat ?? row.name ?? ''))
        const nameRu = normalizeDogName(String(row.name_ru ?? row.name_lat ?? ''))
        const breed = normalizeBreed(String(row.breed ?? ''))
        const dk = dogKey(nameLat || nameRu, breed || 'unknown')

        // Prefer dog_id already linked on this competition (stable ids on --overwrite)
        const prevRow =
          prev?.results?.find(
            (r: any) =>
              r.dog_key === dk ||
              (r.dog?.name_lat &&
                normalizeDogName(String(r.dog.name_lat)) === nameLat &&
                normalizeBreed(String(r.dog.breed || '')) === breed),
          ) || null

        let dog = dogsByKey.get(dk)
        let dogDirty = false
        if (!dog && prevRow?.dog_id) {
          dog = {
            id: Number(prevRow.dog_id),
            dog_key: dk,
            name_lat: nameLat || nameRu,
            name_ru: nameRu || null,
            breed: breed || 'UNKNOWN',
            sex: null,
            owner: null,
            competition_ids: [eventId],
            competition_files: [competitionRel],
          }
          dogsByKey.set(dk, dog)
          dogDirty = true
        }
        if (!dog) {
          dog = {
            id: nextDogId++,
            dog_key: dk,
            name_lat: nameLat || nameRu,
            name_ru: nameRu || null,
            breed: breed || 'UNKNOWN',
            sex: null,
            owner: null,
            competition_ids: [],
            competition_files: [],
          }
          dogsByKey.set(dk, dog)
          dogDirty = true
        }

        if (!dog.competition_ids.includes(eventId)) {
          dog.competition_ids.push(eventId)
          dogDirty = true
        }
        if (!dog.competition_files.includes(competitionRel)) {
          dog.competition_files.push(competitionRel)
          dogDirty = true
        }
        if (dogDirty && !DRY_RUN) saveDog(dog, exportedAt)

        competitionResults.push({
          id: competitionResults.length + 1,
          event_id: eventId,
          dog_id: dog?.id ?? null,
          breed_class: row.breed_class ?? null,
          catalog_no: row.catalog_no ?? null,
          placement: row.placement ?? null,
          total_score: row.total_score ?? row.grand_total ?? null,
          judge_count: row.judge_count ?? 2,
          qualification: row.qualification ?? '',
          vc: row.vc ?? '',
          status: row.status ?? null,
          raw_scores_json: row.raw_scores_json ?? row.heats ?? null,
          raw_text: row.raw_text ?? '',
          judges: event.judges,
          status_reason: row.status_reason ?? null,
          dog_key: dk,
          dog: dog
            ? {
                id: dog.id,
                dog_key: dog.dog_key,
                name_lat: dog.name_lat,
                name_ru: dog.name_ru,
                breed: dog.breed,
                sex: null,
                owner: null,
              }
            : {
                id: null,
                dog_key: dk,
                name_lat: nameLat || nameRu,
                name_ru: nameRu || nameLat,
                breed,
                sex: null,
                owner: null,
              },
        })
      }
    }

    const doc = {
      schema: 'coursing-stats/competition-v1',
      exported_at: exportedAt,
      source: okParse ? `archive-full-results-${parseSource}` : 'archive-full-results-stub',
      event_id: eventId,
      event,
      result_count: competitionResults.length,
      results: competitionResults,
    }

    if (!DRY_RUN) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true })
      writeJson(filePath, doc)
    }

    report.push({
      base,
      status: okParse ? 'parsed' : 'stub',
      eventId,
      dateStart,
      resultCount: competitionResults.length,
      parserType,
      parseSource,
      parseError,
      waybackUrl,
      file: path.relative(V1, filePath),
    })
  }

  const reportPath = path.join(OUT_HTML, 'import-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8')
  console.log(`\nReport: ${reportPath}`)
  console.log(
    `parsed=${report.filter((r) => r.status === 'parsed').length} stub=${report.filter((r) => r.status === 'stub').length} fail=${report.filter((r) => r.status === 'fetch_failed').length}`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
