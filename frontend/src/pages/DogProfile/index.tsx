import { useState, useRef, useMemo, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import {
  useDogProfile,
  useDogEvents,
  useDogSpeedRecords,
  useSpeedRecordsByBreed,
  useDogCoursingRecords,
  useCoursingRecordsByBreed,
} from '../../hooks/useStaticData'
import { resolveShowDogDetail } from '../../lib/staticData'
import {
  isShowOnlyProfileId,
  showDogProfilePath,
} from '../../lib/showDogProfilePath'
import { mergeDogProfileTitles } from '../../lib/qualificationTitles'
import { toPng } from 'html-to-image'
import SkeletonLoader from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import { SEO } from '../../components/SEO'
import { JsonLd, breadcrumbListSchema } from '../../components/JsonLd'
import { useYandexGoal } from '../../components/YandexMetrica'
import { buildEventResultsUrlMap } from '../../lib/procoursingLinks'
import type { ShowDogCardData } from '../Shows/ShowDogCard'
import { DogProfileHeader } from './DogProfileHeader'
import { CoursingColumn } from './CoursingColumn'
import { RacingColumn } from './RacingColumn'
import { ShowsColumn } from './ShowsColumn'
import { EmptyDisciplineColumn } from './EmptyDisciplineColumn'
import { DoninoSpeedColumn } from './DoninoSpeedColumn'
import { DoninoCoursingColumn } from './DoninoCoursingColumn'
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

  const exportRef = useRef(null)
  const { reachGoal } = useYandexGoal()

  const fromSpeedRecords = location.state?.from === 'speed-records'
  const fromCoursingRecords = location.state?.from === 'coursing-records'

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
  const { data: breedRecordsData } = useSpeedRecordsByBreed(dog?.breed || '')
  const breedRecords = breedRecordsData?.success
    ? Array.isArray(breedRecordsData.data)
      ? breedRecordsData.data
      : []
    : []

  const { data: breedCoursingRecordsData } = useCoursingRecordsByBreed(dog?.breed || '')
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
        const result = await resolveShowDogDetail({
          profileId: profileId || (isLegacyShowRoute ? showRouteDogId : null),
          competitionId: dog?.id ?? competitionId,
          nameLat: dog?.name_lat,
          nameRu: dog?.name_ru,
          breed: dog?.breed || showRouteBreed,
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
  }, [competitionId, dog, loading, showRouteDogId, showRouteBreed, isLegacyShowRoute, profileId])

  // До любых early return — иначе нарушаются Rules of Hooks
  const titles = useMemo(
    () =>
      mergeDogProfileTitles(
        Array.isArray(dog?.titles) ? dog.titles : [],
        showDog?.titles,
      ),
    [dog?.titles, showDog?.titles],
  )

  // Linked show dog on legacy URL → canonical /dog/{competition_id}
  if (
    !showsLoading &&
    isLegacyShowRoute &&
    showDog?.competition_dog_id != null &&
    Number.isFinite(Number(showDog.competition_dog_id))
  ) {
    return <Navigate to={`/dog/${showDog.competition_dog_id}`} replace />
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
    return (
      <div className="p-4 md:p-6">
        <div className="mx-auto max-w-full">
          <SkeletonLoader variant="card" count={3} />
        </div>
      </div>
    )
  }

  if (!dog && !showDog) {
    return (
      <div className="p-4 md:p-6">
        <div className="mx-auto max-w-full">
          <ErrorState
            title="Собака не найдена"
            message={`ID: ${competitionId || showRouteDogId || '—'}`}
            action={
              <Link
                to={isLegacyShowRoute || !dog ? '/shows?tab=ranking' : '/competitions?tab=ranking'}
                className="rounded-xl border-2 border-camel-300 bg-white px-4 py-2 text-sm font-semibold text-camel-700 transition-all hover:border-camel-400 hover:bg-camel-50 dark:border-camel-600 dark:bg-charcoal-800 dark:text-camel-400 dark:hover:bg-charcoal-700"
              >
                К рейтингу
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  const headerDog = dog ?? {
    id: showDog!.competition_dog_id ?? showDog!.id,
    name_lat: showDog!.name_lat,
    name_ru: showDog!.name_ru,
    breed: showDog!.breed,
    sex: showDog!.sex,
  }

  const coursing = dog?.coursing_stats || {}
  const racing = dog?.racing_stats || {}
  const hasCoursingData = (coursing.total_starts || 0) > 0
  const hasRacingData = (racing.total_starts || 0) > 0
  const hasCourseMedals =
    (coursing.gold || 0) > 0 || (coursing.silver || 0) > 0 || (coursing.bronze || 0) > 0
  const hasRacingMedals =
    (racing.gold || 0) > 0 || (racing.silver || 0) > 0 || (racing.bronze || 0) > 0
  const coursingEvents = events.filter(
    (e) => e.event_type === 'coursing' || e.event_type === 'bzmp',
  )
  const racingEvents = events.filter((e) => e.event_type === 'racing')
  const showCoursingColumn = hasCoursingData || coursingEvents.length > 0
  const showRacingColumn = hasRacingData || racingEvents.length > 0

  const hasSpeedRecords = speedRecords.length > 0
  const speedStats = hasSpeedRecords ? computeSpeedStats(speedRecords, breedRecords) : null

  const hasCoursingRecords = coursingRecords.length > 0
  const coursingStats = hasCoursingRecords
    ? computeCoursingDoninoStats(coursingRecords, breedCoursingRecords)
    : null

  const showRuName = headerDog.name_ru && headerDog.name_ru !== headerDog.name_lat

  const bestScoreEventId = coursing.best_score_event_id || null
  const bestJudgeScoreEventId = coursing.best_judge_score_event_id || null
  const avgJudgeScoreEventId = coursing.avg_judge_score_event_id || null
  const bestSpeedEventId = racing.best_speed_event_id || null
  const avgSpeedEventId = racing.avg_speed_event_id || null

  const dogName = headerDog.name_lat || headerDog.name_ru || 'Собака'
  const dogBreed = headerDog.breed || headerBreed || ''
  const dogTitles = titles.map((t) => t.title).join(', ')

  const profilePath = dog
    ? `/dog/${dog.id}`
    : showDog
      ? showDogProfilePath(showDog)
      : competitionId
        ? `/dog/${competitionId}`
        : '/'
  const canonicalUrl = `https://coursing-stats.ru${profilePath}`

  const seoFacts: string[] = []
  if (hasCoursingData) {
    seoFacts.push(`курсинг ${coursing.total_starts || 0} стартов`)
  }
  if (hasRacingData) {
    seoFacts.push(`беги ${racing.total_starts || 0} стартов`)
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
  const description =
    seoFacts.length > 0
      ? `${dogName} (${dogBreed}): ${seoFacts.join('; ')}. Статистика на Coursing Stats.`
      : `Статистика собаки ${dogName} (${dogBreed}): курсинг, бега борзых, выставки и Донино.`
  const keywords = [dogName, dogBreed, 'курсинг', 'бега борзых', 'выставки', 'Донино', 'статистика', dogTitles, 'РКФ']
    .filter(Boolean)
    .join(', ')
  const seoTitle = dogBreed
    ? `${dogName} (${dogBreed}) — статистика курсинг, бега, выставки`
    : `${dogName} — статистика курсинг, бега, выставки`

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

  return (
    <>
      <SEO
        title={seoTitle}
        description={description}
        keywords={keywords}
        canonicalUrl={canonicalUrl}
      />
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Главная', url: '/' },
          { name: 'Рейтинг', url: '/competitions?tab=ranking' },
          { name: dogName, url: profilePath },
        ])}
      />
      <div className="p-4 md:p-6">
        <div className="mx-auto max-w-full">
          <div ref={exportRef}>
            <DogProfileHeader
              dog={headerDog}
              titles={titles}
              showRuName={!!showRuName}
              exporting={exporting}
              onBack={() => navigate(-1)}
              onExport={handleExport}
            />

            <div className="mb-6 grid grid-cols-1 items-stretch gap-4 md:grid-cols-3 md:gap-6">
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
                />
              ) : (
                <EmptyDisciplineColumn title="Бега борзых" theme="warm-blue" />
              )}

              {showDog ? (
                <ShowsColumn dog={showDog} />
              ) : (
                <EmptyDisciplineColumn title="Выставки" theme="camel" />
              )}
            </div>

            {(hasSpeedRecords || hasCoursingRecords) && (
              <div
                className={`mb-6 grid grid-cols-1 items-start gap-4 md:gap-6 ${
                  hasSpeedRecords && hasCoursingRecords ? 'md:grid-cols-2' : 'md:grid-cols-1'
                }`}
              >
                {hasSpeedRecords && speedStats && (
                  <DoninoSpeedColumn
                    speedStats={speedStats}
                    visibleSpeedHistory={visibleSpeedHistory}
                    showAllSpeedHistory={showAllSpeedHistory}
                    onToggleShowAll={() => setShowAllSpeedHistory((v) => !v)}
                  />
                )}

                {hasCoursingRecords && coursingStats && (
                  <DoninoCoursingColumn
                    coursingStats={coursingStats}
                    visibleCoursingDoninoHistory={visibleCoursingDoninoHistory}
                    showAllCoursingDoninoHistory={showAllCoursingDoninoHistory}
                    onToggleShowAll={() => setShowAllCoursingDoninoHistory((v) => !v)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
