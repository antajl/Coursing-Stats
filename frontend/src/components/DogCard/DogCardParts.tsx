import { useMemo, type FC } from 'react'
import { ShieldAlert } from 'lucide-react'
import { dogYearBadge } from '../../lib/season'
import { parseDogName } from '../../lib/dogName'
import { displayBreed } from '../../lib/breedMapping'
import OwnerCrownName from '../OwnerCrownName'
import MedalBadge from '../MedalBadge'
import RankBadge from '../RankBadge'
import HoverTooltip from '../ui/HoverTooltip'
import DogSexIcon from '../DogSexIcon'
import { useDogCardContext } from './DogCardContext'
import { StartsLabel, ScoreStatsRow } from './DogCardHelpers'

export const DogCardHeader: FC = function DogCardHeader() {
  const { dog, filterYear } = useDogCardContext()
  const { primary, secondary } = parseDogName(dog.name_lat, dog.name_ru)
  const breedDisplay = displayBreed(dog.breed)
  const yearBadge = dogYearBadge(dog, filterYear)
  const showYear = yearBadge && (!filterYear || filterYear === 'all')

  return (
    <div className="min-w-0 overflow-hidden">
      <div className="flex items-center gap-1.5 min-w-0">
        <OwnerCrownName name={primary} dogId={dog.dog_id} kind="competition">
          <h3
            className="text-[13px] sm:text-sm 2xl:text-[15px] font-bold leading-snug text-charcoal-900 truncate"
            title={secondary ? `${primary} / ${secondary}` : primary}
          >
            {primary}
          </h3>
        </OwnerCrownName>
        {dog.aggression_count && dog.aggression_count > 0 ? (
          <HoverTooltip
            label={
              dog.aggression_count === 1
                ? 'Дисквалификация за агрессию (1 состязание)'
                : `Повторная агрессия (рецидив: ${dog.aggression_count} состязания)`
            }
            placement="top"
            portal
          >
            <span
              className="inline-flex items-center shrink-0 p-0.5 rounded text-rose-600 transition-transform hover:scale-110 cursor-help"
              aria-label="Внимание: агрессия на трассе"
            >
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
            </span>
          </HoverTooltip>
        ) : null}
      </div>
      <div className="flex items-center gap-1 text-[10.5px] 2xl:text-xs">
        <span className="text-charcoal-600 font-medium truncate">
          {breedDisplay.primary}
        </span>
        {dog.sex && (
          <>
            <span className="text-charcoal-300 shrink-0" aria-hidden>
              ·
            </span>
            <DogSexIcon sex={dog.sex} size={11} variant="neutral" strokeWidth={2.25} />
          </>
        )}
        {showYear && (
          <>
            <span className="text-charcoal-300 shrink-0" aria-hidden>
              ·
            </span>
            <span className="text-charcoal-500 shrink-0">
              {yearBadge.label}
            </span>
          </>
        )}
      </div>
    </div>
  )
}

export const DogCardMedals: FC = function DogCardMedals() {
  const { dog } = useDogCardContext()
  return (
    <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-1.5 text-xs">
      <MedalBadge variant="gold" count={dog.gold || 0} size="sm" />
      <MedalBadge variant="silver" count={dog.silver || 0} size="sm" />
      <MedalBadge variant="bronze" count={dog.bronze || 0} size="sm" />
    </div>
  )
}

export const DogCardStats: FC = function DogCardStats() {
  const { dog, type } = useDogCardContext()
  const stats = useMemo(() => {
    switch (type) {
      case 'placement':
        return {
          scoreStats: [] as { label: string; value: string }[],
          starts: dog.total_starts || 0,
        }
      case 'score':
        return {
          scoreStats: [] as { label: string; value: string }[],
          starts: dog.total_starts || 0,
        }
      case 'combined':
        return {
          scoreStats: [] as { label: string; value: string }[],
          starts: dog.total_starts || 0,
        }
      case 'speed':
        return {
          scoreStats: [
            {
              label: 'Макс., км/ч',
              value: dog.best_speed ? dog.best_speed.toFixed(1) : '-',
            },
            {
              label: 'Сред., км/ч',
              value: dog.avg_speed ? dog.avg_speed.toFixed(1) : '-',
            },
          ],
          starts: dog.total_starts || 0,
        }
    }
  }, [dog, type])

  if (type === 'score') {
    return <ScoreStatsRow dog={dog} />
  }

  if (type === 'speed') {
    return (
      <div className="flex min-w-0 items-center justify-between gap-2 text-xs">
        <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
          {stats.scoreStats.map((stat, idx) => (
            <div key={idx} className="contents">
              <span className="text-charcoal-500">{stat.label}:</span>
              <span className="font-semibold tabular-nums text-charcoal-700">
                {stat.value}
              </span>
              {idx < stats.scoreStats.length - 1 && (
                <span className="text-charcoal-300" aria-hidden>
                  ·
                </span>
              )}
            </div>
          ))}
        </div>
        <StartsLabel starts={stats.starts} size="md" />
      </div>
    )
  }

  if (type === 'placement') {
    return (
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <MedalBadge variant="gold" count={dog.gold || 0} size="sm" />
          <MedalBadge variant="silver" count={dog.silver || 0} size="sm" />
          <MedalBadge variant="bronze" count={dog.bronze || 0} size="sm" />
        </div>
        <StartsLabel starts={stats.starts} size="md" />
      </div>
    )
  }

  return null
}

export const DogCardRank: FC<{ className?: string }> = function DogCardRank({ className = '' }) {
  const { rank, dog, variant } = useDogCardContext()
  if (rank == null || rank <= 0) return null
  const delta = (dog as any)?.rank_delta
  const isEmbedded = variant === 'embedded'

  return (
    <div
      className={`flex min-h-0 ${
        isEmbedded
          ? 'min-w-[2.25rem] sm:min-w-[2.5rem] pr-1.5 sm:pr-2 mr-1.5 sm:mr-2'
          : 'min-w-[2.75rem] sm:min-w-[3rem] pr-2 sm:pr-2.5 mr-2 sm:mr-2.5'
      } shrink-0 flex-col items-center justify-center border-r border-old-money-200/40 self-stretch ${className}`}
    >
      <RankBadge rank={rank} delta={delta} />
    </div>
  )
}
