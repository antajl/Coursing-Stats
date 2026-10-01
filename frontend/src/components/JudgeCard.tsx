import { Link } from 'react-router-dom'

export interface JudgeCardData {
  id: string
  name: string
  total_evaluations_count?: number
  unique_events?: number
  unique_dogs?: number
  avg_score?: number | null
  unique_breeds?: number
  unique_disciplines?: number
}

interface JudgeCardProps {
  judge: JudgeCardData
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-[4.25rem] rounded-lg bg-cream-100 px-3 py-1.5 text-center">
      <p className="mb-0.5 text-[9px] uppercase tracking-wide text-charcoal-500">
        {label}
      </p>
      <p className="text-sm font-bold tabular-nums text-camel-700">{value}</p>
    </div>
  )
}

export default function JudgeCard({ judge }: JudgeCardProps) {
  const avgScore =
    judge.avg_score != null && !Number.isNaN(judge.avg_score) ? judge.avg_score.toFixed(2) : '—'

  return (
    <Link
      to={`/judges/${encodeURIComponent(judge.id)}`}
      className="group flex flex-col gap-2.5 rounded-xl border border-old-money-200 bg-white p-3.5 transition-all duration-200 hover:border-camel-300 hover:bg-cream-50 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4"
    >
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 break-words text-sm font-bold leading-snug text-charcoal-900 group-hover:text-camel-800 transition-colors">
          {judge.name}
        </h3>
      </div>

      {/* Mobile stats grid: 4 equal balanced columns */}
      <div className="grid grid-cols-4 gap-1.5 sm:hidden w-full border-t border-old-money-100 pt-2">
        <div className="rounded-lg bg-cream-100/80 py-1 px-0.5 text-center">
          <p className="text-[9px] uppercase tracking-wider text-charcoal-500 truncate">Оценок</p>
          <p className="text-xs font-bold tabular-nums text-camel-700">{judge.total_evaluations_count || 0}</p>
        </div>
        <div className="rounded-lg bg-cream-100/80 py-1 px-0.5 text-center">
          <p className="text-[9px] uppercase tracking-wider text-charcoal-500 truncate">Событий</p>
          <p className="text-xs font-bold tabular-nums text-camel-700">{judge.unique_events || 0}</p>
        </div>
        <div className="rounded-lg bg-cream-100/80 py-1 px-0.5 text-center">
          <p className="text-[9px] uppercase tracking-wider text-charcoal-500 truncate">Собак</p>
          <p className="text-xs font-bold tabular-nums text-camel-700">{judge.unique_dogs ?? '—'}</p>
        </div>
        <div className="rounded-lg bg-cream-100/80 py-1 px-0.5 text-center">
          <p className="text-[9px] uppercase tracking-wider text-charcoal-500 truncate">Ср. балл</p>
          <p className="text-xs font-bold tabular-nums text-camel-700">{avgScore}</p>
        </div>
      </div>

      {/* Desktop pills (>= sm) */}
      <div className="hidden sm:flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
        <StatPill label="Оценок" value={judge.total_evaluations_count || 0} />
        <StatPill label="Соревнований" value={judge.unique_events || 0} />
        {typeof judge.unique_dogs === 'number' ? (
          <StatPill label="Собак" value={judge.unique_dogs} />
        ) : null}
        <StatPill label="Средняя" value={avgScore} />
        <StatPill label="Пород" value={judge.unique_breeds || 0} />
      </div>
    </Link>
  )
}
