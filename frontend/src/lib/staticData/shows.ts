import {
  bestShowAward,
  compareShowDogs,
  mergeShowTitles,
  showRankScore,
  type ShowTitleCounts,
} from '../../../../backend/lib/show-award-ranking'
import { bestShowGradeLabel } from '../../../../backend/lib/show-grades'
import { type ApiResult, fetchJson } from './core'

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

/** Годовые индексы рейтинга на CDN; all-time dog-ranking.json >25 MB и не деплоится. */
const SHOW_RANKING_YEARS = SHOW_CALENDAR_YEARS

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
  const index = await fetchJson<Record<string, string>>('shows/index.json')
  const filePath = index?.[exhibitionId]
  if (filePath) {
    const exhibition = await fetchJson<ShowExhibition>(`shows/${filePath}`)
    if (exhibition) return { success: true, data: exhibition }
  }

  // Local RKF PDF protocols (DEV sync → public/data/v1/shows/exhibitions-rkf/)
  const rkfIndex = await fetchJson<Record<string, string>>('shows/exhibitions-rkf/index.json')
  const rkfPath = rkfIndex?.[exhibitionId]
  if (rkfPath) {
    const exhibition = await fetchJson<ShowExhibition>(`shows/exhibitions-rkf/${rkfPath}`)
    if (exhibition) return { success: true, data: exhibition }
  }

  return {
    success: false,
    error: index ? 'Exhibition not found in index' : 'Shows index unavailable',
  }
}

interface ShowDog {
  id: string
  name_lat: string
  name_ru: string
  breed: string
  breed_group?: string
  sex: string
  total_shows: number
  best_placement?: number
  rank_score?: number
  best_award?: string | null
  best_grade?: string | null
  titles: ShowTitleCounts
  competition_dog_id?: number | null
  history?: Array<{
    date: string
    exhibition_id: number
    exhibition_title?: string
    placement: number
    title?: string
    grade?: string
    url?: string
    reports_link?: string
  }>
}

function mergeShowDogRankings(parts: ShowDog[][]): ShowDog[] {
  const dogMap = new Map<string, ShowDog>()

  for (const list of parts) {
    for (const dog of list) {
      // RKF даёт разные ring id на разных выставках — ключ по полной кличке + породе
      const nameKey = (dog.name_lat || dog.name_ru || '').toUpperCase().replace(/\s+/g, ' ').trim()
      const breedKey = (dog.breed || dog.breed_en || '').toUpperCase().replace(/\s+/g, ' ').trim()
      const key = `${nameKey}|${breedKey}`
      const existing = dogMap.get(key)
      if (!existing) {
        dogMap.set(key, {
          ...dog,
          titles: { ...dog.titles },
          history: [...(dog.history ?? [])],
        })
        continue
      }

      existing.total_shows += dog.total_shows
      existing.titles = mergeShowTitles(existing.titles, dog.titles)
      existing.rank_score = showRankScore(existing.titles)
      existing.best_award = bestShowAward(existing.titles)
      existing.history = [...(existing.history ?? []), ...(dog.history ?? [])].sort((a, b) =>
        String(b.date || '').localeCompare(String(a.date || '')),
      )
      existing.best_grade = bestShowGradeLabel(existing.history.map((h) => h.grade))

      const placement = dog.best_placement ?? 0
      if (
        placement > 0 &&
        (existing.best_placement == null ||
          existing.best_placement === 0 ||
          placement < existing.best_placement)
      ) {
        existing.best_placement = placement
      }
      if (dog.breed_group && !existing.breed_group) {
        existing.breed_group = dog.breed_group
      }
      if (dog.name_ru && !existing.name_ru) {
        existing.name_ru = dog.name_ru
      }
      if (dog.sex && !existing.sex) {
        existing.sex = dog.sex
      }
      if (dog.competition_dog_id != null && existing.competition_dog_id == null) {
        existing.competition_dog_id = dog.competition_dog_id
      }
      if (Number(dog.id) < Number(existing.id)) existing.id = dog.id
    }
  }

  return [...dogMap.values()].sort(compareShowDogs)
}

export async function getShowDogRanking(year = ''): Promise<ApiResult<ShowDog[]>> {
  if (year) {
    const ranking = await fetchJson<ShowDog[]>(`shows/indexes/dog-ranking-${year}.json`)
    if (!ranking) return { success: false, error: `Dog ranking for year ${year} unavailable` }
    return { success: true, data: ranking }
  }

  const allTime = await fetchJson<ShowDog[]>('shows/indexes/dog-ranking.json')
  if (allTime && Array.isArray(allTime) && allTime.length > 0) {
    return { success: true, data: allTime }
  }

  const parts = await Promise.all(
    SHOW_RANKING_YEARS.map((y) => fetchJson<ShowDog[]>(`shows/indexes/dog-ranking-${y}.json`)),
  )
  const merged = mergeShowDogRankings(parts.filter((p): p is ShowDog[] => Array.isArray(p)))
  if (merged.length === 0) {
    return { success: false, error: 'Show dog ranking unavailable' }
  }
  return { success: true, data: merged }
}

export interface ShowJudge {
  name: string
  total_judged: number
  breeds: string[]
}

export async function getShowJudges(): Promise<ApiResult<ShowJudge[]>> {
  const judges = await fetchJson<ShowJudge[] | string[]>('shows/indexes/judges.json')
  if (!judges || !Array.isArray(judges)) {
    return { success: false, error: 'Show judges unavailable' }
  }
  // Старый формат — только имена
  if (judges.length > 0 && typeof judges[0] === 'string') {
    return {
      success: true,
      data: (judges as string[]).map((name) => ({ name, total_judged: 0, breeds: [] })),
    }
  }
  return { success: true, data: judges as ShowJudge[] }
}
