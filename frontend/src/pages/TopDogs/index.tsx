import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTopPlacement, useTopScore, useTopSpeed, useBreeds, useYears } from '../../hooks/useApi'
import SkeletonLoader from '../../components/SkeletonLoader'
import TopDogsFilters from './TopDogsFilters'
import TopDogsTabs from './TopDogsTabs'
import { filterPlacement, filterScore, filterSpeed } from './filterUtils'

const RANKING_TABS = ['placement', 'score', 'speed'] as const
type RankingTab = (typeof RANKING_TABS)[number]

function parseRankingTab(value: string | null): RankingTab {
  return RANKING_TABS.includes(value as RankingTab) ? (value as RankingTab) : 'placement'
}

export default function TopDogs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const isStandalone = !searchParams.get('tab')

  const [activeTab, setActiveTab] = useState<RankingTab>(() => parseRankingTab(searchParams.get('rankingTab')))

  const handleTabChange = useCallback(
    (tab: RankingTab) => {
      setActiveTab(tab)
      const params = new URLSearchParams(searchParams)
      if (!isStandalone) {
        params.set('tab', 'ranking')
      }
      if (tab === 'placement') {
        params.delete('rankingTab')
      } else {
        params.set('rankingTab', tab)
      }
      setSearchParams(params)
    },
    [searchParams, setSearchParams, isStandalone]
  )

  useEffect(() => {
    setActiveTab(parseRankingTab(searchParams.get('rankingTab')))
  }, [searchParams])
  const [filterBreed, setFilterBreed] = useState(() => searchParams.get('breed') || '')
  const [filterYear, setFilterYear] = useState(() => searchParams.get('year') || '')
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const [filterMinStarts, setFilterMinStarts] = useState(() => searchParams.get('minStarts') || '')
  const [filterScoreFrom, setFilterScoreFrom] = useState(() => searchParams.get('scoreFrom') || '')
  const [filterSpeedFrom, setFilterSpeedFrom] = useState(() => searchParams.get('speedFrom') || '')
  const [scoreSortBy, setScoreSortBy] = useState<'best_score' | 'best_judge_score' | 'avg_judge_score'>(() =>
    (searchParams.get('scoreSortBy') as 'best_score' | 'best_judge_score' | 'avg_judge_score') || 'best_score'
  )
  const [placementSortBy, setPlacementSortBy] = useState<'gold' | 'silver' | 'bronze' | 'total'>(() =>
    (searchParams.get('placementSortBy') as 'gold' | 'silver' | 'bronze' | 'total') || 'gold'
  )
  const [speedSortBy, setSpeedSortBy] = useState<'best_speed' | 'avg_speed'>(() =>
    (searchParams.get('speedSortBy') as 'best_speed' | 'avg_speed') || 'best_speed'
  )

  const { data: breedsData, isLoading: breedsLoading } = useBreeds()
  const { data: yearsData, isLoading: yearsLoading } = useYears()
  const { data: topPlacementData, isLoading: placementLoading } = useTopPlacement(
    filterYear,
    filterBreed,
    parseInt(filterMinStarts) || 0,
    placementSortBy,
    null,
    0
  )
  const { data: topScoreData, isLoading: scoreLoading } = useTopScore(
    filterYear,
    filterBreed,
    parseInt(filterMinStarts) || 0,
    scoreSortBy,
    null,
    0
  )
  const { data: topSpeedData, isLoading: speedLoading } = useTopSpeed(
    filterYear,
    filterBreed,
    parseInt(filterMinStarts) || 0,
    speedSortBy,
    null,
    0
  )

  const loading = breedsLoading || yearsLoading || placementLoading || scoreLoading || speedLoading

  useEffect(() => {
    if (!loading) {
      setIsInitialLoad(false)
    }
  }, [loading])

  const breeds = breedsData?.success ? (Array.isArray(breedsData.data) ? breedsData.data : []) : []
  const years = yearsData?.success ? (Array.isArray(yearsData.data) ? yearsData.data : []) : []

  const breedValues = breeds.map((b: { breed?: string } | string) =>
    typeof b === 'object' ? b.breed : b
  ) as string[]
  const yearValues = years.map((y: { year?: string | number } | string | number) =>
    typeof y === 'object' ? y.year : y
  )

  const topPlacement = topPlacementData?.success
    ? Array.isArray(topPlacementData.data)
      ? topPlacementData.data
      : topPlacementData.data?.items || []
    : []
  const topScore = topScoreData?.success
    ? Array.isArray(topScoreData.data)
      ? topScoreData.data
      : topScoreData.data?.items || []
    : []
  const topSpeed = topSpeedData?.success
    ? Array.isArray(topSpeedData.data)
      ? topSpeedData.data
      : topSpeedData.data?.items || []
    : []

  if (isInitialLoad && loading) {
    return <SkeletonLoader variant="card" count={4} />
  }

  const filterParams = {
    searchQuery,
    filterMinStarts,
    filterScoreFrom,
    filterSpeedFrom,
  }

  const filteredPlacement = filterPlacement(topPlacement, filterParams)
  const filteredScore = filterScore(topScore, filterParams)
  const filteredSpeed = filterSpeed(topSpeed, filterParams)

  const handleResetFilters = () => {
    setFilterYear('2026')
    setFilterBreed('')
    setFilterMinStarts('')
    setFilterScoreFrom('')
    setFilterSpeedFrom('')
    setScoreSortBy('best_score')
    setPlacementSortBy('gold')
    setSpeedSortBy('best_speed')
  }

  return (
    <div className={isStandalone ? 'p-4' : 'px-4 pb-4 pt-0'}>
      <TopDogsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterYear={filterYear}
        onYearChange={setFilterYear}
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
        activeTab={activeTab}
      />

      <TopDogsTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        filteredPlacement={filteredPlacement}
        filteredScore={filteredScore}
        filteredSpeed={filteredSpeed}
        filterYear={filterYear}
        filterBreed={filterBreed}
        scoreSortBy={scoreSortBy}
        onScoreSortByChange={setScoreSortBy}
        placementSortBy={placementSortBy}
        onPlacementSortByChange={setPlacementSortBy}
        speedSortBy={speedSortBy}
        onSpeedSortByChange={setSpeedSortBy}
      />
    </div>
  )
}
