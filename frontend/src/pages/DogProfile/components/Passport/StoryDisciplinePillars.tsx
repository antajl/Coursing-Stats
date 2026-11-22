import React from 'react'
import MedalTally from '../../../../components/MedalTally'
import type {
  DogPassportCoursingStats,
  DogPassportRacingStats,
  DogPassportShowStats,
} from './passportTypes'

interface StoryCoursingCardProps {
  coursing: DogPassportCoursingStats
}

export const StoryCoursingCard: React.FC<StoryCoursingCardProps> = ({ coursing }) => {
  const rankLabel = coursing.yearBreedRank
    ? `#${coursing.yearBreedRank} в породе`
    : coursing.breedRank
    ? `№${coursing.breedRank} за всё время`
    : null

  return (
    <div className="rounded-xl border border-[#C2D6C6] bg-[#F7FAF8] p-3 shadow-2xs">
      <div className="grid grid-cols-[1fr_135px] items-center gap-2.5">
        {/* Левая часть: Дисциплина + Медали + Зачёт */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xs font-bold tracking-wider text-[#1F432E] uppercase">
              {coursing.disciplineTitle || 'Курсинг'}
            </span>
            {rankLabel && (
              <span className="shrink-0 text-[10px] font-semibold text-[#1F432E] bg-white/95 border border-[#C2D6C6] px-1.5 py-0.5 rounded shadow-2xs">
                {rankLabel}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px]">
            {coursing.hasData ? (
              <>
                <MedalTally
                  gold={coursing.gold}
                  silver={coursing.silver}
                  bronze={coursing.bronze}
                  showZero
                  size="sm"
                  variant="nowrap"
                />
                <span className="text-[#C5B7A1]">·</span>
                <span className="text-[#57534E]">
                  Состязания: <strong className="text-[#1C1917]">{coursing.totalStarts}</strong>
                </span>
              </>
            ) : (
              <span className="text-[#8C7E6A] italic">Состязания не зафиксированы</span>
            )}
          </div>
        </div>

        {/* Правая часть: Главный результат (фиксированная ширина для строгого выравнивания разграничителя) */}
        {coursing.hasData ? (
          <div className="w-[135px] text-right pl-3 border-l border-[#D5E3D8]">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-[#52735E]">
              Лучший результат
            </div>
            <div className="font-serif text-xl sm:text-2xl font-bold text-[#1F432E] mt-0.5 leading-none whitespace-nowrap">
              {coursing.bestScore ? (
                <>
                  {coursing.bestScore}{' '}
                  <span className="text-xs font-semibold text-[#52735E]">б.</span>
                </>
              ) : (
                `${coursing.totalStarts} сост.`
              )}
            </div>
            {coursing.avgJudgeScore != null && (
              <div className="text-[9.5px] text-[#52735E] mt-0.5">
                Ср. балл: <span className="font-semibold text-[#1F432E]">{coursing.avgJudgeScore}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-[135px] text-right pl-3 border-l border-[#D5E3D8] text-[10px] text-[#8C7E6A] italic">
            Нет данных
          </div>
        )}
      </div>
    </div>
  )
}

interface StoryRacingCardProps {
  racing: DogPassportRacingStats
}

export const StoryRacingCard: React.FC<StoryRacingCardProps> = ({ racing }) => {
  const rankLabel = racing.yearBreedRank
    ? `#${racing.yearBreedRank} в породе`
    : racing.breedRank
    ? `№${racing.breedRank} за всё время`
    : null

  return (
    <div className="rounded-xl border border-[#C5D5E6] bg-[#F5F8FB] p-3 shadow-2xs">
      <div className="grid grid-cols-[1fr_135px] items-center gap-2.5">
        {/* Левая часть: Дисциплина + Медали + Зачёт */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xs font-bold tracking-wider text-[#1A3859] uppercase">
              Рейсинг
            </span>
            {rankLabel && (
              <span className="shrink-0 text-[10px] font-semibold text-[#1A3859] bg-white/95 border border-[#C5D5E6] px-1.5 py-0.5 rounded shadow-2xs">
                {rankLabel}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px]">
            {racing.hasData ? (
              <>
                <MedalTally
                  gold={racing.gold}
                  silver={racing.silver}
                  bronze={racing.bronze}
                  showZero
                  size="sm"
                  variant="nowrap"
                />
                <span className="text-[#C5B7A1]">·</span>
                <span className="text-[#57534E]">
                  Забеги: <strong className="text-[#1C1917]">{racing.totalStarts}</strong>
                </span>
              </>
            ) : (
              <span className="text-[#8C7E6A] italic">Бега не зафиксированы</span>
            )}
          </div>
        </div>

        {/* Правая часть: Рекорд скорости (фиксированная ширина для строгого выравнивания разграничителя) */}
        {racing.hasData ? (
          <div className="w-[135px] text-right pl-3 border-l border-[#D3DFED]">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-[#4A6D94]">
              Рекорд скорости
            </div>
            <div className="font-serif text-xl sm:text-2xl font-bold text-[#1A3859] mt-0.5 leading-none whitespace-nowrap">
              {racing.bestSpeed ? (
                <>
                  {racing.bestSpeed}{' '}
                  <span className="text-xs font-semibold text-[#4A6D94]">км/ч</span>
                </>
              ) : (
                `${racing.totalStarts} забегов`
              )}
            </div>
            {racing.avgSpeed != null && (
              <div className="text-[9.5px] text-[#4A6D94] mt-0.5 whitespace-nowrap">
                Ср. скор: <span className="font-semibold text-[#1A3859]">{racing.avgSpeed}</span>{' '}
                <span className="text-[8.5px]">км/ч</span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-[135px] text-right pl-3 border-l border-[#D3DFED] text-[10px] text-[#8C7E6A] italic">
            Нет данных
          </div>
        )}
      </div>
    </div>
  )
}

interface StoryShowsCardProps {
  shows: DogPassportShowStats
}

export const StoryShowsCard: React.FC<StoryShowsCardProps> = ({ shows }) => {
  const rankLabel = shows.yearBreedRank
    ? `#${shows.yearBreedRank} в рейтинге`
    : shows.breedRank
    ? `#${shows.breedRank} в породе`
    : null

  return (
    <div className="rounded-xl border border-[#E3D5BE] bg-[#FDFBF7] p-3 shadow-2xs">
      <div className="grid grid-cols-[1fr_135px] items-center gap-2.5">
        {/* Левая часть: Дисциплина + Зачёт */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xs font-bold tracking-wider text-[#664619] uppercase">
              Выставки
            </span>
            {rankLabel ? (
              <span className="shrink-0 text-[10px] font-semibold text-[#7D5B28] bg-white/95 border border-[#E8DCC4] px-1.5 py-0.5 rounded shadow-2xs">
                {rankLabel}
              </span>
            ) : (
              <span className="shrink-0 text-[10px] font-medium text-[#8A6735] italic">
                Экстерьер
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px]">
            {shows.hasData ? (
              <>
                <span className="text-[#57534E]">
                  Зачёт: <strong className="text-[#1C1917]">{shows.totalShows}</strong>{' '}
                  {shows.totalShows === 1 ? 'выставка' : shows.totalShows < 5 ? 'выставки' : 'выставок'}
                </span>
                {shows.bobCount > 0 && (
                  <>
                    <span className="text-[#C5B7A1]">·</span>
                    <span className="font-bold text-[#7D5B28] bg-white border border-[#E8DCC4] px-1.5 py-0.2 rounded">
                      BOB: {shows.bobCount}
                    </span>
                  </>
                )}
              </>
            ) : (
              <span className="text-[#8C7E6A] italic">Выставки не зафиксированы</span>
            )}
          </div>
        </div>

        {/* Правая часть: Высшая награда (фиксированная ширина для строгого выравнивания разграничителя) */}
        {shows.hasData ? (
          <div className="w-[135px] text-right pl-3 border-l border-[#EFE5D5]">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-[#8A6735]">
              Высшая награда
            </div>
            <div className="font-serif text-xl sm:text-2xl font-bold text-[#664619] mt-0.5 leading-none whitespace-nowrap">
              {shows.bestAward || shows.bestGrade || 'Отлично'}
            </div>
            <div className="text-[9.5px] text-[#8A6735] mt-0.5">
              Оценка: <span className="font-semibold text-[#7D5B28]">{shows.bestGrade || 'Отл'}</span>
            </div>
          </div>
        ) : (
          <div className="w-[135px] text-right pl-3 border-l border-[#EFE5D5] text-[10px] text-[#8C7E6A] italic">
            Нет данных
          </div>
        )}
      </div>
    </div>
  )
}
