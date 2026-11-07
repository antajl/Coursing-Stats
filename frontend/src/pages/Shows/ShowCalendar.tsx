import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronUp } from 'lucide-react'
import PageToolbar from '../../components/toolbar/PageToolbar'
import EmptyState from '../../components/EmptyState'
import SkeletonLoader from '../../components/SkeletonLoader'
import {
  getShowCalendar,
  getShowBreedCalendar,
  getShowRkfCalendarYears,
  type ShowRkfCalendarEntry,
} from '../../lib/staticData'
import { canonicalBreed, formatBreedName, matchesBreedFilter } from '../../lib/breedMapping'
import { SHOW_CANDIDATE_BREEDS } from '../TopDogs/QuickBreedBar'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import {
  filterShowCalendarGroups,
  findLatestMonthWithProtocols,
  groupExhibitionsByMonth,
} from './showCalendarDate'
import { exhibitionHasProtocol } from './showCalendarGroup'
import {
  ShowCalendarToolbar,
  type QuickPreset,
} from './ShowCalendar/ShowCalendarToolbar'
import {
  ShowCalendarMonthList,
  type ShowCalendarFlatRow,
} from './ShowCalendar/ShowCalendarMonthList'

const CURRENT_YEAR = String(new Date().getFullYear())
const CURRENT_SEASON = CURRENT_YEAR
const CURRENT_MONTH = new Date().getMonth() + 1

const MONTH_NAMES_RU = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
]

