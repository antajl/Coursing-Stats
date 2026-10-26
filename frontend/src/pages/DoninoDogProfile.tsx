import { useParams, useLocation, Link } from 'react-router-dom'
import { useState, useEffect, useRef, useMemo } from 'react'
import {
  Award,
  TrendingUp,
  Zap,
  Trophy,
  Medal,
  Crown,
  Gauge,
  ArrowRight,
  Star as StarIcon,
} from 'lucide-react'
import SkeletonLoader from '../components/SkeletonLoader'
import ErrorState from '../components/ErrorState'
import DogSexIcon from '../components/DogSexIcon'
import OwnerCrownName from '../components/OwnerCrownName'
import {
  formatRecordDate,
  dedupeByRecordDate,
  expandCoursingTimeline,
  expandSpeedTimeline,
} from '../lib/recordDates'
import { toDogTitleCase } from '../lib/dogName'
import { displayBreed } from '../lib/breedMapping'
import { useFavorites } from '../hooks/useFavorites'
import { SEO } from '../components/SEO'
import DoninoAttribution from '../components/DoninoAttribution'
import { api } from '../services/api'
import HoverTooltip from '../components/ui/HoverTooltip'
import AnimatedMeterBar from '../components/AnimatedMeterBar'
import { SegmentedTabs } from '../components/ui/SegmentedTabs'

