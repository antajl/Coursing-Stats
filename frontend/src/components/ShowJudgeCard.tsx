import { Link } from 'react-router-dom'
import { formatBreedSentenceCase } from '../lib/breedMapping'
import { getJudgeInitials, getStrictnessBadge } from '../lib/judgeUiUtils'

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

export default function ShowJudgeCard({ judge }: { judge: ShowJudgeCardData }) {
  const chips = (judge.breedChips || []).slice(0, 2)
  const extraBreeds = Math.max(0, judge.breedsCount - chips.length)
  const displayName = judge.display_name || judge.name
  const initials = getJudgeInitials(displayName)

  const excellentRateFraction = judge.excellentPct != null ? judge.excellentPct / 100 : null
  const strictness = getStrictnessBadge(excellentRateFraction, judge.graded)

  return (
    <Link
      to={`/shows/judges/${encodeURIComponent(judge.id)}`}
      className="group flex flex-col gap-3 rounded-xl border border-old-money-200/90 bg-white p-3.5 sm:p-4 transition-all duration-200 hover:border-camel-300 hover:bg-cream-50/70 hover:shadow-xs sm:flex-row sm:items-center sm:gap-4"
    >
      {/* Monogram avatar */}
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

        {chips.length > 0 && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {chips.map((breed) => (
              <span
                key={breed}
                className="max-w-[11rem] truncate rounded-md border border-old-money-200/70 bg-cream-50/80 px-1.5 py-0.5 text-[10px] font-medium text-charcoal-600"
              >
                {formatBreedSentenceCase(breed)}
              </span>
            ))}
            {extraBreeds > 0 && (
              <span className="text-[10px] tabular-nums text-charcoal-400">
                +{extraBreeds}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-2.5 self-end sm:self-auto">
        <StatPill label="Выставок" value={judge.exhibitionsCount} />
        <StatPill label="Пород" value={judge.breedsCount} />
        <StatPill
          label="Отлично"
          value={judge.excellentPct != null ? `${judge.excellentPct.toFixed(0)}%` : '—'}
          highlightClass={strictness.textClass}
        />
      </div>
    </Link>
  )
}
