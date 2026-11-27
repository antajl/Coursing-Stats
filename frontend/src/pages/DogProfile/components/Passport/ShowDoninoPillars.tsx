import React from 'react'
import { Award } from 'lucide-react'
import type {
  DogPassportDoninoStats,
  DogPassportShowStats,
  DogPassportHighlight,
} from './passportTypes'

interface ShowPillarProps {
  shows: DogPassportShowStats
}

export const ShowPillar: React.FC<ShowPillarProps> = ({ shows }) => {
  const rankLabel = shows.yearBreedRank
    ? `#${shows.yearBreedRank} в 2026`
    : shows.breedRank
      ? `№${shows.breedRank} за всё время`
      : null

  return (
    <div className="h-full overflow-hidden rounded-xl border border-[#E3D5BE] bg-white flex flex-col justify-between shadow-2xs">
      <div className="flex flex-1 flex-col divide-y divide-[#EAE3D6]">
        {/* Кремовая шапка-плашка Old Money */}
        <div className="flex items-center justify-between gap-1.5 bg-[#F5EFE6] px-3 py-1.5 border-b border-[#D8CBB8]">
          <div className="inline-flex items-center gap-1.5 font-serif text-[10px] font-bold tracking-wider text-[#664619] uppercase">
            <Award className="h-3 w-3 text-[#7D5B28] shrink-0" aria-hidden />
            <span>Выставки</span>
          </div>
          {rankLabel && (
            <span className="shrink-0 text-[10px] font-semibold text-[#7D5B28] tabular-nums">
              {rankLabel}
            </span>
          )}
        </div>

        {/* Зачёт и главные титулы ринга */}
        <div className="flex items-center justify-between bg-[#FAF5ED]/80 px-3 py-1.5 min-h-[30px] text-[10px]">
          {shows.hasData ? (
            <>
              <span className="text-[#78716C]">
                Ринги: <strong className="font-semibold text-[#664619]">{shows.totalShows}</strong>
              </span>
              {shows.bobCount > 0 ? (
                <span className="font-bold text-[#7D5B28] bg-white/90 border border-[#E8DCC4] px-1.5 py-0.2 rounded">
                  BOB: {shows.bobCount}
                </span>
              ) : (
                <span className="text-[#8A6735] font-medium">Экстерьер</span>
              )}
            </>
          ) : (
            <span className="text-[#8C7E6A] italic">Выставки не зафиксированы</span>
          )}
        </div>

        {/* Высшая награда */}
        {shows.hasData ? (
          <div className="flex flex-1 flex-col items-center justify-center bg-white px-2.5 py-2.5 text-center">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-[#78716C]">
              Высшая награда
            </div>
            <div className="font-serif text-2xl font-bold text-[#664619] mt-0.5 leading-none">
              {shows.bestAward || shows.bestGrade || 'Отлично'}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center bg-white px-2.5 py-2.5 text-center text-[11px] text-[#8C7E6A] italic">
            Выставки не зафиксированы
          </div>
        )}
      </div>

      {/* Единый двухъячеечный подвал */}
      <div className="grid grid-cols-2 divide-x divide-[#EAE3D6] border-t border-[#EAE3D6] bg-[#FAF7F2]/70 text-center text-[10px]">
        <div className="px-2 py-1.5">
          <div className="text-[9px] uppercase text-[#8C7E6A]">Выставки</div>
          <div className="font-bold text-[#1C1917] tabular-nums">{shows.totalShows}</div>
        </div>
        <div className="px-2 py-1.5">
          <div className="text-[9px] uppercase text-[#8C7E6A]">Оценка</div>
          <div className="font-bold text-[#7D5B28]">{shows.bestGrade || 'Отл'}</div>
        </div>
      </div>
    </div>
  )
}

interface DoninoPillarProps {
  donino: DogPassportDoninoStats
  isHorizontal?: boolean
}

export const DoninoPillar: React.FC<DoninoPillarProps> = ({ donino, isHorizontal = false }) => {
  if (isHorizontal) {
    return (
      <div className="rounded-xl border border-[#C2D6C6] bg-[#F7FAF8] px-3.5 py-2 flex items-center justify-between shadow-2xs">
        <div>
          <div className="font-serif text-[11px] font-bold text-[#1F432E] uppercase">
            Скоростные испытания Донино
          </div>
          <div className="text-[10px] text-[#3D6B4F]">
            {donino.speedRank ? `#${donino.speedRank} в породе` : 'Замеры скорости'}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          {donino.bestSpeed != null && (
            <div>
              <span className="text-[#8C7E6A]">Рекорд: </span>
              <span className="font-bold font-serif text-[#1F432E] text-sm">
                {donino.bestSpeed.toFixed(1)} км/ч
              </span>
            </div>
          )}
          {donino.bestTime != null && (
            <div>
              <span className="text-[#8C7E6A]">Спринт 350 м: </span>
              <span className="font-bold text-[#1C1917]">{donino.bestTime.toFixed(2)} с</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[#D5C9B8] bg-white p-3 flex flex-col justify-between shadow-2xs">
      <div>
        <div className="rounded-lg border border-[#D5E2D8] bg-[#F2F7F4] p-2 mb-2 flex items-center justify-between">
          <div className="font-serif text-[11px] font-bold tracking-wider text-[#1E4331] uppercase">
            Донино (Скорость)
          </div>
          <div className="text-[10px] text-[#2D5A43] leading-tight">
            {donino.speedRank != null ? `#${donino.speedRank} в породе` : 'Замеры скорости'}
          </div>
        </div>

        {donino.hasData ? (
          <div className="rounded-lg border border-[#D5E2D8] bg-[#F2F7F4] py-2 px-2.5 text-center my-1.5">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-[#2D5A43]">
              Рекорд скорости
            </div>
            <div className="font-serif text-xl sm:text-2xl font-bold text-[#1E4331] mt-0.5">
              {donino.bestSpeed != null ? `${donino.bestSpeed.toFixed(1)} км/ч` : '—'}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-[11px] text-[#8C7E6A] italic">
            Замеры не зафиксированы
          </div>
        )}
      </div>

      {donino.hasData && (
        <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#EAE3D6] text-[10px]">
          <div>
            <span className="text-[#8C7E6A]">Спринт 350 м: </span>
            <span className="font-semibold text-[#1C1917]">
              {donino.bestTime != null ? `${donino.bestTime.toFixed(2)} с` : '—'}
            </span>
          </div>
          {donino.speedTotal != null && (
            <div className="text-right">
              <span className="text-[#8C7E6A]">Рейтинг: </span>
              <span className="font-semibold text-[#2D5A43]">из {donino.speedTotal}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export const HighlightsPillar: React.FC<{ highlights?: DogPassportHighlight[] }> = () => null
