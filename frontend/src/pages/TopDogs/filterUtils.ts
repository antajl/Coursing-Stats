export interface TopDogsFilterParams {
  searchQuery: string
  filterMinStarts: string
  filterScoreFrom: string
  filterSpeedFrom: string
  filterBreed: string
}

import { dogNameMatchesQuery } from '../../lib/dogName'

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

function matchesBreedFilter(
  dog: { breed?: string },
  filterBreed: string
): boolean {
  if (!filterBreed) return true
  return dog.breed === filterBreed
}

export function filterPlacement<T extends { name_lat?: string; name_ru?: string; breed?: string; total_starts?: number }>(
  dogs: T[],
  params: Pick<TopDogsFilterParams, 'searchQuery' | 'filterMinStarts' | 'filterBreed'>
): T[] {
  return dogs.filter(dog => {
    if (!matchesSearch(dog, params.searchQuery)) return false
    if (!matchesMinStartsFilter(dog, params.filterMinStarts)) return false
    if (!matchesBreedFilter(dog, params.filterBreed)) return false
    return true
  })
}

export function filterScore<
  T extends {
    name_lat?: string
    name_ru?: string
    breed?: string
    total_starts?: number
    best_score?: number
    avg_score?: number
  }
>(dogs: T[], params: TopDogsFilterParams): T[] {
  return dogs.filter(dog => {
    if (!matchesSearch(dog, params.searchQuery)) return false
    if (!matchesMinStartsFilter(dog, params.filterMinStarts)) return false
    if (!matchesBreedFilter(dog, params.filterBreed)) return false

    if (params.filterScoreFrom) {
      const scoreValue = dog.best_score
      if (scoreValue && scoreValue < parseFloat(params.filterScoreFrom)) return false
    }

    return true
  })
}

export function filterSpeed<
  T extends {
    name_lat?: string
    name_ru?: string
    breed?: string
    total_starts?: number
    best_speed?: number
    avg_speed?: number
  }
>(dogs: T[], params: TopDogsFilterParams): T[] {
  return dogs.filter(dog => {
    if (!matchesSearch(dog, params.searchQuery)) return false
    if (!matchesMinStartsFilter(dog, params.filterMinStarts)) return false
    if (!matchesBreedFilter(dog, params.filterBreed)) return false

    if (params.filterSpeedFrom) {
      const speedValue = dog.best_speed
      if (speedValue && speedValue < parseFloat(params.filterSpeedFrom)) return false
    }

    return true
  })
}
