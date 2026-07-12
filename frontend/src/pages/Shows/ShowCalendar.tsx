import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import FilterSelect from '../../components/FilterSelect'
import EmptyState from '../../components/EmptyState'
import SkeletonLoader from '../../components/SkeletonLoader'
import { getShowCalendar } from '../../lib/staticData'
import {
  TOOLBAR_CHIP,
  TOOLBAR_CHIP_ACTIVE,
  TOOLBAR_CHIP_IDLE,
} from '../../lib/toolbar'

interface ShowExhibition {
  id: number
  date: string
  title: string
  location: string
  rank: string
  type: string
  club: string
  judges: string[]
  results: any[]
}

function parseShowDate(dateStr: string): Date | null {
  if (!dateStr) return null
  const parts = dateStr.split('.')
  if (parts.length !== 3) return null
  const [day, month, year] = parts.map(Number)
  return new Date(year, month - 1, day)
}

function formatShowDate(dateStr: string): { dayLine: string; metaLine: string } | null {
  const date = parseShowDate(dateStr)
  if (!date) return null
  
  const day = date.getDate()
  const month = date.toLocaleDateString('ru-RU', { month: 'short' })
  const year = date.getFullYear()
  
  return {
    dayLine: `${day} ${month}`,
    metaLine: String(year),
  }
}

function groupExhibitionsByMonth(exhibitions: ShowExhibition[]) {
  const groups = new Map<string, ShowExhibition[]>()
  
  exhibitions.forEach((exhibition) => {
    const date = parseShowDate(exhibition.date)
    if (!date) return
    
    const monthKey = date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })
    if (!groups.has(monthKey)) {
      groups.set(monthKey, [])
    }
    groups.get(monthKey)!.push(exhibition)
  })
  
  return Array.from(groups.entries())
    .map(([key, events]) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      events,
    }))
    .sort((a, b) => {
      const dateA = parseShowDate(a.events[0].date)
      const dateB = parseShowDate(b.events[0].date)
      if (!dateA || !dateB) return 0
      return dateB.getTime() - dateA.getTime()
    })
}

