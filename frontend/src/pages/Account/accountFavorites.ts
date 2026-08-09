import { dogNameMatchesQuery } from '../../lib/dogName'
import { displayBreed } from '../../lib/breedMapping'
import { getDogProfileFile } from '../../lib/staticData/dogs'

export type FavoriteMedalStats = {
  gold: number
  silver: number
  bronze: number
  total_starts: number
  best_score?: number | null
  best_speed?: number | null
}

export type FavoriteLastEvent = {
  event_id: string
  date_start: string
  title: string
  placement: number | null
  event_type: string | null
}

export type FavoriteDog = {
  id: string
  name_lat: string
  name_ru: string
  breed: string
  breedDisplay: string
  sex: string | null
  coursing: FavoriteMedalStats | null
  racing: FavoriteMedalStats | null
  lastEvent: FavoriteLastEvent | null
}

export type FavoriteSortMode = 'name' | 'breed' | 'recent'

export type BreedSummaryItem = {
  breed: string
  breedDisplay: string
  count: number
}

function num(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0
}

function numOrNull(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}

function readMedalStats(raw: unknown): FavoriteMedalStats | null {
  if (!raw || typeof raw !== 'object') return null
  const s = raw as Record<string, unknown>
  return {
    gold: num(s.gold),
    silver: num(s.silver),
    bronze: num(s.bronze),
    total_starts: num(s.total_starts),
    best_score: numOrNull(s.best_score),
    best_speed: numOrNull(s.best_speed),
  }
}

export function pickLastEvent(competitions: Record<string, unknown>[]): FavoriteLastEvent | null {
  const dated = competitions
    .map((c) => {
      const date_start = typeof c.date_start === 'string' ? c.date_start : ''
      if (!date_start) return null
      const event_id = c.event_id != null ? String(c.event_id) : ''
      if (!event_id) return null
      const placement = typeof c.placement === 'number' ? c.placement : null
      return {
        event_id,
        date_start,
        title: typeof c.title === 'string' ? c.title : 'Соревнование',
        placement,
        event_type: typeof c.event_type === 'string' ? c.event_type : null,
      } satisfies FavoriteLastEvent
    })
    .filter((c): c is FavoriteLastEvent => c !== null)

  if (dated.length === 0) return null
  dated.sort((a, b) => b.date_start.localeCompare(a.date_start))
  return dated[0]
}

export function parseFavoriteDog(
  id: string,
  data: Record<string, unknown>,
  competitions: Record<string, unknown>[] = [],
): FavoriteDog | null {
  const name_lat = typeof data.name_lat === 'string' ? data.name_lat : ''
  const name_ru = typeof data.name_ru === 'string' ? data.name_ru : ''
  const breed = typeof data.breed === 'string' ? data.breed : ''
  if (!name_lat && !name_ru) return null

  return {
    id,
    name_lat: name_lat || name_ru,
    name_ru,
    breed,
    breedDisplay: (() => {
      const d = displayBreed(breed)
      return d.primary || breed || '—'
    })(),
    sex: typeof data.sex === 'string' ? data.sex : null,
    coursing: readMedalStats(data.coursing_stats),
    racing: readMedalStats(data.racing_stats),
    lastEvent: pickLastEvent(competitions),
  }
}

export async function loadFavoriteDog(id: string): Promise<FavoriteDog | null> {
  const file = await getDogProfileFile(id)
  if (!file?.dog) return null
  return parseFavoriteDog(id, file.dog, file.competitions ?? [])
}

export function filterFavoriteDogs(dogs: FavoriteDog[], query: string): FavoriteDog[] {
  const q = query.trim()
  if (!q) return dogs

  const lower = q.toLowerCase()
  return dogs.filter((dog) => {
    const nameMatch = dogNameMatchesQuery(dog.name_lat, dog.name_ru, q)
    const breedMatch =
      dog.breed.toLowerCase().includes(lower) || dog.breedDisplay.toLowerCase().includes(lower)
    return nameMatch || breedMatch
  })
}

export function sortFavoriteDogs(
  dogs: FavoriteDog[],
  mode: FavoriteSortMode,
  idOrder?: string[],
): FavoriteDog[] {
  const sorted = [...dogs]

  if (mode === 'recent') {
    if (idOrder && idOrder.length > 0) {
      const orderIndex = new Map(idOrder.map((id, i) => [id, i]))
      sorted.sort((a, b) => {
        const ai = orderIndex.get(a.id) ?? Number.MAX_SAFE_INTEGER
        const bi = orderIndex.get(b.id) ?? Number.MAX_SAFE_INTEGER
        return ai - bi
      })
      return sorted
    }
    sorted.sort((a, b) => a.name_lat.localeCompare(b.name_lat, 'ru', { sensitivity: 'base' }))
    return sorted
  }

  if (mode === 'breed') {
    sorted.sort((a, b) => {
      const breedCmp = a.breedDisplay.localeCompare(b.breedDisplay, 'ru', { sensitivity: 'base' })
      if (breedCmp !== 0) return breedCmp
      return a.name_lat.localeCompare(b.name_lat, 'ru', { sensitivity: 'base' })
    })
    return sorted
  }

  sorted.sort((a, b) => a.name_lat.localeCompare(b.name_lat, 'ru', { sensitivity: 'base' }))
  return sorted
}

export function summarizeBreeds(dogs: FavoriteDog[]): BreedSummaryItem[] {
  const map = new Map<string, BreedSummaryItem>()
  for (const dog of dogs) {
    const key = dog.breed || dog.breedDisplay
    const prev = map.get(key)
    if (prev) prev.count += 1
    else map.set(key, { breed: key, breedDisplay: dog.breedDisplay, count: 1 })
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.breedDisplay.localeCompare(b.breedDisplay, 'ru'))
}

export function recentStartsFromFavorites(dogs: FavoriteDog[], limit = 6) {
  return dogs
    .filter((d) => d.lastEvent)
    .map((d) => ({ dog: d, event: d.lastEvent! }))
    .sort((a, b) => b.event.date_start.localeCompare(a.event.date_start))
    .slice(0, limit)
}

export type FavoritesAggregateStats = {
  dogs: number
  starts: number
  gold: number
  silver: number
  bronze: number
}

/** Sum CDN medal/start stats across favorite dogs (coursing + racing). */
export function summarizeFavoritesStats(dogs: FavoriteDog[]): FavoritesAggregateStats {
  let starts = 0
  let gold = 0
  let silver = 0
  let bronze = 0
  for (const dog of dogs) {
    for (const block of [dog.coursing, dog.racing]) {
      if (!block) continue
      starts += block.total_starts
      gold += block.gold
      silver += block.silver
      bronze += block.bronze
    }
  }
  return { dogs: dogs.length, starts, gold, silver, bronze }
}
