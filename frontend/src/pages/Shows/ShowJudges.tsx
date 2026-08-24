import { useState, useEffect, useMemo, useRef } from 'react'
import ShowJudgeCard from '../../components/ShowJudgeCard'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarFiltersDropdown from '../../components/toolbar/ToolbarFiltersDropdown'
import ToolbarFilterOptionList from '../../components/toolbar/ToolbarFilterOptionList'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import {
  TOOLBAR_CHIP,
  TOOLBAR_CHIP_ACTIVE,
  TOOLBAR_CHIP_IDLE,
  TOOLBAR_FILTER_SECTION_LABEL,
} from '../../lib/toolbar'
import { useShowJudges, useShowJudgesPage0 } from '../../hooks/useStaticData'
import EmptyState from '../../components/EmptyState'
import SkeletonLoader from '../../components/SkeletonLoader'
import RecordSortBar from '../SpeedRecords/RecordSortBar'
import type { ShowJudge } from '../../lib/staticData'
import { matchesBreedFilter, uniqueCanonicalBreeds } from '../../lib/breedMapping'

const CURRENT_SEASON = String(new Date().getFullYear())

/** Full judges.json (~12 MB) must not race page0 — wait after first paint. */
const FULL_JUDGES_DELAY_MS = 2500

type SortKey = 'exhibitions' | 'breeds' | 'excellent'

const SORT_OPTIONS: Array<{ field: SortKey; label: string }> = [
  { field: 'exhibitions', label: 'Выставки' },
  { field: 'breeds', label: 'Породы' },
  { field: 'excellent', label: '% отлично' },
]

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
  const [searchQuery, setSearchQuery] = useState('')
  const [filterYear, setFilterYear] = useState(CURRENT_SEASON)
  const [filterBreed, setFilterBreed] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('exhibitions')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')
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
    const raw: string[] = []
    for (const judge of judges) {
      for (const breed of judge.breeds || []) {
        if (breed) raw.push(breed)
      }
    }
    return uniqueCanonicalBreeds(raw)
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
    const dir = sortDir === 'desc' ? 1 : -1
    return [...filteredJudges].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'breeds') {
        const aVal = a.unique_breeds ?? a.breeds?.length ?? 0
        const bVal = b.unique_breeds ?? b.breeds?.length ?? 0
        cmp = bVal - aVal
      } else if (sortKey === 'excellent') {
        const aRate = judgeExcellentRate(a, filterYear)
        const bRate = judgeExcellentRate(b, filterYear)
        if (aRate == null && bRate == null) cmp = 0
        else if (aRate == null) return 1
        else if (bRate == null) return -1
        else cmp = bRate - aRate
      } else {
        const aVal = filterYear ? (a.by_year?.[filterYear] ?? 0) : a.total_judged
        const bVal = filterYear ? (b.by_year?.[filterYear] ?? 0) : b.total_judged
        cmp = bVal - aVal
      }
      if (cmp !== 0) return cmp * dir
      return a.name.localeCompare(b.name, 'ru')
    })
  }, [filteredJudges, filterYear, sortKey, sortDir])

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

  const selectSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const yearIsNonDefault = Boolean(filterYear) && filterYear !== CURRENT_SEASON
  const hasActiveFilters = Boolean(yearIsNonDefault || filterBreed || searchQuery)
  const hasPanelFilters = Boolean(filterBreed)

  const clearFilters = () => {
    setSearchQuery('')
    setFilterYear(CURRENT_SEASON)
    setFilterBreed('')
  }

  const clearPanelFilters = () => {
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
        <p className="text-xs text-charcoal-500 dark:text-charcoal-400">Загрузка судей…</p>
        <SkeletonLoader variant="card" count={8} />
      </div>
    )
  }

  if (loadFailed) {
    return (
      <div className="overflow-hidden rounded-xl border border-old-money-200 bg-white dark:border-charcoal-600 dark:bg-charcoal-800">
        <EmptyState
          title="Судьи не загружены"
          description="Индекс shows/indexes/judges.json пуст. Пересоберите build-show-indexes."
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-full space-y-4 pb-2 sm:pb-4">
      {judgesPartial ? (
        <p className="text-xs text-charcoal-500 dark:text-charcoal-400" aria-live="polite">
          Показан топ судей — полный список подгрузится при поиске, фильтре или прокрутке
        </p>
      ) : null}
      <PageToolbar
        bare
        filters={
          <>
            <ToolbarSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Фамилия судьи…"
              className="!w-auto min-w-[200px] max-w-xs shrink-0"
            />
            <div className="flex max-w-full flex-wrap items-center gap-1.5">
              <ToolbarFiltersDropdown
                active={hasPanelFilters}
                activeCount={filterBreed ? 1 : 0}
                fillContent
                panelClassName="md:w-[min(360px,calc(100vw-2rem))]"
                onReset={clearPanelFilters}
                label="Фильтры"
                onOpenChange={(open) => {
                  if (open) setUserWantsFull(true)
                }}
              >
                <div className="flex min-h-0 flex-1 flex-col">
                  <p className={TOOLBAR_FILTER_SECTION_LABEL}>Порода</p>
                  <ToolbarFilterOptionList
                    options={availableBreeds}
                    value={filterBreed}
                    onSelect={(breed) => setFilterBreed(filterBreed === breed ? '' : breed)}
                    searchable
                    searchPlaceholder="Найти породу…"
                    emptyText={
                      availableBreeds.length === 0 ? 'Нет пород в индексе' : 'Ничего не найдено'
                    }
                    fill
                  />
                </div>
              </ToolbarFiltersDropdown>
              <button
                type="button"
                onClick={() => setFilterYear(filterYear === CURRENT_SEASON ? '' : CURRENT_SEASON)}
                aria-pressed={filterYear === CURRENT_SEASON}
                className={`${TOOLBAR_CHIP} ${filterYear === CURRENT_SEASON ? TOOLBAR_CHIP_ACTIVE : TOOLBAR_CHIP_IDLE}`}
              >
                Сезон {CURRENT_SEASON}
              </button>
            </div>
          </>
        }
        bottomLeft={
          <RecordSortBar
            options={SORT_OPTIONS}
            sortField={sortKey}
            sortDirection={sortDir}
            onSort={(field) => selectSort(field as SortKey)}
          />
        }
      />

      {sortedJudges.length === 0 ? (
        <div className="overflow-hidden rounded-xl border border-old-money-200 bg-white dark:border-charcoal-600 dark:bg-charcoal-800">
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
              judge={{
                id: judge.id || judge.name,
                name: judge.name,
                display_name: judge.display_name,
                exhibitionsCount: filterYear
                  ? (judge.by_year?.[filterYear] ?? 0)
                  : judge.total_judged,
                breedsCount: judge.unique_breeds ?? judge.breeds?.length ?? 0,
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
