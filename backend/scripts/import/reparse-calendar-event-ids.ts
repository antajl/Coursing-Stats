/**
 * Reparse competitions pointed by calendar /event/:id routes.
 *
 * Usage:
 *   npx tsx backend/scripts/import/reparse-calendar-event-ids.ts 20230415 20230904
 *   npx tsx backend/scripts/import/reparse-calendar-event-ids.ts --dry-run 20230415
 *
 * - Full_Results_* (Wayback) → legacy coursing / legacy-racing adapters
 * - Complete_Results_* → modern coursing / bzmp / racing parsers
 * Preserves dog_ids via dogs/by-key + previous competition rows.
 */
import fs from 'node:fs'
import path from 'node:path'
import iconv from 'iconv-lite'
import { parseCoursingHTML } from '../../parsers/coursing/index'
import { parseBzmpHTML } from '../../parsers/bzmp/index'
import { parseRacingHTML } from '../../parsers/racing/index'
import { parseLegacyFullResultsHTML } from '../../parsers/legacy-full-results/index'
import {
  detectLegacyFullResultsKind,
  parseLegacyFullResultsRacingHTML,
} from '../../parsers/legacy-full-results/racing'
import { normalizeBreed, normalizeDogName } from '../../parsers/coursing/utils'
import { fetchWin1251 } from '../../lib/fetch-win1251'
import { fetchArchiveWin1251, sleep } from '../../lib/fetch-archive-win1251'
import { ROOT, dogKey, writeJson } from '../export/d1-export-utils'

const V1 = path.join(ROOT, 'data/v1')
const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const PREFER_ARCHIVE = args.includes('--archive')
const IDS = args.filter((a) => a !== '--dry-run' && a !== '--archive' && /^\d+$/.test(a))

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CoursingStatsBot/0.1'

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

function toRawArchiveUrl(waybackUrl: string): string {
  return waybackUrl.replace(/\/web\/(\d{14})\//, '/web/$1id_/')
}

async function fetchHtml(url: string, opts?: { preferArchive?: boolean }): Promise<string | null> {
  if (/web\.archive\.org/i.test(url)) {
    const raw = toRawArchiveUrl(url)
    const res = await fetch(raw, { headers: { 'User-Agent': UA } })
    if (!res.ok) return null
    return iconv.decode(Buffer.from(await res.arrayBuffer()), 'win1251')
  }

  if (opts?.preferArchive) {
    const archived = await fetchArchiveWin1251(url)
    if (archived) return archived
  }

  try {
    const html = await fetchWin1251(url)
    if (html && html.includes('<') && html.length > 200) return html
  } catch {
    /* fall through */
  }
  return fetchArchiveWin1251(url)
}

function resolveParserType(
  eventType: string | null | undefined,
  resultsUrl: string,
  title: string,
): 'coursing' | 'bzmp' | 'racing' {
  const base = resultsUrl.split('/').pop() || ''
  if (/Full_Results/i.test(base)) {
    // refined after detectLegacyFullResultsKind
    if (/bega|racing|бега/i.test(`${base} ${title}`)) return 'racing'
    return 'coursing'
  }
  // Complete_Results_2023-09-02_V_R.html → R; _B.html → B; _C / _V_C → C
  const m = base.match(/Complete_Results_[^/]+?_([CBRK])(?:\.html)?$/i) || base.match(/_([CBR])\.html$/i)
  const suf = m?.[1]?.toUpperCase()
  if (suf === 'R') return 'racing'
  if (suf === 'B') return 'bzmp'
  if (suf === 'C' || suf === 'K') return 'coursing'

  const et = (eventType || '').toLowerCase()
  if (et === 'racing' || et === 'bzmp' || et === 'coursing') return et
  const blob = `${title} ${base}`.toLowerCase()
  if (blob.includes('бзмп')) return 'bzmp'
  if (blob.includes('рейсинг') || blob.includes('бега') || blob.includes('racing')) return 'racing'
  return 'coursing'
}

/** Find competitions/{year}/{month}/{id}-*.json when calendar id collides / has no results_file. */
function findCompetitionRelById(id: string): string | null {
  const comps = path.join(V1, 'competitions')
  if (!fs.existsSync(comps)) return null
  const walk = (dir: string): string | null => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name)
      if (ent.isDirectory()) {
        const hit = walk(full)
        if (hit) return hit
      } else if (ent.name.startsWith(`${id}-`) && ent.name.endsWith('.json')) {
        return path.relative(V1, full).split(path.sep).join('/')
      }
    }
    return null
  }
  return walk(comps)
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

