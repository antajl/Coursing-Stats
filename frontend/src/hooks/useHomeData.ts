import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { getShowCalendar, getShowHomeTop, type ShowHomeTopDog, type ShowRkfCalendarEntry } from '../lib/staticData'
import type { CalendarEvent } from '../pages/Events/eventListUtils'

const CURRENT_SEASON = new Date().getFullYear()

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

interface TopDog {
  dog_id: number
  name_lat: string
  name_ru?: string | null
  breed?: string
  gold?: number
  silver?: number
  bronze?: number
  best_score?: number
  best_judge_score?: number
  rating_score?: number
  avg_judge_score?: number
  best_speed?: number
  avg_speed?: number
  total_starts?: number
}

interface SpeedRecord {
  name: string
  breed: string
  sex?: string
  speed_km_h: number
  date?: string
  status?: string
  history?: unknown
}

interface CoursingRecord {
  name: string
  breed: string
  sex?: string
  time_seconds: number
  date?: string
  status?: string
  history?: unknown
}

function normalizeStats(raw: Record<string, unknown> | null | undefined): HeroStats | null {
  if (!raw) return null
  return {
    events: Number(raw.events) || 0,
    results: Number(raw.results) || 0,
    dogs: Number(raw.unique_dogs) || Number(raw.dogs) || 0,
    judges: Number(raw.judges) || 0,
    breeds: Number(raw.breeds) || 0,
    donino_records: Number(raw.donino_records) || 0,
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

export function useHomeData() {
  const [stats, setStats] = useState<HeroStats | null>(null)
  const [showStats, setShowStats] = useState<HeroShowStats | null>(null)
  const [featuredEvents, setFeaturedEvents] = useState<CalendarEvent[]>([])
  const [featuredShows, setFeaturedShows] = useState<ShowRkfCalendarEntry[]>([])
  const [topPlacement, setTopPlacement] = useState<TopDog[]>([])
  const [topScore, setTopScore] = useState<TopDog[]>([])
  const [topSpeed, setTopSpeed] = useState<TopDog[]>([])
  const [doninoSpeedRecords, setDoninoSpeedRecords] = useState<SpeedRecord[]>([])
  const [doninoCoursingRecords, setDoninoCoursingRecords] = useState<CoursingRecord[]>([])
  const [topShowDogs, setTopShowDogs] = useState<ShowHomeTopDog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [
          statsData,
          showStatsData,
          eventsData,
          showsCalData,
          placementData,
          scoreData,
          seasonSpeedData,
          showHomeTopData,
          doninoSpeedData,
          doninoCoursingData,
        ] = await Promise.all([
          api.getStats(),
          api.getShowHeroStats(),
          api.getEvents(),
          getShowCalendar(String(CURRENT_SEASON)),
          api.getTopPlacement(String(CURRENT_SEASON), '', 0, 'gold', 3, 0),
          api.getTopScore(String(CURRENT_SEASON), '', 0, 'rating_score', 3, 0),
          api.getTopSpeed(String(CURRENT_SEASON), '', 0, 'best_speed', 3, 0),
          getShowHomeTop(String(CURRENT_SEASON)),
          api.getSpeedRecordsTopByBreed(3),
          api.getCoursingRecordsTopByBreed(3),
        ])

        if (statsData.success) {
          setStats(normalizeStats(statsData.data as Record<string, unknown>))
        }
        if (showStatsData.success && showStatsData.data) {
          const s = showStatsData.data as HeroShowStats
          setShowStats({
            exhibitions: Number(s.exhibitions) || 0,
            appearances: Number(s.appearances) || 0,
            dogs: Number(s.dogs) || 0,
            judges: Number(s.judges) || 0,
            breeds: Number(s.breeds) || 0,
          })
        }
        if (eventsData.success && Array.isArray(eventsData.data)) {
          setFeaturedEvents(pickFeaturedEvents(eventsData.data as CalendarEvent[]))
        }
        if (showsCalData.success && Array.isArray(showsCalData.data)) {
          setFeaturedShows(pickFeaturedShows(showsCalData.data, 3))
        }
        if (placementData.success) {
          setTopPlacement(extractTopDogs(placementData.data).slice(0, 3))
        }
        if (scoreData.success) {
          setTopScore(extractTopDogs(scoreData.data).slice(0, 3))
        }
        if (seasonSpeedData.success) {
          setTopSpeed(extractTopDogs(seasonSpeedData.data).slice(0, 3))
        }
        if (showHomeTopData.success && Array.isArray(showHomeTopData.data)) {
          setTopShowDogs(showHomeTopData.data.slice(0, 3))
        }
        if (doninoSpeedData.success && Array.isArray(doninoSpeedData.data)) {
          setDoninoSpeedRecords(doninoSpeedData.data as SpeedRecord[])
        }
        if (doninoCoursingData.success && Array.isArray(doninoCoursingData.data)) {
          setDoninoCoursingRecords(doninoCoursingData.data as CoursingRecord[])
        }
      } catch (error) {
        console.error('Failed to fetch home preview data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return {
    stats,
    showStats,
    featuredEvents,
    featuredShows,
    topPlacement,
    topScore,
    topSpeed,
    doninoSpeedRecords,
    doninoCoursingRecords,
    topShowDogs,
    loading,
  }
}

function pickFeaturedEvents(events: CalendarEvent[], count = 3): CalendarEvent[] {
  const dated = events
    .filter((e) => e.date_start)
    .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime())

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcoming = dated.filter((e) => new Date(e.date_start) >= today)
  const past = dated.filter((e) => new Date(e.date_start) < today).reverse()

  const combined = [...upcoming]
  for (const event of past) {
    if (combined.length >= count) break
    combined.push(event)
  }
  return combined.slice(0, count)
}

function pickFeaturedShows(shows: ShowRkfCalendarEntry[], count = 3): ShowRkfCalendarEntry[] {
  const dated = shows
    .filter((s) => s.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcoming = dated.filter((s) => new Date(s.date) >= today)
  const past = dated.filter((s) => new Date(s.date) < today).reverse()

  const combined = [...upcoming]
  for (const show of past) {
    if (combined.length >= count) break
    combined.push(show)
  }
  return combined.slice(0, count)
}
