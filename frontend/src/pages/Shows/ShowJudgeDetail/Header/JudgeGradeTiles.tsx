import { GRADE_TILES, type GradeFilterKey } from '../judgeDetailAggregates'
import type { GradeScope } from '../../../../components/ShowJudgeCard'
import { GRADE_ACCENTS, DEFAULT_GRADE_ACCENT } from './constants'

interface JudgeGradeTilesProps {
  hasGrades: boolean
  periodGrades: Record<GradeFilterKey, number>
  gradeFilter: GradeFilterKey | null
  gradeScope: GradeScope
  onToggleGrade: (key: GradeFilterKey) => void
}

export function JudgeGradeTiles({
  hasGrades,
  periodGrades,
  gradeFilter,
  gradeScope,
  onToggleGrade,
}: JudgeGradeTilesProps) {
  if (!hasGrades) return null

  return (
    <div className="mt-3.5 sm:mt-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {GRADE_TILES.map(({ key, label }) => {
          const count = periodGrades[key] || 0
          const active = gradeFilter === key
          const disabled = count === 0
          const accent = GRADE_ACCENTS[key] ?? DEFAULT_GRADE_ACCENT

          const isPuppyGrade = key === 'very_promising' || key === 'promising'
          const isDimmed =
            (gradeScope === 'adult' && isPuppyGrade) ||
            (gradeScope === 'puppy' && !isPuppyGrade)

          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              title={disabled ? undefined : `Фильтр выставок: ${label}`}
              onClick={() => onToggleGrade(key)}
              className={`flex flex-col rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                isDimmed ? 'opacity-40 hover:opacity-80' : ''
              } ${
                active
                  ? `${accent.activeBorder} ${accent.activeBg} ring-2 ring-camel-300 shadow-2xs`
                  : disabled
                    ? 'cursor-not-allowed border-transparent bg-old-money-50/50 opacity-40'
                    : `border-old-money-200/80 bg-white hover:border-camel-300 hover:bg-cream-50/50`
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
                <span className="text-[11px] font-semibold uppercase tracking-tight text-charcoal-600">
                  {label}
                </span>
              </div>
              <span className="mt-0.5 text-base font-bold tabular-nums text-charcoal-900">
                {count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
