import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarFiltersDropdown from '../../components/toolbar/ToolbarFiltersDropdown'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ToolbarTip from '../../components/toolbar/ToolbarTip'
import EmptyState from '../../components/EmptyState'
import SkeletonLoader from '../../components/SkeletonLoader'
import {
  getShowCalendar,
  getShowRkfCalendarYears,
  type ShowRkfCalendarEntry,
} from '../../lib/staticData'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import {
  TOOLBAR_CHIP,
  TOOLBAR_CHIP_ACTIVE,
  TOOLBAR_CHIP_IDLE,
  TOOLBAR_FILTER_CHECKBOX_ROW,
  TOOLBAR_FILTER_SECTION_LABEL,
} from '../../lib/toolbar'
import { resolveRkfOnlineExhibitionUrl } from '../../lib/rkfLinks'
import { isLocalDev } from '../../lib/env'
import { fetchJson } from '../../lib/staticData/core'
import {
  collectGroupRanks,
  formatNkpDisplay,
  groupMatchesSearch,
  groupRkfMonoVariants,
  type RkfCalendarGroup,
} from './showCalendarGroup'

const CURRENT_YEAR = String(new Date().getFullYear())
const CURRENT_SEASON = CURRENT_YEAR

type QuickPreset = 'upcoming30' | null

function parseShowDate(dateStr: string): Date | null {
  if (!dateStr) return null
  const parts = dateStr.split('.')
  if (parts.length !== 3) return null
  const [day, month, year] = parts.map(Number)
  return new Date(year, month - 1, day)
}

/** Calendar-day compare in local time (same as parseShowDate). */
function isShowNotStartedYet(dateStr: string): boolean {
  const start = parseShowDate(dateStr)
  if (!start) return false
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return start.getTime() > today.getTime()
}

function formatShowDate(dateStr: string): string | null {
  const date = parseShowDate(dateStr)
  if (!date) return null
  const day = date.getDate()
  const month = date.toLocaleDateString('ru-RU', { month: 'short' })
  return `${day} ${month}`
}

/** Подзаголовок mono: НКП или список пород. */
function monoSubtitle(exhibition: ShowRkfCalendarEntry): string | null {
  const nkp = exhibition.national_breed_club_name?.trim()
  if (nkp) return formatNkpDisplay(nkp)
  const breeds = exhibition.breeds?.trim()
  return breeds || null
}

