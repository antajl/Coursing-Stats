export interface TopDogsFilterParams {
  searchQuery: string
  filterStartsFrom: string
  filterStartsTo: string
  filterScoreFrom: string
  filterScoreTo: string
  filterScoreType: string
  filterSpeedFrom: string
  filterSpeedTo: string
  filterSpeedType: string
}

import { dogNameSearchText } from '../../lib/dogName'

function matchesSearch(
  dog: { name_lat?: string; name_ru?: string; breed?: string; total_starts?: number },
  searchQuery: string
): boolean {
  if (!searchQuery) return true
  const query = searchQuery.toLowerCase()
  const nameMatch = dogNameSearchText(dog.name_lat, dog.name_ru).toLowerCase().includes(query)
  const breedMatch = dog.breed && dog.breed.toLowerCase().includes(query)
  const startsMatch = dog.total_starts && dog.total_starts.toString().includes(query)
  return !!(nameMatch || breedMatch || startsMatch)
}

function matchesStartsFilter(
  dog: { total_starts?: number },
  filterStartsFrom: string,
  filterStartsTo: string
): boolean {
  if (filterStartsFrom && (dog.total_starts ?? 0) < parseInt(filterStartsFrom)) return false
  if (filterStartsTo && (dog.total_starts ?? 0) > parseInt(filterStartsTo)) return false
  return true
}

export function filterPlacement<T extends { name_lat?: string; name_ru?: string; breed?: string; total_starts?: number }>(
  dogs: T[],
  params: Pick<TopDogsFilterParams, 'searchQuery' | 'filterStartsFrom' | 'filterStartsTo'>
): T[] {
  return dogs.filter(dog => {
    if (!matchesSearch(dog, params.searchQuery)) return false
    if (!matchesStartsFilter(dog, params.filterStartsFrom, params.filterStartsTo)) return false
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
    if (!matchesStartsFilter(dog, params.filterStartsFrom, params.filterStartsTo)) return false

    if (params.filterScoreFrom || params.filterScoreTo) {
      const scoreValue = params.filterScoreType === 'best' ? dog.best_score : dog.avg_score
      if (params.filterScoreFrom && (scoreValue ?? 0) < parseFloat(params.filterScoreFrom)) return false
      if (params.filterScoreTo && (scoreValue ?? 0) > parseFloat(params.filterScoreTo)) return false
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
    if (!matchesStartsFilter(dog, params.filterStartsFrom, params.filterStartsTo)) return false

    if (params.filterSpeedFrom || params.filterSpeedTo) {
      const speedValue = params.filterSpeedType === 'best' ? dog.best_speed : dog.avg_speed
      if (params.filterSpeedFrom && (speedValue ?? 0) < parseFloat(params.filterSpeedFrom)) return false
      if (params.filterSpeedTo && (speedValue ?? 0) > parseFloat(params.filterSpeedTo)) return false
    }

    return true
  })
}
