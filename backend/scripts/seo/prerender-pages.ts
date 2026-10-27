/**
 * CLI: after `cd frontend && npm run build`, clone dist/index.html into
 * hub + dog HTML files with real meta and crawlable #root content.
 *
 * Usage: npm run prerender-seo
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  HUB_PAGES,
  SITE_ORIGIN,
  applyMetaToSpaShell,
  breadcrumbJsonLd,
  build404Html,
  buildCompetitionsHubHtml,
  buildDogBodyHtml,
  buildGuideHubHtml,
  buildHubBodyHtml,
  buildNeutralSpaShell,
  buildSimpleEntityBodyHtml,
  breedHubMeta,
  competitionsJsonLd,
  guideJsonLd,
  homepageJsonLd,
  DEFAULT_COMPETITION_FAQS,
  dogMetaFromProfile,
  dogMetaFromShowRanking,
  doninoMeta,
  eventMetaFromEntry,
  type EventWinnerSummary,
  exhibitionMeta,
  showJudgeMeta,
  sportJudgeMeta,
} from './prerender-html.js'
import { CORE_BREED_HUBS } from '../../../frontend/src/lib/breed-hubs-data.js'
import { loadExhibitionIdsForSitemap } from '../build-derived/sitemap.js'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')
const DIST = path.join(ROOT, 'frontend/dist')
const DIST_INDEX = path.join(DIST, 'index.html')
const DIST_PROFILES = path.join(DIST, 'data/v1/indexes/dog-profiles')
const FALLBACK_PROFILES = path.join(ROOT, 'data/v1/indexes/dog-profiles')
const SHOW_RANKING_GLOB_DIR = path.join(ROOT, 'data/v1/shows/indexes')
const SHOW_ONLY_ID_MIN = 1_000_000

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true })
}

/** Path segment safe on Windows + Linux; matches stricter percent-encoding than encodeURIComponent. */
export function staticSeoPathSegment(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (c) => {
    return `%${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`
  })
}

function writeHtml(filePath: string, html: string): void {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, html, 'utf8')
}

function resolveProfilesDir(): string {
  if (fs.existsSync(DIST_PROFILES)) return DIST_PROFILES
  if (fs.existsSync(FALLBACK_PROFILES)) {
    console.warn(
      `[prerender-seo] dist dog-profiles missing; falling back to ${FALLBACK_PROFILES}`,
    )
    return FALLBACK_PROFILES
  }
  console.warn('[prerender-seo] no dog-profiles directory found; skipping competition dogs')
  return ''
}

function listDogProfileEntries(dir: string): Array<{ id: string; profile: Parameters<typeof dogMetaFromProfile>[0] }> {
  if (!dir || !fs.existsSync(dir)) return []
  const out: Array<{ id: string; profile: Parameters<typeof dogMetaFromProfile>[0] }> = []
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8')
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      console.warn(`[prerender-seo] skip invalid JSON: ${file}`)
      continue
    }
    const pack = parsed as { byId?: Record<string, Parameters<typeof dogMetaFromProfile>[0]> }
    if (pack?.byId && typeof pack.byId === 'object') {
      for (const [id, profile] of Object.entries(pack.byId)) {
        out.push({ id, profile })
      }
      continue
    }
    const legacy = parsed as Parameters<typeof dogMetaFromProfile>[0]
    const id = path.basename(file, '.json')
    out.push({ id, profile: legacy })
  }
  return out
}

function prerenderCompetitionDogs(spaHtml: string, profilesDir: string): number {
  const entries = listDogProfileEntries(profilesDir)
  let written = 0
  for (const { id: fileId, profile: rawProfile } of entries) {
    let profile = rawProfile
    const id = String(profile?.dog?.id ?? fileId)
    if (!profile.dog) {
      profile = { dog: { id }, competitions: profile.competitions || [] }
    } else if (profile.dog.id == null) {
      profile.dog.id = id
    }

    const meta = dogMetaFromProfile(profile)
    const html = applyMetaToSpaShell(spaHtml, {
      title: meta.title,
      description: meta.description,
      canonicalUrl: `${SITE_ORIGIN}/dog/${id}/`,
      bodyHtml: buildDogBodyHtml(meta.body),
      jsonLd: meta.jsonLd || breadcrumbJsonLd(meta.breadcrumbs),
    })
    writeHtml(path.join(DIST, 'dog', id, 'index.html'), html)
    written++
  }
  return written
}

