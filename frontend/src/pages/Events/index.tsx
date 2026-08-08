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
  isImportantCompetition,
  parseDate,
} from './eventListUtils'
import EventsToolbar, {
  CURRENT_SEASON,
  type EventsQuickPreset,
} from './EventsToolbar'
import EventsMonthList from './EventsMonthList'

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { reachGoal } = useYandexGoal()
  const [filterYear, setFilterYear] = useState(() => searchParams.get('year') || CURRENT_SEASON)
  const [filterMonth, setFilterMonth] = useState(() => {
    const monthParam = searchParams.get('month')
    if (!monthParam || monthParam === 'from_previous') return ''
    return monthParam
  })
  const [filterDiscipline, setFilterDiscipline] = useState(() => searchParams.get('discipline') || '')
  const [filterCompetitionKind, setFilterCompetitionKind] = useState(() => searchParams.get('kind') || '')
  const [filterChampionshipsOnly, setFilterChampionshipsOnly] = useState(
    () => searchParams.get('championships') === '1',
  )
  const [filterWithProtocol, setFilterWithProtocol] = useState(
    () => searchParams.get('protocol') === '1' || searchParams.get('results') === '1',
  )
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [quickPreset, setQuickPreset] = useState<EventsQuickPreset>(null)

  useEffect(() => {
    reachGoal('competition_view')
  }, [reachGoal])

  const { data: yearsData } = useYears()
  const { data: eventsData, isLoading: eventsLoading } = useEvents(filterYear)

  const yearsArray = yearsData?.success && Array.isArray(yearsData.data) ? yearsData.data : []
  const events: CalendarEvent[] =
    eventsData?.success && Array.isArray(eventsData.data) ? eventsData.data : []

  const sortedYears = useMemo(() => {
    const allYears = yearsArray
      .map((y: { year?: number } | number) => (typeof y === 'object' ? y.year : y))
      .filter((y): y is number => typeof y === 'number' && Number.isFinite(y))

    const years = [CURRENT_SEASON, ...allYears]
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
  }, [yearsArray])

  const allCompetitionKinds = [
    ...new Set(events.map((e) => e.competition_kind).filter(Boolean)),
  ].sort() as string[]

  const handleResetFilters = () => {
    setFilterYear(CURRENT_SEASON)
    setFilterMonth('')
    setFilterDiscipline('')
    setFilterCompetitionKind('')
    setFilterChampionshipsOnly(false)
    setFilterWithProtocol(false)
    setQuickPreset(null)
    setSearchQuery('')
  }

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        if (filterYear && filterYear !== CURRENT_SEASON) params.set('year', filterYear)
        else params.delete('year')
        if (filterMonth) params.set('month', filterMonth)
        else params.delete('month')
        if (filterDiscipline) params.set('discipline', filterDiscipline)
        else params.delete('discipline')
        if (filterCompetitionKind) params.set('kind', filterCompetitionKind)
        else params.delete('kind')
        if (filterChampionshipsOnly) params.set('championships', '1')
        else params.delete('championships')
        if (filterWithProtocol) params.set('protocol', '1')
        else params.delete('protocol')
        params.delete('results')
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
    filterCompetitionKind,
    filterChampionshipsOnly,
    filterWithProtocol,
    searchQuery,
    setSearchParams,
  ])

  const applyChampionshipsPreset = () => {
    if (quickPreset === 'championships') {
      handleResetFilters()
      return
    }
    setQuickPreset('championships')
    setFilterChampionshipsOnly(true)
    setFilterDiscipline('')
  }

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
        if (filterDiscipline && event.event_type !== filterDiscipline) return false
        if (filterCompetitionKind && event.competition_kind !== filterCompetitionKind) return false
        if (filterChampionshipsOnly && !isImportantCompetition(event.competition_kind)) return false

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
    filterCompetitionKind,
    filterChampionshipsOnly,
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
      filterCompetitionKind={filterCompetitionKind}
      onFilterCompetitionKindChange={setFilterCompetitionKind}
      filterChampionshipsOnly={filterChampionshipsOnly}
      onClearChampionships={() => {
        setQuickPreset(null)
        setFilterChampionshipsOnly(false)
      }}
      filterWithProtocol={filterWithProtocol}
      onFilterWithProtocolChange={setFilterWithProtocol}
      quickPreset={quickPreset}
      onClearQuickPreset={() => setQuickPreset(null)}
      onChampionshipsPreset={applyChampionshipsPreset}
      sortedYears={sortedYears}
      allCompetitionKinds={allCompetitionKinds}
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
