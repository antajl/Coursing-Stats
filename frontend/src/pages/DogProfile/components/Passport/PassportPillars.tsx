import React from 'react'
import type {
  DogPassportCoursingStats,
  DogPassportRacingStats,
  DogPassportDoninoStats,
  DogPassportShowStats,
  DogPassportHighlight,
} from './passportTypes'

interface CoursingPillarProps {
  coursing: DogPassportCoursingStats
}

export const CoursingPillar: React.FC<CoursingPillarProps> = ({ coursing }) => {
  return (
    <div className="rounded-lg border border-[#D5C9B8] bg-[#FDFCFA] p-3 shadow-2xs">
      <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-1.5 mb-2">
        <span className="font-serif text-[11px] font-bold tracking-wider text-[#6B5A40] uppercase">
          Курсинг (Поле)
        </span>
        {coursing.yearBreedRank ? (
          <span className="text-[10px] font-semibold text-[#8C6D37] bg-[#F9F5EA] px-1.5 py-0.5 rounded border border-[#E8DCC4]">
            #{coursing.yearBreedRank} в породе
          </span>
        ) : (
          <span className="text-[10px] text-[#8C7E6A]">Полевые испытания</span>
        )}
      </div>

      {coursing.hasData ? (
        <div className="space-y-2">
          {/* Медали */}
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="rounded border border-[#E8DCC4] bg-[#F9F5EA] py-0.5 px-1">
              <div className="text-[9px] text-[#8C6D37] font-semibold">1 место</div>
              <div className="font-serif text-xs font-bold text-[#634E27]">{coursing.gold}</div>
            </div>
            <div className="rounded border border-[#DCDFE3] bg-[#F4F6F8] py-0.5 px-1">
              <div className="text-[9px] text-[#64748B] font-semibold">2 место</div>
              <div className="font-serif text-xs font-bold text-[#475569]">{coursing.silver}</div>
            </div>
            <div className="rounded border border-[#E3D5C8] bg-[#FAF3EE] py-0.5 px-1">
              <div className="text-[9px] text-[#9A5B32] font-semibold">3 место</div>
              <div className="font-serif text-xs font-bold text-[#7C3D18]">{coursing.bronze}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-0.5">
            <div>
              <span className="text-[#8C7E6A]">Старты: </span>
              <span className="font-semibold text-[#1C1917]">{coursing.totalStarts}</span>
            </div>
            {coursing.bestScore != null && (
              <div>
                <span className="text-[#8C7E6A]">Лучший балл: </span>
                <span className="font-semibold text-[#8C6D37]">{coursing.bestScore}</span>
              </div>
            )}
            {coursing.avgJudgeScore != null && (
              <div>
                <span className="text-[#8C7E6A]">Ср. балл судей: </span>
                <span className="font-semibold text-[#1C1917]">{coursing.avgJudgeScore}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-2.5 text-[10px] text-[#A89F91] italic">
          Курсинг не зафиксирован
        </div>
      )}
    </div>
  )
}

interface RacingPillarProps {
  racing: DogPassportRacingStats
}

export const RacingPillar: React.FC<RacingPillarProps> = ({ racing }) => {
  return (
    <div className="rounded-lg border border-[#D5C9B8] bg-[#FDFCFA] p-3 shadow-2xs">
      <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-1.5 mb-2">
        <span className="font-serif text-[11px] font-bold tracking-wider text-[#6B5A40] uppercase">
          Рейсинг (Трек)
        </span>
        {racing.yearBreedRank ? (
          <span className="text-[10px] font-semibold text-[#8C6D37] bg-[#F9F5EA] px-1.5 py-0.5 rounded border border-[#E8DCC4]">
            #{racing.yearBreedRank} в породе
          </span>
        ) : (
          <span className="text-[10px] text-[#8C7E6A]">Круговой трек</span>
        )}
      </div>

      {racing.hasData ? (
        <div className="space-y-2">
          {/* Медали */}
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="rounded border border-[#E8DCC4] bg-[#F9F5EA] py-0.5 px-1">
              <div className="text-[9px] text-[#8C6D37] font-semibold">1 место</div>
              <div className="font-serif text-xs font-bold text-[#634E27]">{racing.gold}</div>
            </div>
            <div className="rounded border border-[#DCDFE3] bg-[#F4F6F8] py-0.5 px-1">
              <div className="text-[9px] text-[#64748B] font-semibold">2 место</div>
              <div className="font-serif text-xs font-bold text-[#475569]">{racing.silver}</div>
            </div>
            <div className="rounded border border-[#E3D5C8] bg-[#FAF3EE] py-0.5 px-1">
              <div className="text-[9px] text-[#9A5B32] font-semibold">3 место</div>
              <div className="font-serif text-xs font-bold text-[#7C3D18]">{racing.bronze}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-0.5">
            <div>
              <span className="text-[#8C7E6A]">Заезды: </span>
              <span className="font-semibold text-[#1C1917]">{racing.totalStarts}</span>
            </div>
            {racing.bestSpeed != null && (
              <div>
                <span className="text-[#8C7E6A]">Рекорд: </span>
                <span className="font-semibold text-[#1C1917]">{racing.bestSpeed} км/ч</span>
              </div>
            )}
            {racing.avgSpeed != null && (
              <div>
                <span className="text-[#8C7E6A]">Ср. скор: </span>
                <span className="font-semibold text-[#1C1917]">{racing.avgSpeed} км/ч</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-2.5 text-[10px] text-[#A89F91] italic">
          Рейсинг не зафиксирован
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
    <div className="rounded-lg border border-[#D5C9B8] bg-[#FDFCFA] p-3 shadow-2xs">
      <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-1.5 mb-2">
        <span className="font-serif text-[11px] font-bold tracking-wider text-[#6B5A40] uppercase">
          Донино (Скорость)
        </span>
        {donino.speedRank != null && (
          <span className="text-[10px] font-semibold text-[#2D5A43] bg-[#F2F7F4] px-1.5 py-0.5 rounded border border-[#D5E2D8]">
            #{donino.speedRank} в породе
          </span>
        )}
      </div>

      {donino.hasData ? (
        <div className="space-y-1.5">
          {donino.bestSpeed != null && (
            <div className="flex items-baseline justify-between rounded border border-[#D5E2D8] bg-[#F2F7F4] p-1.5">
              <span className="text-[10px] text-[#2D5A43] font-medium">Рекорд скорости:</span>
              <span className="font-serif text-sm font-bold text-[#1E4331]">
                {donino.bestSpeed.toFixed(1)} км/ч
              </span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-0.5">
            {donino.bestTime != null && (
              <div>
                <span className="text-[#8C7E6A]">Спринт 350 м: </span>
                <span className="font-semibold text-[#1C1917]">{donino.bestTime.toFixed(2)} с</span>
              </div>
            )}
            {donino.speedTotal != null && donino.speedRank != null && (
              <div>
                <span className="text-[#8C7E6A]">Рейтинг: </span>
                <span className="font-semibold text-[#2D5A43]">
                  из {donino.speedTotal} собак
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-2.5 text-[10px] text-[#A89F91] italic">
          Замеры скорости не зафиксированы
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
    <div className="rounded-lg border border-[#D5C9B8] bg-[#FDFCFA] p-3 shadow-2xs">
      <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-1.5 mb-2">
        <span className="font-serif text-[11px] font-bold tracking-wider text-[#6B5A40] uppercase">
          Выставки РКФ
        </span>
        <span className="text-[10px] text-[#8C7E6A]">Экстерьер</span>
      </div>

      {shows.hasData ? (
        <div className="space-y-1.5 text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-[#8C7E6A]">Всего выставок:</span>
            <span className="font-semibold text-[#1C1917]">{shows.totalShows}</span>
          </div>

          {(shows.bisCount > 0 || shows.bigCount > 0 || shows.bobCount > 0) && (
            <div className="grid grid-cols-3 gap-1 text-center py-1 bg-[#FAF6EE] rounded border border-[#EDE3CF] text-[9px]">
              <div>
                <div className="text-[#8C6D37] font-semibold">BIS</div>
                <div className="font-bold text-[#634E27]">{shows.bisCount}</div>
              </div>
              <div>
                <div className="text-[#8C6D37] font-semibold">BIG</div>
                <div className="font-bold text-[#634E27]">{shows.bigCount}</div>
              </div>
              <div>
                <div className="text-[#8C6D37] font-semibold">ЛПП</div>
                <div className="font-bold text-[#634E27]">{shows.bobCount}</div>
              </div>
            </div>
          )}

          {shows.bestGrade && (
            <div>
              <span className="text-[#8C7E6A]">Высшая оценка: </span>
              <span className="font-semibold text-[#1C1917]">{shows.bestGrade}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-2.5 text-[10px] text-[#A89F91] italic">
          Выставки не зафиксированы
        </div>
      )}
    </div>
  )
}

interface HighlightsPillarProps {
  highlights: DogPassportHighlight[]
}

export const HighlightsPillar: React.FC<HighlightsPillarProps> = ({ highlights }) => {
  if (!highlights || highlights.length === 0) return null

  return (
    <div className="rounded-lg border border-[#D5C9B8] bg-[#FDFCFA] p-3 shadow-2xs">
      <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-1.5 mb-2">
        <span className="font-serif text-[11px] font-bold tracking-wider text-[#6B5A40] uppercase">
          Главные победы на турнирах
        </span>
        <span className="text-[10px] text-[#8C7E6A]">Подиумы</span>
      </div>

      <div className="space-y-1.5">
        {highlights.map((h, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-2 text-[10px] rounded border border-[#EAE3D6] bg-white p-1.5"
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span
                className={`shrink-0 rounded px-1 py-0.2 font-serif font-bold text-[9px] ${
                  h.placement === 1
                    ? 'bg-[#F9F5EA] text-[#8C6D37] border border-[#E8DCC4]'
                    : h.placement === 2
                    ? 'bg-[#F4F6F8] text-[#475569] border border-[#DCDFE3]'
                    : 'bg-[#FAF3EE] text-[#7C3D18] border border-[#E3D5C8]'
                }`}
              >
                {h.placement} место
              </span>
              <span className="truncate font-medium text-[#1C1917]" title={h.title}>
                {h.title}
              </span>
            </div>
            {h.score && (
              <span className="shrink-0 font-semibold text-[#6B5A40] text-[10px]">
                {h.score}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
