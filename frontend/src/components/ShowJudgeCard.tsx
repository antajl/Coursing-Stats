import { Link } from 'react-router-dom'

export interface ShowJudgeCardData {
  id: string
  name: string
  exhibitionsCount: number
  breedsCount: number
  /** 0–100, null если мало/нет данных */
  excellentPct: number | null
  graded?: number
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-[4.5rem] rounded-lg bg-cream-100 px-3 py-2 text-center dark:bg-charcoal-700">
      <p className="mb-0.5 text-[9px] uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
        {label}
      </p>
      <p className="text-sm font-bold tabular-nums text-camel-700 dark:text-camel-400">{value}</p>
    </div>
  )
}

export default function ShowJudgeCard({ judge }: { judge: ShowJudgeCardData }) {
  return (
    <Link
      to={`/shows/judges/${encodeURIComponent(judge.id)}`}
      className="flex flex-col gap-3 rounded-xl border border-old-money-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-camel-300 hover:shadow-md dark:border-charcoal-600 dark:bg-charcoal-800 dark:hover:border-camel-700 sm:flex-row sm:items-center sm:gap-4"
    >
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 break-words text-base font-bold leading-snug text-charcoal-800 dark:text-charcoal-100 sm:text-sm">
          {judge.name}
        </h3>
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
