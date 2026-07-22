import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SkeletonLoader from '../../components/SkeletonLoader'
import { getShowDogRanking } from '../../lib/staticData'
import { compareShowDogs } from '../../../../backend/lib/show-award-ranking'
import ShowRankingFilters from './ShowRankingFilters'
import ShowRankingColumns from './ShowRankingColumns'
import type { ShowDogCardData } from './ShowDogCard'
import { useDebounce } from '../../hooks/useDebounce'

const CURRENT_SEASON = String(new Date().getFullYear())

export default function ShowRanking() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [allDogs, setAllDogs] = useState<ShowDogCardData[]>([])
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [filterYear, setFilterYear] = useState(() => searchParams.get('year') ?? CURRENT_SEASON)
  const [filterBreed, setFilterBreed] = useState(() => searchParams.get('breed') || '')
  const [filterGroup, setFilterGroup] = useState(() => searchParams.get('group') || '')
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const result = await getShowDogRanking(filterYear)
      if (result.success && result.data) {
        setAllDogs(result.data)
      }
      setLoading(false)
    }
    loadData()
  }, [filterYear])

  useEffect(() => {
    if (!loading) {
      setIsInitialLoad(false)
    }
  }, [loading])

  // Extract unique breeds, years, and groups from data
  const breeds = Array.from(new Set(allDogs.map(d => d.breed))).sort()
  const years = Array.from(new Set(['2017', '2018', '2019', '2021', '2022', '2023', '2024', '2025', '2026'])).sort((a, b) => Number(b) - Number(a))
  const groups = Array.from(new Set(allDogs.map(d => d.breed_group).filter(Boolean) as string[])).sort()

  // Debounce search query to avoid freezing on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Filter dogs (order from index / rank_score)
  const filteredDogs = useMemo(() => {
    return allDogs
      .filter((dog) => {
        if (filterBreed && dog.breed !== filterBreed) return false
        if (filterGroup && dog.breed_group !== filterGroup) return false
        if (debouncedSearchQuery) {
          const query = debouncedSearchQuery.toLowerCase()
          const nameMatch =
            dog.name_lat.toLowerCase().includes(query) ||
            (dog.name_ru && dog.name_ru.toLowerCase().includes(query))
          const breedMatch = dog.breed.toLowerCase().includes(query)
          if (!nameMatch && !breedMatch) return false
        }
        return true
      })
      .sort(compareShowDogs)
  }, [allDogs, filterBreed, filterGroup, debouncedSearchQuery])

  // Show loading indicator when search is debouncing
  const isFiltering = searchQuery !== debouncedSearchQuery

  const handleResetFilters = () => {
    setFilterYear('')
    setFilterBreed('')
    setFilterGroup('')
    setSearchQuery('')
  }

  const handleResetPanelFilters = () => {
    setFilterYear('')
    setFilterBreed('')
    setFilterGroup('')
  }

  const showListSkeleton = isInitialLoad && loading

  return (
    <div className="max-w-full mx-auto pb-2 sm:pb-4">
      <ShowRankingFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterYear={filterYear}
        onYearChange={setFilterYear}
        yearValues={years}
        filterBreed={filterBreed}
        onBreedChange={setFilterBreed}
        breedValues={breeds}
        filterGroup={filterGroup}
        onGroupChange={setFilterGroup}
        groupValues={groups}
        onResetFilters={handleResetFilters}
        onResetPanelFilters={handleResetPanelFilters}
        dropdownRef={dropdownRef}
      />

      {showListSkeleton ? (
        <div className="min-h-[360px]">
          <SkeletonLoader variant="card" count={6} />
        </div>
      ) : (
        <>
          {isFiltering && (
            <p className="mb-3 text-xs text-camel-600 dark:text-camel-400 animate-pulse">
              Фильтрация...
            </p>
          )}
          <p className="mb-3 text-xs text-charcoal-500 dark:text-charcoal-400">
            Рейтинг по весу наград (BIS → BOB → CACIB → CAC). Подробнее —{' '}
            <Link to="/guide?tab=shows" className="text-camel-700 underline dark:text-camel-400">
              справка «Выставки»
            </Link>
            .
          </p>
          <ShowRankingColumns dogs={filteredDogs} filterYear={filterYear} />
        </>
      )}
    </div>
  )
}
