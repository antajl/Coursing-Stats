import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../services/api'
import { DogSilhouettes, getSilhouetteType } from '../components/DogSilhouettes'
import { toPng } from 'html-to-image'

export default function DogProfile() {
  const { id } = useParams()
  const [dogData, setDogData] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [eventsLoading, setEventsLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  const exportRef = useRef(null)

  useEffect(() => {
    async function fetchDogData() {
      try {
        setLoading(true)
        const result = await api.getDogProfile(id)
        if (result.data) {
          setDogData(result.data)
        }
      } catch (err) {
        console.error('Error fetching dog data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDogData()
  }, [id])

  useEffect(() => {
    async function fetchEvents() {
      try {
        setEventsLoading(true)
        const result = await api.getDogEvents(id)
        const eventsData = result.data || []
        setEvents(Array.isArray(eventsData) ? eventsData : [])
      } catch (err) {
        console.error('Error fetching events:', err)
        setEvents([])
      } finally {
        setEventsLoading(false)
      }
    }

    fetchEvents()
  }, [id])

  const handleExport = async () => {
    if (!exportRef.current || exporting) return
    try {
      setExporting(true)
      const dataUrl = await toPng(exportRef.current, { quality: 1, pixelRatio: 2 })
      const link = document.createElement('a')
      link.download = `${dogData.name_lat.replace(/\s+/g, '_')}_profile.png`
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
      <div className="min-h-screen bg-gradient-to-br from-old-money-50 to-gold-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 text-old-money-500">
            <div className="w-6 h-6 border-2 border-old-money-300 border-t-gold-500 rounded-full animate-spin" />
            <span className="text-lg">Загрузка...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!dogData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-old-money-50 to-gold-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8 text-old-money-600">
            <div className="mb-4">Собака не найдена</div>
            <div className="text-sm text-gray-500">ID: {id}</div>
          </div>
        </div>
      </div>
    )
  }

  const coursing = dogData.coursing_stats || {}
  const racing = dogData.racing_stats || {}
  const hasCoursingData = coursing.total_starts > 0
  const hasRacingData = racing.total_starts > 0

  const silhouetteType = getSilhouetteType(dogData?.breed)
  const showRuName = dogData.name_ru && dogData.name_ru !== dogData.name_lat
  const hasCourseMedals = coursing.gold > 0 || coursing.silver > 0 || coursing.bronze > 0

  const formatScore = (v) =>
    v !== undefined && v !== null ? parseFloat(v).toFixed(2) : '—'

  const bestScoreUrl = coursing.best_score_event_url || null
  const bestSpeedUrl = racing.best_speed_event_url || null


  return (
    <div className="min-h-screen bg-gradient-to-br from-old-money-50 to-gold-50 p-4 md:p-6">
      <DogSilhouettes />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-2">
          <Link to="/top" className="text-gold-600 hover:text-gold-500 font-medium">
            <span className="md:hidden">Назад</span>
            <span className="hidden md:inline">← Назад к топу</span>
          </Link>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="bg-gradient-to-r from-gold-500 to-gold-400 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:from-gold-600 hover:to-gold-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? 'Экспорт...' : 'Скачать карточку'}
          </button>
        </div>

        <div ref={exportRef}>

        {/* Шапка профиля */}
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-gold-200 p-4 md:p-8 mb-6">
          <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6 pb-4 md:pb-6 border-b border-old-money-100 flex-wrap">
            <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-old-money-100 to-old-money-200 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 md:w-14 md:h-14 text-old-money-600">
                <use href={`#silhouette-${silhouetteType}`} />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 md:gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-gold-700">{dogData.name_lat}</h1>
                {dogData.sex && (
                  <span className="text-xl text-gray-400">
                    {dogData.sex === 'M' ? '♂' : '♀'}
                  </span>
                )}
              </div>
              {showRuName && (
                <div className="text-lg text-gray-600 mt-1">{dogData.name_ru}</div>
              )}
              <div className="mt-2">
                <span className="inline-block bg-old-money-100 text-old-money-700 text-sm font-medium rounded-full py-1 px-4">
                  {dogData.breed}
                </span>
              </div>
            </div>
          </div>

          {dogData.owner && (
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">Владелец:</span> {dogData.owner}
            </div>
          )}
        </div>

        {/* Статистика по дисциплинам */}
        <div className={`grid gap-4 md:gap-6 mb-6 ${hasCoursingData && hasRacingData ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Курсинг */}
          {hasCoursingData && (
            <div className="bg-white rounded-2xl shadow-2xl border border-old-money-200 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-old-money-700 mb-4">Курсинг / БЗМП</h2>

              {bestScoreUrl ? (
                <a
                  href={bestScoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gradient-to-br from-gold-50 to-gold-100 rounded-xl p-4 shadow-sm mb-4 text-center group hover:from-gold-100 hover:to-gold-200 transition-colors"
                >
                  <div className="text-sm text-gray-500 mb-2">Лучший результат</div>
                  <div className="text-4xl font-bold text-gold-600 group-hover:text-gold-500">
                    {coursing.best_score ?? '—'}
                  </div>
                  <div className="text-sm text-gold-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    открыть протокол →
                  </div>
                </a>
              ) : (
                <div className="bg-gradient-to-br from-gold-50 to-gold-100 rounded-xl p-4 shadow-sm mb-4 text-center">
                  <div className="text-sm text-gray-500 mb-2">Лучший результат</div>
                  <div className="text-4xl font-bold text-gold-600">
                    {coursing.best_score ?? '—'}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-old-money-50 rounded-xl p-4 text-center">
                  <div className="text-sm text-gray-500 mb-1">Всего участий</div>
                  <div className="text-2xl font-bold text-old-money-800">{coursing.total_starts}</div>
                </div>
                <div className="bg-old-money-50 rounded-xl p-4 text-center">
                  <div className="text-sm text-gray-500 mb-1">Средний результат</div>
                  <div className="text-2xl font-bold text-old-money-800">{formatScore(coursing.avg_score)}</div>
                </div>
              </div>

              {hasCourseMedals && (
                <div className="flex gap-4">
                  {[
                    { emoji: '🥇', count: coursing.gold, color: 'text-yellow-700', label: 'Золото' },
                    { emoji: '🥈', count: coursing.silver, color: 'text-gray-600', label: 'Серебро' },
                    { emoji: '🥉', count: coursing.bronze, color: 'text-orange-700', label: 'Бронза' },
                  ].map(({ emoji, count, color, label }) => (
                    <div key={emoji} className="flex-1 bg-old-money-50 rounded-xl p-4 text-center">
                      <div className="text-2xl">{emoji}</div>
                      <div className={`text-xl font-bold ${color}`}>{count || 0}</div>
                      <div className="text-xs text-gray-500">{label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Рейсинг */}
          {hasRacingData && (
            <div className="bg-white rounded-2xl shadow-2xl border border-steel-200 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-steel-700 mb-4">Рейсинг</h2>

              {bestSpeedUrl ? (
                <a
                  href={bestSpeedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gradient-to-br from-steel-50 to-steel-100 rounded-xl p-4 shadow-sm mb-4 text-center group hover:from-steel-100 hover:to-steel-200 transition-colors"
                >
                  <div className="text-sm text-gray-500 mb-2">Лучшая скорость</div>
                  <div className="text-4xl font-bold text-steel-600 group-hover:text-steel-500 whitespace-nowrap">
                    {racing.best_speed ?? '—'}
                    {racing.best_speed && <span className="text-lg font-normal text-gray-400 ml-2">км/ч</span>}
                  </div>
                  <div className="text-sm text-steel-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    открыть протокол →
                  </div>
                </a>
              ) : (
                <div className="bg-gradient-to-br from-steel-50 to-steel-100 rounded-xl p-4 shadow-sm mb-4 text-center">
                  <div className="text-sm text-gray-500 mb-2">Лучшая скорость</div>
                  <div className="text-4xl font-bold text-steel-600 whitespace-nowrap">
                    {racing.best_speed ?? '—'}
                    {racing.best_speed && <span className="text-lg font-normal text-gray-400 ml-2">км/ч</span>}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-steel-50 rounded-xl p-4 text-center">
                  <div className="text-sm text-gray-500 mb-1">Всего участий</div>
                  <div className="text-2xl font-bold text-steel-800">{racing.total_starts}</div>
                </div>
                <div className="bg-steel-50 rounded-xl p-4 text-center">
                  <div className="text-sm text-gray-500 mb-1">Средняя скорость</div>
                  <div className="text-2xl font-bold text-steel-800 whitespace-nowrap">
                    {racing.avg_speed
                      ? <>{racing.avg_speed}<span className="text-sm font-normal text-gray-400 ml-1">км/ч</span></>
                      : '—'
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* История выступлений */}
        <div className="bg-white rounded-2xl shadow-2xl border border-old-money-200 p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-old-money-700 mb-4">История выступлений</h2>
          
          {eventsLoading ? (
            <div className="flex items-center gap-3 text-old-money-500">
              <div className="w-4 h-4 border-2 border-old-money-300 border-t-gold-500 rounded-full animate-spin" />
              <span className="text-sm">Загрузка...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="text-sm text-gray-500">Нет данных о выступлениях</div>
          ) : (
            <div className="space-y-3">
              {events.map((event, idx) => (
                <div key={idx} className="bg-old-money-50 rounded-xl p-4 hover:bg-old-money-100 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {event.competition_kind && (
                        <div className="text-xs font-bold text-gold-600 mb-1">{event.competition_kind}</div>
                      )}
                      <div className="font-medium text-old-money-800 mb-1">{event.date_start}</div>
                      <div className="text-gray-700 mb-2">{event.title}</div>
                      {event.location && (
                        <div className="text-sm text-gray-500">{event.location}</div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs font-medium px-2 py-1 rounded-full bg-white text-gray-600">
                        {event.event_type === 'coursing' ? 'Курсинг' : event.event_type === 'bzmp' ? 'БЗМП' : 'Рейсинг'}
                      </div>
                      {event.placement && (
                        <div className="text-lg font-bold text-gold-600">
                          #{event.placement}
                        </div>
                      )}
                      {event.total_score && (
                        <div className="text-sm text-gray-600">
                          {event.total_score} баллов
                        </div>
                      )}
                    </div>
                  </div>
                  {event.results_url && (
                    <Link
                      to={`/event/${event.event_id}`}
                      className="inline-block mt-3 text-sm text-gold-600 hover:text-gold-500"
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
