import { useState, useEffect } from 'react'
import { api } from '../../../services/api'
import {
  getShowCalendar,
  getShowFeatured,
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

import { resolveActiveSeason } from '../../../lib/season'

const CURRENT_SEASON = Number(resolveActiveSeason())

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
  const [heroLoading, setHeroLoading] = useState(true)
  const [seasonLoading, setSeasonLoading] = useState(true)
  const [doninoLoading, setDoninoLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    // 1. Critical Above-the-fold Data (Hero Stage & MetricsWidget)
    // Only ~40KB total JSON payload — resolves in ~150-200ms to achieve sub-second LCP
    async function fetchHeroStage() {
      try {
        const [statsData, showStatsData, eventsData, showsCalData] = await Promise.all([
          api.getStats(),
          api.getShowHeroStats(),
          api.getEvents(String(CURRENT_SEASON)),
          getShowFeatured(String(CURRENT_SEASON)),
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
            let picked = pickFeaturedEvents(validatedEvents)
            // If current season has fewer than 3 events, pull previous season's calendar
            if (picked.length < 3) {
              try {
                const prevCal = await api.getEvents(String(CURRENT_SEASON - 1))
                if (prevCal.success) {
                  const prevEvents = validateArray<CalendarEvent>(prevCal.data)
                  if (prevEvents) {
                    picked = pickFeaturedEvents([...validatedEvents, ...prevEvents])
                  }
                }
              } catch {}
            }
            setFeaturedEvents(picked)
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
      } catch (err) {
        if (!isMounted) return
        console.warn('Hero stage data fetch warning:', err)
      } finally {
        if (isMounted) {
          setHeroLoading(false)
        }
      }
    }

    // 2. Below-the-fold Data (Season Top Rankings)
    async function fetchSeasonTop() {
      try {
        const [placementData, scoreData, showHomeTopData] = await Promise.all([
          api.getTopPlacement(String(CURRENT_SEASON), '', 0, 'gold', null, 0),
          api.getTopScore(String(CURRENT_SEASON), '', 0, 'rating_score', null, 0),
          getShowHomeTop(String(CURRENT_SEASON)),
        ])

        if (!isMounted) return

        const placement = extractTopDogs(placementData.success ? placementData.data : null)
        const score = extractTopDogs(scoreData.success ? scoreData.data : null)
        if (placement.length > 0 || score.length > 0) {
          const combined = buildCombinedRanking(
            placement as Record<string, unknown>[],
            score as Record<string, unknown>[],
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
            setShowSlides([
              {
                breedKey: '',
                breedLabel: 'Все породы',
                dogCount: dogs.length,
                dogs: dogs.slice(0, 3).map((d, i) => ({ ...d, rank: i + 1 })),
              },
            ])
          }
        }
      } catch (err) {
        if (!isMounted) return
        console.warn('Season top data fetch warning:', err)
      } finally {
        if (isMounted) {
          setSeasonLoading(false)
        }
      }
    }

    // 3. Below-the-fold Data (Donino Records)
    async function fetchDoninoRecords() {
      try {
        const [doninoSpeedData, doninoCoursingData] = await Promise.all([
          api.getSpeedRecordsTopByBreed(3),
          api.getCoursingRecordsTopByBreed(3),
        ])

        if (!isMounted) return

        if (doninoSpeedData.success) {
          const validatedSpeedRecords = validateArray<SpeedRecord>(doninoSpeedData.data)
          if (validatedSpeedRecords) {
            setDoninoSpeedRecords(validatedSpeedRecords)
          }
        }
        if (doninoCoursingData.success) {
          const validatedCoursingRecords = validateArray<CoursingRecord>(doninoCoursingData.data)
          if (validatedCoursingRecords) {
            setDoninoCoursingRecords(validatedCoursingRecords)
          }
        }
      } catch (err) {
        if (!isMounted) return
        console.warn('Donino data fetch warning:', err)
      } finally {
        if (isMounted) {
          setDoninoLoading(false)
        }
      }
    }

    // Fire all three stages in parallel, but allow each stage to unblock its UI immediately
    fetchHeroStage()
    fetchSeasonTop()
    fetchDoninoRecords()

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
    heroLoading,
    seasonLoading,
    doninoLoading,
    loading: heroLoading || seasonLoading,
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
