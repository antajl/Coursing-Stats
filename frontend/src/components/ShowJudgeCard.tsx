import { Link } from 'react-router-dom'
import { formatBreedSentenceCase } from '../lib/breedMapping'

export interface ShowJudgeCardData {
  id: string
  name: string
  display_name?: string
  exhibitionsCount: number
  breedsCount: number
  /** 0–100, null если мало/нет данных */
  excellentPct: number | null
  graded?: number
  /** До 2 пород для чипов; остальное — в breedsCount */
  breedChips?: string[]
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-[4.5rem] rounded-lg bg-cream-100 px-3 py-1.5 text-center dark:bg-charcoal-700">
      <p className="mb-0.5 text-[9px] uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
        {label}
      </p>
      <p className="text-sm font-bold tabular-nums text-camel-700 dark:text-camel-400">{value}</p>
    </div>
  )
}

export default function ShowJudgeCard({ judge }: { judge: ShowJudgeCardData }) {
  const chips = (judge.breedChips || []).slice(0, 2)
  const extraBreeds = Math.max(0, judge.breedsCount - chips.length)
  const displayName = judge.display_name || judge.name

  return (
    <Link
      to={`/shows/judges/${encodeURIComponent(judge.id)}`}
      className="flex flex-col gap-3 rounded-xl border border-old-money-200 bg-white p-4 transition-colors duration-200 hover:border-camel-300 hover:bg-cream-50 dark:border-charcoal-600 dark:bg-charcoal-800 dark:hover:border-camel-700 dark:hover:bg-charcoal-700/40 sm:flex-row sm:items-center sm:gap-4"
    >
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 break-words text-base font-bold leading-snug text-charcoal-800 dark:text-charcoal-100 sm:text-sm">
          {displayName}
        </h3>
        {chips.length > 0 && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {chips.map((breed) => (
              <span
                key={breed}
                className="max-w-[11rem] truncate rounded-md border border-old-money-200/80 bg-cream-50 px-1.5 py-0.5 text-[10px] font-medium text-charcoal-600 dark:border-charcoal-600 dark:bg-charcoal-900/50 dark:text-charcoal-300"
              >
                {formatBreedSentenceCase(breed)}
              </span>
            ))}
            {extraBreeds > 0 && (
              <span className="text-[10px] tabular-nums text-charcoal-400 dark:text-charcoal-500">
                +{extraBreeds}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
        <StatPill label="Выставок" value={judge.exhibitionsCount} />
        <StatPill label="Пород" value={judge.breedsCount} />
        <StatPill
          label="Отлично"
          value={judge.excellentPct != null ? `${judge.excellentPct.toFixed(0)}%` : '—'}
        />
      </div>
    </Link>
  )
}
