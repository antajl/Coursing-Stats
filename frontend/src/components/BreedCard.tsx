import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { BreedCardProps, BreedStatsData } from './BreedCard/types'
import {
  formatDogsCount,
  formatRunsCount,
  formatSeasonsCount,
  formatGoldCount,
  formatSpeedText,
  getBreedDisciplinesText,
  getShellClass,
} from './BreedCard/types'
import { getBreedFciGroup, getFciGroupInfo } from '../lib/fciGroups'

export type { BreedCardProps, BreedStatsData }

export default function BreedCard({
  breed,
  stats,
  variant = 'embedded',
}: BreedCardProps) {
  const isEmbedded = variant === 'embedded'
  const shellClass = getShellClass(isEmbedded)
  const groupNum = getBreedFciGroup(breed.slug)
  const groupInfo = getFciGroupInfo(groupNum)
  const disciplinesText = getBreedDisciplinesText(breed.slug, groupNum)

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
      <div className="grid grid-cols-[minmax(0,1fr)_8.5rem] sm:grid-cols-[minmax(0,1fr)_12.5rem] md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_11rem_12.5rem] items-stretch gap-0 w-full py-0.5">
        {/* Колонка 1: Порода (2 строки: FCI+Латынь, затем Русское название) */}
        <div className="flex flex-col justify-center min-w-0 pr-3 sm:pr-4">
          <div className="flex items-center gap-1.5 mb-0.5 min-w-0">
            <span className="inline-flex items-center rounded border border-camel-200/90 bg-cream-100/90 px-1 py-0.2 text-[9.5px] font-semibold uppercase tracking-wider text-camel-800 shrink-0">
              {breed.fci}
            </span>
            <span className="text-[11px] sm:text-xs text-charcoal-500 font-sans truncate">
              {breed.nameLat}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 min-w-0 truncate">
            <h3 className="text-sm sm:text-base font-serif font-bold text-charcoal-900 group-hover:text-camel-800 transition-colors truncate leading-tight">
              {breed.nameRu}
            </h3>
            {/* На мобильных (< md) краткая группа остается рядом с именем */}
            <span className="text-[11px] text-charcoal-400 font-medium truncate md:hidden">
              · {groupInfo?.shortName || 'Спорт'}
            </span>
          </div>

          {/* На мобильных (< md): компактная строка рекорда и наград */}
          <div className="flex md:hidden items-center gap-1.5 text-[10.5px] text-charcoal-600 font-medium mt-1 truncate">
            {stats && stats.maxSpeed > 0 && (
              <span className="font-semibold text-camel-800 font-sans whitespace-nowrap">
                {formatSpeedText(stats.maxSpeed)}
              </span>
            )}
            {stats && stats.gold > 0 && (
              <>
                <span className="text-old-money-400">·</span>
                <span className="text-charcoal-700 truncate">
                  {formatGoldCount(stats.gold)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Колонка 2 (Десктоп): Классификация (Группа FCI + Дисциплины спорта и выставок) */}
        <div className="hidden md:flex flex-col justify-center min-w-0 pl-3.5 lg:pl-4 pr-3 border-l border-old-money-200/60 text-left">
          <div className="flex items-center gap-1.5 text-xs text-charcoal-700 leading-tight truncate">
            <span className="text-charcoal-400 text-[11px] shrink-0">Группа:</span>
            <span className="font-semibold text-charcoal-800 truncate" title={groupInfo?.name}>
              {groupInfo?.name || 'Вне классификации'}
            </span>
          </div>

          <div className="text-[11px] text-charcoal-500 mt-1 leading-tight truncate font-sans">
            <span className="text-charcoal-600 font-medium">{disciplinesText}</span>
          </div>
        </div>

        {/* Колонка 3 (Десктоп): Результативность (Рекорд скорости + Золотые медали) */}
        <div className="hidden md:flex flex-col justify-center min-w-0 pl-3.5 lg:pl-4 pr-3 border-l border-old-money-200/60 text-left">
          <div className="flex items-center gap-1.5 text-xs text-charcoal-700 leading-tight">
            <span className="text-charcoal-400 text-[11px]">Рекорд:</span>
            <span className="font-bold tabular-nums text-camel-800 font-sans whitespace-nowrap">
              {formatSpeedText(stats?.maxSpeed)}
            </span>
          </div>

          <div className="flex items-center text-[11px] text-charcoal-600 mt-1 leading-tight truncate">
            {stats && stats.gold > 0 ? (
              <span className="truncate">
                <span className="font-semibold tabular-nums text-charcoal-800 font-sans">
                  {stats.gold.toLocaleString('ru-RU')}
                </span>{' '}
                <span>
                  {stats.gold % 10 === 1 && stats.gold % 100 !== 11
                    ? 'золотая медаль'
                    : stats.gold % 10 >= 2 && stats.gold % 10 <= 4 && (stats.gold % 100 < 10 || stats.gold % 100 >= 20)
                    ? 'золотые медали'
                    : 'золотых медалей'}
                </span>
              </span>
            ) : (
              <span className="text-charcoal-400">Без медалей</span>
            )}
          </div>
        </div>

        {/* Колонка 4 (Правый стек: ровно 2 строки, без сокращений) */}
        <div className="flex items-center justify-between min-w-0 pl-3 sm:pl-4 border-l border-old-money-200/60">
          <div className="flex flex-col items-end justify-center text-right min-w-0 flex-1">
            <span className="text-xs sm:text-sm font-bold tabular-nums text-charcoal-900 font-sans leading-tight truncate">
              {stats && stats.dogs > 0 ? formatDogsCount(stats.dogs) : '—'}
            </span>
            <div className="flex items-center gap-1 text-[10.5px] sm:text-[11px] tabular-nums text-charcoal-500 mt-1 leading-tight truncate">
              <span className="truncate">{stats && stats.starts > 0 ? formatRunsCount(stats.starts) : '—'}</span>
              {stats && stats.seasonsCount > 0 && (
                <span className="hidden sm:inline-flex items-center gap-1 shrink-0">
                  <span className="text-old-money-300">·</span>
                  <span>{formatSeasonsCount(stats.seasonsCount)}</span>
                </span>
              )}
            </div>
          </div>

          <ChevronRight
            className="h-4 w-4 text-charcoal-400 group-hover:text-camel-800 group-hover:translate-x-0.5 transition-all shrink-0 ml-2"
            aria-hidden
          />
        </div>
      </div>
    </Link>
  )
}
