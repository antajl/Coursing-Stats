import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate, useParams } from 'react-router-dom'
import ShowJudgeCard, { type GradeScope } from '../../components/ShowJudgeCard'
import { initialSeasonYearFilter, resolveActiveSeason } from '../../lib/season'
import { useShowJudges, useShowJudgesPage0 } from '../../hooks/useStaticData'
import EmptyState from '../../components/EmptyState'
import SkeletonLoader from '../../components/SkeletonLoader'
import DoninoColumnPlaque, { DoninoColumnShell } from '../SpeedRecords/DoninoColumnPlaque'
import { useListReveal } from '../../hooks/useListReveal'
import type { ShowJudge } from '../../lib/staticData'
import type { DogsIndexEntry } from '../../lib/competingBreeds'
import {
  matchesBreedFilter,
  formatBreedName,
  canonicalBreed,
  OFFICIAL_BREEDS_SET,
} from '../../lib/breedMapping'
import { ShowJudgesToolbar } from './ShowJudgesToolbar'
import ShowJudgeSortDropdown, { ShowJudgeSortKey } from './ShowJudgeSortDropdown'
import { matchesJudge } from '../../lib/searchEngine'

const SHOW_YEARS = ['2026', '2025', '2024'] as const
const SHOW_JUDGES_ACTIVE_SEASON = resolveActiveSeason(SHOW_YEARS)

/** Full judges.json (~12 MB) must not race page0 — wait after first paint. */
const FULL_JUDGES_DELAY_MS = 2500

const MIN_GRADED_FOR_RATE = 30
const MIN_PUPPY_FOR_RATE = 15

function judgePuppyRate(judge: ShowJudge, year: string): number | null {
  if (year) {
    const graded = judge.by_year_puppy_graded?.[year] ?? 0
    const rate = judge.by_year_puppy_rate?.[year]
    if (typeof rate !== 'number' || graded < MIN_PUPPY_FOR_RATE) return null
    return rate
  }
  if (typeof judge.puppy_rate !== 'number' || (judge.puppy_graded ?? 0) < MIN_PUPPY_FOR_RATE) {
    return null
  }
  return judge.puppy_rate
}

function judgePuppyPctForCard(judge: ShowJudge, year: string): number | null {
  const rate = judgePuppyRate(judge, year)
  return rate == null ? null : rate * 100
}


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

function formatJudgesCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return `${count.toLocaleString('ru-RU')} судей`
  if (mod10 === 1) return `${count.toLocaleString('ru-RU')} судья`
  if (mod10 >= 2 && mod10 <= 4) return `${count.toLocaleString('ru-RU')} судьи`
  return `${count.toLocaleString('ru-RU')} судей`
}

interface ShowJudgesProps {
  urlYear?: string
}

