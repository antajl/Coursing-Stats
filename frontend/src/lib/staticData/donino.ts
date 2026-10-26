import { type ApiResult, fetchJson } from './core'

interface DoninoFile {
  records?: Record<string, unknown>[]
}

function filterDoninoRecords(
  records: Record<string, unknown>[],
  opts: {
    breed?: string
    sex?: string
    search?: string
    year?: string
    dogId?: string
    limit: number
    sortKey: string
    sortAsc?: boolean
  },
): Record<string, unknown>[] {
  let rows = records

  if (opts.dogId) rows = rows.filter((r) => String(r.dog_id ?? '') === opts.dogId)
  if (opts.breed) rows = rows.filter((r) => r.breed === opts.breed)
  if (opts.sex) rows = rows.filter((r) => r.sex === opts.sex)
  if (opts.year) rows = rows.filter((r) => String(r.date ?? '').includes(`.${opts.year}`))
  if (opts.search) {
    const q = opts.search.toLowerCase()
    rows = rows.filter(
      (r) =>
        String(r.name ?? '').toLowerCase().includes(q) ||
        String(r.breed ?? '').toLowerCase().includes(q) ||
        String(r.date ?? '').toLowerCase().includes(q) ||
        (Array.isArray(r.aliases) && (r.aliases as string[]).some((a) => String(a).toLowerCase().includes(q))),
    )
  }

  rows = [...rows].sort((a, b) => {
    const av = Number(a[opts.sortKey] ?? 0)
    const bv = Number(b[opts.sortKey] ?? 0)
    return opts.sortAsc ? av - bv : bv - av
  })

  return rows.slice(0, opts.limit)
}

async function loadDoninoSpeedRecords(): Promise<Record<string, unknown>[]> {
  const file = await fetchJson<DoninoFile>('donino/speed_records.json')
  return file?.records ?? []
}

async function loadDoninoCoursingRecords(): Promise<Record<string, unknown>[]> {
  const file = await fetchJson<DoninoFile>('donino/coursing_records.json')
  return file?.records ?? []
}

export async function getSpeedRecords(
  breed = '',
  sex = '',
  limit = 100,
  search = '',
  year = '',
  dogId = '',
): Promise<ApiResult<Record<string, unknown>[]>> {
  const records = await loadDoninoSpeedRecords()
  const filtered = filterDoninoRecords(records, {
    breed,
    sex,
    search,
    year,
    dogId,
    limit,
    sortKey: 'speed_km_h',
  })
  return { success: true, data: filtered }
}

export async function getCoursingRecords(
  breed = '',
  limit = 100,
  search = '',
  year = '',
  dogId = '',
): Promise<ApiResult<Record<string, unknown>[]>> {
  const records = await loadDoninoCoursingRecords()
  const filtered = filterDoninoRecords(records, {
    breed,
    search,
    year,
    dogId,
    limit,
    sortKey: 'time_seconds',
    sortAsc: true,
  })
  return { success: true, data: filtered }
}

function pickTopSpeedByBreed(records: Record<string, unknown>[], limit: number): Record<string, unknown>[] {
  const bestByBreed = new Map<string, Record<string, unknown>>()
  for (const record of records) {
    const speed = Number(record.speed_km_h)
    const breed = String(record.breed ?? '')
    const existing = bestByBreed.get(breed)
    if (!existing || speed > Number(existing.speed_km_h)) bestByBreed.set(breed, record)
  }
  return [...bestByBreed.values()].sort((a, b) => Number(b.speed_km_h) - Number(a.speed_km_h)).slice(0, limit)
}

function pickTopCoursingByBreed(
  records: Record<string, unknown>[],
  limit: number,
): Record<string, unknown>[] {
  const bestByBreed = new Map<string, Record<string, unknown>>()
  for (const record of records) {
    const time = Number(record.time_seconds)
    const breed = String(record.breed ?? '')
    const existing = bestByBreed.get(breed)
    if (!existing || time < Number(existing.time_seconds)) bestByBreed.set(breed, record)
  }
  return [...bestByBreed.values()]
    .sort((a, b) => Number(a.time_seconds) - Number(b.time_seconds))
    .slice(0, limit)
}

export async function getSpeedRecordsTopByBreed(
  limit = 3,
): Promise<ApiResult<Record<string, unknown>[]>> {
  const records = await loadDoninoSpeedRecords()
  return { success: true, data: pickTopSpeedByBreed(records, limit) }
}

export async function getCoursingRecordsTopByBreed(
  limit = 3,
): Promise<ApiResult<Record<string, unknown>[]>> {
  const records = await loadDoninoCoursingRecords()
  return { success: true, data: pickTopCoursingByBreed(records, limit) }
}

