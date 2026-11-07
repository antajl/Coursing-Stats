import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
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
import { useShowBreedAliases } from '../../hooks/useStaticData'
import type { DogsIndexEntry } from '../../lib/competingBreeds'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import {
  filterShowCalendarGroups,
  findLatestMonthWithProtocols,
  getMonthsWithProtocols,
  groupExhibitionsByMonth,
  monthLabel,
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
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
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

  const { data: breedAliases = [] } = useShowBreedAliases()
  const officialBreedsSet = useMemo(() => new Set(breedAliases.map((b) => canonicalBreed(b))), [breedAliases])

  // Load breed index for the year (cached, fast)
  const { data: breedCalendarData } = useQuery({
    queryKey: ['showBreedCalendar', filterYear],
    queryFn: () => getShowBreedCalendar(filterYear || CURRENT_YEAR),
    staleTime: 10 * 60 * 1000,
  })

  useEffect(() => {
    if (calendarData?.success && calendarData.data) setExhibitions(calendarData.data)
    else if (calendarData?.success) setExhibitions([])
  }, [calendarData])

  const defaultMonth = useMemo(() => {
    if (exhibitions.length > 0) {
      return findLatestMonthWithProtocols(exhibitions)
    }
    return CURRENT_MONTH
  }, [exhibitions])

  const activeMonth = useMemo(() => {
    if (filterMonth === 'all') return null
    if (filterMonth) {
      const num = Number(filterMonth)
      if (num >= 1 && num <= 12) return num
    }
    return defaultMonth
  }, [filterMonth, defaultMonth])

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
        const targetMonth =
          filterMonth === 'all'
            ? 'all'
            : filterMonth && Number(filterMonth) !== defaultMonth
              ? filterMonth
              : null
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

  // Available breed options for dropdown with counts
  const { breedValues, breedDogIndex } = useMemo(() => {
    if (breedCalendarData?.data) {
      const counts = new Map<string, number>()
      for (const [rawBreed, ids] of Object.entries(breedCalendarData.data)) {
        const canon = canonicalBreed(rawBreed)
        if (!canon || canon.startsWith('*') || canon === 'БЕЗ ПОРОДЫ') continue
        if (officialBreedsSet.size > 0 && !officialBreedsSet.has(canon)) continue
        const count = Array.isArray(ids) ? ids.length : 1
        counts.set(canon, (counts.get(canon) || 0) + count)
      }
      const idx: DogsIndexEntry[] = []
      const list: string[] = []
      for (const [breed, count] of counts.entries()) {
        idx.push({ breed, dog_count: count, competition_count: count })
        list.push(breed)
      }
      list.sort((a, b) => {
        const diff = (counts.get(b) || 0) - (counts.get(a) || 0)
        if (diff !== 0) return diff
        return a.localeCompare(b, 'ru')
      })
      return { breedValues: list, breedDogIndex: idx }
    }
    return {
      breedValues: SHOW_CANDIDATE_BREEDS.map((b) => b.key),
      breedDogIndex: undefined,
    }
  }, [breedCalendarData, officialBreedsSet])

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

  const effectiveMonths = useMemo(() => {
    if (isGlobalSearch || isAllMonthsSelected || activeMonth === null) return null
    return new Set([activeMonth])
  }, [isGlobalSearch, isAllMonthsSelected, activeMonth])

  const monthsWithData = useMemo(
    () => getMonthsWithProtocols(exhibitions),
    [exhibitions],
  )

  const prevMonthNumber = useMemo(() => {
    if (!activeMonth || monthsWithData.length === 0) return null
    const smaller = monthsWithData.filter((m) => m < activeMonth)
    if (smaller.length > 0) return smaller[smaller.length - 1]
    if (activeMonth > 1) return activeMonth - 1
    return null
  }, [activeMonth, monthsWithData])

  const nextMonthNumber = useMemo(() => {
    if (!activeMonth || monthsWithData.length === 0) return null
    const larger = monthsWithData.filter((m) => m > activeMonth)
    if (larger.length > 0) return larger[0]
    return null
  }, [activeMonth, monthsWithData])

  const canGoPrev = Boolean(prevMonthNumber && !isGlobalSearch && !isAllMonthsSelected)
  const canGoNext = Boolean(nextMonthNumber && !isGlobalSearch && !isAllMonthsSelected)

  const handleGoPrev = () => {
    if (!prevMonthNumber) return
    setFilterMonth(String(prevMonthNumber))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleGoNext = () => {
    if (!nextMonthNumber) return
    setFilterMonth(String(nextMonthNumber))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const prevMonthLabel = prevMonthNumber ? MONTH_NAMES_RU[prevMonthNumber - 1] : null
  const nextMonthLabel = nextMonthNumber ? MONTH_NAMES_RU[nextMonthNumber - 1] : null

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
    if (filteredGroups.length === 0 && activeMonth && !isGlobalSearch) {
      const year = Number(filterYear) || Number(CURRENT_SEASON)
      rows.push({
        kind: 'month',
        key: `m-${year}-${String(activeMonth).padStart(2, '0')}`,
        label: monthLabel(year, activeMonth - 1),
        count: 0,
      })
      return rows
    }
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
  }, [monthGroups, filteredGroups.length, activeMonth, isGlobalSearch, filterYear])

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
    if (monthsWithData.length === 0) return undefined
    return new Set(monthsWithData.map(String))
  }, [monthsWithData])

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
          filterMonth={filterMonth || (activeMonth ? String(activeMonth) : '')}
          onMonthChange={setFilterMonth}
          filterBreed={filterBreed}
          onBreedChange={setFilterBreed}
          filterCity={filterCity}
          onCityChange={setFilterCity}
          cities={availableCities}
          breedValues={breedValues}
          dogIndex={breedDogIndex}
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
      {filteredGroups.length === 0 && isGlobalSearch ? (
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
          <ShowCalendarMonthList
            visibleRows={visibleRows}
            expandedKeys={expandedKeys}
            onToggleExpanded={toggleExpanded}
            hasMore={hasMore}
            loadMoreRef={loadMoreRef}
            prevMonthLabel={prevMonthLabel}
            nextMonthLabel={nextMonthLabel}
            onGoPrev={canGoPrev ? handleGoPrev : undefined}
            onGoNext={canGoNext ? handleGoNext : undefined}
          />
          {canGoNext && nextMonthLabel && (
            <div className="flex justify-center mt-3.5 sm:mt-5 mb-2">
              <button
                type="button"
                onClick={handleGoNext}
                className="cs-glass-pill inline-flex h-9 items-center gap-2 rounded-full px-5 text-xs sm:text-sm font-semibold !text-charcoal-700 hover:!text-charcoal-950 transition-all cursor-pointer select-none shadow-xs active:scale-95"
              >
                <span>Показать {nextMonthLabel}</span>
                <ChevronDown className="w-4 h-4 text-camel-600" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
