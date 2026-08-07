import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import OwnerCrownName from './OwnerCrownName'
import RankBadge from './RankBadge'
import MedalBadge from './MedalBadge'
import { DOG_CARD_HEIGHT_CLASS, StartsLabel, Top3AccentBar } from './DogCard'
import { displayBreed } from '../lib/breedMapping'

/** Soft wash inside the row; bar is outside via Top3AccentBar. */
const TOP3_WASH: Record<1 | 2 | 3, string> = {
  1: 'bg-amber-50/45 dark:bg-amber-950/25',
  2: 'bg-slate-100/55 dark:bg-slate-800/35',
  3: 'bg-orange-50/45 dark:bg-orange-950/25',
}

interface HomeSeasonTopRowProps {
  to: string
  name: string
  breed?: string
  sex?: string
  dogId?: number | null
  meta?: string
  metric: ReactNode
  rank?: number
  gold?: number
  silver?: number
  bronze?: number
  totalStarts?: number
  showTitles?: ReactNode
}

/**
 * Home season row — same shell as ranking DogCard (combined):
 * left name + awards, right full-height divider with starts.
 */
export default function HomeSeasonTopRow({
  to,
  name,
  breed,
  sex: _sex,
  dogId,
  meta,
  metric,
  rank,
  gold,
  silver,
  bronze,
  totalStarts,
  showTitles,
}: HomeSeasonTopRowProps) {
  const participations = totalStarts || 0
  const isTop3 = rank != null && rank >= 1 && rank <= 3
  const top3Wash = isTop3 ? TOP3_WASH[rank as 1 | 2 | 3] : ''

  const awards =
    showTitles != null ? (
      <span className="donino-home-metric min-w-0 truncate">{showTitles}</span>
    ) : gold !== undefined && silver !== undefined && bronze !== undefined ? (
      <div className="flex min-w-0 shrink-0 items-center gap-1.5">
        <MedalBadge variant="gold" count={gold || 0} size="sm" />
        <MedalBadge variant="silver" count={silver || 0} size="sm" />
        <MedalBadge variant="bronze" count={bronze || 0} size="sm" />
      </div>
    ) : (
      <span className="donino-home-metric min-w-0 truncate">{metric}</span>
    )

  return (
    <Link
      to={to}
      className={`relative flex ${DOG_CARD_HEIGHT_CLASS} flex-row items-stretch gap-0 ${isTop3 ? 'overflow-visible' : 'overflow-hidden'} border-0 bg-transparent px-4 py-1.5 shadow-none transition-colors duration-150 hover:bg-camel-100/60 dark:hover:bg-camel-900/30 ${top3Wash}`.trim()}
    >
      {isTop3 && rank != null ? <Top3AccentBar rank={rank} /> : null}
      {rank != null && rank > 0 ? (
        <div className="flex shrink-0 items-center self-stretch pr-2">
          <RankBadge rank={rank} />
        </div>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between gap-0 overflow-hidden">
        <div className="min-w-0 overflow-hidden">
          <OwnerCrownName name={name} breed={breed} dogId={dogId} kind="competition">
            <h3
              className="text-xs font-bold leading-snug text-charcoal-900 dark:text-charcoal-100"
              title={name}
            >
              {name}
            </h3>
          </OwnerCrownName>
          {breed || meta ? (
            <div className="flex items-center gap-1 text-[9px]">
              {breed && (
                <span className="text-charcoal-500 dark:text-charcoal-400">
                  {displayBreed(breed).primary}
                </span>
              )}
              {breed && meta && (
                <span className="text-charcoal-300 dark:text-charcoal-600" aria-hidden>
                  ·
                </span>
              )}
              {meta && (
                <span className="text-charcoal-500 dark:text-charcoal-400">{meta}</span>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex min-w-0 items-center gap-2 text-xs">{awards}</div>
      </div>

      <div className="flex min-h-0 min-w-[6.5rem] shrink-0 flex-col justify-end border-l border-old-money-200/60 pl-2 dark:border-charcoal-600/60">
        <div className="flex justify-end">
          <StartsLabel starts={participations} size="md" />
        </div>
      </div>
    </Link>
  )
}

