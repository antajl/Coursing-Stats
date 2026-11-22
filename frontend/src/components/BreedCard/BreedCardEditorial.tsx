import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Trophy, Zap } from 'lucide-react'
import type { BreedCardProps } from './types'
import { getShellClass } from './types'
import { getBreedFciGroup, getFciGroupInfo } from '../../lib/fciGroups'

export const BreedCardEditorial: React.FC<BreedCardProps> = ({
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
      <div className="flex items-center gap-3.5 sm:gap-5 w-full py-2">
        {/* Левый блок: медальон рекорда скорости или статуса */}
        <div className="shrink-0 flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-camel-200/90 bg-gradient-to-b from-cream-50 to-cream-100/80 shadow-2xs group-hover:border-camel-400 group-hover:bg-white transition-all text-center">
          {stats && stats.maxSpeed > 0 ? (
            <>
              <span className="text-[9px] uppercase tracking-wider text-camel-800 font-semibold flex items-center gap-0.5">
                <Zap className="h-2.5 w-2.5 text-camel-600" />
                <span>Пик</span>
              </span>
              <span className="text-base sm:text-lg font-serif font-bold text-charcoal-900 tabular-nums leading-none mt-0.5">
                {stats.maxSpeed % 1 === 0 ? stats.maxSpeed : stats.maxSpeed.toFixed(1)}
              </span>
              <span className="text-[9px] text-charcoal-500 font-medium">км/ч</span>
            </>
          ) : (
            <>
              <span className="text-[9px] uppercase tracking-wider text-charcoal-500 font-medium">FCI</span>
              <span className="text-xs font-bold text-charcoal-800 leading-none mt-0.5">{breed.fci.replace('FCI ', '')}</span>
            </>
          )}
        </div>

        {/* Центральный блок: Типографика и цитата-лид */}
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-semibold text-camel-800 tracking-wider uppercase">
              {groupInfo?.shortName || breed.fci}
            </span>
            <span className="text-old-money-400 text-xs">·</span>
            <span className="text-xs font-serif italic text-charcoal-500 truncate">
              {breed.nameLat}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-serif font-bold text-charcoal-900 group-hover:text-camel-800 transition-colors truncate leading-tight">
            {breed.nameRu}
          </h3>

          {breed.lead && (
            <p className="text-xs text-charcoal-600 italic line-clamp-1 mt-0.5 leading-relaxed">
              «{breed.lead}»
            </p>
          )}

          {stats?.latestLeader && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-900 font-medium mt-1 truncate">
              <Trophy className="h-3 w-3 text-amber-700 shrink-0" aria-hidden />
              <span className="text-charcoal-500">Зал славы ({stats.latestLeader.year}):</span>
              <span className="font-semibold text-charcoal-900 truncate">{stats.latestLeader.dog_name}</span>
            </div>
          )}
        </div>

        {/* Правый блок: минималистичная сводка */}
        <div className="shrink-0 flex flex-col items-end justify-center pl-3 sm:pl-4 border-l border-old-money-200/60 text-right min-w-[5rem] sm:min-w-[6.5rem]">
          <span className="text-sm sm:text-base font-bold tabular-nums text-charcoal-900 font-sans">
            {stats && stats.dogs > 0 ? stats.dogs.toLocaleString('ru-RU') : '—'}{' '}
            <span className="text-[11px] font-normal text-charcoal-500">соб.</span>
          </span>
          <span className="text-xs tabular-nums text-charcoal-600 mt-0.5">
            {stats && stats.starts > 0 ? stats.starts.toLocaleString('ru-RU') : '—'} забегов
          </span>
          {stats && stats.seasonsCount > 0 && (
            <span className="text-[10px] text-charcoal-400 mt-0.5">
              {stats.seasonsCount} сезонов
            </span>
          )}
        </div>

        <ChevronRight
          className="h-4 w-4 text-charcoal-400 group-hover:text-camel-800 group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block"
          aria-hidden
        />
      </div>
    </Link>
  )
}
export default BreedCardEditorial
