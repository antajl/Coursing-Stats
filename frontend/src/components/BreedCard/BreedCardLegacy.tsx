import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { BreedCardProps } from './types'
import { formatDogsCount, formatRunsCount, getShellClass } from './types'
import { getBreedFciGroup, getFciGroupInfo } from '../../lib/fciGroups'

export const BreedCardLegacy: React.FC<BreedCardProps> = ({
  breed,
  stats,
  variant = 'embedded',
}) => {
  const isEmbedded = variant === 'embedded'
  const shellClass = getShellClass(isEmbedded)
  const hasStats = Boolean(stats && (stats.dogs > 0 || stats.starts > 0 || stats.seasonsCount > 0))

  return (
    <Link
      to={`/breeds/${breed.slug}/`}
      className={shellClass}
      onClick={() => {
        try {
          sessionStorage.setItem('cs_last_breed_slug', breed.slug)
        } catch {}
      }}
    >
      <div className="flex items-center justify-between gap-3 sm:gap-5 w-full py-0.5">
        {/* Колонка 1: Порода (FCI + Название + Латинское) */}
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="inline-flex items-center rounded border border-camel-200/90 bg-cream-100/90 px-1.5 py-0.2 text-[10px] font-semibold uppercase tracking-wider text-camel-800 shrink-0">
              {breed.fci}
            </span>
            <span className="text-[11.5px] sm:text-xs text-charcoal-500 font-sans truncate">
              {breed.nameLat}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-serif font-bold text-charcoal-900 group-hover:text-camel-800 transition-colors truncate leading-snug">
            {breed.nameRu}
          </h3>

          {/* На мобильных (< sm) компактная строка ключевых цифр */}
          <div className="flex sm:hidden items-center gap-1.5 text-[10.5px] text-charcoal-600 font-medium mt-1 truncate">
            {hasStats ? (
              <>
                {stats && stats.dogs > 0 && <span>{formatDogsCount(stats.dogs)}</span>}
                {stats && stats.starts > 0 && (
                  <>
                    <span className="text-old-money-400">·</span>
                    <span>{formatRunsCount(stats.starts)}</span>
                  </>
                )}
                {stats && stats.maxSpeed > 0 && (
                  <>
                    <span className="text-old-money-400">·</span>
                    <span className="font-semibold text-camel-800 font-sans tabular-nums">
                      {stats.maxSpeed % 1 === 0 ? stats.maxSpeed : stats.maxSpeed.toFixed(1)} км/ч
                    </span>
                  </>
                )}
              </>
            ) : (
              <span className="text-charcoal-500 truncate">
                {getFciGroupInfo(getBreedFciGroup(breed.slug))?.shortName || 'Классификация РКФ'}
              </span>
            )}
          </div>
        </div>

        {/* Колонка 2: Метрики (Собак, Забегов, Рекорд, Сезонов) + Стрелка перехода */}
        <div className="shrink-0 flex items-center gap-2 sm:gap-3 pl-3 sm:pl-4 border-l border-old-money-200/60 ml-auto">
          {/* Десктопные плашки метрик (>= sm) */}
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
            {/* Собак */}
            <div
              className="flex flex-col items-center justify-center w-[4.4rem] shrink-0 rounded-lg bg-cream-100/70 border border-old-money-200/50 px-1 py-1 text-center group-hover:bg-white group-hover:border-camel-300 transition-colors"
              title="Собак в базе состязаний"
            >
              <span className="text-[9px] uppercase tracking-wider text-charcoal-500 font-medium">Собак</span>
              <span className="text-sm font-bold tabular-nums text-charcoal-900 font-sans">
                {stats && stats.dogs > 0 ? stats.dogs.toLocaleString('ru-RU') : '—'}
              </span>
            </div>

            {/* Забегов */}
            <div
              className="flex flex-col items-center justify-center w-[4.7rem] shrink-0 rounded-lg bg-cream-100/70 border border-old-money-200/50 px-1 py-1 text-center group-hover:bg-white group-hover:border-camel-300 transition-colors"
              title="Всего забегов в протоколах"
            >
              <span className="text-[9px] uppercase tracking-wider text-charcoal-500 font-medium">Забегов</span>
              <span className="text-sm font-bold tabular-nums text-charcoal-900 font-sans">
                {stats && stats.starts > 0 ? stats.starts.toLocaleString('ru-RU') : '—'}
              </span>
            </div>

            {/* Рекорд скорости */}
            <div
              className="flex flex-col items-center justify-center w-[5.2rem] shrink-0 rounded-lg bg-cream-100/70 border border-old-money-200/50 px-1 py-1 text-center group-hover:bg-white group-hover:border-camel-300 transition-colors"
              title="Рекорд скорости (км/ч)"
            >
              <span className="text-[9px] uppercase tracking-wider text-charcoal-500 font-medium">Рекорд</span>
              <span className="text-sm font-bold tabular-nums text-camel-800 font-sans">
                {stats && stats.maxSpeed > 0
                  ? `${stats.maxSpeed % 1 === 0 ? stats.maxSpeed : stats.maxSpeed.toFixed(1)} км/ч`
                  : '—'}
              </span>
            </div>

            {/* Сезонов */}
            <div
              className="flex flex-col items-center justify-center w-[4.4rem] shrink-0 rounded-lg bg-cream-100/70 border border-old-money-200/50 px-1 py-1 text-center group-hover:bg-white group-hover:border-camel-300 transition-colors"
              title="Сезонов активности с 2015 года"
            >
              <span className="text-[9px] uppercase tracking-wider text-charcoal-500 font-medium">Сезонов</span>
              <span className="text-sm font-bold tabular-nums text-charcoal-900 font-sans">
                {stats && stats.seasonsCount > 0 ? stats.seasonsCount : '—'}
              </span>
            </div>
          </div>

          <ChevronRight
            className="h-4 w-4 text-charcoal-400 group-hover:text-camel-800 group-hover:translate-x-0.5 transition-all shrink-0"
            aria-hidden
          />
        </div>
      </div>
    </Link>
  )
}
export default BreedCardLegacy
