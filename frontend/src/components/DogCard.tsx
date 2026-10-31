import { Link } from 'react-router-dom'
import { createContext, useContext, useMemo, memo, type FC, type NamedExoticComponent } from 'react'
import { dogYearBadge } from '../lib/season'
import { parseDogName } from '../lib/dogName'
import { displayBreed } from '../lib/breedMapping'
import { ratingScoreFromRow } from '../../../backend/lib/rating/coursing-rating-score'
import { MedalIcon, type MedalVariant } from './MedalTally'
import OwnerCrownName from './OwnerCrownName'
import MedalBadge from './MedalBadge'
import RankBadge, { DeltaBadge } from './RankBadge'
import { ShieldAlert } from 'lucide-react'
import HoverTooltip from './ui/HoverTooltip'
import DogSexIcon from './DogSexIcon'

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
export const DOG_CARD_HEIGHT_CLASS = 'h-[4.25rem]'

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
    aggression_count?: number
    sex?: string | null
  }
  type: 'placement' | 'score' | 'speed' | 'combined'
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
    <div className="flex min-w-0 flex-col justify-center rounded-lg bg-cream-100 px-2 py-1.5 text-center">
      <p className="mb-0.5 truncate text-[9px] uppercase tracking-wide text-charcoal-500">
        {label}
      </p>
      <p className="truncate text-sm font-bold tabular-nums text-camel-700">{value}</p>
    </div>
  )
}

function formatScore(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return '—'
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
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
      className={`flex flex-nowrap items-center gap-x-1.5 whitespace-nowrap text-[9px] leading-tight text-charcoal-500 ${
        align === 'center' ? 'justify-center' : 'justify-end'
      }`}
    >
      <span>
        ср.{' '}
        <span className="font-semibold tabular-nums text-charcoal-700">
          {formatScore(dog.avg_judge_score)}
        </span>
      </span>
      <span className="text-old-money-300" aria-hidden>
        ·
      </span>
      <span>
        лучш.{' '}
        <span className="font-semibold tabular-nums text-charcoal-700">
          {formatScore(dog.best_judge_score)}
        </span>
      </span>
      <span className="text-old-money-300" aria-hidden>
        ·
      </span>
      <span>
        Σ{' '}
        <span className="font-semibold tabular-nums text-charcoal-700">
          {formatScore(dog.best_score)}
        </span>
      </span>
    </div>
  )
}

export function StartsLabel({
  starts,
  size = 'sm',
  label,
}: {
  starts: number
  size?: 'sm' | 'md'
  label?: string
}) {
  // md ≈ favorite button box (28×28): same row height, label not micro-type
  const isMd = size === 'md'
  return (
    <div
      className={`flex shrink-0 items-center gap-1 sm:gap-1.5 ${
        isMd ? 'h-5 sm:h-7 text-xs sm:text-sm text-charcoal-600' : 'text-[9px] text-charcoal-500'
      }`}
    >
      {label ? (
        <span>{label}</span>
      ) : (
        <>
          <span className="hidden sm:inline">Забегов</span>
          <span className="sm:hidden text-[10px] text-charcoal-500">Заб.</span>
        </>
      )}
      <span
        className={`inline-block text-right font-bold tabular-nums leading-none text-charcoal-900 ${
          isMd ? 'text-xs sm:text-base sm:w-[3ch]' : 'text-[10px] sm:text-xs'
        }`}
      >
        {starts}
      </span>
    </div>
  )
}

function ScoreStatsRow({ dog }: { dog: DogCardProps['dog'] }) {
  const starts = dog.total_starts || 0
  return (
    <div className="flex h-12 shrink-0 items-center justify-between gap-3 rounded-lg bg-cream-100 px-2 py-1.5">
      <div className="flex min-w-0 flex-col justify-center gap-0.5">
        <div className="flex items-baseline gap-1 leading-none">
          <span className="text-lg font-bold tabular-nums text-camel-700">
            {formatIndexScore(dog)}
          </span>
          <span className="text-[8px] font-semibold uppercase tracking-wide text-charcoal-500">
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
    <div className="flex min-w-0 flex-col justify-center rounded-lg bg-cream-100 px-2 py-1.5 text-center">
      <div className="mb-0.5 flex justify-center">
        <MedalIcon variant={variant} size="sm" />
      </div>
      <p className="text-sm font-bold tabular-nums text-charcoal-800">{value ?? 0}</p>
    </div>
  )
}

const CARD_SHELL =
  `group relative grid min-h-[4.25rem] sm:h-[4.25rem] grid-rows-[auto_auto] gap-0 overflow-hidden rounded-xl border border-old-money-200 bg-white p-2 transition-colors duration-200 hover:border-camel-300 hover:bg-cream-50`

const EMBEDDED_SHELL =
  `group relative grid min-h-[4.25rem] sm:h-[4.25rem] grid-rows-[auto_auto] gap-0 overflow-hidden border-0 bg-transparent px-3 sm:px-4 py-1 shadow-none transition-colors duration-150 hover:bg-camel-100/60`

/** Soft wash inside the row for ranks 1–3 (bar sits outside — see Top3AccentBar). */
const TOP3_WASH: Record<1 | 2 | 3, string> = {
  1: 'bg-amber-50/45',
  2: 'bg-slate-100/55',
  3: 'bg-orange-50/45',
}

const TOP3_BAR: Record<1 | 2 | 3, string> = {
  1: 'bg-[var(--rank-1-color)]',
  2: 'bg-[var(--rank-2-color)]',
  3: 'bg-[var(--rank-3-color)]',
}

/** Vertical accent outside the row (needs parent list gutter, e.g. pl-[3px]). */
export function Top3AccentBar({ rank }: { rank: number }) {
  return null
}

// Compound components
const DogCardHeader: FC = function DogCardHeader() {
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

const DogCardMedals: FC = function DogCardMedals() {
  const { dog } = useDogCardContext()
  return (
    <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-1.5 text-xs">
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

const DogCardRank: FC<{ className?: string }> = function DogCardRank({ className = '' }) {
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

const DogCardInner = function DogCard({ dog, type, filterYear, rank, variant = 'card' }: DogCardProps) {
  const yearBadge = dogYearBadge(dog, filterYear)
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
  // Overflow visible so the outside accent bar is not clipped by the shell.
  const shellClass = isTop3
    ? `${cardShell.replace('overflow-hidden', 'overflow-visible')} ${top3Wash}`.trim()
    : cardShell

  const contextValue = useMemo<DogCardContextValue>(
    () => ({ dog, type, filterYear, rank, variant }),
    [dog, type, filterYear, rank, variant]
  )

  const statsColClass = isEmbedded
    ? 'mr-0 flex min-h-0 w-auto shrink-0 min-w-[4.5rem] sm:min-w-[5rem] flex-col justify-center items-start border-l border-old-money-200/35 pl-2 sm:pl-2.5 pr-0.5'
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
