import React from 'react'
import { Link } from 'react-router-dom'
import { Zap, Timer, Users, Award } from 'lucide-react'
import { formatBreedName } from '../../lib/breedMapping'

interface AnalyticsOverviewCardProps {
  bestSpeed: number
  bestSpeedDog: string
  bestSpeedBreed: string
  avgSpeed: number
  bestTime: number
  bestTimeDog: string
  bestTimeBreed: string
  avgTime: number
  totalUniqueDogs: number
  speedDogs: number
  coursingDogs: number
  championshipCount: number
}

export default function AnalyticsOverviewCard({
  bestSpeed,
  bestSpeedDog,
  bestSpeedBreed,
  avgSpeed,
  bestTime,
  bestTimeDog,
  bestTimeBreed,
  avgTime,
  totalUniqueDogs,
  speedDogs,
  coursingDogs,
  championshipCount,
}: AnalyticsOverviewCardProps) {
  return (
    <div className="rounded-2xl border border-old-money-200 bg-white/95 p-3.5 sm:p-4 shadow-2xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cream-200/80 pb-2">
        <h3 className="text-sm sm:text-base font-serif font-bold text-charcoal-900 tracking-tight flex items-center gap-2">
          <Award className="w-4 h-4 text-camel-700" />
          Рекорды и масштаб полигона
        </h3>
        <span className="text-[11px] font-semibold text-charcoal-600 bg-cream-100 px-2 py-0.5 rounded-full border border-cream-200 tabular-nums">
          {totalUniqueDogs} собак
        </span>
      </div>

      {/* 3 Metric Rows */}
      <div className="space-y-2">
        {/* Радар */}
        <div className="rounded-xl border border-cream-300/80 bg-cream-50/50 p-2.5 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-camel-700" />
              Радарный спринт
            </span>
            <span className="font-mono text-base font-bold text-camel-800 tabular-nums">
              {bestSpeed} <span className="text-xs font-sans font-normal text-charcoal-600">км/ч</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-charcoal-600 text-[11px] truncate max-w-[170px]">
              Рекорд:{' '}
              {bestSpeedDog ? (
                <Link
                  to={`/donino-dog/${encodeURIComponent(bestSpeedDog)}/${encodeURIComponent(bestSpeedBreed)}/`}
                  className="font-semibold text-camel-800 hover:text-camel-950 underline"
                  title={`Профиль собаки ${bestSpeedDog}`}
                >
                  {bestSpeedDog}
                </Link>
              ) : (
                '—'
              )}{' '}
              <span className="text-charcoal-400 font-normal">
                ({formatBreedName(bestSpeedBreed)})
              </span>
            </span>
            <span className="text-[11px] text-charcoal-500 font-mono tabular-nums">
              ср. {avgSpeed > 0 ? `${avgSpeed.toFixed(1)} км/ч` : '—'}
            </span>
          </div>
        </div>

        {/* 350 м */}
        <div className="rounded-xl border border-cream-300/80 bg-cream-50/50 p-2.5 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500 flex items-center gap-1">
              <Timer className="w-3.5 h-3.5 text-camel-700" />
              Круг 350 метров
            </span>
            <span className="font-mono text-base font-bold text-camel-800 tabular-nums">
              {bestTime < 999 ? bestTime.toFixed(2) : '—'}{' '}
              <span className="text-xs font-sans font-normal text-charcoal-600">сек</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-charcoal-600 text-[11px] truncate max-w-[170px]">
              Рекорд:{' '}
              {bestTimeDog ? (
                <Link
                  to={`/donino-dog/${encodeURIComponent(bestTimeDog)}/${encodeURIComponent(bestTimeBreed)}/`}
                  className="font-semibold text-camel-800 hover:text-camel-950 underline"
                  title={`Профиль собаки ${bestTimeDog}`}
                >
                  {bestTimeDog}
                </Link>
              ) : (
                '—'
              )}{' '}
              <span className="text-charcoal-400 font-normal">
                ({formatBreedName(bestTimeBreed)})
              </span>
            </span>
            <span className="text-[11px] text-charcoal-500 font-mono tabular-nums">
              ср. {avgTime > 0 ? `${avgTime.toFixed(2)} сек` : '—'}
            </span>
          </div>
        </div>

        {/* Охват */}
        <div className="pt-0.5 flex items-center justify-between text-xs text-charcoal-600 px-1">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-charcoal-400" />
            <span>Участников:</span>
          </span>
          <span className="font-mono text-[11px] tabular-nums font-semibold text-charcoal-800">
            {speedDogs} на радаре · {coursingDogs} на 350 м
          </span>
        </div>
      </div>
    </div>
  )
}