function maxResultIdAcrossCompetitions(): number {
  let max = 0
  const walk = (dir: string) => {
    if (!fs.existsSync(dir)) return
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name)
      if (ent.isDirectory()) walk(full)
      else if (ent.name.endsWith('.json')) {
        const data = JSON.parse(fs.readFileSync(full, 'utf-8'))
        for (const r of data.results || []) {
          if (r.id) max = Math.max(max, Number(r.id))
        }
      }
    }
  }
  walk(path.join(V1, 'competitions'))
  return max
}

function writeJsonRetry(filePath: string, data: unknown, attempts = 8) {
  let last: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      writeJson(filePath, data)
      return
    } catch (e) {
      last = e
      const code = (e as NodeJS.ErrnoException)?.code
      if (code !== 'UNKNOWN' && code !== 'EPERM' && code !== 'EBUSY') throw e
      // Windows AV / indexer locks — brief backoff
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 80 * (i + 1))
    }
  }
  throw last
}

function saveDog(dog: DogPayload, exportedAt: string) {
  const payload = { schema: 'coursing-stats/dog-v1', exported_at: exportedAt, ...dog }
  writeJsonRetry(path.join(V1, `dogs/by-id/${dog.id}.json`), payload)
  writeJsonRetry(path.join(V1, `dogs/by-key/${dog.dog_key}.json`), payload)
}