export async function getDoninoDog(
  name: string,
  breed: string,
): Promise<ApiResult<Record<string, unknown>>> {
  if (!name || !breed) return { success: false, error: 'Name and breed are required' }

  const [allSpeed, allCoursing] = await Promise.all([
    loadDoninoSpeedRecords(),
    loadDoninoCoursingRecords(),
  ])

  const normName = String(name || '').trim().toLowerCase()
  const normBreed = String(breed || '').trim().toLowerCase()
  const matchesDog = (r: Record<string, unknown>) => {
    if (String(r.breed ?? '').trim().toLowerCase() !== normBreed) return false;
    if (String(r.name ?? '').trim().toLowerCase() === normName) return true;
    if (Array.isArray(r.aliases) && (r.aliases as string[]).some((a) => String(a).trim().toLowerCase() === normName)) return true;
    return false;
  };
  const speedRecords = allSpeed.filter(matchesDog);
  const coursingRecords = allCoursing.filter(matchesDog);

  const allSpeedRuns: number[] = []
  for (const r of speedRecords) {
    if (Number(r.speed_km_h) > 0) allSpeedRuns.push(Number(r.speed_km_h))
    if (Array.isArray(r.history)) {
      for (const h of r.history as { speed_km_h?: unknown }[]) {
        if (Number(h.speed_km_h) > 0) allSpeedRuns.push(Number(h.speed_km_h))
      }
    }
  }

  const speedStats = {
    total: allSpeedRuns.length,
    bestSpeed: allSpeedRuns.length > 0 ? Math.max(...allSpeedRuns) : 0,
    avgSpeed:
      allSpeedRuns.length > 0
        ? allSpeedRuns.reduce((sum, v) => sum + v, 0) / allSpeedRuns.length
        : 0,
  }

  const allCoursingRuns: number[] = []
  for (const r of coursingRecords) {
    if (Number(r.time_seconds) > 0) allCoursingRuns.push(Number(r.time_seconds))
    if (Array.isArray(r.history)) {
      for (const h of r.history as { time_seconds?: unknown }[]) {
        if (Number(h.time_seconds) > 0) allCoursingRuns.push(Number(h.time_seconds))
      }
    }
  }

  const coursingStats = {
    total: allCoursingRuns.length,
    bestTime:
      allCoursingRuns.length > 0 ? Math.min(...allCoursingRuns) : 0,
    avgTime:
      allCoursingRuns.length > 0
        ? allCoursingRuns.reduce((sum, v) => sum + v, 0) / allCoursingRuns.length
        : 0,
  }

  let speedBreedRank = 0
  let speedBreedTotal = 0
  let speedPercentile = 0
  if (speedStats.bestSpeed > 0) {
    const byName = new Map<string, number>()
    for (const r of allSpeed) {
      if (r.breed !== breed || !(Number(r.speed_km_h) > 0)) continue
      const key = String(r.name ?? '')
      const speed = Number(r.speed_km_h)
      if (!byName.has(key) || speed > byName.get(key)!) byName.set(key, speed)
    }
    const sortedSpeeds = [...byName.values()].sort((a, b) => b - a)
    speedBreedTotal = sortedSpeeds.length
    const rank = sortedSpeeds.findIndex((s) => s === speedStats.bestSpeed)
    speedBreedRank = rank >= 0 ? rank + 1 : 0
    speedPercentile =
      speedBreedTotal > 0 ? ((speedBreedTotal - speedBreedRank) / speedBreedTotal) * 100 : 0
  }

  let coursingBreedRank = 0
  let coursingBreedTotal = 0
  let coursingPercentile = 0
  if (coursingStats.bestTime > 0) {
    const byName = new Map<string, number>()
    for (const r of allCoursing) {
      if (r.breed !== breed || !(Number(r.time_seconds) > 0)) continue
      const key = String(r.name ?? '')
      const time = Number(r.time_seconds)
      if (!byName.has(key) || time < byName.get(key)!) byName.set(key, time)
    }
    const sortedTimes = [...byName.values()].sort((a, b) => a - b)
    coursingBreedTotal = sortedTimes.length
    const rank = sortedTimes.findIndex((t) => t === coursingStats.bestTime)
    coursingBreedRank = rank >= 0 ? rank + 1 : 0
    coursingPercentile =
      coursingBreedTotal > 0
        ? ((coursingBreedTotal - coursingBreedRank) / coursingBreedTotal) * 100
        : 0
  }

  const sex = speedRecords.find((r) => r.sex)?.sex ?? null;
  const dogId = (speedRecords.find((r) => r.dog_id)?.dog_id) ?? (coursingRecords.find((r) => r.dog_id)?.dog_id) ?? null;
  const canonicalName = String(speedRecords[0]?.name ?? coursingRecords[0]?.name ?? name);
  const aliases = (speedRecords.find((r) => Array.isArray(r.aliases))?.aliases ?? coursingRecords.find((r) => Array.isArray(r.aliases))?.aliases ?? []) as string[];

  return {
    success: true,
    data: {
      name: canonicalName,
      aliases,
      breed,
      sex,
      dog_id: dogId,
      speedRecords,
      coursingRecords,
      speedStats: {
        ...speedStats,
        breedRank: speedBreedRank,
        breedTotal: speedBreedTotal,
        percentile: speedPercentile,
      },
      coursingStats: {
        ...coursingStats,
        breedRank: coursingBreedRank,
        breedTotal: coursingBreedTotal,
        percentile: coursingPercentile,
      },
    },
  }
}
