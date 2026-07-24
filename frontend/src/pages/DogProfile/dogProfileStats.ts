import { dedupeByRecordDate, expandCoursingTimeline } from '../../lib/recordDates'

export const HISTORY_DEFAULT = 3

export function formatScore(v: unknown) {
  if (v === undefined || v === null || v === '') return '—'
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  // 97.00 → 97, 87.5 → 87.5, 50.52 → 50.52
  return String(parseFloat(n.toFixed(2)))
}

// Records come from static JSON as loosely typed objects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeedRecordLike = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CoursingRecordLike = any

export function computeSpeedStats(
  speedRecords: SpeedRecordLike[],
  breedRecords: SpeedRecordLike[],
) {
  const bestSpeed = Math.max(...speedRecords.map((r) => parseFloat(r.speed_km_h)))
  const avgSpeed =
    speedRecords.reduce((sum, r) => sum + parseFloat(r.speed_km_h), 0) / speedRecords.length
  const history = dedupeByRecordDate(
    speedRecords.map((r) => ({
      speed_km_h: parseFloat(r.speed_km_h),
      date: r.date,
    })),
    (candidate, existing) => candidate.speed_km_h > existing.speed_km_h,
  )

  const bestRecord = speedRecords.find((r) => parseFloat(r.speed_km_h) === bestSpeed)
  const screenshotUrl = bestRecord?.screenshot_url || null

  let breedRank = 0
  let breedTotal = 0
  let percentile = 0

  if (breedRecords.length > 0) {
    const dogBestSpeeds = new Map()
    breedRecords.forEach((r) => {
      const key = `${r.name}_${r.breed}`
      const currentBest = dogBestSpeeds.get(key)
      const speed = parseFloat(r.speed_km_h)
      if (!currentBest || speed > currentBest) {
        dogBestSpeeds.set(key, speed)
      }
    })

    const sortedSpeeds = Array.from(dogBestSpeeds.values()).sort((a, b) => b - a)
    breedTotal = sortedSpeeds.length

    const rank = sortedSpeeds.findIndex((s) => s === bestSpeed)
    if (rank !== -1) {
      breedRank = rank + 1
      percentile = Math.round((rank / breedTotal) * 100)
    }
  }

  return { bestSpeed, avgSpeed, history, screenshotUrl, breedRank, breedTotal, percentile }
}

export function computeCoursingDoninoStats(
  coursingRecords: CoursingRecordLike[],
  breedCoursingRecords: CoursingRecordLike[],
) {
  const bestTime = Math.min(...coursingRecords.map((r) => parseFloat(r.time_seconds)))
  const avgTime =
    coursingRecords.reduce((sum, r) => sum + parseFloat(r.time_seconds), 0) /
    coursingRecords.length
  const history = expandCoursingTimeline(
    coursingRecords.map((r) => ({
      time_seconds: r.time_seconds,
      date: r.date,
      history: r.history,
    })),
  )

  let breedRank = 0
  let breedTotal = 0
  let percentile = 0

  if (breedCoursingRecords.length > 0) {
    const dogBestTimes = new Map()
    breedCoursingRecords.forEach((r) => {
      const key = `${r.name}_${r.breed}`
      const currentBest = dogBestTimes.get(key)
      const time = parseFloat(r.time_seconds)
      if (!currentBest || time < currentBest) {
        dogBestTimes.set(key, time)
      }
    })

    const sortedTimes = Array.from(dogBestTimes.values()).sort((a, b) => a - b)
    breedTotal = sortedTimes.length

    const rank = sortedTimes.findIndex((t) => t === bestTime)
    if (rank !== -1) {
      breedRank = rank + 1
      percentile = Math.round((rank / breedTotal) * 100)
    }
  }

  return { bestTime, avgTime, history, breedRank, breedTotal, percentile }
}

export type SpeedStats = ReturnType<typeof computeSpeedStats>
export type CoursingDoninoStats = ReturnType<typeof computeCoursingDoninoStats>
