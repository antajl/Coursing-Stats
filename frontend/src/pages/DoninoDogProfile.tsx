import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef, useMemo } from 'react'
import { ChevronLeft, Award, TrendingUp, Zap } from 'lucide-react'
import SkeletonLoader from '../components/SkeletonLoader'
import ErrorState from '../components/ErrorState'
import DogSexIcon from '../components/DogSexIcon'
import OwnerCrownName from '../components/OwnerCrownName'
import { formatRecordDate, dedupeByRecordDate, expandCoursingTimeline } from '../lib/recordDates'
import { SEO } from '../components/SEO'
import { api } from '../services/api'
import HoverTooltip from '../components/ui/HoverTooltip'

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

  // Calculate derived values with useMemo (must be before early returns)
  const hasSpeedRecords = useMemo(() => data?.speedStats?.total > 0, [data?.speedStats?.total])
  const hasCoursingRecords = useMemo(() => data?.coursingStats?.total > 0, [data?.coursingStats?.total])
  const uniqueSpeedRecords = useMemo(() => {
    if (!data?.speedRecords) return []
    return dedupeByRecordDate(
      data.speedRecords,
      (candidate, existing) => candidate.speed_km_h > existing.speed_km_h
    )
  }, [data?.speedRecords])
  const coursingTimeline = useMemo(() => {
    if (!data?.coursingRecords) return []
    return expandCoursingTimeline(data.coursingRecords)
  }, [data?.coursingRecords])
  const coursingHistory = useMemo(() => {
    if (coursingTimeline.length > 0) return coursingTimeline
    if (!data?.coursingRecords) return []
    return dedupeByRecordDate(
      data.coursingRecords,
      (candidate, existing) => candidate.time_seconds < existing.time_seconds
    )
  }, [coursingTimeline, data?.coursingRecords])
  const dogSex = useMemo(() => data?.sex || data?.speedRecords?.find((r) => r.sex)?.sex || '', [data?.sex, data?.speedRecords])

  // Achievements calculation
  const achievements = useMemo(() => {
    const badges: { icon: React.ReactNode; label: string; color: string; tooltip: string }[] = []

    // Combined achievements
    const isTop5Speed = data?.speedStats?.breedRank > 0 && data.speedStats.breedRank <= 5
    const isTop5Coursing = data?.coursingStats?.breedRank > 0 && data.coursingStats.breedRank <= 5

    // Champion (top-5 in both categories) - HIGHEST PRIORITY
    if (isTop5Speed && isTop5Coursing) {
      badges.push({
        icon: <Award className="h-4 w-4" />,
        label: 'Чемпион',
        color: 'bg-forest-100 text-forest-700 dark:bg-forest-900/30 dark:text-forest-300',
        tooltip: 'Топ-5 породы по скорости и по времени',
      })
    }

    // Speed master (60+ km/h) - HIGH PRIORITY
    if (uniqueSpeedRecords.length > 0) {
      const maxSpeed = Math.max(...uniqueSpeedRecords.map((r) => Number(r.speed_km_h)))
      if (maxSpeed >= 60) {
        badges.push({
          icon: <Zap className="h-4 w-4" />,
          label: 'Мастер скорости',
          color: 'bg-warm-blue-100 text-warm-blue-700 dark:bg-warm-blue-900/30 dark:text-warm-blue-300',
          tooltip: 'Максимальная скорость 60+ км/ч',
        })
      }
    }

    // Time master (20- seconds for 350m) - HIGH PRIORITY
    if (coursingHistory.length > 0) {
      const minTime = Math.min(...coursingHistory.map((r) => Number(r.time_seconds)))
      if (minTime <= 20) {
        badges.push({
          icon: <Zap className="h-4 w-4" />,
          label: 'Мастер времени',
          color: 'bg-forest-100 text-forest-700 dark:bg-forest-900/30 dark:text-forest-300',
          tooltip: 'Лучшее время 20- секунд или меньше',
        })
      }
    }

    // Top-5 breed badge for speed - MEDIUM PRIORITY
    if (data?.speedStats?.breedRank > 0 && data.speedStats.breedRank <= 5) {
      badges.push({
        icon: <Zap className="h-4 w-4" />,
        label: `Топ-${data.speedStats.breedRank} породы (скорость)`,
        color: 'bg-terracotta-100 text-terracotta-700 dark:bg-terracotta-900/30 dark:text-terracotta-300',
        tooltip: `Собака занимает ${data.speedStats.breedRank} место среди ${data.speedStats.breedTotal} собак своей породы по скорости`,
      })
    }

    // Top-5 breed badge for coursing - MEDIUM PRIORITY
    if (data?.coursingStats?.breedRank > 0 && data.coursingStats.breedRank <= 5) {
      badges.push({
        icon: <Zap className="h-4 w-4" />,
        label: `Топ-${data.coursingStats.breedRank} породы (бега)`,
        color: 'bg-terracotta-100 text-terracotta-700 dark:bg-terracotta-900/30 dark:text-terracotta-300',
        tooltip: `Собака занимает ${data.coursingStats.breedRank} место среди ${data.coursingStats.breedTotal} собак своей породы по времени`,
      })
    }

    // Breakthrough (10%+ improvement) - LOW PRIORITY
    if (uniqueSpeedRecords.length >= 2) {
      const sorted = [...uniqueSpeedRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      const first = sorted[0]
      const last = sorted[sorted.length - 1]
      if (first && last) {
        const firstSpeed = Number(first.speed_km_h)
        const lastSpeed = Number(last.speed_km_h)
        const improvement = ((lastSpeed - firstSpeed) / firstSpeed) * 100
        if (improvement >= 10) {
          badges.push({
            icon: <TrendingUp className="h-4 w-4" />,
            label: 'Прорыв',
            color: 'bg-terracotta-100 text-terracotta-700 dark:bg-terracotta-900/30 dark:text-terracotta-300',
            tooltip: `Улучшение на ${improvement.toFixed(0)}%+ от первого результата`,
          })
        }
      }
    }

    // Veteran (6+ total records in both categories) - LOWEST PRIORITY
    const totalRecords = uniqueSpeedRecords.length + coursingHistory.length
    if (totalRecords >= 6) {
      badges.push({
        icon: <Award className="h-4 w-4" />,
        label: 'Ветеран',
        color: 'bg-camel-100 text-camel-700 dark:bg-camel-900/30 dark:text-camel-300',
        tooltip: `${totalRecords} замеров и забегов`,
      })
    }

    return badges
  }, [uniqueSpeedRecords, hasSpeedRecords, data?.speedStats?.breedRank, data?.speedStats?.breedTotal, coursingHistory, hasCoursingRecords, data?.coursingStats?.breedRank, data?.coursingStats?.breedTotal])

  // SEO values
  const seoTitle = useMemo(() => `${data?.name} — ${data?.breed}`, [data?.name, data?.breed])
  const seoFacts = useMemo(() => {
    const facts: string[] = []
    if (hasSpeedRecords && data?.speedStats?.bestSpeed) {
      facts.push(`лучшая скорость ${data.speedStats.bestSpeed.toFixed(1)} км/ч`)
    }
    if (hasCoursingRecords && data?.coursingStats?.bestTime) {
      facts.push(`лучшее время 350 м: ${data.coursingStats.bestTime.toFixed(2)} с`)
    }
    return facts
  }, [hasSpeedRecords, hasCoursingRecords, data?.speedStats?.bestSpeed, data?.coursingStats?.bestTime])
  const seoDescription = useMemo(() => {
    if (seoFacts.length > 0) {
      return `Рекорды Донино: ${data?.name} (${data?.breed}). ${seoFacts.join('; ')}.`
    }
    return `Рекорды Донино: ${data?.name} (${data?.breed}). Замер скорости и бега борзых 350 м.`
  }, [seoFacts, data?.name, data?.breed])
  const seoKeywords = useMemo(() => `${data?.name}, ${data?.breed}, рекорды Донино, замер скорости, бега борзых, 350 м, курсинг`, [data?.name, data?.breed])

  // Early returns (must be after all hooks)
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
                <div className="flex flex-col md:flex-row md:divide-x divide-old-money-200 dark:divide-charcoal-600 gap-4 md:gap-6">
                  <div className="w-full md:w-1/2">
                    <div className="flex items-baseline gap-3 md:gap-4 flex-wrap">
                      <OwnerCrownName name={data?.name} breed={data?.breed} kind="donino">
                        <h1 className="text-2xl font-bold tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-3xl">{data?.name}</h1>
                      </OwnerCrownName>
                      {dogSex && <DogSexIcon sex={dogSex} size={22} className="mb-0.5" />}
                    </div>
                    <div className="mt-3">
                      <span className="inline-block rounded-full bg-cream-100 dark:bg-charcoal-700 px-4 py-1.5 text-sm font-semibold text-charcoal-700 dark:text-charcoal-300 border border-old-money-200 dark:border-charcoal-600">
                        {data?.breed}
                      </span>
                    </div>
                  </div>
                  {achievements.length > 0 && (
                    <div className="w-full md:w-1/2 flex flex-wrap gap-2 items-start md:pl-6 justify-end">
                      {achievements.map((badge, idx) => (
                        <HoverTooltip key={idx} label={badge.tooltip}>
                          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badge.color} shrink-0`}>
                            {badge.icon}
                            {badge.label}
                          </div>
                        </HoverTooltip>
                      ))}
                    </div>
                  )}
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
                        {data?.speedStats?.bestSpeed?.toFixed(1) || '—'}
                        <span className="text-base font-normal text-gray-400 dark:text-gray-500 ml-2">км/ч</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="rounded-xl bg-warm-blue-50 dark:bg-charcoal-700 p-4 text-center border border-warm-blue-200 dark:border-warm-blue-600">
                        <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Средняя</div>
                        <div className="whitespace-nowrap text-2xl font-bold text-warm-blue-900 dark:text-warm-blue-400">
                          {data?.speedStats?.avgSpeed?.toFixed(1) || '—'}
                          <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-1">км/ч</span>
                        </div>
                      </div>
                      <div className="rounded-xl bg-warm-blue-50 dark:bg-charcoal-700 p-4 text-center border border-warm-blue-200 dark:border-warm-blue-600">
                        <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Замеров</div>
                        <div className="text-2xl font-bold text-warm-blue-900 dark:text-warm-blue-400">{uniqueSpeedRecords.length}</div>
                      </div>
                      {data?.speedStats?.breedRank > 0 && (
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
                        {data?.coursingStats?.bestTime?.toFixed(2) || '—'}
                        <span className="text-base font-normal text-gray-400 dark:text-gray-500 ml-2">сек</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-forest-50 dark:bg-charcoal-700 rounded-xl p-4 text-center border border-forest-200 dark:border-forest-600">
                        <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Среднее</div>
                        <div className="whitespace-nowrap text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">
                          {data?.coursingStats?.avgTime?.toFixed(2) || '—'}
                          <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-1">сек</span>
                        </div>
                      </div>
                      <div className="bg-forest-50 dark:bg-charcoal-700 rounded-xl p-4 text-center border border-forest-200 dark:border-forest-600">
                        <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Забегов</div>
                        <div className="text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">{coursingHistory.length}</div>
                      </div>
                      {data?.coursingStats?.breedRank > 0 && (
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
