import { dogNameMatchesQuery } from '../../lib/dogName'
import { ratingScoreFromRow } from '../../../../backend/lib/rating/coursing-rating-score'
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
  const breedMatch = dog.breed && dog.breed.toLowerCase().includes(query)
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

function matchesBreedFilter(dog: { breed?: string }, filterBreed: string): boolean {
  if (!filterBreed) return true
  return dog.breed === filterBreed
}

export function filterCombinedRanking(
  dogs: CombinedRankingDog[],
  params: TopDogsFilterParams
): CombinedRankingDog[] {
  const filtered = dogs.filter((dog) => {
    if (!matchesSearch(dog, params.searchQuery)) return false
    if (!matchesMinStartsFilter(dog, params.filterMinStarts)) return false
    if (!matchesBreedFilter(dog, params.filterBreed)) return false

    if (params.filterScoreFrom) {
      const threshold = parseFloat(params.filterScoreFrom)
      const scoreValue = dog.rating_score ?? ratingScoreFromRow(dog as Record<string, unknown>)
      if (!scoreValue || scoreValue < threshold) return false
    }

    return true
  })

  // Re-rank after filters so #1 is first visible dog
  return filtered.map((dog, i) => ({ ...dog, rank: i + 1 }))
}

export function filterSpeed<
  T extends {
    name_lat?: string
    name_ru?: string
    breed?: string
    total_starts?: number
    best_speed?: number
    avg_speed?: number
    rank?: number
  }
>(dogs: T[], params: TopDogsFilterParams): Array<T & { rank: number }> {
  const filtered = dogs.filter((dog) => {
    if (!matchesSearch(dog, params.searchQuery)) return false
    if (!matchesMinStartsFilter(dog, params.filterMinStarts)) return false
    if (!matchesBreedFilter(dog, params.filterBreed)) return false

    if (params.filterSpeedFrom) {
      const speedValue = dog.best_speed
      if (speedValue && speedValue < parseFloat(params.filterSpeedFrom)) return false
    }

    return true
  })

  // Re-rank after filters so #1 is first visible dog (same as combined)
  return filtered.map((dog, i) => ({ ...dog, rank: i + 1 }))
}

/** @deprecated — use filterCombinedRanking */
export function filterPlacement<
  T extends { name_lat?: string; name_ru?: string; breed?: string; total_starts?: number }
>(dogs: T[], params: Pick<TopDogsFilterParams, 'searchQuery' | 'filterMinStarts' | 'filterBreed'>): T[] {
  return dogs.filter((dog) => {
    if (!matchesSearch(dog, params.searchQuery)) return false
    if (!matchesMinStartsFilter(dog, params.filterMinStarts)) return false
    if (!matchesBreedFilter(dog, params.filterBreed)) return false
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
    if (!matchesBreedFilter(dog, params.filterBreed)) return false
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
    if (!matchesBreedFilter(dog, params.filterBreed)) return false
    if (dog.elo_rating == null) return false
    return true
  })
  return [...filtered]
    .sort((a, b) => (b.elo_rating ?? 0) - (a.elo_rating ?? 0))
    .map((dog, i) => ({ ...dog, rank: i + 1 }))
}
