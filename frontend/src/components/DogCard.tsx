import { Link } from 'react-router-dom'
import { dogYearBadge } from '../lib/season'
import { parseDogName } from '../lib/dogName'
import { displayBreed } from '../lib/breedMapping'
import { ratingScoreFromRow } from '../../../backend/lib/rating/coursing-rating-score'
import { MedalIcon, type MedalVariant } from './MedalTally'
import OwnerCrownName from './OwnerCrownName'

/** Единая высота карточки в двухколоночном рейтинге (строки выравниваются попарно). */
export const DOG_CARD_HEIGHT_CLASS = 'h-[9rem]'

export type DogCardVariant = 'card' | 'embedded'

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
  }
  type: 'placement' | 'score' | 'speed'
  filterYear: string
  /** Место в полном рейтинге среза (не позиция в фильтре). */
  rank?: number
  /**
   * `card` — standalone bordered tile (default).
   * `embedded` — flat row inside DoninoColumnShell (no nested card chrome).
   */
  variant?: DogCardVariant
}

const STAT_ROW_CLASS = 'grid h-14 shrink-0 gap-2'

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

function formatJudgeScore(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return '—'
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function formatIndexScore(dog: DogCardProps['dog']): string {
  const raw = dog.rating_score ?? ratingScoreFromRow(dog as Record<string, unknown>)
  if (raw == null || Number.isNaN(raw) || raw === 0) return '—'
  return Number(raw).toFixed(2)
}

function ScoreStatsRow({ dog }: { dog: DogCardProps['dog'] }) {
  const starts = dog.total_starts || 0
  return (
    <div className="flex h-14 shrink-0 flex-col justify-center gap-1 rounded-lg bg-cream-100 px-2 py-1.5 dark:bg-charcoal-700">
      <div className="flex items-baseline justify-center gap-1 leading-none">
        <span className="text-lg font-bold tabular-nums text-camel-700 dark:text-camel-400">
          {formatIndexScore(dog)}
        </span>
        <span className="text-[8px] font-semibold uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
          индекс
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0 text-[9px] leading-tight text-charcoal-500 dark:text-charcoal-400">
        <span>
          ср. <span className="font-semibold tabular-nums text-charcoal-700 dark:text-charcoal-200">{formatJudgeScore(dog.avg_judge_score)}</span>
        </span>
        <span className="text-old-money-300 dark:text-charcoal-500" aria-hidden>
          ·
        </span>
        <span>
          лучш.{' '}
          <span className="font-semibold tabular-nums text-charcoal-700 dark:text-charcoal-200">
            {formatJudgeScore(dog.best_judge_score)}
          </span>
        </span>
        <span className="text-old-money-300 dark:text-charcoal-500" aria-hidden>
          ·
        </span>
        <span>
          Σ{' '}
          <span className="font-semibold tabular-nums text-charcoal-700 dark:text-charcoal-200">
            {formatJudgeScore(dog.best_score)}
          </span>
        </span>
        <span className="text-old-money-300 dark:text-charcoal-500" aria-hidden>
          ·
        </span>
        <span>
          <span className="font-semibold tabular-nums text-charcoal-700 dark:text-charcoal-200">{starts}</span> ст.
        </span>
      </div>
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
  `relative grid ${DOG_CARD_HEIGHT_CLASS} grid-rows-[minmax(0,1fr)_3.5rem] gap-2 overflow-hidden rounded-xl border border-old-money-200 bg-white p-3 shadow-sm transition-all duration-200 hover:border-camel-300 hover:shadow-md dark:border-charcoal-600 dark:bg-charcoal-800 dark:hover:border-camel-700`

const EMBEDDED_SHELL =
  `relative grid ${DOG_CARD_HEIGHT_CLASS} grid-rows-[minmax(0,1fr)_3.5rem] gap-2 overflow-hidden border-0 bg-transparent px-3.5 py-3 shadow-none transition-colors duration-150 hover:bg-cream-100/90 dark:hover:bg-charcoal-700/45`

export default function DogCard({ dog, type, filterYear, rank, variant = 'card' }: DogCardProps) {
  const { primary, secondary } = parseDogName(dog.name_lat, dog.name_ru)
  const breedDisplay = displayBreed(dog.breed)

  const getStats = () => {
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
  }

  const stats = getStats()
  const yearBadge = dogYearBadge(dog, filterYear)

  const statsGridClass =
    type === 'speed' ? `${STAT_ROW_CLASS} grid-cols-3` : type === 'placement' ? `${STAT_ROW_CLASS} grid-cols-4` : ''

  return (
    <Link
      to={`/dog/${dog.dog_id}`}
      className={variant === 'embedded' ? EMBEDDED_SHELL : CARD_SHELL}
    >
      <div className="flex min-h-0 flex-col justify-end gap-1 overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <OwnerCrownName name={primary} dogId={dog.dog_id} kind="competition">
            <h3
              className="line-clamp-2 text-sm font-bold leading-snug text-charcoal-800 dark:text-charcoal-100"
              title={secondary ? `${primary} / ${secondary}` : primary}
            >
              {primary}
            </h3>
          </OwnerCrownName>
          {rank != null && rank > 0 ? (
            <span
              className="shrink-0 pt-0.5 text-sm font-bold leading-snug tabular-nums text-charcoal-400 dark:text-charcoal-500"
              aria-label={`Место ${rank}`}
            >
              #{rank}
            </span>
          ) : null}
        </div>
        <div className="flex min-w-0 shrink-0 items-start gap-1.5 overflow-hidden">
          <div className="min-w-0 max-w-full">
            <span
              className="inline-block max-w-full truncate rounded-md bg-cream-100 px-1.5 py-0.5 text-[10px] font-medium text-charcoal-600 dark:bg-charcoal-700 dark:text-charcoal-300"
              title={
                breedDisplay.secondary
                  ? `${breedDisplay.primary} — ${breedDisplay.secondary}`
                  : breedDisplay.primary
              }
            >
              {breedDisplay.primary}
            </span>
          </div>
          {yearBadge && (
            <span
              title={yearBadge.title}
              className="shrink-0 whitespace-nowrap rounded-md bg-camel-100 px-1.5 py-0.5 text-[11px] font-semibold text-camel-700 dark:bg-charcoal-700 dark:text-camel-400"
            >
              {yearBadge.label}
            </span>
          )}
        </div>
      </div>

      {type === 'score' ? (
        <ScoreStatsRow dog={dog} />
      ) : (
        <div className={`${statsGridClass} relative z-[1]`}>
          {type === 'placement' && (
            <>
              <MedalStatBox variant="gold" value={dog.gold} />
              <MedalStatBox variant="silver" value={dog.silver} />
              <MedalStatBox variant="bronze" value={dog.bronze} />
              <StatBox label="Старты" value={stats.starts} />
            </>
          )}
          {type === 'speed' &&
            stats.scoreStats.map((stat, idx) => (
              <StatBox key={idx} label={stat.label} value={stat.value} />
            ))}
          {type === 'speed' && <StatBox label="Старты" value={stats.starts} />}
        </div>
      )}
    </Link>
  )
}
