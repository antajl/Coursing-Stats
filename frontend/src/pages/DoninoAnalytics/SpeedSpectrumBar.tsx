import React, { useMemo } from 'react'
import { Activity } from 'lucide-react'
import type { SpeedRecordRow } from '../SpeedRecords/stats/doninoStatsUtils'

interface SpeedSpectrumBarProps {
  speedRecords: SpeedRecordRow[]
}

const CATEGORIES = [
  {
    id: 'elite',
    label: '60+ км/ч',
    title: 'Супер-спринт',
    desc: 'Грейхаунды, топовые Салюки и Уиппеты',
    min: 60,
    max: 100,
    color: 'bg-emerald-600',
    dotColor: 'bg-emerald-600',
  },
  {
    id: 'high',
    label: '55–60 км/ч',
    title: 'Высокая скорость',
    desc: 'Основной спортивный пул борзых',
    min: 55,
    max: 59.99,
    color: 'bg-camel-600',
    dotColor: 'bg-camel-600',
  },
  {
    id: 'cruise',
    label: '50–55 км/ч',
    title: 'Крейсерский спринт',
    desc: 'Басенджи, риджбеки, молодые борзые',
    min: 50,
    max: 54.99,
    color: 'bg-amber-500',
    dotColor: 'bg-amber-500',
  },
  {
    id: 'junior',
    label: 'до 50 км/ч',
    title: 'Юниоры и малые',
    desc: 'Левретки, щенки, начальный уровень',
    min: 0,
    max: 49.99,
    color: 'bg-charcoal-400',
    dotColor: 'bg-charcoal-400',
  },
]

export default function SpeedSpectrumBar({ speedRecords }: SpeedSpectrumBarProps) {
  // Aggregate unique dogs by their highest speed
  const { stats, totalDogs } = useMemo(() => {
    const dogMaxSpeed = new Map<string, number>()
    for (const r of speedRecords) {
      if (!r.name) continue
      const sp = parseFloat(String(r.speed_km_h))
      if (sp > 0) {
        const cur = dogMaxSpeed.get(r.name) || 0
        if (sp > cur) dogMaxSpeed.set(r.name, sp)
      }
    }

    const total = dogMaxSpeed.size
    const counts = { elite: 0, high: 0, cruise: 0, junior: 0 }

    for (const speed of dogMaxSpeed.values()) {
      if (speed >= 60) counts.elite++
      else if (speed >= 55) counts.high++
      else if (speed >= 50) counts.cruise++
      else counts.junior++
    }

    return {
      stats: counts,
      totalDogs: total,
    }
  }, [speedRecords])

  if (totalDogs === 0) return null

  return (
    <div className="rounded-2xl border border-old-money-200 bg-white/95 p-3.5 sm:p-4 shadow-2xs space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cream-200/80 pb-2">
        <h3 className="text-sm sm:text-base font-serif font-bold text-charcoal-900 tracking-tight flex items-center gap-2">
          <Activity className="w-4 h-4 text-camel-700" />
          Скоростной спектр полигона
        </h3>
        <span className="text-[11px] font-semibold text-charcoal-600 bg-cream-100 px-2 py-0.5 rounded-full border border-cream-200 tabular-nums">
          {totalDogs} соб.
        </span>
      </div>

      {/* Stacked Progress Bar */}
      <div className="w-full h-2.5 bg-cream-200 rounded-full overflow-hidden flex shadow-inner">
        {CATEGORIES.map((cat) => {
          const count = stats[cat.id as keyof typeof stats] || 0
          const pct = totalDogs > 0 ? (count / totalDogs) * 100 : 0
          if (pct === 0) return null
          return (
            <div
              key={cat.id}
              className={`${cat.color} h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full`}
              style={{ width: `${pct}%` }}
              title={`${cat.title} (${cat.label}): ${count} собак (${Math.round(pct)}%)`}
            />
          )
        })}
      </div>

      {/* 4 Category Descriptions (compact 2x2 grid) */}
      <div className="grid grid-cols-2 gap-1.5">
        {CATEGORIES.map((cat) => {
          const count = stats[cat.id as keyof typeof stats] || 0
          const pct = totalDogs > 0 ? Math.round((count / totalDogs) * 100) : 0
          return (
            <div
              key={cat.id}
              className="rounded-xl border border-cream-200/80 bg-cream-50/50 p-1.5 sm:p-2 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${cat.dotColor} shrink-0`} />
                  <span className="font-mono text-xs font-bold text-charcoal-900 tabular-nums">
                    {cat.label}
                  </span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-charcoal-600 tabular-nums">
                  {count} <span className="font-sans text-[10px] text-charcoal-400 font-normal">({pct}%)</span>
                </span>
              </div>
              <div className="text-[11px] font-serif font-semibold text-charcoal-800 truncate">
                {cat.title}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
