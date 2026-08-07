import { useState, useEffect } from 'react'
import { api } from '../../../services/api'
import {
  getShowCalendar,
  getShowHomeTop,
  type ShowHomeTopDog,
  type ShowRkfCalendarEntry,
} from '../../../lib/staticData'
import { displayBreed } from '../../../lib/breedMapping'
import type { CalendarEvent } from '../../Events/eventListUtils'
import type { TopDog, SpeedRecord, CoursingRecord } from '../types'
import { pickFeaturedEvents, pickFeaturedShows } from '../utils/dataHelpers'
import { validateHeroStats, validateHeroShowStats, validateArray } from '../utils/validators'
import { buildCombinedRanking } from '../../TopDogs/mergeCombinedRanking'
import { buildTopBreedSlides, type BreedSlide } from '../utils/breedSeasonSlides'
import type { CombinedRankingDog } from '../../TopDogs/mergeCombinedRanking'

interface HeroStats {
  events: number
  results: number
  dogs: number
  unique_dogs: number
  judges: number
  breeds: number
  donino_records: number
}

interface HeroShowStats {
  exhibitions: number
  appearances: number
  dogs: number
  unique_dogs: number
  judges: number
  breeds: number
}

const CURRENT_SEASON = new Date().getFullYear()

export function useHomeData() {
  const [stats, setStats] = useState<HeroStats | null>(null)
  const [showStats, setShowStats] = useState<HeroShowStats | null>(null)
  const [featuredEvents, setFeaturedEvents] = useState<CalendarEvent[]>([])
  const [featuredShows, setFeaturedShows] = useState<ShowRkfCalendarEntry[]>([])
  const [competitionSlides, setCompetitionSlides] = useState<BreedSlide<CombinedRankingDog>[]>([])
  const [showSlides, setShowSlides] = useState<BreedSlide<ShowHomeTopDog>[]>([])
  const [topShowDogs, setTopShowDogs] = useState<ShowHomeTopDog[]>([])
  const [doninoSpeedRecords, setDoninoSpeedRecords] = useState<SpeedRecord[]>([])
  const [doninoCoursingRecords, setDoninoCoursingRecords] = useState<CoursingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchData() {
      try {
        const [
          statsData,
          showStatsData,
          eventsData,
          showsCalData,
          placementData,
          scoreData,
          eloData,
          showHomeTopData,
          doninoSpeedData,
          doninoCoursingData,
        ] = await Promise.all([
          api.getStats(),
          api.getShowHeroStats(),
          api.getEvents(),
          getShowCalendar(String(CURRENT_SEASON)),
          // Full season slices — merge (standing B) then breed top slides
          api.getTopPlacement(String(CURRENT_SEASON), '', 0, 'gold', null, 0),
          api.getTopScore(String(CURRENT_SEASON), '', 0, 'rating_score', null, 0),
          api.getTopElo(String(CURRENT_SEASON), '', 0, 'elo_rating', null, 0),
          getShowHomeTop(String(CURRENT_SEASON)),
          api.getSpeedRecordsTopByBreed(3),
          api.getCoursingRecordsTopByBreed(3),
        ])

        if (!isMounted) return

        if (statsData.success) {
          const validatedStats = validateHeroStats(statsData.data)
          if (validatedStats) {
            setStats(validatedStats)
          } else {
            console.warn('HeroStats validation failed:', statsData.data)
          }
        }
        if (showStatsData.success && showStatsData.data) {
          const validatedShowStats = validateHeroShowStats(showStatsData.data)
          if (validatedShowStats) {
            setShowStats(validatedShowStats)
          } else {
            console.warn('HeroShowStats validation failed:', showStatsData.data)
          }
        }
        if (eventsData.success) {
          const validatedEvents = validateArray<CalendarEvent>(eventsData.data)
          if (validatedEvents) {
            setFeaturedEvents(pickFeaturedEvents(validatedEvents))
          } else {
            console.warn('Events validation failed:', eventsData.data)
          }
        }
        if (showsCalData.success) {
          const validatedShows = validateArray<ShowRkfCalendarEntry>(showsCalData.data)
          if (validatedShows) {
            setFeaturedShows(pickFeaturedShows(validatedShows, 3))
          } else {
            console.warn('Shows validation failed:', showsCalData.data)
          }
        }

        const placement = extractTopDogs(placementData.success ? placementData.data : null)
        const score = extractTopDogs(scoreData.success ? scoreData.data : null)
        const elo = extractTopDogs(eloData.success ? eloData.data : null)
        if (placement.length > 0 || score.length > 0 || elo.length > 0) {
          const combined = buildCombinedRanking(
            placement as Record<string, unknown>[],
            score as Record<string, unknown>[],
            elo as Record<string, unknown>[],
          )
          setCompetitionSlides(buildTopBreedSlides(combined, 5, 3))
        }

        if (showHomeTopData.success && showHomeTopData.data) {
          const payload = showHomeTopData.data
          const dogs = Array.isArray(payload)
            ? payload
            : Array.isArray(payload.dogs)
              ? payload.dogs
              : []
          setTopShowDogs(dogs.slice(0, 3))

          const rawSlides = !Array.isArray(payload) && Array.isArray(payload.breed_slides)
            ? payload.breed_slides
            : []
          if (rawSlides.length > 0) {
            setShowSlides(
              rawSlides.map((s) => ({
                breedKey: s.breed,
                breedLabel: displayBreed(s.breed).primary || s.breed,
                dogCount: s.dog_count,
                dogs: (s.dogs || []).map((d, i) => ({ ...d, rank: d.rank ?? i + 1 })),
              })),
            )
          } else if (dogs.length > 0) {
            // Fallback: single overall slide if index has no breed_slides yet
            setShowSlides([
              {
                breedKey: '',
                breedLabel: 'Все породы',
                dogCount: dogs.length,
                dogs: dogs.slice(0, 3).map((d, i) => ({ ...d, rank: i + 1 })),
              },
            ])
          }
        } else {
          console.warn('Show dogs validation failed:', showHomeTopData)
        }
        if (doninoSpeedData.success) {
          const validatedSpeedRecords = validateArray<SpeedRecord>(doninoSpeedData.data)
          if (validatedSpeedRecords) {
            setDoninoSpeedRecords(validatedSpeedRecords)
          } else {
            console.warn('Speed records validation failed:', doninoSpeedData.data)
          }
        }
        if (doninoCoursingData.success) {
          const validatedCoursingRecords = validateArray<CoursingRecord>(doninoCoursingData.data)
          if (validatedCoursingRecords) {
            setDoninoCoursingRecords(validatedCoursingRecords)
          } else {
            console.warn('Coursing records validation failed:', doninoCoursingData.data)
          }
        }
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err : new Error('Failed to fetch home data'))
        console.error('Failed to fetch home preview data:', err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [])

  return {
    stats,
    showStats,
    featuredEvents,
    featuredShows,
    competitionSlides,
    showSlides,
    topShowDogs,
    doninoSpeedRecords,
    doninoCoursingRecords,
    topShowDogs,
    loading,
    error,
  }
}

function extractTopDogs(data: unknown): TopDog[] {
  if (!data) return []
  if (Array.isArray(data)) return data as TopDog[]
  if (typeof data === 'object' && data !== null && 'items' in data && Array.isArray(data.items)) {
    return data.items as TopDog[]
  }
  return []
}
