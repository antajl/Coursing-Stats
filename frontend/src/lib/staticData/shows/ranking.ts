import {
  showDogDetailShard,
  type ShowTitleCounts,
} from '../../../../../backend/lib/show-award-ranking'
import { canonicalBreed } from '../../breedMapping'
import { transliterateCyrillicToLatin } from '../../dogName'
import { type ApiResult, fetchJson } from '../core'

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
  pedigree_url?: string | null
  photo_url?: string | null
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
  if (raw.titles && raw.history && raw.name_ru != null && raw.sex != null) {
    return raw as ShowDog
  }
  return {
    ...raw,
    name_ru: raw.name_ru || '',
    sex: raw.sex || '',
    titles: (raw.titles as ShowTitleCounts) || ({} as ShowTitleCounts),
    history: Array.isArray(raw.history) ? raw.history : [],
  }
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
  const fileName = year ? `dog-ranking-${year}-page0.json` : 'dog-ranking-all-time-page0.json'
  const file = await fetchJson<{
    schema?: string
    dogs?: ShowDog[]
    count?: number
    total_count?: number
  }>(`shows/indexes/${fileName}`)
  if (!file || !Array.isArray(file.dogs) || file.dogs.length === 0) {
    return { success: false, error: `Dog ranking page0 for ${year || 'all time'} unavailable` }
  }
  return { success: true, data: file.dogs.map(hydrateShowDog) }
}

