import { useState, useRef, useMemo, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation, Navigate, useSearchParams } from 'react-router-dom'
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
import LoadingCard from '../../components/LoadingCard'
import ErrorState from '../../components/ErrorState'
import NotFound from '../NotFound'
import { SEO } from '../../components/SEO'
import { JsonLd, breadcrumbListSchema, profilePageSchema } from '../../components/JsonLd'
import { useYandexGoal } from '../../components/YandexMetrica'
import { buildEventResultsUrlMap } from '../../lib/procoursingLinks'
import type { ShowDogCardData } from '../Shows/ShowDogCard'
import { DogProfileHeader, type ProfileHeaderRank } from './DogProfileHeader'
import { CoursingColumn } from './CoursingColumn'
import { RacingColumn } from './RacingColumn'
import { ShowsColumn } from './ShowsColumn'
import { EmptyDisciplineColumn } from './EmptyDisciplineColumn'
import { DoninoSpeedColumn } from './DoninoSpeedColumn'
import { DoninoCoursingColumn } from './DoninoCoursingColumn'
import { DogJudgesSection, type DogJudgesStats } from './DogJudgesSection'
import { CollapsibleSection } from '../../components/ui/CollapsibleSection'
import {
  HISTORY_DEFAULT,
  computeSpeedStats,
  computeCoursingDoninoStats,
} from './dogProfileStats'

/**
 * Единый профиль `/dog/:id`:
 * — id из соревнований (procoursing);
 * — id ≥ 1e6 — только выставки (стабильный hash);
 * — legacy `/shows/dog/:dogId/:breed` → редирект на `/dog/{id}`.
 */
