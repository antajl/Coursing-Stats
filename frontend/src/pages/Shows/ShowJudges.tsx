import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, X } from 'lucide-react'
import ShowJudgeCard from '../../components/ShowJudgeCard'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ModernDropdown from '../../components/ui/ModernDropdown'
import BreedSearchDropdown from '../../components/ui/BreedSearchDropdown'
import { toolbarPillTriggerClass } from '../../lib/toolbar'
import { initialSeasonYearFilter, resolveActiveSeason } from '../../lib/season'
import { useShowJudges, useShowJudgesPage0 } from '../../hooks/useStaticData'
import EmptyState from '../../components/EmptyState'
import SkeletonLoader from '../../components/SkeletonLoader'
import type { ShowJudge } from '../../lib/staticData'
import {
  matchesBreedFilter,
  uniqueCanonicalBreeds,
  formatBreedName,
  canonicalBreed,
} from '../../lib/breedMapping'

const SHOW_YEARS = ['2026', '2025', '2024'] as const
const SHOW_JUDGES_ACTIVE_SEASON = resolveActiveSeason(SHOW_YEARS)

/** Full judges.json (~12 MB) must not race page0 — wait after first paint. */
const FULL_JUDGES_DELAY_MS = 2500


const MIN_GRADED_FOR_RATE = 30

function judgeExcellentRate(judge: ShowJudge, year: string): number | null {
  if (year) {
    const graded = judge.by_year_graded?.[year] ?? 0
    const rate = judge.by_year_excellent?.[year]
    if (typeof rate !== 'number' || graded < MIN_GRADED_FOR_RATE) return null
    return rate
  }
  if (typeof judge.excellent_rate !== 'number' || (judge.graded ?? 0) < MIN_GRADED_FOR_RATE) {
    return null
  }
  return judge.excellent_rate
}

function judgeExcellentPctForCard(judge: ShowJudge, year: string): number | null {
  const rate = judgeExcellentRate(judge, year)
  return rate == null ? null : rate * 100
}

