/**
 * Публичный слой чтения статических JSON с CDN (`/data/v1`) — без Worker/D1.
 *
 * В dev эти же пути отдаёт Vite (см. vite.config.ts, serveDataV1 plugin) прямо
 * из `../data/v1` на диске. В prod — Cloudflare Pages (копия дерева data/v1
 * в frontend/public/data/v1 во время build-all-data / package-pages-snapshot).
 *
 * Порт логики backend/lib/local-data/static-data.ts + backend/src/lib/static-api.ts
 * на клиент: те же precomputed indexes, та же сортировка/пагинация/фильтры.
 */
import { canonicalBreed, matchesBreedFilter } from './breedMapping'
import {
  aggregateAllScores,
  aggregateBreedStats,
  aggregateCriteriaStats,
  aggregateJudgeStats,
  formatBreedData,
  formatCriteriaData,
  formatJudgesData,
  filterJudgeRawRows,
  type JudgeRawRow,
} from './judgeStats'
import { dedupeCalendarEvents } from '../../../backend/lib/event-identity'
import { sortPlacementItems, sortScoreItems } from '../../../backend/lib/data-logic/sort-top'

export const DATA_BASE = '/data/v1'

export type ApiResult<T> =
  | { success: true; data: T; source?: string }
  | { success: false; error: string; data?: undefined }

const jsonCache = new Map<string, Promise<unknown>>()

/** Загружает JSON с /data/v1 (кэшируется по пути в рамках сессии страницы). */
export function fetchJson<T>(relativePath: string): Promise<T | null> {
  if (!jsonCache.has(relativePath)) {
    const promise = fetch(`${DATA_BASE}/${relativePath}`)
      .then((res) => (res.ok ? (res.json() as Promise<T>) : null))
      .catch(() => null)
    jsonCache.set(relativePath, promise)
  }
  return jsonCache.get(relativePath) as Promise<T | null>
}

// ── Сортировка / пагинация (shared backend/lib/data-logic/sort-top.ts) ────

export { sortPlacementItems, sortScoreItems } from '../../../backend/lib/data-logic/sort-top'

export function paginateItems<T>(
  items: T[],
  limit: number | null,
  offset: number,
): { items: T[]; total: number } | T[] {
  if (limit === null) return items
  const total = items.length
  return { items: items.slice(offset, offset + limit), total }
}

function sortSpeedItems(items: Record<string, unknown>[], sortBy: string): Record<string, unknown>[] {
  const copy = [...items]
  if (sortBy === 'avg_speed') {
    copy.sort((a, b) => Number(b.avg_speed ?? 0) - Number(a.avg_speed ?? 0) || Number(b.best_speed ?? 0) - Number(a.best_speed ?? 0))
  } else {
    copy.sort((a, b) => Number(b.best_speed ?? 0) - Number(a.best_speed ?? 0))
  }
  return copy
}

function wrapPaginated(
  sorted: Record<string, unknown>[],
  pagination: { limit: number; offset: number } | null,
): ApiResult<unknown> {
  if (!pagination) return { success: true, data: sorted }
  const page = paginateItems(sorted, pagination.limit, pagination.offset)
  if (Array.isArray(page)) return { success: true, data: page }
  return {
    success: true,
    data: { items: page.items, total: page.total, limit: pagination.limit, offset: pagination.offset },
  }
}

function toPagination(limit: number | null, offset: number): { limit: number; offset: number } | null {
  if (limit === null) return null
  return { limit, offset }
}