function rankTokens(exhibition: ShowRkfCalendarEntry): string[] {
  const raw = exhibition.ranks || exhibition.rank || ''
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

const RANK_CHIP =
  'inline-flex h-5 shrink-0 items-center justify-center rounded-md bg-old-money-100/90 px-1.5 font-mono text-xs font-semibold text-charcoal-600 dark:bg-charcoal-700/90 dark:text-charcoal-200'

/** Equal-width paired text buttons: Источник + Отчёт (or muted empty label). */
const OUTBOUND_BTN =
  'relative z-10 inline-flex h-5 w-[6.75rem] shrink-0 items-center justify-center whitespace-nowrap rounded-md text-[11px] font-medium leading-none'
const OUTBOUND_BTN_LINK = `${OUTBOUND_BTN} bg-old-money-100/90 text-camel-700 transition-colors hover:bg-old-money-200/90 hover:text-camel-800 dark:bg-charcoal-700/90 dark:text-camel-400 dark:hover:bg-charcoal-600/90 dark:hover:text-camel-300`
const OUTBOUND_BTN_MUTED = `${OUTBOUND_BTN} text-charcoal-400 dark:text-charcoal-500`

function OutboundLinks({
  rkfUrl,
  reportUrl,
  notStartedYet,
}: {
  rkfUrl: string
  reportUrl: string | null
  notStartedYet: boolean
}) {
  const reportEmptyLabel = notStartedYet ? 'Ожидается' : 'Отчёта нет'

  return (
    <>
      <a
        href={rkfUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={OUTBOUND_BTN_LINK}
        title="Открыть на rkf.online"
        aria-label="Источник на rkf.online"
      >
        Источник
      </a>
      {reportUrl ? (
        <a
          href={reportUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={OUTBOUND_BTN_LINK}
          title="Открыть отчёт"
          aria-label="Открыть отчёт"
        >
          Отчёт
        </a>
      ) : (
        <span className={OUTBOUND_BTN_MUTED} aria-label={reportEmptyLabel}>
          {reportEmptyLabel}
        </span>
      )}
    </>
  )
}

function exhibitionRkfUrl(exhibition: ShowRkfCalendarEntry): string {
  return (
    resolveRkfOnlineExhibitionUrl(exhibition.url, exhibition.id) ??
    `https://rkf.online/exhibitions/${exhibition.id}`
  )
}

function monthLabel(year: number, monthIndex: number): string {
  const label = new Date(year, monthIndex, 1).toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** Same ascending month order as competitions calendar (`groupEventsByMonth`). */
function groupExhibitionsByMonth(groups: RkfCalendarGroup[]) {
  const months = new Map<string, { label: string; events: RkfCalendarGroup[] }>()

  groups.forEach((group) => {
    const date = parseShowDate(group.representative.date)
    if (!date) return

    const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`
    if (!months.has(key)) {
      months.set(key, {
        label: monthLabel(date.getFullYear(), date.getMonth()),
        events: [],
      })
    }
    months.get(key)!.events.push(group)
  })

  // Month header counts merged groups (not raw NKP cards) so totals feel less inflated.
  return [...months.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({ key, label: value.label, events: value.events }))
}

function rowSurfaceClass(hasLc: boolean): string {
  return hasLc
    ? 'border border-warm-blue-200 dark:border-warm-blue-800 border-l-4 border-l-warm-blue-500 dark:border-l-warm-blue-400 bg-warm-blue-50/60 dark:bg-warm-blue-900/30 hover:bg-warm-blue-100/80 dark:hover:bg-warm-blue-900/40'
    : 'border border-old-money-200 dark:border-charcoal-600 border-l-4 border-l-camel-500 bg-cream-50 dark:bg-charcoal-800 hover:bg-camel-100 dark:hover:bg-charcoal-700'
}

export default function ShowCalendar() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [exhibitions, setExhibitions] = useState<ShowRkfCalendarEntry[]>([])
  const [years, setYears] = useState<string[]>([CURRENT_YEAR])
  const [filterYear, setFilterYear] = useState(() => searchParams.get('year') || CURRENT_YEAR)
  const [filterLcOnly, setFilterLcOnly] = useState(() => searchParams.get('lc') === '1')
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [quickPreset, setQuickPreset] = useState<QuickPreset>(null)
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => new Set())
  const [localRkfProtocolIds, setLocalRkfProtocolIds] = useState<Set<number>>(() => new Set())

  useEffect(() => {
    getShowRkfCalendarYears().then((list) => {
      if (list.length > 0) setYears(list)
    })
  }, [])

  useEffect(() => {
    if (!isLocalDev) return
    let cancelled = false
    fetchJson<Record<string, string>>('shows/exhibitions-rkf/index.json').then((idx) => {
      if (cancelled || !idx) return
      const ids = new Set<number>()
      for (const key of Object.keys(idx)) {
        const n = Number(key)
        if (Number.isFinite(n)) ids.add(n)
      }
      setLocalRkfProtocolIds(ids)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const loadData = async () => {
      setLoading(true)
      // Год → один шард (~3–9k); «все года» тянет ~23 MB
      const result = await getShowCalendar(filterYear || undefined)
      if (cancelled) return
      if (result.success && result.data) {
        setExhibitions(result.data)
      } else {
        setExhibitions([])
      }
      setLoading(false)
    }
    loadData()
    return () => {
      cancelled = true
    }
  }, [filterYear])

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        if (filterYear) params.set('year', filterYear)
        else params.delete('year')
        if (searchQuery) params.set('search', searchQuery)
        else params.delete('search')
        if (filterLcOnly) params.set('lc', '1')
        else params.delete('lc')
        return params
      },
      { replace: true },
    )
  }, [filterYear, searchQuery, filterLcOnly, setSearchParams])

  // Collapse expand state when filters/year change.
  useEffect(() => {
    setExpandedKeys(new Set())
  }, [filterYear, filterLcOnly, searchQuery, quickPreset])

  const filteredGroups = useMemo(() => {
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

    // Ascending by date — same as competitions calendar (`Events/index.tsx`).
    const sorted = [...exhibitions].sort((a, b) => {
      const dateA = parseShowDate(a.date)
      const dateB = parseShowDate(b.date)
      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1
      return dateA.getTime() - dateB.getTime()
    })
    const groups = groupRkfMonoVariants(sorted)
    return groups.filter((group) => {
      if (filterLcOnly && !group.hasLc) return false

      if (upcomingRange) {
        const start = parseShowDate(group.representative.date)
        if (!start || start < upcomingRange.from || start > upcomingRange.to) return false
      }

      if (searchQuery.trim() && !groupMatchesSearch(group, searchQuery.trim())) return false
      return true
    })
  }, [exhibitions, searchQuery, filterLcOnly, quickPreset])

  const monthGroups = useMemo(
    () => groupExhibitionsByMonth(filteredGroups),
    [filteredGroups],
  )

  const flatVisible = useMemo(() => {
    const rows: Array<
      | { kind: 'month'; key: string; label: string; count: number }
      | { kind: 'group'; key: string; group: RkfCalendarGroup }
    > = []
    for (const month of monthGroups) {
      rows.push({
        kind: 'month',
        key: `m-${month.key}`,
        label: month.label,
        count: month.events.length,
      })
      for (const group of month.events) {
        rows.push({
          kind: 'group',
          key: `g-${group.key}`,
          group,
        })
      }
    }
    return rows
  }, [monthGroups])

  const { visibleCount, loadMoreRef, hasMore } = useInfiniteScroll(flatVisible.length, [
    filterYear,
    filterLcOnly,
    searchQuery,
    quickPreset,
    flatVisible.length,
  ])

  const visibleRows = flatVisible.slice(0, visibleCount)

  const withResultCount = useMemo(
    () => filteredGroups.filter((g) => g.hasLc).length,
    [filteredGroups],
  )

  const hasPanelFilters = Boolean(filterLcOnly || filterYear !== CURRENT_SEASON)

  const hasActiveFilters = Boolean(
    filterYear !== CURRENT_SEASON || searchQuery || filterLcOnly || quickPreset,
  )

  // Year chip only when non-default (not current season).
  const activeFilterChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = []
    if (filterYear !== CURRENT_SEASON) {
      chips.push({
        key: 'year',
        label: filterYear || 'Все года',
        onRemove: () => setFilterYear(CURRENT_SEASON),
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
  }, [filterLcOnly, filterYear, quickPreset])

  const handleResetFilters = () => {
    setFilterYear(CURRENT_SEASON)
    setSearchQuery('')
    setFilterLcOnly(false)
    setQuickPreset(null)
  }

  const clearPanelFilters = () => {
    setFilterYear(CURRENT_SEASON)
    setFilterLcOnly(false)
    setQuickPreset(null)
  }

  const applyQuickPreset = (preset: QuickPreset) => {
    if (quickPreset === preset) {
      handleResetFilters()
      return
    }
    setQuickPreset(preset)
  }

  const handleYearToggle = (year: string) => {
    setFilterYear(filterYear === year ? '' : year)
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

  const toolbarFilters = (
    <>
      <ToolbarSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Название, город, клуб, НКП…"
      />
      <div className="flex shrink-0 items-center gap-1.5">
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
            <p className={TOOLBAR_FILTER_SECTION_LABEL}>Протокол</p>
            <label className={TOOLBAR_FILTER_CHECKBOX_ROW}>
              <input
                type="checkbox"
                checked={filterLcOnly}
                onChange={() => setFilterLcOnly((v) => !v)}
              />
              С протоколом
            </label>
          </div>
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
        <ToolbarTip label="Выставки с сегодняшней даты на 30 дней вперёд">
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
      </div>
    </>
  )

  const calendarStats = (
    <p className="text-xs text-charcoal-500 dark:text-charcoal-300">
      {`Всего событий: ${exhibitions.length} · отфильтровано: ${filteredGroups.length} · с результатом: ${withResultCount}`}
    </p>
  )

  if (loading) {
    return (
      <div className="max-w-full mx-auto pb-2 sm:pb-4">
        <div className="mb-4">
          <PageToolbar
            bare
            topRowClassName="pr-28 md:pr-32"
            activeFilterChips={activeFilterChips}
            onClearAllFilters={hasActiveFilters ? handleResetFilters : undefined}
            filters={toolbarFilters}
            bottomLeft={calendarStats}
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
          filters={toolbarFilters}
          bottomLeft={calendarStats}
        />
      </div>

      {filteredGroups.length === 0 ? (
        <EmptyState
          title="Выставки не найдены"
          description="Попробуйте изменить фильтры или поисковый запрос"
        />
      ) : (
        <div>
          {visibleRows.map((row) => {
            if (row.kind === 'month') {
              return (
                <div
                  key={row.key}
                  className="sticky top-2 z-10 mb-1.5 mt-1.5 flex items-baseline justify-between rounded-lg bg-old-money-100 dark:bg-charcoal-800 px-3.5 py-1.5 font-serif text-sm font-bold text-old-money-700 dark:text-old-money-300 first:mt-0"
                >
                  <span>{row.label}</span>
                  <span className="font-mono text-xs font-normal text-charcoal-500 dark:text-charcoal-300">
                    {row.count}{' '}
                    {row.count === 1 ? 'выставка' : row.count < 5 ? 'выставки' : 'выставок'}
                  </span>
                </div>
              )
            }

            const { group } = row
            const exhibition = group.representative
            const isMulti = group.children.length > 1
            const expanded = isMulti && expandedKeys.has(group.key)
            const dateParts = formatShowDate(exhibition.date)
            const isLc = group.hasLc
            const singleLocalPath = (() => {
              if (isMulti) return null
              if (isLc && exhibition.lc_exhibition_id) {
                return `/shows/exhibition/${exhibition.lc_exhibition_id}`
              }
              if (localRkfProtocolIds.has(exhibition.id)) {
                return `/shows/exhibition/${exhibition.id}`
              }
              return null
            })()
            const hasLocalProtocol = Boolean(singleLocalPath) || group.children.some(
              (c) =>
                (c.has_lc_protocol && c.lc_exhibition_id) || localRkfProtocolIds.has(c.id),
            )
            const rkfUrl = exhibitionRkfUrl(exhibition)
            const reportUrl = exhibition.reports_link?.trim() || null
            const notStartedYet = isShowNotStartedYet(exhibition.date)
            const place = exhibition.city || exhibition.location || ''
            const subtitle = isMulti ? null : monoSubtitle(exhibition)
            const ranks = isMulti
              ? collectGroupRanks(group.children)
              : rankTokens(exhibition)

            const titleClass = singleLocalPath
              ? 'min-w-0 truncate leading-[1.3em] text-[13.5px] font-semibold text-charcoal-900 dark:text-charcoal-100 group-hover:text-camel-700 dark:group-hover:text-camel-300'
              : 'min-w-0 truncate leading-[1.3em] text-[13.5px] font-semibold text-charcoal-900 dark:text-charcoal-100'

            const openLocal = () => {
              if (singleLocalPath) navigate(singleLocalPath)
            }

            const onRowActivate = () => {
              if (isMulti) {
                toggleExpanded(group.key)
                return
              }
              openLocal()
            }

            const interactive = isMulti || Boolean(singleLocalPath)

            return (
              <div key={row.key} className="mb-1.5">
                <div
                  role={interactive ? (isMulti ? 'button' : 'link') : undefined}
                  tabIndex={interactive ? 0 : undefined}
                  aria-expanded={isMulti ? expanded : undefined}
                  aria-label={
                    isMulti
                      ? `${expanded ? 'Свернуть' : 'Развернуть'} варианты: ${exhibition.title}`
                      : singleLocalPath
                        ? `Открыть результаты: ${exhibition.title}`
                        : undefined
                  }
                  onClick={interactive ? onRowActivate : undefined}
                  onKeyDown={
                    interactive
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onRowActivate()
                          }
                        }
                      : undefined
                  }
                  className={`group grid grid-cols-[4.5rem_minmax(0,1fr)] sm:grid-cols-[5rem_minmax(0,1fr)_7.75rem] items-center gap-3 sm:gap-4 rounded-lg px-3 py-2.5 sm:px-3 sm:py-2.5 transition-colors hover:translate-x-0.5 ${
                    interactive ? 'cursor-pointer' : 'cursor-default'
                  } ${rowSurfaceClass(isLc || (hasLocalProtocol && !isMulti && localRkfProtocolIds.has(exhibition.id)))}`}
                >
                  <div className="w-[4.75rem] shrink-0 self-center text-sm leading-tight text-charcoal-800 dark:text-charcoal-100 sm:w-[5rem]">
                    {dateParts ? (
                      <span className="block whitespace-nowrap font-semibold tabular-nums">
                        {dateParts}
                      </span>
                    ) : (
                      '—'
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-1.5">
                      {isMulti ? (
                        <ChevronRight
                          className={`h-3.5 w-3.5 shrink-0 text-charcoal-500 transition-transform dark:text-charcoal-300 ${
                            expanded ? 'rotate-90' : ''
                          }`}
                          aria-hidden
                        />
                      ) : null}
                      <span className={titleClass}>{exhibition.title}</span>
                      {ranks.length > 0 && (
                        <div className="flex shrink-0 flex-wrap items-center gap-1">
                          {ranks.map((rank) => (
                            <span key={rank} className={RANK_CHIP}>
                              {rank}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {subtitle && (
                      <div className="mt-0.5 truncate text-xs font-medium text-charcoal-700 dark:text-charcoal-200">
                        {subtitle}
                      </div>
                    )}
                    {(place || exhibition.club) && (
                      <div className="mt-0.5 truncate text-xs text-charcoal-500 dark:text-charcoal-300">
                        {[place, exhibition.club].filter(Boolean).join(' · ')}
                      </div>
                    )}
                    {/* Mobile: outbound links only for single rows (multi → children). */}
                    {!isMulti && (
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:hidden">
                        <OutboundLinks
                          rkfUrl={rkfUrl}
                          reportUrl={reportUrl}
                          notStartedYet={notStartedYet}
                        />
                      </div>
                    )}
                    {isMulti && (
                      <div className="mt-1 text-[11px] text-charcoal-500 dark:text-charcoal-400 sm:hidden">
                        {group.children.length} НКП · нажмите, чтобы{' '}
                        {expanded ? 'свернуть' : 'развернуть'}
                      </div>
                    )}
                  </div>

                  <div className="hidden sm:flex w-[7.75rem] shrink-0 flex-col items-end justify-center gap-1 self-stretch pl-3 border-l border-old-money-200/80 dark:border-charcoal-600/80">
                    {!isMulti ? (
                      <OutboundLinks
                        rkfUrl={rkfUrl}
                        reportUrl={reportUrl}
                        notStartedYet={notStartedYet}
                      />
                    ) : (
                      <span className="w-full whitespace-nowrap text-right text-[11px] leading-tight text-charcoal-500 dark:text-charcoal-400">
                        {group.children.length} НКП
                      </span>
                    )}
                  </div>
                </div>

                {expanded ? (
                  <ul className="mt-0.5 mb-1 ml-[4.75rem] sm:ml-[5rem] space-y-0.5 border-l border-old-money-200/80 pl-3 dark:border-charcoal-600/80">
                    {group.children.map((child) => {
                      const childRkf = exhibitionRkfUrl(child)
                      const childReport = child.reports_link?.trim() || null
                      const childNotStarted = isShowNotStartedYet(child.date)
                      const childLcPath =
                        child.has_lc_protocol && child.lc_exhibition_id
                          ? `/shows/exhibition/${child.lc_exhibition_id}`
                          : localRkfProtocolIds.has(child.id)
                            ? `/shows/exhibition/${child.id}`
                            : null
                      const nkpLabel = formatNkpDisplay(
                        child.national_breed_club_name?.trim() ||
                          child.breeds?.trim() ||
                          '',
                      )
                      const childRanks = rankTokens(child)
                      const childHeading =
                        nkpLabel !== 'НКП'
                          ? nkpLabel
                          : childRanks.length > 0
                            ? childRanks.join(', ')
                            : `ID ${child.id}`
                      return (
                        <li
                          key={child.id}
                          className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-md px-2.5 py-1.5 text-xs ${
                            child.has_lc_protocol
                              ? 'bg-warm-blue-50/70 dark:bg-warm-blue-900/25'
                              : 'bg-cream-50/80 dark:bg-charcoal-800/60'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-charcoal-800 dark:text-charcoal-100">
                              {childHeading}
                            </span>
                            {nkpLabel !== 'НКП' && childRanks.length > 0 ? (
                              <span className="ml-2 text-[11px] text-charcoal-500 dark:text-charcoal-400">
                                {childRanks.join(', ')}
                              </span>
                            ) : null}
                            {childLcPath ? (
                              <button
                                type="button"
                                className="ml-2 text-[11px] font-medium text-warm-blue-700 hover:underline dark:text-warm-blue-300"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigate(childLcPath)
                                }}
                              >
                                Локально
                              </button>
                            ) : null}
                          </div>
                          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                            <OutboundLinks
                              rkfUrl={childRkf}
                              reportUrl={childReport}
                              notStartedYet={childNotStarted}
                            />
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                ) : null}
              </div>
            )
          })}

          {hasMore && (
            <div
              ref={loadMoreRef}
              className="py-4 text-center text-sm text-charcoal-500 dark:text-charcoal-400"
            >
              Загрузка…
            </div>
          )}
        </div>
      )}
    </div>
  )
}
