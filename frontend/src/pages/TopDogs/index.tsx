import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTopPlacement, useTopScore, useTopSpeed, useCompetingBreeds, useYears } from '../../hooks/useStaticData'
import SkeletonLoader from '../../components/SkeletonLoader'
import TopDogsFilters from './TopDogsFilters'
import TopDogsTabs from './TopDogsTabs'
import ProcoursingAttribution from '../../components/ProcoursingAttribution'
import { filterPlacement, filterScore, filterSpeed } from './filterUtils'

const RANKING_TABS = ['placement', 'score', 'speed'] as const
type RankingTab = (typeof RANKING_TABS)[number]

function parseRankingTab(value: string | null): RankingTab {
  return RANKING_TABS.includes(value as RankingTab) ? (value as RankingTab) : 'placement'
}

const CURRENT_SEASON = String(new Date().getFullYear())

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
  const [filterYear, setFilterYear] = useState(() => searchParams.get('year') || CURRENT_SEASON)
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const [filterMinStarts, setFilterMinStarts] = useState(() => searchParams.get('minStarts') || '')
  const [filterScoreFrom, setFilterScoreFrom] = useState(() => searchParams.get('scoreFrom') || '')
  const [filterSpeedFrom, setFilterSpeedFrom] = useState(() => searchParams.get('speedFrom') || '')
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

  const filteredPlacement = filterPlacement(topPlacement, filterParams)
  const filteredScore = filterScore(topScore, filterParams)
  const filteredSpeed = filterSpeed(topSpeed, filterParams)

  const handleResetFilters = () => {
    setFilterYear(CURRENT_SEASON)
    setFilterBreed('')
    setSearchQuery('')
    setFilterMinStarts('')
    setFilterScoreFrom('')
    setFilterSpeedFrom('')
  }

  const handleResetPanelFilters = () => {
    setFilterYear(CURRENT_SEASON)
    setFilterBreed('')
    setFilterMinStarts('')
    setFilterScoreFrom('')
    setFilterSpeedFrom('')
  }

  const showListSkeleton = isInitialLoad && loading

  return (
    <div className={isStandalone ? 'px-4 pb-4' : 'max-w-full mx-auto pb-2 sm:pb-4'}>
      <TopDogsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterYear={filterYear}
        onYearChange={setFilterYear}
        defaultYear={CURRENT_SEASON}
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
        activeTab={activeTab}
        onTabChange={handleTabChange}
        dropdownRef={dropdownRef}
      />

      {showListSkeleton ? (
        <div className="min-h-[360px]">
          <SkeletonLoader variant="card" count={6} />
        </div>
      ) : (
        <TopDogsTabs
          activeTab={activeTab}
          filteredPlacement={filteredPlacement}
          filteredScore={filteredScore}
          filteredSpeed={filteredSpeed}
          filterYear={filterYear}
          filterBreed={filterBreed}
        />
      )}

      {isStandalone && <ProcoursingAttribution className="mt-6" />}
    </div>
  )
}
