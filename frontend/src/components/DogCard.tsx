import { Link } from 'react-router-dom'
import { createContext, useContext, useMemo, memo, type FC, type NamedExoticComponent } from 'react'
import { dogYearBadge } from '../lib/season'
import { parseDogName } from '../lib/dogName'
import { displayBreed } from '../lib/breedMapping'
import { ratingScoreFromRow } from '../../../backend/lib/rating/coursing-rating-score'
import { MedalIcon, type MedalVariant } from './MedalTally'
import OwnerCrownName from './OwnerCrownName'
import MedalBadge from './MedalBadge'
import RankBadge from './RankBadge'
import CombinedMetricsRotator from './CombinedMetricsRotator'

// Context for compound components
interface DogCardContextValue {
  dog: DogCardProps['dog']
  type: DogCardProps['type']
  filterYear: string
  rank?: number
  variant: DogCardVariant
}

const DogCardContext = createContext<DogCardContextValue | null>(null)

function useDogCardContext() {
  const context = useContext(DogCardContext)
  if (!context) {
    throw new Error('DogCard compound components must be used within DogCard')
  }
  return context
}

/** Единая высота карточки в двухколоночном рейтинге (строки выравниваются попарно). */
export const DOG_CARD_HEIGHT_CLASS = 'h-[5.25rem]'

export type DogCardVariant = 'card' | 'embedded'

interface DogCardComposition {
  Header: typeof DogCardHeader
  Medals: typeof DogCardMedals
  Stats: typeof DogCardStats
  Rank: typeof DogCardRank
}

interface DogCardProps {
  dog: {
    dog_id: number
    name_lat: string
    name_ru?: string
    breed: string
    year?: number
    year_from?: number
    year_to?: number
    gold?: number
    silver?: number
    bronze?: number
    total_starts?: number
    best_score?: number
    avg_judge_score?: number
    best_judge_score?: number
    rating_score?: number
    judge_eval_count?: number
    best_speed?: number
    avg_speed?: number
    elo_rating?: number | null
    elo_races?: number
    elo_reliable?: boolean
    elo_low_data?: boolean
    elo_insufficient?: boolean
  }
  type: 'placement' | 'score' | 'speed' | 'elo' | 'combined'
  filterYear: string
  /**
   * Place in the visible list (re-ranked after breed/search filters).
   */
  rank?: number
  /**
   * `card` — standalone bordered tile (default).
   * `embedded` — flat row inside DoninoColumnShell (no nested card chrome).
   */
  variant?: DogCardVariant
}

const STAT_ROW_CLASS = 'grid h-12 shrink-0 gap-2'

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex min-w-0 flex-col justify-center rounded-lg bg-cream-100 px-2 py-1.5 text-center dark:bg-charcoal-700">
      <p className="mb-0.5 truncate text-[9px] uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
        {label}
      </p>
      <p className="truncate text-sm font-bold tabular-nums text-camel-700 dark:text-camel-400">{value}</p>
    </div>
  )
}

