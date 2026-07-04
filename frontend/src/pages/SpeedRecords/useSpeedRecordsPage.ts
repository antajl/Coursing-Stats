import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSpeedRecords, useCoursingRecords } from '../../hooks/useApi'
import { formatRecordDate, getRecordYear, parseRecordDate, parseRecordHistory } from '../../lib/recordDates'

export function useSpeedRecordsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab')
    if (tab === 'stats') return 'table'
    return tab || 'table'
  })
  const [view, setView] = useState<'table' | 'stats'>(() => {
    if (searchParams.get('tab') === 'stats') return 'stats'
    const v = searchParams.get('view')
    return v === 'stats' ? 'stats' : 'table'
  })

  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab)
      const params = new URLSearchParams(searchParams)
      params.set('tab', tab)
      setSearchParams(params)
    },
    [searchParams, setSearchParams]
  )

  const handleViewChange = useCallback(
    (nextView: 'table' | 'stats') => {
      setView(nextView)
      const params = new URLSearchParams(searchParams)
      if (searchParams.get('tab') === 'stats') {
        params.set('tab', activeTab === 'coursing' ? 'coursing' : 'table')
      }
      if (nextView === 'stats') params.set('view', 'stats')
      else params.delete('view')
      params.delete('statsTab')
      setSearchParams(params)
    },
    [searchParams, setSearchParams, activeTab]
  )

  useEffect(() => {
    const rawTab = searchParams.get('tab') || 'table'
    if (rawTab === 'stats') {
      const params = new URLSearchParams(searchParams)
      params.set('tab', 'table')
      params.set('view', 'stats')
      params.delete('statsTab')
      setSearchParams(params, { replace: true })
      setActiveTab('table')
      setView('stats')
      return
    }
    const validTabs = ['table', 'coursing']
    setActiveTab(validTabs.includes(rawTab) ? rawTab : 'table')
    const v = searchParams.get('view')
    setView(v === 'stats' ? 'stats' : 'table')
  }, [searchParams, setSearchParams])

  const speedRecordsQuery = useSpeedRecords('', '', 1000, '', '')
  const coursingRecordsQuery = useCoursingRecords('', 1000, '', '')

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

  const speedRecordsData = speedRecordsQuery.data?.success
    ? Array.isArray(speedRecordsQuery.data.data)
      ? speedRecordsQuery.data.data
      : []
    : []
  const coursingRecordsData = coursingRecordsQuery.data?.success
    ? Array.isArray(coursingRecordsQuery.data.data)
      ? coursingRecordsQuery.data.data
      : []
    : []

  const coursingRecords = useMemo(
    () =>
      coursingRecordsData.map(record => ({
        ...record,
        history: parseRecordHistory(record.history),
      })),
    [coursingRecordsData]
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

  const filteredCoursingRecords = useMemo(() => {
    let filtered = bestCoursingRecords

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(record => record.name.toLowerCase().includes(query))
    }

    if (filterBreeds.length > 0) {
      filtered = filtered.filter(record => filterBreeds.includes(record.breed))
    }

    if (filterYears.length > 0) {
      filtered = filtered.filter(record => filterYears.includes(String(getRecordYear(record.date))))
    }

    return filtered
  }, [bestCoursingRecords, searchQuery, filterBreeds, filterYears])

  const speedRecordsWithHistory = useMemo(
    () =>
      speedRecordsData.map(record => ({
        ...record,
        history: parseRecordHistory(record.history),
      })),
    [speedRecordsData]
  )

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

  const allRecords = bestSpeedRecords

  const loading = speedRecordsQuery.isLoading || coursingRecordsQuery.isLoading
  const error = speedRecordsQuery.error || coursingRecordsQuery.error
  const coursingLoading = coursingRecordsQuery.isLoading

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

  const applyFilters = useCallback(
    (baseRecords: typeof allRecords) => {
      let filtered = baseRecords

      if (filterYears.length > 0) {
        filtered = filtered.filter(record => filterYears.includes(String(getRecordYear(record.date))))
      }

      if (filterBreeds.length > 0) {
        filtered = filtered.filter(record => filterBreeds.includes(record.breed))
      }

      if (filterSexes.length > 0) {
        filtered = filtered.filter(record => filterSexes.includes(record.sex))
      }

      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        filtered = filtered.filter(record => {
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

      const sorted = [...filtered].sort((a, b) => {
        let aVal: string | number | Date = a[sortField as keyof typeof a] as string | number
        let bVal: string | number | Date = b[sortField as keyof typeof b] as string | number

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

      return sorted
    },
    [filterYears, filterBreeds, filterSexes, searchQuery, sortField, sortDirection]
  )

  const filteredRecords = useMemo(() => applyFilters(allRecords), [allRecords, applyFilters])

  const toggleFilter = useCallback((type: string, value: string) => {
    if (type === 'year') {
      setFilterYears(prev => (prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]))
    } else if (type === 'breed') {
      setFilterBreeds(prev => (prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]))
    } else if (type === 'sex') {
      setFilterSexes(prev => (prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]))
    }
  }, [])

  const handleSort = useCallback(
    (field: string) => {
      if (sortField === field) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
      } else {
        setSortField(field)
        if (field === 'speed_km_h') {
          setSortDirection('desc')
        } else {
          setSortDirection('asc')
        }
      }
    },
    [sortField, sortDirection]
  )

  const clearAllFilters = useCallback(() => {
    setFilterYears([])
    setFilterBreeds([])
    setFilterSexes([])
    setSearchQuery('')
  }, [])

  const clearCoursingFilters = useCallback(() => {
    setSearchQuery('')
    setFilterBreeds([])
    setFilterYears([])
  }, [])

  const hasActiveFilters =
    filterYears.length > 0 || filterBreeds.length > 0 || filterSexes.length > 0 || !!searchQuery

  const coursingYears: string[] = [...new Set(bestCoursingRecords.map(r => String(getRecordYear(r.date))).filter(Boolean) as string[])].sort().reverse()
  const coursingBreeds: string[] = [...new Set(bestCoursingRecords.map(r => r.breed) as string[])].sort()

  const years: string[] = [...new Set(allRecords.map(r => String(getRecordYear(r.date))).filter(Boolean) as string[])].sort().reverse()
  const breeds: string[] = [...new Set(allRecords.map(r => r.breed) as string[])].sort()
  const sexes: string[] = [...new Set(allRecords.map(r => r.sex) as string[])].sort()

  return {
    activeTab,
    view,
    handleTabChange,
    handleViewChange,
    searchQuery,
    setSearchQuery,
    filterYears,
    filterBreeds,
    filterSexes,
    sortField,
    sortDirection,
    openDropdown,
    setOpenDropdown,
    dropdownRef,
    filteredRecords,
    filteredCoursingRecords,
    loading,
    error,
    coursingLoading,
    toggleFilter,
    handleSort,
    clearAllFilters,
    clearCoursingFilters,
    hasActiveFilters,
    years,
    breeds,
    sexes,
    coursingYears,
    coursingBreeds,
  }
}
