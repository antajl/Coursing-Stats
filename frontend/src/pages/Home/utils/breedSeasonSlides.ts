import { canonicalBreed, displayBreed } from '../../../lib/breedMapping'

/** Породы без смысла для ротации «популярных» на главной. */
const SKIP_BREEDS = new Set([
  'БЕЗ ПОРОДЫ',
  'МЕТИС',
  'НЕИЗВЕСТНО',
  'UNKNOWN',
  '',
])

export type BreedSlide<T> = {
  breedKey: string
  breedLabel: string
  dogCount: number
  dogs: T[]
}

/** @deprecated alias — competition slides */
export type BreedRankingSlide = BreedSlide<import('../../TopDogs/mergeCombinedRanking').CombinedRankingDog>

function breedKeyOf(breed: string | undefined | null): string {
  return canonicalBreed(breed || '') || (breed || '').trim().toUpperCase()
}

/**
 * Top N breeds by dog count; each slide keeps source order (already ranked)
 * and re-assigns display rank 1..k when `assignRank` is true.
 */
export function buildTopBreedSlidesFromRows<T extends { breed?: string; rank?: number }>(
  rows: T[],
  topBreeds = 5,
  dogsPerSlide = 3,
  assignRank = true,
): BreedSlide<T>[] {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const key = breedKeyOf(row.breed)
    if (!key || SKIP_BREEDS.has(key)) continue
    counts.set(key, (counts.get(key) || 0) + 1)
  }

  const rankedBreeds = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ru'))
    .slice(0, topBreeds)

  return rankedBreeds
    .map(([breedKey, dogCount]) => {
      const dogs = rows
        .filter((row) => breedKeyOf(row.breed) === breedKey)
        .slice(0, dogsPerSlide)
        .map((row, i) => (assignRank ? { ...row, rank: i + 1 } : row))

      return {
        breedKey,
        breedLabel: displayBreed(breedKey).primary || breedKey,
        dogCount,
        dogs,
      }
    })
    .filter((slide) => slide.dogs.length > 0)
}

/** Competition combined ranking → top breed slides. */
export function buildTopBreedSlides<T extends { breed?: string; rank?: number }>(
  combined: T[],
  topBreeds = 5,
  dogsPerSlide = 3,
): BreedSlide<T>[] {
  return buildTopBreedSlidesFromRows(combined, topBreeds, dogsPerSlide, true)
}
