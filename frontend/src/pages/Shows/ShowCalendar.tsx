import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
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
import { MONTH_FILTER_OPTIONS } from '../Events/eventListUtils'
import {
  filterShowCalendarGroups,
  groupExhibitionsByMonth,
} from './showCalendarDate'
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
  const [filterBreed, setFilterBreed] = useState(() => searchParams.get('breed') || '')

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

  // Load breed index for the year (lazy, cached)
  const { data: breedCalendarData } = useQuery({
    queryKey: ['showBreedCalendar', filterYear],
    queryFn: () => getShowBreedCalendar(filterYear || CURRENT_YEAR),
    staleTime: 10 * 60 * 1000,
  })

  useEffect(() => {
    if (calendarData?.success && calendarData.data) setExhibitions(calendarData.data)
    else if (calendarData?.success) setExhibitions([])
  }, [calendarData])

  // Sync state to URL search params
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        if (filterYear) params.set('year', filterYear)
        else params.delete('year')
        if (filterMonth) params.set('month', filterMonth)
        else params.delete('month')
        if (filterBreed) params.set('breed', filterBreed)
        else params.delete('breed')
        if (searchQuery) params.set('search', searchQuery)
        else params.delete('search')

        return params
      },
      { replace: true },
    )
  }, [filterYear, filterMonth, filterBreed, searchQuery, setSearchParams])

  // Sync URL changes back to state (e.g. browser back/forward or tab switch)
  useEffect(() => {
    const breedFromUrl = searchParams.get('breed') || ''
    if (breedFromUrl !== filterBreed) {
      setFilterBreed(breedFromUrl)
    }
  }, [searchParams])

  useEffect(() => {
    setExpandedKeys(new Set())
  }, [filterYear, filterMonth, filterBreed, searchQuery, quickPreset])

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

  const filteredGroups = useMemo(
    () =>
      filterShowCalendarGroups(exhibitions, {
        filterMonth,
        filterBreed,
        allowedExhibitionIds,
        filterLcOnly: true,
        searchQuery,
        quickPreset,
      }),
    [exhibitions, searchQuery, quickPreset, filterMonth, filterBreed, allowedExhibitionIds],
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
    filterBreed,
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

  const countSummary = useMemo(() => {
    if (filterBreed) {
      return `Выставок с породой «${formatBreedName(filterBreed)}»: ${filteredGroups.length} за ${filterYear || CURRENT_SEASON} год`
    }
    return `Выставок с протоколом: ${filteredGroups.length} за ${filterYear || CURRENT_SEASON} год`
  }, [filterBreed, filteredGroups.length, filterYear])

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
          breedValues={breedValues}
          onClearQuickPreset={() => setQuickPreset(null)}
          availableMonths={availableMonths}
          totalCount={filteredGroups.length}
        />
      }
      bottomLeft={
        <div className="hidden sm:flex items-center gap-2 text-xs text-charcoal-500">
          <p>{countSummary}</p>
        </div>
      }
      bottomRowClassName="hidden sm:flex"
    />
  )

  if (isCalendarLoading) {
    return (
      <div className="max-w-full mx-auto pb-2 sm:pb-4">
        <div className="mb-4">{pageToolbar}</div>
        <SkeletonLoader variant="card" count={6} />
      </div>
    )
  }

  if (calendarError) {
    return (
      <div className="max-w-full mx-auto pb-2 sm:pb-4">
        <div className="mb-4">{pageToolbar}</div>
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
      <div className="mb-4">{pageToolbar}</div>
      {filteredGroups.length === 0 ? (
        <EmptyState
          title="Выставки не найдены"
          description={
            filterBreed
              ? `Для породы «${formatBreedName(filterBreed)}» не найдено выставок с выбранными фильтрами`
              : 'Попробуйте изменить фильтры или поисковый запрос'
          }
        />
      ) : (
        <ShowCalendarMonthList
          visibleRows={visibleRows}
          expandedKeys={expandedKeys}
          onToggleExpanded={toggleExpanded}
          hasMore={hasMore}
          loadMoreRef={loadMoreRef}
        />
      )}
    </div>
  )
}
