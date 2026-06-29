import { useState, useRef } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { useDogProfile, useDogEvents, useDogSpeedRecords, useSpeedRecordsByBreed, useDogCoursingRecords, useCoursingRecordsByBreed } from '../hooks/useApi'
import { DogSilhouettes, getSilhouetteType } from '../components/DogSilhouettes'
import { toPng } from 'html-to-image'
import SkeletonLoader from '../components/SkeletonLoader'
import ErrorState from '../components/ErrorState'

export default function DogProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [exporting, setExporting] = useState(false)

  const exportRef = useRef(null)

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
  const speedRecords = speedRecordsData?.success ? (Array.isArray(speedRecordsData.data) ? speedRecordsData.data : []) : []
  const coursingRecords = coursingRecordsData?.success ? (Array.isArray(coursingRecordsData.data) ? coursingRecordsData.data : []) : []
  
  const { data: breedRecordsData } = useSpeedRecordsByBreed(dog?.breed || '')
  const breedRecords = breedRecordsData?.success ? (Array.isArray(breedRecordsData.data) ? breedRecordsData.data : []) : []
  
  const { data: breedCoursingRecordsData } = useCoursingRecordsByBreed(dog?.breed || '')
  const breedCoursingRecords = breedCoursingRecordsData?.success ? (Array.isArray(breedCoursingRecordsData.data) ? breedCoursingRecordsData.data : []) : []

  const handleExport = async () => {
    if (!exportRef.current || exporting) return
    try {
      setExporting(true)
      const dataUrl = await toPng(exportRef.current, { quality: 1, pixelRatio: 2 })
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
      <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 p-6">
        <div className="max-w-4xl mx-auto">
          <SkeletonLoader variant="card" count={3} />
        </div>
      </div>
    )
  }

  if (!dog) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 p-6">
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
  const hasCoursingData = coursing.total_starts > 0
  const hasRacingData = racing.total_starts > 0

  // Статистика Донино
  const hasSpeedRecords = speedRecords.length > 0
  const speedStats = hasSpeedRecords ? (() => {
    const bestSpeed = Math.max(...speedRecords.map(r => parseFloat(r.speed_km_h)))
    const avgSpeed = speedRecords.reduce((sum, r) => sum + parseFloat(r.speed_km_h), 0) / speedRecords.length
    const history = speedRecords.map(r => ({
      speed_km_h: parseFloat(r.speed_km_h),
      date: r.date
    })).sort((a, b) => {
      const parseDate = (d) => {
        const parts = d.split('.');
        return new Date(parts[2], parts[1] - 1, parts[0]);
      };
      return parseDate(b.date) - parseDate(a.date);
    });
    
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
    const history = coursingRecords.map(r => ({
      time_seconds: parseFloat(r.time_seconds),
      date: r.date
    })).sort((a, b) => {
      const parseDate = (d) => {
        const parts = d.split('.');
        return new Date(parts[2], parts[1] - 1, parts[0]);
      };
      return parseDate(b.date) - parseDate(a.date);
    });
    
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

  const silhouetteType = getSilhouetteType(dog?.breed)
  const showRuName = dog.name_ru && dog.name_ru !== dog.name_lat
  const hasCourseMedals = coursing.gold > 0 || coursing.silver > 0 || coursing.bronze > 0

  const formatScore = (v) =>
    v !== undefined && v !== null ? parseFloat(v).toFixed(2) : '—'

  const bestScoreUrl = coursing.best_score_event_url || null
  const bestSpeedUrl = racing.best_speed_event_url || null


  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 p-4 md:p-6">
      <DogSilhouettes />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-2">
          <button
            onClick={() => {
              if (fromSpeedRecords) {
                navigate('/speed-records')
              } else if (fromCoursingRecords) {
                navigate('/speed-records?tab=coursing')
              } else {
                navigate('/top')
              }
            }}
            className="font-medium text-camel-700 dark:text-camel-400 transition-colors hover:text-camel-800 dark:hover:text-camel-300"
          >
            <span className="md:hidden">← Назад</span>
            <span className="hidden md:inline">← {fromSpeedRecords ? 'Назад к рекордам' : fromCoursingRecords ? 'Назад к бегам борзых' : 'Назад к топу'}</span>
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="rounded-xl border-2 border-camel-300 dark:border-camel-600 bg-white dark:bg-charcoal-800 px-4 py-2 text-sm font-semibold text-camel-700 dark:text-camel-400 transition-all hover:bg-camel-50 dark:hover:bg-charcoal-700 hover:border-camel-400 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camel-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-charcoal-900"
          >
            {exporting ? 'Экспорт...' : 'Скачать карточку'}
          </button>
        </div>

        <div ref={exportRef}>

        {/* Шапка профиля */}
        <div className="mb-6 rounded-2xl border-2 border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 p-5 shadow-md md:p-8">
          <div className="flex flex-wrap items-center gap-5 md:gap-8">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-old-money-200 dark:border-charcoal-600 bg-cream-100 dark:bg-charcoal-700 md:h-24 md:w-24">
              <svg className="w-12 h-12 md:w-16 md:h-16 text-old-money-500 dark:text-old-money-400">
                <use href={`#silhouette-${silhouetteType}`} />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-3 md:gap-4 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-3xl">{dog.name_lat}</h1>
                {dog.sex && (
                  <span className="text-lg font-medium text-gray-400 dark:text-gray-500">
                    {dog.sex === 'M' ? '♂' : '♀'}
                  </span>
                )}
              </div>
              {showRuName && (
                <div className="text-base text-old-money-500 dark:text-old-money-400 mt-1 font-medium">{dog.name_ru}</div>
              )}
              <div className="mt-3">
                <span className="inline-block rounded-full bg-cream-100 dark:bg-charcoal-700 px-4 py-1.5 text-sm font-semibold text-charcoal-700 dark:text-charcoal-300 border border-old-money-200 dark:border-charcoal-600">
                  {dog.breed}
                </span>
              </div>
            </div>
          </div>

          {dog.owner && (
            <div className="mt-4 pt-4 border-t border-old-money-100 dark:border-charcoal-600 text-sm text-old-money-600 dark:text-old-money-400">
              <span className="font-semibold text-old-money-700 dark:text-old-money-300">Владелец:</span> {dog.owner}
            </div>
          )}
        </div>

        {/* Статистика по дисциплинам */}
        {(hasCoursingData || hasRacingData) && (
          <div className={`grid gap-4 md:gap-6 mb-6 ${hasCoursingData && hasRacingData ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Курсинг */}
          {hasCoursingData && (
            <div className="rounded-2xl border-2 border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 p-5 shadow-md md:p-6">
              <h2 className="text-lg md:text-xl font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 mb-4">Курсинг / БЗМП</h2>

              {bestScoreUrl ? (
                <a
                  href={bestScoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mb-4 block rounded-xl border-2 border-camel-200 dark:border-camel-600 bg-camel-50 dark:bg-charcoal-700 p-4 text-center transition-colors hover:bg-camel-100 dark:hover:bg-charcoal-600"
                >
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Лучший результат</div>
                  <div className="text-4xl font-bold tracking-tight text-camel-700 dark:text-camel-400 group-hover:text-camel-800 dark:group-hover:text-camel-300">
                    {coursing.best_score ?? '—'}
                  </div>
                  <div className="mt-2 text-sm text-camel-600 dark:text-camel-500 opacity-0 transition-opacity group-hover:opacity-100 font-medium">
                    открыть протокол →
                  </div>
                </a>
              ) : (
                <div className="mb-4 rounded-xl border-2 border-camel-200 dark:border-camel-600 bg-camel-50 dark:bg-charcoal-700 p-4 text-center">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Лучший результат</div>
                  <div className="text-4xl font-bold tracking-tight text-camel-700 dark:text-camel-400">
                    {coursing.best_score ?? '—'}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-cream-50 dark:bg-charcoal-700 rounded-xl p-4 text-center border border-old-money-200 dark:border-charcoal-600">
                  <div className="text-xs font-semibold text-old-money-500 mb-1 uppercase tracking-wide">Участий</div>
                  <div className="text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">{coursing.total_starts}</div>
                </div>
                <div className="bg-cream-50 dark:bg-charcoal-700 rounded-xl p-4 text-center border border-old-money-200 dark:border-charcoal-600">
                  <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Средний</div>
                  <div className="text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">{formatScore(coursing.avg_score)}</div>
                </div>
              </div>

              {hasCourseMedals && (
                <div className="flex gap-3">
                  {[
                    { emoji: '🥇', count: coursing.gold, label: 'Золото' },
                    { emoji: '🥈', count: coursing.silver, label: 'Серебро' },
                    { emoji: '🥉', count: coursing.bronze, label: 'Бронза' },
                  ].map(({ emoji, count, label }) => (
                    <div key={emoji} className="flex-1 bg-cream-50 dark:bg-charcoal-700 rounded-xl p-3 text-center border border-old-money-200 dark:border-charcoal-600">
                      <div className="text-xl mb-1">{emoji}</div>
                      <div className="text-xl font-bold text-charcoal-800 dark:text-charcoal-100">{count || 0}</div>
                      <div className="text-xs text-old-money-600 dark:text-old-money-400 font-medium">{label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Рейсинг */}
          {hasRacingData && (
            <div className="rounded-2xl border-2 border-warm-blue-200 dark:border-warm-blue-600 bg-white dark:bg-charcoal-800 p-5 shadow-md md:p-6">
              <h2 className="mb-4 text-lg font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 md:text-xl">Рейсинг</h2>

              {bestSpeedUrl ? (
                <a
                  href={bestSpeedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mb-4 block rounded-xl border-2 border-warm-blue-200 dark:border-warm-blue-600 bg-warm-blue-50 dark:bg-charcoal-700 p-4 text-center transition-colors hover:bg-warm-blue-100 dark:hover:bg-charcoal-600"
                >
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Лучшая скорость</div>
                  <div className="whitespace-nowrap text-4xl font-bold tracking-tight text-warm-blue-800 dark:text-warm-blue-400 group-hover:text-warm-blue-900 dark:group-hover:text-warm-blue-300">
                    {racing.best_speed ?? '—'}
                    {racing.best_speed && <span className="text-base font-normal text-gray-400 dark:text-gray-500 ml-2">км/ч</span>}
                  </div>
                  <div className="mt-2 text-sm text-warm-blue-600 opacity-0 transition-opacity group-hover:opacity-100 font-medium">
                    открыть протокол →
                  </div>
                </a>
              ) : (
                <div className="mb-4 rounded-xl border-2 border-warm-blue-200 dark:border-warm-blue-600 bg-warm-blue-50 dark:bg-charcoal-700 p-4 text-center">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Лучшая скорость</div>
                  <div className="whitespace-nowrap text-4xl font-bold tracking-tight text-warm-blue-800 dark:text-warm-blue-400">
                    {racing.best_speed ?? '—'}
                    {racing.best_speed && <span className="text-base font-normal text-gray-400 dark:text-gray-500 ml-2">км/ч</span>}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-warm-blue-50 dark:bg-charcoal-700 p-4 text-center border border-warm-blue-100 dark:border-warm-blue-600">
                  <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Участий</div>
                  <div className="text-2xl font-bold text-warm-blue-900 dark:text-warm-blue-400">{racing.total_starts}</div>
                </div>
                <div className="rounded-xl bg-warm-blue-50 dark:bg-charcoal-700 p-4 text-center border border-warm-blue-100 dark:border-warm-blue-600">
                  <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Средняя</div>
                  <div className="whitespace-nowrap text-2xl font-bold text-warm-blue-900 dark:text-warm-blue-400">
                    {racing.avg_speed
                      ? <>{racing.avg_speed}<span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-1">км/ч</span></>
                      : '—'
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Статистика Донино и Беги борзых */}
        {(hasSpeedRecords || hasCoursingRecords) && (
          <div className={`grid gap-4 md:gap-6 mb-6 ${hasSpeedRecords && hasCoursingRecords ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            {/* Статистика Донино */}
            {hasSpeedRecords && (
              <div className="rounded-2xl border-2 border-camel-200 dark:border-camel-600 bg-white dark:bg-charcoal-800 p-5 shadow-md md:p-6">
                <h2 className="text-lg md:text-xl font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 mb-4">Замер скорости</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-camel-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-camel-200 dark:border-charcoal-500">
                    <div className="text-xs font-medium text-old-money-600 dark:text-old-money-400 mb-1 uppercase tracking-wide">Лучшая скорость</div>
                    <div className="text-2xl font-bold text-camel-700 dark:text-camel-400">{speedStats.bestSpeed} <span className="text-sm font-normal">км/ч</span></div>
                  </div>
                  <div className="bg-gradient-to-br from-old-money-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-old-money-200 dark:border-charcoal-500">
                    <div className="text-xs font-medium text-old-money-600 dark:text-old-money-400 mb-1 uppercase tracking-wide">Средняя скорость</div>
                    <div className="text-2xl font-bold text-charcoal-900 dark:text-charcoal-100">{speedStats.avgSpeed.toFixed(1)} <span className="text-sm font-normal">км/ч</span></div>
                  </div>
                </div>

                {speedStats.breedRank > 0 && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-camel-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-camel-200 dark:border-charcoal-500">
                      <div className="text-xs font-medium text-old-money-600 dark:text-old-money-400 mb-1 uppercase tracking-wide">Рейтинг в породе</div>
                      <div className="text-2xl font-bold text-camel-700 dark:text-camel-400">#{speedStats.breedRank} <span className="text-base font-normal text-charcoal-600 dark:text-charcoal-400">из {speedStats.breedTotal}</span></div>
                    </div>
                    <div className="bg-gradient-to-br from-camel-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-camel-200 dark:border-charcoal-500">
                      <div className="text-xs font-medium text-old-money-600 dark:text-old-money-400 mb-1 uppercase tracking-wide">Процентиль</div>
                      <div className="text-2xl font-bold text-camel-700 dark:text-camel-400">Топ {100 - speedStats.percentile}%</div>
                    </div>
                  </div>
                )}

                {speedStats.screenshotUrl && (
                  <div className="mb-6">
                    <a
                      href={speedStats.screenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-camel-700 dark:text-camel-400 hover:text-camel-800 dark:hover:text-camel-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Скриншот лучшего результата
                    </a>
                  </div>
                )}

                {/* График прогресса */}
                <div>
                  <h3 className="text-lg font-bold text-charcoal-900 dark:text-charcoal-100 mb-3">Прогресс во времени</h3>
                  <div className="space-y-2">
                    {speedStats.history.map((record, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-24 text-sm text-charcoal-700 dark:text-charcoal-300 text-right">{record.date}</div>
                        <div className="flex-1 bg-cream-200 dark:bg-charcoal-600 rounded-full h-6 overflow-hidden relative">
                          <div 
                            className="bg-gradient-to-r from-camel-400 to-camel-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${(record.speed_km_h / 80) * 100}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-charcoal-900 dark:text-charcoal-100">
                            {record.speed_km_h} км/ч
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Статистика бегов борзых */}
            {hasCoursingRecords && (
              <div className="rounded-2xl border-2 border-camel-200 dark:border-camel-600 bg-white dark:bg-charcoal-800 p-5 shadow-md md:p-6">
                <h2 className="text-lg md:text-xl font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 mb-4">Беги борзых</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-camel-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-camel-200 dark:border-charcoal-500">
                    <div className="text-xs font-medium text-old-money-600 dark:text-old-money-400 mb-1 uppercase tracking-wide">Лучшее время</div>
                    <div className="text-2xl font-bold text-camel-700 dark:text-camel-400">{coursingStats.bestTime} <span className="text-sm font-normal">сек</span></div>
                  </div>
                  <div className="bg-gradient-to-br from-old-money-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-old-money-200 dark:border-charcoal-500">
                    <div className="text-xs font-medium text-old-money-600 mb-1 uppercase tracking-wide">Среднее время</div>
                    <div className="text-2xl font-bold text-charcoal-900 dark:text-charcoal-100">{coursingStats.avgTime.toFixed(2)} <span className="text-sm font-normal">сек</span></div>
                  </div>
                </div>

                {coursingStats.breedRank > 0 && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-camel-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-camel-200 dark:border-charcoal-500">
                      <div className="text-xs font-medium text-old-money-600 dark:text-old-money-400 mb-1 uppercase tracking-wide">Рейтинг в породе</div>
                      <div className="text-2xl font-bold text-camel-700 dark:text-camel-400">#{coursingStats.breedRank} <span className="text-base font-normal text-charcoal-600 dark:text-charcoal-400">из {coursingStats.breedTotal}</span></div>
                    </div>
                    <div className="bg-gradient-to-br from-camel-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-camel-200 dark:border-charcoal-500">
                      <div className="text-xs font-medium text-old-money-600 dark:text-old-money-400 mb-1 uppercase tracking-wide">Процентиль</div>
                      <div className="text-2xl font-bold text-camel-700 dark:text-camel-400">Топ {100 - coursingStats.percentile}%</div>
                    </div>
                  </div>
                )}

                {/* Компенсируем скриншот из левого блока */}
                {hasSpeedRecords && speedStats?.screenshotUrl && (
                  <div className="mb-6" />
                )}

                {/* График прогресса */}
                <div>
                  <h3 className="text-lg font-bold text-charcoal-900 dark:text-charcoal-100 mb-3">Прогресс во времени</h3>
                  <div className="space-y-2">
                    {coursingStats.history.map((record, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-24 text-sm text-charcoal-700 dark:text-charcoal-300 text-right">{record.date}</div>
                        <div className="flex-1 bg-cream-200 dark:bg-charcoal-600 rounded-full h-6 overflow-hidden relative">
                          <div 
                            className="bg-gradient-to-r from-camel-400 to-camel-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${(30 / record.time_seconds) * 100}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-charcoal-900 dark:text-charcoal-100">
                            {record.time_seconds} сек
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* История выступлений */}
        {events.length > 0 && (
          <div className="rounded-2xl border-2 border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 p-5 shadow-md md:p-6">
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 mb-4">История выступлений</h2>
            
            {eventsLoading ? (
              <div className="flex items-center gap-3 text-old-money-500 dark:text-old-money-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-old-money-300 border-t-camel-600" />
                <span className="text-sm">Загрузка...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event, idx) => (
                  <div key={idx} className="bg-cream-50 dark:bg-charcoal-700 rounded-xl p-4 hover:bg-cream-100 dark:hover:bg-charcoal-600 transition-colors border border-old-money-200 dark:border-charcoal-600">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {event.competition_kind && (
                          <div className="mb-1 text-xs font-bold text-camel-700 dark:text-camel-400 uppercase tracking-wide">{event.competition_kind}</div>
                        )}
                        <div className="font-semibold text-charcoal-800 dark:text-charcoal-100 mb-1">{event.date_start}</div>
                        <div className="text-gray-700 dark:text-gray-300 mb-2">{event.title}</div>
                        {event.location && (
                          <div className="text-sm text-old-money-600 dark:text-old-money-400">{event.location}</div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-xs font-medium px-2.5 py-1 rounded-full bg-white dark:bg-charcoal-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-charcoal-600">
                          {event.event_type === 'coursing' ? 'Курсинг' : event.event_type === 'bzmp' ? 'БЗМП' : 'Рейсинг'}
                        </div>
                        {event.placement && (
                          <div className="text-lg font-bold text-camel-700 dark:text-camel-400">
                            #{event.placement}
                          </div>
                        )}
                        {event.total_score && (
                          <div className="text-sm text-old-money-600 dark:text-old-money-400 font-medium">
                            {event.total_score} баллов
                          </div>
                        )}
                      </div>
                    </div>
                    {event.results_url && (
                      <Link
                        to={`/event/${event.event_id}`}
                        className="mt-3 inline-block text-sm text-camel-700 dark:text-camel-400 transition-colors hover:text-camel-800 dark:hover:text-camel-300 font-medium"
                      >
                        Результаты →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}