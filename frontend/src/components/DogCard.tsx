import { Link } from 'react-router-dom'
import { useMemo, memo, type NamedExoticComponent } from 'react'
import {
  DogCardContext,
  type DogCardContextValue,
  type DogCardProps,
  type DogCardVariant,
} from './DogCard/DogCardContext'
import {
  DogCardHeader,
  DogCardMedals,
  DogCardStats,
  DogCardRank,
} from './DogCard/DogCardParts'
import {
  DOG_CARD_HEIGHT_CLASS,
  CARD_SHELL,
  EMBEDDED_SHELL,
  TOP3_WASH,
  Top3AccentBar,
  formatIndexScore,
  StartsLabel,
} from './DogCard/DogCardHelpers'
import RankBadge from './RankBadge'

// Re-exports for backward compatibility
export { DOG_CARD_HEIGHT_CLASS, StartsLabel, Top3AccentBar }
export type { DogCardProps, DogCardVariant }

interface DogCardComposition {
  Header: typeof DogCardHeader
  Medals: typeof DogCardMedals
  Stats: typeof DogCardStats
  Rank: typeof DogCardRank
}

const DogCardInner = function DogCard({ dog, type, filterYear, rank, variant = 'card' }: DogCardProps) {
  const isTop3 = (type === 'combined' || type === 'speed') && rank != null && rank > 0 && rank <= 3
  const top3Wash = isTop3 ? TOP3_WASH[rank as 1 | 2 | 3] : ''
  const isEmbedded = variant === 'embedded'

  const shellBase = variant === 'embedded' ? EMBEDDED_SHELL : CARD_SHELL
  const useFlexShell = type === 'combined' || type === 'speed'
  const cardShell = useFlexShell
    ? shellBase.replace(
        `grid min-h-[4.25rem] sm:h-[4.25rem] grid-rows-[auto_auto]`,
        `flex min-h-[4.25rem] sm:h-[4.25rem] flex-row items-stretch`
      )
    : shellBase
  const shellClass = isTop3
    ? `${cardShell.replace('overflow-hidden', 'overflow-visible')} ${top3Wash}`.trim()
    : cardShell

  const contextValue = useMemo<DogCardContextValue>(
    () => ({ dog, type, filterYear, rank, variant }),
    [dog, type, filterYear, rank, variant]
  )

  const statsColClass = isEmbedded
    ? 'mr-0 flex min-h-0 w-[7.75rem] shrink-0 flex-col justify-center items-start border-l border-old-money-200/35 pl-2 sm:pl-2.5 pr-0.5'
    : 'mr-6 sm:mr-7 flex min-h-0 w-[6.5rem] sm:w-[8.5rem] shrink-0 flex-col justify-center items-start border-l border-old-money-200/35 pl-2 sm:pl-2.5'

  return (
    <DogCardContext.Provider value={contextValue}>
      <Link to={`/dog/${dog.dog_id}/`} className={shellClass}>
        {isTop3 && rank != null ? <Top3AccentBar rank={rank} /> : null}
        {type === 'combined' ? (
          <div className="flex flex-row items-stretch w-full min-w-0">
            <DogCardRank />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-0.5 sm:gap-1">
              <DogCardHeader />
              <div className="flex items-center gap-1 text-[11px] sm:text-[11.5px] text-charcoal-600 font-medium">
                <span>Индекс CS:</span>
                <strong className="font-bold text-charcoal-900 tabular-nums">
                  {formatIndexScore(dog)}
                </strong>
              </div>
            </div>

            <div className={statsColClass}>
              <div className="flex flex-col items-start gap-0.5 sm:gap-1">
                <StartsLabel starts={dog.total_starts || 0} size="md" />
                <DogCardMedals />
              </div>
            </div>
          </div>
        ) : type === 'speed' ? (
          <div className="flex flex-row items-stretch w-full min-w-0">
            <DogCardRank />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-0.5 sm:gap-1">
              <DogCardHeader />
              <div className="flex items-center gap-1 text-[11px] sm:text-[11.5px] text-charcoal-600 font-medium">
                <span className="hidden sm:inline">Средняя скорость:</span>
                <span className="sm:hidden">Ср. скор:</span>
                <strong className="font-bold text-charcoal-900 tabular-nums">
                  {dog.avg_speed ? dog.avg_speed.toFixed(1) : '—'}
                </strong>
                <span className="text-[9.5px] sm:text-[10.5px] text-charcoal-500 font-normal">км/ч</span>
              </div>
            </div>

            <div className={statsColClass}>
              <div className="flex flex-col items-start gap-0.5 sm:gap-1">
                <StartsLabel starts={dog.total_starts || 0} size="md" />
                <div className="flex items-center gap-1 sm:gap-1.5 leading-none whitespace-nowrap">
                  <span className="text-base sm:text-lg font-bold tabular-nums text-camel-700 leading-none">
                    {dog.best_speed ? dog.best_speed.toFixed(1) : '—'}
                  </span>
                  <span className="flex flex-col text-[7.5px] sm:text-[8px] font-semibold uppercase tracking-wide text-charcoal-500 leading-[1.1]">
                    <span>макс.</span>
                    <span>км/ч</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex w-full items-start gap-2 overflow-hidden">
              {rank != null && rank > 0 && <RankBadge rank={rank} delta={(dog as any)?.rank_delta} />}
              <div className="min-w-0 flex-1">
                <DogCardHeader />
              </div>
            </div>
            <DogCardStats />
          </>
        )}
      </Link>
    </DogCardContext.Provider>
  )
}

const DogCardMemo = memo(DogCardInner, (prevProps, nextProps) => {
  return (
    prevProps.dog.dog_id === nextProps.dog.dog_id &&
    (prevProps.dog as any)?.rank_delta === (nextProps.dog as any)?.rank_delta &&
    prevProps.dog.year_from === nextProps.dog.year_from &&
    prevProps.dog.year_to === nextProps.dog.year_to &&
    prevProps.dog.year === nextProps.dog.year &&
    prevProps.type === nextProps.type &&
    prevProps.filterYear === nextProps.filterYear &&
    prevProps.rank === nextProps.rank &&
    prevProps.variant === nextProps.variant
  )
}) as NamedExoticComponent<DogCardProps> & DogCardComposition

// Attach compound components to memoized component
DogCardMemo.Header = DogCardHeader
DogCardMemo.Medals = DogCardMedals
DogCardMemo.Stats = DogCardStats
DogCardMemo.Rank = DogCardRank

export default DogCardMemo
