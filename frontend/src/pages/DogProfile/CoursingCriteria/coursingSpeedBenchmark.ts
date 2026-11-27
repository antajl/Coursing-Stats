import { matchesBreedFilter } from '../../../lib/breedMapping'

export type SpeedMetricKind = 'avg' | 'best'

export interface ExtractedRacingSpeed {
  value: number
  kind: SpeedMetricKind
}

export interface DogSpeedBreedComparison {
  dogSpeed: number
  breedAvg: number
  delta: number
  kind: SpeedMetricKind
  peerCount: number
  scaleMin: number
  scaleMax: number
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

function clampPct(value: number): number {
  return Math.max(8, Math.min(96, value))
}

/**
 * Считает сравнение скорости собаки в бегах со средним значением по её канонической породе
 * на базе индекса indexes/top-speed-all.json (с исключением самой собаки из среднего, если коллег >= 2).
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

  const peers: number[] = []
  for (const row of items) {
    if (!matchesBreedFilter(String(row.breed ?? ''), breed)) continue
    const rowId = toPositiveNumber(row.dog_id)
    if (selfId !== null && Number.isFinite(selfId) && rowId === selfId) continue
    const peerSpeed = toPositiveNumber(row[field])
    if (peerSpeed !== null) peers.push(peerSpeed)
  }

  // Минимум 2 другие собаки породы, чтобы не сравнивать с единичным шумом
  if (peers.length < 2) return null

  const sum = peers.reduce((acc, v) => acc + v, 0)
  const breedAvg = sum / peers.length
  const delta = extracted.value - breedAvg

  const allValues = [...peers, extracted.value]
  const rawMin = Math.min(...allValues)
  const rawMax = Math.max(...allValues)
  const span = rawMax - rawMin
  const pad = Math.max(2.5, span * 0.14)
  const scaleMin = Math.floor((rawMin - pad) * 2) / 2
  const scaleMax = Math.max(scaleMin + 6, Math.ceil((rawMax + pad) * 2) / 2)
  const range = scaleMax - scaleMin

  return {
    dogSpeed: extracted.value,
    breedAvg,
    delta,
    kind: extracted.kind,
    peerCount: peers.length,
    scaleMin,
    scaleMax,
    fillPct: clampPct(((extracted.value - scaleMin) / range) * 100),
    breedMarkerPct: clampPct(((breedAvg - scaleMin) / range) * 100),
  }
}