export default function ShowCalendar() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [exhibitions, setExhibitions] = useState<ShowRkfCalendarEntry[]>([])
  const [years, setYears] = useState<string[]>([CURRENT_YEAR])
  const [filterYear, setFilterYear] = useState(() => searchParams.get('year') || CURRENT_YEAR)
  const [filterMonth, setFilterMonth] = useState(() => {
    const monthParam = searchParams.get('month')
    if (!monthParam || monthParam === 'from_previous') return ''
    return monthParam
  })
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(() => {
    const monthParam = searchParams.get('month')
    if (monthParam && monthParam !== 'all' && monthParam !== 'from_previous') {
      const num = Number(monthParam)
      if (num >= 1 && num <= 12) return new Set([num])
    }
    return new Set([CURRENT_MONTH])
  })
  const [filterBreed, setFilterBreed] = useState(() => searchParams.get('breed') || '')
  const [filterCity, setFilterCity] = useState(() => searchParams.get('city') || '')

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [quickPreset, setQuickPreset] = useState<QuickPreset>(null)
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    getShowRkfCalendarYears().then((list) => {
      if (list.length > 0) setYears(list)
    })
  }, [])

  const { data: calendarData, isLoading: isCalendarLoading, error: calendarError } = useQuery({
    queryKey: ['showCalendar', filterYear],
    queryFn: () => getShowCalendar(filterYear || undefined),
    staleTime: 5 * 60 * 1000,
  })

  // Load breed index for the year (lazy, cached) - only when a breed filter is selected
  const { data: breedCalendarData } = useQuery({
    queryKey: ['showBreedCalendar', filterYear],
    queryFn: () => getShowBreedCalendar(filterYear || CURRENT_YEAR),
    enabled: Boolean(filterBreed),
    staleTime: 10 * 60 * 1000,
  })

  useEffect(() => {
    if (filterMonth && filterMonth !== 'all') {
      const num = Number(filterMonth)
      if (num >= 1 && num <= 12) {
        setExpandedMonths(new Set([num]))
      }
    } else if (filterMonth === 'all') {
      setExpandedMonths(new Set(Array.from({ length: 12 }, (_, i) => i + 1)))
    } else if (exhibitions.length > 0) {
      const latest = findLatestMonthWithProtocols(exhibitions)
      setExpandedMonths(new Set([latest]))
    }
  }, [filterMonth, filterYear, exhibitions])

  useEffect(() => {
    if (calendarData?.success && calendarData.data) setExhibitions(calendarData.data)
    else if (calendarData?.success) setExhibitions([])
  }, [calendarData])

  // Sync state to URL search params (keep clean URL for current season, avoid URL jumping)
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const currentYear = prev.get('year')
        const currentMonth = prev.get('month') || ''
        const currentBreed = prev.get('breed') || ''
        const currentCity = prev.get('city') || ''
        const currentSearch = prev.get('search') || ''

        const targetYear = filterYear && filterYear !== CURRENT_SEASON ? filterYear : null
        const targetMonth = filterMonth || null
        const targetBreed = filterBreed || null
        const targetCity = filterCity.trim() || null
        const targetSearch = searchQuery.trim() || null

        let changed = false
        const params = new URLSearchParams(prev)

        if (targetYear !== null) {
          if (currentYear !== targetYear) {
            params.set('year', targetYear)
            changed = true
          }
        } else if (currentYear) {
          params.delete('year')
          changed = true
        }

        if (targetMonth !== null) {
          if (currentMonth !== targetMonth) {
            params.set('month', targetMonth)
            changed = true
          }
        } else if (currentMonth) {
          params.delete('month')
          changed = true
        }

        if (targetBreed !== null) {
          if (currentBreed !== targetBreed) {
            params.set('breed', targetBreed)
            changed = true
          }
        } else if (currentBreed) {
          params.delete('breed')
          changed = true
        }

        if (targetCity !== null) {
          if (currentCity !== targetCity) {
            params.set('city', targetCity)
            changed = true
          }
        } else if (currentCity) {
          params.delete('city')
          changed = true
        }

        if (targetSearch !== null) {
          if (currentSearch !== targetSearch) {
            params.set('search', targetSearch)
            changed = true
          }
        } else if (currentSearch) {
          params.delete('search')
          changed = true
        }

        return changed ? params : prev
      },
      { replace: true },
    )
  }, [filterYear, filterMonth, filterBreed, filterCity, searchQuery, setSearchParams])

  // Sync URL changes back to state (e.g. browser back/forward or tab switch)
  useEffect(() => {
    const breedFromUrl = searchParams.get('breed') || ''
    if (breedFromUrl !== filterBreed) {
      setFilterBreed(breedFromUrl)
    }

    const cityFromUrl = searchParams.get('city') || ''
    if (cityFromUrl !== filterCity) {
      setFilterCity(cityFromUrl)
    }

    const yearFromUrl = searchParams.get('year') || CURRENT_YEAR
    if (yearFromUrl !== filterYear) {
      setFilterYear(yearFromUrl)
    }

    const monthFromUrl = searchParams.get('month') || ''
    if (monthFromUrl !== filterMonth) {
      setFilterMonth(monthFromUrl)
    }

    const searchFromUrl = searchParams.get('search') || ''
    if (searchFromUrl !== searchQuery) {
      setSearchQuery(searchFromUrl)
    }
  }, [searchParams])

  useEffect(() => {
    setExpandedKeys(new Set())
  }, [filterYear, filterMonth, filterBreed, filterCity, searchQuery, quickPreset])

  // Build matching exhibition IDs for the selected breed
  const allowedExhibitionIds = useMemo(() => {
    if (!filterBreed || !breedCalendarData?.data) return null
    const canon = canonicalBreed(filterBreed).toUpperCase().trim()
    const data = breedCalendarData.data
    const ids = new Set<number>()

    if (data[canon]) {
      for (const id of data[canon]) ids.add(id)
    }
    for (const [key, list] of Object.entries(data)) {
      if (key !== canon && matchesBreedFilter(key, filterBreed)) {
        for (const id of list) ids.add(id)
      }
    }
    return ids
  }, [filterBreed, breedCalendarData])

  // Available breed options for dropdown
  const breedValues = useMemo(() => {
    if (breedCalendarData?.data) {
      return Object.keys(breedCalendarData.data).sort((a, b) => a.localeCompare(b, 'ru'))
    }
    return SHOW_CANDIDATE_BREEDS.map((b) => b.key)
  }, [breedCalendarData])

  // Available cities/locations with count of exhibitions having protocols
  const availableCities = useMemo(() => {
    if (!exhibitions || exhibitions.length === 0) return []
    const counts = new Map<string, number>()
    const hasProtocols = exhibitions.some(exhibitionHasProtocol)
    for (const ex of exhibitions) {
      if (hasProtocols && !exhibitionHasProtocol(ex)) continue
      const city = (ex.city || ex.location || '').trim()
      if (city) {
        counts.set(city, (counts.get(city) || 0) + 1)
      }
    }
    return Array.from(counts.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city, 'ru'))
  }, [exhibitions])

  const isGlobalSearch = Boolean(searchQuery.trim() || filterBreed || filterCity || quickPreset)
  const isAllMonthsSelected = filterMonth === 'all'
  const isSpecificMonthSelected = Boolean(filterMonth && filterMonth !== 'all')

  const effectiveMonths = useMemo(() => {
    if (isGlobalSearch || isAllMonthsSelected) return null
    if (isSpecificMonthSelected) {
      const num = Number(filterMonth)
      return num >= 1 && num <= 12 ? new Set([num]) : null
    }
    if (filterYear !== CURRENT_SEASON) return null
    return expandedMonths
  }, [isGlobalSearch, isAllMonthsSelected, isSpecificMonthSelected, filterMonth, filterYear, expandedMonths])

  const minExpanded = useMemo(() => {
    if (!effectiveMonths || effectiveMonths.size === 0) return null
    return Math.min(...effectiveMonths)
  }, [effectiveMonths])

  const maxExpanded = useMemo(() => {
    if (!effectiveMonths || effectiveMonths.size === 0) return null
    return Math.max(...effectiveMonths)
  }, [effectiveMonths])

  const canExpandPrev = Boolean(minExpanded && minExpanded > 1 && !isGlobalSearch && !isSpecificMonthSelected)
  const canExpandNext = Boolean(maxExpanded && maxExpanded < 12 && !isGlobalSearch && !isSpecificMonthSelected)

  const handleExpandPrevMonth = () => {
    if (!minExpanded || minExpanded <= 1) return
    setExpandedMonths((prev) => new Set([...prev, minExpanded - 1]))
  }

  const handleExpandNextMonth = () => {
    if (!maxExpanded || maxExpanded >= 12) return
    setExpandedMonths((prev) => new Set([...prev, maxExpanded + 1]))
  }

  const filteredGroups = useMemo(
    () =>
      filterShowCalendarGroups(exhibitions, {
        filterMonth,
        filterMonths: effectiveMonths,
        filterBreed,
        allowedExhibitionIds,
        filterCity,
        filterLcOnly: true,
        searchQuery,
        quickPreset,
      }),
    [exhibitions, searchQuery, quickPreset, filterMonth, effectiveMonths, filterBreed, filterCity, allowedExhibitionIds],
  )

  const monthGroups = useMemo(
    () => groupExhibitionsByMonth(filteredGroups),
    [filteredGroups],
  )

  const flatVisible = useMemo(() => {
    const rows: ShowCalendarFlatRow[] = []
    for (const month of monthGroups) {
      rows.push({
        kind: 'month',
        key: `m-${month.key}`,
        label: month.label,
        count: month.events.length,
      })
      for (const group of month.events) {
        rows.push({ kind: 'group', key: `g-${group.key}`, group })
      }
    }
    return rows
  }, [monthGroups])

  const { visibleCount, loadMoreRef, hasMore } = useInfiniteScroll(flatVisible.length, [
    filterYear,
    filterMonth,
    effectiveMonths,
    filterBreed,
    filterCity,
    searchQuery,
    quickPreset,
    flatVisible.length,
  ])

  const visibleRows = flatVisible.slice(0, visibleCount)

  const toggleExpanded = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const sortedYears = useMemo(
    () => [...years].sort((a, b) => Number(b) - Number(a)),
    [years],
  )

  const availableMonths = useMemo(() => {
    if (!exhibitions || exhibitions.length === 0) return undefined
    const set = new Set<string>()
    for (const ex of exhibitions) {
      if (ex.date) {
        const parts = ex.date.split('.')
        if (parts.length === 3) {
          const m = String(parseInt(parts[1], 10))
          if (m && !isNaN(Number(m))) set.add(m)
        }
      }
    }
    return set
  }, [exhibitions])

  const pageToolbar = (
    <PageToolbar
      bare
      topRowClassName="flex-nowrap"
      filters={
        <ShowCalendarToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterYear={filterYear}
          currentSeason={CURRENT_SEASON}
          sortedYears={sortedYears}
          onYearChange={setFilterYear}
          filterMonth={filterMonth}
          onMonthChange={setFilterMonth}
          filterBreed={filterBreed}
          onBreedChange={setFilterBreed}
          filterCity={filterCity}
          onCityChange={setFilterCity}
          cities={availableCities}
          breedValues={breedValues}
          onClearQuickPreset={() => setQuickPreset(null)}
          availableMonths={availableMonths}
        />
      }
    />
  )

  if (isCalendarLoading) {
    return (
      <div className="max-w-full mx-auto pb-2 sm:pb-4">
        <div className="mb-2.5 sm:mb-4">{pageToolbar}</div>
        <SkeletonLoader variant="card" count={6} />
      </div>
    )
  }

  if (calendarError) {
    return (
      <div className="max-w-full mx-auto pb-2 sm:pb-4">
        <div className="mb-2.5 sm:mb-4">{pageToolbar}</div>
        <div className="min-h-[360px] flex items-center justify-center">
          <p className="text-sm text-red-600">
            Ошибка загрузки календаря. Попробуйте позже.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-full mx-auto pb-2 sm:pb-4">
      <div className="mb-2.5 sm:mb-4">{pageToolbar}</div>
      {filteredGroups.length === 0 ? (
        <EmptyState
          title="Выставки не найдены"
          description={
            filterBreed && filterCity
              ? `Для породы «${formatBreedName(filterBreed)}» в локации «${filterCity}» не найдено выставок`
              : filterCity
                ? `В локации «${filterCity}» не найдено выставок с выбранными фильтрами`
                : filterBreed
                  ? `Для породы «${formatBreedName(filterBreed)}» не найдено выставок с выбранными фильтрами`
                  : 'Попробуйте изменить фильтры или поисковый запрос'
          }
        />
      ) : (
        <>
          {canExpandPrev && minExpanded && (
            <div className="flex justify-center mb-3">
              <button
                type="button"
                onClick={handleExpandPrevMonth}
                className="cs-glass-pill px-4 py-1.5 text-xs font-semibold text-charcoal-700 hover:text-charcoal-950 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer select-none"
              >
                <ChevronUp className="w-3.5 h-3.5 text-camel-600" />
                <span>Показать {MONTH_NAMES_RU[minExpanded - 2]}</span>
              </button>
            </div>
          )}
          <ShowCalendarMonthList
            visibleRows={visibleRows}
            expandedKeys={expandedKeys}
            onToggleExpanded={toggleExpanded}
            hasMore={hasMore}
            loadMoreRef={loadMoreRef}
          />
          {canExpandNext && maxExpanded && (
            <div className="flex justify-center mt-3">
              <button
                type="button"
                onClick={handleExpandNextMonth}
                className="cs-glass-pill px-4 py-1.5 text-xs font-semibold text-charcoal-700 hover:text-charcoal-950 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer select-none"
              >
                <span>Показать {MONTH_NAMES_RU[maxExpanded]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-camel-600" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