export async function getShowDogRanking(year = ''): Promise<ApiResult<ShowDog[]>> {
  if (!year) {
    const file = await fetchJson<ShowDog[]>('shows/indexes/dog-ranking-all-time.json')
    if (!file || !Array.isArray(file)) {
      return { success: false, error: 'Dog ranking for all time unavailable' }
    }
    return { success: true, data: file.map(hydrateShowDog) }
  }
  const targetYear = year
  console.debug('[getShowDogRanking] Requested year:', year, 'targetYear:', targetYear)
  const ranking = await loadShowDogRankingYear(targetYear)
  console.debug('[getShowDogRanking] Year ranking loaded:', ranking ? ranking.length : 'null')
  if (!ranking) return { success: false, error: `Dog ranking for year ${targetYear} unavailable` }
  return { success: true, data: ranking }
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

let competitionLinksCache: Promise<Record<string, string> | null> | null = null

async function getCompetitionShowLinks(): Promise<Record<string, string> | null> {
  if (!competitionLinksCache) {
    competitionLinksCache = fetchJson<{ byCompetitionId?: Record<string, string> }>(
      'shows/indexes/competition-links.json',
    )
      .then((file) => file?.byCompetitionId ?? null)
      .catch(() => null)
  }
  return competitionLinksCache
}

async function getShowDogLookup(): Promise<ShowDogLookup | null> {
  // Never fetch all 16 show-dog-lookup shards (~186 MB) into browser memory.
  // Resolution uses direct dog-details/{shard} or competition-links.json (~17 KB).
  return null
}

/** Полная карточка выставочной собаки (titles + history) из шарда dog-details/. */
export async function getShowDogDetail(id: string, depth = 0): Promise<ApiResult<ShowDog>> {
  if (depth > 3) return { success: false, error: `Show dog alias loop detected for ${id}` }
  const shard = showDogDetailShard(id)
  console.debug('[getShowDogDetail] Loading shard:', shard, 'for ID:', id)
  const pack = await fetchJson<Record<string, ShowDog | { alias_to: string }>>(`shows/indexes/dog-details/${shard}.json`)
  console.debug('[getShowDogDetail] Shard loaded, keys:', pack ? Object.keys(pack).length : 'null')
  const raw = pack?.[id]
  if (!raw) {
    console.debug('[getShowDogDetail] Dog not found in shard:', id)
    return { success: false, error: `Show dog ${id} not found` }
  }
  if ('alias_to' in raw && (raw as any).alias_to) {
    return getShowDogDetail(String((raw as any).alias_to), depth + 1)
  }
  console.debug('[getShowDogDetail] Dog found:', (raw as ShowDog).name_lat)
  return { success: true, data: hydrateShowDog(raw as ShowDog) }
}

function cleanShowDogNameVariants(rawName: string): string[] {
  const variants = new Set<string>()
  const norm = rawName.toUpperCase().replace(/\s+/g, ' ').trim()
  if (!norm) return []
  variants.add(norm)

  if (norm.includes('/')) {
    for (const chunk of norm.split('/')) {
      const c = chunk.trim()
      if (c.length >= 2) variants.add(c)
    }
  }

  for (const v of Array.from(variants)) {
    const withoutSuffix = v.replace(/\s*\([A-ZА-ЯЁ0-9\-\s]+\)$/i, '').trim()
    if (withoutSuffix.length >= 2) variants.add(withoutSuffix)

    const withoutRkf = v.replace(/\s*(?:RKF|РКФ|FRX|BLL|BC|B)\s*[\d\s]+.*$/i, '').trim()
    if (withoutRkf.length >= 2) variants.add(withoutRkf)

    const withoutBoth = withoutSuffix.replace(/\s*(?:RKF|РКФ|FRX|BLL|BC|B)\s*[\d\s]+.*$/i, '').trim()
    if (withoutBoth.length >= 2) variants.add(withoutBoth)
  }

  return Array.from(variants)
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

  // 1. Быстрый поиск по competitionId через лёгкий микро-индекс (~17 KB)
  if (opts.competitionId != null) {
    const compLinks = await getCompetitionShowLinks()
    if (compLinks) {
      const id = compLinks[String(opts.competitionId)]
      if (id) return getShowDogDetail(id)
    }
    // Если собака имеет официальный competitionId и не привязана к выставкам в индексе связей,
    // не запускаем тяжелый 195 МБ lookup по кличке/породе для чисто спортивной собаки.
    if (!opts.profileId || String(opts.profileId) === String(opts.competitionId)) {
      return { success: false, error: 'Show dog not found' }
    }
  }

  if (!opts.breed || (!opts.nameLat && !opts.nameRu)) {
    return { success: false, error: 'Show dog not found' }
  }

  const lookup = await getShowDogLookup()

  if (opts.competitionId != null && lookup?.byCompetitionId) {
    const id = lookup.byCompetitionId[String(opts.competitionId)]
    if (id) return getShowDogDetail(id)
  }

  if (lookup?.byNameBreed && opts.breed) {
    const rawBreedKey = opts.breed.toUpperCase().replace(/\s+/g, ' ').trim()
    const canBreedKey = canonicalBreed(opts.breed).toUpperCase().replace(/\s+/g, ' ').trim()
    const breedKeys = Array.from(new Set([rawBreedKey, canBreedKey].filter(Boolean)))

    for (const rawName of [opts.nameLat, opts.nameRu]) {
      if (!rawName) continue
      for (const baseName of cleanShowDogNameVariants(rawName)) {
        const nameKey = baseName.toUpperCase().replace(/\s+/g, ' ').trim()
        const translit = transliterateCyrillicToLatin(nameKey).toUpperCase().replace(/\s+/g, ' ').trim()
        const variants = new Set<string>([nameKey, translit].filter(Boolean))
        for (const base of Array.from(variants)) {
          variants.add(base.replace(/([A-ZА-ЯЁ])\1+/g, '$1'))
          if (base.endsWith('EE')) variants.add(base.slice(0, -1))
          if (base.endsWith('E') && !base.endsWith('EE')) variants.add(base + 'E')
          if (base.includes('KH')) variants.add(base.replace(/KH/g, 'H'))
          if (base.includes('H') && !base.includes('KH')) variants.add(base.replace(/\bH\b/g, 'KH'))
          if (base.includes('V')) variants.add(base.replace(/V/g, 'W'))
          if (base.includes('W')) variants.add(base.replace(/W/g, 'V'))
        }
        const nameKeys = Array.from(variants)

        for (const nk of nameKeys) {
          for (const bk of breedKeys) {
            const key = `${nk}|${bk}`
            const id = lookup.byNameBreed[key]
            if (id) return getShowDogDetail(id)
          }
        }
      }
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
  if (showAllTimeRanksCache === undefined) {
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
