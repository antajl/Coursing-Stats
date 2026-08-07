import {
  bestShowAward,
  compareShowDogs,
  expandShowTitles,
  mergeShowTitles,
  showDogDetailShard,
  showRankScore,
  type ShowTitleCounts,
} from '../../../../../backend/lib/show-award-ranking'
import { bestShowGradeLabel } from '../../../../../backend/lib/show-grades'
import { type ApiResult, fetchJson } from '../core'

/** Годовые индексы рейтинга на CDN; all-time dog-ranking.json >25 MB и не деплоится. */
const SHOW_RANKING_YEARS = [
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

interface ShowDog {
  id: string
  name_lat: string
  name_ru: string
  breed: string
  breed_en?: string
  breed_group?: string
  sex: string
  total_shows: number
  best_placement?: number
  rank_score?: number
  /** 1-based место в all-time / годовом рейтинге (если есть в индексе). */
  rank?: number
  best_award?: string | null
  best_grade?: string | null
  titles: ShowTitleCounts
  competition_dog_id?: number | null
  catalog_id?: string
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

function hydrateShowDog(raw: ShowDog & { titles?: Partial<ShowTitleCounts> }): ShowDog {
  return {
    ...raw,
    name_ru: raw.name_ru || '',
    sex: raw.sex || '',
    titles: expandShowTitles(raw.titles),
    history: Array.isArray(raw.history) ? raw.history : [],
  }
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

async function loadShowDogRankingYear(year: string): Promise<ShowDog[] | null> {
  const file = await fetchJson<
    ShowDog[] | { schema?: string; shards?: string[]; count?: number }
  >(`shows/indexes/dog-ranking-${year}.json`)
  if (!file) return null
  if (Array.isArray(file)) return file.map(hydrateShowDog)
  if (Array.isArray(file.shards) && file.shards.length > 0) {
    const parts = await Promise.all(
      file.shards.map((name) => fetchJson<ShowDog[]>(`shows/indexes/${name}`)),
    )
    const dogs: ShowDog[] = []
    for (const part of parts) {
      if (!Array.isArray(part)) continue
      for (const dog of part) dogs.push(hydrateShowDog(dog))
    }
    return dogs.length > 0 ? dogs : null
  }
  return null
}

/** First-paint slice (~top 400). Falls back to null if not built yet. */
export async function getShowDogRankingPage0(year: string): Promise<ApiResult<ShowDog[]>> {
  if (!year) return { success: false, error: 'Year required for page0 ranking' }
  const file = await fetchJson<{
    schema?: string
    dogs?: ShowDog[]
    count?: number
    total_count?: number
  }>(`shows/indexes/dog-ranking-${year}-page0.json`)
  if (!file || !Array.isArray(file.dogs) || file.dogs.length === 0) {
    return { success: false, error: `Dog ranking page0 for year ${year} unavailable` }
  }
  return { success: true, data: file.dogs.map(hydrateShowDog) }
}

export async function getShowDogRanking(year = ''): Promise<ApiResult<ShowDog[]>> {
  console.log('[getShowDogRanking] Requested year:', year)
  if (year) {
    console.log('[getShowDogRanking] Loading year ranking for:', year)
    const ranking = await loadShowDogRankingYear(year)
    console.log('[getShowDogRanking] Year ranking loaded:', ranking ? ranking.length : 'null')
    if (!ranking) return { success: false, error: `Dog ranking for year ${year} unavailable` }
    return { success: true, data: ranking }
  }

  const allTime = await fetchJson<ShowDog[]>('shows/indexes/dog-ranking.json')
  console.log('[getShowDogRanking] All-time ranking:', allTime ? allTime.length : 'null')
  if (allTime && Array.isArray(allTime) && allTime.length > 0) {
    return { success: true, data: allTime.map(hydrateShowDog) }
  }

  console.log('[getShowDogRanking] Loading year rankings:', SHOW_RANKING_YEARS)
  const parts = await Promise.all(SHOW_RANKING_YEARS.map((y) => loadShowDogRankingYear(y)))
  console.log('[getShowDogRanking] Year rankings loaded:', parts.map(p => p ? p.length : 'null'))
  const lists = parts.filter((p): p is ShowDog[] => Array.isArray(p) && p.length > 0)
  console.log('[getShowDogRanking] Valid lists:', lists.length)
  if (lists.length === 0) return { success: false, error: 'Dog ranking unavailable' }
  return { success: true, data: mergeShowDogRankings(lists) }
}

export interface ShowDogSearchEntry {
  id: string
  name_lat: string
  name_ru: string
  breed: string
  breed_group: string
  sex: string
}

export async function getShowDogSearchIndex(): Promise<ApiResult<ShowDogSearchEntry[]>> {
  const index = await fetchJson<ShowDogSearchEntry[]>('shows/indexes/dog-search-index.json')
  if (!index || !Array.isArray(index)) {
    return { success: false, error: 'Dog search index unavailable' }
  }
  return { success: true, data: index }
}

type ShowDogLookup = {
  byCompetitionId?: Record<string, string>
  byNameBreed?: Record<string, string>
}

let showDogLookupCache: ShowDogLookup | null | undefined

async function getShowDogLookup(): Promise<ShowDogLookup | null> {
  // DEV: не кэшируем lookup — иначе после rebuild виден старый competition→show id
  if (import.meta.env.DEV) {
    return await loadShardedLookup()
  }
  if (showDogLookupCache !== undefined) return showDogLookupCache
  showDogLookupCache = await loadShardedLookup()
  return showDogLookupCache
}

async function loadShardedLookup(): Promise<ShowDogLookup | null> {
  const byCompetitionId: Record<string, string> = {}
  const byNameBreed: Record<string, string> = {}
  
  // Load all 16 shards (0-f)
  const shardKeys = Array.from({ length: 16 }, (_, i) => i.toString(16))
  console.log('[show-dog-lookup] Loading shards:', shardKeys)
  
  const shards = await Promise.all(
    shardKeys.map(async (key) => {
      const result = await fetchJson<{ byCompetitionId?: Record<string, string>, byNameBreed?: Record<string, string> }>(
        `shows/indexes/show-dog-lookup/${key}.json`
      )
      console.log('[show-dog-lookup] Shard', key, ':', result ? 'loaded' : 'null', 
        result ? `(comp: ${Object.keys(result.byCompetitionId || {}).length}, name: ${Object.keys(result.byNameBreed || {}).length})` : '')
      return result
    })
  )
  
  console.log('[show-dog-lookup] Loaded shards:', shards.filter(s => s != null).length, '/', shards.length)
  
  for (const shard of shards) {
    if (shard?.byCompetitionId) {
      Object.assign(byCompetitionId, shard.byCompetitionId)
    }
    if (shard?.byNameBreed) {
      Object.assign(byNameBreed, shard.byNameBreed)
    }
  }
  
  console.log('[show-dog-lookup] Total entries:', Object.keys(byCompetitionId).length, 'competition,', Object.keys(byNameBreed).length, 'name keys')
  
  if (Object.keys(byCompetitionId).length === 0 && Object.keys(byNameBreed).length === 0) {
    console.warn('[show-dog-lookup] No entries found!')
    return null
  }
  
  return { byCompetitionId, byNameBreed }
}

/** Полная карточка выставочной собаки (titles + history) из шарда dog-details/. */
export async function getShowDogDetail(id: string): Promise<ApiResult<ShowDog>> {
  const shard = showDogDetailShard(id)
  console.log('[getShowDogDetail] Loading shard:', shard, 'for ID:', id)
  const pack = await fetchJson<Record<string, ShowDog>>(`shows/indexes/dog-details/${shard}.json`)
  console.log('[getShowDogDetail] Shard loaded, keys:', pack ? Object.keys(pack).length : 'null')
  const raw = pack?.[id]
  if (!raw) {
    console.warn('[getShowDogDetail] Dog not found in shard:', id)
    return { success: false, error: `Show dog ${id} not found` }
  }
  console.log('[getShowDogDetail] Dog found:', raw.name_lat)
  return { success: true, data: hydrateShowDog(raw) }
}

/** Найти id выставочной собаки по competition id или кличке+породе, затем загрузить detail. */
export async function resolveShowDogDetail(opts: {
  profileId?: string | null
  competitionId?: number | string | null
  nameLat?: string | null
  nameRu?: string | null
  breed?: string | null
}): Promise<ApiResult<ShowDog>> {
  if (opts.profileId) {
    const direct = await getShowDogDetail(String(opts.profileId))
    if (direct.success) return direct
  }

  const lookup = await getShowDogLookup()

  if (opts.competitionId != null && lookup?.byCompetitionId) {
    const id = lookup.byCompetitionId[String(opts.competitionId)]
    if (id) return getShowDogDetail(id)
  }

  if (lookup?.byNameBreed && opts.breed) {
    const breedKey = opts.breed.toUpperCase().replace(/\s+/g, ' ').trim()
    for (const name of [opts.nameLat, opts.nameRu]) {
      if (!name) continue
      const nameKey = name.toUpperCase().replace(/\s+/g, ' ').trim()
      const key = `${nameKey}|${breedKey}`
      const id = lookup.byNameBreed[key]
      if (id) return getShowDogDetail(id)
    }
  }

  return { success: false, error: 'Show dog not found' }
}

type ShowAllTimeRanksFile = {
  byId?: Record<string, number>
  byCompetitionId?: Record<string, number>
}

let showAllTimeRanksCache: ShowAllTimeRanksFile | null | undefined

/** Место в all-time выставочном рейтинге (лёгкий lookup, без полного ranking). */
export async function getShowDogAllTimeRank(opts: {
  showId?: string | number | null
  competitionId?: string | number | null
}): Promise<number | null> {
  if (showAllTimeRanksCache === undefined || import.meta.env.DEV) {
    showAllTimeRanksCache =
      (await fetchJson<ShowAllTimeRanksFile>('shows/indexes/dog-all-time-ranks.json')) ?? null
  }
  const file = showAllTimeRanksCache
  if (!file) return null
  if (opts.showId != null && opts.showId !== '') {
    const n = file.byId?.[String(opts.showId)]
    if (typeof n === 'number' && n > 0) return n
  }
  if (opts.competitionId != null && opts.competitionId !== '') {
    const n = file.byCompetitionId?.[String(opts.competitionId)]
    if (typeof n === 'number' && n > 0) return n
  }
  return null
}

/** Место в выставочном рейтинге за год (общий, без фильтра по породе). */
export async function getShowDogYearRank(opts: {
  showId?: string | number | null
  competitionId?: string | number | null
  year: string
}): Promise<number | null> {
  if (!opts.year) return null
  const ranking = await loadShowDogRankingYear(opts.year)
  if (!ranking) return null

  const dogId = opts.showId ?? opts.competitionId
  if (!dogId) return null

  const index = ranking.findIndex(
    (d) => d.id === String(dogId) || d.competition_dog_id === Number(dogId),
  )
  return index >= 0 ? index + 1 : null
}

/** Место в выставочном рейтинге по породе за год. */
export async function getShowDogBreedRank(opts: {
  showId?: string | number | null
  competitionId?: string | number | null
  breed: string
  year: string
}): Promise<number | null> {
  if (!opts.breed || !opts.year) return null
  const ranking = await loadShowDogRankingYear(opts.year)
  if (!ranking) return null

  const breedFiltered = ranking.filter((dog) => dog.breed === opts.breed)
  const dogId = opts.showId ?? opts.competitionId
  if (!dogId) return null

  const index = breedFiltered.findIndex(
    (d) => d.id === String(dogId) || d.competition_dog_id === Number(dogId),
  )
  return index >= 0 ? index + 1 : null
}
