import { canonicalBreed, displayBreed } from '../../../lib/breedMapping'
import type { BreedSlide } from './breedSeasonSlides'
import type { SpeedRecord, CoursingRecord } from '../types'

export const TARGET_DONINO_BREEDS = [
  'УИППЕТ',
  'РУССКАЯ ПСОВАЯ БОРЗАЯ',
  'БАСЕНДЖИ',
  'САЛЮКИ',
  'РОДЕЗИЙСКИЙ РИДЖБЕК',
]

/**
 * Группирует замеры скорости Донино по каноническим породам,
 * оставляет лучший результат собаки и возвращает слайды для карусели.
 */
export function buildDoninoSpeedSlides(
  records: SpeedRecord[],
  targetBreeds = TARGET_DONINO_BREEDS,
  limitPerSlide = 3,
): BreedSlide<SpeedRecord>[] {
  return targetBreeds
    .map((targetBreed) => {
      const canonTarget = canonicalBreed(targetBreed)
      const matches = records.filter(
        (r) => canonicalBreed(r.breed) === canonTarget,
      )

      // Оставляем лучший замер скорости для каждой уникальной собаки
      const bestByName = new Map<string, SpeedRecord>()
      for (const r of matches) {
        const nameKey = (r.name || '').trim().toLowerCase()
        if (!nameKey) continue
        const sp = Number(r.speed_km_h || 0)
        const existing = bestByName.get(nameKey)
        if (!existing || sp > Number(existing.speed_km_h || 0)) {
          bestByName.set(nameKey, r)
        }
      }

      const allUniqueDogs = Array.from(bestByName.values()).sort(
        (a, b) => Number(b.speed_km_h || 0) - Number(a.speed_km_h || 0),
      )

      const dogs = allUniqueDogs.slice(0, limitPerSlide).map((d, i) => ({
        ...d,
        rank: i + 1,
      }))

      return {
        breedKey: targetBreed,
        breedLabel: displayBreed(targetBreed).primary || targetBreed,
        dogCount: allUniqueDogs.length,
        dogs,
      }
    })
    .filter((slide) => slide.dogs.length > 0)
}

/**
 * Группирует спринтерские бега 350 м Донино по каноническим породам,
 * оставляет лучшее (наименьшее) время собаки и возвращает слайды для карусели.
 */
export function buildDoninoCoursingSlides(
  records: CoursingRecord[],
  targetBreeds = TARGET_DONINO_BREEDS,
  limitPerSlide = 3,
): BreedSlide<CoursingRecord>[] {
  return targetBreeds
    .map((targetBreed) => {
      const canonTarget = canonicalBreed(targetBreed)
      const matches = records.filter(
        (r) => canonicalBreed(r.breed) === canonTarget,
      )

      // Оставляем лучшее (наименьшее) время для каждой уникальной собаки
      const bestByName = new Map<string, CoursingRecord>()
      for (const r of matches) {
        const nameKey = (r.name || '').trim().toLowerCase()
        const time = Number(r.time_seconds || 0)
        if (!nameKey || time <= 0) continue
        const existing = bestByName.get(nameKey)
        if (!existing || time < Number(existing.time_seconds || 999)) {
          bestByName.set(nameKey, r)
        }
      }

      const allUniqueDogs = Array.from(bestByName.values()).sort(
        (a, b) => Number(a.time_seconds || 0) - Number(b.time_seconds || 0),
      )

      const dogs = allUniqueDogs.slice(0, limitPerSlide).map((d, i) => ({
        ...d,
        rank: i + 1,
      }))

      return {
        breedKey: targetBreed,
        breedLabel: displayBreed(targetBreed).primary || targetBreed,
        dogCount: allUniqueDogs.length,
        dogs,
      }
    })
    .filter((slide) => slide.dogs.length > 0)
}
