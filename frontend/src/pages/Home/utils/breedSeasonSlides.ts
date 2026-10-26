import { canonicalBreed, displayBreed } from '../../../lib/breedMapping'
import { computeBreedDeltas } from '../../TopDogs/filterUtils'

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
 * and re-assigns display rank 1..k and breed-specific rank delta when `assignRank` is true.
 */
export function buildTopBreedSlidesFromRows<
  T extends {
    breed?: string
    rank?: number
    rank_delta?: number | 'NEW' | null
    rank_delta_breed?: number | 'NEW' | null
    dog_id?: number
    id?: number
  }
>(
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
      const breedDeltas = assignRank ? computeBreedDeltas(rows, breedKey) : null
      const dogs = rows
        .filter((row) => breedKeyOf(row.breed) === breedKey)
        .slice(0, dogsPerSlide)
        .map((row, i) => {
          if (!assignRank) return row
          const id = row.dog_id ?? row.id
          const breedDelta =
            id != null && breedDeltas?.has(id)
              ? breedDeltas.get(id)
              : (row.rank_delta_breed ?? null)

          return {
            ...row,
            rank: i + 1,
            rank_delta: breedDelta,
          }
        })

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
export function buildTopBreedSlides<
  T extends {
    breed?: string
    rank?: number
    rank_delta?: number | 'NEW' | null
    rank_delta_breed?: number | 'NEW' | null
    dog_id?: number
    id?: number
  }
>(
  combined: T[],
  topBreeds = 5,
  dogsPerSlide = 3,
): BreedSlide<T>[] {
  return buildTopBreedSlidesFromRows(combined, topBreeds, dogsPerSlide, true)
}
