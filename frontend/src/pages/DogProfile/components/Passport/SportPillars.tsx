import React from 'react'
import { Trophy, Zap } from 'lucide-react'
import MedalTally from '../../../../components/MedalTally'
import type { DogPassportCoursingStats, DogPassportRacingStats } from './passportTypes'

interface CoursingPillarProps {
  coursing: DogPassportCoursingStats
}

export const CoursingPillar: React.FC<CoursingPillarProps> = ({ coursing }) => {
  const rankLabel = coursing.yearBreedRank
    ? `#${coursing.yearBreedRank} в 2026`
    : coursing.breedRank
      ? `№${coursing.breedRank} за всё время`
      : null

  return (
    <div className="h-full overflow-hidden rounded-xl border border-[#C2D6C6] bg-white flex flex-col justify-between shadow-2xs">
      <div className="flex flex-1 flex-col divide-y divide-[#EAE3D6]">
        {/* Кремовая шапка-плашка Old Money */}
        <div className="flex items-center justify-between gap-1.5 bg-[#F5EFE6] px-3 py-1.5 border-b border-[#D8CBB8]">
          <div className="inline-flex items-center gap-1.5 font-serif text-[10px] font-bold tracking-wider text-[#664619] uppercase">
            <Trophy className="h-3 w-3 text-[#7D5B28] shrink-0" aria-hidden />
            <span>{coursing.disciplineTitle || 'Курсинг'}</span>
          </div>
          {rankLabel && (
            <span className="shrink-0 text-[10px] font-semibold text-[#1F432E] tabular-nums">
              {rankLabel}
            </span>
          )}
        </div>

        {/* Позиция и медали */}
        <div className="flex items-center justify-between bg-[#F0F5F2]/75 px-3 py-1.5 min-h-[30px]">
          {coursing.hasData ? (
            <MedalTally
              gold={coursing.gold}
              silver={coursing.silver}
              bronze={coursing.bronze}
              showZero
              size="sm"
              variant="nowrap"
            />
          ) : (
            <span className="text-[10px] text-[#8C7E6A] italic">Медали не зафиксированы</span>
          )}
        </div>

        {/* Главный результат */}
        {coursing.hasData ? (
          <div className="flex flex-1 flex-col items-center justify-center bg-white px-2.5 py-2.5 text-center">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-[#78716C]">
              Лучший результат
            </div>
            <div className="font-serif text-2xl font-bold text-[#1F432E] mt-0.5 leading-none whitespace-nowrap tabular-nums">
              {coursing.bestScore ? `${coursing.bestScore} б.` : `${coursing.totalStarts} состязаний`}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center bg-white px-2.5 py-2.5 text-center text-[11px] text-[#8C7E6A] italic">
            Курсинг не зафиксирован
          </div>
        )}
      </div>

      {/* Единый двухъячеечный подвал */}
      <div className="grid grid-cols-2 divide-x divide-[#EAE3D6] border-t border-[#EAE3D6] bg-[#FAF7F2]/70 text-center text-[10px]">
        <div className="px-2 py-1.5">
          <div className="text-[9px] uppercase text-[#8C7E6A]">Состязания</div>
          <div className="font-bold text-[#1C1917] tabular-nums">{coursing.totalStarts}</div>
        </div>
        <div className="px-2 py-1.5">
          <div className="text-[9px] uppercase text-[#8C7E6A]">Ср. балл</div>
          <div className="font-bold text-[#1F432E] tabular-nums">
            {coursing.avgJudgeScore ?? '—'}
          </div>
        </div>
      </div>
    </div>
  )
}

interface RacingPillarProps {
  racing: DogPassportRacingStats
}

export const RacingPillar: React.FC<RacingPillarProps> = ({ racing }) => {
  const rankLabel = racing.yearBreedRank
    ? `#${racing.yearBreedRank} в 2026`
    : racing.breedRank
      ? `№${racing.breedRank} за всё время`
      : null

  return (
    <div className="h-full overflow-hidden rounded-xl border border-[#C5D5E6] bg-white flex flex-col justify-between shadow-2xs">
      <div className="flex flex-1 flex-col divide-y divide-[#EAE3D6]">
        {/* Кремовая шапка-плашка Old Money */}
        <div className="flex items-center justify-between gap-1.5 bg-[#F5EFE6] px-3 py-1.5 border-b border-[#D8CBB8]">
          <div className="inline-flex items-center gap-1.5 font-serif text-[10px] font-bold tracking-wider text-[#664619] uppercase">
            <Zap className="h-3 w-3 text-[#7D5B28] shrink-0" aria-hidden />
            <span>Рейсинг</span>
          </div>
          {rankLabel && (
            <span className="shrink-0 text-[10px] font-semibold text-[#1A3859] tabular-nums">
              {rankLabel}
            </span>
          )}
        </div>

        {/* Медали */}
        <div className="flex items-center justify-between bg-[#F0F4F8]/75 px-3 py-1.5 min-h-[30px]">
          {racing.hasData ? (
            <MedalTally
              gold={racing.gold}
              silver={racing.silver}
              bronze={racing.bronze}
              showZero
              size="sm"
              variant="nowrap"
            />
          ) : (
            <span className="text-[10px] text-[#8C7E6A] italic">Медали не зафиксированы</span>
          )}
        </div>

        {/* Главный результат */}
        {racing.hasData ? (
          <div className="flex flex-1 flex-col items-center justify-center bg-white px-2.5 py-2.5 text-center">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-[#78716C]">
              Рекорд скорости
            </div>
            <div className="font-serif text-2xl font-bold text-[#1A3859] mt-0.5 leading-none whitespace-nowrap tabular-nums">
              {racing.bestSpeed ? `${racing.bestSpeed} км/ч` : `${racing.totalStarts} забегов`}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center bg-white px-2.5 py-2.5 text-center text-[11px] text-[#8C7E6A] italic">
            Бега не зафиксированы
          </div>
        )}
      </div>

      {/* Единый двухъячеечный подвал */}
      <div className="grid grid-cols-2 divide-x divide-[#EAE3D6] border-t border-[#EAE3D6] bg-[#FAF7F2]/70 text-center text-[10px]">
        <div className="px-2 py-1.5">
          <div className="text-[9px] uppercase text-[#8C7E6A]">Забеги</div>
          <div className="font-bold text-[#1C1917] tabular-nums">{racing.totalStarts}</div>
        </div>
        <div className="px-2 py-1.5">
          <div className="text-[9px] uppercase text-[#8C7E6A]">Ср. скор</div>
          <div className="font-bold text-[#1A3859] tabular-nums">
            {racing.avgSpeed != null ? `${racing.avgSpeed} км/ч` : '—'}
          </div>
        </div>
      </div>
    </div>
  )
}
