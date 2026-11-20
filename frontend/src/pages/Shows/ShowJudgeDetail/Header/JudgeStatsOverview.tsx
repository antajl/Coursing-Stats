import { Calendar, Layers, CheckCircle2, Award } from 'lucide-react'
import type { GradeScope } from '../../../../components/ShowJudgeCard'
import type { StrictnessBadge } from '../../../../lib/judgeUiUtils'
import type { PeriodStrictness } from './constants'

interface JudgeStatsOverviewProps {
  periodExhibitionCount: number
  periodBreedCount: number
  gradeScope: GradeScope
  onGradeScopeChange: (scope: GradeScope) => void
  onSelectExhibitions: () => void
  onSelectBreeds: () => void
  excellentPct: string | null
  puppyPct: string | null
  strictnessBadge: StrictnessBadge
  puppyStrictnessBadge: StrictnessBadge
  periodStrictness: PeriodStrictness
  periodPuppyStrictness: { puppyGraded: number; puppyRate: number | null }
}

export function JudgeStatsOverview({
  periodExhibitionCount,
  periodBreedCount,
  gradeScope,
  onGradeScopeChange,
  onSelectExhibitions,
  onSelectBreeds,
  excellentPct,
  puppyPct,
  strictnessBadge,
  puppyStrictnessBadge,
  periodStrictness,
  periodPuppyStrictness,
}: JudgeStatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <button
        type="button"
        onClick={onSelectExhibitions}
        className="group flex items-center justify-between rounded-xl border border-old-money-200/80 bg-cream-50/50 p-3.5 sm:p-4 text-left transition-all hover:border-camel-300 hover:bg-cream-100/70 hover:shadow-2xs cursor-pointer"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
            Выставок
          </p>
          <p className="mt-1 text-2xl sm:text-3xl font-bold tabular-nums text-charcoal-900 group-hover:text-camel-800 transition-colors">
            {periodExhibitionCount}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream-200/60 text-camel-700 group-hover:bg-camel-200/60 transition-colors">
          <Calendar className="h-5 w-5" />
        </div>
      </button>

      <button
        type="button"
        onClick={onSelectBreeds}
        className="group flex items-center justify-between rounded-xl border border-old-money-200/80 bg-cream-50/50 p-3.5 sm:p-4 text-left transition-all hover:border-camel-300 hover:bg-cream-100/70 hover:shadow-2xs cursor-pointer"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
            Пород в экспертизе
          </p>
          <p className="mt-1 text-2xl sm:text-3xl font-bold tabular-nums text-charcoal-900 group-hover:text-camel-800 transition-colors">
            {periodBreedCount}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream-200/60 text-camel-700 group-hover:bg-camel-200/60 transition-colors">
          <Layers className="h-5 w-5" />
        </div>
      </button>

      {/* Card 3: Adult classes */}
      <button
        type="button"
        onClick={() => onGradeScopeChange(gradeScope === 'adult' ? 'all' : 'adult')}
        className={`group relative flex items-center justify-between rounded-xl border p-3.5 sm:p-4 text-left transition-all cursor-pointer ${
          gradeScope === 'adult'
            ? 'border-camel-500 bg-camel-50/80 shadow-xs ring-2 ring-camel-400/40 text-camel-950'
            : 'border-old-money-200/80 bg-cream-50/50 hover:border-camel-300 hover:bg-cream-100/70 hover:shadow-2xs'
        }`}
        title="Фильтровать по взрослым классам (CAC)"
      >
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-charcoal-600">
              Взрослые классы
            </p>
            {gradeScope === 'adult' && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-camel-600 text-white shadow-3xs leading-none">
                Выбрано
              </span>
            )}
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <p className={`text-2xl sm:text-3xl font-bold tabular-nums ${strictnessBadge.textClass}`}>
              {excellentPct ? `${excellentPct}` : '—'}
            </p>
            <span className="text-xs text-charcoal-400 font-normal">отлично</span>
          </div>
          <p className="mt-0.5 text-xs text-charcoal-500 font-medium">
            {periodStrictness.graded > 0 ? `${periodStrictness.graded.toLocaleString('ru-RU')} оценок` : 'Нет оценок'}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream-200/60 text-camel-700 group-hover:bg-camel-200/60 transition-colors">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      </button>

      {/* Card 4: Puppy & Baby classes */}
      <button
        type="button"
        onClick={() => onGradeScopeChange(gradeScope === 'puppy' ? 'all' : 'puppy')}
        className={`group relative flex items-center justify-between rounded-xl border p-3.5 sm:p-4 text-left transition-all cursor-pointer ${
          gradeScope === 'puppy'
            ? 'border-camel-500 bg-camel-50/80 shadow-xs ring-2 ring-camel-400/40 text-camel-950'
            : 'border-old-money-200/80 bg-cream-50/50 hover:border-camel-300 hover:bg-cream-100/70 hover:shadow-2xs'
        }`}
        title="Фильтровать по щенкам и бэби"
      >
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-charcoal-600">
              Щенки и бэби
            </p>
            {gradeScope === 'puppy' && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-camel-600 text-white shadow-3xs leading-none">
                Выбрано
              </span>
            )}
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <p className={`text-2xl sm:text-3xl font-bold tabular-nums ${puppyStrictnessBadge.textClass}`}>
              {puppyPct ? `${puppyPct}` : '—'}
            </p>
            <span className="text-xs text-charcoal-400 font-normal">оч. персп.</span>
          </div>
          <p className="mt-0.5 text-xs text-charcoal-500 font-medium">
            {periodPuppyStrictness.puppyGraded > 0 ? `${periodPuppyStrictness.puppyGraded.toLocaleString('ru-RU')} щенков` : 'Нет щенков'}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream-200/60 text-camel-700 group-hover:bg-camel-200/60 transition-colors">
          <Award className="h-5 w-5" />
        </div>
      </button>
    </div>
  )
}
