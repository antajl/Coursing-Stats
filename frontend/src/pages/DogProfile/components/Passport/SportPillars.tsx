import React from 'react'
import MedalTally from '../../../../components/MedalTally'
import type { DogPassportCoursingStats, DogPassportRacingStats } from './passportTypes'

interface CoursingPillarProps {
  coursing: DogPassportCoursingStats
}

export const CoursingPillar: React.FC<CoursingPillarProps> = ({ coursing }) => {
  const rankLabel = coursing.yearBreedRank
    ? `#${coursing.yearBreedRank} в породе`
    : coursing.breedRank
    ? `№${coursing.breedRank} за всё время`
    : null

  return (
    <div className="h-full rounded-xl border border-[#C2D6C6] bg-white p-3 flex flex-col justify-between shadow-2xs">
      <div>
        {/* Шапка карточки в стиле forest (строго фиксированная min-высота для идеального выравнивания) */}
        <div className="rounded-lg border border-[#D5E3D8] bg-[#F0F5F2] p-2 mb-2 min-h-[58px] flex flex-col justify-between">
          <div className="h-5 flex items-center justify-between gap-1.5">
            <div className="font-serif text-[11px] sm:text-xs font-bold tracking-wider text-[#1F432E] uppercase">
              {coursing.disciplineTitle || 'Курсинг'}
            </div>
            {rankLabel && (
              <span className="shrink-0 text-[10px] font-semibold text-[#1F432E] bg-white/90 border border-[#C2D6C6] px-1.5 py-0.5 rounded shadow-2xs">
                {rankLabel}
              </span>
            )}
          </div>

          {/* Медальки с сайта через MedalTally */}
          <div className="h-5 flex items-center mt-1 pt-1 border-t border-[#D5E3D8]/70">
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
        </div>

        {/* Главный результат (Score) — фиксированная min-высота */}
        {coursing.hasData ? (
          <div className="rounded-lg border border-[#E2EBE4] bg-[#F7FAF8] py-2.5 px-2 text-center my-1.5 min-h-[74px] flex flex-col justify-center">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-[#52735E]">
              Лучший результат
            </div>
            <div className="font-serif text-2xl font-bold text-[#1F432E] mt-0.5 leading-none">
              {coursing.bestScore ? `${coursing.bestScore} б.` : `${coursing.totalStarts} состязаний`}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-[#E2EBE4] bg-[#F7FAF8] py-2.5 px-2 text-center my-1.5 min-h-[74px] flex flex-col justify-center text-[11px] text-[#8C7E6A] italic">
            Курсинг не зафиксирован
          </div>
        )}
      </div>

      {/* Подвал карточки — правильная терминология: Состязания (не старты) */}
      <div className="pt-2 border-t border-[#EAE3D6] text-[10px] min-h-[26px] flex items-center justify-between">
        <div>
          <span className="text-[#8C7E6A]">Состязания: </span>
          <span className="font-semibold text-[#1C1917]">{coursing.totalStarts}</span>
        </div>
        {coursing.avgJudgeScore != null && (
          <div className="text-right">
            <span className="text-[#8C7E6A]">Ср. балл: </span>
            <span className="font-semibold text-[#1F432E]">{coursing.avgJudgeScore}</span>
          </div>
        )}
      </div>
    </div>
  )
}

interface RacingPillarProps {
  racing: DogPassportRacingStats
}

export const RacingPillar: React.FC<RacingPillarProps> = ({ racing }) => {
  const rankLabel = racing.yearBreedRank
    ? `#${racing.yearBreedRank} в породе`
    : racing.breedRank
    ? `№${racing.breedRank} за всё время`
    : null

  return (
    <div className="h-full rounded-xl border border-[#C5D5E6] bg-white p-3 flex flex-col justify-between shadow-2xs">
      <div>
        {/* Шапка карточки в стиле warm-blue (строго фиксированная min-высота) */}
        <div className="rounded-lg border border-[#D3DFED] bg-[#F0F4F8] p-2 mb-2 min-h-[58px] flex flex-col justify-between">
          <div className="h-5 flex items-center justify-between gap-1.5">
            <div className="font-serif text-[11px] sm:text-xs font-bold tracking-wider text-[#1A3859] uppercase">
              Рейсинг
            </div>
            {rankLabel && (
              <span className="shrink-0 text-[10px] font-semibold text-[#1A3859] bg-white/90 border border-[#C5D5E6] px-1.5 py-0.5 rounded shadow-2xs">
                {rankLabel}
              </span>
            )}
          </div>

          {/* Медальки с сайта через MedalTally */}
          <div className="h-5 flex items-center mt-1 pt-1 border-t border-[#D3DFED]/70">
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
        </div>

        {/* Главный результат (Speed) — фиксированная min-высота */}
        {racing.hasData ? (
          <div className="rounded-lg border border-[#DCE6F0] bg-[#F5F8FB] py-2.5 px-2 text-center my-1.5 min-h-[74px] flex flex-col justify-center">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-[#4A6D94]">
              Рекорд скорости
            </div>
            <div className="font-serif text-2xl font-bold text-[#1A3859] mt-0.5 leading-none">
              {racing.bestSpeed ? `${racing.bestSpeed} км/ч` : `${racing.totalStarts} забегов`}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-[#DCE6F0] bg-[#F5F8FB] py-2.5 px-2 text-center my-1.5 min-h-[74px] flex flex-col justify-center text-[11px] text-[#8C7E6A] italic">
            Бега не зафиксированы
          </div>
        )}
      </div>

      {/* Подвал карточки — правильная терминология: Забеги (не заезды/старты) */}
      <div className="pt-2 border-t border-[#EAE3D6] text-[10px] min-h-[26px] flex items-center justify-between">
        <div>
          <span className="text-[#8C7E6A]">Забеги: </span>
          <span className="font-semibold text-[#1C1917]">{racing.totalStarts}</span>
        </div>
        {racing.avgSpeed != null && (
          <div className="text-right">
            <span className="text-[#8C7E6A]">Ср. скор: </span>
            <span className="font-semibold text-[#1A3859]">{racing.avgSpeed} км/ч</span>
          </div>
        )}
      </div>
    </div>
  )
}