/** Порт backend/src/lib/static-api.ts judgeDetailKey — та же кодировка на клиенте. */
export function judgeDetailKey(name: string): string {
  const bytes = new TextEncoder().encode(name)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// ── manifest / breeds / years ───────────────────────────────────────────────

interface ManifestFile {
  counts?: Record<string, number>
}

interface JudgesSummaryFile {
  count?: number
}

export async function getStats(): Promise<ApiResult<Record<string, unknown>>> {
  const [manifest, judgesSummary] = await Promise.all([
    fetchJson<ManifestFile>('manifest.json'),
    fetchJson<JudgesSummaryFile>('indexes/judges-summary.json'),
  ])
  if (!manifest?.counts) return { success: false, error: 'manifest.json unavailable' }
  const doninoSpeed = manifest.counts.donino_speed ?? 0
  const doninoCoursing = manifest.counts.donino_coursing ?? 0
  return {
    success: true,
    data: {
      ...manifest.counts,
      breeds: manifest.counts.breeds ?? 0,
      judges: judgesSummary?.count ?? 0,
      donino_records: doninoSpeed + doninoCoursing,
      speed_records: doninoSpeed,
      coursing_records: doninoCoursing,
      data_source: 'data/v1/manifest.json',
    },
  }
}

interface BreedsFile {
  breeds?: string[]
}

export async function getBreeds(): Promise<ApiResult<{ breed: string }[]>> {
  const file = await fetchJson<BreedsFile>('breeds.json')
  if (!file?.breeds) return { success: false, error: 'breeds.json unavailable' }
  const unique = [...new Set(file.breeds.map((b) => canonicalBreed(b)))].sort()
  return { success: true, data: unique.map((breed) => ({ breed })) }
}

interface YearsFile {
  years?: number[]
}

export async function getYears(): Promise<ApiResult<{ year: number }[]>> {
  const file = await fetchJson<YearsFile>('indexes/years.json')
  if (!file?.years) return { success: false, error: 'years index unavailable' }
  return { success: true, data: file.years.map((year) => ({ year })) }
}

// ── Календарь / события ─────────────────────────────────────────────────────

interface CalendarFile {
  events?: Record<string, unknown>[]
}

function sortByDateDesc(events: Record<string, unknown>[]): Record<string, unknown>[] {
  return [...events].sort((a, b) => String(b.date_start ?? '').localeCompare(String(a.date_start ?? '')))
}

export async function getEvents(year = ''): Promise<ApiResult<Record<string, unknown>[]>> {
  if (year) {
    const file = await fetchJson<CalendarFile>(`calendar/${year}.json`)
    if (!file?.events) return { success: true, data: [] }
    const events = dedupeCalendarEvents(file.events as Array<Record<string, unknown> & { id: number }>)
    return { success: true, data: sortByDateDesc(events) }
  }
  const all = await fetchJson<Record<string, unknown>[]>('indexes/calendar-index.json')
  if (!all) return { success: false, error: 'calendar index unavailable' }
  const events = dedupeCalendarEvents(all as Array<Record<string, unknown> & { id: number }>)
  return { success: true, data: sortByDateDesc(events) }
}

interface EventsByIdEntry {
  results_file?: string | null
  date_start?: string
  title?: string
  has_results?: boolean
}

interface CompetitionFile {
  event?: Record<string, unknown>
  results?: Array<Record<string, unknown> & { dog?: Record<string, unknown> }>
}

/** JSON.stringify обратно, если export-local-data распарсил поле в объект (track_schemes/judges/raw_scores_json). */
function restringify(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch {
    return null
  }
}

async function loadCompetition(eventId: string): Promise<{ event: Record<string, unknown>; results: Record<string, unknown>[] } | null> {
  const index = await fetchJson<Record<string, EventsByIdEntry>>('indexes/events-by-id.json')
  const entry = index?.[eventId]
  if (!entry?.results_file) return null

  const comp = await fetchJson<CompetitionFile>(entry.results_file)
  if (!comp?.event) return null

  const event = {
    ...comp.event,
    judges: restringify(comp.event.judges),
    track_schemes: restringify(comp.event.track_schemes),
  }

  const results = (comp.results ?? []).map((r) => ({
    ...r,
    name_lat: r.dog?.name_lat ?? r.name_lat,
    name_ru: r.dog?.name_ru ?? r.name_ru,
    breed: r.dog?.breed ?? r.breed,
    raw_scores_json: restringify(r.raw_scores_json),
  }))

  return { event, results }
}

async function findCalendarEntry(eventId: string): Promise<Record<string, unknown> | null> {
  const all = await fetchJson<Record<string, unknown>[]>('indexes/calendar-index.json')
  if (!all) return null
  const numericId = Number(eventId)
  return all.find((e) => Number(e.id) === numericId) ?? null
}

export async function getEvent(eventId: string): Promise<ApiResult<Record<string, unknown>>> {
  const comp = await loadCompetition(eventId)
  if (comp) return { success: true, data: comp.event }

  const entry = await findCalendarEntry(eventId)
  if (!entry) return { success: false, error: 'Event not found' }

  return {
    success: true,
    data: {
      id: entry.id,
      year: entry.year,
      date_start: entry.date_start,
      date_end: entry.date_end,
      rank_label: entry.rank_label,
      event_type: entry.event_type,
      competition_kind: entry.competition_kind,
      competition_type: entry.competition_type,
      title: entry.title,
      full_title: entry.full_title ?? null,
      host_club: entry.host_club ?? null,
      region: entry.region ?? null,
      location: entry.location,
      catalog_url: entry.catalog_url,
      results_url: entry.results_url,
      confirmed: entry.confirmed,
      judges: entry.judges ?? null,
      track_schemes: null,
      event_date: null,
      protocol_location: null,
      telegram_url: null,
    },
  }
}

export async function getEventResults(eventId: string): Promise<ApiResult<Record<string, unknown>[]>> {
  const comp = await loadCompetition(eventId)
  return { success: true, data: comp?.results ?? [] }
}

// ── Топы (места / очки / скорость) ──────────────────────────────────────────

interface IndexListPayload {
  items?: Record<string, unknown>[]
}

async function loadTopIndex(prefix: string, year: string): Promise<Record<string, unknown>[]> {
  const key = year || 'all'
  const index = await fetchJson<IndexListPayload>(`indexes/${prefix}-${key}.json`)
  return index?.items ?? []
}

function applyCommonFilters(
  items: Record<string, unknown>[],
  breed: string,
  minStarts: number,
): Record<string, unknown>[] {
  let rows = items
  if (breed) rows = rows.filter((it) => matchesBreedFilter(String(it.breed ?? ''), breed))
  if (minStarts > 0) rows = rows.filter((it) => Number(it.total_starts ?? 0) >= minStarts)
  return rows
}

export async function getTopPlacement(
  year = '',
  breed = '',
  minStarts = 0,
  sortBy = 'gold',
  limit: number | null = null,
  offset = 0,
): Promise<ApiResult<unknown>> {
  const items = applyCommonFilters(await loadTopIndex('top-placement', year), breed, minStarts)
  const sorted = sortPlacementItems(items, sortBy)
  return wrapPaginated(sorted, toPagination(limit, offset)) as ApiResult<unknown>
}

export async function getTopScore(
  year = '',
  breed = '',
  minStarts = 0,
  sortBy = 'rating_score',
  limit: number | null = null,
  offset = 0,
): Promise<ApiResult<unknown>> {
  const items = applyCommonFilters(await loadTopIndex('top-score', year), breed, minStarts)
  const sorted = sortScoreItems(items, sortBy)
  return wrapPaginated(sorted, toPagination(limit, offset)) as ApiResult<unknown>
}

export async function getTopSpeed(
  year = '',
  breed = '',
  minStarts = 0,
  sortBy = 'best_speed',
  limit: number | null = null,
  offset = 0,
): Promise<ApiResult<unknown>> {
  const items = applyCommonFilters(await loadTopIndex('top-speed', year), breed, minStarts)
  const sorted = sortSpeedItems(items, sortBy)
  return wrapPaginated(sorted, toPagination(limit, offset)) as ApiResult<unknown>
}

// ── Донино (замер скорости / бега 350 м) ────────────────────────────────────

interface DoninoFile {
  records?: Record<string, unknown>[]
}

function filterDoninoRecords(
  records: Record<string, unknown>[],
  opts: {
    breed?: string
    sex?: string
    search?: string
    year?: string
    dogId?: string
    limit: number
    sortKey: string
    sortAsc?: boolean
  },
): Record<string, unknown>[] {
  let rows = records

  if (opts.dogId) rows = rows.filter((r) => String(r.dog_id ?? '') === opts.dogId)
  if (opts.breed) rows = rows.filter((r) => r.breed === opts.breed)
  if (opts.sex) rows = rows.filter((r) => r.sex === opts.sex)
  if (opts.year) rows = rows.filter((r) => String(r.date ?? '').includes(`.${opts.year}`))
  if (opts.search) {
    const q = opts.search.toLowerCase()
    rows = rows.filter(
      (r) =>
        String(r.name ?? '').toLowerCase().includes(q) ||
        String(r.breed ?? '').toLowerCase().includes(q) ||
        String(r.date ?? '').toLowerCase().includes(q),
    )
  }

  rows = [...rows].sort((a, b) => {
    const av = Number(a[opts.sortKey] ?? 0)
    const bv = Number(b[opts.sortKey] ?? 0)
    return opts.sortAsc ? av - bv : bv - av
  })

  return rows.slice(0, opts.limit)
}

async function loadDoninoSpeedRecords(): Promise<Record<string, unknown>[]> {
  const file = await fetchJson<DoninoFile>('donino/speed_records.json')
  return file?.records ?? []
}

async function loadDoninoCoursingRecords(): Promise<Record<string, unknown>[]> {
  const file = await fetchJson<DoninoFile>('donino/coursing_records.json')
  return file?.records ?? []
}

export async function getSpeedRecords(
  breed = '',
  sex = '',
  limit = 100,
  search = '',
  year = '',
  dogId = '',
): Promise<ApiResult<Record<string, unknown>[]>> {
  const records = await loadDoninoSpeedRecords()
  const filtered = filterDoninoRecords(records, { breed, sex, search, year, dogId, limit, sortKey: 'speed_km_h' })
  return { success: true, data: filtered }
}

export async function getCoursingRecords(
  breed = '',
  limit = 100,
  search = '',
  year = '',
  dogId = '',
): Promise<ApiResult<Record<string, unknown>[]>> {
  const records = await loadDoninoCoursingRecords()
  const filtered = filterDoninoRecords(records, {
    breed,
    search,
    year,
    dogId,
    limit,
    sortKey: 'time_seconds',
    sortAsc: true,
  })
  return { success: true, data: filtered }
}

function pickTopSpeedByBreed(records: Record<string, unknown>[], limit: number): Record<string, unknown>[] {
  const bestByBreed = new Map<string, Record<string, unknown>>()
  for (const record of records) {
    const speed = Number(record.speed_km_h)
    const breed = String(record.breed ?? '')
    const existing = bestByBreed.get(breed)
    if (!existing || speed > Number(existing.speed_km_h)) bestByBreed.set(breed, record)
  }
  return [...bestByBreed.values()].sort((a, b) => Number(b.speed_km_h) - Number(a.speed_km_h)).slice(0, limit)
}

function pickTopCoursingByBreed(records: Record<string, unknown>[], limit: number): Record<string, unknown>[] {
  const bestByBreed = new Map<string, Record<string, unknown>>()
  for (const record of records) {
    const time = Number(record.time_seconds)
    const breed = String(record.breed ?? '')
    const existing = bestByBreed.get(breed)
    if (!existing || time < Number(existing.time_seconds)) bestByBreed.set(breed, record)
  }
  return [...bestByBreed.values()].sort((a, b) => Number(a.time_seconds) - Number(b.time_seconds)).slice(0, limit)
}

export async function getSpeedRecordsTopByBreed(limit = 3): Promise<ApiResult<Record<string, unknown>[]>> {
  const records = await loadDoninoSpeedRecords()
  return { success: true, data: pickTopSpeedByBreed(records, limit) }
}

export async function getCoursingRecordsTopByBreed(limit = 3): Promise<ApiResult<Record<string, unknown>[]>> {
  const records = await loadDoninoCoursingRecords()
  return { success: true, data: pickTopCoursingByBreed(records, limit) }
}

export async function getDoninoDog(name: string, breed: string): Promise<ApiResult<Record<string, unknown>>> {
  if (!name || !breed) return { success: false, error: 'Name and breed are required' }

  const [allSpeed, allCoursing] = await Promise.all([loadDoninoSpeedRecords(), loadDoninoCoursingRecords()])

  const speedRecords = allSpeed.filter((r) => r.name === name && r.breed === breed)
  const coursingRecords = allCoursing.filter((r) => r.name === name && r.breed === breed)

  const speedStats = {
    total: speedRecords.length,
    bestSpeed: speedRecords.length > 0 ? Math.max(...speedRecords.map((r) => Number(r.speed_km_h))) : 0,
    avgSpeed:
      speedRecords.length > 0
        ? speedRecords.reduce((sum, r) => sum + Number(r.speed_km_h), 0) / speedRecords.length
        : 0,
  }

  const coursingStats = {
    total: coursingRecords.length,
    bestTime: coursingRecords.length > 0 ? Math.min(...coursingRecords.map((r) => Number(r.time_seconds))) : 0,
    avgTime:
      coursingRecords.length > 0
        ? coursingRecords.reduce((sum, r) => sum + Number(r.time_seconds), 0) / coursingRecords.length
        : 0,
  }

  let speedBreedRank = 0
  let speedBreedTotal = 0
  let speedPercentile = 0
  if (speedStats.bestSpeed > 0) {
    const byName = new Map<string, number>()
    for (const r of allSpeed) {
      if (r.breed !== breed || !(Number(r.speed_km_h) > 0)) continue
      const key = String(r.name ?? '')
      const speed = Number(r.speed_km_h)
      if (!byName.has(key) || speed > byName.get(key)!) byName.set(key, speed)
    }
    const sortedSpeeds = [...byName.values()].sort((a, b) => b - a)
    speedBreedTotal = sortedSpeeds.length
    const rank = sortedSpeeds.findIndex((s) => s === speedStats.bestSpeed)
    speedBreedRank = rank >= 0 ? rank + 1 : 0
    speedPercentile = speedBreedTotal > 0 ? ((speedBreedTotal - speedBreedRank) / speedBreedTotal) * 100 : 0
  }

  let coursingBreedRank = 0
  let coursingBreedTotal = 0
  let coursingPercentile = 0
  if (coursingStats.bestTime > 0) {
    const byName = new Map<string, number>()
    for (const r of allCoursing) {
      if (r.breed !== breed || !(Number(r.time_seconds) > 0)) continue
      const key = String(r.name ?? '')
      const time = Number(r.time_seconds)
      if (!byName.has(key) || time < byName.get(key)!) byName.set(key, time)
    }
    const sortedTimes = [...byName.values()].sort((a, b) => a - b)
    coursingBreedTotal = sortedTimes.length
    const rank = sortedTimes.findIndex((t) => t === coursingStats.bestTime)
    coursingBreedRank = rank >= 0 ? rank + 1 : 0
    coursingPercentile = coursingBreedTotal > 0 ? ((coursingBreedTotal - coursingBreedRank) / coursingBreedTotal) * 100 : 0
  }

  const sex = speedRecords.find((r) => r.sex)?.sex ?? null

  return {
    success: true,
    data: {
      name,
      breed,
      sex,
      speedRecords,
      coursingRecords,
      speedStats: { ...speedStats, breedRank: speedBreedRank, breedTotal: speedBreedTotal, percentile: speedPercentile },
      coursingStats: {
        ...coursingStats,
        breedRank: coursingBreedRank,
        breedTotal: coursingBreedTotal,
        percentile: coursingPercentile,
      },
    },
  }
}

// ── Судьи ────────────────────────────────────────────────────────────────────

interface JudgesSummaryFile {
  judges?: Record<string, unknown>[]
  availableBreeds?: string[]
}

async function loadAvailableBreeds(): Promise<string[]> {
  const summary = await fetchJson<JudgesSummaryFile>('indexes/judges-summary.json')
  return summary?.availableBreeds ?? []
}

async function loadJudgesRawRows(): Promise<JudgeRawRow[]> {
  const rows = await fetchJson<JudgeRawRow[]>('indexes/judges-raw-rows.json')
  return rows ?? []
}

export async function getJudges(
  breed = '',
  discipline = '',
  year = '',
): Promise<ApiResult<Record<string, unknown>>> {
  const availableBreeds = await loadAvailableBreeds()

  if (!breed && !discipline && !year) {
    const summary = await fetchJson<JudgesSummaryFile>('indexes/judges-summary.json')
    if (summary?.judges) {
      return { success: true, data: { judges: summary.judges, available_breeds: availableBreeds } }
    }
  }

  const rows = await loadJudgesRawRows()
  const filtered = filterJudgeRawRows(rows, { breed, discipline, year })
  const judgesData = formatJudgesData(aggregateJudgeStats(filtered))

  return { success: true, data: { judges: judgesData, available_breeds: availableBreeds } }
}

interface JudgeDetailFile {
  judge_name?: string
  total_evaluations?: number
  avg_score?: number | null
  breed_stats?: unknown[]
  criteria_stats?: unknown[]
}

export async function getJudgeDetails(
  judgeId: string,
  breed = '',
  discipline = '',
): Promise<ApiResult<Record<string, unknown>>> {
  const judgeName = decodeURIComponent(judgeId)

  if (!breed && !discipline) {
    const detail = await fetchJson<JudgeDetailFile>(`indexes/judge-details/${judgeDetailKey(judgeName)}.json`)
    if (detail) return { success: true, data: detail as Record<string, unknown> }
  }

  const rows = await loadJudgesRawRows()
  const filtered = filterJudgeRawRows(rows, { breed, discipline })

  const breedStatsMap = aggregateBreedStats(filtered, judgeName)
  const breedData = formatBreedData(breedStatsMap, filtered, judgeName)
  const criteriaStatsMap = aggregateCriteriaStats(filtered, judgeName)
  const criteriaData = formatCriteriaData(criteriaStatsMap)
  const allScores = aggregateAllScores(filtered, judgeName)
  const overallAvg = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : null

  return {
    success: true,
    data: {
      judge_name: judgeName,
      total_evaluations: allScores.length,
      avg_score: overallAvg,
      breed_stats: breedData,
      criteria_stats: criteriaData,
    },
  }
}

// ── Собаки ───────────────────────────────────────────────────────────────────

interface DogProfileFile {
  dog?: Record<string, unknown>
  competitions?: Record<string, unknown>[]
}

export async function getDogProfile(dogId: string): Promise<ApiResult<Record<string, unknown>>> {
  const file = await fetchJson<DogProfileFile>(`indexes/dog-profiles/${dogId}.json`)
  if (!file?.dog) return { success: false, error: 'Dog not found' }
  return { success: true, data: file.dog }
}

export async function getDogEvents(dogId: string): Promise<ApiResult<Record<string, unknown>[]>> {
  const file = await fetchJson<DogProfileFile>(`indexes/dog-profiles/${dogId}.json`)
  return { success: true, data: file?.competitions ?? [] }
}

// ── Выставки (RKF Shows) ─────────────────────────────────────────────────────

interface ShowResult {
  breed: string
  breed_group?: string
  breed_judge?: string
  breed_count?: number
  dog_breed_id?: number
  class: string
  placement: number
  grade?: string
  title: string
  dog_name: string
  owner: string
  judge: string
  sex?: string
  ring_number?: number
  points: number
}

interface ShowExhibition {
  id: number
  date: string
  title: string
  location: string
  rank: string
  type: string
  club: string
  judges: string[]
  breed_catalog?: Array<{
    dog_breed_id: number
    breed: string
    breed_en: string
    breed_group: string
    breed_group_en?: string
    breed_judge: string
    breed_count: number
    titles?: Array<{
      title_code: string
      ring_number: number
      dog_name: string
      owner: string
    }>
  }>
  results: ShowResult[]
}

interface ShowCalendarFile {
  exhibitions?: ShowExhibition[]
}

export async function getShowCalendar(): Promise<ApiResult<ShowExhibition[]>> {
  // Load all exhibitions from exhibitions directory
  const index = await fetchJson<Record<string, string>>('shows/index.json')
  if (!index) return { success: false, error: 'Shows index unavailable' }
  
  // Load each exhibition file
  const exhibitions: ShowExhibition[] = []
  for (const [id, filePath] of Object.entries(index)) {
    const exhibition = await fetchJson<ShowExhibition>(`shows/${filePath}`)
    if (exhibition) {
      exhibitions.push(exhibition)
    }
  }
  
  // Sort by date
  const sorted = exhibitions.sort((a, b) => 
    String(b.date || '').localeCompare(String(a.date || ''))
  )
  
  return { success: true, data: sorted }
}

export async function getShowExhibition(exhibitionId: string): Promise<ApiResult<ShowExhibition>> {
  const index = await fetchJson<Record<string, string>>('shows/index.json')
  if (!index) return { success: false, error: 'Shows index unavailable' }
  
  const filePath = index[exhibitionId]
  if (!filePath) return { success: false, error: 'Exhibition not found in index' }
  
  const exhibition = await fetchJson<ShowExhibition>(`shows/${filePath}`)
  if (!exhibition) return { success: false, error: 'Exhibition file not found' }
  return { success: true, data: exhibition }
}

interface ShowDog {
  id: string
  name_lat: string
  name_ru: string
  breed: string
  sex: string
  total_shows: number
  best_placement?: number
  rank_score?: number
  best_award?: string | null
  titles: {
    CAC: number
    CACIB: number
    BOB: number
    BIS: number
  }
}

export async function getShowDogRanking(year = ''): Promise<ApiResult<ShowDog[]>> {
  if (year) {
    const ranking = await fetchJson<ShowDog[]>(`shows/indexes/dog-ranking-${year}.json`)
    if (!ranking) return { success: false, error: `Dog ranking for year ${year} unavailable` }
    return { success: true, data: ranking }
  }
  
  // For all-time ranking, try to load but it may be excluded from deployment
  const ranking = await fetchJson<ShowDog[]>('shows/indexes/dog-ranking.json')
  if (!ranking) return { success: false, error: 'All-time dog ranking unavailable (too large for CDN)' }
  return { success: true, data: ranking }
}

export async function getShowJudges(): Promise<ApiResult<string[]>> {
  const judges = await fetchJson<string[]>('shows/indexes/judges.json')
  if (!judges) return { success: false, error: 'Show judges unavailable' }
  return { success: true, data: judges }
}