function formatScore(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return '—'
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

/** Elo on combined cards is display-only (does not affect place). */
function eloDisplay(dog: DogCardProps['dog']): { value: string; races: number } {
  const races = dog.elo_races || 0
  if (dog.elo_rating == null) {
    return { value: '—', races }
  }
  return { value: String(dog.elo_rating), races }
}

function formatIndexScore(dog: DogCardProps['dog']): string {
  const raw = dog.rating_score ?? ratingScoreFromRow(dog as Record<string, unknown>)
  if (raw == null || Number.isNaN(raw) || raw === 0) return '—'
  return Number(raw).toFixed(2)
}

/** CS breakdown: avg / peak judge / protocol Σ (starts shown separately). */
function CsDetailLine({
  dog,
  align = 'end',
}: {
  dog: DogCardProps['dog']
  align?: 'center' | 'end'
}) {
  return (
    <div
      className={`flex flex-nowrap items-center gap-x-1.5 whitespace-nowrap text-[9px] leading-tight text-charcoal-500 dark:text-charcoal-400 ${
        align === 'center' ? 'justify-center' : 'justify-end'
      }`}
    >
      <span>
        ср.{' '}
        <span className="font-semibold tabular-nums text-charcoal-700 dark:text-charcoal-200">
          {formatScore(dog.avg_judge_score)}
        </span>
      </span>
      <span className="text-old-money-300 dark:text-charcoal-500" aria-hidden>
        ·
      </span>
      <span>
        лучш.{' '}
        <span className="font-semibold tabular-nums text-charcoal-700 dark:text-charcoal-200">
          {formatScore(dog.best_judge_score)}
        </span>
      </span>
      <span className="text-old-money-300 dark:text-charcoal-500" aria-hidden>
        ·
      </span>
      <span>
        Σ{' '}
        <span className="font-semibold tabular-nums text-charcoal-700 dark:text-charcoal-200">
          {formatScore(dog.best_score)}
        </span>
      </span>
    </div>
  )
}

export function StartsLabel({ starts, size = 'sm' }: { starts: number; size?: 'sm' | 'md' }) {
  // md ≈ favorite button box (28×28): same row height, label not micro-type
  const text =
    size === 'md'
      ? 'h-7 text-sm text-charcoal-600 dark:text-charcoal-300'
      : 'text-[9px] text-charcoal-500 dark:text-charcoal-400'
  const num =
    size === 'md'
      ? 'inline-block w-[3ch] text-right text-base font-bold tabular-nums leading-none text-charcoal-800 dark:text-charcoal-100'
      : 'inline-block w-[3ch] text-right font-semibold tabular-nums text-charcoal-700 dark:text-charcoal-200'
  return (
    <div className={`flex shrink-0 items-center gap-1.5 ${text}`}>
      <span>Участий</span>
      <span className={num}>{starts}</span>
    </div>
  )
}

function ScoreStatsRow({ dog }: { dog: DogCardProps['dog'] }) {
  const starts = dog.total_starts || 0
  return (
    <div className="flex h-12 shrink-0 items-center justify-between gap-3 rounded-lg bg-cream-100 px-2 py-1.5 dark:bg-charcoal-700">
      <div className="flex min-w-0 flex-col justify-center gap-0.5">
        <div className="flex items-baseline gap-1 leading-none">
          <span className="text-lg font-bold tabular-nums text-camel-700 dark:text-camel-400">
            {formatIndexScore(dog)}
          </span>
          <span className="text-[8px] font-semibold uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
            индекс
          </span>
        </div>
        <CsDetailLine dog={dog} align="end" />
      </div>
      <StartsLabel starts={starts} />
    </div>
  )
}

function MedalStatBox({ variant, value }: { variant: MedalVariant; value?: number }) {
  return (
    <div className="flex min-w-0 flex-col justify-center rounded-lg bg-cream-100 px-2 py-1.5 text-center dark:bg-charcoal-700">
      <div className="mb-0.5 flex justify-center">
        <MedalIcon variant={variant} size="sm" />
      </div>
      <p className="text-sm font-bold tabular-nums text-charcoal-800 dark:text-charcoal-100">{value ?? 0}</p>
    </div>
  )
}

const CARD_SHELL =
  `group relative grid ${DOG_CARD_HEIGHT_CLASS} grid-rows-[auto_auto] gap-0 overflow-hidden rounded-xl border border-old-money-200 bg-white p-2 transition-colors duration-200 hover:border-camel-300 hover:bg-cream-50 dark:border-charcoal-600 dark:bg-charcoal-800 dark:hover:border-camel-700 dark:hover:bg-charcoal-700/40`

const EMBEDDED_SHELL =
  `group relative grid ${DOG_CARD_HEIGHT_CLASS} grid-rows-[auto_auto] gap-0 overflow-hidden border-0 bg-transparent px-4 py-1.5 shadow-none transition-colors duration-150 hover:bg-camel-100/60 dark:hover:bg-camel-900/30`

/** Soft wash inside the row for ranks 1–3 (bar sits outside — see Top3AccentBar). */
const TOP3_WASH: Record<1 | 2 | 3, string> = {
  1: 'bg-amber-50/45 dark:bg-amber-950/25',
  2: 'bg-slate-100/55 dark:bg-slate-800/35',
  3: 'bg-orange-50/45 dark:bg-orange-950/25',
}

const TOP3_BAR: Record<1 | 2 | 3, string> = {
  1: 'bg-[var(--rank-1-color)]',
  2: 'bg-[var(--rank-2-color)]',
  3: 'bg-[var(--rank-3-color)]',
}

/** Vertical accent outside the row (needs parent list gutter, e.g. pl-[3px]). */
export function Top3AccentBar({ rank }: { rank: number }) {
  if (rank < 1 || rank > 3) return null
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute -left-[3px] inset-y-0 z-[1] w-[3px] ${TOP3_BAR[rank as 1 | 2 | 3]}`}
    />
  )
}

// Compound components
const DogCardHeader: FC = function DogCardHeader() {
  const { dog, filterYear } = useDogCardContext()
  const { primary, secondary } = parseDogName(dog.name_lat, dog.name_ru)
  const breedDisplay = displayBreed(dog.breed)
  const yearBadge = dogYearBadge(dog, filterYear)

  return (
    <div className="min-w-0 overflow-hidden">
      <OwnerCrownName name={primary} dogId={dog.dog_id} kind="competition">
        <h3
          className="text-xs font-bold leading-snug text-charcoal-900 dark:text-charcoal-100"
          title={secondary ? `${primary} / ${secondary}` : primary}
        >
          {primary}
        </h3>
      </OwnerCrownName>
      <div className="flex items-center gap-1 text-[9px]">
        <span className="text-charcoal-500 dark:text-charcoal-400">
          {breedDisplay.primary}
        </span>
        {yearBadge && (
          <>
            <span className="text-charcoal-300 dark:text-charcoal-600" aria-hidden>
              ·
            </span>
            <span className="text-charcoal-500 dark:text-charcoal-400">
              {yearBadge.label}
            </span>
          </>
        )}
      </div>
    </div>
  )
}

const DogCardMedals: FC = function DogCardMedals() {
  const { dog } = useDogCardContext()
  return (
    <div className="flex min-w-0 shrink-0 items-center gap-1.5 text-xs">
      <MedalBadge variant="gold" count={dog.gold || 0} size="sm" />
      <MedalBadge variant="silver" count={dog.silver || 0} size="sm" />
      <MedalBadge variant="bronze" count={dog.bronze || 0} size="sm" />
    </div>
  )
}

const DogCardStats: FC = function DogCardStats() {
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
      case 'elo':
        return {
          scoreStats: [] as { label: string; value: string }[],
          starts: dog.elo_races || 0,
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
              <span className="text-charcoal-500 dark:text-charcoal-400">{stat.label}:</span>
              <span className="font-semibold tabular-nums text-charcoal-700 dark:text-charcoal-200">
                {stat.value}
              </span>
              {idx < stats.scoreStats.length - 1 && (
                <span className="text-charcoal-300 dark:text-charcoal-600" aria-hidden>
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

  if (type === 'elo') {
    const elo = eloDisplay(dog)
    return (
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold tabular-nums text-camel-700 dark:text-camel-400">
              {elo.value}
            </span>
            <span className="text-[8px] font-semibold uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
              Elo
            </span>
          </div>
        </div>
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

const DogCardRank: FC = function DogCardRank() {
  const { rank } = useDogCardContext()
  if (rank == null || rank <= 0) return null
  return (
    <div className="flex shrink-0 items-center self-stretch pr-2">
      <RankBadge rank={rank} />
    </div>
  )
}

const DogCardInner = function DogCard({ dog, type, filterYear, rank, variant = 'card' }: DogCardProps) {
  const yearBadge = dogYearBadge(dog, filterYear)
  const elo = (type === 'elo' || type === 'combined') ? eloDisplay(dog) : null
  const isTop3 = (type === 'combined' || type === 'speed') && rank != null && rank > 0 && rank <= 3
  const top3Wash = isTop3 ? TOP3_WASH[rank as 1 | 2 | 3] : ''

  const shellBase = variant === 'embedded' ? EMBEDDED_SHELL : CARD_SHELL
  const useFlexShell = type === 'combined' || type === 'speed'
  const cardShell = useFlexShell
    ? shellBase.replace(
        `grid ${DOG_CARD_HEIGHT_CLASS} grid-rows-[auto_auto]`,
        `flex ${DOG_CARD_HEIGHT_CLASS} flex-row items-stretch`
      )
    : shellBase
  // Overflow visible so the outside accent bar is not clipped by the shell.
  const shellClass = isTop3
    ? `${cardShell.replace('overflow-hidden', 'overflow-visible')} ${top3Wash}`.trim()
    : cardShell

  const contextValue = useMemo<DogCardContextValue>(
    () => ({ dog, type, filterYear, rank, variant }),
    [dog, type, filterYear, rank, variant]
  )

  return (
    <DogCardContext.Provider value={contextValue}>
      <Link to={`/dog/${dog.dog_id}`} className={shellClass}>
        {isTop3 && rank != null ? <Top3AccentBar rank={rank} /> : null}
        {type === 'combined' && elo ? (
          <>
            <DogCardRank />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between gap-0 overflow-hidden">
              <DogCardHeader />
              <DogCardMedals />
            </div>

            <div className="mr-8 flex min-h-0 min-w-[10.5rem] shrink-0 flex-col justify-between border-l border-old-money-200/60 pl-2 dark:border-charcoal-600/60">
              <CombinedMetricsRotator
                csValue={formatIndexScore(dog)}
                eloValue={elo.value}
              />
              <div className="flex justify-end">
                <StartsLabel starts={dog.total_starts || 0} size="md" />
              </div>
            </div>
          </>
        ) : type === 'speed' ? (
          <>
            <DogCardRank />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between gap-0 overflow-hidden">
              <DogCardHeader />
              <DogCardStats />
            </div>
          </>
        ) : (
          <>
            <div className="flex w-full items-start gap-2 overflow-hidden">
              {rank != null && rank > 0 && <RankBadge rank={rank} />}
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
