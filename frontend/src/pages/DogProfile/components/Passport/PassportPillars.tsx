import React from 'react'
import type { DogPassportSportStats, DogPassportDoninoStats, DogPassportShowStats } from './passportTypes'

interface SportPillarProps {
  sport: DogPassportSportStats
  isVertical?: boolean
}

export const SportPillar: React.FC<SportPillarProps> = ({ sport }) => {
  return (
    <div className="rounded-lg border border-[#D5C9B8] bg-[#FDFCFA] p-3.5 shadow-2xs">
      <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-2 mb-2.5">
        <span className="font-serif text-[11px] font-bold tracking-wider text-[#6B5A40] uppercase">
          Полевой спорт
        </span>
        <span className="text-[10px] text-[#8C7E6A] font-medium">Курсинг & Рейсинг</span>
      </div>

      {sport.hasData ? (
        <div className="space-y-2.5">
          {/* Медали */}
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="rounded border border-[#E8DCC4] bg-[#F9F5EA] py-1 px-1.5">
              <div className="text-[10px] text-[#8C6D37] font-semibold">Золото</div>
              <div className="font-serif text-sm font-bold text-[#634E27]">{sport.gold}</div>
            </div>
            <div className="rounded border border-[#DCDFE3] bg-[#F4F6F8] py-1 px-1.5">
              <div className="text-[10px] text-[#64748B] font-semibold">Серебро</div>
              <div className="font-serif text-sm font-bold text-[#475569]">{sport.silver}</div>
            </div>
            <div className="rounded border border-[#E3D5C8] bg-[#FAF3EE] py-1 px-1.5">
              <div className="text-[10px] text-[#9A5B32] font-semibold">Бронза</div>
              <div className="font-serif text-sm font-bold text-[#7C3D18]">{sport.bronze}</div>
            </div>
          </div>

          {/* Параметры */}
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
            <div>
              <span className="text-[#8C7E6A]">Старты: </span>
              <span className="font-semibold text-[#1C1917]">{sport.totalStarts}</span>
            </div>
            {sport.bestScore != null && (
              <div>
                <span className="text-[#8C7E6A]">Лучший балл: </span>
                <span className="font-semibold text-[#1C1917]">{sport.bestScore}</span>
              </div>
            )}
            {sport.bestSpeed != null && (
              <div>
                <span className="text-[#8C7E6A]">Рейсинг: </span>
                <span className="font-semibold text-[#1C1917]">{sport.bestSpeed} км/ч</span>
              </div>
            )}
            {sport.rank != null && (
              <div>
                <span className="text-[#8C7E6A]">Рейтинг: </span>
                <span className="font-semibold text-[#8C6D37]">#{sport.rank}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-[11px] text-[#A89F91] italic">
          Полевые состязания не зафиксированы
        </div>
      )}
    </div>
  )
}

interface DoninoPillarProps {
  donino: DogPassportDoninoStats
}

export const DoninoPillar: React.FC<DoninoPillarProps> = ({ donino }) => {
  return (
    <div className="rounded-lg border border-[#D5C9B8] bg-[#FDFCFA] p-3.5 shadow-2xs">
      <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-2 mb-2.5">
        <span className="font-serif text-[11px] font-bold tracking-wider text-[#6B5A40] uppercase">
          Скоростные испытания
        </span>
        <span className="text-[10px] text-[#8C7E6A] font-medium">Донино</span>
      </div>

      {donino.hasData ? (
        <div className="space-y-2">
          {donino.bestSpeed != null && (
            <div className="flex items-baseline justify-between rounded border border-[#D5E2D8] bg-[#F2F7F4] p-2">
              <span className="text-[11px] text-[#2D5A43] font-medium">Рекорд скорости:</span>
              <span className="font-serif text-base font-bold text-[#1E4331]">
                {donino.bestSpeed.toFixed(1)} км/ч
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
            {donino.bestTime != null && (
              <div>
                <span className="text-[#8C7E6A]">Спринт 350 м: </span>
                <span className="font-semibold text-[#1C1917]">{donino.bestTime.toFixed(2)} с</span>
              </div>
            )}
            {donino.speedRank != null && donino.speedTotal != null && (
              <div>
                <span className="text-[#8C7E6A]">В породе: </span>
                <span className="font-semibold text-[#2D5A43]">
                  #{donino.speedRank} из {donino.speedTotal}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-[11px] text-[#A89F91] italic">
          Полевые замеры скорости не зафиксированы
        </div>
      )}
    </div>
  )
}

interface ShowPillarProps {
  shows: DogPassportShowStats
}

export const ShowPillar: React.FC<ShowPillarProps> = ({ shows }) => {
  return (
    <div className="rounded-lg border border-[#D5C9B8] bg-[#FDFCFA] p-3.5 shadow-2xs">
      <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-2 mb-2.5">
        <span className="font-serif text-[11px] font-bold tracking-wider text-[#6B5A40] uppercase">
          Выставки РКФ
        </span>
        <span className="text-[10px] text-[#8C7E6A] font-medium">Экстерьер</span>
      </div>

      {shows.hasData ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#8C7E6A]">Всего выставок:</span>
            <span className="font-semibold text-[#1C1917]">{shows.totalShows}</span>
          </div>

          {(shows.bisCount > 0 || shows.bigCount > 0 || shows.bobCount > 0) && (
            <div className="grid grid-cols-3 gap-1 text-center py-1 bg-[#FAF6EE] rounded border border-[#EDE3CF] text-[10px]">
              <div>
                <div className="text-[#8C6D37] font-semibold">BIS</div>
                <div className="font-bold text-[#634E27]">{shows.bisCount}</div>
              </div>
              <div>
                <div className="text-[#8C6D37] font-semibold">BIG</div>
                <div className="font-bold text-[#634E27]">{shows.bigCount}</div>
              </div>
              <div>
                <div className="text-[#8C6D37] font-semibold">ЛПП/BOB</div>
                <div className="font-bold text-[#634E27]">{shows.bobCount}</div>
              </div>
            </div>
          )}

          {shows.bestGrade && (
            <div className="text-[11px] pt-0.5">
              <span className="text-[#8C7E6A]">Высшая оценка: </span>
              <span className="font-semibold text-[#1C1917]">{shows.bestGrade}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4 text-[11px] text-[#A89F91] italic">
          Выставочная карьера не зафиксирована
        </div>
      )}
    </div>
  )
}
