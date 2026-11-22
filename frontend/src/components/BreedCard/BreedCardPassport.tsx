import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Trophy, Zap, Shield } from 'lucide-react'
import type { BreedCardProps } from './types'
import { formatDogsCount, formatRunsCount, getShellClass } from './types'
import { getBreedFciGroup, getFciGroupInfo } from '../../lib/fciGroups'

export const BreedCardPassport: React.FC<BreedCardProps> = ({
  breed,
  stats,
  variant = 'embedded',
}) => {
  const isEmbedded = variant === 'embedded'
  const shellClass = getShellClass(isEmbedded)
  const groupNum = getBreedFciGroup(breed.slug)
  const groupInfo = getFciGroupInfo(groupNum)
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
      <div className="grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1.35fr)_minmax(0,1.15fr)_auto] items-center gap-3 sm:gap-4 md:gap-5 w-full py-1">
        {/* Колонка 1: Порода (FCI + Название + Латынь + Породный лид) */}
        <div className="flex flex-col justify-center min-w-0 pr-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="inline-flex items-center rounded border border-camel-200/90 bg-cream-100/90 px-1.5 py-0.2 text-[10px] font-semibold uppercase tracking-wider text-camel-800 shrink-0">
              {breed.fci}
            </span>
            <span className="text-[11.5px] sm:text-xs text-charcoal-500 font-sans truncate">
              {breed.nameLat}
            </span>
            {/* На мобильных бейдж группы прямо в шапке */}
            <span className="inline-flex md:hidden text-[10px] font-medium text-charcoal-500 truncate ml-auto">
              {groupInfo?.shortName?.replace('FCI ', '') || 'Спорт'}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-serif font-bold text-charcoal-900 group-hover:text-camel-800 transition-colors truncate leading-snug">
            {breed.nameRu}
          </h3>

          {/* Авторский ёмкий лид о породе */}
          {breed.lead && (
            <p className="text-[11.5px] sm:text-xs text-charcoal-600 font-normal line-clamp-1 mt-0.5 leading-tight">
              {breed.lead}
            </p>
          )}

          {/* На смартфонах (< md): мобильная строка чемпиона или сводки */}
          <div className="flex md:hidden items-center gap-1.5 text-[10.5px] text-charcoal-600 font-medium mt-1 truncate">
            {stats?.latestLeader ? (
              <span className="inline-flex items-center gap-1 text-amber-900 truncate">
                <Trophy className="h-3 w-3 text-amber-700 shrink-0" aria-hidden />
                <span className="text-charcoal-500">Лидер &apos;{String(stats.latestLeader.year).slice(-2)}:</span>
                <span className="font-semibold truncate">{stats.latestLeader.dog_name}</span>
              </span>
            ) : hasStats ? (
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
              <span className="text-charcoal-500 truncate">{groupInfo?.name || 'Классификация РКФ'}</span>
            )}
          </div>
        </div>

        {/* Колонка 2 (Десктоп/планшет >= md): Спортивный статус & Зал славы */}
        <div className="hidden md:flex flex-col justify-center min-w-0 pl-3 lg:pl-4 border-l border-old-money-200/60 text-left">
          <div className="flex items-center gap-2 min-w-0 mb-1">
            <span className="inline-flex items-center gap-1 rounded-full border border-old-money-200/90 bg-cream-50/80 px-2 py-0.5 text-[10.5px] font-medium text-charcoal-700 shrink-0">
              <Shield className="h-3 w-3 text-camel-700 shrink-0" aria-hidden />
              <span>{groupInfo?.shortName || 'Спортивный класс'}</span>
            </span>
            {stats && stats.seasonsCount > 0 && (
              <span className="text-[11px] text-charcoal-500 truncate font-sans">
                {stats.seasonsCount} {stats.seasonsCount === 1 ? 'сезон' : stats.seasonsCount < 5 ? 'сезона' : 'сезонов'}
              </span>
            )}
          </div>

          {stats?.latestLeader ? (
            <div className="flex items-center gap-1.5 text-xs text-charcoal-800 min-w-0 truncate">
              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-amber-100/90 text-amber-800 shrink-0">
                <Trophy className="h-2.5 w-2.5 text-amber-700" aria-hidden />
              </span>
              <span className="text-charcoal-500 text-[11px] shrink-0">
                Лидер {stats.latestLeader.year}:
              </span>
              <span className="font-semibold text-charcoal-900 group-hover:text-camel-800 transition-colors truncate">
                {stats.latestLeader.dog_name}
              </span>
            </div>
          ) : (
            <div className="text-[11.5px] text-charcoal-500 italic truncate">
              Спортивный реестр состязаний с 2015 года
            </div>
          )}
        </div>

        {/* Колонка 3: Ключевые метрики (Собак, Забегов, Рекорд скорости) + Стрелка */}
        <div className="shrink-0 flex items-center gap-2 sm:gap-3 pl-3 sm:pl-4 border-l border-old-money-200/60 ml-auto">
          {/* Десктопные плашки (>= sm) */}
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
              className="flex flex-col items-center justify-center w-[5.4rem] shrink-0 rounded-lg bg-cream-100/70 border border-old-money-200/50 px-1 py-1 text-center group-hover:bg-white group-hover:border-camel-300 transition-colors"
              title="Рекорд скорости (км/ч)"
            >
              <span className="text-[9px] uppercase tracking-wider text-charcoal-500 font-medium">Рекорд</span>
              <span className="text-sm font-bold tabular-nums text-camel-800 font-sans inline-flex items-center gap-0.5">
                <Zap className="h-3 w-3 text-camel-600 shrink-0" aria-hidden />
                <span>
                  {stats && stats.maxSpeed > 0
                    ? `${stats.maxSpeed % 1 === 0 ? stats.maxSpeed : stats.maxSpeed.toFixed(1)} км/ч`
                    : '—'}
                </span>
              </span>
            </div>
          </div>

          {/* Мобильный вертикальный стек (< sm) */}
          <div className="flex sm:hidden flex-col items-end justify-center gap-0.5 min-w-[4.2rem]">
            {stats && stats.maxSpeed > 0 ? (
              <span className="text-xs font-bold tabular-nums text-camel-800 font-sans">
                {stats.maxSpeed % 1 === 0 ? stats.maxSpeed : stats.maxSpeed.toFixed(1)} км/ч
              </span>
            ) : null}
            <span className="text-[10px] text-charcoal-500">
              {stats && stats.dogs > 0 ? `${stats.dogs} соб.` : '—'}
            </span>
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
export default BreedCardPassport
