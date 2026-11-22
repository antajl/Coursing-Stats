import React from 'react'
import { Sparkles, Trophy, Zap, Calendar, Dog } from 'lucide-react'

export interface BreedsCatalogSummaryProps {
  totalBreeds: number
  totalDogs: number
  totalStarts: number
  maxSpeed: number
  maxSpeedBreed?: string
}

export const BreedsCatalogSummary: React.FC<BreedsCatalogSummaryProps> = ({
  totalBreeds,
  totalDogs,
  totalStarts,
  maxSpeed,
  maxSpeedBreed = 'Уиппет',
}) => {
  return (
    <div className="cs-glass-card rounded-2xl border border-old-money-200/80 bg-white/95 p-3.5 sm:p-4 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-6">
        {/* Левая часть: заголовок и краткое описание */}
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 rounded-full border border-camel-300 bg-camel-50 px-2.5 py-0.5 text-[10.5px] font-semibold tracking-wide text-camel-900 uppercase">
              <Sparkles className="h-3 w-3 text-camel-700" aria-hidden />
              <span>Реестр беговых пород</span>
            </span>
            <span className="text-xs text-charcoal-400 font-sans hidden sm:inline">
              Сводная статистика базы состязаний
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-serif font-bold text-charcoal-900 leading-snug">
            Каталог пород в курсинге, рейсинге и бегах за механической приманкой
          </h2>
          <p className="text-xs text-charcoal-600 font-medium leading-relaxed mt-0.5">
            Паспорта пород, залы славы чемпионов, замеры предельной скорости в Донино и рейтинги РКФ с 2015 года.
          </p>
        </div>

        {/* Правая часть: 4 ключевые сводные метрики */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-old-money-200/60">
          {/* Пород в реестре */}
          <div className="flex flex-col rounded-xl bg-cream-50/70 border border-old-money-200/60 p-2 text-left">
            <span className="text-[10px] uppercase tracking-wider text-charcoal-500 font-medium flex items-center gap-1">
              <Dog className="h-3 w-3 text-camel-700" />
              <span>Пород</span>
            </span>
            <span className="text-base sm:text-lg font-serif font-bold text-charcoal-900 tabular-nums leading-tight mt-0.5">
              {totalBreeds}
            </span>
          </div>

          {/* Собак в протоколах */}
          <div className="flex flex-col rounded-xl bg-cream-50/70 border border-old-money-200/60 p-2 text-left">
            <span className="text-[10px] uppercase tracking-wider text-charcoal-500 font-medium flex items-center gap-1">
              <Trophy className="h-3 w-3 text-amber-700" />
              <span>Собак</span>
            </span>
            <span className="text-base sm:text-lg font-serif font-bold text-charcoal-900 tabular-nums leading-tight mt-0.5">
              {totalDogs > 0 ? totalDogs.toLocaleString('ru-RU') : '3 500+'}
            </span>
          </div>

          {/* Забегов */}
          <div className="flex flex-col rounded-xl bg-cream-50/70 border border-old-money-200/60 p-2 text-left">
            <span className="text-[10px] uppercase tracking-wider text-charcoal-500 font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3 text-camel-700" />
              <span>Забегов</span>
            </span>
            <span className="text-base sm:text-lg font-serif font-bold text-charcoal-900 tabular-nums leading-tight mt-0.5">
              {totalStarts > 0 ? totalStarts.toLocaleString('ru-RU') : '25 000+'}
            </span>
          </div>

          {/* Рекорд скорости */}
          <div className="flex flex-col rounded-xl bg-cream-50/70 border border-old-money-200/60 p-2 text-left">
            <span className="text-[10px] uppercase tracking-wider text-camel-800 font-medium flex items-center gap-1">
              <Zap className="h-3 w-3 text-camel-600" />
              <span>Рекорд</span>
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-lg font-serif font-bold text-camel-900 tabular-nums leading-tight">
                {maxSpeed > 0 ? `${maxSpeed.toFixed(1)}` : '65.2'}
              </span>
              <span className="text-[10px] font-medium text-charcoal-500">км/ч</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default BreedsCatalogSummary
