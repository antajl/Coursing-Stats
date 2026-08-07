import { useState, useEffect, useRef, useMemo } from 'react'
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
import { buildCombinedRanking } from './mergeCombinedRanking'
import { useAuth, getLocalStorageFavorites } from '../../contexts/AuthContext'

const CURRENT_SEASON = String(new Date().getFullYear())

function initialYearFilter(searchParams: URLSearchParams): string {
  const fromUrl = searchParams.get('year')
  if (fromUrl === null) return CURRENT_SEASON
  return fromUrl
}

export default function TopDogs() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isEmbedded = location.pathname === '/competitions'
  const { reachGoal } = useYandexGoal()
  const { isAuthenticated } = useAuth()

  const [filterYear, setFilterYear] = useState(() => initialYearFilter(searchParams))
  const [filterBreed, setFilterBreed] = useState(() => searchParams.get('breed') || '')
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const [filterMinStarts, setFilterMinStarts] = useState(() => searchParams.get('minStarts') || '')
  const [filterScoreFrom, setFilterScoreFrom] = useState(() => searchParams.get('scoreFrom') || '')
  const [filterSpeedFrom, setFilterSpeedFrom] = useState(() => searchParams.get('speedFrom') || '')

  const [favorites, setFavorites] = useState<Set<string>>(() => {
    return new Set(getLocalStorageFavorites())
  })

  useEffect(() => {
    if (!isAuthenticated) return

    const loadCloudFavorites = async () => {
      try {
        const { authApi } = await import('../../lib/authApi')
        const { favorites: favoriteIds } = await authApi.getFavorites()
        setFavorites(new Set(favoriteIds))
      } catch (error) {
        console.error('Failed to load cloud favorites:', error)
      }
    }

    loadCloudFavorites()
  }, [isAuthenticated])

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

  const filteredCombined = filterCombinedRanking(combinedRanking, filterParams)
  const filteredSpeed = filterSpeed(rankedSpeed, filterParams)

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
    <div className={isEmbedded ? 'max-w-full mx-auto pb-2 sm:pb-4' : 'px-4 pb-4'}>
      {!isEmbedded && (
        <SEO
          title="Рейтинг собак"
          description="Единый рейтинг курсинга и БЗМП: Elo, индекс CS и медали. Фильтры по породе и сезону. Статистика выступлений."
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
          onToggleFavorite={async (dogId: string) => {
            const previousFavorites = new Set(favorites)
            const newFavorites = new Set(favorites)
            const isRemoving = newFavorites.has(dogId)

            if (isRemoving) {
              newFavorites.delete(dogId)
            } else {
              newFavorites.add(dogId)
            }

            setFavorites(newFavorites)

            try {
              if (isRemoving) {
                if (isAuthenticated) {
                  const { authApi } = await import('../../lib/authApi')
                  await authApi.removeFavorite(dogId)
                } else {
                  const { removeLocalStorageFavorite } = await import('../../contexts/AuthContext')
                  removeLocalStorageFavorite(dogId)
                }
              } else {
                if (isAuthenticated) {
                  const { authApi } = await import('../../lib/authApi')
                  await authApi.addFavorite(dogId)
                } else {
                  const { addLocalStorageFavorite } = await import('../../contexts/AuthContext')
                  addLocalStorageFavorite(dogId)
                }
              }
            } catch (error) {
              console.error('Failed to toggle favorite:', error)
              setFavorites(previousFavorites)
            }
          }}
        />
      )}
    </div>
  )
}
