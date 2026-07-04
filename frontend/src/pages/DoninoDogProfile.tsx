import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import SkeletonLoader from '../components/SkeletonLoader'
import ErrorState from '../components/ErrorState'
import { formatRecordDate, dedupeByRecordDate } from '../lib/recordDates'
import { api } from '../services/api'

export default function DoninoDogProfile() {
  const { name, breed } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const exportRef = useRef(null)

  const fromSpeedRecords = location.state?.from === 'speed-records'
  const fromCoursingRecords = location.state?.from === 'coursing-records'

  useEffect(() => {
    async function fetchDogData() {
      try {
        setLoading(true)
        const result = await api.getDoninoDog(name, breed)
        
        if (result.success) {
          setData(result.data)
          setError(null)
        } else {
          setError(result.error || 'Failed to fetch dog data')
        }
      } catch (err) {
        setError('Failed to fetch dog data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (name && breed) {
      fetchDogData()
    }
  }, [name, breed])

  if (loading) {
    return <SkeletonLoader message="Загрузка данных о собаке..." />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 p-6">
        <ErrorState title="Ошибка" message={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 p-6">
        <ErrorState title="Данные не найдены" message="Собака не найдена в базе данных" />
      </div>
    )
  }

  const hasSpeedRecords = data.speedStats.total > 0
  const hasCoursingRecords = data.coursingStats.total > 0
  const uniqueSpeedRecords = dedupeByRecordDate(
    data.speedRecords,
    (candidate, existing) => candidate.speed_km_h > existing.speed_km_h
  )
  const uniqueCoursingRecords = dedupeByRecordDate(
    data.coursingRecords,
    (candidate, existing) => candidate.time_seconds < existing.time_seconds
  )

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-2">
          <button
            onClick={() => {
              if (fromSpeedRecords) {
                navigate('/speed-records')
              } else if (fromCoursingRecords) {
                navigate('/speed-records?tab=coursing')
              } else {
                navigate('/speed-records')
              }
            }}
            className="font-medium text-camel-700 dark:text-camel-400 transition-colors hover:text-camel-800 dark:hover:text-camel-300"
          >
            <span className="md:hidden">← Назад</span>
            <span className="hidden md:inline">← {fromSpeedRecords ? 'Назад к рекордам' : fromCoursingRecords ? 'Назад к бегам борзых' : 'Назад к рекордам'}</span>
          </button>
        </div>

        <div ref={exportRef}>
          {/* Шапка профиля */}
          <div className="mb-6 rounded-2xl border-2 border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 p-5 shadow-md md:p-8">
            <div className="min-w-0">
              <div className="flex items-baseline gap-3 md:gap-4 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-3xl">{data.name}</h1>
              </div>
              <div className="mt-3">
                <span className="inline-block rounded-full bg-cream-100 dark:bg-charcoal-700 px-4 py-1.5 text-sm font-semibold text-charcoal-700 dark:text-charcoal-300 border border-old-money-200 dark:border-charcoal-600">
                  {data.breed}
                </span>
              </div>
            </div>
          </div>

          {/* Статистика Донино и Бега борзых */}
          {(hasSpeedRecords || hasCoursingRecords) && (
            <div className={`grid gap-4 md:gap-6 mb-6 ${hasSpeedRecords && hasCoursingRecords ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Статистика Донино */}
              {hasSpeedRecords && (
                <div className="rounded-2xl border-2 border-camel-200 dark:border-camel-600 bg-white dark:bg-charcoal-800 p-5 shadow-md md:p-6">
                  <h2 className="text-lg md:text-xl font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 mb-4">Замер скорости (350 метров)</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-camel-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-camel-200 dark:border-charcoal-500">
                      <div className="text-xs font-medium text-old-money-600 dark:text-old-money-400 mb-1 uppercase tracking-wide">Лучшая скорость</div>
                      <div className="text-2xl font-bold text-camel-700 dark:text-camel-400">{data.speedStats.bestSpeed.toFixed(1)} <span className="text-sm font-normal text-charcoal-600 dark:text-charcoal-400">км/ч</span></div>
                    </div>
                    <div className="bg-gradient-to-br from-old-money-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-old-money-200 dark:border-charcoal-500">
                      <div className="text-xs font-medium text-old-money-600 dark:text-old-money-400 mb-1 uppercase tracking-wide">Средняя скорость</div>
                      <div className="text-2xl font-bold text-charcoal-900 dark:text-charcoal-100">{data.speedStats.avgSpeed.toFixed(1)} <span className="text-sm font-normal text-charcoal-600 dark:text-charcoal-400">км/ч</span></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-old-money-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-old-money-200 dark:border-charcoal-500">
                      <div className="text-xs font-medium text-old-money-600 dark:text-old-money-400 mb-1 uppercase tracking-wide">Всего замеров</div>
                      <div className="text-2xl font-bold text-charcoal-900 dark:text-charcoal-100">{uniqueSpeedRecords.length}</div>
                    </div>
                    {data.speedStats.breedRank > 0 && (
                      <div className="bg-gradient-to-br from-camel-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-camel-200 dark:border-charcoal-500">
                        <div className="text-xs font-medium text-old-money-600 dark:text-old-money-400 mb-1 uppercase tracking-wide">Рейтинг в породе</div>
                        <div className="text-2xl font-bold text-camel-700 dark:text-camel-400">#{data.speedStats.breedRank} <span className="text-base font-normal text-charcoal-600 dark:text-charcoal-400">из {data.speedStats.breedTotal}</span></div>
                      </div>
                    )}
                  </div>

                  {/* График прогресса */}
                  <div className="mt-6 space-y-2">
                    {uniqueSpeedRecords.map((record, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-24 text-sm text-charcoal-700 dark:text-charcoal-300 text-right">{formatRecordDate(record.date)}</div>
                        <div className="flex-1 bg-cream-200 dark:bg-charcoal-600 rounded-full h-6 overflow-hidden relative">
                          <div 
                            className="bg-gradient-to-r from-camel-400 to-camel-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${(Number(record.speed_km_h) / 80) * 100}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-charcoal-900 dark:text-charcoal-100">
                            {Number(record.speed_km_h).toFixed(1)} км/ч
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Статистика бегов борзых */}
              {hasCoursingRecords && (
                <div className="rounded-2xl border-2 border-camel-200 dark:border-camel-600 bg-white dark:bg-charcoal-800 p-5 shadow-md md:p-6">
                  <h2 className="text-lg md:text-xl font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 mb-4">Бега борзых (350 метров)</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-camel-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-camel-200 dark:border-charcoal-500">
                      <div className="text-xs font-medium text-old-money-600 dark:text-old-money-400 mb-1 uppercase tracking-wide">Лучшее время</div>
                      <div className="text-2xl font-bold text-camel-700 dark:text-camel-400">{data.coursingStats.bestTime.toFixed(2)} <span className="text-sm font-normal text-charcoal-600 dark:text-charcoal-400">сек</span></div>
                    </div>
                    <div className="bg-gradient-to-br from-old-money-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-old-money-200 dark:border-charcoal-500">
                      <div className="text-xs font-medium text-old-money-600 dark:text-old-money-400 mb-1 uppercase tracking-wide">Среднее время</div>
                      <div className="text-2xl font-bold text-charcoal-900 dark:text-charcoal-100">{data.coursingStats.avgTime.toFixed(2)} <span className="text-sm font-normal text-charcoal-600 dark:text-charcoal-400">сек</span></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-old-money-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-old-money-200 dark:border-charcoal-500">
                      <div className="text-xs font-medium text-old-money-600 dark:text-old-money-400 mb-1 uppercase tracking-wide">Всего забегов</div>
                      <div className="text-2xl font-bold text-charcoal-900 dark:text-charcoal-100">{uniqueCoursingRecords.length}</div>
                    </div>
                    {data.coursingStats.breedRank > 0 && (
                      <div className="bg-gradient-to-br from-camel-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-camel-200 dark:border-charcoal-500">
                        <div className="text-xs font-medium text-old-money-600 dark:text-old-money-400 mb-1 uppercase tracking-wide">Рейтинг в породе</div>
                        <div className="text-2xl font-bold text-camel-700 dark:text-camel-400">#{data.coursingStats.breedRank} <span className="text-base font-normal text-charcoal-600 dark:text-charcoal-400">из {data.coursingStats.breedTotal}</span></div>
                      </div>
                    )}
                  </div>

                  {/* График прогресса */}
                  <div className="mt-6 space-y-2">
                    {uniqueCoursingRecords.map((record, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-24 text-sm text-charcoal-700 dark:text-charcoal-300 text-right">{formatRecordDate(record.date)}</div>
                        <div className="flex-1 bg-cream-200 dark:bg-charcoal-600 rounded-full h-6 overflow-hidden relative">
                          <div 
                            className="bg-gradient-to-r from-camel-400 to-camel-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${(30 / Number(record.time_seconds)) * 100}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-charcoal-900 dark:text-charcoal-100">
                            {Number(record.time_seconds).toFixed(2)} сек
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!hasSpeedRecords && !hasCoursingRecords && (
            <div className="rounded-2xl border-2 border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 p-6 text-center">
              <p className="text-old-money-600 dark:text-old-money-400">Нет записей для этой собаки</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
