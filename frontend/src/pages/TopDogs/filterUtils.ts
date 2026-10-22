import { dogNameMatchesQuery } from '../../lib/dogName'
import { ratingScoreFromRow } from '../../../../backend/lib/rating/coursing-rating-score'
import { matchesBreedFilter, displayBreed } from '../../lib/breedMapping'
import type { CombinedRankingDog } from './mergeCombinedRanking'

export interface TopDogsFilterParams {
  searchQuery: string
  filterMinStarts: string
  filterScoreFrom: string
  filterSpeedFrom: string
  filterBreed: string
}

/** @deprecated kept for imports; Elo list no longer excludes short careers */
export const ELO_MIN_RACES_FOR_RANK = 8

function matchesSearch(
  dog: { name_lat?: string; name_ru?: string; breed?: string; total_starts?: number },
  searchQuery: string
): boolean {
  if (!searchQuery) return true
  const query = searchQuery.toLowerCase()
  const nameMatch = dogNameMatchesQuery(dog.name_lat, dog.name_ru, searchQuery)
  const display = dog.breed ? displayBreed(dog.breed) : null
  const breedMatch = Boolean(
    (dog.breed && dog.breed.toLowerCase().includes(query)) ||
    (display?.primary && display.primary.toLowerCase().includes(query)) ||
    (display?.secondary && display.secondary.toLowerCase().includes(query))
  )
  const startsMatch = dog.total_starts && dog.total_starts.toString().includes(searchQuery)
  return !!(nameMatch || breedMatch || startsMatch)
}

function matchesMinStartsFilter(
  dog: { total_starts?: number },
  filterMinStarts: string
): boolean {
  if (filterMinStarts && (dog.total_starts ?? 0) < parseInt(filterMinStarts)) return false
  return true
}

/**
 * Computes breed-specific rank deltas for a given breed filter.
 * Uses precomputed `rank_delta_breed` if available on the items;
 * otherwise calculates dynamically from each dog's standings and global `rank_delta`.
 */
export function computeBreedDeltas<
  T extends {
    dog_id?: number
    id?: number
    breed?: string
    rank?: number
    rank_delta?: number | 'NEW' | null
    rank_delta_breed?: number | 'NEW' | null
  }
>(allDogs: T[], filterBreed: string): Map<number, number | 'NEW' | null> {
  const result = new Map<number, number | 'NEW' | null>()
  if (!filterBreed) return result

  // Filter allDogs to only dogs matching this breed
  const breedDogs = allDogs.filter((d) => matchesBreedFilter(d.breed, filterBreed))
  if (breedDogs.length === 0) return result

  // Check if any dog has precomputed rank_delta_breed from backend
  const hasPrecomputed = breedDogs.some(
    (d) => d.rank_delta_breed !== undefined && d.rank_delta_breed !== null
  )
  if (hasPrecomputed) {
    for (const d of breedDogs) {
      const id = d.dog_id ?? d.id
      if (id != null) {
        result.set(id, d.rank_delta_breed ?? null)
      }
    }
    return result
  }

  // Fallback: dynamic calculation from current all-breeds rank and global rank_delta
  const hasGlobalDeltas = breedDogs.some(
    (d) => d.rank_delta !== undefined && d.rank_delta !== null
  )
  if (!hasGlobalDeltas) {
    for (const d of breedDogs) {
      const id = d.dog_id ?? d.id
      if (id != null) result.set(id, null)
    }
    return result
  }

  // Build previous all-breeds standings to deduce previous breed rank
  const prevList: Array<{ id: number; prevAllRank: number }> = []
  breedDogs.forEach((dog, idx) => {
    const id = dog.dog_id ?? dog.id
    if (id == null) return

    const currentAllRank = dog.rank ?? (idx + 1)
    if (dog.rank_delta === 'NEW') {
      result.set(id, 'NEW')
    } else if (typeof dog.rank_delta === 'number') {
      const prevAllRank = currentAllRank + dog.rank_delta
      prevList.push({ id, prevAllRank })
    }
  })

  // Sort by prevAllRank ascending to determine prevBreedRank
  prevList.sort((a, b) => a.prevAllRank - b.prevAllRank)
  const prevBreedRankMap = new Map<number, number>()
  prevList.forEach((item, idx) => {
    prevBreedRankMap.set(item.id, idx + 1)
  })

  // Calculate breed delta: prevBreedRank - currentBreedRank
  breedDogs.forEach((dog, idx) => {
    const id = dog.dog_id ?? dog.id
    if (id == null) return

    if (dog.rank_delta === 'NEW') {
      result.set(id, 'NEW')
    } else if (prevBreedRankMap.has(id)) {
      const currentBreedRank = idx + 1
      const prevBreedRank = prevBreedRankMap.get(id)!
      result.set(id, prevBreedRank - currentBreedRank)
    } else {
      result.set(id, null)
    }
  })

  return result
}

