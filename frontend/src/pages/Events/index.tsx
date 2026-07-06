import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useYears, useEvents } from '../../hooks/useApi'
import FilterSelect from '../../components/FilterSelect'
import EmptyState from '../../components/EmptyState'
import SkeletonLoader from '../../components/SkeletonLoader'
import { Icons } from '../../lib/icons'
import EventListRow from './EventListRow'
import {
  type CalendarEvent,
  LEGEND_DOT_COLOR,
  groupEventsByMonth,
  getEventYear,
  isImportantCompetition,
  parseDate,
} from './eventListUtils'

type QuickPreset = 'upcoming30' | 'championships' | null

const DISCIPLINE_OPTIONS = [
  { value: 'coursing', label: 'Курсинг' },
  { value: 'bzmp', label: 'БЗМП' },
  { value: 'racing', label: 'Бега' },
] as const

const LEGEND = [
  { key: 'coursing', label: 'Курсинг' },
  { key: 'bzmp', label: 'БЗМП' },
  { key: 'racing', label: 'Бега' },
  { key: 'other', label: 'Другие' },
] as const

import {
  TOOLBAR_CHIP,
  TOOLBAR_CHIP_ACTIVE,
  TOOLBAR_CHIP_IDLE,
} from '../../lib/toolbar'

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterYear, setFilterYear] = useState(() => searchParams.get('year') || '2026')
  const [filterDiscipline, setFilterDiscipline] = useState(() => searchParams.get('discipline') || '')
  const [filterCompetitionKind, setFilterCompetitionKind] = useState(() => searchParams.get('kind') || '')
  const [filterChampionshipsOnly, setFilterChampionshipsOnly] = useState(
    () => searchParams.get('championships') === '1'
  )
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [quickPreset, setQuickPreset] = useState<QuickPreset>(null)

  const { data: yearsData } = useYears()
  const { data: eventsData, isLoading: eventsLoading } = useEvents(filterYear)

  const yearsArray = yearsData?.success && Array.isArray(yearsData.data) ? yearsData.data : []
  const events: CalendarEvent[] =
    eventsData?.success && Array.isArray(eventsData.data) ? eventsData.data : []

  const allYears = yearsArray.map((y: { year?: number } | number) =>
    typeof y === 'object' ? y.year : y
  )
  const allCompetitionKinds = [...new Set(events.map((e) => e.competition_kind).filter(Boolean))].sort()

  const handleResetFilters = () => {
    setFilterYear('2026')
    setFilterDiscipline('')
    setFilterCompetitionKind('')
    setFilterChampionshipsOnly(false)
    setQuickPreset(null)
    setSearchQuery('')
  }

  useEffect(() => {
    const params = new URLSearchParams()
    if (filterYear !== '2026') params.set('year', filterYear)
    if (filterDiscipline) params.set('discipline', filterDiscipline)
    if (filterCompetitionKind) params.set('kind', filterCompetitionKind)
    if (filterChampionshipsOnly) params.set('championships', '1')
    if (searchQuery) params.set('search', searchQuery)
    setSearchParams(params)
  }, [
    filterYear,
    filterDiscipline,
    filterCompetitionKind,
    filterChampionshipsOnly,
    searchQuery,
    setSearchParams,
  ])

  const applyQuickPreset = (preset: QuickPreset) => {
    if (quickPreset === preset) {
      handleResetFilters()
      return
    }

    setQuickPreset(preset)

    if (preset === 'upcoming30') {
      setFilterDiscipline('')
      setFilterChampionshipsOnly(false)
      return
    }

    if (preset === 'championships') {
      setFilterChampionshipsOnly(true)
      setFilterDiscipline('')
    }
  }

  const filteredEvents = useMemo(() => {
    const upcomingRange =
      quickPreset === 'upcoming30'
        ? (() => {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const in30 = new Date(today)
            in30.setDate(in30.getDate() + 30)
            return { from: today, to: in30 }
          })()
        : null

    return events
      .filter((event) => {
        if (filterYear) {
          const year = parseInt(filterYear, 10)
          if (getEventYear(event) !== year) return false
        }
        if (filterDiscipline && event.event_type !== filterDiscipline) return false
        if (filterCompetitionKind && event.competition_kind !== filterCompetitionKind) return false
        if (filterChampionshipsOnly && !isImportantCompetition(event.competition_kind)) return false

        if (upcomingRange) {
          const start = parseDate(event.date_start)
          if (!start || start < upcomingRange.from || start > upcomingRange.to) return false
        }

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
    filterDiscipline,
    filterCompetitionKind,
    filterChampionshipsOnly,
    quickPreset,
    searchQuery,
  ])

  const monthGroups = useMemo(() => groupEventsByMonth(filteredEvents), [filteredEvents])

  const SearchIcon = Icons.search
  const disciplineLabel =
    DISCIPLINE_OPTIONS.find((d) => d.value === filterDiscipline)?.label || 'Дисциплина'

  if (eventsLoading) {
    return <SkeletonLoader variant="card" count={6} />
  }

  return (
    <div className="max-w-full mx-auto pb-2 sm:pb-4">
      <div className="mb-4 flex max-w-full flex-col gap-2">
        <div className="flex w-full flex-wrap items-center gap-2">
            <div className="flex h-9 w-[280px] shrink-0 items-center gap-2 rounded-[10px] border-[1.5px] border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-3">
              <SearchIcon className="h-3.5 w-3.5 shrink-0 text-charcoal-500" strokeWidth={1.75} />
              <input
                type="text"
                placeholder="Название, клуб, регион…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-w-0 border-none bg-transparent text-xs font-medium text-charcoal-800 dark:text-charcoal-200 outline-none placeholder:text-charcoal-400"
              />
            </div>

            <FilterSelect
              ariaLabel="Год"
              value={filterYear}
              onChange={(v) => {
                setFilterYear(v)
                setQuickPreset(null)
              }}
              allLabel="Все года"
              options={allYears
                .sort((a, b) => Number(b) - Number(a))
                .map((y) => ({ value: String(y), label: String(y) }))}
              className="min-w-[96px]"
            />

            <FilterSelect
              ariaLabel="Дисциплина"
              value={filterDiscipline}
              onChange={(v) => {
                setFilterDiscipline(v)
                setQuickPreset(null)
              }}
              allLabel="Все дисциплины"
              options={DISCIPLINE_OPTIONS.map((d) => ({ value: d.value, label: d.label }))}
              className="min-w-[140px] hidden sm:block"
            />

            <FilterSelect
              ariaLabel="Вид соревнования"
              value={filterCompetitionKind}
              onChange={setFilterCompetitionKind}
              allLabel="Все соревнования"
              options={allCompetitionKinds.map((k) => ({ value: k!, label: k! }))}
              className="min-w-[168px] hidden lg:block"
            />

            {(filterDiscipline ||
              filterCompetitionKind ||
              filterChampionshipsOnly ||
              quickPreset ||
              searchQuery) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-9 shrink-0 px-1 text-xs font-medium text-charcoal-500 underline-offset-2 hover:text-camel-700 hover:underline dark:text-charcoal-400 dark:hover:text-camel-400"
              >
                Сбросить
              </button>
            )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => applyQuickPreset('upcoming30')}
              className={`inline-flex ${TOOLBAR_CHIP} ${
                quickPreset === 'upcoming30' ? TOOLBAR_CHIP_ACTIVE : TOOLBAR_CHIP_IDLE
              }`}
            >
              Ближайшие 30 дней
            </button>
            <button
              type="button"
              onClick={() => applyQuickPreset('championships')}
              className={`inline-flex gap-1 ${TOOLBAR_CHIP} ${
                quickPreset === 'championships' ? TOOLBAR_CHIP_ACTIVE : TOOLBAR_CHIP_IDLE
              }`}
            >
              <Icons.championship className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              Чемпионаты и кубки
            </button>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex flex-wrap items-center justify-end gap-x-3.5 gap-y-1">
              {LEGEND.map(({ key, label }) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 text-xs text-charcoal-500 dark:text-charcoal-300"
                >
                  <span className={`h-2 w-2 rounded-sm ${LEGEND_DOT_COLOR[key]}`} />
                  {label}
                </span>
              ))}
            </div>
            <p className="text-xs text-charcoal-500 dark:text-charcoal-300">
              Всего событий: {events.length} · отфильтровано: {filteredEvents.length}
              {filterDiscipline && (
                <span className="hidden sm:inline"> · {disciplineLabel}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <EmptyState
          title="События не найдены"
          description="Попробуйте изменить фильтры или поисковый запрос"
        />
      ) : (
        <div>
          {monthGroups.map((group) => (
            <div key={group.key} className="mb-1.5">
              <div className="sticky top-2 z-10 mb-1.5 flex items-baseline justify-between rounded-[10px] bg-old-money-100 dark:bg-charcoal-800 px-3.5 py-1.5 font-serif text-sm font-bold text-old-money-700 dark:text-old-money-300">
                <span>{group.label}</span>
                <span className="font-mono text-xs font-normal text-charcoal-500 dark:text-charcoal-300">
                  {group.events.length}{' '}
                  {group.events.length === 1 ? 'событие' : group.events.length < 5 ? 'события' : 'событий'}
                </span>
              </div>
              {group.events.map((event) => (
                <EventListRow key={event.id} event={event} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
