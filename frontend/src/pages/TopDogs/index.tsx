import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { SEO } from '../../components/SEO'
import { useYandexGoal } from '../../components/YandexMetrica'
import { useTopPlacement, useTopScore, useTopSpeed, useCompetingBreeds, useYears } from '../../hooks/useStaticData'
import SkeletonLoader from '../../components/SkeletonLoader'
import TopDogsFilters from './TopDogsFilters'
import TopDogsColumns from './TopDogsColumns'
import { filterPlacement, filterScore, filterSpeed } from './filterUtils'
import { sortScoreItems } from '../../lib/staticData'

const COURSING_TABS = ['placement', 'score'] as const
type CoursingTab = (typeof COURSING_TABS)[number]

function parseCoursingTab(value: string | null): CoursingTab {
  if (value === 'placement') return 'placement'
  return 'score'
}

const CURRENT_SEASON = String(new Date().getFullYear())

export default function TopDogs() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const isEmbedded = location.pathname === '/competitions'
  const { reachGoal } = useYandexGoal()

  const [coursingTab, setCoursingTab] = useState<CoursingTab>(() =>
    parseCoursingTab(searchParams.get('rankingTab'))
  )

  const handleCoursingTabChange = useCallback(
    (tab: CoursingTab) => {
      setCoursingTab(tab)
      const params = new URLSearchParams(searchParams)
      if (isEmbedded) {
        params.set('tab', 'ranking')
      }
      if (tab === 'score') {
        params.delete('rankingTab')
      } else {
        params.set('rankingTab', 'placement')
      }
      setSearchParams(params)
    },
    [searchParams, setSearchParams, isEmbedded]
  )

  useEffect(() => {
    setCoursingTab(parseCoursingTab(searchParams.get('rankingTab')))
  }, [searchParams])

  const [filterBreed, setFilterBreed] = useState(() => searchParams.get('breed') || '')
  const [filterYear, setFilterYear] = useState(() => searchParams.get('year') ?? '')
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const [filterMinStarts, setFilterMinStarts] = useState(() => searchParams.get('minStarts') || '')
  const [filterScoreFrom, setFilterScoreFrom] = useState(() => searchParams.get('scoreFrom') || '')
  const [filterSpeedFrom, setFilterSpeedFrom] = useState(() => searchParams.get('speedFrom') || '')

  // Отслеживание использования фильтров
  useEffect(() => {
    if (filterYear || filterBreed || searchQuery || filterMinStarts || filterScoreFrom || filterSpeedFrom) {
      reachGoal('filter_used')
    }
  }, [filterYear, filterBreed, searchQuery, filterMinStarts, filterScoreFrom, filterSpeedFrom, reachGoal])

  // Отслеживание использования поиска
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
  const { data: topSpeedData, isLoading: speedLoading } = useTopSpeed(filterYear)

  const loading = breedsLoading || yearsLoading || placementLoading || scoreLoading || speedLoading

  useEffect(() => {
    if (!loading) {
      setIsInitialLoad(false)
    }
  }, [loading])

  const breeds = breedsData?.success ? (breedsData.data?.breeds || []) : []
  const years = yearsData?.success ? (yearsData.data?.years || []) : []

  const breedValues = breeds
  const yearValues = years.map(String)

  const topPlacement = topPlacementData?.success ? (topPlacementData.data?.items || []) : []
  const topScore = topScoreData?.success ? (topScoreData.data?.items || []) : []
  const topSpeed = topSpeedData?.success ? (topSpeedData.data?.items || []) : []

  const filterParams = {
    searchQuery,
    filterMinStarts,
    filterScoreFrom,
    filterSpeedFrom,
    filterBreed,
  }

  const rankedPlacement = useMemo(
    () => topPlacement.map((dog, i) => ({ ...dog, rank: i + 1 })),
    [topPlacement],
  )
  const rankedScore = useMemo(
    () =>
      sortScoreItems(topScore as Record<string, unknown>[], 'rating_score').map((dog, i) => ({
        ...dog,
        rank: i + 1,
      })),
    [topScore],
  )
  const rankedSpeed = useMemo(
    () => topSpeed.map((dog, i) => ({ ...dog, rank: i + 1 })),
    [topSpeed],
  )

  const filteredPlacement = filterPlacement(rankedPlacement, filterParams)
  const filteredScore = filterScore(rankedScore, filterParams)
  const filteredSpeed = filterSpeed(rankedSpeed, filterParams)

  const handleResetFilters = () => {
    setFilterYear('')
    setFilterBreed('')
    setSearchQuery('')
    setFilterMinStarts('')
    setFilterScoreFrom('')
    setFilterSpeedFrom('')
  }

  const handleResetPanelFilters = () => {
    setFilterYear('')
    setFilterBreed('')
    setFilterMinStarts('')
    setFilterScoreFrom('')
    setFilterSpeedFrom('')
  }

  const showListSkeleton = isInitialLoad && loading

  return (
    <div className={isEmbedded ? 'max-w-full mx-auto pb-2 sm:pb-4' : 'px-4 pb-4'}>
      {!isEmbedded && (
        <SEO
          title="Рейтинг собак"
          description="Рейтинги собак по курсингу и бегам борзых. Топ собак по медалям и очкам, фильтрация по породе, году и количеству стартов. Статистика выступлений 2015-2026."
          canonicalUrl="https://coursing-stats.ru/competitions?tab=ranking"
        />
      )}
      <TopDogsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterYear={filterYear}
        onYearChange={setFilterYear}
        currentSeason={CURRENT_SEASON}
        yearValues={yearValues}
        filterBreed={filterBreed}
        onBreedChange={setFilterBreed}
        breedValues={breedValues}
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
          <SkeletonLoader variant="card" count={6} />
        </div>
      ) : (
        <TopDogsColumns
          coursingTab={coursingTab}
          onCoursingTabChange={handleCoursingTabChange}
          filteredPlacement={filteredPlacement}
          filteredScore={filteredScore}
          filteredSpeed={filteredSpeed}
          filterYear={filterYear}
        />
      )}
    </div>
  )
}
