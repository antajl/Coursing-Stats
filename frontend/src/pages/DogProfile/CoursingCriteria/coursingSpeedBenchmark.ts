import { matchesBreedFilter } from '../../../lib/breedMapping'

export type SpeedMetricKind = 'avg' | 'best'

export interface ExtractedRacingSpeed {
  value: number
  kind: SpeedMetricKind
}

export interface DogSpeedBreedComparison {
  dogSpeed: number
  breedAvg: number
  breedMaxSpeed: number
  delta: number
  kind: SpeedMetricKind
  peerCount: number
  fillPct: number
  breedMarkerPct: number
}

function toPositiveNumber(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  const num = typeof raw === 'number' ? raw : Number(String(raw).replace(',', '.'))
  return Number.isFinite(num) && num > 0 ? num : null
}

/** Извлекает скорость собаки строго из спортивного рейсинга (racing_stats), без Донино. */
export function extractDogRacingSpeed(
  racingStats?: Record<string, unknown> | null,
): ExtractedRacingSpeed | null {
  if (!racingStats) return null
  const avg = toPositiveNumber(racingStats.avg_speed)
  if (avg !== null) return { value: avg, kind: 'avg' }
  const best = toPositiveNumber(racingStats.best_speed)
  if (best !== null) return { value: best, kind: 'best' }
  return null
}

function clamp0100(value: number): number {
  return Math.max(0, Math.min(100, value))
}

/**
 * Считает сравнение скорости собаки в бегах со средним значением по её канонической породе
 * на базе индекса indexes/top-speed-all.json (за все года).
 * За 100% шкалы берётся максимальная скорость среди всех представителей данной породы.
 */
export function computeDogSpeedBreedComparison({
  racingStats,
  breed,
  dogId,
  items,
}: {
  racingStats?: Record<string, unknown> | null
  breed: string
  dogId?: string | number
  items?: Record<string, unknown>[]
}): DogSpeedBreedComparison | null {
  const extracted = extractDogRacingSpeed(racingStats)
  if (!extracted || !breed.trim() || !items?.length) return null

  const field = extracted.kind === 'best' ? 'best_speed' : 'avg_speed'
  const selfId = dogId !== undefined && dogId !== null && dogId !== '' ? Number(dogId) : null
  const selfBest = toPositiveNumber(racingStats?.best_speed) ?? extracted.value

  const peers: number[] = []
  let breedMaxSpeed = Math.max(extracted.value, selfBest)

  for (const row of items) {
    if (!matchesBreedFilter(String(row.breed ?? ''), breed)) continue

    const rowMax = toPositiveNumber(row.best_speed) ?? toPositiveNumber(row.avg_speed)
    if (rowMax !== null && rowMax > breedMaxSpeed) {
      breedMaxSpeed = rowMax
    }

    const rowId = toPositiveNumber(row.dog_id)
    if (selfId !== null && Number.isFinite(selfId) && rowId === selfId) continue
    const peerSpeed = toPositiveNumber(row[field])
    if (peerSpeed !== null) peers.push(peerSpeed)
  }

  // Минимум 2 другие собаки породы, чтобы не сравнивать с единичным шумом
  if (peers.length < 2 || breedMaxSpeed <= 0) return null

  const sum = peers.reduce((acc, v) => acc + v, 0)
  const breedAvg = sum / peers.length
  const delta = extracted.value - breedAvg

  return {
    dogSpeed: extracted.value,
    breedAvg,
    breedMaxSpeed,
    delta,
    kind: extracted.kind,
    peerCount: peers.length,
    fillPct: clamp0100((extracted.value / breedMaxSpeed) * 100),
    breedMarkerPct: clamp0100((breedAvg / breedMaxSpeed) * 100),
  }
}
