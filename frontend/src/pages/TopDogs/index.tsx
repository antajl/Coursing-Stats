import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTopPlacement, useTopScore, useTopSpeed, useBreeds, useYears } from '../../hooks/useApi'
import SkeletonLoader from '../../components/SkeletonLoader'
import TopDogsFilters from './TopDogsFilters'
import TopDogsTabs from './TopDogsTabs'
import { filterPlacement, filterScore, filterSpeed } from './filterUtils'

export default function TopDogs() {
  const [searchParams] = useSearchParams()
  const isStandalone = !searchParams.get('tab')

  const [activeTab, setActiveTab] = useState(() => searchParams.get('rankingTab') || 'placement')
  const [filterBreed, setFilterBreed] = useState(() => searchParams.get('breed') || '')
  const [filterYear, setFilterYear] = useState(() => searchParams.get('year') || '2026')
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const [filterStartsFrom, setFilterStartsFrom] = useState(() => searchParams.get('startsFrom') || '')
  const [filterStartsTo, setFilterStartsTo] = useState(() => searchParams.get('startsTo') || '')
  const [filterScoreFrom, setFilterScoreFrom] = useState(() => searchParams.get('scoreFrom') || '')
  const [filterScoreTo, setFilterScoreTo] = useState(() => searchParams.get('scoreTo') || '')
  const [filterScoreType, setFilterScoreType] = useState(() => searchParams.get('scoreType') || 'best')
  const [filterSpeedFrom, setFilterSpeedFrom] = useState(() => searchParams.get('speedFrom') || '')
  const [filterSpeedTo, setFilterSpeedTo] = useState(() => searchParams.get('speedTo') || '')
  const [filterSpeedType, setFilterSpeedType] = useState(() => searchParams.get('speedType') || 'best')

  const { data: breedsData, isLoading: breedsLoading } = useBreeds()
  const { data: yearsData, isLoading: yearsLoading } = useYears()
  const { data: topPlacementData, isLoading: placementLoading } = useTopPlacement(
    filterYear,
    filterBreed,
    parseInt(filterStartsFrom) || 0,
    null,
    0
  )
  const { data: topScoreData, isLoading: scoreLoading } = useTopScore(
    filterYear,
    filterBreed,
    parseInt(filterStartsFrom) || 0,
    null,
    0
  )
  const { data: topSpeedData, isLoading: speedLoading } = useTopSpeed(
    filterYear,
    filterBreed,
    parseInt(filterStartsFrom) || 0,
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
    filterStartsFrom,
    filterStartsTo,
    filterScoreFrom,
    filterScoreTo,
    filterScoreType,
    filterSpeedFrom,
    filterSpeedTo,
    filterSpeedType,
  }

  const filteredPlacement = filterPlacement(topPlacement, filterParams)
  const filteredScore = filterScore(topScore, filterParams)
  const filteredSpeed = filterSpeed(topSpeed, filterParams)

  const handleResetFilters = () => {
    setFilterYear('2026')
    setFilterBreed('')
    setFilterStartsFrom('')
    setFilterStartsTo('')
    setFilterScoreFrom('')
    setFilterScoreTo('')
    setFilterScoreType('best')
    setFilterSpeedFrom('')
    setFilterSpeedTo('')
    setFilterSpeedType('best')
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
        filterStartsFrom={filterStartsFrom}
        onStartsFromChange={setFilterStartsFrom}
        filterStartsTo={filterStartsTo}
        onStartsToChange={setFilterStartsTo}
        filterScoreFrom={filterScoreFrom}
        onScoreFromChange={setFilterScoreFrom}
        filterScoreTo={filterScoreTo}
        onScoreToChange={setFilterScoreTo}
        filterScoreType={filterScoreType}
        onScoreTypeChange={setFilterScoreType}
        filterSpeedFrom={filterSpeedFrom}
        onSpeedFromChange={setFilterSpeedFrom}
        filterSpeedTo={filterSpeedTo}
        onSpeedToChange={setFilterSpeedTo}
        filterSpeedType={filterSpeedType}
        onSpeedTypeChange={setFilterSpeedType}
        onResetFilters={handleResetFilters}
      />

      <TopDogsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        filteredPlacement={filteredPlacement}
        filteredScore={filteredScore}
        filteredSpeed={filteredSpeed}
        filterYear={filterYear}
        filterBreed={filterBreed}
      />
    </div>
  )
}
