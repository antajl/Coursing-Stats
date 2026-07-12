import { Link } from 'react-router-dom'
import HoverTooltip from '../../components/ui/HoverTooltip'
import { titleBadgeClass } from '../../lib/qualificationTitles'
import {
  SHOW_AWARD_LABELS,
  SHOW_AWARD_ORDER,
  type ShowAwardKey,
  type ShowTitleCounts,
} from '../../../../backend/lib/show-award-ranking'

function RankMark({ rank }: { rank: number }) {
  const top =
    rank === 1
      ? 'bg-camel-200 text-camel-900 ring-2 ring-camel-400 dark:bg-camel-800 dark:text-camel-100 dark:ring-camel-500'
      : rank === 2
        ? 'bg-old-money-200 text-charcoal-800 ring-1 ring-old-money-400 dark:bg-charcoal-600 dark:text-charcoal-100'
        : rank === 3
          ? 'bg-terra-100 text-terra-900 ring-1 ring-terra-300 dark:bg-terra-950/50 dark:text-terra-200'
          : 'bg-cream-100 text-charcoal-600 dark:bg-charcoal-700 dark:text-charcoal-300'

  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums ${top}`}
      aria-label={`Место ${rank}`}
    >
      {rank}
    </div>
  )
}

function ShowAwardChip({ abbr, count }: { abbr: ShowAwardKey; count: number }) {
  const label = SHOW_AWARD_LABELS[abbr]
  return (
    <HoverTooltip label={label} placement="top">
      <span
        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-sm font-semibold tabular-nums ${titleBadgeClass(abbr)}`}
        tabIndex={0}
      >
        {abbr}
        <span className="text-[11px] font-bold opacity-80">×{count}</span>
      </span>
    </HoverTooltip>
  )
}

export interface ShowDogCardData {
  id: string
  name_lat: string
  name_ru: string
  breed: string
  breed_group?: string
  sex: string
  total_shows: number
  best_placement?: number
  best_award?: string | null
  rank_score?: number
  titles: ShowTitleCounts
}

interface ShowDogCardProps {
  dog: ShowDogCardData
  rank: number
}

export default function ShowDogCard({ dog, rank }: ShowDogCardProps) {
  const bestKey = (dog.best_award as ShowAwardKey | null) ?? null
  const bestLabel = bestKey ? SHOW_AWARD_LABELS[bestKey] : null
  const activeAwards = SHOW_AWARD_ORDER.filter((key) => dog.titles[key] > 0)

  return (
    <Link to={`/dog/${dog.id}?tab=shows`} className="block">
      <article className="flex gap-3 rounded-xl border border-cream-200 bg-white p-3 shadow-sm transition-all hover:shadow-md hover:border-camel-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:hover:border-camel-600 sm:gap-4 sm:p-4">
        <RankMark rank={rank} />

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
          <div className="min-w-0">
            <h3
              className="line-clamp-2 text-sm font-bold leading-snug text-charcoal-900 dark:text-charcoal-100 sm:text-base"
              title={dog.name_lat}
            >
              {dog.name_lat}
            </h3>
            {dog.name_ru && (
              <p className="truncate text-xs text-charcoal-500 dark:text-charcoal-400 sm:text-sm">{dog.name_ru}</p>
            )}
            <span className="mt-1 inline-block max-w-full truncate rounded-md bg-cream-100 px-1.5 py-0.5 text-[10px] font-medium text-charcoal-600 dark:bg-charcoal-700 dark:text-charcoal-300">
              {dog.breed}
            </span>
          </div>

          <p className="text-[11px] leading-snug text-charcoal-500 dark:text-charcoal-400">
            <span className="font-semibold tabular-nums text-charcoal-700 dark:text-charcoal-300">{dog.total_shows}</span>{' '}
            {dog.total_shows === 1 ? 'выставка' : dog.total_shows < 5 ? 'выставки' : 'выставок'}
            {bestLabel && (
              <>
                {' '}
                · лучшая:{' '}
                <span className="font-semibold text-camel-700 dark:text-camel-400">{dog.best_award}</span>
              </>
            )}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-center gap-1.5">
          <div className="flex max-w-[11rem] flex-wrap justify-end gap-1.5 sm:max-w-none">
            {activeAwards.length > 0 ? (
              activeAwards.map((key) => <ShowAwardChip key={key} abbr={key} count={dog.titles[key]} />)
            ) : (
              <span className="text-xs text-charcoal-400 dark:text-charcoal-500">—</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