export function filterCombinedRanking(
  dogs: CombinedRankingDog[],
  params: TopDogsFilterParams
): CombinedRankingDog[] {
  const isBreedActive = Boolean(params.filterBreed)
  const breedDeltas = isBreedActive ? computeBreedDeltas(dogs, params.filterBreed) : null

  const filtered = dogs.filter((dog) => {
    if (!matchesSearch(dog, params.searchQuery)) return false
    if (!matchesMinStartsFilter(dog, params.filterMinStarts)) return false
    if (!matchesBreedFilter(dog.breed, params.filterBreed)) return false

    if (params.filterScoreFrom) {
      const threshold = parseFloat(params.filterScoreFrom)
      const scoreValue = dog.rating_score ?? ratingScoreFromRow(dog as Record<string, unknown>)
      if (!scoreValue || scoreValue < threshold) return false
    }

    return true
  })

  // Re-rank after filters so #1 is first visible dog
  // If breed filter is active, use breed-specific rank delta; otherwise use global rank delta
  return filtered.map((dog, i) => {
    let delta = dog.rank_delta
    if (isBreedActive && breedDeltas) {
      delta = breedDeltas.has(dog.dog_id) ? breedDeltas.get(dog.dog_id)! : null
    }
    return {
      ...dog,
      rank: i + 1,
      rank_delta: delta,
    }
  })
}

export function filterSpeed<
  T extends {
    dog_id?: number
    id?: number
    name_lat?: string
    name_ru?: string
    breed?: string
    total_starts?: number
    best_speed?: number
    avg_speed?: number
    rank?: number
    rank_delta?: number | 'NEW' | null
    rank_delta_breed?: number | 'NEW' | null
  }
>(dogs: T[], params: TopDogsFilterParams): Array<T & { rank: number }> {
  const isBreedActive = Boolean(params.filterBreed)
  const breedDeltas = isBreedActive ? computeBreedDeltas(dogs, params.filterBreed) : null

  const filtered = dogs.filter((dog) => {
    if (!matchesSearch(dog, params.searchQuery)) return false
    if (!matchesMinStartsFilter(dog, params.filterMinStarts)) return false
    if (!matchesBreedFilter(dog.breed, params.filterBreed)) return false

    if (params.filterSpeedFrom) {
      const speedValue = dog.best_speed
      if (speedValue && speedValue < parseFloat(params.filterSpeedFrom)) return false
    }

    return true
  })

  // Re-rank after filters so #1 is first visible dog (same as combined)
  return filtered.map((dog, i) => {
    let delta = dog.rank_delta
    const id = dog.dog_id ?? dog.id
    if (isBreedActive && breedDeltas && id != null) {
      delta = breedDeltas.has(id) ? breedDeltas.get(id)! : null
    }
    return {
      ...dog,
      rank: i + 1,
      rank_delta: delta,
    }
  })
}

/** @deprecated — use filterCombinedRanking */
export function filterPlacement<
  T extends { name_lat?: string; name_ru?: string; breed?: string; total_starts?: number }
>(dogs: T[], params: Pick<TopDogsFilterParams, 'searchQuery' | 'filterMinStarts' | 'filterBreed'>): T[] {
  return dogs.filter((dog) => {
    if (!matchesSearch(dog, params.searchQuery)) return false
    if (!matchesMinStartsFilter(dog, params.filterMinStarts)) return false
    if (!matchesBreedFilter(dog.breed, params.filterBreed)) return false
    return true
  })
}

/** @deprecated — use filterCombinedRanking */
export function filterScore<
  T extends {
    name_lat?: string
    name_ru?: string
    breed?: string
    total_starts?: number
    best_score?: number
    best_judge_score?: number
    avg_judge_score?: number
  }
>(dogs: T[], params: TopDogsFilterParams): T[] {
  return dogs.filter((dog) => {
    if (!matchesSearch(dog, params.searchQuery)) return false
    if (!matchesMinStartsFilter(dog, params.filterMinStarts)) return false
    if (!matchesBreedFilter(dog.breed, params.filterBreed)) return false
    if (params.filterScoreFrom) {
      const threshold = parseFloat(params.filterScoreFrom)
      const scoreValue = ratingScoreFromRow(dog as Record<string, unknown>)
      if (!scoreValue || scoreValue < threshold) return false
    }
    return true
  })
}

/** @deprecated — use filterCombinedRanking */
export function filterElo<
  T extends {
    name_lat?: string
    name_ru?: string
    breed?: string
    elo_rating?: number | null
    elo_races?: number
    rank?: number
  }
>(dogs: T[], params: TopDogsFilterParams): T[] {
  const filtered = dogs.filter((dog) => {
    if (!matchesSearch(dog, params.searchQuery)) return false
    if (!matchesBreedFilter(dog.breed, params.filterBreed)) return false
    if (dog.elo_rating == null) return false
    return true
  })
  return [...filtered]
    .sort((a, b) => (b.elo_rating ?? 0) - (a.elo_rating ?? 0))
    .map((dog, i) => ({ ...dog, rank: i + 1 }))
}
