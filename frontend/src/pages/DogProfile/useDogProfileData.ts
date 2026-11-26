import { useState, useMemo, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import {
  useDogProfile,
  useDogEvents,
  useDogSpeedRecords,
  useSpeedRecordsByBreed,
  useDogCoursingRecords,
  useCoursingRecordsByBreed,
} from '../../hooks/useStaticData'
import {
  buildDogProfileTitleGroups,
} from '../../lib/qualificationTitles'
import {
  evaluateCumulativeTitles,
} from '../../lib/cumulativeTitles'
import { useYandexGoal } from '../../components/YandexMetrica'
import { buildEventResultsUrlMap } from '../../lib/procoursingLinks'
import type { DogJudgesStats } from './DogJudgesSection'
import {
  HISTORY_DEFAULT,
  computeSpeedStats,
  computeCoursingDoninoStats,
} from './dogProfileStats'
import { useDogProfileRanks } from './useDogProfileRanks'
import { useDogProfileSeo } from './useDogProfileSeo'
import { useDogProfileShowResolver } from './useDogProfileShowResolver'
import { useDogProfileTabs } from './useDogProfileTabs'
import { useDogProfileExport } from './useDogProfileExport'
import { buildDogPassportData } from './components/Passport/useDogPassportData'
import { isShowOnlyProfileId } from '../../lib/showDogProfilePath'
import { resolveBreedParam } from '../../lib/breedMapping'

const EMPTY_ARRAY: never[] = []

export function useDogProfileData() {
  const params = useParams<{ id?: string; dogId?: string; breed?: string }>()
  const competitionId = params.id
  const showRouteDogId = params.dogId
  const showRouteBreed = params.breed ? decodeURIComponent(params.breed) : undefined
  const isLegacyShowRoute = Boolean(showRouteDogId && showRouteBreed)

  const [showAllSpeedHistory, setShowAllSpeedHistory] = useState(false)
  const [showAllCoursingDoninoHistory, setShowAllCoursingDoninoHistory] = useState(false)
  const [showAllCoursingEvents, setShowAllCoursingEvents] = useState(false)
  const [showAllRacingEvents, setShowAllRacingEvents] = useState(false)

  const { reachGoal } = useYandexGoal()

  const [searchParams] = useSearchParams()
  const queryName = searchParams.get('name')
  const queryBreed = resolveBreedParam(searchParams.get('breed')) || searchParams.get('breed')

  const profileId = competitionId || ''
  const isShowOnly = isShowOnlyProfileId(profileId)
  const sportDogId = isShowOnly ? '' : profileId

  const [preSportId, setPreSportId] = useState<string | null>(null)
  const effectiveSportDogId = sportDogId || preSportId || ''

  const { data: dogDataResult, isLoading: loading } = useDogProfile(effectiveSportDogId)
  const { data: eventsData } = useDogEvents(effectiveSportDogId)
  const { data: speedRecordsData } = useDogSpeedRecords(effectiveSportDogId)
  const { data: coursingRecordsData } = useDogCoursingRecords(effectiveSportDogId)

  const dog: Record<string, any> | null = dogDataResult?.success ? dogDataResult.data : null
  const events: Array<Record<string, any>> = eventsData?.success
    ? (Array.isArray(eventsData.data) ? eventsData.data : EMPTY_ARRAY)
    : EMPTY_ARRAY
  const eventResultsUrls = useMemo(() => buildEventResultsUrlMap(events), [events])

  const speedRecords = speedRecordsData?.success
    ? Array.isArray(speedRecordsData.data)
      ? speedRecordsData.data
      : EMPTY_ARRAY
    : EMPTY_ARRAY
  const coursingRecords = coursingRecordsData?.success
    ? Array.isArray(coursingRecordsData.data)
      ? coursingRecordsData.data
      : EMPTY_ARRAY
    : EMPTY_ARRAY

  // Выставки и автопоиск спорт-собаки
  const { showDog, showsLoading, fallbackSportDogId } = useDogProfileShowResolver({
    profileId,
    competitionId,
    effectiveSportDogId,
    dog,
    loading,
    isLegacyShowRoute,
    showRouteDogId,
    showRouteBreed,
    queryName,
    queryBreed,
    isShowOnly,
  })

  useEffect(() => {
    if (fallbackSportDogId && fallbackSportDogId !== preSportId) {
      setPreSportId(fallbackSportDogId)
    }
  }, [fallbackSportDogId, preSportId])

  const headerBreed = dog?.breed || showDog?.breed || showRouteBreed || ''
  const { data: breedRecordsData } = useSpeedRecordsByBreed(dog?.breed || showDog?.breed || '')
  const breedRecords = breedRecordsData?.success
    ? Array.isArray(breedRecordsData.data)
      ? breedRecordsData.data
      : EMPTY_ARRAY
    : EMPTY_ARRAY

  const { data: breedCoursingRecordsData } = useCoursingRecordsByBreed(dog?.breed || showDog?.breed || '')
  const breedCoursingRecords = breedCoursingRecordsData?.success
    ? Array.isArray(breedCoursingRecordsData.data)
      ? breedCoursingRecordsData.data
      : EMPTY_ARRAY
    : EMPTY_ARRAY

  useEffect(() => {
    if (dog || showDog) reachGoal('dog_profile_view')
  }, [dog, showDog, reachGoal])

  // Объединённый объект собаки для шапки
  const headerDog = useMemo<{
    id: string | number
    name_lat?: string | null
    name_ru?: string | null
    breed?: string | null
    sex?: string | null
    pedigree_url: string | null
    photo_url: string | null
  } | null>(() => {
    if (dog) {
      return {
        ...dog,
        id: (dog as any).id ?? competitionId ?? '',
        pedigree_url: (dog as any).pedigree_url || showDog?.pedigree_url || null,
        photo_url: (dog as any).photo_url || (showDog as any)?.photo_url || null,
      }
    }
    if (showDog) {
      return {
        id: showDog.competition_dog_id ?? showDog.id,
        name_lat: showDog.name_lat,
        name_ru: showDog.name_ru,
        breed: showDog.breed,
        sex: showDog.sex,
        pedigree_url: showDog.pedigree_url || null,
        photo_url: (showDog as any)?.photo_url || null,
      }
    }
    return null
  }, [dog, showDog, competitionId])

  // Расчёт и асинхронная дозагрузка рангов
  const headerRanks = useDogProfileRanks({
    dog,
    showDog,
    events,
    loading,
    showsLoading,
    profileId,
  })

  // Базовые группы выставочных и спортивных титулов
  const rawTitleGroups = useMemo(() => {
    return buildDogProfileTitleGroups({
      competitionIndexed: dog?.titles,
      competitions: events,
      showTitles: showDog?.titles,
      showHistory: showDog?.history,
    })
  }, [dog, showDog, events])

  // Автоматический расчёт накопительных званий РКФ по регламенту
  const cumulativeTitles = useMemo(() => {
    return evaluateCumulativeTitles({
      dogId: headerDog?.id,
      breed: headerBreed,
      competitions: events,
      competitionTitles: rawTitleGroups.competition,
      showTitles: showDog?.titles,
      showHistory: showDog?.history,
    })
  }, [headerDog?.id, headerBreed, events, rawTitleGroups.competition, showDog?.titles, showDog?.history])

  // Строго официальные титулы РКФ с разделением по высшим званиям, спортивным дисциплинам и выставкам
  const titleGroups = useMemo(() => {
    return {
      supreme: cumulativeTitles.officialSupremeTitles,
      coursing: cumulativeTitles.officialCoursingTitles,
      racing: cumulativeTitles.officialRacingTitles,
      competition: cumulativeTitles.officialSportTitles,
      show: cumulativeTitles.officialShowTitles,
    }
  }, [
    cumulativeTitles.officialSupremeTitles,
    cumulativeTitles.officialCoursingTitles,
    cumulativeTitles.officialRacingTitles,
    cumulativeTitles.officialSportTitles,
    cumulativeTitles.officialShowTitles,
  ])

  const titleExplanations = useMemo(() => {
    return cumulativeTitles.titleExplanations
  }, [cumulativeTitles.titleExplanations])

  const titles = useMemo(
    () =>
      [...titleGroups.show, ...titleGroups.competition].map((t) => ({
        title: typeof t === 'string' ? t : (t as { title: string }).title,
      })),
    [titleGroups],
  )

  const coursing = (dog?.coursing_stats || {}) as Record<string, any>
  const racing = (dog?.racing_stats || {}) as Record<string, any>
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

  const isBzmp = useMemo(() => {
    return (
      coursingEvents.length > 0 &&
      coursingEvents.every(
        (e: any) => e.competition_kind === 'bzmp' || e.event_type === 'bzmp',
      )
    )
  }, [coursingEvents])

  const hasCoursingStarts = useMemo(() => {
    return hasCoursingData || coursingEvents.length > 0 || (coursing.total_starts || 0) > 0
  }, [hasCoursingData, coursingEvents.length, coursing.total_starts])

  const hasValidCompetitionStarts = useMemo(() => {
    return events.some((e) => e.placement != null && Number(e.placement) > 0)
  }, [events])

  const hasDonino = hasSpeedRecords || hasCoursingRecords

  // Вкладки профиля и мобильные подвкладки
  const {
    mainTabs,
    activeMainTab,
    setActiveMainTab,
    availableTabs,
    activeDiscipline,
    setActiveDiscipline,
  } = useDogProfileTabs({
    hasCoursingStarts,
    judgeStats,
    hasValidCompetitionStarts,
    showCoursingColumn,
    coursingTotalStarts: coursing.total_starts,
    coursingEventsCount: coursingEvents.length,
    isBzmp,
    showRacingColumn,
    racingTotalStarts: racing.total_starts,
    racingEventsCount: racingEvents.length,
    hasShowData,
    showDog,
  })

  // Экспорт постера профиля в PNG
  const { exporting, exportRef, handleExport } = useDogProfileExport({
    dogNameLat: dog?.name_lat,
    showDogNameLat: showDog?.name_lat,
  })

  const hasCourseMedals =
    (coursing.gold || 0) > 0 || (coursing.silver || 0) > 0 || (coursing.bronze || 0) > 0
  const hasRacingMedals =
    (racing.gold || 0) > 0 || (racing.silver || 0) > 0 || (racing.bronze || 0) > 0

  const speedStats = hasSpeedRecords ? computeSpeedStats(speedRecords, breedRecords) : null
  const coursingStats = hasCoursingRecords
    ? computeCoursingDoninoStats(coursingRecords, breedCoursingRecords)
    : null

  const showRuName = useMemo(
    () => Boolean(headerDog?.name_ru && headerDog.name_ru !== headerDog.name_lat),
    [headerDog],
  )

  const bestScoreEventId = coursing.best_score_event_id || null
  const bestJudgeScoreEventId = coursing.best_judge_score_event_id || null
  const avgJudgeScoreEventId = coursing.avg_judge_score_event_id || null
  const bestSpeedEventId = racing.best_speed_event_id || null
  const avgSpeedEventId = racing.avg_speed_event_id || null

  const passportData = useMemo(() => {
    return buildDogPassportData({
      dog: headerDog,
      showDog,
      events,
      supremeTitles: titleGroups.supreme,
      competitionTitles: titleGroups.competition,
      coursingTitles: titleGroups.coursing,
      racingTitles: titleGroups.racing,
      showTitles: titleGroups.show,
      coursing,
      racing,
      speedStats,
      coursingStats,
      ranks: headerRanks,
    })
  }, [headerDog, showDog, events, titleGroups, coursing, racing, speedStats, coursingStats, headerRanks])

  const {
    dogName,
    displayName,
    dogBreed,
    profilePath,
    canonicalUrl,
    seoTitle,
    description,
    keywords,
    alternateNames,
  } = useDogProfileSeo({
    headerDog,
    headerBreed,
    dog,
    showDog,
    competitionId,
    titles,
    hasCoursingData,
    hasRacingData,
    coursing,
    racing,
    hasSpeedRecords,
    hasCoursingRecords,
    speedStats,
    coursingStats,
  })

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
    titleExplanations,
    cumulativeTitles,
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
    hasDonino,
    judgeStats,
    bestScoreEventId,
    bestJudgeScoreEventId,
    avgJudgeScoreEventId,
    bestSpeedEventId,
    avgSpeedEventId,
    mainTabs,
    activeMainTab,
    setActiveMainTab,
    hasValidCompetitionStarts,
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
    fallbackSportDogId,
    passportData,
  }
}
