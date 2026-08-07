import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import SkeletonLoader from '../../components/SkeletonLoader'
import { getShowDogRanking, getShowDogRankingPage0 } from '../../lib/staticData'
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
import { matchesBreedFilter, uniqueCanonicalBreeds } from '../../lib/breedMapping'

const CURRENT_SEASON = String(new Date().getFullYear())

/** Let page0 paint + free the network before pulling the multi‑MB season file. */
const FULL_RANKING_DELAY_MS = 1200

const EMPTY_AWARD_MINS: ShowAwardMinFilters = Object.fromEntries(
  SHOW_FILTER_AWARD_KEYS.map((k) => [k, '']),
) as ShowAwardMinFilters

export default function ShowRanking() {
  const [searchParams] = useSearchParams()
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
  const [allowFullLoad, setAllowFullLoad] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const debouncedFilterBreed = useDebounce(filterBreed, 200)
  const debouncedFilterGroup = useDebounce(filterGroup, 200)
  const debouncedAwardMins = useDebounce(awardMins, 200)

  const rankingYear = filterYear

  const {
    data: page0Data,
    isLoading: isPage0Loading,
    isFetched: isPage0Fetched,
    isError: isPage0Error,
  } = useQuery({
    queryKey: ['showDogRankingPage0', rankingYear],
    queryFn: () => getShowDogRankingPage0(rankingYear),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(rankingYear),
  })

  const hasPage0 = Boolean(page0Data?.success && page0Data.data)
  const page0Failed =
    isPage0Fetched && (!page0Data?.success || !page0Data.data || isPage0Error)

  // Full season only after page0 settled (success or missing) — never race it on first paint.
  useEffect(() => {
    setAllowFullLoad(false)
    if (!rankingYear) return
    if (!isPage0Fetched && !isPage0Error) return

    const needsFullSoon =
      page0Failed ||
      Boolean(searchQuery.trim()) ||
      Boolean(filterBreed) ||
      Boolean(filterGroup) ||
      Object.values(awardMins).some((v) => Boolean(v))

    const delay = needsFullSoon ? 0 : FULL_RANKING_DELAY_MS
    const t = window.setTimeout(() => setAllowFullLoad(true), delay)
    return () => window.clearTimeout(t)
  }, [
    rankingYear,
    isPage0Fetched,
    isPage0Error,
    page0Failed,
    searchQuery,
    filterBreed,
    filterGroup,
    awardMins,
  ])

  const {
    data: rankingData,
    isFetched: isRankingFetched,
    error: rankingError,
  } = useQuery({
    queryKey: ['showDogRanking', rankingYear],
    queryFn: () => getShowDogRanking(rankingYear),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(rankingYear) && allowFullLoad,
  })

  const hasFullRanking = Boolean(rankingData?.success && rankingData.data)
  const rankingPartial = hasPage0 && !hasFullRanking

  useEffect(() => {
    if (hasFullRanking && rankingData?.data) {
      setAllDogs(rankingData.data)
      return
    }
    if (hasPage0 && page0Data?.data) {
      setAllDogs(page0Data.data)
      return
    }
    // Waiting for page0 of the new year — don't keep previous season's dogs.
    setAllDogs([])
  }, [hasFullRanking, hasPage0, rankingData, page0Data, rankingYear])

  const breeds = useMemo(
    () => uniqueCanonicalBreeds(allDogs.map((d) => d.breed)),
    [allDogs],
  )
  const dogIndex = useMemo(
    () =>
      allDogs.map((d) => ({
        breed: d.breed,
        competition_count: 1,
      })),
    [allDogs],
  )
  const years = Array.from(
    new Set(['2017', '2018', '2019', '2021', '2022', '2023', '2024', '2025', '2026']),
  ).sort((a, b) => Number(b) - Number(a))
  const groups = Array.from(
    new Set(allDogs.map((d) => d.breed_group).filter(Boolean) as string[]),
  ).sort()

  const rankedDogs = useMemo(() => {
    if (filterYear) {
      return allDogs.map((dog) => ({
        ...dog,
        rank: dog.rank ?? 0,
      }))
    }
    return [...allDogs]
      .sort(compareShowDogs)
      .map((dog, i) => ({ ...dog, rank: i + 1 }))
  }, [allDogs, filterYear])

  const filteredDogs = useMemo(() => {
    return rankedDogs.filter((dog) => {
      if (!matchesBreedFilter(dog.breed, debouncedFilterBreed)) return false
      if (debouncedFilterGroup && dog.breed_group !== debouncedFilterGroup) return false
      for (const key of SHOW_FILTER_AWARD_KEYS) {
        const min = Number(debouncedAwardMins[key])
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
  }, [rankedDogs, debouncedFilterBreed, debouncedFilterGroup, debouncedAwardMins, debouncedSearchQuery])

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

  const showListSkeleton = allDogs.length === 0 && (isPage0Loading || !isPage0Fetched)
  const loadFailed =
    allDogs.length === 0 &&
    isPage0Fetched &&
    page0Failed &&
    allowFullLoad &&
    isRankingFetched &&
    (rankingError || (rankingData && !rankingData.success))

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
        dogIndex={dogIndex}
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
        <div className="min-h-[360px]" aria-busy="true" aria-live="polite">
          <p className="mb-3 text-xs text-charcoal-500 dark:text-charcoal-400">
            Загрузка рейтинга сезона…
          </p>
          <SkeletonLoader variant="card" count={8} />
        </div>
      ) : loadFailed ? (
        <div className="min-h-[360px] flex items-center justify-center">
          <p className="text-sm text-red-600 dark:text-red-400">
            Ошибка загрузки данных. Попробуйте позже.
          </p>
        </div>
      ) : (
        <>
          {rankingPartial ? (
            <p className="mb-3 text-xs text-charcoal-500 dark:text-charcoal-400" aria-live="polite">
              Показан топ рейтинга — полный сезон подгружается…
            </p>
          ) : null}
          {isFiltering && (
            <p className="mb-3 text-xs text-camel-600 dark:text-camel-400 animate-pulse">
              Фильтрация...
            </p>
          )}
          <ShowRankingColumns dogs={filteredDogs} filterYear={rankingYear} />
        </>
      )}
    </div>
  )
}
