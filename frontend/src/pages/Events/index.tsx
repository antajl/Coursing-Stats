import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useYears, useEvents } from '../../hooks/useApi'
import { useYandexGoal } from '../../components/YandexMetrica'
import EmptyState from '../../components/EmptyState'
import SkeletonLoader from '../../components/SkeletonLoader'
import {
  type CalendarEvent,
  groupEventsByMonth,
  getEventYear,
  parseDate,
  getEventDiscipline,
  eventMatchesDiscipline,
} from './eventListUtils'
import EventsToolbar, { CURRENT_SEASON } from './EventsToolbar'
import EventsMonthList from './EventsMonthList'
import { initialSeasonYearFilter } from '../../lib/season'

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { reachGoal } = useYandexGoal()
  const [filterYear, setFilterYear] = useState(() =>
    initialSeasonYearFilter(searchParams, CURRENT_SEASON),
  )
  const [filterMonth, setFilterMonth] = useState(() => {
    const monthParam = searchParams.get('month')
    if (!monthParam || monthParam === 'from_previous') return ''
    return monthParam
  })
  const [filterDiscipline, setFilterDiscipline] = useState(() => searchParams.get('discipline') || '')
  const [filterWithProtocol, setFilterWithProtocol] = useState(
    () => searchParams.get('protocol') === '1' || searchParams.get('results') === '1',
  )
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')

  useEffect(() => {
    reachGoal('competition_view')
  }, [reachGoal])

  const { data: yearsData } = useYears()
  const { data: eventsData, isLoading: eventsLoading } = useEvents(filterYear)
  const { data: allEventsData } = useEvents('')

  const yearsArray = yearsData?.success && Array.isArray(yearsData.data) ? yearsData.data : []
  const events: CalendarEvent[] =
    eventsData?.success && Array.isArray(eventsData.data) ? eventsData.data : []

  const sortedYears = useMemo(() => {
    const fromYearsData = yearsArray
      .map((y: { year?: number } | number) => (typeof y === 'object' ? y.year : y))
      .filter((y: unknown): y is number => typeof y === 'number' && Number.isFinite(y))

    const fromAllEvents = Array.isArray(allEventsData?.data)
      ? (allEventsData.data as CalendarEvent[])
          .map((e) => e.year || (e.date_start ? new Date(e.date_start).getFullYear() : undefined))
          .filter((y: unknown): y is number => typeof y === 'number' && Number.isFinite(y))
      : []

    const combined = [...fromYearsData, ...fromAllEvents]
    const years = [CURRENT_SEASON, ...combined]
      .map(String)
      .filter(Boolean)
      .sort((a, b) => Number(b) - Number(a))
      .filter((value, index, self) => self.indexOf(value) === index)

    // Fallback only if years index failed/empty — cover archive range, not just 5 seasons
    if (years.length <= 1) {
      const currentYear = new Date().getFullYear()
      return Array.from({ length: currentYear - 2014 }, (_, i) => String(currentYear - i))
    }

    return years
  }, [yearsArray, allEventsData])

  const availableMonthsByYear = useMemo(() => {
    const map: Record<string, Set<string>> = {}
    const allYearsMonths = new Set<string>()

    const allList = Array.isArray(allEventsData?.data) ? allEventsData.data : []
    const currentList = Array.isArray(eventsData?.data) ? eventsData.data : []
    const listToUse = allList.length > 0 ? allList : currentList

    for (const e of listToUse) {
      const year = String(e.year || (e.date_start ? new Date(e.date_start).getFullYear() : ''))
      const d = parseDate(e.date_start)
      if (!d) continue
      const m = String(d.getMonth() + 1)
      allYearsMonths.add(m)

      if (year) {
        if (!map[year]) map[year] = new Set()
        map[year].add(m)
      }
    }
    map[''] = allYearsMonths
    map['all'] = allYearsMonths
    return map
  }, [allEventsData, eventsData])

  const handleResetFilters = () => {
    setFilterYear(CURRENT_SEASON)
    setFilterMonth('')
    setFilterDiscipline('')
    setFilterWithProtocol(false)
    setSearchQuery('')
  }

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        if (filterYear === '') params.set('year', 'all')
        else if (filterYear !== CURRENT_SEASON) params.set('year', filterYear)
        else params.delete('year')
        if (filterMonth) params.set('month', filterMonth)
        else params.delete('month')
        if (filterDiscipline) params.set('discipline', filterDiscipline)
        else params.delete('discipline')
        if (filterWithProtocol) params.set('protocol', '1')
        else params.delete('protocol')
        params.delete('results')
        params.delete('kind')
        params.delete('championships')
        if (searchQuery) params.set('search', searchQuery)
        else params.delete('search')
        return params
      },
      { replace: true },
    )
  }, [
    filterYear,
    filterMonth,
    filterDiscipline,
    filterWithProtocol,
    searchQuery,
    setSearchParams,
  ])

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        if (filterYear) {
          const year = parseInt(filterYear, 10)
          if (getEventYear(event) !== year) return false
        }
        if (filterMonth) {
          const d = parseDate(event.date_start)
          if (!d || d.getMonth() + 1 !== Number(filterMonth)) return false
        }
        if (filterWithProtocol) {
          const hasProtocol = Boolean(event.has_results) || Boolean(event.results_url?.trim())
          if (!hasProtocol) return false
        }
        if (filterDiscipline && !eventMatchesDiscipline(event, filterDiscipline)) return false

        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          const searchableFields = [
            event.title,
            event.full_title,
            event.location,
            event.host_club,
            event.event_type,
            event.competition_kind,
            event.competition_type,
            event.rank_label,
            event.date_start,
            event.date_end,
          ]
          if (!searchableFields.some((f) => f && f.toString().toLowerCase().includes(query))) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => {
        const aVal = parseDate(a.date_start)
        const bVal = parseDate(b.date_start)
        if (aVal == null && bVal == null) return 0
        if (aVal == null) return 1
        if (bVal == null) return -1
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      })
  }, [
    events,
    filterYear,
    filterMonth,
    filterWithProtocol,
    filterDiscipline,
    searchQuery,
  ])

  const monthGroups = useMemo(() => groupEventsByMonth(filteredEvents), [filteredEvents])
  const withResultCount = useMemo(
    () =>
      filteredEvents.filter(
        (e) => Boolean(e.has_results) || Boolean(e.results_url?.trim()),
      ).length,
    [filteredEvents],
  )

  const toolbar = (
    <EventsToolbar
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      filterYear={filterYear}
      onFilterYearChange={setFilterYear}
      filterMonth={filterMonth}
      onFilterMonthChange={setFilterMonth}
      filterDiscipline={filterDiscipline}
      onFilterDisciplineChange={setFilterDiscipline}
      filterWithProtocol={filterWithProtocol}
      onFilterWithProtocolChange={setFilterWithProtocol}
      sortedYears={sortedYears}
      availableMonthsByYear={availableMonthsByYear}
      onResetFilters={handleResetFilters}
      stats={
        eventsLoading
          ? undefined
          : {
              total: events.length,
              filtered: filteredEvents.length,
              withResult: withResultCount,
            }
      }
    />
  )

  if (eventsLoading) {
    return (
      <div className="max-w-full mx-auto pb-2 sm:pb-4">
        <div className="mb-4">{toolbar}</div>
        <SkeletonLoader variant="card" count={6} />
      </div>
    )
  }

  return (
    <div className="max-w-full mx-auto pb-2 sm:pb-4">
      <div className="mb-4">{toolbar}</div>

      {filteredEvents.length === 0 ? (
        <EmptyState
          title="События не найдены"
          description="Попробуйте изменить фильтры или поисковый запрос"
        />
      ) : (
        <EventsMonthList monthGroups={monthGroups} reveal />
      )}
    </div>
  )
}
