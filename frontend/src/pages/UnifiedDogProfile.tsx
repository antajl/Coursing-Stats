import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import SkeletonLoader from '../components/SkeletonLoader'
import ErrorState from '../components/ErrorState'
import { useDogProfile, useDogEvents } from '../hooks/useStaticData'
import { getShowDogRanking } from '../lib/staticData'
import { findMatchingCompetitionDog, findMatchingShowDog, normalizeDogName, normalizeBreedName } from '../lib/dogNameMatching'
import type { ShowDogCardData } from './Shows/ShowDogCard'
import ShowDogProfile from './Shows/ShowDogProfile'
import DogProfile from './DogProfile'

type TabType = 'shows' | 'competitions'

export default function UnifiedDogProfile() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabType>(
    (searchParams.get('tab') as TabType) || 'competitions'
  )

  const [loading, setLoading] = useState(true)
  const [showDog, setShowDog] = useState<ShowDogCardData | null>(null)
  const [competitionDog, setCompetitionDog] = useState<any>(null)
  const [hasShows, setHasShows] = useState(false)
  const [hasCompetitions, setHasCompetitions] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load competition dog data
  const { data: dogDataResult, isLoading: compLoading } = useDogProfile(id)
  const { data: eventsData } = useDogEvents(id)

  // Load show dog data
  useEffect(() => {
    const loadShowData = async () => {
      if (!id) return

      try {
        const result = await getShowDogRanking()
        if (result.success && result.data) {
          let found = null

          // Try to find show dog by ID first (competition ID may match show ID)
          found = result.data.find((d) => d.id === id || d.id === String(id))

          // If not found by ID, try to find by matching name AND breed
          if (!found && competitionDog) {
            const normalizedCompName = normalizeDogName(competitionDog.name_lat)
            const normalizedCompBreed = normalizeBreedName(competitionDog.breed)

            found = result.data.find((dog) => {
              const normalizedShowName = normalizeDogName(dog.name_lat)
              const normalizedShowBreed = normalizeBreedName(dog.breed)

              // Match by normalized name AND breed
              return normalizedShowName === normalizedCompName && normalizedShowBreed === normalizedCompBreed
            })
          }

          // Only set show dog if found, otherwise don't show shows tab
          if (found) {
            setShowDog(found)
            setHasShows(true)
          } else {
            setShowDog(null)
            setHasShows(false)
          }
        }
      } catch (err) {
        console.error('Failed to load show data:', err)
        setShowDog(null)
        setHasShows(false)
      }
    }

    loadShowData()
  }, [id, competitionDog])

  // Process competition dog data
  useEffect(() => {
    if (dogDataResult?.success && dogDataResult.data) {
      setCompetitionDog(dogDataResult.data)
      
      const hasCompData = 
        (dogDataResult.data.coursing_stats?.total_starts || 0) > 0 ||
        (dogDataResult.data.racing_stats?.total_starts || 0) > 0 ||
        (eventsData?.success && Array.isArray(eventsData.data) && eventsData.data.length > 0)
      
      setHasCompetitions(hasCompData)
    }
  }, [dogDataResult, eventsData])

  // Set loading state
  useEffect(() => {
    if (!compLoading) {
      setLoading(false)
    }
  }, [compLoading])

  // Update URL when tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  // Auto-select tab based on available data
  useEffect(() => {
    if (!loading) {
      if (hasShows && !hasCompetitions) {
        handleTabChange('shows')
      } else if (!hasShows && hasCompetitions) {
        handleTabChange('competitions')
      }
      // If both available, keep current or default to competitions
    }
  }, [loading, hasShows, hasCompetitions])

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <SkeletonLoader variant="card" count={3} />
        </div>
      </div>
    )
  }

  if (!competitionDog && !showDog) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <ErrorState
            title="Собака не найдена"
            message={`ID: ${id}`}
            action={
              <Link to="/top" className="rounded-xl border-2 border-camel-300 dark:border-camel-600 bg-white dark:bg-charcoal-800 px-4 py-2 text-sm font-semibold text-camel-700 dark:text-camel-400 transition-all hover:bg-camel-50 dark:hover:bg-charcoal-700 hover:border-camel-400">
                К топу
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  // Determine which tabs to show
  const showTabs = hasShows && hasCompetitions

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Tab switcher */}
        {showTabs && (
          <div className="mb-6 flex gap-2 border-b border-old-money-200 dark:border-charcoal-600">
            <button
              type="button"
              onClick={() => handleTabChange('competitions')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'competitions'
                  ? 'border-camel-600 text-camel-700 dark:border-camel-400 dark:text-camel-300'
                  : 'border-transparent text-old-money-500 hover:text-camel-700 dark:text-old-money-400 dark:hover:text-camel-300'
              }`}
            >
              Соревнования
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('shows')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'shows'
                  ? 'border-camel-600 text-camel-700 dark:border-camel-400 dark:text-camel-300'
                  : 'border-transparent text-old-money-500 hover:text-camel-700 dark:text-old-money-400 dark:hover:text-camel-300'
              }`}
            >
              Выставки
            </button>
          </div>
        )}

        {/* Render active tab */}
        {activeTab === 'competitions' && competitionDog && (
          <DogProfile />
        )}

        {activeTab === 'shows' && showDog && (
          <ShowDogProfile dogData={showDog} />
        )}

        {/* Show message if tab is selected but data is not available */}
        {activeTab === 'competitions' && !competitionDog && (
          <div className="rounded-xl border border-old-money-200 bg-cream-50 p-6 text-center dark:border-charcoal-600 dark:bg-charcoal-800/40">
            <p className="text-sm text-old-money-500 dark:text-old-money-400">
              Нет данных о соревнованиях для этой собаки
            </p>
            {hasShows && (
              <button
                type="button"
                onClick={() => handleTabChange('shows')}
                className="mt-3 text-sm font-semibold text-camel-700 hover:text-camel-800 dark:text-camel-400 dark:hover:text-camel-300"
              >
                Перейти к выставкам
              </button>
            )}
          </div>
        )}

        {activeTab === 'shows' && !showDog && (
          <div className="rounded-xl border border-old-money-200 bg-cream-50 p-6 text-center dark:border-charcoal-600 dark:bg-charcoal-800/40">
            <p className="text-sm text-old-money-500 dark:text-old-money-400">
              Нет данных о выставках для этой собаки
            </p>
            {hasCompetitions && (
              <button
                type="button"
                onClick={() => handleTabChange('competitions')}
                className="mt-3 text-sm font-semibold text-camel-700 hover:text-camel-800 dark:text-camel-400 dark:hover:text-camel-300"
              >
                Перейти к соревнованиям
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
