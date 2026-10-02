import { Link } from 'react-router-dom'
import { formatJudgeDisplayName, getJudgeInitials, getSportJudgeStrictnessBadge } from '../lib/judgeUiUtils'

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

function StatPill({
  label,
  value,
  highlightClass,
}: {
  label: string
  value: string | number
  highlightClass?: string
}) {
  return (
    <div className="min-w-[4.25rem] rounded-lg bg-cream-100/80 px-2.5 py-1.5 text-center">
      <p className="mb-0.5 text-[9px] uppercase tracking-wide text-charcoal-500">
        {label}
      </p>
      <p className={`text-sm font-bold tabular-nums ${highlightClass || 'text-camel-700'}`}>
        {value}
      </p>
    </div>
  )
}

export default function JudgeCard({ judge }: JudgeCardProps) {
  const displayName = formatJudgeDisplayName(judge.name)
  const initials = getJudgeInitials(displayName)
  const strictness = getSportJudgeStrictnessBadge(
    judge.avg_score,
    judge.total_evaluations_count,
  )
  const score100 =
    judge.avg_score != null && !Number.isNaN(judge.avg_score)
      ? `${(judge.avg_score * 5).toFixed(1)} б.`
      : '—'

  return (
    <Link
      to={`/judges/${encodeURIComponent(judge.id)}`}
      className="group flex flex-col gap-3 rounded-xl border border-old-money-200/90 bg-white p-3.5 sm:p-4 transition-all duration-200 hover:border-camel-300 hover:bg-cream-50/70 hover:shadow-xs sm:flex-row sm:items-center sm:gap-4"
    >
      {/* Monogram avatar (Desktop) */}
      <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-old-money-200/80 bg-gradient-to-br from-cream-100 via-cream-50 to-amber-50/40 text-sm font-bold tracking-tight text-camel-800 shadow-2xs group-hover:border-camel-400 group-hover:scale-102 transition-transform">
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Mobile monogram inline */}
          <span className="sm:hidden flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-old-money-200/80 bg-cream-100 text-xs font-bold text-camel-800">
            {initials}
          </span>
          <h3 className="line-clamp-2 break-words text-base font-bold leading-snug text-charcoal-900 group-hover:text-camel-800 transition-colors sm:text-sm">
            {displayName}
          </h3>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-tight ${strictness.badgeClass}`}
            title={strictness.detail}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${strictness.dotClass}`} />
            {strictness.label}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-charcoal-500">
          <span>{judge.unique_events || 0} соревнований</span>
          <span>·</span>
          <span>{judge.unique_breeds || 0} пород</span>
          {typeof judge.unique_dogs === 'number' && (
            <>
              <span>·</span>
              <span>{judge.unique_dogs} собак</span>
            </>
          )}
        </div>
      </div>

      {/* Mobile stats grid */}
      <div className="grid grid-cols-4 gap-1.5 sm:hidden w-full border-t border-old-money-100 pt-2.5">
        <div className="rounded-lg bg-cream-100/80 py-1 px-0.5 text-center">
          <p className="text-[9px] uppercase tracking-wider text-charcoal-500 truncate">Забегов</p>
          <p className="text-xs font-bold tabular-nums text-camel-700">{judge.total_evaluations_count || 0}</p>
        </div>
        <div className="rounded-lg bg-cream-100/80 py-1 px-0.5 text-center">
          <p className="text-[9px] uppercase tracking-wider text-charcoal-500 truncate">Турниров</p>
          <p className="text-xs font-bold tabular-nums text-camel-700">{judge.unique_events || 0}</p>
        </div>
        <div className="rounded-lg bg-cream-100/80 py-1 px-0.5 text-center">
          <p className="text-[9px] uppercase tracking-wider text-charcoal-500 truncate">Пород</p>
          <p className="text-xs font-bold tabular-nums text-camel-700">{judge.unique_breeds || 0}</p>
        </div>
        <div className="rounded-lg bg-cream-100/80 py-1 px-0.5 text-center">
          <p className="text-[9px] uppercase tracking-wider text-charcoal-500 truncate">Ср. балл</p>
          <p className={`text-xs font-bold tabular-nums ${strictness.textClass}`}>{score100}</p>
        </div>
      </div>

      {/* Desktop pills (>= sm) */}
      <div className="hidden sm:flex shrink-0 items-center gap-2 sm:gap-2.5">
        <StatPill label="Забегов" value={judge.total_evaluations_count || 0} />
        <StatPill label="Турниров" value={judge.unique_events || 0} />
        <StatPill label="Пород" value={judge.unique_breeds || 0} />
        {typeof judge.unique_dogs === 'number' && (
          <StatPill label="Собак" value={judge.unique_dogs} />
        )}
        <StatPill
          label="Ср. балл"
          value={score100}
          highlightClass={strictness.textClass}
        />
      </div>
    </Link>
  )
}
