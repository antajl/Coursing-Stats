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
import ShowRankingColumns, { type RankedShowDog } from './ShowRankingColumns'
import type { ShowDogCardData } from './ShowDogCard'
import { useDebounce } from '../../hooks/useDebounce'
import { dogNameSearchText, dogQuerySearchTokens } from '../../lib/dogName'
import { canonicalBreed, breedAliasKey } from '../../lib/breedMapping'
import { initialSeasonYearFilter, resolveActiveSeason } from '../../lib/season'
import { useFavorites } from '../../hooks/useFavorites'

const SHOW_RANKING_YEARS = [
  '2026',
  '2025',
  '2024',
  '2023',
  '2022',
  '2021',
  '2019',
  '2018',
  '2017',
] as const

const SHOW_ACTIVE_SEASON = resolveActiveSeason(SHOW_RANKING_YEARS)

/** Brief grace period for page0 to paint before requesting the full season file. */
const FULL_RANKING_DELAY_MS = 250

const EMPTY_AWARD_MINS: ShowAwardMinFilters = Object.fromEntries(
  SHOW_FILTER_AWARD_KEYS.map((k) => [k, '']),
) as ShowAwardMinFilters

export default function ShowRanking() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { favorites, toggleFavorite } = useFavorites()
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [filterYear, setFilterYear] = useState(() =>
    initialSeasonYearFilter(searchParams, SHOW_ACTIVE_SEASON),
  )
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

  // Debounce only text typing in search input (never debounce clicks on breed/group/award pills)
  const debouncedSearchQuery = useDebounce(searchQuery, 250)

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

  // Reset allowFullLoad only when year changes
  useEffect(() => {
    setAllowFullLoad(false)
  }, [rankingYear])

  // Full season fetch: start immediately if filters are active or page0 failed; otherwise after a brief delay
  useEffect(() => {
    if (!rankingYear) return

    const hasActiveFilters =
      Boolean(searchQuery.trim()) ||
      Boolean(filterBreed) ||
      Boolean(filterGroup) ||
      Object.values(awardMins).some((v) => Boolean(v))

    if (hasActiveFilters || page0Failed) {
      setAllowFullLoad(true)
      return
    }

    if (!isPage0Fetched && !isPage0Error) return

    const t = window.setTimeout(() => setAllowFullLoad(true), FULL_RANKING_DELAY_MS)
    return () => window.clearTimeout(t)
  }, [rankingYear, isPage0Fetched, isPage0Error, page0Failed, searchQuery, filterBreed, filterGroup, awardMins])

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

  // Synchronous memoized allDogs: zero delay, no useState or effect lag
  const allDogs = useMemo<ShowDogCardData[]>(() => {
    if (rankingData?.success && rankingData.data) {
      return rankingData.data
    }
    if (page0Data?.success && page0Data.data) {
      return page0Data.data
    }
    return []
  }, [rankingData, page0Data])

  // Synchronize state with URL search params
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
          filterYear === '' ? 'all' : filterYear !== SHOW_ACTIVE_SEASON ? filterYear : null
        if (targetYearParam !== null) {
          if (currentYear !== targetYearParam) {
            next.set('year', targetYearParam)
            changed = true
          }
        } else {
          if (currentYear === 'all' || (currentYear && currentYear !== SHOW_ACTIVE_SEASON)) {
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

        // Group
        const currentGroup = next.get('group') || ''
        if (filterGroup !== currentGroup) {
          if (filterGroup) next.set('group', filterGroup)
          else next.delete('group')
          changed = true
        }

        // Award minimums
        for (const key of SHOW_FILTER_AWARD_KEYS) {
          const paramKey = `min${key.charAt(0).toUpperCase()}${key.slice(1).toLowerCase()}`
          const currentVal = next.get(paramKey) || ''
          const targetVal = awardMins[key] || ''
          if (currentVal !== targetVal) {
            if (targetVal) next.set(paramKey, targetVal)
            else next.delete(paramKey)
            changed = true
          }
        }

        return changed ? next : prev
      },
      { replace: true },
    )
  }, [filterBreed, filterYear, searchQuery, filterGroup, awardMins, setSearchParams])

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

    const groupFromUrl = searchParams.get('group') || ''
    if (groupFromUrl !== filterGroup) {
      setFilterGroup(groupFromUrl)
    }
  }, [searchParams])

  // Single-pass computation of unique breeds and compact dogIndex (avoids allocating 115k objects)
  const { breeds, dogIndex } = useMemo(() => {
    const counts = new Map<string, number>()
    for (let i = 0; i < allDogs.length; i++) {
      const b = allDogs[i].breed
      if (b) {
        counts.set(b, (counts.get(b) || 0) + 1)
      }
    }
    const idx: import('../../lib/competingBreeds').DogsIndexEntry[] = []
    const breedList: string[] = []
    for (const [breed, count] of counts.entries()) {
      idx.push({ breed, competition_count: count, dog_count: count })
      breedList.push(breed)
    }
    breedList.sort((a, b) => a.localeCompare(b, 'ru'))
    return { breeds: breedList, dogIndex: idx }
  }, [allDogs])

  const years = Array.from(
    new Set(['2017', '2018', '2019', '2021', '2022', '2023', '2024', '2025', '2026']),
  ).sort((a, b) => Number(b) - Number(a))

  // Avoid cloning 58k objects when rank is already present
  const rankedDogs = useMemo<RankedShowDog[]>(() => {
    if (filterYear && allDogs.length > 0 && typeof allDogs[0].rank === 'number') {
      return allDogs as RankedShowDog[]
    }
    return [...allDogs]
      .sort(compareShowDogs)
      .map((dog, i) => ({ ...dog, rank: i + 1 }))
  }, [allDogs, filterYear])

  // Optimized filter loop: precalculates all invariants outside the 58k loop
  const filteredDogs = useMemo(() => {
    if (rankedDogs.length === 0) return []

    const targetBreedKey = filterBreed ? breedAliasKey(canonicalBreed(filterBreed)) : ''
    const searchTokens = debouncedSearchQuery ? dogQuerySearchTokens(debouncedSearchQuery) : []
    const searchLower = debouncedSearchQuery ? debouncedSearchQuery.toLowerCase() : ''

    const activeAwardFilters: Array<[ShowAwardKey, number]> = []
    for (let i = 0; i < SHOW_FILTER_AWARD_KEYS.length; i++) {
      const key = SHOW_FILTER_AWARD_KEYS[i]
      const min = Number(awardMins[key])
      if (Number.isFinite(min) && min > 0) {
        activeAwardFilters.push([key, min])
      }
    }

    const hasBreed = Boolean(targetBreedKey)
    const hasGroup = Boolean(filterGroup)
    const hasAwards = activeAwardFilters.length > 0
    const hasSearch = searchTokens.length > 0

    if (!hasBreed && !hasGroup && !hasAwards && !hasSearch) {
      return rankedDogs
    }

    const filtered = rankedDogs.filter((dog) => {
      if (hasBreed) {
        if (!dog.breed) return false
        if (breedAliasKey(canonicalBreed(dog.breed)) !== targetBreedKey) return false
      }
      if (hasGroup && dog.breed_group !== filterGroup) {
        return false
      }
      if (hasAwards) {
        for (let i = 0; i < activeAwardFilters.length; i++) {
          const [key, min] = activeAwardFilters[i]
          if ((dog.titles?.[key] || 0) < min) return false
        }
      }
      if (hasSearch) {
        const haystack = dogNameSearchText(dog.name_lat, dog.name_ru)
        const nameMatch = searchTokens.some((token) => haystack.includes(token))
        const breedMatch = dog.breed.toLowerCase().includes(searchLower)
        if (!nameMatch && !breedMatch) return false
      }
      return true
    })

    return filtered.map((dog, i) => ({
      ...dog,
      overall_rank: dog.overall_rank ?? dog.rank,
      rank: i + 1,
    }))
  }, [rankedDogs, filterBreed, filterGroup, awardMins, debouncedSearchQuery])

  const handleAwardMinChange = useCallback((key: ShowAwardKey, value: string) => {
    setAwardMins((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleResetFilters = useCallback(() => {
    setFilterYear(SHOW_ACTIVE_SEASON)
    setFilterBreed('')
    setFilterGroup('')
    setAwardMins({ ...EMPTY_AWARD_MINS })
    setSearchQuery('')
  }, [])

  const handleResetPanelFilters = useCallback(() => {
    setFilterGroup('')
    setAwardMins({ ...EMPTY_AWARD_MINS })
  }, [])

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
        currentSeason={SHOW_ACTIVE_SEASON}
        yearValues={years}
        filterBreed={filterBreed}
        onBreedChange={setFilterBreed}
        breedValues={breeds}
        dogIndex={dogIndex}
        filterGroup={filterGroup}
        onGroupChange={setFilterGroup}
        awardMins={awardMins}
        onAwardMinChange={handleAwardMinChange}
        onResetFilters={handleResetFilters}
        onResetPanelFilters={handleResetPanelFilters}
        dropdownRef={dropdownRef}
      />

      {showListSkeleton ? (
        <div className="min-h-[360px]" aria-busy="true" aria-live="polite">
          <p className="mb-3 text-xs text-charcoal-500">
            Загрузка рейтинга сезона…
          </p>
          <SkeletonLoader variant="card" count={8} />
        </div>
      ) : loadFailed ? (
        <div className="min-h-[360px] flex items-center justify-center">
          <p className="text-sm text-red-600">
            Ошибка загрузки данных. Попробуйте позже.
          </p>
        </div>
      ) : (
        <ShowRankingColumns
          dogs={filteredDogs}
          filterYear={rankingYear}
          filterBreed={filterBreed}
          favorites={favorites}
          onToggleFavorite={(dogId, meta) => {
            void toggleFavorite(dogId, meta).catch((error) => {
              console.error('Failed to toggle favorite:', error)
            })
          }}
        />
      )}
    </div>
  )
}
