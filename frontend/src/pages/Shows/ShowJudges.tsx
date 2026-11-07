import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import ShowJudgeCard from '../../components/ShowJudgeCard'
import { initialSeasonYearFilter, resolveActiveSeason } from '../../lib/season'
import { useShowJudges, useShowJudgesPage0 } from '../../hooks/useStaticData'
import EmptyState from '../../components/EmptyState'
import SkeletonLoader from '../../components/SkeletonLoader'
import type { ShowJudge } from '../../lib/staticData'
import {
  matchesBreedFilter,
  formatBreedName,
  canonicalBreed,
} from '../../lib/breedMapping'
import { ShowJudgesToolbar } from './ShowJudgesToolbar'

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
    // Scan breeds from top judges (covers all active breeds without scanning 268k items on tab switch)
    const source = judges.length > 250 ? judges.slice(0, 250) : judges
    const counts = new Map<string, number>()
    for (let i = 0; i < source.length; i++) {
      const jb = source[i].breeds
      if (!jb) continue
      for (let k = 0; k < jb.length; k++) {
        const canon = canonicalBreed(jb[k])
        if (canon) counts.set(canon, (counts.get(canon) || 0) + 1)
      }
    }
    return Array.from(counts.keys()).sort((a, b) => {
      const diff = (counts.get(b) || 0) - (counts.get(a) || 0)
      if (diff !== 0) return diff
      return a.localeCompare(b, 'ru')
    })
  }, [judges === fullJudges ? 'full' : judges.length])

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
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [visibleCount, sortedJudges.length, judgesPartial, page0Judges.length])

  const isYearNonDefault = filterYear !== '' && filterYear !== SHOW_JUDGES_ACTIVE_SEASON

  const handleResetFilters = () => {
    setFilterYear(SHOW_JUDGES_ACTIVE_SEASON)
    setFilterBreed('')
    setSearchQuery('')
  }

  const handleSelectBreed = (breed: string) => {
    setFilterBreed(breed)
    if (breed) setUserWantsFull(true)
  }

  if (page0Loading && !hasPage0) {
    return (
      <div className="space-y-4">
        <SkeletonLoader variant="table" count={5} />
      </div>
    )
  }

  if (judgesFetched && judges.length === 0) {
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
      <ShowJudgesToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterYear={filterYear}
        setFilterYear={setFilterYear}
        showYears={SHOW_YEARS}
        isYearNonDefault={isYearNonDefault}
        availableBreeds={availableBreeds}
        filterBreed={filterBreed}
        onSelectBreed={handleSelectBreed}
        onResetFilters={handleResetFilters}
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