function hubOutPath(hubPath: string): string {
  if (hubPath === '/') return DIST_INDEX
  const slug = hubPath.replace(/^\//, '')
  return path.join(DIST, slug, 'index.html')
}

function prerenderHubs(spaHtml: string): number {
  let topPlacementDogs: any[] = []
  const topPlacementPath = path.join(ROOT, 'data/v1/indexes/top-placement-2026.json')
  if (fs.existsSync(topPlacementPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(topPlacementPath, 'utf8'))
      if (Array.isArray(parsed.items)) {
        topPlacementDogs = parsed.items
      }
    } catch {
      // ignore
    }
  }

  for (const hub of HUB_PAGES) {
    const canonicalUrl = hub.path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${hub.path.replace(/\/?$/, '/')}`
    let bodyHtml = buildHubBodyHtml(hub)
    let jsonLd: Record<string, unknown> | undefined

    if (hub.path === '/') {
      jsonLd = homepageJsonLd()
    } else if (hub.path === '/competitions') {
      bodyHtml = buildCompetitionsHubHtml(hub, topPlacementDogs)
      jsonLd = competitionsJsonLd(DEFAULT_COMPETITION_FAQS)
    } else if (hub.path === '/guide') {
      bodyHtml = buildGuideHubHtml(hub)
      jsonLd = guideJsonLd()
    }

    const html = applyMetaToSpaShell(spaHtml, {
      title: hub.title,
      description: hub.description,
      canonicalUrl,
      bodyHtml,
      jsonLd,
    })
    writeHtml(hubOutPath(hub.path), html)
  }
  return HUB_PAGES.length
}

type ShowRankingEntry = {
  id?: string | number
  name_lat?: string | null
  name_ru?: string | null
  breed?: string | null
  total_shows?: number | null
  best_award?: string | null
  competition_dog_id?: number | string | null
}

/**
 * Show-only dogs from ranking JSON. Off by default: full dump is 100k+ HTML files
 * and exceeds Cloudflare Pages file limits. Enable with PRERENDER_SHOW_ONLY=1.
 * Optional PRERENDER_SHOW_ONLY_MAX (default 2000) caps how many extra pages to write.
 */
function loadDetailsAliasMap(): Map<string, string> {
  const aliasMap = new Map<string, string>()
  const detailsDir = path.join(ROOT, 'data/v1/shows/indexes/dog-details')
  if (!fs.existsSync(detailsDir)) return aliasMap
  for (let i = 0; i < 256; i++) {
    const shard = String(i).padStart(3, '0')
    const file = path.join(detailsDir, `${shard}.json`)
    if (!fs.existsSync(file)) continue
    try {
      const pack = JSON.parse(fs.readFileSync(file, 'utf8'))
      for (const [id, dog] of Object.entries(pack)) {
        if ((dog as any).alias_to) {
          aliasMap.set(id, String((dog as any).alias_to))
        }
      }
    } catch {}
  }
  return aliasMap
}

function collectShowOnlyDogs(): Map<string, ShowRankingEntry> {
  const map = new Map<string, ShowRankingEntry>()
  if (process.env.PRERENDER_SHOW_ONLY === '0') return map
  if (!fs.existsSync(SHOW_RANKING_GLOB_DIR)) return map

  const aliasMap = loadDetailsAliasMap()
  function resolveCanonical(id: string): string {
    let curr = String(id)
    let depth = 0
    while (aliasMap.has(curr) && depth < 5) {
      curr = aliasMap.get(curr)!
      depth++
    }
    return curr
  }

  const files = fs
    .readdirSync(SHOW_RANKING_GLOB_DIR)
    .filter((f) => /^dog-ranking-.*\.json$/i.test(f) || /^show-ranking-.*\.json$/i.test(f))
    .sort()

  for (const file of files) {
    const full = path.join(SHOW_RANKING_GLOB_DIR, file)
    let data: unknown
    try {
      data = JSON.parse(fs.readFileSync(full, 'utf8'))
    } catch {
      console.warn(`[prerender-seo] skip invalid show ranking: ${file}`)
      continue
    }
    const items = Array.isArray(data)
      ? data
      : data && typeof data === 'object' && Array.isArray((data as { items?: unknown }).items)
        ? (data as { items: unknown[] }).items
        : []

    for (const raw of items) {
      if (!raw || typeof raw !== 'object') continue
      const entry = raw as ShowRankingEntry
      if (entry.competition_dog_id != null && entry.competition_dog_id !== '') continue
      const idNum = Number(entry.id)
      if (!Number.isFinite(idNum) || idNum < SHOW_ONLY_ID_MIN) continue
      const origId = String(entry.id)
      const id = resolveCanonical(origId)
      const prev = map.get(id)
      if (!prev || (entry.total_shows || 0) > (prev.total_shows || 0)) {
        map.set(id, { ...entry, id })
      }
    }
  }
  return map
}

function prerenderShowOnlyDogs(spaHtml: string): number {
  const dogs = collectShowOnlyDogs()
  if (dogs.size === 0) return 0

  // Clean up any stale alias directories in dist so alias URLs correctly fallback to SPA shell
  const aliasMap = loadDetailsAliasMap()
  for (const aliasId of aliasMap.keys()) {
    const aliasDir = path.join(DIST, 'dog', aliasId)
    if (fs.existsSync(aliasDir)) {
      try {
        fs.rmSync(aliasDir, { recursive: true, force: true })
      } catch {}
    }
  }

  const maxExtra = Math.max(0, Number(process.env.PRERENDER_SHOW_ONLY_MAX || 15000) || 15000)
  // Prefer dogs with more shows
  const ranked = [...dogs.entries()].sort(
    (a, b) => (b[1].total_shows || 0) - (a[1].total_shows || 0),
  )

  let written = 0
  let skippedExisting = 0
  for (const [id, entry] of ranked) {
    if (written >= maxExtra) break
    const outFile = path.join(DIST, 'dog', id, 'index.html')
    if (fs.existsSync(outFile)) {
      skippedExisting++
      continue
    }

    const meta = dogMetaFromShowRanking({ ...entry, id })
    const html = applyMetaToSpaShell(spaHtml, {
      title: meta.title,
      description: meta.description,
      canonicalUrl: `${SITE_ORIGIN}/dog/${id}/`,
      bodyHtml: buildDogBodyHtml(meta.body),
      jsonLd: meta.jsonLd || breadcrumbJsonLd(meta.breadcrumbs),
    })
    writeHtml(outFile, html)
    written++
  }
  if (dogs.size > written + skippedExisting) {
    console.warn(
      `[prerender-seo] show-only capped: candidates=${dogs.size} written=${written} already=${skippedExisting} max=${maxExtra} (set PRERENDER_SHOW_ONLY_MAX to raise)`,
    )
  }
  return written
}

function readJsonFile<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
  } catch {
    return null
  }
}

function prerenderEvents(spaHtml: string): number {
  const index = readJsonFile<
    Record<
      string,
      {
        results_file?: string | null
        has_results?: boolean
        date_start?: string | null
        title?: string | null
      }
    >
  >(path.join(ROOT, 'data/v1/indexes/events-by-id.json'))
  if (!index) return 0

  const calendar = readJsonFile<
    Array<{
      id?: number | string
      title?: string | null
      location?: string | null
      event_type?: string | null
      competition_kind?: string | null
      result_count?: number | null
      date_start?: string | null
    }>
  >(path.join(ROOT, 'data/v1/indexes/calendar-index.json'))
  const calById = new Map<
    string,
    {
      id?: number | string
      title?: string | null
      location?: string | null
      event_type?: string | null
      competition_kind?: string | null
      result_count?: number | null
      date_start?: string | null
    }
  >()
  for (const row of calendar || []) {
    if (row?.id != null) calById.set(String(row.id), row)
  }

  let written = 0
  for (const [id, entry] of Object.entries(index)) {
    if (!entry?.results_file) continue
    const cal = calById.get(id)
    let resultCount = cal?.result_count ?? null
    let location = cal?.location ?? null
    let title = entry.title || cal?.title || null
    let eventType = cal?.event_type ?? null
    let kind = cal?.competition_kind ?? null

    const comp = readJsonFile<{
      event?: {
        title?: string | null
        location?: string | null
        event_type?: string | null
        competition_kind?: string | null
      }
      results?: Array<{
        placement?: number | null
        total_score?: number | null
        speed_kmh?: number | null
        average_speed?: number | null
        vc?: string | null
        qualification?: string | null
        dog?: {
          name_ru?: string | null
          name_lat?: string | null
          breed?: string | null
        } | null
      }>
    }>(path.join(ROOT, 'data/v1', entry.results_file))
    if (comp?.event) {
      title = title || comp.event.title || null
      location = location || comp.event.location || null
      eventType = eventType || comp.event.event_type || null
      kind = kind || comp.event.competition_kind || null
    }
    const winners: EventWinnerSummary[] = []
    if (Array.isArray(comp?.results)) {
      resultCount = comp.results.length
      for (const r of comp.results) {
        if (r.placement === 1 && (r.dog?.name_ru || r.dog?.name_lat)) {
          winners.push({
            dogId: (r as any).dog_id || r.dog?.id || null,
            name: r.dog.name_ru || r.dog.name_lat || '',
            breed: r.dog.breed || null,
            score: r.total_score || null,
            speed_kmh: r.speed_kmh || r.average_speed || null,
            title: [r.vc, r.qualification].filter(Boolean).join(', ') || null,
          })
        }
      }
      if (winners.length < 15) {
        for (const r of comp.results) {
          if (
            (r.placement === 2 || r.placement === 3) &&
            (r.dog?.name_ru || r.dog?.name_lat)
          ) {
            winners.push({
              dogId: (r as any).dog_id || r.dog?.id || null,
              name: r.dog.name_ru || r.dog.name_lat || '',
              breed: r.dog.breed || null,
              score: r.total_score || null,
              speed_kmh: r.speed_kmh || r.average_speed || null,
              title: [r.vc, r.qualification].filter(Boolean).join(', ') || null,
            })
            if (winners.length >= 15) break
          }
        }
      }
    }

    const meta = eventMetaFromEntry({
      id,
      title,
      date_start: entry.date_start || cal?.date_start || null,
      location,
      result_count: resultCount,
      event_type: eventType,
      competition_kind: kind,
      winners,
    })
    const html = applyMetaToSpaShell(spaHtml, {
      title: meta.title,
      description: meta.description,
      canonicalUrl: `${SITE_ORIGIN}/event/${id}/`,
      bodyHtml: buildSimpleEntityBodyHtml(meta),
      jsonLd: meta.jsonLd || breadcrumbJsonLd(meta.breadcrumbs),
    })
    writeHtml(path.join(DIST, 'event', id, 'index.html'), html)
    written++
  }
  return written
}

function prerenderSportJudges(spaHtml: string): number {
  const summary = readJsonFile<{
    judges?: Array<{
      id?: string
      name?: string
      unique_events?: number
      unique_breeds?: number
      unique_dogs?: number
    }>
  }>(path.join(ROOT, 'data/v1/indexes/judges-summary.json'))
  const judges = summary?.judges || []
  let written = 0
  for (const j of judges) {
    const id = j.id || j.name
    if (!id) continue
    const meta = sportJudgeMeta({
      id,
      name: j.name || id,
      unique_events: j.unique_events,
      unique_breeds: j.unique_breeds,
      unique_dogs: j.unique_dogs,
    })
    const html = applyMetaToSpaShell(spaHtml, {
      title: meta.title,
      description: meta.description,
      canonicalUrl: `${SITE_ORIGIN}/judges/${encodeURIComponent(id)}/`,
      bodyHtml: buildSimpleEntityBodyHtml(meta),
      jsonLd: meta.jsonLd || breadcrumbJsonLd(meta.breadcrumbs),
    })
    writeHtml(path.join(DIST, 'judges', staticSeoPathSegment(id), 'index.html'), html)
    written++
  }
  return written
}

function prerenderDoninoDogs(spaHtml: string): number {
  const pairs = new Map<string, { name: string; breed: string }>()
  for (const file of ['donino/speed_records.json', 'donino/coursing_records.json']) {
    const doc = readJsonFile<
      | Array<{ name?: string; breed?: string }>
      | { records?: Array<{ name?: string; breed?: string }> }
    >(path.join(ROOT, 'data/v1', file))
    const rows = Array.isArray(doc) ? doc : doc?.records || []
    for (const row of rows) {
      if (!row?.name || !row?.breed) continue
      const key = `${row.name}\0${row.breed}`
      pairs.set(key, { name: row.name, breed: row.breed })
    }
  }
  let written = 0
  for (const dog of pairs.values()) {
    const meta = doninoMeta(dog)
    const html = applyMetaToSpaShell(spaHtml, {
      title: meta.title,
      description: meta.description,
      canonicalUrl: `${SITE_ORIGIN}/donino-dog/${encodeURIComponent(dog.name)}/${encodeURIComponent(dog.breed)}/`,
      bodyHtml: buildSimpleEntityBodyHtml(meta),
      jsonLd: meta.jsonLd || breadcrumbJsonLd(meta.breadcrumbs),
    })
    writeHtml(
      path.join(
        DIST,
        'donino-dog',
        staticSeoPathSegment(dog.name),
        staticSeoPathSegment(dog.breed),
        'index.html',
      ),
      html,
    )
    written++
  }
  return written
}

function buildCalendarExhibitionLookup(): Map<
  string,
  { title?: string | null; date?: string | null; city?: string | null; club?: string | null }
> {
  const map = new Map<
    string,
    { title?: string | null; date?: string | null; city?: string | null; club?: string | null }
  >()
  const dir = path.join(ROOT, 'data/v1/shows/calendar-rkf')
  if (!fs.existsSync(dir)) return map
  for (const file of fs.readdirSync(dir)) {
    if (!/^\d{4}\.json$/.test(file)) continue
    const doc = readJsonFile<{
      exhibitions?: Array<{
        id?: number | string
        lc_exhibition_id?: number | string | null
        title?: string | null
        date?: string | null
        city?: string | null
        club?: string | null
      }>
    }>(path.join(dir, file))
    for (const e of doc?.exhibitions || []) {
      const info = { title: e.title, date: e.date, city: e.city, club: e.club }
      if (e.id != null) {
        map.set(String(e.id), info)
      }
      if (e.lc_exhibition_id != null) {
        map.set(String(e.lc_exhibition_id), info)
      }
    }
  }
  return map
}

function prerenderExhibitions(spaHtml: string): number {
  // On by default after CDN slim/packs (~15k files est. with full set; under Pages 20k).
  // Disable with PRERENDER_EXHIBITIONS=0; optional PRERENDER_EXHIBITIONS_MAX.
  if (process.env.PRERENDER_EXHIBITIONS === '0') return 0

  const ids = loadExhibitionIdsForSitemap()
  const max =
    process.env.PRERENDER_EXHIBITIONS_MAX != null && process.env.PRERENDER_EXHIBITIONS_MAX !== ''
      ? Math.max(0, Number(process.env.PRERENDER_EXHIBITIONS_MAX) || 0)
      : Number.POSITIVE_INFINITY
  const cal = buildCalendarExhibitionLookup()
  const index = readJsonFile<Record<string, string>>(path.join(ROOT, 'data/v1/shows/index.json')) || {}
  let written = 0
  for (const id of ids) {
    if (written >= max) break
    const calMeta = cal.get(id)
    let dogCount: number | null = null
    let title = calMeta?.title || null
    let date = calMeta?.date || null
    let city = calMeta?.city || null
    let club = calMeta?.club || null

    const type1 = readJsonFile<{ dogs?: unknown[]; dogs_count?: number }>(
      path.join(ROOT, 'data/v1/shows/exhibitions', `${id}-type1.json`),
    )
    if (type1) {
      dogCount = Array.isArray(type1.dogs) ? type1.dogs.length : type1.dogs_count ?? null
      const firstDog = Array.isArray(type1.dogs) ? (type1.dogs[0] as { show_date?: string }) : null
      if (!date && firstDog?.show_date) date = firstDog.show_date
    } else if (index[id]) {
      const fileEx = readJsonFile<{
        title?: string
        date?: string
        city?: string
        club?: string
        dogs?: unknown[]
        results?: unknown[]
      }>(path.join(ROOT, 'data/v1/shows', index[id]))
      if (fileEx) {
        title = title || fileEx.title || null
        date = date || fileEx.date || null
        city = city || fileEx.city || null
        club = club || fileEx.club || null
        dogCount =
          (Array.isArray(fileEx.dogs) && fileEx.dogs.length) ||
          (Array.isArray(fileEx.results) && fileEx.results.length) ||
          null
      }
    }

    const meta = exhibitionMeta({ id, title, date, city, dogCount, club })
    const html = applyMetaToSpaShell(spaHtml, {
      title: meta.title,
      description: meta.description,
      canonicalUrl: `${SITE_ORIGIN}/shows/exhibition/${id}/`,
      bodyHtml: buildSimpleEntityBodyHtml(meta),
      jsonLd: meta.jsonLd || breadcrumbJsonLd(meta.breadcrumbs),
    })
    writeHtml(path.join(DIST, 'shows', 'exhibition', id, 'index.html'), html)
    written++
  }
  if (ids.length > written) {
    console.warn(
      `[prerender-seo] exhibitions capped/skipped: candidates=${ids.length} written=${written} (optional PRERENDER_EXHIBITIONS_MAX; disable with PRERENDER_EXHIBITIONS=0)`,
    )
  }
  return written
}

function prerenderShowJudges(spaHtml: string): number {
  // On by default after CDN slim/packs. Disable with PRERENDER_SHOW_JUDGES=0.
  if (process.env.PRERENDER_SHOW_JUDGES === '0') return 0

  const raw = readJsonFile<
    | Array<{
        id?: string
        name?: string
        display_name?: string
        total_judged?: number
        unique_breeds?: number
      }>
    | {
        judges?: Array<{
          id?: string
          name?: string
          display_name?: string
          total_judged?: number
          unique_breeds?: number
        }>
      }
  >(path.join(ROOT, 'data/v1/shows/indexes/judges.json'))
  const judges = Array.isArray(raw) ? raw : raw?.judges || []
  const max =
    process.env.PRERENDER_SHOW_JUDGES_MAX != null && process.env.PRERENDER_SHOW_JUDGES_MAX !== ''
      ? Math.max(0, Number(process.env.PRERENDER_SHOW_JUDGES_MAX) || 0)
      : Number.POSITIVE_INFINITY

  const ranked = [...judges].sort((a, b) => (b.total_judged || 0) - (a.total_judged || 0))
  let written = 0
  for (const j of ranked) {
    if (written >= max) break
    const id = j.id
    if (!id) continue
    const meta = showJudgeMeta({
      id,
      name: j.name,
      display_name: j.display_name,
      total_judged: j.total_judged,
      unique_breeds: j.unique_breeds,
      excellent_rate: j.excellent_rate,
    })
    const html = applyMetaToSpaShell(spaHtml, {
      title: meta.title,
      description: meta.description,
      canonicalUrl: `${SITE_ORIGIN}/shows/judges/${encodeURIComponent(id)}/`,
      bodyHtml: buildSimpleEntityBodyHtml(meta),
      jsonLd: meta.jsonLd || breadcrumbJsonLd(meta.breadcrumbs),
    })
    writeHtml(path.join(DIST, 'shows', 'judges', staticSeoPathSegment(id), 'index.html'), html)
    written++
  }
  if (judges.length > written) {
    console.warn(
      `[prerender-seo] show judges capped/skipped: candidates=${judges.length} written=${written} (optional PRERENDER_SHOW_JUDGES_MAX; disable with PRERENDER_SHOW_JUDGES=0)`,
    )
  }
  return written
}

function prerenderBreedHubs(spaHtml: string): number {
  const topPlacementPath = path.join(ROOT, 'data/v1/indexes/top-placement-2026.json')
  let topDogs: Array<{
    dog_id: number
    name_ru?: string | null
    name_lat?: string | null
    breed: string
    gold: number
    silver: number
    bronze: number
    total_starts: number
  }> = []
  if (fs.existsSync(topPlacementPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(topPlacementPath, 'utf8'))
      if (Array.isArray(parsed.items)) topDogs = parsed.items
    } catch {}
  }

  const speedDoc = readJsonFile<
    Array<{ name?: string; breed?: string; speed_km_h?: number; date?: string }>
  >(path.join(ROOT, 'data/v1/donino/speed_records.json'))
  const speedRows = Array.isArray(speedDoc) ? speedDoc : (speedDoc as any)?.records || []

  let written = 0
  for (const b of CORE_BREED_HUBS) {
    const breedUpper = b.canonicalKey.toUpperCase()
    const breedTop = topDogs
      .filter(
        (d) =>
          (d.breed || '').toUpperCase().includes(breedUpper) ||
          (d.breed || '').toUpperCase() === breedUpper,
      )
      .slice(0, 5)
      .map((d) => ({
        id: d.dog_id,
        name: d.name_ru || d.name_lat || 'Собака',
        starts: d.total_starts || 0,
        gold: d.gold || 0,
        silver: d.silver || 0,
        bronze: d.bronze || 0,
      }))

    const breedSpeeds = speedRows
      .filter(
        (r) =>
          (r.breed || '').toUpperCase().includes(breedUpper) ||
          breedUpper.includes((r.breed || '').toUpperCase()),
      )
      .slice(0, 3)
      .map((r) => ({
        name: r.name || '',
        speed_kmh: r.speed_km_h || 0,
        date: r.date,
      }))

    const meta = breedHubMeta({
      ...b,
      topDogs: breedTop,
      speedRecords: breedSpeeds,
    })

    const canonicalUrl = `${SITE_ORIGIN}/breeds/${b.slug}/`
    const html = applyMetaToSpaShell(spaHtml, {
      title: meta.title,
      description: meta.description,
      canonicalUrl,
      bodyHtml: buildSimpleEntityBodyHtml(meta),
      jsonLd: meta.jsonLd || breadcrumbJsonLd(meta.breadcrumbs),
    })

    writeHtml(path.join(DIST, 'breeds', b.slug, 'index.html'), html)
    writeHtml(path.join(DIST, 'breed', b.slug, 'index.html'), html)
    written++
  }
  return written
}

function main(): void {
  const started = Date.now()

  if (!fs.existsSync(DIST_INDEX)) {
    console.error(
      `[prerender-seo] Missing ${DIST_INDEX}. Run \`cd frontend && npm run build\` first.`,
    )
    process.exit(1)
  }

  const spaHtml = fs.readFileSync(DIST_INDEX, 'utf8')
  if (!spaHtml.includes('id="root"') && !spaHtml.includes("id='root'")) {
    console.error('[prerender-seo] frontend/dist/index.html has no #root — unexpected shell')
    process.exit(1)
  }

  // Neutral shell kept for optional tooling; do NOT add root 404.html (disables SPA mode)
  // and do NOT use `/* /….html 200` (CF pretty-URLs rewrite → visible 308 to /name).
  const shellForPages = buildNeutralSpaShell(spaHtml)
  writeHtml(path.join(DIST, 'spa-shell', 'index.html'), shellForPages)

  // Standalone 404 for Yandex Object Storage (error_document: 404.html)
  const html404 = build404Html(spaHtml)
  writeHtml(path.join(DIST, '404.html'), html404)
  const public404 = path.join(ROOT, 'frontend/public/404.html')
  fs.writeFileSync(public404, html404, 'utf8')
  console.log(`[prerender-seo] Generated 404.html (${Buffer.byteLength(html404, 'utf8')} bytes)`)

  const hubs = prerenderHubs(shellForPages)
  const breedHubs = prerenderBreedHubs(shellForPages)
  const profilesDir = resolveProfilesDir()
  const competitionDogs = prerenderCompetitionDogs(shellForPages, profilesDir)
  const showOnlyDogs = prerenderShowOnlyDogs(shellForPages)
  const dogs = competitionDogs + showOnlyDogs
  const events = prerenderEvents(shellForPages)
  const judges = prerenderSportJudges(shellForPages)
  const donino = prerenderDoninoDogs(shellForPages)
  const exhibitions = prerenderExhibitions(shellForPages)
  const showJudges = prerenderShowJudges(shellForPages)

  // Ensure all sitemap*.xml and robots.txt are copied to dist for deployment
  const publicDir = path.join(ROOT, 'frontend/public')
  for (const file of fs.readdirSync(publicDir)) {
    if (file.startsWith('sitemap') && file.endsWith('.xml')) {
      const src = path.join(publicDir, file)
      const dst = path.join(DIST, file)
      fs.copyFileSync(src, dst)
      console.log(`[prerender-seo] Copied ${file} to dist (${fs.statSync(dst).size} bytes)`)
    }
  }

  const robotsSrc = path.join(ROOT, 'frontend/public/robots.txt')
  const robotsDst = path.join(DIST, 'robots.txt')
  if (fs.existsSync(robotsSrc)) {
    fs.copyFileSync(robotsSrc, robotsDst)
    console.log(`[prerender-seo] Copied robots.txt to dist (${fs.statSync(robotsDst).size} bytes)`)
  }

  const elapsed = Date.now() - started

  console.log(
    `[prerender-seo] hubs=${hubs} breedHubs=${breedHubs} dogs=${dogs} (competition=${competitionDogs}, show-only=${showOnlyDogs}) events=${events} judges=${judges} donino=${donino} exhibitions=${exhibitions} showJudges=${showJudges} elapsed=${elapsed}ms`,
  )
}

main()