export default function ShowJudges() {
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterYear, setFilterYear] = useState(() =>
    initialSeasonYearFilter(searchParams, SHOW_JUDGES_ACTIVE_SEASON),
  )
  const [filterBreed, setFilterBreed] = useState('')
  const [mobileYearOpen, setMobileYearOpen] = useState(false)
  const [desktopYearOpen, setDesktopYearOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(20)
  const [allowFullLoad, setAllowFullLoad] = useState(false)
  const [userWantsFull, setUserWantsFull] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const {
    data: judgesPage0Result,
    isLoading: page0Loading,
    isFetched: page0Fetched,
    isError: page0Error,
  } = useShowJudgesPage0()

  const page0Judges: ShowJudge[] =
    judgesPage0Result?.success && Array.isArray(judgesPage0Result.data)
      ? judgesPage0Result.data
      : []
  const hasPage0 = page0Judges.length > 0
  const page0Failed = page0Fetched && (!hasPage0 || page0Error)

  useEffect(() => {
    if (searchQuery.trim() || filterBreed || page0Failed) {
      setUserWantsFull(true)
    }
  }, [searchQuery, filterBreed, page0Failed])

  useEffect(() => {
    setAllowFullLoad(false)
    if (!page0Fetched && !page0Error) return

    const urgent = userWantsFull || page0Failed
    const delay = urgent ? 0 : FULL_JUDGES_DELAY_MS
    const t = window.setTimeout(() => setAllowFullLoad(true), delay)
    return () => window.clearTimeout(t)
  }, [page0Fetched, page0Error, page0Failed, userWantsFull])

  const { data: judgesResult, isFetched: judgesFetched } = useShowJudges({
    enabled: allowFullLoad,
  })

  const fullJudges: ShowJudge[] =
    judgesResult?.success && Array.isArray(judgesResult.data) ? judgesResult.data : []
  const judges: ShowJudge[] = fullJudges.length > 0 ? fullJudges : page0Judges
  const judgesPartial = fullJudges.length === 0 && hasPage0

  const availableBreeds = useMemo(() => {
    const counts = new Map<string, number>()
    for (const judge of judges) {
      for (const breed of judge.breeds || []) {
        if (breed) {
          const canon = canonicalBreed(breed)
          if (canon) counts.set(canon, (counts.get(canon) || 0) + 1)
        }
      }
    }
    return Array.from(counts.keys()).sort((a, b) => {
      const diff = (counts.get(b) || 0) - (counts.get(a) || 0)
      if (diff !== 0) return diff
      return a.localeCompare(b, 'ru')
    })
  }, [judges])

  const filteredJudges = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return judges.filter((judge) => {
      if (q && !judge.name.toLowerCase().includes(q)) return false
      if (filterBreed && !(judge.breeds || []).some((b) => matchesBreedFilter(b, filterBreed))) {
        return false
      }
      if (filterYear) {
        const byYear = judge.by_year
        if (byYear && Object.keys(byYear).length > 0) {
          if ((byYear[filterYear] ?? 0) <= 0) return false
        }
      }
      return true
    })
  }, [judges, searchQuery, filterBreed, filterYear])

  const sortedJudges = useMemo(() => {
    return [...filteredJudges].sort((a, b) => {
      const aVal = filterYear ? (a.by_year?.[filterYear] ?? 0) : a.total_judged
      const bVal = filterYear ? (b.by_year?.[filterYear] ?? 0) : b.total_judged
      const cmp = bVal - aVal
      if (cmp !== 0) return cmp
      return a.name.localeCompare(b.name, 'ru')
    })
  }, [filteredJudges, filterYear])

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        if (visibleCount < sortedJudges.length) {
          setVisibleCount((prev) => Math.min(prev + 20, sortedJudges.length))
        }
        if (judgesPartial && visibleCount >= Math.max(40, page0Judges.length - 40)) {
          setUserWantsFull(true)
        }
      },
      { threshold: 0.1 },
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      observerRef.current?.disconnect()
    }
  }, [visibleCount, sortedJudges.length, judgesPartial, page0Judges.length])


  const isYearNonDefault = filterYear !== '' && filterYear !== SHOW_JUDGES_ACTIVE_SEASON
  const hasActiveFilters = Boolean(isYearNonDefault || filterBreed || searchQuery)

  const clearFilters = () => {
    setSearchQuery('')
    setFilterYear(SHOW_JUDGES_ACTIVE_SEASON)
    setFilterBreed('')
  }

  const showSkeleton = judges.length === 0 && (page0Loading || !page0Fetched)
  const loadFailed =
    judges.length === 0 &&
    page0Fetched &&
    page0Failed &&
    allowFullLoad &&
    judgesFetched &&
    !(judgesResult?.success && judgesResult.data)

  if (showSkeleton) {
    return (
      <div className="mx-auto max-w-full space-y-4 pb-2 sm:pb-4" aria-busy="true" aria-live="polite">
        <p className="text-xs text-charcoal-500">Загрузка судей…</p>
        <SkeletonLoader variant="card" count={8} />
      </div>
    )
  }

  if (loadFailed) {
    return (
      <div className="overflow-hidden rounded-xl border border-old-money-200 bg-white">
        <EmptyState
          title="Судьи не загружены"
          description="Индекс shows/indexes/judges.json пуст. Пересоберите build-show-indexes."
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-full space-y-4 pb-2 sm:pb-4">
      <PageToolbar
        bare
        filters={
          <div className="w-full min-w-0">
            {/* Мобильная компактная строка (32px): Поиск + Год + Порода + Сброс */}
            <div className="flex sm:hidden items-center gap-1.5 w-full min-w-0">
              {/* Inline Search */}
              <ToolbarSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Фамилия…"
              />

              {/* Year Dropdown */}
              <ModernDropdown
                trigger={
                  <button
                    type="button"
                    className={`shrink-0 ${toolbarPillTriggerClass(isYearNonDefault)}`}
                  >
                    <span>{!filterYear ? 'Все года' : filterYear}</span>
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                  </button>
                }
                isOpen={mobileYearOpen}
                onOpenChange={setMobileYearOpen}
                width="130px"
              >
                <div className="p-1 max-h-60 overflow-y-auto" role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setFilterYear('')
                      setMobileYearOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      !filterYear
                        ? 'bg-camel-500 text-charcoal-900 font-semibold'
                        : 'text-charcoal-700 hover:bg-camel-100'
                    }`}
                  >
                    Все года
                  </button>
                  {SHOW_YEARS.map((year) => (
                    <button
                      key={year}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setFilterYear(year)
                        setMobileYearOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        filterYear === year
                          ? 'bg-camel-500 text-charcoal-900 font-semibold'
                          : 'text-charcoal-700 hover:bg-camel-100'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </ModernDropdown>

              {/* Breed Dropdown */}
              <BreedSearchDropdown
                breeds={availableBreeds}
                selectedBreed={filterBreed}
                onSelect={(breed) => {
                  setFilterBreed(breed)
                  if (breed) setUserWantsFull(true)
                }}
                trigger={
                  <button
                    type="button"
                    className={`shrink-0 ${toolbarPillTriggerClass(Boolean(filterBreed))}`}
                  >
                    <span className="truncate max-w-[120px]">
                      {filterBreed ? formatBreedName(filterBreed) : 'Порода'}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                  </button>
                }
              />

              {/* Reset Filters button on mobile */}
              {(isYearNonDefault || filterBreed) && (
                <div className="ml-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterYear(SHOW_JUDGES_ACTIVE_SEASON)
                      setFilterBreed('')
                    }}
                    className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full border border-old-money-200 bg-cream-50 text-charcoal-500 hover:text-charcoal-800 transition-colors cursor-pointer"
                    title="Сбросить фильтры"
                    aria-label="Сбросить фильтры"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Десктопная строка */}
            <div className="hidden sm:flex sm:items-center gap-2 w-full">
              <ToolbarSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Фамилия судьи…"
              />
              <div className="flex max-w-full items-center gap-1.5 flex-wrap">
                {/* Year Dropdown */}
                <ModernDropdown
                  trigger={
                    <button
                      type="button"
                      className={`shrink-0 ${toolbarPillTriggerClass(isYearNonDefault)}`}
                    >
                      <span>{!filterYear ? 'Все года' : filterYear}</span>
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                    </button>
                  }
                  isOpen={desktopYearOpen}
                  onOpenChange={setDesktopYearOpen}
                  width="130px"
                >
                  <div className="p-1 max-h-60 overflow-y-auto" role="menu">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setFilterYear('')
                        setDesktopYearOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        !filterYear
                          ? 'bg-camel-500 text-charcoal-900 font-semibold'
                          : 'text-charcoal-700 hover:bg-camel-100'
                      }`}
                    >
                      Все года
                    </button>
                    {SHOW_YEARS.map((year) => (
                      <button
                        key={year}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setFilterYear(year)
                          setDesktopYearOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          filterYear === year
                            ? 'bg-camel-500 text-charcoal-900 font-semibold'
                            : 'text-charcoal-700 hover:bg-camel-100'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </ModernDropdown>

                {/* Breed Dropdown */}
                <BreedSearchDropdown
                  breeds={availableBreeds}
                  selectedBreed={filterBreed}
                  onSelect={(breed) => {
                    setFilterBreed(breed)
                    if (breed) setUserWantsFull(true)
                  }}
                  trigger={
                    <button
                      type="button"
                      className={`shrink-0 ${toolbarPillTriggerClass(Boolean(filterBreed))}`}
                    >
                      <span className="truncate max-w-[140px]">
                        {filterBreed ? formatBreedName(filterBreed) : 'Порода'}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                    </button>
                  }
                />

                {/* Reset Filters button */}
                {(isYearNonDefault || filterBreed) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterYear(SHOW_JUDGES_ACTIVE_SEASON)
                      setFilterBreed('')
                    }}
                    className="shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-old-money-600 hover:text-charcoal-900 hover:bg-cream-100 transition-colors"
                    title="Сбросить все фильтры"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Сбросить</span>
                  </button>
                )}

            </div>
          </div>
        </div>
      }
      />

      {sortedJudges.length === 0 ? (
        <div className="overflow-hidden rounded-xl border border-old-money-200 bg-white">
          <EmptyState
            title="Судьи не найдены"
            description={
              judgesPartial
                ? 'Идёт подгрузка полного списка — или измените фильтры'
                : 'Попробуйте изменить фильтры'
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {sortedJudges.slice(0, visibleCount).map((judge) => (
            <ShowJudgeCard
              key={judge.id || judge.name}
              filterYear={filterYear}
              judge={{
                id: judge.id || judge.name,
                name: judge.name,
                display_name: judge.display_name,
                exhibitionsCount: filterYear
                  ? (judge.by_year?.[filterYear] ?? 0)
                  : judge.total_judged,
                breedsCount: filterYear
                  ? (judge.by_year_breeds?.[filterYear] ?? (judge.unique_breeds ?? judge.breeds?.length ?? 0))
                  : (judge.unique_breeds ?? judge.breeds?.length ?? 0),
                breedChips: (judge.breeds || []).slice(0, 2),
                excellentPct: judgeExcellentPctForCard(judge, filterYear),
                graded: filterYear ? judge.by_year_graded?.[filterYear] : judge.graded,
              }}
            />
          ))}
          {sortedJudges.length > visibleCount && <div ref={loadMoreRef} className="h-4" />}
        </div>
      )}
    </div>
  )
}
