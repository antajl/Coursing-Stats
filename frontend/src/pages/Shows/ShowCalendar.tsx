import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import PageToolbar from '../../components/toolbar/PageToolbar'
import EmptyState from '../../components/EmptyState'
import SkeletonLoader from '../../components/SkeletonLoader'
import {
  getShowCalendar,
  getShowRkfCalendarYears,
  type ShowRkfCalendarEntry,
} from '../../lib/staticData'
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
  const [filterLcOnly, setFilterLcOnly] = useState(() => searchParams.get('lc') === '1')
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [quickPreset, setQuickPreset] = useState<QuickPreset>(null)
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => new Set())
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false)
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false)

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

  useEffect(() => {
    if (calendarData?.success && calendarData.data) setExhibitions(calendarData.data)
    else if (calendarData?.success) setExhibitions([])
  }, [calendarData])

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        if (filterYear) params.set('year', filterYear)
        else params.delete('year')
        if (filterMonth) params.set('month', filterMonth)
        else params.delete('month')
        if (searchQuery) params.set('search', searchQuery)
        else params.delete('search')
        if (filterLcOnly) params.set('lc', '1')
        else params.delete('lc')
        return params
      },
      { replace: true },
    )
  }, [filterYear, filterMonth, searchQuery, filterLcOnly, setSearchParams])

  useEffect(() => {
    setExpandedKeys(new Set())
  }, [filterYear, filterMonth, filterLcOnly, searchQuery, quickPreset])

  const filteredGroups = useMemo(
    () =>
      filterShowCalendarGroups(exhibitions, {
        filterMonth,
        filterLcOnly,
        searchQuery,
        quickPreset,
      }),
    [exhibitions, searchQuery, filterLcOnly, quickPreset, filterMonth],
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
    filterLcOnly,
    searchQuery,
    quickPreset,
    flatVisible.length,
  ])

  const visibleRows = flatVisible.slice(0, visibleCount)
  const withResultCount = useMemo(
    () => filteredGroups.filter((g) => g.hasProtocol).length,
    [filteredGroups],
  )
  const hasActiveFilters = Boolean(
    filterYear !== CURRENT_SEASON || filterMonth || searchQuery || filterLcOnly || quickPreset,
  )

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = []
    if (filterYear !== CURRENT_SEASON) {
      chips.push({
        key: 'year',
        label: filterYear || 'Все года',
        onRemove: () => setFilterYear(CURRENT_SEASON),
      })
    }
    if (filterMonth) {
      chips.push({
        key: 'month',
        label: MONTH_FILTER_OPTIONS.find((m) => m.value === filterMonth)?.label || filterMonth,
        onRemove: () => setFilterMonth(''),
      })
    }
    if (quickPreset === 'upcoming30') {
      chips.push({
        key: 'preset-30',
        label: 'Ближайшие 30 дней',
        onRemove: () => setQuickPreset(null),
      })
    }
    if (filterLcOnly) {
      chips.push({
        key: 'lc',
        label: 'С протоколом',
        onRemove: () => setFilterLcOnly(false),
      })
    }
    return chips
  }, [filterLcOnly, filterYear, filterMonth, quickPreset])

  const handleResetFilters = () => {
    setFilterYear(CURRENT_SEASON)
    setFilterMonth('')
    setSearchQuery('')
    setFilterLcOnly(false)
    setQuickPreset(null)
  }

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

  const pageToolbar = (
    <PageToolbar
      bare
      topRowClassName="pr-28 md:pr-32"
      activeFilterChips={activeFilterChips}
      onClearAllFilters={hasActiveFilters ? handleResetFilters : undefined}
      filters={
        <ShowCalendarToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterYear={filterYear}
          currentSeason={CURRENT_SEASON}
          sortedYears={sortedYears}
          onYearChange={setFilterYear}
          yearDropdownOpen={yearDropdownOpen}
          onYearDropdownOpenChange={setYearDropdownOpen}
          filterMonth={filterMonth}
          onMonthChange={setFilterMonth}
          monthDropdownOpen={monthDropdownOpen}
          onMonthDropdownOpenChange={setMonthDropdownOpen}
          filterLcOnly={filterLcOnly}
          onLcOnlyChange={setFilterLcOnly}
          onClearQuickPreset={() => setQuickPreset(null)}
        />
      }
      bottomLeft={
        <p className="text-xs text-charcoal-500 dark:text-charcoal-300">
          {`Всего событий: ${exhibitions.length} · отфильтровано: ${filteredGroups.length} · с результатом: ${withResultCount}`}
        </p>
      }
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
          <p className="text-sm text-red-600 dark:text-red-400">
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
          description="Попробуйте изменить фильтры или поисковый запрос"
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
