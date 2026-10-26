import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSpeedRecords, useCoursingRecords } from '../../hooks/useStaticData'
import { formatRecordDate, getRecordYear, parseRecordDate, parseRecordHistory } from '../../lib/recordDates'
import { DEFAULT_ACTIVE_SEASON, resolveActiveSeason } from '../../lib/season'
import { buildSexByDogMap } from './stats/doninoStatsUtils'
import type { GroupBy } from './stats/constants'
import type { DogsIndexEntry } from '../../lib/competingBreeds'
import { matchesBreedFilter, canonicalBreed } from '../../lib/breedMapping'

function doninoRecordsFromQuery(
  result: { success: boolean; data?: unknown } | undefined,
): Record<string, unknown>[] {
  if (!result?.success || result.data == null) return []
  if (Array.isArray(result.data)) return result.data
  const wrapped = result.data as { records?: unknown }
  return Array.isArray(wrapped.records) ? wrapped.records : []
}

export function useSpeedRecordsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView] = useState<'table' | 'stats'>(() => {
    const rawTab = searchParams.get('tab')
    if (rawTab === 'stats') return 'stats'
    const rawView = searchParams.get('view')
    return rawView === 'stats' ? 'stats' : 'table'
  })

  useEffect(() => {
    const rawView = searchParams.get('view')
    const rawTab = searchParams.get('tab')

    // Normalize legacy ?view= to ?tab=
    if (rawView) {
      const params = new URLSearchParams(searchParams)
      params.delete('view')
      params.set('tab', rawView === 'stats' ? 'stats' : 'records')
      params.delete('statsTab')
      setSearchParams(params, { replace: true })
      setView(rawView === 'stats' ? 'stats' : 'table')
      return
    }

    if (rawTab === 'table' || rawTab === 'coursing') {
      const params = new URLSearchParams(searchParams)
      params.set('tab', 'records')
      setSearchParams(params, { replace: true })
      setView('table')
      return
    }

    setView(rawTab === 'stats' ? 'stats' : 'table')
  }, [searchParams, setSearchParams])

  const speedRecordsQuery = useSpeedRecords('', '', 10000, '', '')
  const coursingRecordsQuery = useCoursingRecords('', 10000, '', '')

  const [filterYears, setFilterYears] = useState<string[]>(() => {
    const raw = searchParams.get('years') ?? searchParams.get('year')
    if (raw === null) return [DEFAULT_ACTIVE_SEASON]
    if (raw === '' || raw === 'all') return []
    return raw.split(',').filter(Boolean)
  })
  const [filterBreeds, setFilterBreeds] = useState(() => {
    const breeds = searchParams.get('breeds')
    return breeds ? breeds.split(',') : []
  })
  const [filterSexes, setFilterSexes] = useState(() => {
    const sexes = searchParams.get('sexes')
    return sexes ? sexes.split(',') : []
  })
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [sortField, setSortField] = useState<string>(() => {
    const raw = searchParams.get('sort')
    if (raw === 'speed_km_h' || raw === 'time_seconds' || raw === 'result') return 'result'
    if (raw === 'date') return 'date'
    if (raw === 'name') return 'name'
    return 'result'
  })
  const [sortDirection, setSortDirection] = useState<string>(() => {
    const raw = searchParams.get('dir')
    if (raw === 'asc' || raw === 'desc') return raw
    return 'desc'
  })
  const [filterMinSpeed, setFilterMinSpeed] = useState(() => searchParams.get('minSpeed') || '')
  const [filterMaxSpeed, setFilterMaxSpeed] = useState(() => searchParams.get('maxSpeed') || '')
  const [filterMinTime, setFilterMinTime] = useState(() => searchParams.get('minTime') || '')
  const [filterMaxTime, setFilterMaxTime] = useState(() => searchParams.get('maxTime') || '')

  const statsGroupBy = ((): GroupBy => {
    const valid: GroupBy[] = ['breed', 'sex', 'year']
    const direct = searchParams.get('groupBy') as GroupBy | null
    if (direct && valid.includes(direct)) return direct
    const legacy =
      (searchParams.get('speedGroupBy') as GroupBy | null) ||
      (searchParams.get('coursingGroupBy') as GroupBy | null)
    if (legacy && valid.includes(legacy)) return legacy
    return 'breed'
  })()

  const setStatsGroupBy = useCallback(
    (value: GroupBy) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev)
        if (value === 'breed') params.delete('groupBy')
        else params.set('groupBy', value)
        params.delete('speedGroupBy')
        params.delete('coursingGroupBy')
        return params
      })
    },
    [setSearchParams]
  )

  const speedRecordsData = doninoRecordsFromQuery(speedRecordsQuery.data)
  const coursingRecordsData = doninoRecordsFromQuery(coursingRecordsQuery.data)

  const sexByDog = useMemo(
    () => buildSexByDogMap(speedRecordsData as { name: string; breed: string; sex: string }[]),
    [speedRecordsData]
  )

  const coursingRecords = useMemo(
    () =>
      coursingRecordsData.map((record) => ({
        ...record,
        history: parseRecordHistory(record.history),
        sex: (record.sex as string) || sexByDog.get(`${record.name}_${record.breed}`) || '',
      })),
    [coursingRecordsData, sexByDog]
  )

  const speedRecordsWithHistory = useMemo(
    () =>
      speedRecordsData.map((record) => ({
        ...record,
        history: parseRecordHistory(record.history),
      })),
    [speedRecordsData]
  )

  const bestCoursingRecords = useMemo(() => {
    const records: typeof coursingRecords = []
    const seenKeys = new Set<string>()
    const sortedCoursingRecords = [...coursingRecords].sort((a, b) => a.time_seconds - b.time_seconds)

    for (const record of sortedCoursingRecords) {
      const key = `${record.name}_${record.breed}`
      if (!seenKeys.has(key)) {
        seenKeys.add(key)
        records.push(record)
      }
    }
    return records
  }, [coursingRecords])

  const bestSpeedRecords = useMemo(() => {
    const records: typeof speedRecordsWithHistory = []
    const seenSpeedKeys = new Set<string>()
    const sortedSpeedRecords = [...speedRecordsWithHistory].sort((a, b) => b.speed_km_h - a.speed_km_h)

    for (const record of sortedSpeedRecords) {
      const key = `${record.name}_${record.breed}`
      if (!seenSpeedKeys.has(key)) {
        seenSpeedKeys.add(key)
        records.push(record)
      }
    }

    return records
  }, [speedRecordsWithHistory])

  const loading = speedRecordsQuery.isLoading || coursingRecordsQuery.isLoading
  const error = speedRecordsQuery.error || coursingRecordsQuery.error

  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const applySpeedListFilters = useCallback(
    (baseRecords: typeof bestSpeedRecords) => {
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
      return sorted.map((record, index) => ({
        ...record,
        rank: isResultLeaderboard ? index + 1 : undefined,
      }))
    },
    [
      filterYears,
      filterBreeds,
      filterSexes,
      searchQuery,
      sortField,
      sortDirection,
      filterMinSpeed,
      filterMaxSpeed,
    ]
  )

  const applyCoursingListFilters = useCallback(
    (baseRecords: typeof bestCoursingRecords) => {
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
          // Меньше секунд = быстрее собака (лучший результат первым при desc)
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
      return sorted.map((record, index) => ({
        ...record,
        rank: isResultLeaderboard ? index + 1 : undefined,
      }))
    },
    [
      searchQuery,
      filterBreeds,
      filterYears,
      sortField,
      sortDirection,
      filterMinTime,
      filterMaxTime,
    ]
  )

  const filteredRecords = useMemo(
    () => applySpeedListFilters(bestSpeedRecords),
    [bestSpeedRecords, applySpeedListFilters]
  )

  const filteredCoursingRecords = useMemo(
    () => applyCoursingListFilters(bestCoursingRecords),
    [bestCoursingRecords, applyCoursingListFilters]
  )

  const toggleFilter = useCallback((type: string, value: string) => {
    if (type === 'year') {
      setFilterYears((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
    } else if (type === 'breed') {
      setFilterBreeds((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
    } else if (type === 'sex') {
      setFilterSexes((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
    }
  }, [])

  const handleSort = useCallback(
    (field: string) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortField(field)
        setSortDirection(field === 'name' ? 'asc' : 'desc')
      }
    },
    [sortField]
  )

  const onYearChange = useCallback((year: string) => {
    setFilterYears(year ? [year] : [])
  }, [])

  const onBreedChange = useCallback((breed: string) => {
    setFilterBreeds(breed ? [breed] : [])
  }, [])

  const years = useMemo(() => {
    const set = new Set<string>()
    for (const r of bestSpeedRecords) {
      const y = String(getRecordYear(r.date))
      if (y) set.add(y)
    }
    for (const r of bestCoursingRecords) {
      const y = String(getRecordYear(r.date))
      if (y) set.add(y)
    }
    return [...set].sort().reverse()
  }, [bestSpeedRecords, bestCoursingRecords])

  const activeSeason = useMemo(() => resolveActiveSeason(years), [years])

  const hasUrlYear = (searchParams.get('years') ?? searchParams.get('year')) !== null
  useEffect(() => {
    if (!hasUrlYear && years.length > 0) {
      const resolved = resolveActiveSeason(years)
      setFilterYears((prev) =>
        prev.length === 1 && prev[0] === DEFAULT_ACTIVE_SEASON ? [resolved] : prev,
      )
    }
  }, [hasUrlYear, years])

  const clearAllFilters = useCallback(() => {
    setFilterYears([activeSeason])
    setFilterBreeds([])
    setFilterSexes([])
    setSearchQuery('')
    setFilterMinSpeed('')
    setFilterMaxSpeed('')
    setFilterMinTime('')
    setFilterMaxTime('')
  }, [activeSeason])

  const clearPanelFilters = useCallback(() => {
    setFilterYears([activeSeason])
    setFilterBreeds([])
    setFilterSexes([])
    setFilterMinSpeed('')
    setFilterMaxSpeed('')
    setFilterMinTime('')
    setFilterMaxTime('')
  }, [activeSeason])

  // Synchronize state with URL search params (TopDogs / Competitions pattern)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        let changed = false

        // Breed
        const currentBreed = next.get('breed') || ''
        const targetBreed = filterBreeds.length > 0 ? filterBreeds[0] : ''
        if (targetBreed !== currentBreed) {
          if (targetBreed) next.set('breed', targetBreed)
          else next.delete('breed')
          next.delete('breeds')
          changed = true
        }

        // Year
        const currentYear = next.get('year')
        const targetYearParam =
          filterYears.length === 0
            ? 'all'
            : filterYears.length === 1 && filterYears[0] === activeSeason
              ? null
              : filterYears.join(',')
        if (targetYearParam !== null) {
          if (currentYear !== targetYearParam) {
            next.set('year', targetYearParam)
            next.delete('years')
            changed = true
          }
        } else {
          if (currentYear === 'all' || (currentYear && currentYear !== activeSeason)) {
            next.delete('year')
            next.delete('years')
            changed = true
          }
        }

        // Search query
        const trimmedSearch = searchQuery.trim()
        const currentSearch = next.get('search') || ''
        if (trimmedSearch !== currentSearch) {
          if (trimmedSearch) next.set('search', trimmedSearch)
          else next.delete('search')
          changed = true
        }

        // Sexes
        const currentSex = next.get('sex') || ''
        const targetSex = filterSexes.join(',')
        if (targetSex !== currentSex) {
          if (targetSex) next.set('sex', targetSex)
          else next.delete('sex')
          next.delete('sexes')
          changed = true
        }

        // Sort
        const currentSort = next.get('sort') || ''
        const targetSort = sortField !== 'result' ? sortField : ''
        if (targetSort !== currentSort) {
          if (targetSort) next.set('sort', targetSort)
          else next.delete('sort')
          changed = true
        }

        // Sort Direction
        const currentDir = next.get('dir') || ''
        const defaultDir = sortField === 'name' ? 'asc' : 'desc'
        const targetDir = sortDirection !== defaultDir ? sortDirection : ''
        if (targetDir !== currentDir) {
          if (targetDir) next.set('dir', targetDir)
          else next.delete('dir')
          changed = true
        }

        // Clean up legacy params
        if (next.has('cSort')) { next.delete('cSort'); changed = true }
        if (next.has('cDir')) { next.delete('cDir'); changed = true }

        return changed ? next : prev
      },
      { replace: true }
    )
  }, [
    filterBreeds,
    filterYears,
    searchQuery,
    filterSexes,
    sortField,
    sortDirection,
    activeSeason,
    setSearchParams,
  ])

  // Respond to browser back/forward navigation
  useEffect(() => {
    const breedFromUrl = searchParams.get('breed') || searchParams.get('breeds') || ''
    const breedArr = breedFromUrl ? breedFromUrl.split(',') : []
    if (breedArr.join(',') !== filterBreeds.join(',')) {
      setFilterBreeds(breedArr)
    }

    const yearFromUrl = searchParams.get('year') ?? searchParams.get('years')
    if (yearFromUrl !== null) {
      const yearArr = yearFromUrl === '' || yearFromUrl === 'all' ? [] : yearFromUrl.split(',').filter(Boolean)
      if (yearArr.join(',') !== filterYears.join(',')) {
        setFilterYears(yearArr)
      }
    }
  }, [searchParams])

  const isYearNonDefault =
    filterYears.length !== 1 || filterYears[0] !== activeSeason

  const hasActiveFilters = Boolean(
    isYearNonDefault ||
      filterBreeds.length > 0 ||
      filterSexes.length > 0 ||
      searchQuery ||
      filterMinSpeed ||
      filterMaxSpeed ||
      filterMinTime ||
      filterMaxTime
  )

  const breeds = useMemo(() => {
    const set = new Set<string>()
    for (const r of bestSpeedRecords) set.add(r.breed)
    for (const r of bestCoursingRecords) set.add(r.breed)
    return [...set].sort()
  }, [bestSpeedRecords, bestCoursingRecords])

  const sexes = [...new Set(bestSpeedRecords.map((r) => r.sex) as string[])].sort()

  const dogIndex = useMemo<DogsIndexEntry[]>(() => {
    const dogMap = new Map<string, string>()
    for (const r of bestSpeedRecords) {
      if (r.name && r.breed) {
        const canon = canonicalBreed(r.breed)
        const key = `${r.name.trim()}_${canon}`.toLowerCase()
        dogMap.set(key, canon)
      }
    }
    for (const r of bestCoursingRecords) {
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
  }, [bestSpeedRecords, bestCoursingRecords])

  return {
    view,
    searchQuery,
    setSearchQuery,
    filterYears,
    onYearChange,
    currentSeason: activeSeason,
    filterBreeds,
    onBreedChange,
    filterSexes,
    filterMinSpeed,
    setFilterMinSpeed,
    filterMaxSpeed,
    setFilterMaxSpeed,
    filterMinTime,
    setFilterMinTime,
    filterMaxTime,
    setFilterMaxTime,
    sortField,
    sortDirection,
    statsGroupBy,
    setStatsGroupBy,
    openDropdown,
    setOpenDropdown,
    dropdownRef,
    filteredRecords,
    filteredCoursingRecords,
    speedRecordsWithHistory,
    coursingRecords,
    loading,
    error,
    toggleFilter,
    handleSort,
    clearAllFilters,
    clearPanelFilters,
    hasActiveFilters,
    years,
    breeds,
    sexes,
    dogIndex,
  }
}
