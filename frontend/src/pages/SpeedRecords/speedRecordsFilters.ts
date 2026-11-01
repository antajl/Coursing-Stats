import { formatRecordDate, getRecordYear, parseRecordDate } from '../../lib/recordDates'
import { matchesBreedFilter, canonicalBreed } from '../../lib/breedMapping'
import { computeDoninoDeltas } from './doninoRankDelta'
import type { DogsIndexEntry } from '../../lib/competingBreeds'

export interface SpeedFilterOptions {
  filterYears: string[]
  filterBreeds: string[]
  filterSexes: string[]
  searchQuery: string
  sortField: string
  sortDirection: string
  filterMinSpeed: string
  filterMaxSpeed: string
}

export interface CoursingFilterOptions {
  filterYears: string[]
  filterBreeds: string[]
  searchQuery: string
  sortField: string
  sortDirection: string
  filterMinTime: string
  filterMaxTime: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractBestSpeedRecords(records: any[]) {
  const result: any[] = []
  const seenSpeedKeys = new Set<string>()
  const sorted = [...records].sort((a, b) => Number(b.speed_km_h) - Number(a.speed_km_h))

  for (const record of sorted) {
    const key = `${record.name}_${record.breed}`
    if (!seenSpeedKeys.has(key)) {
      seenSpeedKeys.add(key)
      result.push(record)
    }
  }

  return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractBestCoursingRecords(records: any[]) {
  const result: any[] = []
  const seenKeys = new Set<string>()
  const sorted = [...records].sort((a, b) => Number(a.time_seconds) - Number(b.time_seconds))

  for (const record of sorted) {
    const key = `${record.name}_${record.breed}`
    if (!seenKeys.has(key)) {
      seenKeys.add(key)
      result.push(record)
    }
  }

  return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function filterSpeedRecords(baseRecords: any[], options: SpeedFilterOptions) {
  const {
    filterYears,
    filterBreeds,
    filterSexes,
    searchQuery,
    sortField,
    sortDirection,
    filterMinSpeed,
    filterMaxSpeed,
  } = options

  let filtered = baseRecords

  if (filterYears.length > 0) {
    filtered = filtered
      .map((record) => {
        const allRuns = [
          {
            speed_km_h: Number(record.speed_km_h),
            date: record.date,
            track_type: record.track_type,
            screenshot_url: record.screenshot_url,
          },
          ...(Array.isArray(record.history) ? record.history : []).map((h: any) => ({
            speed_km_h: Number(h.speed_km_h),
            date: h.date,
            track_type: h.track_type,
            screenshot_url: h.screenshot_url,
          })),
        ]
        const matchingRuns = allRuns.filter((run) => {
          const y = getRecordYear(run.date)
          return y != null && filterYears.includes(String(y))
        })
        if (matchingRuns.length === 0) return null
        matchingRuns.sort((a, b) => b.speed_km_h - a.speed_km_h)
        const best = matchingRuns[0]
        return {
          ...record,
          speed_km_h: best.speed_km_h,
          date: best.date,
          track_type: best.track_type,
          screenshot_url: best.screenshot_url,
        }
      })
      .filter((r): r is (typeof baseRecords)[number] => r !== null)
  }

  if (filterBreeds.length > 0) {
    filtered = filtered.filter((record) =>
      filterBreeds.some((fb) => matchesBreedFilter(record.breed, fb))
    )
  }

  if (filterSexes.length > 0) {
    filtered = filtered.filter((record) => filterSexes.includes(record.sex))
  }

  if (searchQuery) {
    const searchLower = searchQuery.toLowerCase()
    filtered = filtered.filter((record) => {
      const nameMatch =
        record.name.toLowerCase().includes(searchLower) ||
        (Array.isArray((record as { aliases?: string[] }).aliases) &&
          (record as { aliases?: string[] }).aliases!.some((a) =>
            a.toLowerCase().includes(searchLower),
          ))
      const breedMatch = record.breed.toLowerCase().includes(searchLower)

      let sexMatch = record.sex.toLowerCase().includes(searchLower)
      if (!sexMatch) {
        if (
          searchLower.includes('сука') ||
          searchLower.includes('сук') ||
          searchLower.includes('самка') ||
          searchLower.includes('самки')
        ) {
          sexMatch = record.sex === 'С'
        } else if (
          searchLower.includes('кабель') ||
          searchLower.includes('кобель') ||
          searchLower.includes('каб') ||
          searchLower.includes('самец') ||
          searchLower.includes('самцы')
        ) {
          sexMatch = record.sex === 'К'
        }
      }

      const speedMatch = record.speed_km_h.toString().includes(searchQuery)
      const formattedDate = formatRecordDate(record.date)
      const dateMatch = formattedDate.includes(searchQuery) || String(record.date).includes(searchQuery)

      return nameMatch || breedMatch || sexMatch || speedMatch || dateMatch
    })
  }

  if (filterMinSpeed) {
    const min = parseFloat(filterMinSpeed)
    if (!Number.isNaN(min)) filtered = filtered.filter((r) => r.speed_km_h >= min)
  }
  if (filterMaxSpeed) {
    const max = parseFloat(filterMaxSpeed)
    if (!Number.isNaN(max)) filtered = filtered.filter((r) => r.speed_km_h <= max)
  }

  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'result') {
      const aVal = a.speed_km_h
      const bVal = b.speed_km_h
      return sortDirection === 'desc' ? bVal - aVal : aVal - bVal
    }

    if (sortField === 'date') {
      const aVal = parseRecordDate(String(a.date))?.getTime() ?? 0
      const bVal = parseRecordDate(String(b.date))?.getTime() ?? 0
      return sortDirection === 'desc' ? bVal - aVal : aVal - bVal
    }

    if (sortField === 'name') {
      const aName = a.name.toLowerCase()
      const bName = b.name.toLowerCase()
      const cmp = aName.localeCompare(bName, 'ru')
      return sortDirection === 'desc' ? -cmp : cmp
    }

    return 0
  })

