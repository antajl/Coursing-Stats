import { useMemo } from 'react'
import {
  useTopPlacement,
  useTopSpeed,
  useSpeedRecordsByBreed,
  useCoursingRecordsByBreed,
  useBreedAnnualLeaders,
  type AnnualDogLeader,
  type AnnualShowDogLeader,
  type ShowAllTimeDog,
  type BreedShowStats,
} from '../../../hooks/useStaticData'
import { matchesBreedFilter } from '../../../lib/breedMapping'
import { getBreedArchiveUrl } from '../../../lib/breedArchive'
import { time350ToSpeedKmh } from '../../../lib/recordDates'
import { computeDoninoAnnualLeaders } from '../../../lib/doninoAnnualLeaders'
import type { BreedHubItem } from '../../../lib/breed-hubs-data'
import type { SpeedRecordItem } from '../BreedHubColumns'
import type { SportAllTimeDog, RacingAllTimeDog } from '../components/BreedHallOfFame'

export interface TopPlacementItem {
  dog_id: number
  name_ru?: string | null
  name_lat?: string | null
  breed: string
  gold: number
  silver: number
  bronze: number
  total_starts: number
  year?: number
  year_from?: number
  year_to?: number
  sex?: string
}

export function useBreedHubData(slug: string | undefined, breedInfo: BreedHubItem | undefined) {
  // Breed Archive link
  const breedArchiveUrl = useMemo(
    () => (breedInfo ? getBreedArchiveUrl(breedInfo.slug) || getBreedArchiveUrl(breedInfo.canonicalKey) : null),
    [breedInfo],
  )

  // Load all-time aggregates for database statistics
  const { data: topPlacementAllRes, isLoading: placementAllLoading } = useTopPlacement('all')
  const { data: topSpeedAllRes, isLoading: speedAllLoading } = useTopSpeed('all')

  // Load Donino speed records and coursing 350m records
  const { data: doninoSpeedRes, isLoading: doninoSpeedLoading } = useSpeedRecordsByBreed(
    breedInfo?.canonicalKey || '',
  )
  const { data: doninoCoursingRes, isLoading: doninoCoursingLoading } = useCoursingRecordsByBreed(
    breedInfo?.canonicalKey || '',
  )
  const doninoLoading = doninoSpeedLoading || doninoCoursingLoading

  // Load annual champions history (2015-2026)
  const { data: annualLeadersRes, isLoading: annualLeadersLoading } = useBreedAnnualLeaders()

  const coursingLeaders = useMemo(() => {
    if (!slug) return []
    const bySlug = annualLeadersRes?.data?.coursing_by_slug || annualLeadersRes?.data?.leaders_by_slug
    if (!bySlug) return []
    return (bySlug[slug] || []) as AnnualDogLeader[]
  }, [slug, annualLeadersRes])

  const racingLeaders = useMemo(() => {
    if (!slug || !annualLeadersRes?.data?.racing_by_slug) return []
    return (annualLeadersRes.data.racing_by_slug[slug] || []) as AnnualDogLeader[]
  }, [slug, annualLeadersRes])

  const showsCacLeaders = useMemo(() => {
    if (!slug || !annualLeadersRes?.data?.shows_cac_by_slug) return []
    return (annualLeadersRes.data.shows_cac_by_slug[slug] || []) as AnnualShowDogLeader[]
  }, [slug, annualLeadersRes])

  const showsMonoLeaders = useMemo(() => {
    if (!slug || !annualLeadersRes?.data?.shows_mono_by_slug) return []
    return (annualLeadersRes.data.shows_mono_by_slug[slug] || []) as AnnualShowDogLeader[]
  }, [slug, annualLeadersRes])

  const showsAllTimeTop = useMemo(() => {
    if (!slug || !annualLeadersRes?.data?.shows_all_time_by_slug) return []
    return (annualLeadersRes.data.shows_all_time_by_slug[slug] || []) as ShowAllTimeDog[]
  }, [slug, annualLeadersRes])

  const showsMonoAllTimeTop = useMemo(() => {
    if (slug && annualLeadersRes?.data?.shows_mono_all_time_by_slug?.[slug]) {
      return annualLeadersRes.data.shows_mono_all_time_by_slug[slug] as ShowAllTimeDog[]
    }
    if (!showsAllTimeTop || showsAllTimeTop.length === 0) return []
    const monoFiltered = showsAllTimeTop
      .filter((d) => {
        const t = d.titles
        if (!t) return false
        return Boolean(
          t.KCHK || t.VKCHK || t.YKCHK || t.KCHP || t.VKCHP || t.YKCHP || t.SS || t.VSS || t.YSS
        )
      })
      .sort((a, b) => {
        const calc = (d: ShowAllTimeDog) => {
          const t = d.titles || {}
          return (
            ((t.KCHP || 0) + (t.VKCHP || 0) + (t.YKCHP || 0)) * 1800 +
            ((t.KCHK || 0) + (t.VKCHK || 0) + (t.YKCHK || 0)) * 600 +
            ((t.SS || 0) + (t.VSS || 0) + (t.YSS || 0)) * 100
          )
        }
        return calc(b) - calc(a)
      })
    return monoFiltered.slice(0, 5)
  }, [slug, annualLeadersRes, showsAllTimeTop])

  const sportCoursingAllTime = useMemo(() => {
    if (!breedInfo || !topPlacementAllRes?.data?.items) return []
    const matching = (topPlacementAllRes.data.items as TopPlacementItem[]).filter((d) =>
      matchesBreedFilter(d.breed, breedInfo.canonicalKey),
    )
    const sorted = [...matching].sort((a, b) => {
      const g = (b.gold || 0) - (a.gold || 0)
      if (g !== 0) return g
      const s = (b.silver || 0) - (a.silver || 0)
      if (s !== 0) return s
      const br = (b.bronze || 0) - (a.bronze || 0)
      if (br !== 0) return br
      return (b.total_starts || 0) - (a.total_starts || 0)
    })
    return sorted.slice(0, 5) as SportAllTimeDog[]
  }, [breedInfo, topPlacementAllRes])

  const sportRacingAllTime = useMemo(() => {
    if (!breedInfo || !topSpeedAllRes?.data?.items) return []
    const matching = (topSpeedAllRes.data.items as any[]).filter((d) =>
      matchesBreedFilter(d.breed, breedInfo.canonicalKey),
    )
    const sorted = [...matching].sort(
      (a, b) => (Number(b.best_speed) || 0) - (Number(a.best_speed) || 0),
    )
    return sorted.slice(0, 5) as RacingAllTimeDog[]
  }, [breedInfo, topSpeedAllRes])

  const showsStats = useMemo(() => {
    if (!slug || !annualLeadersRes?.data?.shows_stats_by_slug) return null
    return (annualLeadersRes.data.shows_stats_by_slug[slug] || null) as BreedShowStats | null
  }, [slug, annualLeadersRes])

  const annualLeaders = useMemo(() => {
    if (!slug || !annualLeadersRes?.data?.leaders_by_slug) return []
    return (annualLeadersRes.data.leaders_by_slug[slug] || []) as AnnualDogLeader[]
  }, [slug, annualLeadersRes])

  const doninoAnnualLeaders = useMemo(() => {
    if (!breedInfo) return []
    return computeDoninoAnnualLeaders(doninoSpeedRes?.data, doninoCoursingRes?.data)
  }, [breedInfo, doninoSpeedRes, doninoCoursingRes])

  const speedRecords = useMemo(() => {
    if (!breedInfo) return []
    const speedList: SpeedRecordItem[] = Array.isArray(doninoSpeedRes?.data)
      ? doninoSpeedRes.data
      : (doninoSpeedRes?.data as any)?.records || []
    const coursingList: any[] = Array.isArray(doninoCoursingRes?.data)
      ? doninoCoursingRes.data
      : (doninoCoursingRes?.data as any)?.records || []

    const map = new Map<string, SpeedRecordItem & { best_speed?: number }>()

    for (const s of speedList) {
      const normName = (s.name || '').trim().toLowerCase()
      if (!normName) continue
      map.set(normName, {
        ...s,
        mode: 'speed',
        speed_km_h: s.speed_km_h,
        best_speed: s.speed_km_h,
      })
    }

    for (const c of coursingList) {
      const normName = (c.name || '').trim().toLowerCase()
      if (!normName) continue
      const speedFromTime = c.time_seconds ? time350ToSpeedKmh(c.time_seconds) : 0
      if (map.has(normName)) {
        const existing = map.get(normName)!
        if (c.time_seconds) existing.time_seconds = c.time_seconds
        if (speedFromTime > (existing.best_speed || 0)) {
          existing.best_speed = speedFromTime
        }
      } else {
        map.set(normName, {
          name: c.name,
          breed: c.breed || breedInfo.canonicalKey,
          sex: c.sex,
          date: c.date,
          status: c.status,
          history: c.history,
          speed_km_h: speedFromTime,
          best_speed: speedFromTime,
          time_seconds: c.time_seconds,
          screenshot_url: c.screenshot_url,
          track_type: c.track_type || '350 м',
          mode: 'coursing',
        })
      }
    }

    return Array.from(map.values())
      .sort((a, b) => (b.best_speed || b.speed_km_h || 0) - (a.best_speed || a.speed_km_h || 0))
      .slice(0, 15)
  }, [breedInfo, doninoSpeedRes, doninoCoursingRes])

  const breedStats = useMemo(() => {
    if (!breedInfo || !topPlacementAllRes?.data?.items) {
      return { totalDogs: 0, totalStarts: 0, totalGold: 0, yearsSpan: '', maxSpeed: 0 }
    }
    const matchingPlacement = (topPlacementAllRes.data.items as TopPlacementItem[]).filter((d) =>
      matchesBreedFilter(d.breed, breedInfo.canonicalKey),
    )

    let totalStarts = 0
    let totalGold = 0
    let minYear = 9999
    let maxYear = 0

    matchingPlacement.forEach((d) => {
      totalStarts += d.total_starts || 0
      totalGold += d.gold || 0
      if (d.year_from && d.year_from < minYear) minYear = d.year_from
      if (d.year_to && d.year_to > maxYear) maxYear = d.year_to
    })

    let maxSpeed = 0
    if (speedRecords.length > 0) {
      speedRecords.forEach((r) => {
        if (r.speed_km_h && r.speed_km_h > maxSpeed) maxSpeed = r.speed_km_h
      })
    }

    if (topSpeedAllRes?.data?.items) {
      const matchingSpeed = (topSpeedAllRes.data.items as any[]).filter((d) =>
        matchesBreedFilter(d.breed, breedInfo.canonicalKey),
      )
      matchingSpeed.forEach((d) => {
        if (d.best_speed && d.best_speed > maxSpeed) maxSpeed = d.best_speed
      })
    }

    const yearsSpan =
      minYear !== 9999 ? (minYear === maxYear ? `${minYear}` : `${minYear}–${maxYear}`) : ''

    return {
      totalDogs: matchingPlacement.length,
      totalStarts,
      totalGold,
      yearsSpan,
      maxSpeed,
    }
  }, [breedInfo, topPlacementAllRes, topSpeedAllRes, speedRecords])

  return {
    breedArchiveUrl,
    placementAllLoading,
    speedAllLoading,
    doninoLoading,
    annualLeadersLoading,
    coursingLeaders,
    racingLeaders,
    showsCacLeaders,
    showsMonoLeaders,
    showsAllTimeTop,
    showsMonoAllTimeTop,
    sportCoursingAllTime,
    sportRacingAllTime,
    showsStats,
    annualLeaders,
    doninoAnnualLeaders,
    speedRecords,
    breedStats,
  }
}
