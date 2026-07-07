import { Link } from 'react-router-dom'

export interface JudgeCardData {
  id: string
  name: string
  total_evaluations_count?: number
  unique_events?: number
  avg_score?: number | null
  unique_breeds?: number
  unique_disciplines?: number
}

interface JudgeCardProps {
  judge: JudgeCardData
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-cream-100 px-3 py-2 text-center dark:bg-charcoal-700">
      <p className="mb-0.5 text-[9px] uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
        {label}
      </p>
      <p className="text-sm font-bold text-camel-700 dark:text-camel-400">{value}</p>
    </div>
  )
}

export default function JudgeCard({ judge }: JudgeCardProps) {
  const avgScore =
    judge.avg_score != null && !Number.isNaN(judge.avg_score) ? judge.avg_score.toFixed(2) : '—'

  return (
    <Link
      to={`/judges/${encodeURIComponent(judge.id)}`}
      className="flex flex-col gap-3 rounded-xl border border-old-money-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-camel-300 hover:shadow-md dark:border-charcoal-600 dark:bg-charcoal-800 dark:hover:border-camel-700 sm:flex-row sm:items-center sm:gap-4"
    >
      <div className="min-w-0 flex-1">
        <h3 className="break-words text-base font-bold leading-snug text-charcoal-800 line-clamp-2 dark:text-charcoal-100 sm:text-sm">
          {judge.name}
        </h3>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
        <StatPill label="Оцениваний" value={judge.total_evaluations_count || 0} />
        <StatPill label="Соревнований" value={judge.unique_events || 0} />
        <StatPill label="Средняя" value={avgScore} />
        <StatPill label="Пород" value={judge.unique_breeds || 0} />
        <StatPill label="Дисциплин" value={judge.unique_disciplines || 0} />
      </div>
    </Link>
  )
}
