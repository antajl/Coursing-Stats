import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import SkeletonLoader from '../../components/SkeletonLoader'
import { getShowDogRanking } from '../../lib/staticData'
import {
  compareShowDogs,
  SHOW_FILTER_AWARD_KEYS,
  type ShowAwardKey,
} from '../../../../backend/lib/show-award-ranking'
import ShowRankingFilters, { type ShowAwardMinFilters } from './ShowRankingFilters'
import ShowRankingColumns from './ShowRankingColumns'
import type { ShowDogCardData } from './ShowDogCard'
import { useDebounce } from '../../hooks/useDebounce'
import { dogNameMatchesQuery } from '../../lib/dogName'

const CURRENT_SEASON = String(new Date().getFullYear())

const EMPTY_AWARD_MINS: ShowAwardMinFilters = Object.fromEntries(
  SHOW_FILTER_AWARD_KEYS.map((k) => [k, '']),
) as ShowAwardMinFilters

export default function ShowRanking() {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [allDogs, setAllDogs] = useState<ShowDogCardData[]>([])
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [filterYear, setFilterYear] = useState(() => {
    const fromUrl = searchParams.get('year')
    return fromUrl === null ? CURRENT_SEASON : fromUrl
  })
  const [filterBreed, setFilterBreed] = useState(() => searchParams.get('breed') || '')
  const [filterGroup, setFilterGroup] = useState(() => searchParams.get('group') || '')
  const [awardMins, setAwardMins] = useState<ShowAwardMinFilters>(() => ({
    ...EMPTY_AWARD_MINS,
    BIS: searchParams.get('minBis') || '',
    BOB: searchParams.get('minBob') || '',
    BOS: searchParams.get('minBos') || '',
    CACIB: searchParams.get('minCacib') || '',
    CAC: searchParams.get('minCac') || '',
    JCAC: searchParams.get('minJcac') || '',
    CW: searchParams.get('minCw') || '',
    CHRKF: searchParams.get('minChrkf') || '',
  }))
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Поиск по кличке — по всем годам; фильтр года без поиска грузит dog-ranking-{year}.json.
  const rankingYear = debouncedSearchQuery.trim() ? '' : filterYear

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const result = await getShowDogRanking(rankingYear)
      if (result.success && result.data) {
        setAllDogs(result.data)
      }
      setLoading(false)
    }
    loadData()
  }, [rankingYear])

  useEffect(() => {
    if (!loading) {
      setIsInitialLoad(false)
    }
  }, [loading])

  const breeds = Array.from(new Set(allDogs.map((d) => d.breed))).sort()
  const years = Array.from(
    new Set(['2017', '2018', '2019', '2021', '2022', '2023', '2024', '2025', '2026']),
  ).sort((a, b) => Number(b) - Number(a))
  const groups = Array.from(
    new Set(allDogs.map((d) => d.breed_group).filter(Boolean) as string[]),
  ).sort()

  const rankedDogs = useMemo(
    () =>
      [...allDogs]
        .sort(compareShowDogs)
        .map((dog, i) => ({ ...dog, rank: i + 1 })),
    [allDogs],
  )

  const filteredDogs = useMemo(() => {
    return rankedDogs.filter((dog) => {
      if (filterBreed && dog.breed !== filterBreed) return false
      if (filterGroup && dog.breed_group !== filterGroup) return false
      for (const key of SHOW_FILTER_AWARD_KEYS) {
        const min = Number(awardMins[key])
        if (Number.isFinite(min) && min > 0 && (dog.titles?.[key] || 0) < min) return false
      }
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase()
        const nameMatch = dogNameMatchesQuery(dog.name_lat, dog.name_ru, debouncedSearchQuery)
        const breedMatch = dog.breed.toLowerCase().includes(query)
        if (!nameMatch && !breedMatch) return false
      }
      return true
    })
  }, [rankedDogs, filterBreed, filterGroup, awardMins, debouncedSearchQuery])

  const isFiltering = searchQuery !== debouncedSearchQuery

  const handleAwardMinChange = useCallback((key: ShowAwardKey, value: string) => {
    setAwardMins((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleResetFilters = () => {
    setFilterYear(CURRENT_SEASON)
    setFilterBreed('')
    setFilterGroup('')
    setAwardMins({ ...EMPTY_AWARD_MINS })
    setSearchQuery('')
  }

  const handleResetPanelFilters = () => {
    setFilterYear(CURRENT_SEASON)
    setFilterBreed('')
    setFilterGroup('')
    setAwardMins({ ...EMPTY_AWARD_MINS })
  }

  const showListSkeleton = isInitialLoad && loading

  return (
    <div className="max-w-full mx-auto pb-2 sm:pb-4">
      <ShowRankingFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterYear={filterYear}
        onYearChange={setFilterYear}
        currentSeason={CURRENT_SEASON}
        yearValues={years}
        filterBreed={filterBreed}
        onBreedChange={setFilterBreed}
        breedValues={breeds}
        filterGroup={filterGroup}
        onGroupChange={setFilterGroup}
        groupValues={groups}
        awardMins={awardMins}
        onAwardMinChange={handleAwardMinChange}
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
          {debouncedSearchQuery.trim() && (
            <p className="mb-3 text-xs text-charcoal-500 dark:text-charcoal-400">
              Поиск по всем годам
              {filterYear ? ` (фильтр года ${filterYear} для поиска не применяется)` : ''}.
            </p>
          )}
          <ShowRankingColumns dogs={filteredDogs} filterYear={rankingYear} />
        </>
      )}
    </div>
  )
}