  const isResultLeaderboard = sortField === 'result' && sortDirection === 'desc'
  const deltas = isResultLeaderboard ? computeDoninoDeltas(sorted, 'speed') : null
  return sorted.map((record, index) => {
    const key = `${record.name}::${record.breed}`
    return {
      ...record,
      rank: isResultLeaderboard ? index + 1 : undefined,
      delta: deltas ? deltas.get(key) : undefined,
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function filterCoursingRecords(baseRecords: any[], options: CoursingFilterOptions) {
  const {
    filterYears,
    filterBreeds,
    searchQuery,
    sortField,
    sortDirection,
    filterMinTime,
    filterMaxTime,
  } = options

  let filtered = baseRecords

  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filtered = filtered.filter(
      (record) =>
        record.name.toLowerCase().includes(query) ||
        record.breed.toLowerCase().includes(query) ||
        (Array.isArray((record as { aliases?: string[] }).aliases) &&
          (record as { aliases?: string[] }).aliases!.some((a) =>
            a.toLowerCase().includes(query),
          ))
    )
  }

  if (filterBreeds.length > 0) {
    filtered = filtered.filter((record) =>
      filterBreeds.some((fb) => matchesBreedFilter(record.breed, fb))
    )
  }

  if (filterYears.length > 0) {
    filtered = filtered
      .map((record) => {
        const allRuns = [
          { time_seconds: Number(record.time_seconds), date: record.date },
          ...(Array.isArray(record.history) ? record.history : []).map((h: any) => ({
            time_seconds: Number(h.time_seconds),
            date: h.date,
          })),
        ]
        const matchingRuns = allRuns.filter((run) => {
          const y = getRecordYear(run.date)
          return y != null && filterYears.includes(String(y))
        })
        if (matchingRuns.length === 0) return null
        matchingRuns.sort((a, b) => a.time_seconds - b.time_seconds)
        const best = matchingRuns[0]
        return {
          ...record,
          time_seconds: best.time_seconds,
          date: best.date,
        }
      })
      .filter((r): r is (typeof baseRecords)[number] => r !== null)
  }

  if (filterMinTime) {
    const min = parseFloat(filterMinTime)
    if (!Number.isNaN(min)) filtered = filtered.filter((r) => r.time_seconds >= min)
  }
  if (filterMaxTime) {
    const max = parseFloat(filterMaxTime)
    if (!Number.isNaN(max)) filtered = filtered.filter((r) => r.time_seconds <= max)
  }

  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'result') {
      const aVal = a.time_seconds
      const bVal = b.time_seconds
      return sortDirection === 'desc' ? aVal - bVal : bVal - aVal
    }

    if (sortField === 'date') {
      const aVal = parseRecordDate(String(a.date))?.getTime() ?? 0
      const bVal = parseRecordDate(String(b.date))?.getTime() ?? 0
      return sortDirection === 'desc' ? bVal - aVal : aVal - bVal
    }

    if (sortField === 'name') {
      const aName = a.name.toLowerCase()
      const bName = b.name.toLowerCase()
      const cmp = aName.localeCompare(bName, 'ru')
      return sortDirection === 'desc' ? -cmp : cmp
    }

    return 0
  })

  const isResultLeaderboard = sortField === 'result' && sortDirection === 'desc'
  const deltas = isResultLeaderboard ? computeDoninoDeltas(sorted, 'coursing') : null
  return sorted.map((record, index) => {
    const key = `${record.name}::${record.breed}`
    return {
      ...record,
      rank: isResultLeaderboard ? index + 1 : undefined,
      delta: deltas ? deltas.get(key) : undefined,
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractUniqueBreeds(speedRecords: any[], coursingRecords: any[]): string[] {
  const counts = new Map<string, number>()
  for (const r of speedRecords) if (r.breed) counts.set(r.breed, (counts.get(r.breed) || 0) + 1)
  for (const r of coursingRecords) if (r.breed) counts.set(r.breed, (counts.get(r.breed) || 0) + 1)
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ru'))
    .map(([b]) => b)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildDoninoDogIndex(speedRecords: any[], coursingRecords: any[]): DogsIndexEntry[] {
  const dogMap = new Map<string, string>()
  for (const r of speedRecords) {
    if (r.name && r.breed) {
      const canon = canonicalBreed(r.breed)
      const key = `${r.name.trim()}_${canon}`.toLowerCase()
      dogMap.set(key, canon)
    }
  }
  for (const r of coursingRecords) {
    if (r.name && r.breed) {
      const canon = canonicalBreed(r.breed)
      const key = `${r.name.trim()}_${canon}`.toLowerCase()
      dogMap.set(key, canon)
    }
  }
  return Array.from(dogMap.values()).map((breed) => ({
    breed,
    competition_count: 1,
  }))
}