export default function DogProfile() {
  const params = useParams<{ id?: string; dogId?: string; breed?: string }>()
  const competitionId = params.id
  const showRouteDogId = params.dogId
  const showRouteBreed = params.breed ? decodeURIComponent(params.breed) : undefined
  const isLegacyShowRoute = Boolean(showRouteDogId && showRouteBreed)

  const navigate = useNavigate()
  const location = useLocation()
  const [exporting, setExporting] = useState(false)
  const [showAllSpeedHistory, setShowAllSpeedHistory] = useState(false)
  const [showAllCoursingDoninoHistory, setShowAllCoursingDoninoHistory] = useState(false)
  const [showAllCoursingEvents, setShowAllCoursingEvents] = useState(false)
  const [showAllRacingEvents, setShowAllRacingEvents] = useState(false)
  const [showDog, setShowDog] = useState<ShowDogCardData | null>(null)
  const [showsLoading, setShowsLoading] = useState(true)
  const [asyncRanks, setAsyncRanks] = useState<ProfileHeaderRank[]>([])

  const exportRef = useRef(null)
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

  // Выставки: detail-шард по id / competition / кличка+порода (не тянем весь ranking)
  useEffect(() => {
    let cancelled = false
    const loadShows = async () => {
      setShowsLoading(true)
      try {
        // Всегда пытаемся загрузить showDog по имени+породе, даже если нет явной связи
        // Это позволяет найти собаку в выставках даже без show_dog_id
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

  // 0ms Latency: предрасчитанные ранги курсинга и бегов доступны синхронно через useMemo (без моргания)
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

  // Итоговые headerRanks: предрасчитанный спорт + выставочные ранги из карточки/дозагрузки
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

  // Места во всременных рейтингах: дозагрузка выставок или фоллбэк для курсинга/бегов
  useEffect(() => {
    let cancelled = false
    const loadRanks = async () => {
      const competitionDogId = dog?.id ?? (profileId && !isShowOnlyProfileId(profileId) ? profileId : null)
      const breed = dog?.breed || showDog?.breed || ''
      const currentYear = new Date().getFullYear().toString()
      // Для курсинга и бегов берём последний год из событий или текущий год
      const competitionYear = events.length > 0 && events[events.length - 1].date
        ? events[events.length - 1].date.substring(0, 4)
        : currentYear
      // Для выставок проверяем участие в сезоне 2026
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

      // Если данные курсинга и бегов уже есть из пака, запрашиваем только выставки (экономит 8 запросов!)
      const [
        allTimePlacementRank,
        allTimeSpeedRank,
        yearPlacementRank,
        yearSpeedRank,
        allTimeBreedPlacementRank,
        allTimeBreedSpeedRank,
        yearBreedPlacementRank,
        yearBreedSpeedRank,
        showYearRank,
        showBreedRank,
      ] = await Promise.all([
        hasPrecomputedSport ? Promise.resolve(null) : getDogAllTimePlacementRank(competitionDogId),
        hasPrecomputedSport ? Promise.resolve(null) : getDogAllTimeSpeedRank(competitionDogId),
        hasPrecomputedSport ? Promise.resolve(null) : getDogPlacementRank(competitionDogId, competitionYear),
        hasPrecomputedSport ? Promise.resolve(null) : getDogSpeedRank(competitionDogId, competitionYear),
        hasPrecomputedSport ? Promise.resolve(null) : getDogBreedPlacementRank(competitionDogId, breed, ''),
        hasPrecomputedSport ? Promise.resolve(null) : getDogBreedSpeedRank(competitionDogId, breed, ''),
        hasPrecomputedSport ? Promise.resolve(null) : getDogBreedPlacementRank(competitionDogId, breed, competitionYear),
        hasPrecomputedSport ? Promise.resolve(null) : getDogBreedSpeedRank(competitionDogId, breed, competitionYear),
        showDog ? getShowDogYearRank({
          showId: showDog?.id,
          competitionId: competitionDogId ?? showDog?.competition_dog_id ?? null,
          year: showYear,
        }) : Promise.resolve(null),
        showDog ? getShowDogBreedRank({
          showId: showDog?.id,
          competitionId: null,
          breed,
          year: showYear,
        }) : Promise.resolve(null),
      ])

      if (cancelled) return
      setAsyncRanks((prev) => {
        const next: ProfileHeaderRank[] = []

        if (!hasPrecomputedSport) {
          if (allTimePlacementRank != null) {
            next.push({
              key: 'coursing',
              label: 'Курсинг',
              rank: allTimePlacementRank,
              yearRank: yearPlacementRank ?? undefined,
              breedRank: allTimeBreedPlacementRank ?? undefined,
              yearBreedRank: yearBreedPlacementRank ?? undefined,
              href: '/competitions?tab=ranking&year=',
            })
          }
          if (allTimeSpeedRank != null) {
            next.push({
              key: 'racing',
              label: 'Бега',
              rank: allTimeSpeedRank,
              yearRank: yearSpeedRank ?? undefined,
              breedRank: allTimeBreedSpeedRank ?? undefined,
              yearBreedRank: yearBreedSpeedRank ?? undefined,
              href: '/competitions?tab=ranking&year=',
            })
          }
        }

        if (showDog) {
          const showAllTimeBreedRank =
            (showDog as any)?.breed_rank ?? (showDog as any)?.breedRank ?? undefined
          const showYearBreedRank = has2026Show ? (showBreedRank ?? undefined) : undefined

          next.push({
            key: 'shows',
            label: 'Выставки',
            rank: showYearRank ?? null,
            breedRank: showAllTimeBreedRank ?? showBreedRank ?? undefined,
            yearBreedRank: showYearBreedRank,
            href: `/shows?tab=ranking&year=${has2026Show ? '2026' : ''}`,
          })
        }

        return next
      })
    }
    if (!dog && !showDog) return
    if (loading || showsLoading) return
    void loadRanks()
    return () => {
      cancelled = true
    }
  }, [dog, showDog, profileId, loading, showsLoading, events])

  // До любых early return — иначе нарушаются Rules of Hooks
  const titleGroups = useMemo(
    () =>
      buildDogProfileTitleGroups({
        competitionIndexed: Array.isArray(dog?.titles) ? dog.titles : [],
        competitions: events,
        showTitles: showDog?.titles,
        showHistory: showDog?.history,
      }),
    [dog?.titles, events, showDog?.titles, showDog?.history],
  )
  const titles = useMemo(
    () => maxMergeDogTitles(titleGroups.competition, titleGroups.show),
    [titleGroups],
  )

  type DisciplineTabId = 'coursing' | 'racing' | 'shows' | 'donino'

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
    const tabs: Array<{
      id: DisciplineTabId
      label: string
      icon: typeof Rabbit
      count: number
      theme: 'forest' | 'warm-blue' | 'camel'
    }> = []

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
    // Донино скрыто для собак со спортивными состязаниями (чистота спортивного профиля)
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

  const activeIndex = Math.max(
    0,
    availableTabs.findIndex((t) => t.id === activeDiscipline),
  )

  // Жест свайпа влево/вправо на мобильных экранах между вкладками дисциплин
  const [dragOffset, setDragOffset] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const gestureLockRef = useRef<'horizontal' | 'vertical' | null>(null)
  const transitionTimeoutRef = useRef<number | null>(null)
  const hadMovedRef = useRef(false)

  // Плавная анимация скольжения при изменении активной дисциплины
  useEffect(() => {
    setIsTransitioning(true)
    const timer = window.setTimeout(() => {
      setIsTransitioning(false)
    }, 320)
    return () => clearTimeout(timer)
  }, [activeDiscipline])

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }
    }
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) return
    if (availableTabs.length <= 1) return
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
    gestureLockRef.current = null
    hadMovedRef.current = false
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
      transitionTimeoutRef.current = null
    }
    setIsTransitioning(false)
    setDragOffset(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return
    if (availableTabs.length <= 1) return
    const touch = e.touches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y

    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      hadMovedRef.current = true
    }

    // Если направление еще не заблокировано, определяем вертикальный скролл vs горизонтальный свайп
    if (!gestureLockRef.current) {
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      if (absDx < 8 && absDy < 8) return
      if (absDy >= absDx) {
        // Вертикальный скролл страницы: не перехватываем жест
        gestureLockRef.current = 'vertical'
        return
      }
      gestureLockRef.current = 'horizontal'
    }

    if (gestureLockRef.current === 'horizontal') {
      // Упругое сопротивление (rubber-band) при попытке свайпа за край
      const isAtLeftEdge = activeIndex === 0 && dx > 0
      const isAtRightEdge = activeIndex === availableTabs.length - 1 && dx < 0
      const appliedDx = isAtLeftEdge || isAtRightEdge ? dx * 0.22 : dx
      setDragOffset(appliedDx)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return
    if (availableTabs.length <= 1) {
      touchStartRef.current = null
      gestureLockRef.current = null
      setDragOffset(null)
      hadMovedRef.current = false
      return
    }

    const isHorizontal = gestureLockRef.current === 'horizontal'
    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dt = Date.now() - touchStartRef.current.time
    const velocity = Math.abs(dx) / (dt || 1)

    touchStartRef.current = null
    gestureLockRef.current = null

    if (isHorizontal) {
      const isSwipeLeft = dx < -45 || (dx < -20 && velocity > 0.25)
      const isSwipeRight = dx > 45 || (dx > 20 && velocity > 0.25)

      setIsTransitioning(true)
      setDragOffset(null)

      if (isSwipeLeft && activeIndex < availableTabs.length - 1) {
        setActiveDiscipline(availableTabs[activeIndex + 1].id)
      } else if (isSwipeRight && activeIndex > 0) {
        setActiveDiscipline(availableTabs[activeIndex - 1].id)
      }

      transitionTimeoutRef.current = window.setTimeout(() => {
        setIsTransitioning(false)
        hadMovedRef.current = false
      }, 320)
    } else {
      setDragOffset(null)
      hadMovedRef.current = false
    }
  }

  const handleTouchCancel = () => {
    touchStartRef.current = null
    gestureLockRef.current = null
    setDragOffset(null)
    hadMovedRef.current = false
  }

  const isDragging = dragOffset !== null && dragOffset !== 0
  const isAnimating = isDragging || isTransitioning
  const mobileTransform = `translateX(calc(-${activeIndex * 100}% + ${dragOffset ?? 0}px))`


  // Canonical redirect for show dog on legacy show route, alias ID, or linked sports profile
  if (!showsLoading && showDog) {
    if (
      showDog.competition_dog_id != null &&
      Number.isFinite(Number(showDog.competition_dog_id)) &&
      String(showDog.competition_dog_id) !== String(competitionId)
    ) {
      return <Navigate to={`/dog/${showDog.competition_dog_id}/`} replace />
    }
    if (
      !dog &&
      competitionId &&
      showDog.id &&
      String(showDog.id) !== String(competitionId)
    ) {
      return <Navigate to={`/dog/${showDog.id}/`} replace />
    }
  }

  // Legacy /shows/dog/{catalog}/{breed} → /dog/{stableId} (never catalog #)
  if (!showsLoading && isLegacyShowRoute && showDog) {
    const canonical = showDogProfilePath(showDog)
    if (canonical.startsWith('/dog/') && isShowOnlyProfileId(canonical.slice('/dog/'.length))) {
      return <Navigate to={canonical} replace />
    }
    if (canonical !== location.pathname) {
      return <Navigate to={canonical} replace />
    }
  }

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

  const waitingCompetition = Boolean(competitionId) && loading
  if (waitingCompetition || showsLoading) {
    return <LoadingCard count={3} variant="profile" />
  }

  if (!dog && !showDog) {
    return <NotFound />
  }

  const headerDog = dog ?? {
    id: showDog!.competition_dog_id ?? showDog!.id,
    name_lat: showDog!.name_lat,
    name_ru: showDog!.name_ru,
    breed: showDog!.breed,
    sex: showDog!.sex,
  }

  const hasCourseMedals =
    (coursing.gold || 0) > 0 || (coursing.silver || 0) > 0 || (coursing.bronze || 0) > 0
  const hasRacingMedals =
    (racing.gold || 0) > 0 || (racing.silver || 0) > 0 || (racing.bronze || 0) > 0


  const speedStats = hasSpeedRecords ? computeSpeedStats(speedRecords, breedRecords) : null
  const coursingStats = hasCoursingRecords
    ? computeCoursingDoninoStats(coursingRecords, breedCoursingRecords)
    : null

  const showRuName = headerDog.name_ru && headerDog.name_ru !== headerDog.name_lat

  const bestScoreEventId = coursing.best_score_event_id || null
  const bestJudgeScoreEventId = coursing.best_judge_score_event_id || null
  const avgJudgeScoreEventId = coursing.avg_judge_score_event_id || null
  const bestSpeedEventId = racing.best_speed_event_id || null
  const avgSpeedEventId = racing.avg_speed_event_id || null

  const { primary: primaryDogName, secondary: secondaryDogName } = parseDogName(
    headerDog.name_lat,
    headerDog.name_ru,
  )
  const dogName = primaryDogName || toDogTitleCase(headerDog.name_lat || headerDog.name_ru || 'Собака')
  const displayName =
    secondaryDogName && secondaryDogName !== dogName
      ? `${dogName} (${secondaryDogName})`
      : dogName
  const dogBreed = displayBreed(headerDog.breed || headerBreed || '').primary || headerDog.breed || headerBreed || ''
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
    headerDog.name_ru,
    headerDog.name_lat,
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

  void fromSpeedRecords
  void fromCoursingRecords

  const alternateNames = Array.from(
    new Set(
      [secondaryDogName, headerDog.name_ru, headerDog.name_lat].filter(
        (n): n is string => Boolean(n && n !== dogName),
      ),
    ),
  )

  const renderTabContent = (tabId: DisciplineTabId) => {
    switch (tabId) {
      case 'coursing':
        return showCoursingColumn ? (
          <>
            <CoursingColumn
              hasCoursingData={hasCoursingData}
              hasCourseMedals={hasCourseMedals}
              coursing={coursing}
              coursingEvents={coursingEvents}
              visibleCoursingEvents={visibleCoursingEvents}
              eventResultsUrls={eventResultsUrls}
              bestScoreEventId={bestScoreEventId}
              bestJudgeScoreEventId={bestJudgeScoreEventId}
              avgJudgeScoreEventId={avgJudgeScoreEventId}
              showAllCoursingEvents={showAllCoursingEvents}
              onToggleShowAll={() => setShowAllCoursingEvents((v) => !v)}
              rank={headerRanks.find((r) => r.key === 'coursing')}
              breed={headerBreed}
            />
            {judgeStats && (
              <div className="mt-6">
                <DogJudgesSection judgeStats={judgeStats} competitions={events} />
              </div>
            )}
          </>
        ) : (
          <EmptyDisciplineColumn title="Курсинг / БЗМП" theme="forest" />
        )
      case 'racing':
        return showRacingColumn ? (
          <RacingColumn
            hasRacingData={hasRacingData}
            hasRacingMedals={hasRacingMedals}
            racing={racing}
            racingEvents={racingEvents}
            visibleRacingEvents={visibleRacingEvents}
            eventResultsUrls={eventResultsUrls}
            bestSpeedEventId={bestSpeedEventId}
            avgSpeedEventId={avgSpeedEventId}
            showAllRacingEvents={showAllRacingEvents}
            onToggleShowAll={() => setShowAllRacingEvents((v) => !v)}
            rank={headerRanks.find((r) => r.key === 'racing')}
            breed={headerBreed}
          />
        ) : (
          <EmptyDisciplineColumn title="Бега борзых" theme="warm-blue" />
        )
      case 'shows':
        return showDog ? (
          <ShowsColumn
            dog={showDog}
            rank={headerRanks.find((r) => r.key === 'shows')}
            breed={headerBreed}
          />
        ) : (
          <EmptyDisciplineColumn title="Выставки" theme="camel" />
        )
      case 'donino':
        return (
          <div className="space-y-4">
            {hasSpeedRecords && speedStats ? (
              <DoninoSpeedColumn
                speedStats={speedStats}
                visibleSpeedHistory={visibleSpeedHistory}
                showAllSpeedHistory={showAllSpeedHistory}
                onToggleShowAll={() => setShowAllSpeedHistory((v) => !v)}
              />
            ) : null}

            {hasCoursingRecords && coursingStats ? (
              <DoninoCoursingColumn
                coursingStats={coursingStats}
                visibleCoursingDoninoHistory={visibleCoursingDoninoHistory}
                showAllCoursingDoninoHistory={showAllCoursingDoninoHistory}
                onToggleShowAll={() => setShowAllCoursingDoninoHistory((v) => !v)}
              />
            ) : null}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <SEO
        title={seoTitle}
        description={description}
        keywords={keywords}
        canonicalUrl={canonicalUrl}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            breadcrumbListSchema([
              { name: 'Главная', url: '/' },
              { name: 'Рейтинг', url: '/competitions?tab=ranking' },
              { name: dogName, url: profilePath },
            ]),
            profilePageSchema({
              url: canonicalUrl,
              name: displayName,
              alternateName: alternateNames.length === 1 ? alternateNames[0] : alternateNames.length > 1 ? alternateNames : null,
              breed: dogBreed,
              description,
            }),
          ],
        }}
      />
      <div ref={exportRef}>
        <DogProfileHeader
          dog={headerDog}
          showTitles={titleGroups.show}
          competitionTitles={titleGroups.competition}
          showRuName={!!showRuName}
          exporting={exporting}
          onExport={handleExport}
          ranks={headerRanks}
          explainers={{
            coursing: hasCoursingData
              ? {
                  gold: coursing.gold,
                  silver: coursing.silver,
                  bronze: coursing.bronze,
                  total_starts: coursing.total_starts,
                  avg_judge_score: coursing.avg_judge_score,
                  best_judge_score: coursing.best_judge_score,
                }
              : null,
            racing: hasRacingData
              ? {
                  best_speed: racing.best_speed,
                  avg_speed: racing.avg_speed,
                  racing_starts: racing.total_starts,
                  racing_gold: racing.gold,
                  racing_silver: racing.silver,
                  racing_bronze: racing.bronze,
                }
              : null,
            shows: showDog
              ? {
                  total_shows: showDog.total_shows,
                  rank_score: showDog.rank_score ?? null,
                  best_award: showDog.best_award ?? null,
                  best_grade: showDog.best_grade ?? null,
                }
              : null,
          }}
        />

        {/* Мобильный сегмент-контрол дисциплин */}
        {availableTabs.length > 1 && (
          <div
            className={`mb-4 w-full p-1 rounded-2xl bg-cream-100/80 border border-old-money-200/90 shadow-2xs lg:hidden ${
              availableTabs.length <= 3
                ? 'grid gap-1.5'
                : 'flex items-center gap-1.5 overflow-x-auto no-scrollbar'
            }`}
            style={
              availableTabs.length <= 3
                ? { gridTemplateColumns: `repeat(${availableTabs.length}, minmax(0, 1fr))` }
                : undefined
            }
            role="tablist"
            aria-label="Дисциплины собаки"
          >
            {availableTabs.map((tab) => {
              const isActive = activeDiscipline === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-controls={`tabpanel-${tab.id}`}
                  aria-selected={isActive}
                  onClick={() => setActiveDiscipline(tab.id)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-1.5 min-h-[44px] text-xs font-semibold transition-all min-w-0 ${
                    availableTabs.length > 3 ? 'shrink-0 px-3' : 'w-full'
                  } ${
                    isActive
                      ? tab.theme === 'forest'
                        ? 'bg-forest-600 text-white shadow-xs'
                        : tab.theme === 'warm-blue'
                          ? 'bg-warm-blue-700 text-white shadow-xs'
                          : 'bg-camel-600 text-white shadow-xs'
                      : 'text-charcoal-700 hover:text-charcoal-900 hover:bg-white/50'
                  }`}
                >
                  <tab.icon
                    className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : 'text-charcoal-400'}`}
                    aria-hidden
                  />
                  <span className="truncate">{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`inline-flex items-center justify-center h-4.5 min-w-[1.25rem] px-1.5 rounded-full text-[10px] font-bold tabular-nums leading-none shrink-0 ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : 'bg-old-money-200/70 text-charcoal-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
        {/* Мобильный вид: горизонтальный свайп-трек между дисциплинами */}
        <div className="mb-6 block lg:hidden">
          {availableTabs.length === 0 ? (
            <EmptyDisciplineColumn title="Курсинг / БЗМП" theme="forest" />
          ) : (
            <div
              className="w-full relative overflow-hidden touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchCancel}
              onClickCapture={(e) => {
                if (hadMovedRef.current) {
                  e.preventDefault()
                  e.stopPropagation()
                }
              }}
            >
              <div
                className={`flex w-full items-start ${
                  isDragging ? '' : 'transition-transform duration-300 ease-out'
                }`}
                style={{
                  transform: mobileTransform,
                }}
              >
                {availableTabs.map((tab, idx) => {
                  const isCurrent = idx === activeIndex
                  const shouldCollapse = !isAnimating && !isCurrent
                  return (
                    <div
                      key={tab.id}
                      id={`tabpanel-${tab.id}`}
                      role="tabpanel"
                      aria-labelledby={`tab-${tab.id}`}
                      className={`w-full shrink-0 transition-opacity duration-200 ${
                        shouldCollapse ? 'h-0 overflow-hidden opacity-0' : 'h-auto opacity-100'
                      }`}
                    >
                      {renderTabContent(tab.id)}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Десктопный вид: 3 колонки рядом */}
        <div className="mb-6 hidden items-stretch gap-4 lg:grid lg:grid-cols-3 lg:gap-5 xl:gap-6">
          {showCoursingColumn ? (
            <CoursingColumn
              hasCoursingData={hasCoursingData}
              hasCourseMedals={hasCourseMedals}
              coursing={coursing}
              coursingEvents={coursingEvents}
              visibleCoursingEvents={visibleCoursingEvents}
              eventResultsUrls={eventResultsUrls}
              bestScoreEventId={bestScoreEventId}
              bestJudgeScoreEventId={bestJudgeScoreEventId}
              avgJudgeScoreEventId={avgJudgeScoreEventId}
              showAllCoursingEvents={showAllCoursingEvents}
              onToggleShowAll={() => setShowAllCoursingEvents((v) => !v)}
              rank={headerRanks.find((r) => r.key === 'coursing')}
                      breed={headerBreed}
            />
          ) : (
            <EmptyDisciplineColumn title="Курсинг / БЗМП" theme="forest" />
          )}

          {showRacingColumn ? (
            <RacingColumn
              hasRacingData={hasRacingData}
              hasRacingMedals={hasRacingMedals}
              racing={racing}
              racingEvents={racingEvents}
              visibleRacingEvents={visibleRacingEvents}
              eventResultsUrls={eventResultsUrls}
              bestSpeedEventId={bestSpeedEventId}
              avgSpeedEventId={avgSpeedEventId}
              showAllRacingEvents={showAllRacingEvents}
              onToggleShowAll={() => setShowAllRacingEvents((v) => !v)}
              rank={headerRanks.find((r) => r.key === 'racing')}
                    breed={headerBreed}
            />
          ) : (
            <EmptyDisciplineColumn title="Бега борзых" theme="warm-blue" />
          )}

          {showDog ? (
            <ShowsColumn
              dog={showDog}
              rank={headerRanks.find((r) => r.key === 'shows')}
                    breed={headerBreed}
            />
          ) : (
            <EmptyDisciplineColumn title="Выставки" theme="camel" />
          )}
        </div>

        {/* Десктопная секция судей */}
        {judgeStats && (
          <div className="hidden md:block">
            <DogJudgesSection judgeStats={judgeStats} competitions={events} />
          </div>
        )}

        {/* Десктопное Донино: CollapsibleSection внизу */}
        {(hasSpeedRecords || hasCoursingRecords) && !showCoursingColumn && !showRacingColumn && (
          <div className="hidden md:block">
            <CollapsibleSection
              title="Рекорды Донино"
              defaultOpen={false}
              className="mb-6"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                {hasSpeedRecords && speedStats ? (
                  <DoninoSpeedColumn
                    speedStats={speedStats}
                    visibleSpeedHistory={visibleSpeedHistory}
                    showAllSpeedHistory={showAllSpeedHistory}
                    onToggleShowAll={() => setShowAllSpeedHistory((v) => !v)}
                  />
                ) : (
                  <EmptyDisciplineColumn title="Замер скорости" theme="warm-blue" />
                )}

                {hasCoursingRecords && coursingStats ? (
                  <DoninoCoursingColumn
                    coursingStats={coursingStats}
                    visibleCoursingDoninoHistory={visibleCoursingDoninoHistory}
                    showAllCoursingDoninoHistory={showAllCoursingDoninoHistory}
                    onToggleShowAll={() => setShowAllCoursingDoninoHistory((v) => !v)}
                  />
                ) : (
                  <EmptyDisciplineColumn title="Бега борзых (350 м)" theme="forest" />
                )}
              </div>
            </CollapsibleSection>
          </div>
        )}

        {/* Footnote about sports data completeness (About page footer style) */}
        <footer className="mt-8 rounded-xl border border-old-money-100 bg-cream-50/30 p-3 text-center sm:text-left">
          <p className="text-[11px] sm:text-xs leading-relaxed text-charcoal-500">
            <strong>Примечание:</strong> спортивная статистика и результаты состязаний систематизированы на основе официальных протоколов организаторов, полевых секретариатов и материалов ProCoursing.ru. Сведения могут содержать ошибки или быть неполными из-за фрагментарности открытых источников и ручного ведения ранних баз организаторами.
          </p>
        </footer>
      </div>
    </>
  )
}
