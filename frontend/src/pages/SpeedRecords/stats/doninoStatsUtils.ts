import {
  coursingTimesToStats,
  dedupeSpeedRecords,
  getRecordYear,
  normalizeRecordDateIso,
  time350ToSpeedKmh,
} from '../../../lib/recordDates'
import type { GroupBy } from './constants'
import { MIN_SAMPLES_FOR_AVG } from './constants'

export interface SpeedRecordRow {
  name: string
  breed: string
  sex: string
  speed_km_h: number | string
  date: string | number
}

export interface CoursingRecordRow {
  name: string
  breed: string
  time_seconds: number | string
  date: string | number
}

export interface DogSpeedSummary {
  name: string
  breed: string
  sex?: string
  runCount: number
  bestSpeed: number
  avgSpeed: number
  bestDate?: string | number
}

export interface DogCoursingSummary {
  name: string
  breed: string
  runCount: number
  bestTime: number
  avgTime: number
  bestDate?: string | number
}

export interface GroupedRow {
  key: string
  label: string
  runCount: number
  dogCount: number
  avgPrimary: number | null
  bestPrimary: number | null
  recordHolder: string | null
  recordValue: string | null
  lowSample: boolean
  dogs: (DogSpeedSummary | DogCoursingSummary)[]
}

export function dedupeCoursingRecords<T extends CoursingRecordRow>(data: T[]): T[] {
  const seen = new Map<string, T>()
  for (const record of data) {
    const key = `${record.name}_${record.breed}_${record.time_seconds}_${normalizeRecordDateIso(record.date)}`
    if (!seen.has(key)) seen.set(key, record)
  }
  return [...seen.values()]
}

export function buildSexByDogMap(speedData: SpeedRecordRow[]): Map<string, string> {
  const sexByDog = new Map<string, string>()
  for (const record of speedData) {
    const key = `${record.name}_${record.breed}`
    if (!sexByDog.has(key)) sexByDog.set(key, record.sex)
  }
  return sexByDog
}

export function summarizeSpeedDogs(records: SpeedRecordRow[]): DogSpeedSummary[] {
  const byDog = new Map<string, DogSpeedSummary>()
  for (const r of records) {
    const key = `${r.name}_${r.breed}_${r.sex}`
    const speed = parseFloat(String(r.speed_km_h))
    if (!Number.isFinite(speed) || speed <= 0) continue
    const existing = byDog.get(key)
    if (!existing) {
      byDog.set(key, {
        name: r.name,
        breed: r.breed,
        sex: r.sex,
        runCount: 1,
        bestSpeed: speed,
        avgSpeed: speed,
        bestDate: r.date,
      })
      continue
    }
    existing.runCount += 1
    if (speed > existing.bestSpeed) {
      existing.bestSpeed = speed
      existing.bestDate = r.date
    }
  }
  for (const dog of byDog.values()) {
    const speeds = records
      .filter((r) => r.name === dog.name && r.breed === dog.breed && r.sex === dog.sex)
      .map((r) => parseFloat(String(r.speed_km_h)))
      .filter((s) => s > 0)
    dog.avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length
  }
  return [...byDog.values()].sort((a, b) => b.bestSpeed - a.bestSpeed)
}

export function summarizeCoursingDogs(records: CoursingRecordRow[]): DogCoursingSummary[] {
  const byDog = new Map<string, DogCoursingSummary>()
  for (const r of records) {
    const time = parseFloat(String(r.time_seconds))
    if (!Number.isFinite(time) || time <= 0) continue
    const key = `${r.name}_${r.breed}`
    const existing = byDog.get(key)
    if (!existing) {
      byDog.set(key, {
        name: r.name,
        breed: r.breed,
        runCount: 1,
        bestTime: time,
        avgTime: time,
        bestDate: r.date,
      })
      continue
    }
    existing.runCount += 1
    if (time < existing.bestTime) {
      existing.bestTime = time
      existing.bestDate = r.date
    }
  }
  for (const dog of byDog.values()) {
    const times = records
      .filter((r) => r.name === dog.name && r.breed === dog.breed)
      .map((r) => parseFloat(String(r.time_seconds)))
      .filter((t) => t > 0)
    dog.avgTime = times.reduce((a, b) => a + b, 0) / times.length
  }
  return [...byDog.values()].sort((a, b) => a.bestTime - b.bestTime)
}

function groupKeySpeed(record: SpeedRecordRow, groupBy: GroupBy): string {
  if (groupBy === 'breed') return record.breed
  if (groupBy === 'sex') return record.sex === 'С' ? 'Сука' : 'Кабель'
  return String(getRecordYear(record.date) ?? '')
}

function groupKeyCoursing(
  record: CoursingRecordRow,
  groupBy: GroupBy,
  sexByDog: Map<string, string>
): string {
  if (groupBy === 'breed') return record.breed
  if (groupBy === 'year') return String(getRecordYear(record.date) ?? '')
  const sex = sexByDog.get(`${record.name}_${record.breed}`)
  return sex === 'С' ? 'Сука' : sex === 'К' ? 'Кабель' : '—'
}

