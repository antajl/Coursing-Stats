import { matchesBreedFilter } from '../../../lib/breedMapping'

export type SpeedMetricKind = 'avg' | 'best'

export interface ExtractedRacingSpeed {
  value: number
  kind: SpeedMetricKind
}

export interface DogSpeedBreedComparison {
  dogSpeed: number
  bestSpeed: number
  breedAvg: number
  breedMaxSpeed: number
  delta: number
  kind: SpeedMetricKind
  peerCount: number
  fillPct: number
  breedMarkerPct: number
  run1Speed: number | null
  run2Speed: number | null
  run3Speed: number | null
  firstRunSpeed: number | null
  lastRunSpeed: number | null
  lastHeatMax: number | null
  breedLastAvg: number | null
  breedLastMax: number | null
  breedLastPeerCount: number | null
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

export function clampSpeedPct(value: number, maxSpeed: number): number {
  if (maxSpeed <= 0) return 0
  return Math.max(0, Math.min(100, (value / maxSpeed) * 100))
}

/**
 * Считает сравнение скорости собаки в бегах со средним по канонической породе за все годы
 * и парное сравнение 1-го и последнего забега (2-го при 2 кругах или 3-го при 3 кругах).
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
  const run1Speed = toPositiveNumber(racingStats?.run1_avg_speed)
  const run2Speed = toPositiveNumber(racingStats?.run2_avg_speed)
  const run3Speed = toPositiveNumber(racingStats?.run3_avg_speed)
  const firstRunSpeed = toPositiveNumber(racingStats?.first_avg_speed) ?? run1Speed
  const lastRunSpeed = toPositiveNumber(racingStats?.last_avg_speed) ?? run3Speed ?? run2Speed
  const lastHeatMax =
    toPositiveNumber(racingStats?.last_heat_max) ?? (run3Speed != null ? 3 : run2Speed != null ? 2 : null)
  const breedLastAvg = toPositiveNumber(racingStats?.breed_last_avg_speed)
  const breedLastMax = toPositiveNumber(racingStats?.breed_last_max_speed)
  const breedLastPeerCount = toPositiveNumber(racingStats?.breed_last_peer_count)

  const peers: number[] = []
  // Потолок шкалы совпадает по метрике с основным баром (макс. avg_speed по породе или best_speed)
  let breedMaxSpeed = extracted.value

  for (const row of items) {
    if (!matchesBreedFilter(String(row.breed ?? ''), breed)) continue

    const rowScaleVal = toPositiveNumber(row[field])
    if (rowScaleVal !== null && rowScaleVal > breedMaxSpeed) {
      breedMaxSpeed = rowScaleVal
    }

    const rowId = toPositiveNumber(row.dog_id)
    if (selfId !== null && Number.isFinite(selfId) && rowId === selfId) continue
    if (rowScaleVal !== null) peers.push(rowScaleVal)
  }

  // Минимум 2 другие собаки породы, чтобы не сравнивать с единичным шумом
  if (peers.length < 2 || breedMaxSpeed <= 0) return null

  const sum = peers.reduce((acc, v) => acc + v, 0)
  const breedAvg = sum / peers.length
  const delta = extracted.value - breedAvg

  return {
    dogSpeed: extracted.value,
    bestSpeed: selfBest,
    breedAvg,
    breedMaxSpeed,
    delta,
    kind: extracted.kind,
    peerCount: peers.length,
    fillPct: clampSpeedPct(extracted.value, breedMaxSpeed),
    breedMarkerPct: clampSpeedPct(breedAvg, breedMaxSpeed),
    run1Speed,
    run2Speed,
    run3Speed,
    firstRunSpeed,
    lastRunSpeed,
    lastHeatMax,
    breedLastAvg,
    breedLastMax,
    breedLastPeerCount,
  }
}

export function hasLastRoundSpeedBenchmark(comparison: DogSpeedBreedComparison): boolean {
  return (
    comparison.lastRunSpeed != null &&
    comparison.breedLastAvg != null &&
    comparison.breedLastMax != null
  )
}

/** Краткий вывод по скорости в бегах относительно своей породы для нижней строки блока. */
export function formatSpeedInsight(
  comparison: DogSpeedBreedComparison,
  mode: 'breed' | 'rounds' = 'breed',
): string {
  const isLastRound = mode === 'rounds' && hasLastRoundSpeedBenchmark(comparison)
  const speed = isLastRound ? comparison.lastRunSpeed! : comparison.dogSpeed
  const delta = isLastRound
    ? comparison.lastRunSpeed! - comparison.breedLastAvg!
    : comparison.delta

  const speedStr = `${speed.toFixed(1)} км/ч`
  const roundedDelta = Math.round(delta * 10) / 10
  const deltaStr =
    Math.abs(roundedDelta) < 0.2
      ? 'на уровне породы'
      : `${roundedDelta > 0 ? `+${roundedDelta.toFixed(1)}` : roundedDelta.toFixed(1)} к породе`

  const bestPart =
    !isLastRound &&
    comparison.kind === 'avg' &&
    comparison.bestSpeed > comparison.dogSpeed &&
    comparison.bestSpeed.toFixed(1) !== comparison.dogSpeed.toFixed(1)
      ? `, лучшая ${comparison.bestSpeed.toFixed(1)}`
      : ''

  return `${speedStr} (${deltaStr}${bestPart})`
}