export default function ShowJudges({ urlYear }: ShowJudgesProps = {}) {
  const { year: routeYearParam, judgeId } = useParams<{ year?: string; judgeId?: string }>()
  const routeYear = urlYear ?? routeYearParam ?? (judgeId && (judgeId === 'all' || /^20\d\d$/.test(judgeId)) ? judgeId : undefined)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterYear, setFilterYear] = useState(() => {
    if (routeYear !== undefined) {
      return routeYear === 'all' ? '' : routeYear
    }
    return initialSeasonYearFilter(searchParams, SHOW_JUDGES_ACTIVE_SEASON)
  })

  useEffect(() => {
    if (routeYear !== undefined) {
      const target = routeYear === 'all' ? '' : routeYear
      setFilterYear((prev) => (prev !== target ? target : prev))
    }
  }, [routeYear])
  const [filterBreed, setFilterBreed] = useState('')
  const [gradeScope, setGradeScope] = useState<GradeScope>('adult')
  const [sortKey, setSortKey] = useState<ShowJudgeSortKey>('exhibitions')
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

  const { availableBreeds, dogIndex } = useMemo(() => {
    const counts = new Map<string, number>()
    for (let i = 0; i < judges.length; i++) {
      const jb = judges[i].breeds
      if (!jb) continue
      const seenJudgeBreeds = new Set<string>()
      for (let k = 0; k < jb.length; k++) {
        const canon = canonicalBreed(jb[k])
        if (!canon || canon.startsWith('*') || canon === 'БЕЗ ПОРОДЫ' || !OFFICIAL_BREEDS_SET.has(canon)) continue
        if (!seenJudgeBreeds.has(canon)) {
          seenJudgeBreeds.add(canon)
          counts.set(canon, (counts.get(canon) || 0) + 1)
        }
      }
    }
    const idx: DogsIndexEntry[] = []
    const breedList: string[] = []
    for (const [breed, count] of counts.entries()) {
      idx.push({ breed, dog_count: count, competition_count: count })
      breedList.push(breed)
    }
    breedList.sort((a, b) => {
      const diff = (counts.get(b) || 0) - (counts.get(a) || 0)
      if (diff !== 0) return diff
      return a.localeCompare(b, 'ru')
    })
    return { availableBreeds: breedList, dogIndex: idx }
  }, [judges === fullJudges ? 'full' : judges.length])

  const filteredJudges = useMemo(() => {
    const q = searchQuery.trim()
    return judges.filter((judge) => {
      if (q && !matchesJudge(judge, q)) return false
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
      const aExhibitions = filterYear ? (a.by_year?.[filterYear] ?? 0) : a.total_judged
      const bExhibitions = filterYear ? (b.by_year?.[filterYear] ?? 0) : b.total_judged
      const aAdultDogs = filterYear ? (a.by_year_graded?.[filterYear] ?? 0) : (a.graded ?? 0)
      const bAdultDogs = filterYear ? (b.by_year_graded?.[filterYear] ?? 0) : (b.graded ?? 0)
      const aPuppyDogs = filterYear ? (a.by_year_puppy_graded?.[filterYear] ?? 0) : (a.puppy_graded ?? 0)
      const bPuppyDogs = filterYear ? (b.by_year_puppy_graded?.[filterYear] ?? 0) : (b.puppy_graded ?? 0)
      const aTotalDogs = filterYear ? (a.by_year_total_dogs?.[filterYear] ?? (aAdultDogs + aPuppyDogs)) : (a.total_dogs ?? (aAdultDogs + aPuppyDogs))
      const bTotalDogs = filterYear ? (b.by_year_total_dogs?.[filterYear] ?? (bAdultDogs + bPuppyDogs)) : (b.total_dogs ?? (bAdultDogs + bPuppyDogs))

      const aDogs = gradeScope === 'puppy' ? aPuppyDogs : gradeScope === 'all' ? aTotalDogs : aAdultDogs
      const bDogs = gradeScope === 'puppy' ? bPuppyDogs : gradeScope === 'all' ? bTotalDogs : bAdultDogs

      const aBreeds = filterYear
        ? (a.by_year_breeds?.[filterYear] ?? (a.unique_breeds ?? a.breeds?.length ?? 0))
        : (a.unique_breeds ?? a.breeds?.length ?? 0)
      const bBreeds = filterYear
        ? (b.by_year_breeds?.[filterYear] ?? (b.unique_breeds ?? b.breeds?.length ?? 0))
        : (b.unique_breeds ?? b.breeds?.length ?? 0)

      const aRate = gradeScope === 'puppy' ? judgePuppyRate(a, filterYear) : judgeExcellentRate(a, filterYear)
      const bRate = gradeScope === 'puppy' ? judgePuppyRate(b, filterYear) : judgeExcellentRate(b, filterYear)

      switch (sortKey) {
        case 'dogs': {
          const cmp = bDogs - aDogs
          if (cmp !== 0) return cmp
          break
        }
        case 'breeds': {
          const cmp = bBreeds - aBreeds
          if (cmp !== 0) return cmp
          break
        }
        case 'strictness_strict': {
          if (aRate != null && bRate != null) {
            const cmp = aRate - bRate
            if (cmp !== 0) return cmp
          } else if (aRate != null) {
            return -1
          } else if (bRate != null) {
            return 1
          }
          break
        }
        case 'strictness_soft': {
          if (aRate != null && bRate != null) {
            const cmp = bRate - aRate
            if (cmp !== 0) return cmp
          } else if (aRate != null) {
            return -1
          } else if (bRate != null) {
            return 1
          }
          break
        }
        case 'name': {
          return a.name.localeCompare(b.name, 'ru')
        }
        case 'exhibitions':
        default: {
          const cmp = bExhibitions - aExhibitions
          if (cmp !== 0) return cmp
          break
        }
      }

      // Вторичная сортировка: по числу выставок, затем по имени
      const secCmp = bExhibitions - aExhibitions
      if (secCmp !== 0) return secCmp
      return a.name.localeCompare(b.name, 'ru')
    })
  }, [filteredJudges, filterYear, sortKey])

  const listRevealRef = useListReveal(!page0Loading && sortedJudges.length > 0)

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

  const handleYearChange = useCallback((newYear: string) => {
    setFilterYear(newYear)
    const targetSlug = newYear === '' ? 'all' : newYear
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('year')
    const qs = nextParams.toString()
    navigate(`/shows/judges/${targetSlug}/${qs ? '?' + qs : ''}`)
  }, [navigate, searchParams])

  const handleResetFilters = useCallback(() => {
    setFilterYear(SHOW_JUDGES_ACTIVE_SEASON)
    setFilterBreed('')
    setSearchQuery('')
    setSortKey('exhibitions')
    setGradeScope('adult')
    navigate(`/shows/judges/${SHOW_JUDGES_ACTIVE_SEASON}/`)
  }, [navigate])

  const handleSelectBreed = (breed: string) => {
    setFilterBreed(breed)
    if (breed) setUserWantsFull(true)
  }

  const plaqueTitle = useMemo(() => {
    const parts: string[] = ['Судьи выставок РКФ']
    if (filterBreed) {
      const breedName = formatBreedName(filterBreed)
      if (breedName) parts.push(breedName)
    }
    if (searchQuery.trim()) {
      parts.push(`«${searchQuery.trim()}»`)
    } else if (filterYear) {
      parts.push(filterYear === 'all' ? 'Все года' : `${filterYear} г.`)
    }
    return parts.join(' · ')
  }, [filterBreed, searchQuery, filterYear])

  const plaque = (
    <DoninoColumnPlaque
      asHeader
      title={
        <span className="inline-flex items-center gap-1.5 sm:gap-2 truncate">
          <span>{plaqueTitle}</span>
          <span className="text-old-money-500 font-semibold text-[11px] sm:text-xs normal-case tracking-normal shrink-0">
            · {formatJudgesCount(sortedJudges.length)}
          </span>
        </span>
      }
      actionPlacement="right"
      action={<ShowJudgeSortDropdown value={sortKey} onChange={setSortKey} />}
    />
  )

  if (page0Loading && !hasPage0) {
    return (
      <div className="space-y-4">
        <SkeletonLoader variant="card" count={5} />
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
        setFilterYear={handleYearChange}
        showYears={SHOW_YEARS}
        isYearNonDefault={isYearNonDefault}
        availableBreeds={availableBreeds}
        dogIndex={dogIndex}
        filterBreed={filterBreed}
        onSelectBreed={handleSelectBreed}
        gradeScope={gradeScope}
        onGradeScopeChange={setGradeScope}
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
        <div className="space-y-4">
          <DoninoColumnShell plaque={plaque} listRef={listRevealRef}>
            <div className="divide-y divide-old-money-100">
              {sortedJudges.slice(0, visibleCount).map((judge) => (
                <div key={judge.id || judge.name} data-list-item>
                  <ShowJudgeCard
                    filterYear={filterYear}
                    gradeScope={gradeScope}
                    judge={{
                      id: judge.id || judge.name,
                      numeric_id: judge.numeric_id,
                      name: judge.name,
                      display_name: judge.display_name,
                      exhibitionsCount: filterYear
                        ? (judge.by_year?.[filterYear] ?? 0)
                        : judge.total_judged,
                      breedsCount: filterYear
                        ? (judge.by_year_breeds?.[filterYear] ?? (judge.unique_breeds ?? judge.breeds?.length ?? 0))
                        : (judge.unique_breeds ?? judge.breeds?.length ?? 0),
                      excellentPct: judgeExcellentPctForCard(judge, filterYear),
                      graded: filterYear ? judge.by_year_graded?.[filterYear] : judge.graded,
                      puppyPct: judgePuppyPctForCard(judge, filterYear),
                      puppyGraded: filterYear ? judge.by_year_puppy_graded?.[filterYear] : judge.puppy_graded,
                      totalDogs: filterYear ? judge.by_year_total_dogs?.[filterYear] : judge.total_dogs,
                      city: judge.city,
                      ranks: judge.ranks,
                      photo_url: judge.photo_url,
                    }}
                    variant="embedded"
                  />
                </div>
              ))}
            </div>
          </DoninoColumnShell>
          {sortedJudges.length > visibleCount && (
            <div ref={loadMoreRef} className="py-3 text-center text-xs text-charcoal-500">
              Загрузка…
            </div>
          )}
        </div>
      )}
    </div>
  )
}
