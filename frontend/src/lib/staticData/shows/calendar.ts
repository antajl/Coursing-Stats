import { type ApiResult, fetchJson } from '../core'

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

/** Лёгкие годовые календари LC-протоколов (не полные exhibitions/*.json). */
const SHOW_CALENDAR_YEARS = [
  '2017',
  '2018',
  '2019',
  '2021',
  '2022',
  '2023',
  '2024',
  '2025',
  '2026',
] as const

/** Годы rkf.online CategoryId=1 (если нет manifest — fallback). */
const SHOW_RKF_CALENDAR_YEARS_FALLBACK = [
  '2019',
  '2020',
  '2021',
  '2022',
  '2023',
  '2024',
  '2025',
  '2026',
  '2027',
] as const

interface ShowCalendarEntry {
  id: number
  date: string
  title: string
  location?: string
  rank?: string
  type?: string
  club?: string
  judges?: string[]
  has_results?: boolean
  results_count?: number
}

interface ShowCalendarFile {
  year?: string
  exhibitions?: ShowCalendarEntry[]
}

/** Запись календаря rkf.online (schema show-calendar-rkf-v1). */
export interface ShowRkfCalendarEntry {
  id: number
  date: string
  date_end?: string
  title: string
  city?: string
  club?: string
  ranks?: string
  /** НКП / национальный клуб породы (mono). */
  national_breed_club_name?: string
  /** Породы через запятую — fallback подзаголовка. */
  breeds?: string
  type?: string
  url?: string
  has_report_link?: boolean
  /** PDF «Итоговый отчет» (tables.rkf.org.ru). */
  reports_link?: string | null
  /** PDF «Ведомость главного ринга / BIS», если есть. */
  bis_reports_link?: string | null
  has_lc_protocol?: boolean
  lc_exhibition_id?: number | null
  lc_url?: string | null
  /** Совместимость с UI: location = city */
  location?: string
  rank?: string
  judges?: string[]
  results?: ShowResult[]
  source?: 'rkf' | 'lc'
}

interface ShowRkfCalendarFile {
  schema?: string
  year?: string
  exhibitions?: ShowRkfCalendarEntry[]
}

interface ShowRkfCalendarManifest {
  years?: Array<{ year: string; count?: number }>
}

function compareRuDatesDesc(a: string, b: string): number {
  const toIso = (d: string) => {
    const [dd, mm, yyyy] = d.split('.')
    if (!yyyy || !mm || !dd) return d
    return `${yyyy}-${mm}-${dd}`
  }
  return toIso(b).localeCompare(toIso(a))
}

/** Календарь rkf.online CategoryId=1. Без year — все шарды; с year — один файл. */
export async function getShowRkfCalendar(
  year?: string,
): Promise<ApiResult<ShowRkfCalendarEntry[]>> {
  const manifest = await fetchJson<ShowRkfCalendarManifest>('shows/calendar-rkf/manifest.json')
  const years =
    year
      ? [year]
      : (manifest?.years?.map((y) => y.year).filter(Boolean) ??
        [...SHOW_RKF_CALENDAR_YEARS_FALLBACK])

  const parts = await Promise.all(
    years.map((y) => fetchJson<ShowRkfCalendarFile>(`shows/calendar-rkf/${y}.json`)),
  )

  const exhibitions: ShowRkfCalendarEntry[] = []
  for (const part of parts) {
    for (const entry of part?.exhibitions ?? []) {
      exhibitions.push({
        ...entry,
        location: entry.city ?? entry.location ?? '',
        rank: entry.ranks ?? entry.rank ?? '',
        club: entry.club ?? '',
        type: entry.type ?? '',
        judges: entry.judges ?? [],
        results: [],
        source: 'rkf',
      })
    }
  }

  if (exhibitions.length === 0) {
    return { success: false, error: 'RKF shows calendar unavailable' }
  }

  exhibitions.sort(
    (a, b) => compareRuDatesDesc(a.date, b.date) || (b.id ?? 0) - (a.id ?? 0),
  )
  return { success: true, data: exhibitions }
}

export async function getShowRkfCalendarYears(): Promise<string[]> {
  const manifest = await fetchJson<ShowRkfCalendarManifest>('shows/calendar-rkf/manifest.json')
  if (manifest?.years?.length) {
    return manifest.years.map((y) => y.year).filter(Boolean).sort((a, b) => Number(b) - Number(a))
  }
  return [...SHOW_RKF_CALENDAR_YEARS_FALLBACK].sort((a, b) => Number(b) - Number(a))
}