export function buildSpeedGroupedStats(records: SpeedRecordRow[], groupBy: GroupBy): GroupedRow[] {
  const groups = new Map<string, SpeedRecordRow[]>()
  for (const r of records) {
    const key = groupKeySpeed(r, groupBy)
    if (!key) continue
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(r)
  }

  return [...groups.entries()]
    .map(([label, groupRecords]) => {
      const dogs = summarizeSpeedDogs(groupRecords)
      const speeds = groupRecords.map((r) => parseFloat(String(r.speed_km_h))).filter((s) => s > 0)
      const avg = speeds.length >= MIN_SAMPLES_FOR_AVG
        ? speeds.reduce((a, b) => a + b, 0) / speeds.length
        : null
      const best = dogs[0] ?? null
      return {
        key: label,
        label,
        runCount: groupRecords.length,
        dogCount: dogs.length,
        avgPrimary: avg,
        bestPrimary: best?.bestSpeed ?? null,
        recordHolder: best?.name ?? null,
        recordValue: best ? `${best.bestSpeed.toFixed(1)} км/ч` : null,
        lowSample: speeds.length < MIN_SAMPLES_FOR_AVG,
        dogs,
      }
    })
    .sort((a, b) => (b.bestPrimary ?? 0) - (a.bestPrimary ?? 0))
}

export function buildCoursingGroupedStats(
  records: CoursingRecordRow[],
  groupBy: GroupBy,
  sexByDog: Map<string, string>
): GroupedRow[] {
  const groups = new Map<string, CoursingRecordRow[]>()
  for (const r of records) {
    const key = groupKeyCoursing(r, groupBy, sexByDog)
    if (!key || key === '—') continue
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(r)
  }

  return [...groups.entries()]
    .map(([label, groupRecords]) => {
      const dogs = summarizeCoursingDogs(groupRecords)
      const times = groupRecords.map((r) => parseFloat(String(r.time_seconds))).filter((t) => t > 0)
      const stats = times.length >= MIN_SAMPLES_FOR_AVG ? coursingTimesToStats(times) : null
      const best = dogs[0] ?? null
      return {
        key: label,
        label,
        runCount: groupRecords.length,
        dogCount: dogs.length,
        avgPrimary: stats?.avgTime350 ?? null,
        bestPrimary: best?.bestTime ?? null,
        recordHolder: best?.name ?? null,
        recordValue: best ? `${best.bestTime.toFixed(2)} сек` : null,
        lowSample: times.length < MIN_SAMPLES_FOR_AVG,
        dogs,
      }
    })
    .sort((a, b) => (a.bestPrimary ?? Infinity) - (b.bestPrimary ?? Infinity))
}

export function uniqueSpeedDogCount(records: SpeedRecordRow[]): number {
  return new Set(records.map((r) => `${r.name}_${r.breed}_${r.sex}`)).size
}

export function uniqueCoursingDogCount(records: CoursingRecordRow[]): number {
  return new Set(records.map((r) => `${r.name}_${r.breed}`)).size
}

export function filterSpeedRecords(
  records: SpeedRecordRow[],
  filters: {
    search: string
    years: string[]
    breeds: string[]
    sexes: string[]
    minSpeed: string
    maxSpeed: string
  }
): SpeedRecordRow[] {
  let filtered = records
  if (filters.search) {
    const q = filters.search.toLowerCase()
    filtered = filtered.filter((r) => r.name.toLowerCase().includes(q))
  }
  if (filters.years.length) {
    filtered = filtered.filter((r) => filters.years.includes(String(getRecordYear(r.date))))
  }
  if (filters.breeds.length) {
    filtered = filtered.filter((r) => filters.breeds.includes(r.breed))
  }
  if (filters.sexes.length) {
    filtered = filtered.filter((r) => filters.sexes.includes(r.sex))
  }
  if (filters.minSpeed) {
    const min = parseFloat(filters.minSpeed)
    filtered = filtered.filter((r) => parseFloat(String(r.speed_km_h)) >= min)
  }
  if (filters.maxSpeed) {
    const max = parseFloat(filters.maxSpeed)
    filtered = filtered.filter((r) => parseFloat(String(r.speed_km_h)) <= max)
  }
  return filtered
}

export function filterCoursingRecords(
  records: CoursingRecordRow[],
  filters: {
    search: string
    years: string[]
    breeds: string[]
    minTime: string
    maxTime: string
  }
): CoursingRecordRow[] {
  let filtered = records
  if (filters.search) {
    const q = filters.search.toLowerCase()
    filtered = filtered.filter((r) => r.name.toLowerCase().includes(q))
  }
  if (filters.years.length) {
    filtered = filtered.filter((r) => filters.years.includes(String(getRecordYear(r.date))))
  }
  if (filters.breeds.length) {
    filtered = filtered.filter((r) => filters.breeds.includes(r.breed))
  }
  if (filters.minTime) {
    const min = parseFloat(filters.minTime)
    filtered = filtered.filter((r) => parseFloat(String(r.time_seconds)) >= min)
  }
  if (filters.maxTime) {
    const max = parseFloat(filters.maxTime)
    filtered = filtered.filter((r) => parseFloat(String(r.time_seconds)) <= max)
  }
  return filtered
}

export function findExactDogName(records: { name: string }[], query: string): string | null {
  const q = query.trim().toLowerCase()
  if (!q) return null
  const match = records.find((r) => r.name.toLowerCase() === q)
  return match?.name ?? null
}

export { time350ToSpeedKmh, dedupeSpeedRecords }
