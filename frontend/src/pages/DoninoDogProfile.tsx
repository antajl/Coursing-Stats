import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef, useMemo } from 'react'
import { ChevronLeft, Award, TrendingUp, Zap } from 'lucide-react'
import SkeletonLoader from '../components/SkeletonLoader'
import ErrorState from '../components/ErrorState'
import DogSexIcon from '../components/DogSexIcon'
import OwnerCrownName from '../components/OwnerCrownName'
import { formatRecordDate, dedupeByRecordDate, expandCoursingTimeline } from '../lib/recordDates'
import { SEO } from '../components/SEO'
import DoninoAttribution from '../components/DoninoAttribution'
import { api } from '../services/api'
import HoverTooltip from '../components/ui/HoverTooltip'
import AnimatedMeterBar from '../components/AnimatedMeterBar'

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
  const seoKeywords = useMemo(
    () => `${data?.name}, ${data?.breed}, рекорды Донино, замер скорости, бега борзых, 350 м, курсинг`,
    [data?.name, data?.breed],
  )
  const seoCanonical = useMemo(() => {
    if (!name || !breed) return undefined
    return `https://coursing-stats.ru/donino-dog/${encodeURIComponent(name)}/${encodeURIComponent(breed)}`
  }, [name, breed])

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
      <SEO title={seoTitle} description={seoDescription} keywords={seoKeywords} canonicalUrl={seoCanonical} />
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div ref={exportRef}>
          {/* Шапка профиля — кнопка «назад» вне потока, слева от карточки */}
          <div className="relative mb-6">
            <button
              type="button"
              onClick={handleBack}
              className="relative z-10 mb-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-old-money-500 transition-colors hover:bg-old-money-50 hover:text-camel-700 md:absolute md:right-full md:top-8 md:mb-0 md:mr-0.5 dark:text-old-money-400 dark:hover:bg-charcoal-700 dark:hover:text-camel-400"
              aria-label="Назад"
              data-export-ignore
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <div className="rounded-2xl border-2 border-old-money-200 bg-white p-5 shadow-md dark:border-charcoal-600 dark:bg-charcoal-800 md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:gap-6 md:divide-x md:divide-old-money-200 dark:md:divide-charcoal-600">
                <div className="w-full md:w-1/2">
                  <div className="flex flex-wrap items-baseline gap-3 md:gap-4">
                    <OwnerCrownName name={data?.name} breed={data?.breed} kind="donino">
                      <h1 className="text-2xl font-bold tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-3xl">{data?.name}</h1>
                    </OwnerCrownName>
                    {dogSex && <DogSexIcon sex={dogSex} size={18} className="mb-0.5" />}
                  </div>
                  <div className="mt-3">
                    <span className="inline-block rounded-full border border-old-money-200 bg-cream-100 px-4 py-1.5 text-sm font-semibold text-charcoal-700 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-charcoal-300">
                      {data?.breed}
                    </span>
                  </div>
                </div>
                {achievements.length > 0 && (
                  <div className="flex w-full flex-wrap items-start justify-end gap-2 md:w-1/2 md:pl-6">
                    {achievements.map((badge, idx) => (
                      <HoverTooltip key={idx} label={badge.tooltip}>
                        <div className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badge.color}`}>
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
          {/* Статистика и история — всегда 2 колонки; карточки статистики одной высоты */}
          {(hasSpeedRecords || hasCoursingRecords) && (
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              {hasSpeedRecords ? (
                <div className="flex min-w-0 flex-col gap-4">
                  <div className="flex h-[24rem] shrink-0 flex-col overflow-hidden rounded-2xl border-2 border-warm-blue-200 bg-white p-5 shadow-md dark:border-warm-blue-600 dark:bg-charcoal-800 md:h-[25rem] md:p-6">
                    <h2 className="mb-4 shrink-0 text-lg font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 md:text-xl">
                      Замер скорости
                    </h2>

                    <div className="mb-4 flex h-[7.25rem] shrink-0 flex-col items-center justify-center rounded-xl border-2 border-warm-blue-200 bg-warm-blue-50 p-4 text-center dark:border-warm-blue-600 dark:bg-charcoal-700">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
                        Лучшая скорость
                      </div>
                      <div className="whitespace-nowrap text-4xl font-bold tracking-tight text-warm-blue-800 dark:text-warm-blue-400">
                        {data?.speedStats?.bestSpeed?.toFixed(1) || '—'}
                        <span className="ml-2 text-base font-normal text-charcoal-400">км/ч</span>
                      </div>
                    </div>

                    <div className="mb-4 grid min-h-0 flex-1 grid-cols-2 gap-3 content-start">
                      <div className="rounded-xl border border-warm-blue-200 bg-warm-blue-50 p-4 text-center dark:border-warm-blue-600 dark:bg-charcoal-700">
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
                          Средняя
                        </div>
                        <div className="whitespace-nowrap text-2xl font-bold text-warm-blue-900 dark:text-warm-blue-400">
                          {data?.speedStats?.avgSpeed?.toFixed(1) || '—'}
                          <span className="ml-1 text-sm font-normal text-charcoal-400">км/ч</span>
                        </div>
                      </div>
                      <div className="rounded-xl border border-warm-blue-200 bg-warm-blue-50 p-4 text-center dark:border-warm-blue-600 dark:bg-charcoal-700">
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
                          Замеров
                        </div>
                        <div className="text-2xl font-bold text-warm-blue-900 dark:text-warm-blue-400">
                          {uniqueSpeedRecords.length}
                        </div>
                      </div>
                      <div className="rounded-xl border border-warm-blue-200 bg-warm-blue-50 p-4 text-center dark:border-warm-blue-600 dark:bg-charcoal-700">
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
                          Рейтинг в породе
                        </div>
                        <div className="text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">
                          {data?.speedStats?.breedRank > 0 ? (
                            <>
                              #{data.speedStats.breedRank}
                              <span className="ml-1 text-sm font-normal text-charcoal-400">
                                из {data.speedStats.breedTotal}
                              </span>
                            </>
                          ) : (
                            '—'
                          )}
                        </div>
                      </div>
                      <div
                        className="rounded-xl border border-dashed border-warm-blue-200 bg-warm-blue-50/50 opacity-50 dark:border-warm-blue-600 dark:bg-charcoal-700/50"
                        aria-hidden
                      />
                    </div>
                  </div>

                  {uniqueSpeedRecords.length > 0 && (
                    <div className="rounded-2xl border-2 border-warm-blue-200 bg-white p-5 shadow-md dark:border-warm-blue-600 dark:bg-charcoal-800 md:p-6">
                      <h3 className="mb-4 text-base font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 md:text-lg">
                        История
                      </h3>
                      <div className="space-y-2">
                        {uniqueSpeedRecords.map((record, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <div className="w-24 shrink-0 text-right text-sm text-charcoal-700 dark:text-charcoal-300">
                              {formatRecordDate(record.date)}
                            </div>
                            <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-cream-200 dark:bg-charcoal-600">
                              <AnimatedMeterBar
                                percent={(Number(record.speed_km_h) / 80) * 100}
                                className="h-full rounded-full bg-gradient-to-r from-warm-blue-400 to-warm-blue-600 transition-[width] duration-500 ease-out"
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
              ) : (
                <div className="flex h-[24rem] shrink-0 flex-col overflow-hidden rounded-2xl border-2 border-dashed border-warm-blue-200 bg-white p-5 shadow-md dark:border-warm-blue-600 dark:bg-charcoal-800 md:h-[25rem] md:p-6">
                  <h2 className="mb-4 shrink-0 text-lg font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 md:text-xl">
                    Замер скорости
                  </h2>
                  <div className="mb-4 flex h-[7.25rem] shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-warm-blue-200 bg-warm-blue-50/50 dark:border-warm-blue-600 dark:bg-charcoal-700/50">
                    <p className="text-sm font-medium text-old-money-500 dark:text-old-money-400">данных нет</p>
                  </div>
                  <div className="grid flex-1 grid-cols-2 content-start gap-3">
                    <div className="min-h-[5.5rem] rounded-xl border border-dashed border-warm-blue-200 bg-warm-blue-50/50 opacity-50 dark:border-warm-blue-600 dark:bg-charcoal-700/50" />
                    <div className="min-h-[5.5rem] rounded-xl border border-dashed border-warm-blue-200 bg-warm-blue-50/50 opacity-50 dark:border-warm-blue-600 dark:bg-charcoal-700/50" />
                    <div className="min-h-[5.5rem] rounded-xl border border-dashed border-warm-blue-200 bg-warm-blue-50/50 opacity-50 dark:border-warm-blue-600 dark:bg-charcoal-700/50" />
                    <div className="min-h-[5.5rem] rounded-xl border border-dashed border-warm-blue-200 bg-warm-blue-50/50 opacity-50 dark:border-warm-blue-600 dark:bg-charcoal-700/50" />
                  </div>
                </div>
              )}

              {hasCoursingRecords ? (
                <div className="flex min-w-0 flex-col gap-4">
                  <div className="flex h-[24rem] shrink-0 flex-col overflow-hidden rounded-2xl border-2 border-forest-200 bg-white p-5 shadow-md dark:border-forest-600 dark:bg-charcoal-800 md:h-[25rem] md:p-6">
                    <h2 className="mb-4 shrink-0 text-lg font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 md:text-xl">
                      Бега борзых (350 м)
                    </h2>

                    <div className="mb-4 flex h-[7.25rem] shrink-0 flex-col items-center justify-center rounded-xl border-2 border-forest-200 bg-forest-50 p-4 text-center dark:border-forest-600 dark:bg-charcoal-700">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
                        Лучшее время
                      </div>
                      <div className="whitespace-nowrap text-4xl font-bold tracking-tight text-forest-700 dark:text-forest-300">
                        {data?.coursingStats?.bestTime?.toFixed(2) || '—'}
                        <span className="ml-2 text-base font-normal text-charcoal-400">сек</span>
                      </div>
                    </div>

                    <div className="mb-4 grid min-h-0 flex-1 grid-cols-2 content-start gap-3">
                      <div className="rounded-xl border border-forest-200 bg-forest-50 p-4 text-center dark:border-forest-600 dark:bg-charcoal-700">
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
                          Среднее
                        </div>
                        <div className="whitespace-nowrap text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">
                          {data?.coursingStats?.avgTime?.toFixed(2) || '—'}
                          <span className="ml-1 text-sm font-normal text-charcoal-400">сек</span>
                        </div>
                      </div>
                      <div className="rounded-xl border border-forest-200 bg-forest-50 p-4 text-center dark:border-forest-600 dark:bg-charcoal-700">
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
                          Забегов
                        </div>
                        <div className="text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">
                          {coursingHistory.length}
                        </div>
                      </div>
                      <div className="rounded-xl border border-forest-200 bg-forest-50 p-4 text-center dark:border-forest-600 dark:bg-charcoal-700">
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
                          Рейтинг в породе
                        </div>
                        <div className="text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">
                          {data?.coursingStats?.breedRank > 0 ? (
                            <>
                              #{data.coursingStats.breedRank}
                              <span className="ml-1 text-sm font-normal text-charcoal-400">
                                из {data.coursingStats.breedTotal}
                              </span>
                            </>
                          ) : (
                            '—'
                          )}
                        </div>
                      </div>
                      <div
                        className="rounded-xl border border-dashed border-forest-200 bg-forest-50/50 opacity-50 dark:border-forest-600 dark:bg-charcoal-700/50"
                        aria-hidden
                      />
                    </div>
                  </div>

                  {coursingHistory.length > 0 && (
                    <div className="rounded-2xl border-2 border-forest-200 bg-white p-5 shadow-md dark:border-forest-600 dark:bg-charcoal-800 md:p-6">
                      <h3 className="mb-4 text-base font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 md:text-lg">
                        История
                      </h3>
                      <div className="space-y-2">
                        {coursingHistory.map((record, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <div className="w-24 shrink-0 text-right text-sm text-charcoal-700 dark:text-charcoal-300">
                              {formatRecordDate(record.date)}
                            </div>
                            <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-cream-200 dark:bg-charcoal-600">
                              <AnimatedMeterBar
                                percent={(30 / Number(record.time_seconds)) * 100}
                                className="h-full rounded-full bg-gradient-to-r from-forest-400 to-forest-600 transition-[width] duration-500 ease-out"
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
              ) : (
                <div className="flex h-[24rem] shrink-0 flex-col overflow-hidden rounded-2xl border-2 border-dashed border-forest-200 bg-white p-5 shadow-md dark:border-forest-600 dark:bg-charcoal-800 md:h-[25rem] md:p-6">
                  <h2 className="mb-4 shrink-0 text-lg font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 md:text-xl">
                    Бега борзых (350 м)
                  </h2>
                  <div className="mb-4 flex h-[7.25rem] shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-forest-200 bg-forest-50/50 dark:border-forest-600 dark:bg-charcoal-700/50">
                    <p className="text-sm font-medium text-old-money-500 dark:text-old-money-400">данных нет</p>
                  </div>
                  <div className="grid flex-1 grid-cols-2 content-start gap-3">
                    <div className="min-h-[5.5rem] rounded-xl border border-dashed border-forest-200 bg-forest-50/50 opacity-50 dark:border-forest-600 dark:bg-charcoal-700/50" />
                    <div className="min-h-[5.5rem] rounded-xl border border-dashed border-forest-200 bg-forest-50/50 opacity-50 dark:border-forest-600 dark:bg-charcoal-700/50" />
                    <div className="min-h-[5.5rem] rounded-xl border border-dashed border-forest-200 bg-forest-50/50 opacity-50 dark:border-forest-600 dark:bg-charcoal-700/50" />
                    <div className="min-h-[5.5rem] rounded-xl border border-dashed border-forest-200 bg-forest-50/50 opacity-50 dark:border-forest-600 dark:bg-charcoal-700/50" />
                  </div>
                </div>
              )}
            </div>
          )}

          {!hasSpeedRecords && !hasCoursingRecords && (
            <div className="rounded-2xl border-2 border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 p-6 text-center shadow-md">
              <p className="text-old-money-600 dark:text-old-money-400">Нет записей для этой собаки</p>
            </div>
          )}

          <DoninoAttribution className="mt-6 text-center" />
        </div>
      </div>
    </div>
    </>
  )
}