async function main() {
  if (!IDS.length) {
    console.error('Usage: npx tsx backend/scripts/import/reparse-calendar-event-ids.ts [--dry-run] <id>...')
    process.exit(1)
  }

  const ebi = JSON.parse(fs.readFileSync(path.join(V1, 'indexes/events-by-id.json'), 'utf-8')) as Record<
    string,
    { results_file?: string | null; title?: string | null }
  >
  const dogsByKey = DRY_RUN ? new Map<string, DogPayload>() : loadDogsByKey()
  let nextDogId = DRY_RUN ? 900000 : maxDogId(dogsByKey) + 1
  let nextResultId = DRY_RUN ? 9_000_000 : maxResultIdAcrossCompetitions() + 1
  const exportedAt = new Date().toISOString()

  console.log(`Reparse ${IDS.length} events (dryRun=${DRY_RUN}) nextDogId=${nextDogId} nextResultId=${nextResultId}`)

  for (const id of IDS) {
    const meta = ebi[id]
    console.log(`\n→ /event/${id}`)

    // Calendar fallback when competition JSON was deleted / never written
    const yearHint = String(meta?.date_start || id).slice(0, 4)
    const calPath = path.join(V1, `calendar/${yearHint}.json`)
    const calEv =
      fs.existsSync(calPath)
        ? (JSON.parse(fs.readFileSync(calPath, 'utf-8')).events || []).find(
            (e: any) => String(e.id) === id,
          )
        : null

    const resultsRel =
      meta?.results_file ||
      (calEv?.results_file
        ? String(calEv.results_file).startsWith('competitions/')
          ? String(calEv.results_file)
          : `competitions/${yearHint}/${calEv.month || ''}/${calEv.results_file}`.replace(
              /\/+/g,
              '/',
            )
        : null) ||
      findCompetitionRelById(id)

    if (!resultsRel) {
      console.log('  skip: no results_file in events-by-id/calendar/competitions')
      continue
    }

    const filePath = path.join(V1, resultsRel)
    let prev: any
    if (fs.existsSync(filePath)) {
      prev = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    } else if (calEv) {
      console.log(`  recreate missing ${resultsRel}`)
      prev = {
        schema: 'coursing-stats/competition-v1',
        event_id: Number(id),
        event: {
          id: Number(id),
          year: Number(yearHint),
          date_start: calEv.date_start,
          date_end: calEv.date_end ?? null,
          title: calEv.title,
          rank_label: calEv.rank_label || calEv.title,
          event_type: calEv.event_type || 'coursing',
          results_url: calEv.results_url,
          location: calEv.location ?? null,
          judges: calEv.judges ?? null,
        },
        results: [],
        result_count: 0,
      }
    } else {
      console.log(`  skip: missing ${resultsRel} and no calendar row`)
      continue
    }

    const url = String(prev.event?.results_url || calEv?.results_url || '')
    if (!url) {
      console.log('  skip: no results_url')
      continue
    }

    let parserType = resolveParserType(
      prev.event?.event_type || calEv?.event_type,
      url,
      `${prev.event?.title || ''} ${meta?.title || calEv?.title || ''}`,
    )
    console.log(`  ${parserType} ${url}`)

    const prevCount = prev.results?.length || 0
    let html = await fetchHtml(url, { preferArchive: PREFER_ARCHIVE })
    await sleep(350)
    if (!html) {
      console.log('  fetch failed')
      continue
    }

    async function parseHtml(h: string): Promise<{ rows: any[]; source: string; judges: string | null; type: typeof parserType }> {
      let type = parserType
      let judgesLocal: string | null = prev.event?.judges ?? null
      if (/Full_Results/i.test(url)) {
        const kind = detectLegacyFullResultsKind(h)
        if (kind === 'racing-time') {
          const L = parseLegacyFullResultsRacingHTML(h)
          return { rows: L.results, source: 'legacy-racing', judges: judgesLocal, type: 'racing' }
        }
        const L = parseLegacyFullResultsHTML(h)
        if (type === 'racing' && kind === 'coursing-points') type = 'coursing'
        return { rows: L.results, source: 'legacy', judges: judgesLocal, type }
      }
      let modern: any
      if (type === 'racing') modern = await parseRacingHTML(h)
      else if (type === 'bzmp') modern = await parseBzmpHTML(h)
      else modern = await parseCoursingHTML(h)
      return {
        rows: modern?.results || [],
        source: 'modern',
        judges: modern?.judges ?? judgesLocal,
        type,
      }
    }

    let parsedRows: any[] = []
    let parseSource = 'none'
    let judges: string | null = prev.event?.judges ?? null

    try {
      let parsed = await parseHtml(html)
      // Live procoursing page sometimes thinner than archive snapshot
      if (
        !/web\.archive\.org/i.test(url) &&
        prevCount > 0 &&
        parsed.rows.length > 0 &&
        parsed.rows.length < Math.max(3, Math.floor(prevCount * 0.5))
      ) {
        console.log(`  thin live parse ${parsed.rows.length} < prev ${prevCount} — try archive`)
        const archived = await fetchHtml(url, { preferArchive: true })
        await sleep(350)
        if (archived && archived !== html) {
          const alt = await parseHtml(archived)
          if (alt.rows.length > parsed.rows.length) {
            parsed = alt
            html = archived
          }
        }
      }
      parsedRows = parsed.rows
      parseSource = parsed.source
      judges = parsed.judges
      parserType = parsed.type
    } catch (e) {
      console.log(`  parse error: ${(e as Error).message}`)
      continue
    }

    console.log(`  parsed ${parsedRows.length} via ${parseSource}`)
    if (!parsedRows.length) continue

    const eventId = Number(prev.event_id || prev.event?.id || id)
    const competitionRel = resultsRel.replace(/\\/g, '/')
    const competitionResults: any[] = []

    for (const row of parsedRows) {
      const nameLat = normalizeDogName(String(row.name_lat ?? row.name ?? ''))
      const nameRu = normalizeDogName(String(row.name_ru ?? row.name_lat ?? row.name ?? ''))
      const breed = normalizeBreed(String(row.breed ?? ''))
      const dk = dogKey(nameLat || nameRu, breed || 'unknown')

      const prevRow =
        prev.results?.find(
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

      let rawScores = row.raw_scores_json ?? row.heats ?? null
      if (typeof rawScores === 'string') {
        try {
          rawScores = JSON.parse(rawScores)
        } catch {
          /* keep */
        }
      }

      competitionResults.push({
        id: nextResultId++,
        event_id: eventId,
        dog_id: dog.id,
        breed_class: row.breed_class ?? null,
        catalog_no: row.catalog_no ?? null,
        placement: row.placement ?? null,
        total_score: row.total_score ?? row.grand_total ?? null,
        judge_count: row.judge_count ?? (parserType === 'racing' ? 0 : 2),
        qualification: row.qualification ?? '',
        vc: row.vc ?? '',
        status: row.status ?? 'finished',
        raw_scores_json: rawScores,
        raw_text: String(row.raw_text ?? '').replace(/\n/g, ' '),
        judges: judges,
        status_reason: row.status_reason ?? null,
        dog_key: dk,
        dog: {
          id: dog.id,
          dog_key: dk,
          name_lat: dog.name_lat,
          name_ru: dog.name_ru,
          breed: dog.breed,
          sex: null,
          owner: null,
        },
      })
    }

    const missingDog = competitionResults.filter((r) => !r.dog_id).length
    const withHeats = competitionResults.filter((r) => {
      const h = r.raw_scores_json?.heats
      return Array.isArray(h) && h.length > 0
    }).length
    console.log(`  write: n=${competitionResults.length} dog_id_ok=${competitionResults.length - missingDog} with_heats=${withHeats}`)

    if (!DRY_RUN) {
      const doc = {
        ...prev,
        schema: 'coursing-stats/competition-v1',
        exported_at: exportedAt,
        source: `reparse-${parseSource}`,
        event_id: eventId,
        event: {
          ...prev.event,
          event_type: parserType,
          judges,
          results_url: url,
          scraped_at: exportedAt,
        },
        result_count: competitionResults.length,
        results: competitionResults,
      }
      writeJsonRetry(filePath, doc)
      console.log(`  wrote ${competitionRel}`)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