export default function ShowCalendar() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [exhibitions, setExhibitions] = useState<ShowExhibition[]>([])
  const [filterYear, setFilterYear] = useState(() => searchParams.get('year') || '')
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')

  const years = useMemo(() => {
    const yearSet = new Set<string>()
    exhibitions.forEach((exhibition) => {
      const date = parseShowDate(exhibition.date)
      if (date) {
        yearSet.add(String(date.getFullYear()))
      }
    })
    return Array.from(yearSet).sort((a, b) => Number(b) - Number(a))
  }, [exhibitions])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const result = await getShowCalendar(filterYear)
      if (result.success && result.data) {
        setExhibitions(result.data)
      }
      setLoading(false)
    }
    loadData()
  }, [filterYear])

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        if (filterYear) params.set('year', filterYear)
        else params.delete('year')
        if (searchQuery) params.set('search', searchQuery)
        else params.delete('search')
        return params
      },
      { replace: true },
    )
  }, [filterYear, searchQuery, setSearchParams])

  const filteredExhibitions = useMemo(() => {
    return exhibitions.filter((exhibition) => {
      // Year filter
      if (filterYear) {
        const date = parseShowDate(exhibition.date)
        if (!date) return false
        const exhibitionYear = String(date.getFullYear())
        if (exhibitionYear !== filterYear) return false
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchableFields = [
          exhibition.title,
          exhibition.location,
          exhibition.club,
          exhibition.type,
          exhibition.rank,
          ...exhibition.judges,
        ]
        if (!searchableFields.some((f) => f && f.toLowerCase().includes(query))) {
          return false
        }
      }
      return true
    }).sort((a, b) => {
      const dateA = parseShowDate(a.date)
      const dateB = parseShowDate(b.date)
      if (!dateA || !dateB) return 0
      return dateB.getTime() - dateA.getTime()
    })
  }, [exhibitions, searchQuery, filterYear])

  const monthGroups = useMemo(() => groupExhibitionsByMonth(filteredExhibitions), [filteredExhibitions])

  const hasActiveFilters = Boolean(filterYear || searchQuery)

  const activeFilterChips = useMemo(() => {
    const chips = []
    if (searchQuery) {
      chips.push({
        key: 'search',
        label: searchQuery,
        onRemove: () => setSearchQuery(''),
      })
    }
    if (filterYear) {
      chips.push({
        key: 'year',
        label: filterYear,
        onRemove: () => setFilterYear(''),
      })
    }
    return chips
  }, [searchQuery, filterYear])

  const handleResetFilters = () => {
    setFilterYear('')
    setSearchQuery('')
  }

  if (loading) {
    return (
      <div className="max-w-full mx-auto pb-2 sm:pb-4">
        <div className="mb-4">
          <PageToolbar
            bare
            activeFilterChips={activeFilterChips}
            onClearAllFilters={hasActiveFilters ? handleResetFilters : undefined}
            filters={
              <>
                <ToolbarSearch
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Название, место, клуб…"
                />
                <FilterSelect
                  ariaLabel="Год"
                  value={filterYear}
                  onChange={setFilterYear}
                  allLabel="Все года"
                  options={years.map((y) => ({ value: y, label: y }))}
                  className="min-w-[96px]"
                />
                <p className="text-xs text-charcoal-500 dark:text-charcoal-300 whitespace-nowrap">
                  Всего выставок: {exhibitions.length}
                </p>
              </>
            }
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
          activeFilterChips={activeFilterChips}
          onClearAllFilters={hasActiveFilters ? handleResetFilters : undefined}
          filters={
            <>
              <ToolbarSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Название, место, клуб…"
              />
              <FilterSelect
                ariaLabel="Год"
                value={filterYear}
                onChange={setFilterYear}
                allLabel="Все года"
                options={years.map((y) => ({ value: y, label: y }))}
                className="min-w-[96px]"
              />
              <p className="text-xs text-charcoal-500 dark:text-charcoal-300 whitespace-nowrap">
                Всего выставок: {exhibitions.length} · отфильтровано: {filteredExhibitions.length}
              </p>
            </>
          }
        />
      </div>

      {filteredExhibitions.length === 0 ? (
        <EmptyState
          title="Выставки не найдены"
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
                  {group.events.length === 1 ? 'выставка' : group.events.length < 5 ? 'выставки' : 'выставок'}
                </span>
              </div>
              {group.events.map((exhibition) => {
                const dateParts = formatShowDate(exhibition.date)
                const hasResults = exhibition.results && exhibition.results.length > 0
                const rkfUrl = `https://lc.rkfshow.ru/RKF/ExhibitionResults/ExhibitionResultListView?exhibitionId=${exhibition.id}`
                
                return (
                  <Link
                    key={exhibition.id}
                    to={`/shows/exhibition/${exhibition.id}`}
                    className="grid grid-cols-[4.5rem_minmax(0,1fr)] sm:grid-cols-[5rem_minmax(0,1fr)_6rem] items-center gap-3 sm:gap-4 rounded-lg border border-old-money-200 dark:border-charcoal-600 border-l-4 border-l-camel-500 bg-cream-50 dark:bg-charcoal-800 px-3 py-2.5 sm:px-3 sm:py-2.5 mb-1.5 transition-colors hover:bg-camel-100 dark:hover:bg-charcoal-700 hover:translate-x-0.5"
                  >
                    <div className="w-[4.75rem] shrink-0 text-sm leading-tight text-charcoal-800 dark:text-charcoal-100 sm:w-[5rem]">
                      {dateParts ? (
                        <>
                          <span className="block whitespace-nowrap font-semibold tabular-nums">{dateParts.dayLine}</span>
                          <span className="block whitespace-nowrap text-xs text-charcoal-500 dark:text-charcoal-400">
                            {dateParts.metaLine}
                          </span>
                        </>
                      ) : (
                        '—'
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-[13.5px] font-semibold text-charcoal-900 dark:text-charcoal-100">
                        <span className="line-clamp-2 min-h-[2.6em] leading-[1.3em] min-w-0 flex-1 hover:text-camel-700 dark:hover:text-camel-400 transition-colors">
                          {exhibition.title}
                        </span>
                        <a
                          href={rkfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-shrink-0 rounded-full p-1 text-old-money-400 transition-colors hover:bg-old-money-100 hover:text-camel-600 dark:text-old-money-500 dark:hover:bg-charcoal-700 dark:hover:text-camel-400"
                          aria-label="Открыть на lc.rkfshow.ru"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                      <div className="text-xs text-charcoal-500 dark:text-charcoal-300 truncate mt-0.5">
                        {exhibition.location}
                        {exhibition.rank && ` · ${exhibition.rank}`}
                      </div>
                    </div>

                    <div className="hidden sm:flex w-[6rem] shrink-0 flex-col items-end justify-center gap-0.5 self-stretch pl-3 border-l border-old-money-200/80 dark:border-charcoal-600/80">
                      {hasResults ? (
                        <span className="w-full whitespace-nowrap text-right text-[11px] leading-tight text-charcoal-500 dark:text-charcoal-400">
                          {exhibition.results.length} рез.
                        </span>
                      ) : (
                        <span className="w-full whitespace-nowrap text-right text-[11px] leading-tight text-charcoal-400 dark:text-charcoal-500">
                          Нет рез.
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
