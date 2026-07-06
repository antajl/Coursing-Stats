import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { ChevronLeft } from 'lucide-react'
import SkeletonLoader from '../components/SkeletonLoader'
import ErrorState from '../components/ErrorState'
import DogSexIcon from '../components/DogSexIcon'
import OwnerCrownName from '../components/OwnerCrownName'
import { formatRecordDate, dedupeByRecordDate, expandCoursingTimeline } from '../lib/recordDates'
import { SEO } from '../components/SEO'
import { api } from '../services/api'

export default function DoninoDogProfile() {
  const { name, breed } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const exportRef = useRef(null)

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

  const handleBack = () => {
    if (fromCoursingRecords) {
      navigate('/speed-records?tab=coursing')
    } else {
      navigate('/speed-records')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <SkeletonLoader variant="card" count={3} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <ErrorState title="Ошибка" message={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen p-6">
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
  const coursingTimeline = expandCoursingTimeline(data.coursingRecords)
  const coursingHistory =
    coursingTimeline.length > 0
      ? coursingTimeline
      : dedupeByRecordDate(
          data.coursingRecords,
          (candidate, existing) => candidate.time_seconds < existing.time_seconds
        )
  const dogSex = data.sex || data.speedRecords?.find((r) => r.sex)?.sex || ''

  const seoTitle = `${data.name} — ${data.breed}`
  const seoFacts: string[] = []
  if (hasSpeedRecords) {
    seoFacts.push(`лучшая скорость ${data.speedStats.bestSpeed.toFixed(1)} км/ч`)
  }
  if (hasCoursingRecords) {
    seoFacts.push(`лучшее время 350 м: ${data.coursingStats.bestTime.toFixed(2)} с`)
  }
  const seoDescription =
    seoFacts.length > 0
      ? `Рекорды Донино: ${data.name} (${data.breed}). ${seoFacts.join('; ')}.`
      : `Рекорды Донино: ${data.name} (${data.breed}). Замер скорости и бега борзых 350 м.`
  const seoKeywords = `${data.name}, ${data.breed}, рекорды Донино, замер скорости, бега борзых, 350 м, курсинг`

  return (
    <>
      <SEO title={seoTitle} description={seoDescription} keywords={seoKeywords} />
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div ref={exportRef}>
          {/* Шапка профиля */}
          <div className="mb-6 rounded-2xl border-2 border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 p-5 shadow-md md:p-8">
            <div className="flex items-start gap-2">
              <button
                type="button"
                onClick={handleBack}
                className="mt-1.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-old-money-200 bg-white/90 text-old-money-600 shadow-sm transition-colors hover:border-old-money-300 hover:bg-old-money-50 hover:text-camel-700 dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-old-money-400 dark:hover:border-charcoal-500 dark:hover:bg-charcoal-700 dark:hover:text-camel-400"
                aria-label="Назад"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </button>
              <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-3 md:gap-4 flex-wrap">
                <OwnerCrownName name={data.name} breed={data.breed} kind="donino">
                  <h1 className="text-2xl font-bold tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-3xl">{data.name}</h1>
                </OwnerCrownName>
                {dogSex && <DogSexIcon sex={dogSex} size={22} className="mb-0.5" />}
              </div>
              <div className="mt-3">
                <span className="inline-block rounded-full bg-cream-100 dark:bg-charcoal-700 px-4 py-1.5 text-sm font-semibold text-charcoal-700 dark:text-charcoal-300 border border-old-money-200 dark:border-charcoal-600">
                  {data.breed}
                </span>
              </div>
              </div>
            </div>
          </div>

          {/* Статистика и история */}
          {(hasSpeedRecords || hasCoursingRecords) && (
            <div className={`grid gap-4 md:gap-6 mb-6 ${hasSpeedRecords && hasCoursingRecords ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {hasSpeedRecords && (
                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl border-2 border-warm-blue-200 dark:border-warm-blue-600 bg-white dark:bg-charcoal-800 p-5 shadow-md md:p-6">
                    <h2 className="mb-4 text-lg font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 md:text-xl">Замер скорости</h2>

                    <div className="mb-4 rounded-xl border-2 border-warm-blue-200 dark:border-warm-blue-600 bg-warm-blue-50 dark:bg-charcoal-700 p-4 text-center">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Лучшая скорость</div>
                      <div className="whitespace-nowrap text-4xl font-bold tracking-tight text-warm-blue-800 dark:text-warm-blue-400">
                        {data.speedStats.bestSpeed.toFixed(1)}
                        <span className="text-base font-normal text-gray-400 dark:text-gray-500 ml-2">км/ч</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="rounded-xl bg-warm-blue-50 dark:bg-charcoal-700 p-4 text-center border border-warm-blue-200 dark:border-warm-blue-600">
                        <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Средняя</div>
                        <div className="whitespace-nowrap text-2xl font-bold text-warm-blue-900 dark:text-warm-blue-400">
                          {data.speedStats.avgSpeed.toFixed(1)}
                          <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-1">км/ч</span>
                        </div>
                      </div>
                      <div className="rounded-xl bg-warm-blue-50 dark:bg-charcoal-700 p-4 text-center border border-warm-blue-200 dark:border-warm-blue-600">
                        <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Замеров</div>
                        <div className="text-2xl font-bold text-warm-blue-900 dark:text-warm-blue-400">{uniqueSpeedRecords.length}</div>
                      </div>
                      {data.speedStats.breedRank > 0 && (
                        <div className="col-span-2 rounded-xl bg-warm-blue-50 dark:bg-charcoal-700 p-4 text-center border border-warm-blue-200 dark:border-warm-blue-600">
                          <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Рейтинг в породе</div>
                          <div className="text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">
                            #{data.speedStats.breedRank}
                            <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-1">из {data.speedStats.breedTotal}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {uniqueSpeedRecords.length > 0 && (
                    <div className="rounded-2xl border-2 border-warm-blue-200 dark:border-warm-blue-600 bg-white dark:bg-charcoal-800 p-5 shadow-md md:p-6">
                      <h3 className="text-base md:text-lg font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 mb-4">История</h3>
                      <div className="space-y-2">
                        {uniqueSpeedRecords.map((record, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <div className="w-24 text-sm text-charcoal-700 dark:text-charcoal-300 text-right shrink-0">{formatRecordDate(record.date)}</div>
                            <div className="flex-1 bg-cream-200 dark:bg-charcoal-600 rounded-full h-6 overflow-hidden relative">
                              <div
                                className="bg-gradient-to-r from-warm-blue-400 to-warm-blue-600 h-full rounded-full transition-all duration-500"
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
                </div>
              )}

              {hasCoursingRecords && (
                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl border-2 border-forest-200 dark:border-forest-600 bg-white dark:bg-charcoal-800 p-5 shadow-md md:p-6">
                    <h2 className="text-lg md:text-xl font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 mb-4">Бега борзых (350 м)</h2>

                    <div className="mb-4 rounded-xl border-2 border-forest-200 dark:border-forest-600 bg-forest-50 dark:bg-charcoal-700 p-4 text-center">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Лучшее время</div>
                      <div className="whitespace-nowrap text-4xl font-bold tracking-tight text-forest-700 dark:text-forest-300">
                        {data.coursingStats.bestTime.toFixed(2)}
                        <span className="text-base font-normal text-gray-400 dark:text-gray-500 ml-2">сек</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-forest-50 dark:bg-charcoal-700 rounded-xl p-4 text-center border border-forest-200 dark:border-forest-600">
                        <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Среднее</div>
                        <div className="whitespace-nowrap text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">
                          {data.coursingStats.avgTime.toFixed(2)}
                          <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-1">сек</span>
                        </div>
                      </div>
                      <div className="bg-forest-50 dark:bg-charcoal-700 rounded-xl p-4 text-center border border-forest-200 dark:border-forest-600">
                        <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Забегов</div>
                        <div className="text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">{coursingHistory.length}</div>
                      </div>
                      {data.coursingStats.breedRank > 0 && (
                        <div className="col-span-2 bg-forest-50 dark:bg-charcoal-700 rounded-xl p-4 text-center border border-forest-200 dark:border-forest-600">
                          <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Рейтинг в породе</div>
                          <div className="text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">
                            #{data.coursingStats.breedRank}
                            <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-1">из {data.coursingStats.breedTotal}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {coursingHistory.length > 0 && (
                    <div className="rounded-2xl border-2 border-forest-200 dark:border-forest-600 bg-white dark:bg-charcoal-800 p-5 shadow-md md:p-6">
                      <h3 className="text-base md:text-lg font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 mb-4">История</h3>
                      <div className="space-y-2">
                        {coursingHistory.map((record, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <div className="w-24 text-sm text-charcoal-700 dark:text-charcoal-300 text-right shrink-0">{formatRecordDate(record.date)}</div>
                            <div className="flex-1 bg-cream-200 dark:bg-charcoal-600 rounded-full h-6 overflow-hidden relative">
                              <div
                                className="bg-gradient-to-r from-forest-400 to-forest-600 h-full rounded-full transition-all duration-500"
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
            </div>
          )}

          {!hasSpeedRecords && !hasCoursingRecords && (
            <div className="rounded-2xl border-2 border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 p-6 text-center shadow-md">
              <p className="text-old-money-600 dark:text-old-money-400">Нет записей для этой собаки</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}
