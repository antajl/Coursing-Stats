import { useState, useRef, useMemo, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, Download, ExternalLink } from 'lucide-react'
import { useDogProfile, useDogEvents, useDogSpeedRecords, useSpeedRecordsByBreed, useDogCoursingRecords, useCoursingRecordsByBreed } from '../hooks/useStaticData'
import { formatRecordDate, dedupeByRecordDate, expandCoursingTimeline } from '../lib/recordDates'
import { formatTitleLine, parseQualificationTitles, titleBadgeClass, type DogTitle } from '../lib/qualificationTitles'
import { parseDogName } from '../lib/dogName'
import { toPng } from 'html-to-image'
import SkeletonLoader from '../components/SkeletonLoader'
import ErrorState from '../components/ErrorState'
import OwnerCrownName from '../components/OwnerCrownName'
import MedalTally from '../components/MedalTally'
import { SEO } from '../components/SEO'
import { useYandexGoal } from '../components/YandexMetrica'
import ProcoursingEventLink from '../components/ProcoursingEventLink'
import ProcoursingAttribution from '../components/ProcoursingAttribution'
import { buildEventResultsUrlMap, procoursingUrlForEventId } from '../lib/procoursingLinks'

function EventQualificationChips({ qualification }: { qualification?: string | null }) {
  const titles = parseQualificationTitles(qualification)
  if (titles.length === 0) return null

  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {titles.map((title) => (
        <span
          key={title}
          className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap ${titleBadgeClass(title)}`}
        >
          {title}
        </span>
      ))}
    </div>
  )
}

export default function DogProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [exporting, setExporting] = useState(false)
  const [showAllSpeedHistory, setShowAllSpeedHistory] = useState(false)
  const [showAllCoursingDoninoHistory, setShowAllCoursingDoninoHistory] = useState(false)
  const [showAllCoursingEvents, setShowAllCoursingEvents] = useState(false)
  const [showAllRacingEvents, setShowAllRacingEvents] = useState(false)

  const HISTORY_DEFAULT = 5

  const exportRef = useRef(null)
  const { reachGoal } = useYandexGoal()

  // Определяем источник навигации
  const fromSpeedRecords = location.state?.from === 'speed-records'
  const fromCoursingRecords = location.state?.from === 'coursing-records'

  // React Query hooks
  const { data: dogDataResult, isLoading: loading } = useDogProfile(id)
  const { data: eventsData, isLoading: eventsLoading } = useDogEvents(id)
  const { data: speedRecordsData } = useDogSpeedRecords(id)
  const { data: coursingRecordsData } = useDogCoursingRecords(id)

  const dog = dogDataResult?.success ? dogDataResult.data : null
  const events = eventsData?.success ? (Array.isArray(eventsData.data) ? eventsData.data : []) : []
  const eventResultsUrls = useMemo(() => buildEventResultsUrlMap(events), [events])
  const speedRecords = speedRecordsData?.success ? (Array.isArray(speedRecordsData.data) ? speedRecordsData.data : []) : []
  const coursingRecords = coursingRecordsData?.success ? (Array.isArray(coursingRecordsData.data) ? coursingRecordsData.data : []) : []
  
  const { data: breedRecordsData } = useSpeedRecordsByBreed(dog?.breed || '')
  const breedRecords = breedRecordsData?.success ? (Array.isArray(breedRecordsData.data) ? breedRecordsData.data : []) : []
  
  const { data: breedCoursingRecordsData } = useCoursingRecordsByBreed(dog?.breed || '')
  const breedCoursingRecords = breedCoursingRecordsData?.success ? (Array.isArray(breedCoursingRecordsData.data) ? breedCoursingRecordsData.data : []) : []

  // Отслеживание просмотра профиля собаки
  useEffect(() => {
    if (dog) {
      reachGoal('dog_profile_view')
    }
  }, [dog, reachGoal])

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
      link.download = `${dog?.name_lat?.replace(/\s+/g, '_') || 'dog'}_profile.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <SkeletonLoader variant="card" count={3} />
        </div>
      </div>
    )
  }

  if (!dog) {
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

  const coursing = dog.coursing_stats || {}
  const racing = dog.racing_stats || {}
  const titles: DogTitle[] = Array.isArray(dog.titles) ? dog.titles : []
  const hasCoursingData = coursing.total_starts > 0
  const hasRacingData = racing.total_starts > 0
  const hasCourseMedals = (coursing.gold || 0) > 0 || (coursing.silver || 0) > 0 || (coursing.bronze || 0) > 0
  const hasRacingMedals = (racing.gold || 0) > 0 || (racing.silver || 0) > 0 || (racing.bronze || 0) > 0
  const coursingEvents = events.filter(e => e.event_type === 'coursing' || e.event_type === 'bzmp')
  const racingEvents = events.filter(e => e.event_type === 'racing')
  const showCoursingColumn = hasCoursingData || coursingEvents.length > 0
  const showRacingColumn = hasRacingData || racingEvents.length > 0

  // Статистика Донино
  const hasSpeedRecords = speedRecords.length > 0
  const speedStats = hasSpeedRecords ? (() => {
    const bestSpeed = Math.max(...speedRecords.map(r => parseFloat(r.speed_km_h)))
    const avgSpeed = speedRecords.reduce((sum, r) => sum + parseFloat(r.speed_km_h), 0) / speedRecords.length
    const history = dedupeByRecordDate(
      speedRecords.map(r => ({
        speed_km_h: parseFloat(r.speed_km_h),
        date: r.date
      })),
      (candidate, existing) => candidate.speed_km_h > existing.speed_km_h
    )
    
    // Находим лучший результат и его скриншот
    const bestRecord = speedRecords.find(r => parseFloat(r.speed_km_h) === bestSpeed);
    const screenshotUrl = bestRecord?.screenshot_url || null;
    
    // Рассчитываем рейтинг в породе
    let breedRank = 0;
    let breedTotal = 0;
    let percentile = 0;
    
    if (breedRecords.length > 0) {
      // Группируем по собакам и находим лучший результат для каждой
      const dogBestSpeeds = new Map();
      breedRecords.forEach(r => {
        const key = `${r.name}_${r.breed}`;
        const currentBest = dogBestSpeeds.get(key);
        const speed = parseFloat(r.speed_km_h);
        if (!currentBest || speed > currentBest) {
          dogBestSpeeds.set(key, speed);
        }
      });
      
      // Сортируем по скорости
      const sortedSpeeds = Array.from(dogBestSpeeds.values()).sort((a, b) => b - a);
      breedTotal = sortedSpeeds.length;
      
      // Находим позицию текущей собаки
      const rank = sortedSpeeds.findIndex(s => s === bestSpeed);
      if (rank !== -1) {
        breedRank = rank + 1;
        percentile = Math.round((rank / breedTotal) * 100);
      }
    }
    
    return { bestSpeed, avgSpeed, history, screenshotUrl, breedRank, breedTotal, percentile };
  })() : null

  // Статистика бегов борзых
  const hasCoursingRecords = coursingRecords.length > 0
  const coursingStats = hasCoursingRecords ? (() => {
    const bestTime = Math.min(...coursingRecords.map(r => parseFloat(r.time_seconds)))
    const avgTime = coursingRecords.reduce((sum, r) => sum + parseFloat(r.time_seconds), 0) / coursingRecords.length
    const history = expandCoursingTimeline(
      coursingRecords.map((r) => ({
        time_seconds: r.time_seconds,
        date: r.date,
        history: r.history,
      }))
    )
    
    // Рассчитываем рейтинг в породе
    let breedRank = 0;
    let breedTotal = 0;
    let percentile = 0;
    
    if (breedCoursingRecords.length > 0) {
      // Группируем по собакам и находим лучший результат для каждой
      const dogBestTimes = new Map();
      breedCoursingRecords.forEach(r => {
        const key = `${r.name}_${r.breed}`;
        const currentBest = dogBestTimes.get(key);
        const time = parseFloat(r.time_seconds);
        if (!currentBest || time < currentBest) {
          dogBestTimes.set(key, time);
        }
      });
      
      // Сортируем по времени (меньшее время = лучший результат)
      const sortedTimes = Array.from(dogBestTimes.values()).sort((a, b) => a - b);
      breedTotal = sortedTimes.length;
      
      // Находим позицию текущей собаки
      const rank = sortedTimes.findIndex(t => t === bestTime);
      if (rank !== -1) {
        breedRank = rank + 1;
        percentile = Math.round((rank / breedTotal) * 100);
      }
    }
    
    return { bestTime, avgTime, history, breedRank, breedTotal, percentile };
  })() : null

  const showRuName = dog.name_ru && dog.name_ru !== dog.name_lat

  const formatScore = (v) =>
    v !== undefined && v !== null ? parseFloat(v).toFixed(2) : '—'

  const bestScoreEventId = coursing.best_score_event_id || null
  const bestJudgeScoreEventId = coursing.best_judge_score_event_id || null
  const avgJudgeScoreEventId = coursing.avg_judge_score_event_id || null
  const bestSpeedEventId = racing.best_speed_event_id || null
  const avgSpeedEventId = racing.avg_speed_event_id || null

  // SEO данные
  const dogName = dog.name_lat || dog.name_ru || 'Собака'
  const dogBreed = dog.breed || ''
  const dogTitles = titles.map(t => t.title).join(', ')
  const description = `Статистика собаки ${dogName} (${dogBreed}) по курсингу и бегам борзых. Результаты, достижения, титулы: ${dogTitles}. Количество стартов: ${coursing.total_starts + racing.total_starts}.`
  const keywords = `${dogName}, ${dogBreed}, курсинг, бега борзых, статистика, ${dogTitles}, РКФ, соревнования, результаты`

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

  return (
    <>
      <SEO
        title={`${dogName} - ${dogBreed}`}
        description={description}
        keywords={keywords}
      />
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div ref={exportRef}>

        {/* Кнопка назад */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-old-money-500 transition-colors hover:text-camel-700 dark:text-old-money-400 dark:hover:text-camel-400"
          aria-label="Назад"
          data-export-ignore
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Назад
        </button>

        {/* Шапка профиля */}
        <div className="mb-6 rounded-xl border border-old-money-200/80 bg-white p-5 dark:border-charcoal-600 dark:bg-charcoal-800/50 md:p-8">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                {(() => {
                  const { primary, secondary } = parseDogName(dog.name_lat, dog.name_ru)

                  return (
                    <>
                      <OwnerCrownName name={primary} dogId={dog.id} kind="competition">
                        <h1 className="text-2xl font-bold tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-3xl">
                          {primary}
                        </h1>
                      </OwnerCrownName>
                      {dog.sex && (
                        <span className="text-lg font-medium text-charcoal-400 dark:text-charcoal-500">
                          {dog.sex === 'M' ? '♂' : '♀'}
                        </span>
                      )}
                    </>
                  )
                })()}
              </div>
              {(() => {
                const { secondary } = parseDogName(dog.name_lat, dog.name_ru)

                if (secondary) {
                  return (
                    <div className="mt-1 text-base font-medium text-charcoal-400 dark:text-charcoal-500">
                      {secondary}
                    </div>
                  )
                }

                if (showRuName) {
                  return (
                    <div className="mt-1 text-base font-medium text-old-money-500 dark:text-old-money-400">
                      {dog.name_ru}
                    </div>
                  )
                }

                return null
              })()}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="inline-block rounded-full border border-old-money-200 bg-cream-100 px-4 py-1.5 text-sm font-semibold text-charcoal-700 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-charcoal-300">
                  {dog.breed}
                </span>
                {dog.pedigree_url && (
                  <a
                    href={dog.pedigree_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-old-money-200 bg-white px-3 py-1.5 text-xs font-semibold text-camel-700 transition-colors hover:border-camel-400 hover:bg-camel-50 dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-camel-400 dark:hover:border-camel-600 dark:hover:bg-charcoal-700"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Breed Archive
                  </a>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-camel-300 bg-white text-camel-700 shadow-sm transition-colors hover:border-camel-400 hover:bg-camel-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-camel-600 dark:bg-charcoal-800 dark:text-camel-300 dark:hover:bg-charcoal-700"
              aria-label={exporting ? 'Экспорт…' : 'Скачать карточку'}
              title={exporting ? 'Экспорт…' : 'Скачать карточку'}
              data-export-ignore
            >
              <Download className="h-4 w-4" aria-hidden />
            </button>
          </div>

          {titles.length > 0 && (
            <div className="mt-4 border-t border-old-money-100 pt-4 dark:border-charcoal-600">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
                Титулы
              </div>
              <div className="flex flex-wrap gap-1.5">
                {titles.map((item) => (
                  <span
                    key={item.title}
                    className={`inline-flex rounded px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${titleBadgeClass(item.title)}`}
                  >
                    {formatTitleLine(item)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {dog.owner && (
            <div className="mt-4 border-t border-old-money-100 pt-4 text-sm text-old-money-700 dark:border-charcoal-600 dark:text-old-money-300">
              <span className="font-semibold text-old-money-800 dark:text-old-money-200">Владелец:</span> {dog.owner}
            </div>
          )}
          </div>
        </div>

        {/* Статистика и история по дисциплинам */}
        {(showCoursingColumn || showRacingColumn) && (
          <div className={`mb-6 grid gap-4 md:gap-6 ${showCoursingColumn && showRacingColumn ? 'grid-cols-1 items-start md:grid-cols-2' : 'grid-cols-1'}`}>
            {showCoursingColumn && (
              <div className="flex flex-col gap-4">
                {hasCoursingData && (
                  <div className="rounded-xl border border-forest-200 dark:border-forest-700 bg-white dark:bg-charcoal-800 p-5 md:p-6">
                    <h2 className="text-lg md:text-xl font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 mb-4">Курсинг / БЗМП</h2>

                    {bestScoreEventId ? (
                      <ProcoursingEventLink
                        eventId={bestScoreEventId}
                        procoursingUrl={procoursingUrlForEventId(eventResultsUrls, bestScoreEventId)}
                        className="group mb-4 block rounded-xl border-2 border-forest-200 dark:border-forest-600 bg-forest-50 dark:bg-charcoal-700 p-4 text-center transition-colors hover:bg-forest-100 dark:hover:bg-charcoal-600"
                      >
                        <div className="text-xs font-semibold text-charcoal-500 dark:text-charcoal-400 mb-2 uppercase tracking-wide">Лучший результат</div>
                        <div className="text-4xl font-bold tracking-tight text-forest-700 dark:text-forest-300 group-hover:text-forest-800 dark:group-hover:text-forest-200">
                          {coursing.best_score ?? '—'}
                        </div>
                        <div className="mt-2 text-sm text-forest-600 dark:text-forest-500 opacity-0 transition-opacity group-hover:opacity-100 font-medium">
                          открыть результаты →
                        </div>
                      </ProcoursingEventLink>
                    ) : (
                      <div className="mb-4 rounded-xl border-2 border-forest-200 dark:border-forest-600 bg-forest-50 dark:bg-charcoal-700 p-4 text-center">
                        <div className="text-xs font-semibold text-charcoal-500 dark:text-charcoal-400 mb-2 uppercase tracking-wide">Лучший результат</div>
                        <div className="text-4xl font-bold tracking-tight text-forest-700 dark:text-forest-300">
                          {coursing.best_score ?? '—'}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {bestJudgeScoreEventId ? (
                        <ProcoursingEventLink
                          eventId={bestJudgeScoreEventId}
                          procoursingUrl={procoursingUrlForEventId(eventResultsUrls, bestJudgeScoreEventId)}
                          className="group bg-forest-50 dark:bg-charcoal-700 rounded-xl p-4 text-center border border-forest-200 dark:border-forest-600 hover:bg-forest-100 dark:hover:bg-charcoal-600 transition-colors"
                        >
                          <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Лучшая оценка</div>
                          <div className="text-2xl font-bold text-charcoal-800 dark:text-charcoal-100 group-hover:text-forest-700 dark:group-hover:text-forest-300">{formatScore(coursing.best_judge_score)}</div>
                        </ProcoursingEventLink>
                      ) : (
                        <div className="bg-forest-50 dark:bg-charcoal-700 rounded-xl p-4 text-center border border-forest-200 dark:border-forest-600">
                          <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Лучшая оценка</div>
                          <div className="text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">{formatScore(coursing.best_judge_score)}</div>
                        </div>
                      )}
                      {avgJudgeScoreEventId ? (
                        <ProcoursingEventLink
                          eventId={avgJudgeScoreEventId}
                          procoursingUrl={procoursingUrlForEventId(eventResultsUrls, avgJudgeScoreEventId)}
                          className="group bg-forest-50 dark:bg-charcoal-700 rounded-xl p-4 text-center border border-forest-200 dark:border-forest-600 hover:bg-forest-100 dark:hover:bg-charcoal-600 transition-colors"
                        >
                          <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Средняя оценка</div>
                          <div className="text-2xl font-bold text-charcoal-800 dark:text-charcoal-100 group-hover:text-forest-700 dark:group-hover:text-forest-300">{formatScore(coursing.avg_judge_score)}</div>
                        </ProcoursingEventLink>
                      ) : (
                        <div className="bg-forest-50 dark:bg-charcoal-700 rounded-xl p-4 text-center border border-forest-200 dark:border-forest-600">
                          <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Средняя оценка</div>
                          <div className="text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">{formatScore(coursing.avg_judge_score)}</div>
                        </div>
                      )}
                    </div>

                    {hasCourseMedals && (
                      <div className="flex justify-center py-1">
                        <MedalTally
                          gold={coursing.gold}
                          silver={coursing.silver}
                          bronze={coursing.bronze}
                          size="xl"
                          showZero
                        />
                      </div>
                    )}
                  </div>
                )}

                {coursingEvents.length > 0 && (
                  <div className="rounded-xl border border-forest-200 dark:border-forest-700 bg-white dark:bg-charcoal-800 p-5 md:p-6">
                    <h3 className="text-base md:text-lg font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 mb-4">История</h3>
                    <div className="space-y-3">
                      {visibleCoursingEvents.map((event, idx) => {
                        const cardClass =
                          'block rounded-xl border border-forest-200 bg-forest-50 p-3 transition-colors hover:bg-forest-100 dark:border-forest-600 dark:bg-charcoal-700 dark:hover:bg-charcoal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-camel-500'
                        const cardBody = (
                          <>
                            <div className="flex items-center justify-between gap-2">
                              {event.competition_kind ? (
                                <div className="text-xs font-bold uppercase tracking-wide text-forest-700 dark:text-forest-400">
                                  {event.competition_kind}
                                </div>
                              ) : (
                                <span />
                              )}
                              <div className="shrink-0 rounded-full border border-old-money-200 bg-white px-2 py-0.5 text-xs font-medium text-charcoal-600 dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-300">
                                {event.event_type === 'coursing' ? 'Курсинг' : 'БЗМП'}
                              </div>
                            </div>
                            <div className="mt-1 flex items-center justify-between gap-3">
                              <div className="font-semibold text-charcoal-800 dark:text-charcoal-100">
                                {event.date_start
                                  ? (() => {
                                      const [year, month, day] = event.date_start.split('-')
                                      return `${day}.${month}.${year}`
                                    })()
                                  : '—'}
                              </div>
                              <div className="flex shrink-0 items-baseline gap-2 text-right">
                                {event.placement && (
                                  <span className="text-base font-bold text-forest-700 dark:text-forest-400">
                                    #{event.placement}
                                  </span>
                                )}
                                {event.total_score && (
                                  <span className="text-sm font-medium text-old-money-600 dark:text-old-money-400">
                                    {event.total_score} баллов
                                  </span>
                                )}
                              </div>
                            </div>
                            <EventQualificationChips qualification={event.qualification as string | null | undefined} />
                          </>
                        )
                        return event.event_id ? (
                          <ProcoursingEventLink
                            key={idx}
                            eventId={event.event_id}
                            procoursingUrl={procoursingUrlForEventId(eventResultsUrls, event.event_id)}
                            className={`${cardClass} text-inherit no-underline`}
                          >
                            {cardBody}
                          </ProcoursingEventLink>
                        ) : (
                          <div key={idx} className={cardClass}>
                            {cardBody}
                          </div>
                        )
                      })}
                      {coursingEvents.length > HISTORY_DEFAULT && (
                        <button
                          type="button"
                          onClick={() => setShowAllCoursingEvents((v) => !v)}
                          className="text-sm font-semibold text-camel-700 dark:text-camel-400"
                        >
                          {showAllCoursingEvents
                            ? 'Свернуть'
                            : `Показать все ${coursingEvents.length} стартов`}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {showRacingColumn && (
              <div className="flex flex-col gap-4">
                {hasRacingData && (
                  <div className="rounded-xl border border-warm-blue-200 dark:border-warm-blue-700 bg-white dark:bg-charcoal-800 p-5 md:p-6">
                    <h2 className="mb-4 text-lg font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 md:text-xl">Бега борзых</h2>

                    {bestSpeedEventId ? (
                      <ProcoursingEventLink
                        eventId={bestSpeedEventId}
                        procoursingUrl={procoursingUrlForEventId(eventResultsUrls, bestSpeedEventId)}
                        className="group mb-4 block rounded-xl border-2 border-warm-blue-200 dark:border-warm-blue-600 bg-warm-blue-50 dark:bg-charcoal-700 p-4 text-center transition-colors hover:bg-warm-blue-100 dark:hover:bg-charcoal-600"
                      >
                        <div className="text-xs font-semibold text-charcoal-500 dark:text-charcoal-400 mb-2 uppercase tracking-wide">Лучшая скорость</div>
                        <div className="whitespace-nowrap text-4xl font-bold tracking-tight text-warm-blue-800 dark:text-warm-blue-400 group-hover:text-warm-blue-900 dark:group-hover:text-warm-blue-300">
                          {racing.best_speed ?? '—'}
                          {racing.best_speed && <span className="text-base font-normal text-charcoal-400 dark:text-charcoal-500 ml-2">км/ч</span>}
                        </div>
                        <div className="mt-2 text-sm text-warm-blue-600 opacity-0 transition-opacity group-hover:opacity-100 font-medium">
                          открыть результаты →
                        </div>
                      </ProcoursingEventLink>
                    ) : (
                      <div className="mb-4 rounded-xl border-2 border-warm-blue-200 dark:border-warm-blue-600 bg-warm-blue-50 dark:bg-charcoal-700 p-4 text-center">
                        <div className="text-xs font-semibold text-charcoal-500 dark:text-charcoal-400 mb-2 uppercase tracking-wide">Лучшая скорость</div>
                        <div className="whitespace-nowrap text-4xl font-bold tracking-tight text-warm-blue-800 dark:text-warm-blue-400">
                          {racing.best_speed ?? '—'}
                          {racing.best_speed && <span className="text-base font-normal text-charcoal-400 dark:text-charcoal-500 ml-2">км/ч</span>}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="rounded-xl bg-warm-blue-50 dark:bg-charcoal-700 p-4 text-center border border-warm-blue-200 dark:border-warm-blue-600">
                        <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Участий</div>
                        <div className="text-2xl font-bold text-warm-blue-900 dark:text-warm-blue-400">{racing.total_starts}</div>
                      </div>
                      {avgSpeedEventId ? (
                        <ProcoursingEventLink
                          eventId={avgSpeedEventId}
                          procoursingUrl={procoursingUrlForEventId(eventResultsUrls, avgSpeedEventId)}
                          className="group rounded-xl bg-warm-blue-50 dark:bg-charcoal-700 p-4 text-center border border-warm-blue-200 dark:border-warm-blue-600 hover:bg-warm-blue-100 dark:hover:bg-charcoal-600 transition-colors"
                        >
                          <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Средняя</div>
                          <div className="whitespace-nowrap text-2xl font-bold text-warm-blue-900 dark:text-warm-blue-400 group-hover:text-warm-blue-800 dark:group-hover:text-warm-blue-300">
                            {racing.avg_speed
                              ? <>{racing.avg_speed}<span className="text-sm font-normal text-charcoal-400 dark:text-charcoal-500 ml-1">км/ч</span></>
                              : '—'
                            }
                          </div>
                        </ProcoursingEventLink>
                      ) : (
                        <div className="rounded-xl bg-warm-blue-50 dark:bg-charcoal-700 p-4 text-center border border-warm-blue-200 dark:border-warm-blue-600">
                          <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Средняя</div>
                          <div className="whitespace-nowrap text-2xl font-bold text-warm-blue-900 dark:text-warm-blue-400">
                            {racing.avg_speed
                              ? <>{racing.avg_speed}<span className="text-sm font-normal text-charcoal-400 dark:text-charcoal-500 ml-1">км/ч</span></>
                              : '—'
                            }
                          </div>
                        </div>
                      )}
                    </div>

                    {hasRacingMedals && (
                      <div className="flex justify-center py-1">
                        <MedalTally
                          gold={racing.gold}
                          silver={racing.silver}
                          bronze={racing.bronze}
                          size="xl"
                          showZero
                        />
                      </div>
                    )}
                  </div>
                )}

                {racingEvents.length > 0 && (
                  <div className="rounded-xl border border-warm-blue-200 dark:border-warm-blue-700 bg-white dark:bg-charcoal-800 p-5 md:p-6">
                    <h3 className="text-base md:text-lg font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 mb-4">История</h3>
                    <div className="space-y-3">
                      {visibleRacingEvents.map((event, idx) => {
                        const cardClass =
                          'block rounded-xl border border-warm-blue-200 bg-warm-blue-50 p-3 transition-colors hover:bg-warm-blue-100 dark:border-warm-blue-600 dark:bg-charcoal-700 dark:hover:bg-charcoal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-camel-500'
                        const cardBody = (
                          <>
                            <div className="flex items-center justify-between gap-2">
                              {event.competition_kind ? (
                                <div className="text-xs font-bold uppercase tracking-wide text-warm-blue-700 dark:text-warm-blue-400">
                                  {event.competition_kind}
                                </div>
                              ) : (
                                <span />
                              )}
                              <div className="shrink-0 rounded-full border border-old-money-200 bg-white px-2 py-0.5 text-xs font-medium text-charcoal-600 dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-300">
                                Бега борзых
                              </div>
                            </div>
                            <div className="mt-1 flex items-center justify-between gap-3">
                              <div className="font-semibold text-charcoal-800 dark:text-charcoal-100">
                                {event.date_start
                                  ? (() => {
                                      const [year, month, day] = event.date_start.split('-')
                                      return `${day}.${month}.${year}`
                                    })()
                                  : '—'}
                              </div>
                              {event.placement && (
                                <span className="shrink-0 text-base font-bold text-warm-blue-700 dark:text-warm-blue-400">
                                  #{event.placement}
                                </span>
                              )}
                            </div>
                            <EventQualificationChips qualification={event.qualification as string | null | undefined} />
                          </>
                        )
                        return event.event_id ? (
                          <ProcoursingEventLink
                            key={idx}
                            eventId={event.event_id}
                            procoursingUrl={procoursingUrlForEventId(eventResultsUrls, event.event_id)}
                            className={`${cardClass} text-inherit no-underline`}
                          >
                            {cardBody}
                          </ProcoursingEventLink>
                        ) : (
                          <div key={idx} className={cardClass}>
                            {cardBody}
                          </div>
                        )
                      })}
                      {racingEvents.length > HISTORY_DEFAULT && (
                        <button
                          type="button"
                          onClick={() => setShowAllRacingEvents((v) => !v)}
                          className="text-sm font-semibold text-camel-700 dark:text-camel-400"
                        >
                          {showAllRacingEvents
                            ? 'Свернуть'
                            : `Показать все ${racingEvents.length} стартов`}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Статистика Донино и Бега борзых */}
        {(hasSpeedRecords || hasCoursingRecords) && (
          <div className={`mb-6 grid gap-4 md:gap-6 ${hasSpeedRecords && hasCoursingRecords ? 'grid-cols-1 items-start md:grid-cols-2' : 'grid-cols-1'}`}>
            {hasSpeedRecords && (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-warm-blue-200 dark:border-warm-blue-700 bg-white dark:bg-charcoal-800 p-5 md:p-6">
                  <h2 className="mb-4 text-lg font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 md:text-xl">Замер скорости</h2>

                  <div className="mb-4 rounded-xl border-2 border-warm-blue-200 dark:border-warm-blue-600 bg-warm-blue-50 dark:bg-charcoal-700 p-4 text-center">
                    <div className="text-xs font-semibold text-charcoal-500 dark:text-charcoal-400 mb-2 uppercase tracking-wide">Лучшая скорость</div>
                    <div className="whitespace-nowrap text-4xl font-bold tracking-tight text-warm-blue-800 dark:text-warm-blue-400">
                      {speedStats.bestSpeed}
                      <span className="text-base font-normal text-charcoal-400 dark:text-charcoal-500 ml-2">км/ч</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl bg-warm-blue-50 dark:bg-charcoal-700 p-4 text-center border border-warm-blue-200 dark:border-warm-blue-600">
                      <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Средняя</div>
                      <div className="whitespace-nowrap text-2xl font-bold text-warm-blue-900 dark:text-warm-blue-400">
                        {speedStats.avgSpeed.toFixed(1)}
                        <span className="text-sm font-normal text-charcoal-400 dark:text-charcoal-500 ml-1">км/ч</span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-warm-blue-50 dark:bg-charcoal-700 p-4 text-center border border-warm-blue-200 dark:border-warm-blue-600">
                      <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Замеров</div>
                      <div className="text-2xl font-bold text-warm-blue-900 dark:text-warm-blue-400">{speedStats.history.length}</div>
                    </div>
                    {speedStats.breedRank > 0 && (
                      <div className="col-span-2 rounded-xl bg-warm-blue-50 dark:bg-charcoal-700 p-4 text-center border border-warm-blue-200 dark:border-warm-blue-600">
                        <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Рейтинг в породе</div>
                        <div className="text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">
                          #{speedStats.breedRank}
                          <span className="text-sm font-normal text-charcoal-400 dark:text-charcoal-500 ml-1">из {speedStats.breedTotal}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {speedStats.screenshotUrl && (
                    <a
                      href={speedStats.screenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-warm-blue-700 dark:text-warm-blue-400 hover:text-warm-blue-800 dark:hover:text-warm-blue-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Скриншот лучшего результата
                    </a>
                  )}
                </div>

                {speedStats.history.length > 0 && (
                  <div className="rounded-xl border border-warm-blue-200 dark:border-warm-blue-700 bg-white dark:bg-charcoal-800 p-5 md:p-6">
                    <h3 className="text-base md:text-lg font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 mb-4">История</h3>
                    <div className="space-y-2">
                      {visibleSpeedHistory.map((record, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="w-24 text-sm text-charcoal-700 dark:text-charcoal-300 text-right shrink-0">{formatRecordDate(record.date)}</div>
                          <div className="flex-1 bg-cream-200 dark:bg-charcoal-600 rounded-full h-6 overflow-hidden relative">
                            <div
                              className="bg-gradient-to-r from-warm-blue-400 to-warm-blue-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${(Number(record.speed_km_h) / 80) * 100}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-charcoal-900 dark:text-charcoal-100">
                              {Number(record.speed_km_h)} км/ч
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {speedStats.history.length > HISTORY_DEFAULT && (
                      <button
                        type="button"
                        onClick={() => setShowAllSpeedHistory((v) => !v)}
                        className="mt-3 text-sm font-semibold text-camel-700 dark:text-camel-400"
                      >
                        {showAllSpeedHistory
                          ? 'Свернуть'
                          : `Показать все ${speedStats.history.length} замеров`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {hasCoursingRecords && (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-forest-200 dark:border-forest-700 bg-white dark:bg-charcoal-800 p-5 md:p-6">
                  <h2 className="text-lg md:text-xl font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 mb-4">Бега борзых (350 м)</h2>

                  <div className="mb-4 rounded-xl border-2 border-forest-200 dark:border-forest-600 bg-forest-50 dark:bg-charcoal-700 p-4 text-center">
                    <div className="text-xs font-semibold text-charcoal-500 dark:text-charcoal-400 mb-2 uppercase tracking-wide">Лучшее время</div>
                    <div className="whitespace-nowrap text-4xl font-bold tracking-tight text-forest-700 dark:text-forest-300">
                      {coursingStats.bestTime}
                      <span className="text-base font-normal text-charcoal-400 dark:text-charcoal-500 ml-2">сек</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-forest-50 dark:bg-charcoal-700 rounded-xl p-4 text-center border border-forest-200 dark:border-forest-600">
                      <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Среднее</div>
                      <div className="whitespace-nowrap text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">
                        {coursingStats.avgTime.toFixed(2)}
                        <span className="text-sm font-normal text-charcoal-400 dark:text-charcoal-500 ml-1">сек</span>
                      </div>
                    </div>
                    <div className="bg-forest-50 dark:bg-charcoal-700 rounded-xl p-4 text-center border border-forest-200 dark:border-forest-600">
                      <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Забегов</div>
                      <div className="text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">{coursingStats.history.length}</div>
                    </div>
                    {coursingStats.breedRank > 0 && (
                      <div className="col-span-2 bg-forest-50 dark:bg-charcoal-700 rounded-xl p-4 text-center border border-forest-200 dark:border-forest-600">
                        <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Рейтинг в породе</div>
                        <div className="text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">
                          #{coursingStats.breedRank}
                          <span className="text-sm font-normal text-charcoal-400 dark:text-charcoal-500 ml-1">из {coursingStats.breedTotal}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {coursingStats.history.length > 0 && (
                  <div className="rounded-xl border border-forest-200 dark:border-forest-700 bg-white dark:bg-charcoal-800 p-5 md:p-6">
                    <h3 className="text-base md:text-lg font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 mb-4">История</h3>
                    <div className="space-y-2">
                      {visibleCoursingDoninoHistory.map((record, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="w-24 text-sm text-charcoal-700 dark:text-charcoal-300 text-right shrink-0">{formatRecordDate(record.date)}</div>
                          <div className="flex-1 bg-cream-200 dark:bg-charcoal-600 rounded-full h-6 overflow-hidden relative">
                            <div
                              className="bg-gradient-to-r from-forest-400 to-forest-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${(30 / Number(record.time_seconds)) * 100}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-charcoal-900 dark:text-charcoal-100">
                              {Number(record.time_seconds)} сек
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {coursingStats.history.length > HISTORY_DEFAULT && (
                      <button
                        type="button"
                        onClick={() => setShowAllCoursingDoninoHistory((v) => !v)}
                        className="mt-3 text-sm font-semibold text-camel-700 dark:text-camel-400"
                      >
                        {showAllCoursingDoninoHistory
                          ? 'Свернуть'
                          : `Показать все ${coursingStats.history.length} забегов`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {(showCoursingColumn || showRacingColumn) && (
          <ProcoursingAttribution className="mt-6" />
        )}
        </div>
      </div>
      </div>
    </>
  )
}