export default function DoninoDogProfile() {
  const { name, breed } = useParams()
  const location = useLocation()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const exportRef = useRef<HTMLDivElement>(null)

  const fromCoursingRecords = location.state?.from === 'coursing-records'
  const [mobileTab, setMobileTab] = useState<'speed' | 'coursing'>(() =>
    fromCoursingRecords ? 'coursing' : 'speed'
  )

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

  // Calculate derived values with useMemo (must be before early returns)
  const hasSpeedRecords = useMemo(() => data?.speedStats?.total > 0, [data?.speedStats?.total])
  const hasCoursingRecords = useMemo(() => data?.coursingStats?.total > 0, [data?.coursingStats?.total])
  const speedTimeline = useMemo(() => {
    if (!data?.speedRecords) return []
    return expandSpeedTimeline(data.speedRecords)
  }, [data?.speedRecords])
  const uniqueSpeedRecords = useMemo(() => {
    if (speedTimeline.length > 0) return speedTimeline
    if (!data?.speedRecords) return []
    return dedupeByRecordDate(
      data.speedRecords,
      (candidate, existing) => candidate.speed_km_h > existing.speed_km_h
    )
  }, [speedTimeline, data?.speedRecords])
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
  const dogSex = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => data?.sex || data?.speedRecords?.find((r: any) => r.sex)?.sex || '',
    [data?.sex, data?.speedRecords]
  )

  useEffect(() => {
    if (!hasSpeedRecords && hasCoursingRecords) {
      setMobileTab('coursing')
    } else if (hasSpeedRecords && !hasCoursingRecords) {
      setMobileTab('speed')
    }
  }, [hasSpeedRecords, hasCoursingRecords])

  const displayName = useMemo(() => toDogTitleCase(data?.name || name || ''), [data?.name, name])
  const breedInfo = useMemo(() => displayBreed(data?.breed || breed || ''), [data?.breed, breed])

  const { isFavorite, toggleFavorite } = useFavorites()
  const [loadingFavorite, setLoadingFavorite] = useState(false)
  const favoriteKey = data?.dog_id ? String(data.dog_id) : `donino:${name}:${breed}`
  const favorite = isFavorite(favoriteKey)

  const handleToggleFavorite = async () => {
    try {
      setLoadingFavorite(true)
      await toggleFavorite(favoriteKey, {
        name: displayName,
        breed: data?.breed || breed || '',
      })
    } finally {
      setLoadingFavorite(false)
    }
  }

  // Achievements calculation (Old Money podium palette, max 5)
  const achievements = useMemo(() => {
    const badges: {
      id: string
      icon: React.ReactNode
      label: string
      sublabel?: string
      color: string
      tooltip: string
    }[] = []

    // Combined achievements
    const isTop5Speed = data?.speedStats?.breedRank > 0 && data.speedStats.breedRank <= 5
    const isTop5Coursing = data?.coursingStats?.breedRank > 0 && data.coursingStats.breedRank <= 5

    // Champion (top-5 in both categories) - HIGHEST PRIORITY
    if (isTop5Speed && isTop5Coursing) {
      badges.push({
        id: 'champion',
        icon: <Crown className="h-3.5 w-3.5 text-amber-600 shrink-0" />,
        label: 'Чемпион Донино',
        sublabel: 'Скорость и 350 м',
        color: 'bg-amber-100/90 text-amber-950 border border-amber-400 font-bold shadow-2xs',
        tooltip: 'Входит в топ-5 породы как по скорости, так и по времени на 350 м',
      })
    }

    // Top-5 breed badge for speed
    const speedRank = data?.speedStats?.breedRank
    if (speedRank === 1) {
      badges.push({
        id: 'speed-rank-1',
        icon: <Trophy className="h-3.5 w-3.5 text-amber-600 shrink-0" />,
        label: 'Топ-1 в породе',
        sublabel: 'Скорость',
        color: 'bg-amber-50 text-amber-950 border border-amber-300/90 shadow-2xs',
        tooltip: `№1 в рейтинге породы по скорости (${data.speedStats.bestSpeed?.toFixed(1)} км/ч)`,
      })
    } else if (speedRank === 2) {
      badges.push({
        id: 'speed-rank-2',
        icon: <Medal className="h-3.5 w-3.5 text-slate-600 shrink-0" />,
        label: 'Топ-2 в породе',
        sublabel: 'Скорость',
        color: 'bg-slate-50 text-slate-900 border border-slate-300/90 shadow-2xs',
        tooltip: `№2 в рейтинге породы по скорости (${data.speedStats.bestSpeed?.toFixed(1)} км/ч)`,
      })
    } else if (speedRank === 3) {
      badges.push({
        id: 'speed-rank-3',
        icon: <Medal className="h-3.5 w-3.5 text-amber-700 shrink-0" />,
        label: 'Топ-3 в породе',
        sublabel: 'Скорость',
        color: 'bg-orange-50 text-amber-950 border border-amber-300/80 shadow-2xs',
        tooltip: `№3 в рейтинге породы по скорости (${data.speedStats.bestSpeed?.toFixed(1)} км/ч)`,
      })
    } else if (speedRank && speedRank <= 5) {
      badges.push({
        id: 'speed-rank-top5',
        icon: <Award className="h-3.5 w-3.5 text-camel-700 shrink-0" />,
        label: `Топ-${speedRank} в породе`,
        sublabel: 'Скорость',
        color: 'bg-cream-100 text-charcoal-800 border border-old-money-200/90',
        tooltip: `Входит в топ-${speedRank} собак породы по скорости (${data.speedStats.breedTotal} собак)`,
      })
    }

    // Top-5 breed badge for coursing
    const coursingRank = data?.coursingStats?.breedRank
    if (coursingRank === 1) {
      badges.push({
        id: 'coursing-rank-1',
        icon: <Trophy className="h-3.5 w-3.5 text-amber-600 shrink-0" />,
        label: 'Топ-1 в породе',
        sublabel: 'Бега 350 м',
        color: 'bg-amber-50 text-amber-950 border border-amber-300/90 shadow-2xs',
        tooltip: `№1 в рейтинге породы на 350 м (${data.coursingStats.bestTime?.toFixed(2)} с)`,
      })
    } else if (coursingRank === 2) {
      badges.push({
        id: 'coursing-rank-2',
        icon: <Medal className="h-3.5 w-3.5 text-slate-600 shrink-0" />,
        label: 'Топ-2 в породе',
        sublabel: 'Бега 350 м',
        color: 'bg-slate-50 text-slate-900 border border-slate-300/90 shadow-2xs',
        tooltip: `№2 в рейтинге породы на 350 м (${data.coursingStats.bestTime?.toFixed(2)} с)`,
      })
    } else if (coursingRank === 3) {
      badges.push({
        id: 'coursing-rank-3',
        icon: <Medal className="h-3.5 w-3.5 text-amber-700 shrink-0" />,
        label: 'Топ-3 в породе',
        sublabel: 'Бега 350 м',
        color: 'bg-orange-50 text-amber-950 border border-amber-300/80 shadow-2xs',
        tooltip: `№3 в рейтинге породы на 350 м (${data.coursingStats.bestTime?.toFixed(2)} с)`,
      })
    } else if (coursingRank && coursingRank <= 5) {
      badges.push({
        id: 'coursing-rank-top5',
        icon: <Award className="h-3.5 w-3.5 text-camel-700 shrink-0" />,
        label: `Топ-${coursingRank} в породе`,
        sublabel: 'Бега 350 м',
        color: 'bg-cream-100 text-charcoal-800 border border-old-money-200/90',
        tooltip: `Входит в топ-${coursingRank} собак породы на 350 м (${data.coursingStats.breedTotal} собак)`,
      })
    }

    // Speed master (60+ km/h)
    if (uniqueSpeedRecords.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const maxSpeed = Math.max(...uniqueSpeedRecords.map((r: any) => Number(r.speed_km_h)))
      if (maxSpeed >= 60) {
        badges.push({
          id: 'speed-master',
          icon: <Zap className="h-3.5 w-3.5 text-sky-600 shrink-0" />,
          label: 'Мастер скорости',
          sublabel: `${maxSpeed.toFixed(1)} км/ч`,
          color: 'bg-sky-50 text-sky-950 border border-sky-300 shadow-2xs',
          tooltip: `Максимальная зафиксированная скорость: ${maxSpeed.toFixed(1)} км/ч`,
        })
      }
    }

    // Time master (<= 20 s for 350m)
    if (coursingHistory.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const minTime = Math.min(...coursingHistory.map((r: any) => Number(r.time_seconds)))
      if (minTime <= 20) {
        badges.push({
          id: 'time-master',
          icon: <Gauge className="h-3.5 w-3.5 text-forest-600 shrink-0" />,
          label: 'Мастер времени',
          sublabel: `${minTime.toFixed(2)} с`,
          color: 'bg-forest-50 text-forest-900 border border-forest-300 shadow-2xs',
          tooltip: `Рекордное время на 350 м: ${minTime.toFixed(2)} с`,
        })
      }
    }

    // Breakthrough (10%+ improvement)
    if (uniqueSpeedRecords.length >= 2) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sorted = [...uniqueSpeedRecords].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const first = sorted[0] as any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const last = sorted[sorted.length - 1] as any
      if (first && last) {
        const firstSpeed = Number(first.speed_km_h)
        const lastSpeed = Number(last.speed_km_h)
        const improvement = ((lastSpeed - firstSpeed) / firstSpeed) * 100
        if (improvement >= 10) {
          badges.push({
            id: 'breakthrough',
            icon: <TrendingUp className="h-3.5 w-3.5 text-emerald-600 shrink-0" />,
            label: 'Прорыв',
            sublabel: `+${improvement.toFixed(0)}%`,
            color: 'bg-emerald-50 text-emerald-950 border border-emerald-300 shadow-2xs',
            tooltip: `Улучшение скорости на ${improvement.toFixed(0)}% от первого замера`,
          })
        }
      }
    }

    // Veteran (6+ total records in both categories)
    const totalRecords = uniqueSpeedRecords.length + coursingHistory.length
    if (totalRecords >= 6) {
      badges.push({
        id: 'veteran',
        icon: <Award className="h-3.5 w-3.5 text-camel-700 shrink-0" />,
        label: 'Ветеран клуба',
        sublabel: `${totalRecords} забегов`,
        color: 'bg-cream-100 text-charcoal-800 border border-old-money-200/90',
        tooltip: `${totalRecords} официальных замеров и забегов на полигоне`,
      })
    }

    return badges.slice(0, 5)
  }, [uniqueSpeedRecords, coursingHistory, data?.speedStats, data?.coursingStats])

  // SEO values
  const seoTitle = useMemo(() => `${displayName} — ${breedInfo.primary}`, [displayName, breedInfo.primary])
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
      return `Рекорды Донино: ${displayName} (${breedInfo.primary}). ${seoFacts.join('; ')}.`
    }
    return `Рекорды Донино: ${displayName} (${breedInfo.primary}). Замер скорости и бега борзых 350 м.`
  }, [seoFacts, displayName, breedInfo.primary])
  const seoKeywords = useMemo(
    () => `${displayName}, ${breedInfo.primary}, рекорды Донино, замер скорости, бега борзых, 350 м, курсинг`,
    [displayName, breedInfo.primary],
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
            {/* Шапка профиля */}
            <div className="relative mb-6">
              <div className="rounded-2xl border-2 border-old-money-200 bg-white p-4 sm:p-5 md:p-6 shadow-md">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  {/* Левая часть: Кличка и пол */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3">
                      <OwnerCrownName name={data?.name} breed={data?.breed} kind="donino">
                        <h1 className="break-words text-2xl font-bold tracking-tight text-charcoal-900 md:text-3xl">
                          {displayName}
                        </h1>
                      </OwnerCrownName>
                      {dogSex && <DogSexIcon sex={dogSex} size={20} className="mb-0.5 shrink-0" />}
                    </div>
                  </div>

                  {/* Правая часть: Достижения и награды (подиум Old Money) */}
                  {achievements.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:justify-end">
                      {achievements.map((badge) => (
                        <HoverTooltip key={badge.id} label={badge.tooltip}>
                          <div
                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badge.color}`}
                          >
                            {badge.icon}
                            <span>{badge.label}</span>
                            {badge.sublabel && (
                              <span className="font-normal opacity-80">· {badge.sublabel}</span>
                            )}
                          </div>
                        </HoverTooltip>
                      ))}
                    </div>
                  )}
                </div>

                {/* Нижняя строка шапки: Порода, Избранное, Ссылка в спорт */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-old-money-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="inline-block rounded-full border border-old-money-200 bg-cream-100 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-charcoal-700"
                      title={
                        breedInfo.secondary
                          ? `${breedInfo.primary} — ${breedInfo.secondary}`
                          : breedInfo.primary
                      }
                    >
                      {breedInfo.primary}
                    </span>

                    {/* Кнопка в избранное */}
                    <button
                      type="button"
                      onClick={handleToggleFavorite}
                      disabled={loadingFavorite}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                        favorite
                          ? 'border-amber-400 bg-amber-50 text-amber-700 hover:border-amber-500 hover:bg-amber-100'
                          : 'border-old-money-200 bg-white text-camel-700 hover:border-camel-400 hover:bg-camel-50'
                      }`}
                      aria-label={favorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                      title={favorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                      data-export-ignore
                    >
                      <StarIcon
                        className={`h-3.5 w-3.5 shrink-0 ${favorite ? 'fill-current' : ''}`}
                        aria-hidden
                      />
                      <span>{favorite ? 'В избранном' : 'В избранное'}</span>
                    </button>

                    {/* Ссылка на официальный профиль в спорте при наличии dog_id */}
                    {data?.dog_id && (
                      <Link
                        to={`/dog/${data.dog_id}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-forest-200 bg-forest-50 px-3.5 py-1.5 text-xs font-semibold text-forest-800 transition-colors hover:border-forest-300 hover:bg-forest-100"
                        title="Перейти в официальный спортивный профиль собаки (соревнования РКФ)"
                        data-export-ignore
                      >
                        <Trophy className="h-3.5 w-3.5 text-forest-600 shrink-0" />
                        <span>Профиль в спорте</span>
                        <ArrowRight className="h-3 w-3 text-forest-600 shrink-0" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Мобильный переключатель дисциплин (если есть обе) */}
            {hasSpeedRecords && hasCoursingRecords && (
              <SegmentedTabs
                tabs={[
                  { id: 'speed', label: 'Замер скорости', count: uniqueSpeedRecords.length },
                  { id: 'coursing', label: 'Бега 350 м', count: coursingHistory.length },
                ]}
                activeTab={mobileTab}
                onChange={setMobileTab}
                ariaLabel="Дисциплины собаки"
                className="mb-4"
              />
            )}

            {/* Статистика и история */}
            {(hasSpeedRecords || hasCoursingRecords) && (
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                {hasSpeedRecords ? (
                  <div
                    className={`min-w-0 flex-col gap-4 ${
                      mobileTab === 'speed' || !hasCoursingRecords ? 'flex' : 'hidden md:flex'
                    }`}
                  >
                    <div className="flex min-h-[22rem] md:h-[25rem] shrink-0 flex-col rounded-2xl border-2 border-warm-blue-200 bg-white p-4 sm:p-5 shadow-md md:p-6">
                      <h2 className="mb-3 sm:mb-4 shrink-0 text-lg font-bold tracking-tight text-charcoal-800 md:text-xl">
                        Замер скорости
                      </h2>

                      <div className="mb-3 sm:mb-4 flex h-[6.5rem] sm:h-[7.25rem] shrink-0 flex-col items-center justify-center rounded-xl border-2 border-warm-blue-200 bg-warm-blue-50 p-3 sm:p-4 text-center">
                        <div className="mb-1 sm:mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal-500">
                          Лучшая скорость
                        </div>
                        <div className="whitespace-nowrap text-3xl sm:text-4xl font-bold tracking-tight text-warm-blue-800">
                          {data?.speedStats?.bestSpeed?.toFixed(1) || '—'}
                          <span className="ml-1.5 sm:ml-2 text-sm sm:text-base font-normal text-charcoal-400">
                            км/ч
                          </span>
                        </div>
                      </div>

                      <div className="mb-2 sm:mb-4 grid min-h-0 flex-1 grid-cols-2 gap-2 sm:gap-3 content-start">
                        <div className="rounded-xl border border-warm-blue-200 bg-warm-blue-50 p-2.5 sm:p-4 text-center">
                          <div className="mb-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-old-money-500">
                            Средняя
                          </div>
                          <div className="whitespace-nowrap text-xl sm:text-2xl font-bold text-warm-blue-900">
                            {data?.speedStats?.avgSpeed?.toFixed(1) || '—'}
                            <span className="ml-1 text-xs sm:text-sm font-normal text-charcoal-400">
                              км/ч
                            </span>
                          </div>
                        </div>
                        <div className="rounded-xl border border-warm-blue-200 bg-warm-blue-50 p-2.5 sm:p-4 text-center">
                          <div className="mb-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-old-money-500">
                            Замеров
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-warm-blue-900">
                            {uniqueSpeedRecords.length}
                          </div>
                        </div>
                        <div className="rounded-xl border border-warm-blue-200 bg-warm-blue-50 p-2.5 sm:p-4 text-center">
                          <div className="mb-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-old-money-500">
                            Рейтинг в породе
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-charcoal-800">
                            {data?.speedStats?.breedRank > 0 ? (
                              <>
                                #{data.speedStats.breedRank}
                                <span className="ml-1 text-xs sm:text-sm font-normal text-charcoal-400">
                                  из {data.speedStats.breedTotal}
                                </span>
                              </>
                            ) : (
                              '—'
                            )}
                          </div>
                        </div>
                        <div
                          className="rounded-xl border border-dashed border-warm-blue-200 bg-warm-blue-50/50 opacity-50"
                          aria-hidden
                        />
                      </div>
                    </div>

                    {uniqueSpeedRecords.length > 0 && (
                      <div className="rounded-2xl border-2 border-warm-blue-200 bg-white p-4 sm:p-5 shadow-md md:p-6">
                        <h3 className="mb-3 sm:mb-4 text-base font-bold tracking-tight text-charcoal-800 md:text-lg">
                          История
                        </h3>
                        <div className="space-y-2">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {uniqueSpeedRecords.map((record: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2.5 sm:gap-4">
                              <div className="w-20 sm:w-24 shrink-0 text-right text-xs sm:text-sm text-charcoal-700">
                                {formatRecordDate(record.date)}
                              </div>
                              <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-cream-200">
                                <AnimatedMeterBar
                                  percent={(Number(record.speed_km_h) / 80) * 100}
                                  className="h-full rounded-full bg-gradient-to-r from-warm-blue-400 to-warm-blue-600 transition-[width] duration-500 ease-out"
                                />
                                <div className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-bold text-charcoal-900">
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
                  <div
                    className={`min-h-[22rem] md:h-[25rem] shrink-0 flex-col rounded-2xl border-2 border-dashed border-warm-blue-200 bg-white p-4 sm:p-5 shadow-md md:p-6 ${
                      mobileTab === 'speed' || !hasCoursingRecords ? 'flex' : 'hidden md:flex'
                    }`}
                  >
                    <h2 className="mb-4 shrink-0 text-lg font-bold tracking-tight text-charcoal-800 md:text-xl">
                      Замер скорости
                    </h2>
                    <div className="mb-4 flex h-[6.5rem] sm:h-[7.25rem] shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-warm-blue-200 bg-warm-blue-50/50 opacity-50">
                      <p className="text-sm font-medium text-old-money-500">данных нет</p>
                    </div>
                    <div className="grid flex-1 grid-cols-2 content-start gap-2.5 sm:gap-3">
                      <div className="min-h-[5rem] rounded-xl border border-dashed border-warm-blue-200 bg-warm-blue-50/50 opacity-50" />
                      <div className="min-h-[5rem] rounded-xl border border-dashed border-warm-blue-200 bg-warm-blue-50/50 opacity-50" />
                      <div className="min-h-[5rem] rounded-xl border border-dashed border-warm-blue-200 bg-warm-blue-50/50 opacity-50" />
                      <div className="min-h-[5rem] rounded-xl border border-dashed border-warm-blue-200 bg-warm-blue-50/50 opacity-50" />
                    </div>
                  </div>
                )}

                {hasCoursingRecords ? (
                  <div
                    className={`min-w-0 flex-col gap-4 ${
                      mobileTab === 'coursing' || !hasSpeedRecords ? 'flex' : 'hidden md:flex'
                    }`}
                  >
                    <div className="flex min-h-[22rem] md:h-[25rem] shrink-0 flex-col rounded-2xl border-2 border-forest-200 bg-white p-4 sm:p-5 shadow-md md:p-6">
                      <h2 className="mb-3 sm:mb-4 shrink-0 text-lg font-bold tracking-tight text-charcoal-800 md:text-xl">
                        Бега борзых (350 м)
                      </h2>

                      <div className="mb-3 sm:mb-4 flex h-[6.5rem] sm:h-[7.25rem] shrink-0 flex-col items-center justify-center rounded-xl border-2 border-forest-200 bg-forest-50 p-3 sm:p-4 text-center">
                        <div className="mb-1 sm:mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal-500">
                          Лучшее время
                        </div>
                        <div className="whitespace-nowrap text-3xl sm:text-4xl font-bold tracking-tight text-forest-700">
                          {data?.coursingStats?.bestTime?.toFixed(2) || '—'}
                          <span className="ml-1.5 sm:ml-2 text-sm sm:text-base font-normal text-charcoal-400">
                            сек
                          </span>
                        </div>
                      </div>

                      <div className="mb-2 sm:mb-4 grid min-h-0 flex-1 grid-cols-2 gap-2 sm:gap-3 content-start">
                        <div className="rounded-xl border border-forest-200 bg-forest-50 p-2.5 sm:p-4 text-center">
                          <div className="mb-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-old-money-500">
                            Среднее
                          </div>
                          <div className="whitespace-nowrap text-xl sm:text-2xl font-bold text-charcoal-800">
                            {data?.coursingStats?.avgTime?.toFixed(2) || '—'}
                            <span className="ml-1 text-xs sm:text-sm font-normal text-charcoal-400">
                              сек
                            </span>
                          </div>
                        </div>
                        <div className="rounded-xl border border-forest-200 bg-forest-50 p-2.5 sm:p-4 text-center">
                          <div className="mb-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-old-money-500">
                            Забегов
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-charcoal-800">
                            {coursingHistory.length}
                          </div>
                        </div>
                        <div className="rounded-xl border border-forest-200 bg-forest-50 p-2.5 sm:p-4 text-center">
                          <div className="mb-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-old-money-500">
                            Рейтинг в породе
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-charcoal-800">
                            {data?.coursingStats?.breedRank > 0 ? (
                              <>
                                #{data.coursingStats.breedRank}
                                <span className="ml-1 text-xs sm:text-sm font-normal text-charcoal-400">
                                  из {data.coursingStats.breedTotal}
                                </span>
                              </>
                            ) : (
                              '—'
                            )}
                          </div>
                        </div>
                        <div
                          className="rounded-xl border border-dashed border-forest-200 bg-forest-50/50 opacity-50"
                          aria-hidden
                        />
                      </div>
                    </div>

                    {coursingHistory.length > 0 && (
                      <div className="rounded-2xl border-2 border-forest-200 bg-white p-4 sm:p-5 shadow-md md:p-6">
                        <h3 className="mb-3 sm:mb-4 text-base font-bold tracking-tight text-charcoal-800 md:text-lg">
                          История
                        </h3>
                        <div className="space-y-2">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {coursingHistory.map((record: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2.5 sm:gap-4">
                              <div className="w-20 sm:w-24 shrink-0 text-right text-xs sm:text-sm text-charcoal-700">
                                {formatRecordDate(record.date)}
                              </div>
                              <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-cream-200">
                                <AnimatedMeterBar
                                  percent={(30 / Number(record.time_seconds)) * 100}
                                  className="h-full rounded-full bg-gradient-to-r from-forest-400 to-forest-600 transition-[width] duration-500 ease-out"
                                />
                                <div className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-bold text-charcoal-900">
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
                  <div
                    className={`min-h-[22rem] md:h-[25rem] shrink-0 flex-col rounded-2xl border-2 border-dashed border-forest-200 bg-white p-4 sm:p-5 shadow-md md:p-6 ${
                      mobileTab === 'coursing' || !hasSpeedRecords ? 'flex' : 'hidden md:flex'
                    }`}
                  >
                    <h2 className="mb-4 shrink-0 text-lg font-bold tracking-tight text-charcoal-800 md:text-xl">
                      Бега борзых (350 м)
                    </h2>
                    <div className="mb-4 flex h-[6.5rem] sm:h-[7.25rem] shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-forest-200 bg-forest-50/50 opacity-50">
                      <p className="text-sm font-medium text-old-money-500">данных нет</p>
                    </div>
                    <div className="grid flex-1 grid-cols-2 content-start gap-2.5 sm:gap-3">
                      <div className="min-h-[5rem] rounded-xl border border-dashed border-forest-200 bg-forest-50/50 opacity-50" />
                      <div className="min-h-[5rem] rounded-xl border border-dashed border-forest-200 bg-forest-50/50 opacity-50" />
                      <div className="min-h-[5rem] rounded-xl border border-dashed border-forest-200 bg-forest-50/50 opacity-50" />
                      <div className="min-h-[5rem] rounded-xl border border-dashed border-forest-200 bg-forest-50/50 opacity-50" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {!hasSpeedRecords && !hasCoursingRecords && (
              <div className="rounded-2xl border-2 border-old-money-200 bg-white p-6 text-center shadow-md">
                <p className="text-old-money-600">Нет записей для этой собаки</p>
              </div>
            )}

            <DoninoAttribution className="mt-6 text-center" />
          </div>
        </div>
      </div>
    </>
  )
}
