import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import OwnerCrownName from './OwnerCrownName'
import RankBadge from './RankBadge'
import MedalBadge from './MedalBadge'
import DogSexIcon from './DogSexIcon'
import { DOG_CARD_HEIGHT_CLASS, StartsLabel, Top3AccentBar } from './DogCard'
import { displayBreed } from '../lib/breedMapping'
import {
  showAwardBadgeClass,
  SHOW_AWARD_BADGE,
} from '../lib/qualificationTitles'

/** Soft wash inside the row; bar is outside via Top3AccentBar. */
const TOP3_WASH: Record<1 | 2 | 3, string> = {
  1: 'bg-amber-50/45',
  2: 'bg-slate-100/55',
  3: 'bg-orange-50/45',
}

const SHOW_BADGE_MAP = SHOW_AWARD_BADGE as Record<string, string>

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
  bestAward?: string | null
}

/**
 * Home season row — fully symmetrical with ranking DogCard (combined):
 * left rank wreath top-aligned, center name + breed/sex + titles,
 * right divider with starts count & best award badge.
 */
export default function HomeSeasonTopRow({
  to,
  name,
  breed,
  sex,
  dogId,
  meta,
  metric,
  rank,
  gold,
  silver,
  bronze,
  totalStarts,
  showTitles,
  bestAward,
}: HomeSeasonTopRowProps) {
  const participations = totalStarts || 0
  const isTop3 = rank != null && rank >= 1 && rank <= 3
  const top3Wash = isTop3 ? TOP3_WASH[rank as 1 | 2 | 3] : ''

  const breedDisplay = breed ? displayBreed(breed) : null

  const renderRank = (rankVal: number) => (
    <div className="flex min-h-0 min-w-[2.75rem] sm:min-w-[3rem] shrink-0 flex-col items-center justify-start pt-1 pr-2 sm:pr-2.5 mr-2 sm:mr-2.5 border-r border-old-money-200/70 self-stretch">
      <RankBadge rank={rankVal} />
    </div>
  )

  const renderHeader = (
    <div className="min-w-0 overflow-hidden">
      <OwnerCrownName name={name} breed={breed} dogId={dogId} kind="competition">
        <h3
          className="text-xs font-bold leading-snug text-charcoal-900 truncate"
          title={name}
        >
          {name}
        </h3>
      </OwnerCrownName>
      {breedDisplay || sex || meta ? (
        <div className="flex items-center gap-1 text-[10px]">
          {breedDisplay && (
            <span className="text-charcoal-600 font-medium truncate">
              {breedDisplay.primary}
            </span>
          )}
          {sex && (
            <>
              <span className="text-charcoal-300 shrink-0" aria-hidden>
                ·
              </span>
              <DogSexIcon sex={sex} size={11} variant="neutral" strokeWidth={2.25} />
            </>
          )}
          {meta && (
            <>
              <span className="text-charcoal-300 shrink-0" aria-hidden>
                ·
              </span>
              <span className="text-charcoal-500 shrink-0">{meta}</span>
            </>
          )}
        </div>
      ) : null}
    </div>
  )

  const renderMetricLine =
    showTitles != null ? (
      <div className="flex items-center gap-1 text-[11px] text-charcoal-500 min-w-0">
        <span className="shrink-0 text-charcoal-500">Титулы:</span>
        <strong className="font-semibold text-camel-700 truncate">
          {showTitles}
        </strong>
      </div>
    ) : metric != null ? (
      <div className="flex items-center gap-1 text-[11px] text-charcoal-500 min-w-0">
        <strong className="font-semibold text-camel-700 truncate">{metric}</strong>
      </div>
    ) : null

  const renderBestAwardOrMedals = bestAward ? (
    <div className="flex items-center gap-1 leading-none">
      <span className="text-[9px] uppercase tracking-wide text-charcoal-500">
        лучшая:
      </span>
      <span
        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${showAwardBadgeClass(
          bestAward as any,
        )}`}
      >
        {SHOW_BADGE_MAP[bestAward] || bestAward}
      </span>
    </div>
  ) : gold !== undefined && silver !== undefined && bronze !== undefined ? (
    <div className="flex min-w-0 shrink-0 items-center gap-1.5 text-xs">
      <MedalBadge variant="gold" count={gold || 0} size="sm" />
      <MedalBadge variant="silver" count={silver || 0} size="sm" />
      <MedalBadge variant="bronze" count={bronze || 0} size="sm" />
    </div>
  ) : null

  return (
    <Link
      to={to}
      className={`group relative flex min-h-[5rem] sm:${DOG_CARD_HEIGHT_CLASS} flex-row items-stretch gap-0 ${
        isTop3 ? 'overflow-visible' : 'overflow-hidden'
      } border-0 bg-transparent px-3 sm:px-4 py-1.5 shadow-none transition-colors duration-150 hover:bg-camel-100/60 ${top3Wash}`.trim()}
    >
      {isTop3 && rank != null ? <Top3AccentBar rank={rank} /> : null}

      <div className="flex flex-row items-stretch w-full min-w-0">
        {rank != null && rank > 0 ? renderRank(rank) : null}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-0.5 sm:gap-1">
          {renderHeader}
          {renderMetricLine}
        </div>

        <div className="mr-6 sm:mr-7 flex min-h-0 w-[6.5rem] sm:w-[8.5rem] shrink-0 flex-col justify-center items-start border-l border-old-money-200/60 pl-2 sm:pl-2.5">
          <div className="flex flex-col items-start gap-1 sm:gap-1.5">
            <StartsLabel starts={participations} size="md" label="Выставок" />
            {renderBestAwardOrMedals}
          </div>
        </div>
      </div>
    </Link>
  )
}
