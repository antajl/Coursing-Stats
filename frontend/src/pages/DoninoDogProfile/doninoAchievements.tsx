import React from 'react'
import { Award, Crown, Gauge, Medal, TrendingUp, Trophy, Zap } from 'lucide-react'

export interface DoninoAchievementBadge {
  id: string
  icon: React.ReactNode
  label: string
  sublabel?: string
  color: string
  tooltip: string
}

export interface DoninoDogStats {
  speedStats?: {
    total?: number
    bestSpeed?: number
    avgSpeed?: number
    breedRank?: number
    breedTotal?: number
  }
  coursingStats?: {
    total?: number
    bestTime?: number
    avgTime?: number
    breedRank?: number
    breedTotal?: number
  }
}

/**
 * Расчёт бейджей достижений собаки Донино (палитра подиума Old Money, максимум 5 бейджей)
 */
export function computeDoninoAchievements(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uniqueSpeedRecords: any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coursingHistory: any[],
): DoninoAchievementBadge[] {
  const badges: DoninoAchievementBadge[] = []

  // Combined achievements
  const isTop5Speed = (data?.speedStats?.breedRank || 0) > 0 && (data?.speedStats?.breedRank || 0) <= 5
  const isTop5Coursing = (data?.coursingStats?.breedRank || 0) > 0 && (data?.coursingStats?.breedRank || 0) <= 5

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
      tooltip: `№1 в рейтинге породы по скорости (${data?.speedStats?.bestSpeed?.toFixed(1)} км/ч)`,
    })
  } else if (speedRank === 2) {
    badges.push({
      id: 'speed-rank-2',
      icon: <Medal className="h-3.5 w-3.5 text-slate-600 shrink-0" />,
      label: 'Топ-2 в породе',
      sublabel: 'Скорость',
      color: 'bg-slate-50 text-slate-900 border border-slate-300/90 shadow-2xs',
      tooltip: `№2 в рейтинге породы по скорости (${data?.speedStats?.bestSpeed?.toFixed(1)} км/ч)`,
    })
  } else if (speedRank === 3) {
    badges.push({
      id: 'speed-rank-3',
      icon: <Medal className="h-3.5 w-3.5 text-amber-700 shrink-0" />,
      label: 'Топ-3 в породе',
      sublabel: 'Скорость',
      color: 'bg-orange-50 text-amber-950 border border-amber-300/80 shadow-2xs',
      tooltip: `№3 в рейтинге породы по скорости (${data?.speedStats?.bestSpeed?.toFixed(1)} км/ч)`,
    })
  } else if (speedRank && speedRank <= 5) {
    badges.push({
      id: 'speed-rank-top5',
      icon: <Award className="h-3.5 w-3.5 text-camel-700 shrink-0" />,
      label: `Топ-${speedRank} в породе`,
      sublabel: 'Скорость',
      color: 'bg-cream-100 text-charcoal-800 border border-old-money-200/90',
      tooltip: `Входит в топ-${speedRank} собак породы по скорости (${data?.speedStats?.breedTotal} собак)`,
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
      tooltip: `№1 в рейтинге породы на 350 м (${data?.coursingStats?.bestTime?.toFixed(2)} с)`,
    })
  } else if (coursingRank === 2) {
    badges.push({
      id: 'coursing-rank-2',
      icon: <Medal className="h-3.5 w-3.5 text-slate-600 shrink-0" />,
      label: 'Топ-2 в породе',
      sublabel: 'Бега 350 м',
      color: 'bg-slate-50 text-slate-900 border border-slate-300/90 shadow-2xs',
      tooltip: `№2 в рейтинге породы на 350 м (${data?.coursingStats?.bestTime?.toFixed(2)} с)`,
    })
  } else if (coursingRank === 3) {
    badges.push({
      id: 'coursing-rank-3',
      icon: <Medal className="h-3.5 w-3.5 text-amber-700 shrink-0" />,
      label: 'Топ-3 в породе',
      sublabel: 'Бега 350 м',
      color: 'bg-orange-50 text-amber-950 border border-amber-300/80 shadow-2xs',
      tooltip: `№3 в рейтинге породы на 350 м (${data?.coursingStats?.bestTime?.toFixed(2)} с)`,
    })
  } else if (coursingRank && coursingRank <= 5) {
    badges.push({
      id: 'coursing-rank-top5',
      icon: <Award className="h-3.5 w-3.5 text-camel-700 shrink-0" />,
      label: `Топ-${coursingRank} в породе`,
      sublabel: 'Бега 350 м',
      color: 'bg-cream-100 text-charcoal-800 border border-old-money-200/90',
      tooltip: `Входит в топ-${coursingRank} собак породы на 350 м (${data?.coursingStats?.breedTotal} собак)`,
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
}
