import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSpeedRecords, useCoursingRecords } from '../../hooks/useStaticData'
import { formatRecordDate, getRecordYear, parseRecordDate, parseRecordHistory } from '../../lib/recordDates'
import { buildSexByDogMap } from './stats/doninoStatsUtils'
import type { GroupBy } from './stats/constants'

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
    if (searchParams.get('tab') === 'stats') return 'stats'
    const v = searchParams.get('view')
    return v === 'stats' ? 'stats' : 'table'
  })

  const handleViewChange = useCallback(
    (nextView: 'table' | 'stats') => {
      setView(nextView)
      const params = new URLSearchParams(searchParams)
      if (nextView === 'stats') params.set('view', 'stats')
      else params.delete('view')
      params.delete('tab')
      params.delete('statsTab')
      setSearchParams(params)
    },
    [searchParams, setSearchParams]
  )

  useEffect(() => {
    const rawTab = searchParams.get('tab')
    if (rawTab === 'stats') {
      const params = new URLSearchParams(searchParams)
      params.delete('tab')
      params.set('view', 'stats')
      params.delete('statsTab')
      setSearchParams(params, { replace: true })
      setView('stats')
      return
    }
    if (rawTab === 'coursing' || rawTab === 'table') {
      const params = new URLSearchParams(searchParams)
      params.delete('tab')
      setSearchParams(params, { replace: true })
    }
    const v = searchParams.get('view')
    setView(v === 'stats' ? 'stats' : 'table')
  }, [searchParams, setSearchParams])

  const speedRecordsQuery = useSpeedRecords('', '', 10000, '', '')
  const coursingRecordsQuery = useCoursingRecords('', 10000, '', '')

  const [filterYears, setFilterYears] = useState(() => {
    const years = searchParams.get('years')
    return years ? years.split(',') : []
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
  const [sortField, setSortField] = useState(() => searchParams.get('sort') || 'speed_km_h')
  const [sortDirection, setSortDirection] = useState(() => searchParams.get('dir') || 'desc')
  const [coursingSortField, setCoursingSortField] = useState(
    () => searchParams.get('cSort') || 'time_seconds'
  )
  const [coursingSortDirection, setCoursingSortDirection] = useState(
    () => searchParams.get('cDir') || 'asc'
  )
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
        sex: sexByDog.get(`${record.name}_${record.breed}`) ?? '',
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
        filtered = filtered.filter((record) => filterYears.includes(String(getRecordYear(record.date))))
      }

      if (filterBreeds.length > 0) {
        filtered = filtered.filter((record) => filterBreeds.includes(record.breed))
      }

      if (filterSexes.length > 0) {
        filtered = filtered.filter((record) => filterSexes.includes(record.sex))
      }

      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        filtered = filtered.filter((record) => {
          const nameMatch = record.name.toLowerCase().includes(searchLower)
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

      return [...filtered].sort((a, b) => {
        let aVal: string | number = a[sortField as keyof typeof a] as string | number
        let bVal: string | number = b[sortField as keyof typeof b] as string | number

        if (sortField === 'speed_km_h') {
          aVal = parseFloat(String(aVal))
          bVal = parseFloat(String(bVal))
        }

        if (sortField === 'date') {
          aVal = parseRecordDate(String(aVal))?.getTime() ?? 0
          bVal = parseRecordDate(String(bVal))?.getTime() ?? 0
        }

        if (sortDirection === 'desc') {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
        }
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      })
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
            record.name.toLowerCase().includes(query) || record.breed.toLowerCase().includes(query)
        )
      }

      if (filterBreeds.length > 0) {
        filtered = filtered.filter((record) => filterBreeds.includes(record.breed))
      }

      if (filterYears.length > 0) {
        filtered = filtered.filter((record) => filterYears.includes(String(getRecordYear(record.date))))
      }

      if (filterMinTime) {
        const min = parseFloat(filterMinTime)
        if (!Number.isNaN(min)) filtered = filtered.filter((r) => r.time_seconds >= min)
      }
      if (filterMaxTime) {
        const max = parseFloat(filterMaxTime)
        if (!Number.isNaN(max)) filtered = filtered.filter((r) => r.time_seconds <= max)
      }

      return [...filtered].sort((a, b) => {
        let aVal: string | number = a[coursingSortField as keyof typeof a] as string | number
        let bVal: string | number = b[coursingSortField as keyof typeof b] as string | number

        if (coursingSortField === 'time_seconds') {
          aVal = parseFloat(String(aVal))
          bVal = parseFloat(String(bVal))
        }

        if (coursingSortField === 'date') {
          aVal = parseRecordDate(String(aVal))?.getTime() ?? 0
          bVal = parseRecordDate(String(bVal))?.getTime() ?? 0
        }

        if (coursingSortDirection === 'desc') {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
        }
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      })
    },
    [
      searchQuery,
      filterBreeds,
      filterYears,
      coursingSortField,
      coursingSortDirection,
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
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
      } else {
        setSortField(field)
        setSortDirection(field === 'speed_km_h' ? 'desc' : 'asc')
      }
    },
    [sortField, sortDirection]
  )

  const handleCoursingSort = useCallback(
    (field: string) => {
      if (coursingSortField === field) {
        setCoursingSortDirection(coursingSortDirection === 'asc' ? 'desc' : 'asc')
      } else {
        setCoursingSortField(field)
        setCoursingSortDirection(field === 'time_seconds' ? 'asc' : 'asc')
      }
    },
    [coursingSortField, coursingSortDirection]
  )

  const clearAllFilters = useCallback(() => {
    setFilterYears([])
    setFilterBreeds([])
    setFilterSexes([])
    setSearchQuery('')
    setFilterMinSpeed('')
    setFilterMaxSpeed('')
    setFilterMinTime('')
    setFilterMaxTime('')
  }, [])

  const clearPanelFilters = useCallback(() => {
    setFilterYears([])
    setFilterBreeds([])
    setFilterSexes([])
    setFilterMinSpeed('')
    setFilterMaxSpeed('')
    setFilterMinTime('')
    setFilterMaxTime('')
  }, [])

  const hasActiveFilters = Boolean(
    filterYears.length > 0 ||
      filterBreeds.length > 0 ||
      filterSexes.length > 0 ||
      searchQuery ||
      filterMinSpeed ||
      filterMaxSpeed ||
      filterMinTime ||
      filterMaxTime
  )

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

  const breeds = useMemo(() => {
    const set = new Set<string>()
    for (const r of bestSpeedRecords) set.add(r.breed)
    for (const r of bestCoursingRecords) set.add(r.breed)
    return [...set].sort()
  }, [bestSpeedRecords, bestCoursingRecords])

  const sexes = [...new Set(bestSpeedRecords.map((r) => r.sex) as string[])].sort()

  return {
    view,
    handleViewChange,
    searchQuery,
    setSearchQuery,
    filterYears,
    filterBreeds,
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
    coursingSortField,
    coursingSortDirection,
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
    handleCoursingSort,
    clearAllFilters,
    clearPanelFilters,
    hasActiveFilters,
    years,
    breeds,
    sexes,
  }
}
