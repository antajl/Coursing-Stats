import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { SEO } from '../../components/SEO'
import { useYandexGoal } from '../../components/YandexMetrica'
import {
  useTopPlacement,
  useTopScore,
  useTopElo,
  useTopSpeed,
  useCompetingBreeds,
  useYears,
} from '../../hooks/useStaticData'
import LoadingCard from '../../components/LoadingCard'
import TopDogsFilters from './TopDogsFilters'
import TopDogsColumns from './TopDogsColumns'
import { filterCombinedRanking, filterSpeed } from './filterUtils'
import {
  DEFAULT_ACTIVE_SEASON,
  initialSeasonYearFilter,
  resolveActiveSeason,
} from '../../lib/season'
import { buildCombinedRanking } from './mergeCombinedRanking'
import { useFavorites } from '../../hooks/useFavorites'

export default function TopDogs() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const isEmbedded = location.pathname === '/competitions'
  const { reachGoal } = useYandexGoal()
  const { favorites, toggleFavorite } = useFavorites()

  const [filterYear, setFilterYear] = useState(() => initialSeasonYearFilter(searchParams, DEFAULT_ACTIVE_SEASON))
  const [filterBreed, setFilterBreed] = useState(() => searchParams.get('breed') || '')
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const [filterMinStarts, setFilterMinStarts] = useState(() => searchParams.get('minStarts') || '')
  const [filterScoreFrom, setFilterScoreFrom] = useState(() => searchParams.get('scoreFrom') || '')
  const [filterSpeedFrom, setFilterSpeedFrom] = useState(() => searchParams.get('speedFrom') || '')

  useEffect(() => {
    if (filterYear || filterBreed || searchQuery || filterMinStarts || filterScoreFrom || filterSpeedFrom) {
      reachGoal('filter_used')
    }
  }, [filterYear, filterBreed, searchQuery, filterMinStarts, filterScoreFrom, filterSpeedFrom, reachGoal])

  useEffect(() => {
    if (searchQuery) {
      reachGoal('search_used')
    }
  }, [searchQuery, reachGoal])

  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: breedsData, isLoading: breedsLoading } = useCompetingBreeds()
  const { data: yearsData, isLoading: yearsLoading } = useYears()
  const { data: topPlacementData, isLoading: placementLoading } = useTopPlacement(filterYear)
  const { data: topScoreData, isLoading: scoreLoading } = useTopScore(filterYear)
  const { data: topEloData, isLoading: eloLoading } = useTopElo(filterYear)
  const { data: topSpeedData, isLoading: speedLoading } = useTopSpeed(filterYear)

  const loading =
    breedsLoading || yearsLoading || placementLoading || scoreLoading || eloLoading || speedLoading

  useEffect(() => {
    if (!loading) {
      setIsInitialLoad(false)
    }
  }, [loading])

  const breeds = breedsData?.success ? breedsData.data?.breeds || [] : []
  const years = yearsData?.success ? yearsData.data?.years || [] : []
  const dogIndex = breedsData?.success ? breedsData.data?.dogIndex || [] : []

  const activeSeason = useMemo(() => resolveActiveSeason(years), [years])

  // Sync with resolved active season once years load if user did not provide an explicit year in URL
  const hasUrlYear = searchParams.get('year') !== null
  useEffect(() => {
    if (!hasUrlYear && years.length > 0) {
      const resolved = resolveActiveSeason(years)
      setFilterYear((prev) => (prev === DEFAULT_ACTIVE_SEASON ? resolved : prev))
    }
  }, [hasUrlYear, years])

  // Synchronize state with URL search params so the browser address bar updates automatically
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        let changed = false

        // Breed
        const currentBreed = next.get('breed') || ''
        if (filterBreed !== currentBreed) {
          if (filterBreed) next.set('breed', filterBreed)
          else next.delete('breed')
          changed = true
        }

        // Year
        const currentYear = next.get('year')
        const targetYearParam =
          filterYear === '' ? 'all' : filterYear !== activeSeason ? filterYear : null
        if (targetYearParam !== null) {
          if (currentYear !== targetYearParam) {
            next.set('year', targetYearParam)
            changed = true
          }
        } else {
          if (currentYear === 'all' || (currentYear && currentYear !== activeSeason)) {
            next.delete('year')
            changed = true
          }
        }

        // Search query
        const trimmedSearch = searchQuery.trim()
        const currentSearch = next.get('search') || ''
        if (trimmedSearch !== currentSearch) {
          if (trimmedSearch) next.set('search', trimmedSearch)
          else next.delete('search')
          changed = true
        }

        // Thresholds
        if (filterMinStarts !== (next.get('minStarts') || '')) {
          if (filterMinStarts) next.set('minStarts', filterMinStarts)
          else next.delete('minStarts')
          changed = true
        }
        if (filterScoreFrom !== (next.get('scoreFrom') || '')) {
          if (filterScoreFrom) next.set('scoreFrom', filterScoreFrom)
          else next.delete('scoreFrom')
          changed = true
        }
        if (filterSpeedFrom !== (next.get('speedFrom') || '')) {
          if (filterSpeedFrom) next.set('speedFrom', filterSpeedFrom)
          else next.delete('speedFrom')
          changed = true
        }

        return changed ? next : prev
      },
      { replace: true },
    )
  }, [
    filterBreed,
    filterYear,
    searchQuery,
    filterMinStarts,
    filterScoreFrom,
    filterSpeedFrom,
    activeSeason,
    setSearchParams,
  ])

  // Respond to browser back/forward navigation
  useEffect(() => {
    const breedFromUrl = searchParams.get('breed') || ''
    if (breedFromUrl !== filterBreed) {
      setFilterBreed(breedFromUrl)
    }

    const yearFromUrl = searchParams.get('year')
    if (yearFromUrl !== null) {
      const targetYear = yearFromUrl === 'all' ? '' : yearFromUrl
      if (targetYear !== filterYear) {
        setFilterYear(targetYear)
      }
    }
  }, [searchParams])

  const breedValues = breeds
  const yearValues = years.map(String)

  const topPlacement = topPlacementData?.success ? topPlacementData.data?.items || [] : []
  const topScore = topScoreData?.success ? topScoreData.data?.items || [] : []
  const topElo = topEloData?.success ? topEloData.data?.items || [] : []
  const topSpeed = topSpeedData?.success ? topSpeedData.data?.items || [] : []

  const filterParams = {
    searchQuery,
    filterMinStarts,
    filterScoreFrom,
    filterSpeedFrom,
    filterBreed,
  }

  const combinedRanking = useMemo(
    () =>
      buildCombinedRanking(
        topPlacement as Record<string, unknown>[],
        topScore as Record<string, unknown>[],
        topElo as Record<string, unknown>[]
      ),
    [topPlacement, topScore, topElo]
  )

  const rankedSpeed = useMemo(
    () => topSpeed.map((dog, i) => ({ ...dog, rank: i + 1 })),
    [topSpeed]
  )

  const filteredCombined = useMemo(
    () => filterCombinedRanking(combinedRanking, filterParams),
    [combinedRanking, filterParams]
  )
  const filteredSpeed = useMemo(
    () => filterSpeed(rankedSpeed, filterParams),
    [rankedSpeed, filterParams]
  )

  const handleResetFilters = useCallback(() => {
    setFilterYear(activeSeason)
    setFilterBreed('')
    setSearchQuery('')
    setFilterMinStarts('')
    setFilterScoreFrom('')
    setFilterSpeedFrom('')
  }, [activeSeason])

  const handleResetPanelFilters = useCallback(() => {
    setFilterYear(activeSeason)
    setFilterBreed('')
    setFilterMinStarts('')
    setFilterScoreFrom('')
    setFilterSpeedFrom('')
  }, [activeSeason])

  const showListSkeleton = isInitialLoad && loading

  return (
    <div className={isEmbedded ? 'max-w-full mx-auto pb-2 sm:pb-4' : 'px-4 pb-4'}>
      {!isEmbedded && (
        <SEO
          title="Рейтинг собак: курсинг и бега борзых 2026"
          description="Рейтинг собак по курсингу и бегам борзых сезона 2026 года: лидеры по породам (уиппеты, РПБ, басенджи, грейхаунды), медали, очки CS и динамика позиций."
          canonicalUrl="https://coursing-stats.ru/competitions?tab=ranking"
        />
      )}

      <TopDogsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterYear={filterYear}
        onYearChange={setFilterYear}
        currentSeason={activeSeason}
        yearValues={yearValues}
        filterBreed={filterBreed}
        onBreedChange={setFilterBreed}
        breedValues={breedValues}
        dogIndex={dogIndex}
        filterMinStarts={filterMinStarts}
        onMinStartsChange={setFilterMinStarts}
        filterScoreFrom={filterScoreFrom}
        onScoreFromChange={setFilterScoreFrom}
        filterSpeedFrom={filterSpeedFrom}
        onSpeedFromChange={setFilterSpeedFrom}
        onResetFilters={handleResetFilters}
        onResetPanelFilters={handleResetPanelFilters}
        dropdownRef={dropdownRef}
      />

      {showListSkeleton ? (
        <div className="min-h-[360px]">
          <LoadingCard count={6} variant="list" />
        </div>
      ) : (
        <TopDogsColumns
          filteredCombined={filteredCombined}
          filteredSpeed={filteredSpeed}
          filterYear={filterYear}
          favorites={favorites}
          onToggleFavorite={(dogId, meta) => {
            void toggleFavorite(dogId, meta).catch((error) => {
              console.error('Failed to toggle favorite:', error)
            })
          }}
          disclaimerMode="column"
        />
      )}
    </div>
  )
}