/** Legacy LC calendar из scraped exhibitions (мало записей). */
export async function getShowLcCalendar(): Promise<ApiResult<ShowExhibition[]>> {
  const parts = await Promise.all(
    SHOW_CALENDAR_YEARS.map((year) => fetchJson<ShowCalendarFile>(`shows/calendar/${year}.json`)),
  )

  const exhibitions: ShowExhibition[] = []
  for (const part of parts) {
    for (const entry of part?.exhibitions ?? []) {
      const resultsCount =
        typeof entry.results_count === 'number'
          ? entry.results_count
          : entry.has_results
            ? 1
            : 0
      exhibitions.push({
        id: entry.id,
        date: entry.date,
        title: entry.title,
        location: entry.location ?? '',
        rank: entry.rank ?? '',
        type: entry.type ?? '',
        club: entry.club ?? '',
        judges: entry.judges ?? [],
        results: resultsCount > 0 ? Array.from({ length: resultsCount }, () => ({} as ShowResult)) : [],
      })
    }
  }

  if (exhibitions.length === 0) {
    return { success: false, error: 'Shows calendar unavailable' }
  }

  const sorted = exhibitions.sort((a, b) => compareRuDatesDesc(a.date || '', b.date || ''))
  return { success: true, data: sorted }
}

/** UI календаря: rkf.online (по году) если есть, иначе legacy LC calendar. */
export async function getShowCalendar(
  year?: string,
): Promise<ApiResult<ShowRkfCalendarEntry[]>> {
  const rkf = await getShowRkfCalendar(year || undefined)
  if (rkf.success && rkf.data && rkf.data.length > 0) return rkf

  // Без шарда rkf — fallback на весь LC-календарь (с фильтром года на клиенте)
  const lc = await getShowLcCalendar()
  if (!lc.success || !lc.data) {
    return { success: false, error: lc.error || 'Shows calendar unavailable' }
  }

  let data = lc.data.map((e) => ({
    id: e.id,
    date: e.date,
    title: e.title,
    city: e.location,
    location: e.location,
    club: e.club,
    ranks: e.rank,
    rank: e.rank,
    type: e.type,
    judges: e.judges,
    results: e.results,
    url: `https://lc.rkfshow.ru/RKF/ExhibitionResults/ExhibitionResultListView?exhibitionId=${e.id}`,
    has_report_link: (e.results?.length ?? 0) > 0,
    has_lc_protocol: true,
    lc_exhibition_id: e.id,
    lc_url: `https://lc.rkfshow.ru/RKF/ExhibitionResults/ExhibitionResultListView?exhibitionId=${e.id}`,
    source: 'lc' as const,
  }))

  if (year) {
    data = data.filter((e) => e.date.endsWith(`.${year}`) || e.date.includes(`.${year}`))
  }

  if (data.length === 0) {
    return { success: false, error: 'Shows calendar unavailable' }
  }

  return { success: true, data }
}

export async function getShowExhibition(exhibitionId: string): Promise<ApiResult<ShowExhibition>> {
  console.log('[getShowExhibition] Loading exhibition:', exhibitionId)

  // First try JSON files (for non-RKF exhibitions)
  const index = await fetchJson<Record<string, string>>('shows/index.json')
  const filePath = index?.[exhibitionId]
  if (filePath) {
    console.log('[getShowExhibition] Found in JSON index:', filePath)
    const exhibition = await fetchJson<ShowExhibition>(`shows/${filePath}`)
    if (exhibition) return { success: true, data: exhibition }
  }

  // Try Turso for RKF exhibitions (migrated in ADR-007)
  try {
    const { getExhibitionById } = await import('../../turso')
    // Try multiple years (exhibitionId is just ID, year is separate in Turso)
    const currentYear = new Date().getFullYear()
    for (const year of [currentYear, currentYear - 1, currentYear - 2, currentYear - 3]) {
      console.log('[getShowExhibition] Trying Turso year:', year, 'for ID:', exhibitionId)
      const exhibition = await getExhibitionById(exhibitionId, year)
      if (exhibition) {
        console.log('[getShowExhibition] Found in Turso for year:', year)
        return { success: true, data: exhibition }
      }
    }
    console.log('[getShowExhibition] Not found in Turso for any year')
  } catch (error) {
    console.error('[getShowExhibition] Turso query failed:', error)
    // Fall through to error message
  }

  console.log('[getShowExhibition] Exhibition not found anywhere')
  return {
    success: false,
    error: index ? 'Exhibition not found in index or Turso' : 'Shows index unavailable',
  }
}
