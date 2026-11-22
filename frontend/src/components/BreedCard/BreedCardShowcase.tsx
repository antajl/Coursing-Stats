import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Trophy, Award, Zap, Compass } from 'lucide-react'
import type { BreedCardProps } from './types'
import { getShellClass } from './types'
import { getBreedFciGroup, getFciGroupInfo } from '../../lib/fciGroups'

export const BreedCardShowcase: React.FC<BreedCardProps> = ({
  breed,
  stats,
  variant = 'embedded',
}) => {
  const isEmbedded = variant === 'embedded'
  const shellClass = getShellClass(isEmbedded)
  const groupNum = getBreedFciGroup(breed.slug)
  const groupInfo = getFciGroupInfo(groupNum)

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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 md:gap-5 w-full py-1.5">
        {/* Левая зона: Название + FCI + Лид + Теги активностей */}
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
            <span className="inline-flex items-center rounded border border-camel-200/90 bg-cream-100/90 px-1.5 py-0.2 text-[10px] font-semibold uppercase tracking-wider text-camel-800 shrink-0">
              {breed.fci}
            </span>
            <span className="text-[11.5px] sm:text-xs text-charcoal-500 font-sans truncate">
              {breed.nameLat}
            </span>
            <span className="text-old-money-400 text-xs hidden sm:inline">·</span>
            <span className="text-[11px] font-medium text-charcoal-600 truncate hidden sm:inline">
              {groupInfo?.shortName || 'Класс РКФ'}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-serif font-bold text-charcoal-900 group-hover:text-camel-800 transition-colors truncate leading-snug">
            {breed.nameRu}
          </h3>

          {breed.lead && (
            <p className="text-[11.5px] sm:text-xs text-charcoal-600 font-normal line-clamp-1 mt-0.5 leading-snug">
              {breed.lead}
            </p>
          )}

          {/* Теги дисциплин и чемпион */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-cream-100/80 border border-old-money-200/60 px-1.5 py-0.5 text-[10.5px] font-medium text-charcoal-700">
              <Compass className="h-2.5 w-2.5 text-camel-700" aria-hidden />
              <span>Курсинг</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-cream-100/80 border border-old-money-200/60 px-1.5 py-0.5 text-[10.5px] font-medium text-charcoal-700">
              <Award className="h-2.5 w-2.5 text-camel-700" aria-hidden />
              <span>САС / Выставки</span>
            </span>
            {stats?.latestLeader && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200/80 px-2 py-0.5 text-[10.5px] font-semibold text-amber-900 truncate">
                <Trophy className="h-2.5 w-2.5 text-amber-700 shrink-0" aria-hidden />
                <span>Лидер {stats.latestLeader.year}: {stats.latestLeader.dog_name}</span>
              </span>
            )}
          </div>
        </div>

        {/* Правая зона: Квадратные метрики с золотыми победами */}
        <div className="shrink-0 flex items-center gap-2 sm:gap-3 pl-0 md:pl-4 border-t md:border-t-0 md:border-l border-old-money-200/60 w-full md:w-auto pt-2 md:pt-0 justify-between md:justify-end">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Собак */}
            <div className="flex flex-col items-center justify-center w-[4.4rem] shrink-0 rounded-lg bg-cream-100/70 border border-old-money-200/50 px-1 py-1 text-center group-hover:bg-white group-hover:border-camel-300 transition-colors">
              <span className="text-[9px] uppercase tracking-wider text-charcoal-500 font-medium">Собак</span>
              <span className="text-sm font-bold tabular-nums text-charcoal-900 font-sans">
                {stats && stats.dogs > 0 ? stats.dogs.toLocaleString('ru-RU') : '—'}
              </span>
            </div>

            {/* Забегов */}
            <div className="flex flex-col items-center justify-center w-[4.7rem] shrink-0 rounded-lg bg-cream-100/70 border border-old-money-200/50 px-1 py-1 text-center group-hover:bg-white group-hover:border-camel-300 transition-colors">
              <span className="text-[9px] uppercase tracking-wider text-charcoal-500 font-medium">Забегов</span>
              <span className="text-sm font-bold tabular-nums text-charcoal-900 font-sans">
                {stats && stats.starts > 0 ? stats.starts.toLocaleString('ru-RU') : '—'}
              </span>
            </div>

            {/* Побед (Gold) */}
            <div className="flex flex-col items-center justify-center w-[4.4rem] shrink-0 rounded-lg bg-cream-100/70 border border-old-money-200/50 px-1 py-1 text-center group-hover:bg-white group-hover:border-camel-300 transition-colors">
              <span className="text-[9px] uppercase tracking-wider text-amber-800 font-medium inline-flex items-center gap-0.5">
                <Trophy className="h-2 w-2 text-amber-600" />
                <span>Побед</span>
              </span>
              <span className="text-sm font-bold tabular-nums text-amber-900 font-sans">
                {stats && stats.gold > 0 ? stats.gold.toLocaleString('ru-RU') : '0'}
              </span>
            </div>

            {/* Рекорд скорости */}
            <div className="flex flex-col items-center justify-center w-[5.4rem] shrink-0 rounded-lg bg-cream-100/70 border border-old-money-200/50 px-1 py-1 text-center group-hover:bg-white group-hover:border-camel-300 transition-colors">
              <span className="text-[9px] uppercase tracking-wider text-charcoal-500 font-medium">Рекорд</span>
              <span className="text-sm font-bold tabular-nums text-camel-800 font-sans inline-flex items-center gap-0.5">
                <Zap className="h-3 w-3 text-camel-600" aria-hidden />
                <span>
                  {stats && stats.maxSpeed > 0
                    ? `${stats.maxSpeed % 1 === 0 ? stats.maxSpeed : stats.maxSpeed.toFixed(1)} км/ч`
                    : '—'}
                </span>
              </span>
            </div>
          </div>

          <ChevronRight
            className="h-4 w-4 text-charcoal-400 group-hover:text-camel-800 group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block"
            aria-hidden
          />
        </div>
      </div>
    </Link>
  )
}
export default BreedCardShowcase
