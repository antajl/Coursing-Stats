import { useState, useRef, useMemo, useEffect } from 'react'
import { useParams, useLocation, useSearchParams } from 'react-router-dom'
import { Rabbit, Gauge, Sparkles, Timer } from 'lucide-react'
import {
  useDogProfile,
  useDogEvents,
  useDogSpeedRecords,
  useSpeedRecordsByBreed,
  useDogCoursingRecords,
  useCoursingRecordsByBreed,
} from '../../hooks/useStaticData'
import {
  resolveShowDogDetail,
  getDogAllTimePlacementRank,
  getDogAllTimeSpeedRank,
  getDogPlacementRank,
  getDogSpeedRank,
  getDogBreedPlacementRank,
  getDogBreedSpeedRank,
  getShowDogAllTimeRank,
  getShowDogBreedRank,
  getShowDogYearRank,
} from '../../lib/staticData'
import {
  isShowOnlyProfileId,
  showDogProfilePath,
} from '../../lib/showDogProfilePath'
import {
  buildDogProfileTitleGroups,
  maxMergeDogTitles,
} from '../../lib/qualificationTitles'
import { parseDogName, toDogTitleCase } from '../../lib/dogName'
import { displayBreed } from '../../lib/breedMapping'
import { toPng } from 'html-to-image'
import { useYandexGoal } from '../../components/YandexMetrica'
import { buildEventResultsUrlMap } from '../../lib/procoursingLinks'
import type { ShowDogCardData } from '../Shows/ShowDogCard'
import type { ProfileHeaderRank } from './DogProfileHeader'
import type { DogJudgesStats } from './DogJudgesSection'
import type { DisciplineTabId, DisciplineTabItem } from './types'
import {
  HISTORY_DEFAULT,
  computeSpeedStats,
  computeCoursingDoninoStats,
} from './dogProfileStats'

