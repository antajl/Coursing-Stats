import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useYears, useEvents } from '../../hooks/useApi'
import { useYandexGoal } from '../../components/YandexMetrica'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarFiltersDropdown from '../../components/toolbar/ToolbarFiltersDropdown'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ToolbarTip from '../../components/toolbar/ToolbarTip'
import type { ActiveFilterChip } from '../../components/toolbar/ToolbarActiveFilters'
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
import {
  TOOLBAR_CHIP,
  TOOLBAR_CHIP_ACTIVE,
  TOOLBAR_CHIP_IDLE,
  TOOLBAR_FILTER_CHECKBOX_ROW,
  TOOLBAR_FILTER_SECTION_LABEL,
} from '../../lib/toolbar'

type QuickPreset = 'upcoming30' | 'championships' | null

const CURRENT_SEASON = String(new Date().getFullYear())

const DISCIPLINE_OPTIONS = [
  { value: 'coursing', label: 'Курсинг' },
  { value: 'bzmp', label: 'БЗМП' },
  { value: 'racing', label: 'Бега' },
] as const

const LEGEND = [
  { key: 'coursing', label: 'Курсинг', tip: 'Курсинг борзых' },
  { key: 'bzmp', label: 'БЗМП', tip: 'Бега за механическим зайцем (БЗМП)' },
  { key: 'racing', label: 'Бега', tip: 'Бега борзых' },
  { key: 'other', label: 'Другие', tip: 'Прочие дисциплины' },
] as const

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { reachGoal } = useYandexGoal()
  const [filterYear, setFilterYear] = useState(() => searchParams.get('year') || CURRENT_SEASON)
  const [filterDiscipline, setFilterDiscipline] = useState(() => searchParams.get('discipline') || '')
  const [filterCompetitionKind, setFilterCompetitionKind] = useState(() => searchParams.get('kind') || '')
  const [filterChampionshipsOnly, setFilterChampionshipsOnly] = useState(
    () => searchParams.get('championships') === '1'
  )
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [quickPreset, setQuickPreset] = useState<QuickPreset>(null)

  // Отслеживание просмотра соревнований
  useEffect(() => {
    reachGoal('competition_view')
  }, [reachGoal])

  const { data: yearsData } = useYears()
  const { data: eventsData, isLoading: eventsLoading } = useEvents(filterYear)

  const yearsArray = yearsData?.success && Array.isArray(yearsData.data) ? yearsData.data : []
  const events: CalendarEvent[] =
    eventsData?.success && Array.isArray(eventsData.data) ? eventsData.data : []

  const allYears = yearsArray.map((y: { year?: number } | number) =>
    typeof y === 'object' ? y.year : y
  )
  const sortedYears = useMemo(
    () =>
      [...allYears]
        .map(String)
        .filter(Boolean)
        .sort((a, b) => Number(b) - Number(a)),
    [yearsArray],
  )
  const allCompetitionKinds = [...new Set(events.map((e) => e.competition_kind).filter(Boolean))].sort() as string[]

  const handleResetFilters = () => {
    setFilterYear(CURRENT_SEASON)
    setFilterDiscipline('')
    setFilterCompetitionKind('')
    setFilterChampionshipsOnly(false)
    setQuickPreset(null)
    setSearchQuery('')
  }

  const clearPanelFilters = () => {
    setFilterYear(CURRENT_SEASON)
    setFilterDiscipline('')
    setFilterCompetitionKind('')
    setQuickPreset(null)
  }

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        if (filterYear && filterYear !== CURRENT_SEASON) params.set('year', filterYear)
        else params.delete('year')
        if (filterDiscipline) params.set('discipline', filterDiscipline)
        else params.delete('discipline')
        if (filterCompetitionKind) params.set('kind', filterCompetitionKind)
        else params.delete('kind')
        if (filterChampionshipsOnly) params.set('championships', '1')
        else params.delete('championships')
        if (searchQuery) params.set('search', searchQuery)
        else params.delete('search')
        return params
      },
      { replace: true },
    )
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

  const withResultCount = useMemo(
    () =>
      filteredEvents.filter(
        (e) => Boolean(e.has_results) || Boolean(e.results_url?.trim()),
      ).length,
    [filteredEvents],
  )

  const disciplineLabel =
    DISCIPLINE_OPTIONS.find((d) => d.value === filterDiscipline)?.label || 'Дисциплина'

  const hasPanelFilters = Boolean(
    filterDiscipline || filterCompetitionKind || filterYear !== CURRENT_SEASON,
  )

  const hasActiveFilters = Boolean(
    filterDiscipline ||
      filterCompetitionKind ||
      filterChampionshipsOnly ||
      quickPreset ||
      searchQuery ||
      filterYear !== CURRENT_SEASON,
  )

  const handleYearToggle = (year: string) => {
    setFilterYear(filterYear === year ? '' : year)
    setQuickPreset(null)
  }

  const handleDisciplineToggle = (discipline: string) => {
    setFilterDiscipline(filterDiscipline === discipline ? '' : discipline)
    setQuickPreset(null)
  }

  const handleKindToggle = (kind: string) => {
    setFilterCompetitionKind(filterCompetitionKind === kind ? '' : kind)
  }

  const activeFilterChips = useMemo((): ActiveFilterChip[] => {
    const chips: ActiveFilterChip[] = []

    if (filterYear !== CURRENT_SEASON) {
      chips.push({
        key: 'year',
        label: filterYear || 'Все года',
        onRemove: () => setFilterYear(CURRENT_SEASON),
      })
    }
    if (filterDiscipline) {
      chips.push({
        key: 'discipline',
        label: disciplineLabel,
        onRemove: () => setFilterDiscipline(''),
      })
    }
    if (filterCompetitionKind) {
      chips.push({
        key: 'kind',
        label: filterCompetitionKind,
        onRemove: () => setFilterCompetitionKind(''),
      })
    }
    if (quickPreset === 'upcoming30') {
      chips.push({
        key: 'preset-30',
        label: 'Ближайшие 30 дней',
        onRemove: () => setQuickPreset(null),
      })
    }
    if (quickPreset === 'championships' || filterChampionshipsOnly) {
      chips.push({
        key: 'championships',
        label: 'Чемпионаты и кубки',
        onRemove: () => {
          setQuickPreset(null)
          setFilterChampionshipsOnly(false)
        },
      })
    }

    return chips
  }, [
    searchQuery,
    filterYear,
    filterDiscipline,
    filterCompetitionKind,
    filterChampionshipsOnly,
    quickPreset,
    disciplineLabel,
  ])

  const calendarFilters = (
    <>
      <ToolbarSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Название, клуб, регион…"
      />
      <div className="flex max-w-full flex-wrap items-center gap-1.5">
        <ToolbarFiltersDropdown
          active={hasPanelFilters}
          onReset={clearPanelFilters}
          label="Фильтры"
        >
          <div>
            <p className={TOOLBAR_FILTER_SECTION_LABEL}>Год</p>
            <div className="max-h-36 space-y-0.5 overflow-y-auto">
              {sortedYears.map((year) => (
                <label key={year} className={TOOLBAR_FILTER_CHECKBOX_ROW}>
                  <input
                    type="checkbox"
                    checked={filterYear === year}
                    onChange={() => handleYearToggle(year)}
                  />
                  {year}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className={TOOLBAR_FILTER_SECTION_LABEL}>Дисциплина</p>
            <div className="space-y-0.5">
              {DISCIPLINE_OPTIONS.map((option) => (
                <label key={option.value} className={TOOLBAR_FILTER_CHECKBOX_ROW}>
                  <input
                    type="checkbox"
                    checked={filterDiscipline === option.value}
                    onChange={() => handleDisciplineToggle(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
          {allCompetitionKinds.length > 0 && (
            <div>
              <p className={TOOLBAR_FILTER_SECTION_LABEL}>Вид соревнования</p>
              <div className="max-h-36 space-y-0.5 overflow-y-auto">
                {allCompetitionKinds.map((kind) => (
                  <label key={kind} className={TOOLBAR_FILTER_CHECKBOX_ROW}>
                    <input
                      type="checkbox"
                      checked={filterCompetitionKind === kind}
                      onChange={() => handleKindToggle(kind)}
                    />
                    <span className="truncate">{kind}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </ToolbarFiltersDropdown>
        <button
          type="button"
          onClick={() => {
            setFilterYear(filterYear === CURRENT_SEASON ? '' : CURRENT_SEASON)
            setQuickPreset(null)
          }}
          aria-pressed={filterYear === CURRENT_SEASON}
          className={`${TOOLBAR_CHIP} ${
            filterYear === CURRENT_SEASON ? TOOLBAR_CHIP_ACTIVE : TOOLBAR_CHIP_IDLE
          }`}
        >
          Сезон {CURRENT_SEASON}
        </button>
        <ToolbarTip label="События с сегодняшней даты на 30 дней вперёд">
          <button
            type="button"
            onClick={() => applyQuickPreset('upcoming30')}
            className={`inline-flex ${TOOLBAR_CHIP} ${
              quickPreset === 'upcoming30' ? TOOLBAR_CHIP_ACTIVE : TOOLBAR_CHIP_IDLE
            }`}
            aria-pressed={quickPreset === 'upcoming30'}
          >
            Ближайшие 30 дней
          </button>
        </ToolbarTip>
        <ToolbarTip label="Только чемпионаты, кубки и статусы ЧРКФ / ПЧРКФ">
          <button
            type="button"
            onClick={() => applyQuickPreset('championships')}
            className={`inline-flex gap-1 ${TOOLBAR_CHIP} ${
              quickPreset === 'championships' ? TOOLBAR_CHIP_ACTIVE : TOOLBAR_CHIP_IDLE
            }`}
            aria-pressed={quickPreset === 'championships'}
          >
            <Icons.championship className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            Чемпионаты и кубки
          </button>
        </ToolbarTip>
      </div>
    </>
  )

  const calendarLegend = (
    <div className="flex flex-wrap items-center justify-end gap-x-3.5 gap-y-1">
      {LEGEND.map(({ key, label, tip }) => (
        <ToolbarTip key={key} label={tip}>
          <span className="inline-flex items-center gap-1.5 text-xs text-charcoal-500 dark:text-charcoal-300">
            <span className={`h-2 w-2 rounded-sm ${LEGEND_DOT_COLOR[key]}`} />
            {label}
          </span>
        </ToolbarTip>
      ))}
    </div>
  )

  if (eventsLoading) {
    return (
      <div className="max-w-full mx-auto pb-2 sm:pb-4">
        <div className="mb-4">
          <PageToolbar
            bare
            topRowClassName="pr-28 md:pr-32"
            activeFilterChips={activeFilterChips}
            onClearAllFilters={hasActiveFilters ? handleResetFilters : undefined}
            filters={calendarFilters}
            bottomRight={calendarLegend}
          />
        </div>
        <SkeletonLoader variant="card" count={6} />
      </div>
    )
  }

  return (
    <div className="max-w-full mx-auto pb-2 sm:pb-4">
      <div className="mb-4">
        <PageToolbar
          bare
          topRowClassName="pr-28 md:pr-32"
          activeFilterChips={activeFilterChips}
          onClearAllFilters={hasActiveFilters ? handleResetFilters : undefined}
          filters={calendarFilters}
          bottomLeft={
            <p className="text-xs text-charcoal-500 dark:text-charcoal-300">
              {`Всего событий: ${events.length} · отфильтровано: ${filteredEvents.length} · с результатом: ${withResultCount}`}
              {filterDiscipline && (
                <span className="hidden sm:inline"> · {disciplineLabel}</span>
              )}
            </p>
          }
          bottomRight={calendarLegend}
        />
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
              <div className="sticky top-2 z-10 mb-1.5 flex items-baseline justify-between rounded-lg bg-old-money-100 dark:bg-charcoal-800 px-3.5 py-1.5 font-serif text-sm font-bold text-old-money-700 dark:text-old-money-300">
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
