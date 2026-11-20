import { parseRecordDate, time350ToSpeedKmh } from './recordDates'

export interface AnnualDoninoLeader {
  year: number
  name: string
  breed: string
  sex?: string
  runsCount: number
  bestSpeed: number
  timeSeconds?: number
  trackType?: string
  bestDate?: string
  dog_id?: number
}

/**
 * Вычисляет лучшую собаку года в полигоне Донино (по максимальной скорости в км/ч)
 * на основе совмещения радарных замеров (speed_records) и забегов 350 м (coursing_records).
 */
export function computeDoninoAnnualLeaders(
  speedList: any[] | { records?: any[] } | undefined,
  coursingList: any[] | { records?: any[] } | undefined,
): AnnualDoninoLeader[] {
  const speeds: any[] = Array.isArray(speedList)
    ? speedList
    : Array.isArray((speedList as any)?.records)
    ? (speedList as any).records
    : []

  const coursings: any[] = Array.isArray(coursingList)
    ? coursingList
    : Array.isArray((coursingList as any)?.records)
    ? (coursingList as any).records
    : []

  // Map: year -> Map: normalized dog name -> AnnualDoninoLeader
  const yearMaps = new Map<number, Map<string, AnnualDoninoLeader>>()

  function registerRun(
    name: string | undefined,
    sex: string | undefined,
    breed: string | undefined,
    rawDate: string | number | undefined,
    speed: number | undefined,
    trackType: string | undefined,
    timeSeconds: number | undefined,
    dogId: number | undefined,
  ) {
    if (!name || !speed || speed <= 0) return
    const parsedDate = parseRecordDate(rawDate)
    const year = parsedDate ? parsedDate.getFullYear() : null
    if (!year) return

    if (!yearMaps.has(year)) {
      yearMaps.set(year, new Map())
    }
    const dogsInYear = yearMaps.get(year)!
    const norm = name.trim().toLowerCase()
    if (!norm) return

    if (!dogsInYear.has(norm)) {
      dogsInYear.set(norm, {
        year,
        name: name.trim(),
        breed: breed || '',
        sex: sex || '',
        runsCount: 0,
        bestSpeed: 0,
        trackType: trackType || 'прямая',
        bestDate: typeof rawDate === 'string' ? rawDate : undefined,
        timeSeconds,
        dog_id: dogId,
      })
    }

    const d = dogsInYear.get(norm)!
    d.runsCount += 1
    if (speed > d.bestSpeed) {
      d.bestSpeed = speed
      d.trackType = trackType || 'прямая'
      d.bestDate = typeof rawDate === 'string' ? rawDate : undefined
      if (timeSeconds) d.timeSeconds = timeSeconds
    }
    if (dogId && !d.dog_id) d.dog_id = dogId
    if (sex && !d.sex) d.sex = sex
  }

  // 1. Радарные замеры скорости (speed_records)
  for (const s of speeds) {
    registerRun(
      s.name,
      s.sex,
      s.breed,
      s.date,
      s.speed_km_h,
      s.track_type || 'прямая',
      undefined,
      s.dog_id,
    )
    if (Array.isArray(s.history)) {
      for (const h of s.history) {
        registerRun(
          s.name,
          s.sex,
          s.breed,
          h.date,
          h.speed_km_h,
          h.track_type || s.track_type || 'прямая',
          undefined,
          s.dog_id,
        )
      }
    }
  }

  // 2. Бега 350 м с секундомером (coursing_records)
  for (const c of coursings) {
    const sp = c.time_seconds ? time350ToSpeedKmh(c.time_seconds) : 0
    registerRun(c.name, c.sex, c.breed, c.date, sp, '350 м', c.time_seconds, c.dog_id)
    if (Array.isArray(c.history)) {
      for (const h of c.history) {
        const hsp = h.time_seconds ? time350ToSpeedKmh(h.time_seconds) : 0
        registerRun(c.name, c.sex, c.breed, h.date, hsp, '350 м', h.time_seconds, c.dog_id)
      }
    }
  }

  const result: AnnualDoninoLeader[] = []
  const sortedYears = Array.from(yearMaps.keys()).sort((a, b) => b - a)
  for (const y of sortedYears) {
    const dogs = Array.from(yearMaps.get(y)!.values()).sort(
      (a, b) => b.bestSpeed - a.bestSpeed,
    )
    if (dogs.length > 0) {
      result.push(dogs[0])
    }
  }
  return result
}