export function useDogProfileData() {
  const params = useParams<{ id?: string; dogId?: string; breed?: string }>()
  const competitionId = params.id
  const showRouteDogId = params.dogId
  const showRouteBreed = params.breed ? decodeURIComponent(params.breed) : undefined
  const isLegacyShowRoute = Boolean(showRouteDogId && showRouteBreed)

  const location = useLocation()
  const [exporting, setExporting] = useState(false)
  const [showAllSpeedHistory, setShowAllSpeedHistory] = useState(false)
  const [showAllCoursingDoninoHistory, setShowAllCoursingDoninoHistory] = useState(false)
  const [showAllCoursingEvents, setShowAllCoursingEvents] = useState(false)
  const [showAllRacingEvents, setShowAllRacingEvents] = useState(false)
  const [showDog, setShowDog] = useState<ShowDogCardData | null>(null)
  const [showsLoading, setShowsLoading] = useState(true)
  const [asyncRanks, setAsyncRanks] = useState<ProfileHeaderRank[]>([])

  const exportRef = useRef<HTMLDivElement>(null)
  const { reachGoal } = useYandexGoal()

  const fromSpeedRecords = location.state?.from === 'speed-records'
  const fromCoursingRecords = location.state?.from === 'coursing-records'

  const [searchParams] = useSearchParams()
  const queryName = searchParams.get('name')
  const queryBreed = searchParams.get('breed')

  const profileId = competitionId || ''
  const { data: dogDataResult, isLoading: loading } = useDogProfile(profileId)
  const { data: eventsData } = useDogEvents(profileId)
  const { data: speedRecordsData } = useDogSpeedRecords(profileId)
  const { data: coursingRecordsData } = useDogCoursingRecords(profileId)

  const dog = dogDataResult?.success ? dogDataResult.data : null
  const events = eventsData?.success ? (Array.isArray(eventsData.data) ? eventsData.data : []) : []
  const eventResultsUrls = useMemo(() => buildEventResultsUrlMap(events), [events])

  const speedRecords = speedRecordsData?.success
    ? Array.isArray(speedRecordsData.data)
      ? speedRecordsData.data
      : []
    : []
  const coursingRecords = coursingRecordsData?.success
    ? Array.isArray(coursingRecordsData.data)
      ? coursingRecordsData.data
      : []
    : []

  const headerBreed = dog?.breed || showDog?.breed || showRouteBreed || ''
  const { data: breedRecordsData } = useSpeedRecordsByBreed(dog?.breed || showDog?.breed || '')
  const breedRecords = breedRecordsData?.success
    ? Array.isArray(breedRecordsData.data)
      ? breedRecordsData.data
      : []
    : []

  const { data: breedCoursingRecordsData } = useCoursingRecordsByBreed(dog?.breed || showDog?.breed || '')
  const breedCoursingRecords = breedCoursingRecordsData?.success
    ? Array.isArray(breedCoursingRecordsData.data)
      ? breedCoursingRecordsData.data
      : []
    : []

  useEffect(() => {
    if (dog || showDog) reachGoal('dog_profile_view')
  }, [dog, showDog, reachGoal])

  // Выставки: detail-шард по id / competition / кличка+порода
  useEffect(() => {
    let cancelled = false
    const loadShows = async () => {
      setShowsLoading(true)
      try {
        const result = await resolveShowDogDetail({
          profileId: profileId || (isLegacyShowRoute ? showRouteDogId : null),
          competitionId: dog?.id ? String(dog.id) : competitionId,
          nameLat: dog?.name_lat || queryName || '',
          nameRu: dog?.name_ru || queryName || '',
          breed: dog?.breed || showRouteBreed || queryBreed,
        })
        if (!cancelled) {
          setShowDog(result.success && result.data ? result.data : null)
        }
      } catch {
        if (!cancelled) setShowDog(null)
      } finally {
        if (!cancelled) setShowsLoading(false)
      }
    }
    if (isLegacyShowRoute || !loading) loadShows()
    return () => {
      cancelled = true
    }
  }, [competitionId, dog, loading, showRouteDogId, showRouteBreed, isLegacyShowRoute, profileId, queryName, queryBreed])

  // Синхронные ранги курсинга и бегов из кэша пака
  const precomputedSportRanks = useMemo<ProfileHeaderRank[]>(() => {
    if (!dog) return []
    const precomputed = (dog as any)?.ranks || (dog as any)?.dog?.ranks
    if (!precomputed) return []

    const initial: ProfileHeaderRank[] = []
    if (precomputed.coursing && (precomputed.coursing.rank != null || precomputed.coursing.yearRank != null)) {
      initial.push({
        key: 'coursing',
        label: 'Курсинг',
        rank: precomputed.coursing.rank ?? null,
        yearRank: precomputed.coursing.yearRank ?? undefined,
        breedRank: precomputed.coursing.breedRank ?? undefined,
        yearBreedRank: precomputed.coursing.yearBreedRank ?? undefined,
        href: `/competitions?tab=ranking&year=${precomputed.coursing.year || '2026'}`,
      })
    }
    if (precomputed.racing && (precomputed.racing.rank != null || precomputed.racing.yearRank != null)) {
      initial.push({
        key: 'racing',
        label: 'Бега',
        rank: precomputed.racing.rank ?? null,
        yearRank: precomputed.racing.yearRank ?? undefined,
        breedRank: precomputed.racing.breedRank ?? undefined,
        yearBreedRank: precomputed.racing.yearBreedRank ?? undefined,
        href: `/competitions?tab=ranking&year=${precomputed.racing.year || '2026'}`,
      })
    }
    return initial
  }, [dog])

  // Итоговые headerRanks: предрасчитанный спорт + выставочные ранги
  const headerRanks = useMemo<ProfileHeaderRank[]>(() => {
    const map = new Map<string, ProfileHeaderRank>()
    for (const r of precomputedSportRanks) {
      map.set(r.key, r)
    }
    if (showDog) {
      const showAllTimeBreedRank =
        (showDog as any)?.breed_rank ?? (showDog as any)?.breedRank ?? undefined
      const has2026Show = Boolean(
        showDog.history && showDog.history.some((h) => h.date && h.date.includes('2026')),
      )
      map.set('shows', {
        key: 'shows',
        label: 'Выставки',
        rank: showDog.rank ?? null,
        breedRank: showAllTimeBreedRank,
        yearBreedRank: undefined,
        href: `/shows?tab=ranking&year=${has2026Show ? '2026' : ''}`,
      })
    }
    for (const r of asyncRanks) {
      map.set(r.key, r)
    }
    return Array.from(map.values())
  }, [precomputedSportRanks, showDog, asyncRanks])

  // Дозагрузка асинхронных рангов (выставки или фоллбэк спорта)
  useEffect(() => {
    let cancelled = false
    const loadRanks = async () => {
      const competitionDogId = dog?.id ?? (profileId && !isShowOnlyProfileId(profileId) ? profileId : null)
      const breed = dog?.breed || showDog?.breed || ''
      const currentYear = new Date().getFullYear().toString()
      const competitionYear = events.length > 0 && events[events.length - 1].date
        ? events[events.length - 1].date.substring(0, 4)
        : currentYear
      const has2026Show = Boolean(
        showDog?.history &&
          showDog.history.some((h) => h.date && h.date.includes('2026')),
      )
      const showYear = has2026Show
        ? '2026'
        : showDog?.history && showDog.history[0]?.date
          ? showDog.history[0].date.substring(6, 10)
          : '2026'

      const precomputed = (dog as any)?.ranks || (dog as any)?.dog?.ranks
      const hasPrecomputedSport = Boolean(precomputed?.coursing || precomputed?.racing)

      const [
        allTimePlacementRank,
        allTimeSpeedRank,
        yearPlacementRank,
        yearSpeedRank,
        breedPlacementRank,
        breedSpeedRank,
        showAllTimeRank,
        showAllTimeBreedRank,
        showYearRank,
      ] = await Promise.all([
        !hasPrecomputedSport && competitionDogId ? getDogAllTimePlacementRank(competitionDogId) : Promise.resolve(null),
        !hasPrecomputedSport && competitionDogId ? getDogAllTimeSpeedRank(competitionDogId) : Promise.resolve(null),
        !hasPrecomputedSport && competitionDogId ? getDogPlacementRank(competitionDogId, competitionYear) : Promise.resolve(null),
        !hasPrecomputedSport && competitionDogId ? getDogSpeedRank(competitionDogId, competitionYear) : Promise.resolve(null),
        !hasPrecomputedSport && competitionDogId && breed ? getDogBreedPlacementRank(breed, competitionDogId) : Promise.resolve(null),
        !hasPrecomputedSport && competitionDogId && breed ? getDogBreedSpeedRank(breed, competitionDogId) : Promise.resolve(null),
        showDog ? getShowDogAllTimeRank(showDog) : Promise.resolve(null),
        showDog ? getShowDogBreedRank(showDog) : Promise.resolve(null),
        showDog ? getShowDogYearRank(showDog, showYear) : Promise.resolve(null),
      ])

      if (cancelled) return

      const newRanks: ProfileHeaderRank[] = []
      if (!hasPrecomputedSport && (allTimePlacementRank || yearPlacementRank)) {
        newRanks.push({
          key: 'coursing',
          label: 'Курсинг',
          rank: allTimePlacementRank,
          yearRank: yearPlacementRank || undefined,
          breedRank: breedPlacementRank || undefined,
          href: `/competitions?tab=ranking&year=${competitionYear}`,
        })
      }
      if (!hasPrecomputedSport && (allTimeSpeedRank || yearSpeedRank)) {
        newRanks.push({
          key: 'racing',
          label: 'Бега',
          rank: allTimeSpeedRank,
          yearRank: yearSpeedRank || undefined,
          breedRank: breedSpeedRank || undefined,
          href: `/competitions?tab=ranking&year=${competitionYear}`,
        })
      }
      if (showDog) {
        newRanks.push({
          key: 'shows',
          label: 'Выставки',
          rank: showDog.rank ?? showAllTimeRank,
          breedRank: showAllTimeBreedRank || undefined,
          yearBreedRank: showYearRank || undefined,
          href: `/shows?tab=ranking&year=${has2026Show ? '2026' : ''}`,
        })
      }
      setAsyncRanks(newRanks)
    }

    if (!loading && !showsLoading) {
      loadRanks()
    }

    return () => {
      cancelled = true
    }
  }, [dog, showDog, events, loading, showsLoading, profileId])

  // Объединение выставочных и спортивных титулов
  const titleGroups = useMemo(() => {
    const rawDogTitles = dog ? (dog.titles || []).map((t: any) => t.title || t) : []
    const dogTitlesGroup = buildDogProfileTitleGroups(rawDogTitles)
    const showTitlesGroup = showDog?.titles
      ? buildDogProfileTitleGroups(showDog.titles)
      : { show: [], competition: [] }
    return {
      show: maxMergeDogTitles(dogTitlesGroup.show, showTitlesGroup.show),
      competition: maxMergeDogTitles(dogTitlesGroup.competition, showTitlesGroup.competition),
    }
  }, [dog, showDog])

  const titles = useMemo(
    () => [...titleGroups.show, ...titleGroups.competition].map((t) => ({ title: t })),
    [titleGroups],
  )

  const coursing = dog?.coursing_stats || {}
  const racing = dog?.racing_stats || {}
  const judgeStats = (dog?.judge_stats as DogJudgesStats | undefined) || null
  const hasCoursingData = (coursing.total_starts || 0) > 0
  const hasRacingData = (racing.total_starts || 0) > 0
  const coursingEvents = useMemo(
    () => events.filter((e) => e.event_type === 'coursing' || e.event_type === 'bzmp'),
    [events],
  )
  const racingEvents = useMemo(
    () => events.filter((e) => e.event_type === 'racing'),
    [events],
  )
  const showCoursingColumn = hasCoursingData || coursingEvents.length > 0
  const showRacingColumn = hasRacingData || racingEvents.length > 0
  const hasSpeedRecords = speedRecords.length > 0
  const hasCoursingRecords = coursingRecords.length > 0

  const hasShowData = Boolean(
    showDog &&
      ((showDog.total_shows || 0) > 0 ||
        (Array.isArray(showDog.history) && showDog.history.length > 0)),
  )

  const availableTabs = useMemo(() => {
    const tabs: DisciplineTabItem[] = []

    if (showCoursingColumn) {
      tabs.push({
        id: 'coursing',
        label: 'Курсинг',
        icon: Rabbit,
        count: coursing.total_starts || coursingEvents.length || 0,
        theme: 'forest',
      })
    }
    if (showRacingColumn) {
      tabs.push({
        id: 'racing',
        label: 'Бега',
        icon: Gauge,
        count: racing.total_starts || racingEvents.length || 0,
        theme: 'warm-blue',
      })
    }
    if (hasShowData) {
      tabs.push({
        id: 'shows',
        label: 'Выставки',
        icon: Sparkles,
        count: showDog?.total_shows || showDog?.history?.length || 0,
        theme: 'camel',
      })
    }
    if ((hasSpeedRecords || hasCoursingRecords) && !showCoursingColumn && !showRacingColumn) {
      tabs.push({
        id: 'donino',
        label: 'Донино',
        icon: Timer,
        count: speedRecords.length + coursingRecords.length,
        theme: 'forest',
      })
    }
    return tabs
  }, [
    showCoursingColumn,
    coursing.total_starts,
    coursingEvents.length,
    showRacingColumn,
    racing.total_starts,
    racingEvents.length,
    hasShowData,
    showDog?.total_shows,
    showDog?.history?.length,
    hasSpeedRecords,
    hasCoursingRecords,
    speedRecords.length,
    coursingRecords.length,
  ])

  const [activeDiscipline, setActiveDiscipline] = useState<DisciplineTabId>(() => {
    if (fromSpeedRecords || fromCoursingRecords) return 'donino'
    if (showCoursingColumn) return 'coursing'
    if (showRacingColumn) return 'racing'
    if (hasShowData) return 'shows'
    if (hasSpeedRecords || hasCoursingRecords) return 'donino'
    return 'coursing'
  })

  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.some((t) => t.id === activeDiscipline)) {
      if ((fromSpeedRecords || fromCoursingRecords) && availableTabs.some((t) => t.id === 'donino')) {
        setActiveDiscipline('donino')
      } else {
        setActiveDiscipline(availableTabs[0].id)
      }
    }
  }, [availableTabs, activeDiscipline, fromSpeedRecords, fromCoursingRecords])

  const handleExport = async () => {
    if (!exportRef.current || exporting) return
    try {
      setExporting(true)
      const dataUrl = await toPng(exportRef.current, {
        quality: 1,
        pixelRatio: 2,
        filter: (node) =>
          !(node instanceof HTMLElement && node.dataset.exportIgnore !== undefined),
      })
      const link = document.createElement('a')
      link.download = `${(dog?.name_lat || showDog?.name_lat || 'dog').replace(/\s+/g, '_')}_profile.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  const headerDog = dog ?? (showDog ? {
    id: showDog.competition_dog_id ?? showDog.id,
    name_lat: showDog.name_lat,
    name_ru: showDog.name_ru,
    breed: showDog.breed,
    sex: showDog.sex,
  } : null)

  const hasCourseMedals =
    (coursing.gold || 0) > 0 || (coursing.silver || 0) > 0 || (coursing.bronze || 0) > 0
  const hasRacingMedals =
    (racing.gold || 0) > 0 || (racing.silver || 0) > 0 || (racing.bronze || 0) > 0

  const speedStats = hasSpeedRecords ? computeSpeedStats(speedRecords, breedRecords) : null
  const coursingStats = hasCoursingRecords
    ? computeCoursingDoninoStats(coursingRecords, breedCoursingRecords)
    : null

  const showRuName = headerDog?.name_ru && headerDog.name_ru !== headerDog.name_lat

  const bestScoreEventId = coursing.best_score_event_id || null
  const bestJudgeScoreEventId = coursing.best_judge_score_event_id || null
  const avgJudgeScoreEventId = coursing.avg_judge_score_event_id || null
  const bestSpeedEventId = racing.best_speed_event_id || null
  const avgSpeedEventId = racing.avg_speed_event_id || null

  const { primary: primaryDogName, secondary: secondaryDogName } = parseDogName(
    headerDog?.name_lat,
    headerDog?.name_ru,
  )
  const dogName = primaryDogName || toDogTitleCase(headerDog?.name_lat || headerDog?.name_ru || 'Собака')
  const displayName =
    secondaryDogName && secondaryDogName !== dogName
      ? `${dogName} (${secondaryDogName})`
      : dogName
  const dogBreed = displayBreed(headerDog?.breed || headerBreed || '').primary || headerDog?.breed || headerBreed || ''
  const dogTitles = titles.map((t) => t.title).join(', ')

  const rawPath = dog
    ? `/dog/${dog.id}`
    : showDog
      ? showDogProfilePath(showDog)
      : competitionId
        ? `/dog/${competitionId}`
        : '/'
  const profilePath = rawPath.endsWith('/') ? rawPath : `${rawPath}/`
  const canonicalUrl = `https://coursing-stats.ru${profilePath}`

  const seoFacts: string[] = []
  if (hasCoursingData) {
    seoFacts.push(`курсинг ${coursing.total_starts || 0} участий`)
  }
  if (hasRacingData) {
    seoFacts.push(`беги ${racing.total_starts || 0} участий`)
  }
  if (showDog && (showDog.total_shows || 0) > 0) {
    seoFacts.push(`выставки: ${showDog.total_shows}`)
  }
  if (hasSpeedRecords && speedStats?.bestSpeed != null) {
    seoFacts.push(`Донино ${speedStats.bestSpeed.toFixed(1)} км/ч`)
  }
  if (hasCoursingRecords && coursingStats?.bestTime != null) {
    seoFacts.push(`350 м ${coursingStats.bestTime.toFixed(2)} с`)
  }
  const totalGold = (coursing?.gold || 0) + (racing?.gold || 0)
  const medalText = totalGold > 0 ? `${totalGold} побед (золото)` : ''
  const description =
    seoFacts.length > 0
      ? `${displayName} (${dogBreed}): ${medalText ? `${medalText}, ` : ''}${seoFacts.join('; ')}. Профиль собаки, спортивная карьера, медали и результаты забегов на Coursing Stats.`
      : `Профиль собаки ${displayName} (${dogBreed}): курсинг, бега борзых, медали и рекорды на Coursing Stats.`
  const keywords = [
    dogName,
    secondaryDogName,
    headerDog?.name_ru,
    headerDog?.name_lat,
    dogBreed,
    'курсинг',
    'бега борзых',
    'рейтинг борзых 2026',
    'выставки',
    'Донино',
    'статистика',
    dogTitles,
    'РКФ',
  ]
    .filter(Boolean)
    .join(', ')
  const seoTitle = dogBreed
    ? `${displayName} (${dogBreed}) — профиль собаки, результаты забегов и медали`
    : `${displayName} — профиль собаки, результаты забегов и медали`

  const visibleSpeedHistory = showAllSpeedHistory
    ? (speedStats?.history ?? [])
    : (speedStats?.history ?? []).slice(0, HISTORY_DEFAULT)
  const visibleCoursingDoninoHistory = showAllCoursingDoninoHistory
    ? (coursingStats?.history ?? [])
    : (coursingStats?.history ?? []).slice(0, HISTORY_DEFAULT)
  const visibleCoursingEvents = showAllCoursingEvents
    ? coursingEvents
    : coursingEvents.slice(0, HISTORY_DEFAULT)
  const visibleRacingEvents = showAllRacingEvents
    ? racingEvents
    : racingEvents.slice(0, HISTORY_DEFAULT)

  const alternateNames = Array.from(
    new Set(
      [secondaryDogName, headerDog?.name_ru, headerDog?.name_lat].filter(
        (n): n is string => Boolean(n && n !== dogName),
      ),
    ),
  )

  return {
    competitionId,
    showRouteBreed,
    isLegacyShowRoute,
    dog,
    showDog,
    events,
    eventResultsUrls,
    speedRecords,
    coursingRecords,
    speedStats,
    coursingStats,
    visibleSpeedHistory,
    showAllSpeedHistory,
    setShowAllSpeedHistory,
    visibleCoursingDoninoHistory,
    showAllCoursingDoninoHistory,
    setShowAllCoursingDoninoHistory,
    visibleCoursingEvents,
    showAllCoursingEvents,
    setShowAllCoursingEvents,
    visibleRacingEvents,
    showAllRacingEvents,
    setShowAllRacingEvents,
    loading,
    showsLoading,
    exporting,
    exportRef,
    handleExport,
    headerDog,
    headerBreed,
    headerRanks,
    titleGroups,
    showRuName,
    hasCoursingData,
    hasCourseMedals,
    coursing,
    coursingEvents,
    hasRacingData,
    hasRacingMedals,
    racing,
    racingEvents,
    showCoursingColumn,
    showRacingColumn,
    hasSpeedRecords,
    hasCoursingRecords,
    judgeStats,
    bestScoreEventId,
    bestJudgeScoreEventId,
    avgJudgeScoreEventId,
    bestSpeedEventId,
    avgSpeedEventId,
    availableTabs,
    activeDiscipline,
    setActiveDiscipline,
    dogName,
    displayName,
    dogBreed,
    profilePath,
    canonicalUrl,
    seoTitle,
    description,
    keywords,
    alternateNames,
  }
}
