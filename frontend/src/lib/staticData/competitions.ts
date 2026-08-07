import { canonicalBreed } from '../breedMapping'
import { dedupeCalendarEvents } from '../../../../backend/lib/event-identity'
import { type ApiResult, fetchJson } from './core'

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
    // Calendar JSON is loosely typed; identity helpers expect EventIdentityFields
    const events = dedupeCalendarEvents(file.events as never) as unknown as Record<string, unknown>[]
    return { success: true, data: sortByDateDesc(events) }
  }
  const all = await fetchJson<Record<string, unknown>[]>('indexes/calendar-index.json')
  if (!all) return { success: false, error: 'calendar index unavailable' }
  const events = dedupeCalendarEvents(all as never) as unknown as Record<string, unknown>[]
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

/** JSON.stringify обратно, если export-local-data распарсил поле в объект. */
function restringify(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch {
    return null
  }
}

async function loadCompetition(
  eventId: string,
): Promise<{ event: Record<string, unknown>; results: Record<string, unknown>[] } | null> {
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
