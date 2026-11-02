import { useState, useEffect, useMemo, useRef } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { SEO } from '../../components/SEO'
import { useYandexGoal } from '../../components/YandexMetrica'
import JudgeCard from '../../components/JudgeCard'
import { DEFAULT_ACTIVE_SEASON, initialSeasonYearFilter, resolveActiveSeason } from '../../lib/season'
import { useJudges, useCompetingBreeds, useYears } from '../../hooks/useStaticData'
import EmptyState from '../../components/EmptyState'
import LoadingCard from '../../components/LoadingCard'
import { useListReveal } from '../../hooks/useListReveal'
import { JudgesToolbar } from './JudgesToolbar'

export default function Judges() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isEmbedded = location.pathname.startsWith('/competitions')
  const { reachGoal } = useYandexGoal()
  const { data: breedsData } = useCompetingBreeds()
  const { data: yearsData } = useYears()

  const dogIndex = breedsData?.success ? breedsData.data?.dogIndex || [] : []
  const competingBreeds = breedsData?.success ? breedsData.data?.breeds || [] : []

  const availableYears = useMemo(() => {
    const rawYears = yearsData?.success ? yearsData.data?.years || [] : []
    const strYears = rawYears.map(String).filter((y) => Number(y) >= 2021)
    return strYears.length > 0 ? strYears : ['2026', '2025', '2024', '2023', '2022', '2021']
  }, [yearsData])

  const activeSeason = useMemo(() => resolveActiveSeason(availableYears), [availableYears])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterYear, setFilterYear] = useState(() =>
    initialSeasonYearFilter(searchParams, DEFAULT_ACTIVE_SEASON),
  )

  const hasUrlYear = searchParams.get('year') !== null
  useEffect(() => {
    if (!hasUrlYear && availableYears.length > 0) {
      const resolved = resolveActiveSeason(availableYears)
      setFilterYear((prev) => (prev === DEFAULT_ACTIVE_SEASON ? resolved : prev))
    }
  }, [hasUrlYear, availableYears])

  const [filterBreed, setFilterBreed] = useState('')
  const [filterDiscipline, setFilterDiscipline] = useState('')
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [visibleCount, setVisibleCount] = useState(20)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // Tracking page view
  useEffect(() => {
    if (!isEmbedded) {
      reachGoal('judges_view')
    }
  }, [isEmbedded, reachGoal])

  const { data: judgesData, isLoading: loading } = useJudges(filterBreed, filterDiscipline, filterYear)

  const judges = judgesData?.success
    ? Array.isArray(judgesData.data?.judges)
      ? judgesData.data.judges
      : Array.isArray(judgesData.data)
        ? judgesData.data
        : []
    : []

  const availableBreeds = useMemo(() => {
    const fromApi = judgesData?.success
      ? (judgesData.data?.available_breeds as string[] | undefined) ??
        (judgesData.data?.availableBreeds as string[] | undefined)
      : null
    const list = Array.isArray(fromApi) && fromApi.length > 0 ? fromApi : []
    const set = new Set<string>()
    for (const b of competingBreeds) set.add(b)
    for (const b of list) set.add(b)
    return Array.from(set)
  }, [competingBreeds, judgesData])

  useEffect(() => {
    if (!loading && judges.length > 0) {
      setIsInitialLoad(false)
    }
  }, [loading, judges.length])

  const filteredJudges = judges.filter((judge) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return judge.name?.toLowerCase().includes(query)
  })

  const sortedJudges = useMemo(() => {
    return [...filteredJudges].sort((a, b) => {
      const cmp = (b.total_evaluations_count ?? 0) - (a.total_evaluations_count ?? 0)
      if (cmp !== 0) return cmp
      return String(a.name || '').localeCompare(String(b.name || ''), 'ru')
    })
  }, [filteredJudges])

  const listRevealRef = useListReveal(!loading && sortedJudges.length > 0)

  // Infinite scroll
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < sortedJudges.length) {
          setVisibleCount((prev) => Math.min(prev + 20, sortedJudges.length))
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [visibleCount, sortedJudges.length])

  const isYearNonDefault = filterYear !== '' && filterYear !== activeSeason
  const hasActiveFilters = Boolean(isYearNonDefault || filterBreed || filterDiscipline || searchQuery)

  const clearFilters = () => {
    setSearchQuery('')
    setFilterYear(activeSeason)
    setFilterBreed('')
    setFilterDiscipline('')
  }

  if (isInitialLoad && loading) {
    return <LoadingCard count={6} variant="list" />
  }

  return (
    <div className="max-w-full mx-auto pb-2 sm:pb-4">
      {!isEmbedded && (
        <SEO
          title="Судьи"
          description="Статистика судей по курсингу и бегам борзых. Рейтинг судей по количеству оценок, фильтрация по дисциплине, породе и году. Экспертная оценка и судейство соревнований."
          canonicalUrl="https://coursing-stats.ru/competitions/"
        />
      )}
      <div className="mb-2 sm:mb-4">
        <JudgesToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterYear={filterYear}
          setFilterYear={setFilterYear}
          availableYears={availableYears}
          isYearNonDefault={isYearNonDefault}
          filterBreed={filterBreed}
          setFilterBreed={setFilterBreed}
          availableBreeds={availableBreeds}
          dogIndex={dogIndex}
          filterDiscipline={filterDiscipline}
          setFilterDiscipline={setFilterDiscipline}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
        />
      </div>

      {sortedJudges.length === 0 ? (
        <div className="overflow-hidden rounded-xl border border-old-money-200 bg-white">
          <EmptyState title="Судьи не найдены" description="Попробуйте изменить фильтры" />
        </div>
      ) : (
        <div ref={listRevealRef} className="grid grid-cols-1 gap-2">
          {sortedJudges.slice(0, visibleCount).map((judge) => (
            <div key={judge.id} data-list-item>
              <JudgeCard judge={judge} filterYear={filterYear} filterDiscipline={filterDiscipline} />
            </div>
          ))}
          {sortedJudges.length > visibleCount && (
            <div ref={loadMoreRef} className="h-4" />
          )}
        </div>
      )}
    </div>
  )
}
