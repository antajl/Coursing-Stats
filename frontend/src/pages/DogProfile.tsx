import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDogProfile, useDogEvents } from '../hooks/useApi'
import { DogSilhouettes, getSilhouetteType } from '../components/DogSilhouettes'
import { toPng } from 'html-to-image'
import SkeletonLoader from '../components/SkeletonLoader'

export default function DogProfile() {
  const { id } = useParams()
  const [exporting, setExporting] = useState(false)

  const exportRef = useRef(null)

  // React Query hooks
  const { data: dogDataResult, isLoading: loading } = useDogProfile(id)
  const { data: eventsData, isLoading: eventsLoading } = useDogEvents(id)

  const dog = dogDataResult?.success ? dogDataResult.data : null
  const events = eventsData?.success ? (Array.isArray(eventsData.data) ? eventsData.data : []) : []

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
      <div className="min-h-screen bg-cream-50 dark:bg-charcoal-800 p-6">
        <div className="max-w-4xl mx-auto">
          <SkeletonLoader variant="card" count={3} />
        </div>
      </div>
    )
  }

  if (!dog) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-charcoal-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8 text-old-money-600 dark:text-old-money-400">
            <div className="mb-4">Собака не найдена</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">ID: {id}</div>
          </div>
        </div>
      </div>
    )
  }

  const coursing = dog.coursing_stats || {}
  const racing = dog.racing_stats || {}
  const hasCoursingData = coursing.total_starts > 0
  const hasRacingData = racing.total_starts > 0

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
          <Link to="/top" className="font-medium text-camel-700 dark:text-camel-400 transition-colors hover:text-camel-800 dark:hover:text-camel-300">
            <span className="md:hidden">← Назад</span>
            <span className="hidden md:inline">← Назад к топу</span>
          </Link>
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
                <div className="text-base text-gray-500 dark:text-gray-400 mt-1 font-medium">{dog.name_ru}</div>
              )}
              <div className="mt-3">
                <span className="inline-block rounded-full bg-cream-100 dark:bg-charcoal-700 px-4 py-1.5 text-sm font-semibold text-charcoal-700 dark:text-charcoal-300 border border-old-money-200 dark:border-charcoal-600">
                  {dog.breed}
                </span>
              </div>
            </div>
          </div>

          {dog.owner && (
            <div className="mt-4 pt-4 border-t border-old-money-100 dark:border-charcoal-600 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Владелец:</span> {dog.owner}
            </div>
          )}
        </div>

        {/* Статистика по дисциплинам */}
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
                  <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Участий</div>
                  <div className="text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">{coursing.total_starts}</div>
                </div>
                <div className="bg-cream-50 dark:bg-charcoal-700 rounded-xl p-4 text-center border border-old-money-200 dark:border-charcoal-600">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Средний</div>
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
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</div>
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
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Участий</div>
                  <div className="text-2xl font-bold text-warm-blue-900 dark:text-warm-blue-400">{racing.total_starts}</div>
                </div>
                <div className="rounded-xl bg-warm-blue-50 dark:bg-charcoal-700 p-4 text-center border border-warm-blue-100 dark:border-warm-blue-600">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Средняя</div>
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

        {/* История выступлений */}
        <div className="rounded-2xl border-2 border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 p-5 shadow-md md:p-6">
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 mb-4">История выступлений</h2>
          
          {eventsLoading ? (
            <div className="flex items-center gap-3 text-old-money-500 dark:text-old-money-400">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-old-money-300 border-t-camel-600" />
              <span className="text-sm">Загрузка...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">Нет данных о выступлениях</div>
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
                        <div className="text-sm text-gray-500 dark:text-gray-400">{event.location}</div>
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
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
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
        </div>
      </div>
    </div>
  )
}