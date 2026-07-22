import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import SkeletonLoader from '../components/SkeletonLoader'
import ErrorState from '../components/ErrorState'
import ToolbarSegmentControl from '../components/toolbar/ToolbarSegmentControl'
import { useDogProfile, useDogEvents } from '../hooks/useStaticData'
import { getShowDogRanking } from '../lib/staticData'
import { normalizeDogName, normalizeBreedName } from '../lib/dogNameMatching'
import type { ShowDogCardData } from './Shows/ShowDogCard'
import ShowDogProfile from './Shows/ShowDogProfile'
import DogProfile from './DogProfile'

type TabType = 'shows' | 'competitions'

const PROFILE_SEGMENTS = [
  { id: 'competitions', label: 'Соревнования' },
  { id: 'shows', label: 'Выставки' },
] as const

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

  const { data: dogDataResult, isLoading: compLoading } = useDogProfile(id)
  const { data: eventsData } = useDogEvents(id)

  useEffect(() => {
    const loadShowData = async () => {
      if (!id) return

      try {
        const result = await getShowDogRanking()
        if (result.success && result.data) {
          let found = null

          if (competitionDog) {
            const normalizedCompName = normalizeDogName(competitionDog.name_lat)
            const normalizedCompBreed = normalizeBreedName(competitionDog.breed)

            found = result.data.find((dog) => {
              const normalizedShowName = normalizeDogName(dog.name_lat)
              const normalizedShowBreed = normalizeBreedName(dog.breed)
              return normalizedShowName === normalizedCompName && normalizedShowBreed === normalizedCompBreed
            })
          }

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

  useEffect(() => {
    if (!compLoading) {
      setLoading(false)
    }
  }, [compLoading])

  const handleTabChange = useCallback(
    (tab: string) => {
      const next = tab as TabType
      setActiveTab(next)
      setSearchParams({ tab: next }, { replace: true })
    },
    [setSearchParams]
  )

  useEffect(() => {
    const urlTab = searchParams.get('tab') as TabType | null
    if (urlTab === 'shows' || urlTab === 'competitions') {
      setActiveTab(urlTab)
    }
  }, [searchParams])

  const isValidShowDog = Boolean(
    showDog &&
      competitionDog &&
      normalizeDogName(competitionDog.name_lat) === normalizeDogName(showDog.name_lat) &&
      normalizeBreedName(competitionDog.breed) === normalizeBreedName(showDog.breed)
  )
  const shouldShowShowsTab = isValidShowDog
  const showTabs = shouldShowShowsTab && hasCompetitions

  useEffect(() => {
    if (loading) return

    if (activeTab === 'shows' && !shouldShowShowsTab && hasCompetitions) {
      handleTabChange('competitions')
      return
    }
    if (activeTab === 'competitions' && !hasCompetitions && shouldShowShowsTab) {
      handleTabChange('shows')
      return
    }
    if (shouldShowShowsTab && !hasCompetitions && activeTab !== 'shows') {
      handleTabChange('shows')
    } else if (!shouldShowShowsTab && hasCompetitions && activeTab === 'shows') {
      handleTabChange('competitions')
    }
  }, [loading, activeTab, shouldShowShowsTab, hasCompetitions, handleTabChange])

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
              <Link
                to="/competitions?tab=ranking"
                className="rounded-xl border-2 border-camel-300 dark:border-camel-600 bg-white dark:bg-charcoal-800 px-4 py-2 text-sm font-semibold text-camel-700 dark:text-camel-400 transition-all hover:bg-camel-50 dark:hover:bg-charcoal-700 hover:border-camel-400"
              >
                К рейтингу
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {showTabs && (
          <div className="mb-6 overflow-x-auto scrollbar-hide">
            <ToolbarSegmentControl
              segments={[...PROFILE_SEGMENTS]}
              value={activeTab}
              onChange={handleTabChange}
              ariaLabel="Разделы профиля собаки"
            />
          </div>
        )}

        {activeTab === 'competitions' && competitionDog && <DogProfile />}

        {activeTab === 'shows' && hasShows && showDog && <ShowDogProfile dogData={showDog} />}

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

        {activeTab === 'shows' && (!hasShows || !showDog) && (
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
