import {
  bestShowAward,
  compareShowDogs,
  mergeShowTitles,
  showRankScore,
  type ShowTitleCounts,
} from '../../../../backend/lib/show-award-ranking'
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

/** Лёгкие годовые календари (не полные exhibitions/*.json). */
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

export async function getShowCalendar(): Promise<ApiResult<ShowExhibition[]>> {
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

  const sorted = exhibitions.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))

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
  breed_group?: string
  sex: string
  total_shows: number
  best_placement?: number
  rank_score?: number
  best_award?: string | null
  titles: ShowTitleCounts
  competition_dog_id?: number | null
  history?: Array<{
    date: string
    exhibition_id: number
    exhibition_title?: string
    placement: number
    title?: string
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
