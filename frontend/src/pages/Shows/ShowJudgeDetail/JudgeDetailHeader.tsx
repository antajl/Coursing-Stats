import { ChevronLeft, Award, Layers, Calendar, CheckCircle2 } from 'lucide-react'
import {
  GRADE_TILES,
  type GradeFilterKey,
  type StrictnessVerdict,
} from './judgeDetailAggregates'
import { formatJudgeDisplayName, getJudgeInitials, getStrictnessBadge } from '../../../lib/judgeUiUtils'

type PeriodStrictness = {
  graded: number
  excellent_rate: number | null
}

const DEFAULT_GRADE_ACCENT = {
  dot: 'bg-charcoal-400',
  border: 'border-charcoal-200/80',
  activeBorder: 'border-charcoal-600',
  activeBg: 'bg-cream-100',
}

const GRADE_ACCENTS: Record<
  string,
  { dot: string; border: string; activeBorder: string; activeBg: string }
> = {
  excellent: {
    dot: 'bg-emerald-500',
    border: 'border-emerald-200/80',
    activeBorder: 'border-emerald-600',
    activeBg: 'bg-emerald-50',
  },
  very_good: {
    dot: 'bg-sky-500',
    border: 'border-sky-200/80',
    activeBorder: 'border-sky-600',
    activeBg: 'bg-sky-50',
  },
  good: {
    dot: 'bg-amber-500',
    border: 'border-amber-200/80',
    activeBorder: 'border-amber-600',
    activeBg: 'bg-amber-50',
  },
  satisfactory: {
    dot: 'bg-orange-500',
    border: 'border-orange-200/80',
    activeBorder: 'border-orange-600',
    activeBg: 'bg-orange-50',
  },
  very_promising: {
    dot: 'bg-teal-500',
    border: 'border-teal-200/80',
    activeBorder: 'border-teal-600',
    activeBg: 'bg-teal-50',
  },
  promising: {
    dot: 'bg-cyan-500',
    border: 'border-cyan-200/80',
    activeBorder: 'border-cyan-600',
    activeBg: 'bg-cyan-50',
  },
  dq: {
    dot: 'bg-rose-500',
    border: 'border-rose-200/80',
    activeBorder: 'border-rose-600',
    activeBg: 'bg-rose-50',
  },
  without_evaluation: {
    dot: 'bg-charcoal-400',
    border: 'border-charcoal-200/80',
    activeBorder: 'border-charcoal-600',
    activeBg: 'bg-cream-100',
  },
  absent: {
    dot: 'bg-charcoal-300',
    border: 'border-charcoal-200/60',
    activeBorder: 'border-charcoal-500',
    activeBg: 'bg-cream-100',
  },
}

export function JudgeDetailHeader({
  judgeName,
  yearParam,
  availableYears,
  onYearChange,
  periodExhibitionCount,
  periodBreedCount,
  periodGrades,
  periodStrictness,
  gradeFilter,
  hasGrades,
  hasPerExhibitionGrades,
  excellentPct,
  sitePct,
  baselineExcellentRate,
  strictnessVerdict,
  onSelectExhibitions,
  onSelectBreeds,
  onToggleGrade,
  onBack,
}: {
  judgeName: string
  yearParam: string
  availableYears: string[]
  onYearChange: (year: string) => void
  periodExhibitionCount: number
  periodBreedCount: number
  periodGrades: Record<GradeFilterKey, number>
  periodStrictness: PeriodStrictness
  gradeFilter: GradeFilterKey | null
  hasGrades: boolean
  hasPerExhibitionGrades: boolean
  excellentPct: string | null
  sitePct: string | null
  baselineExcellentRate: number | null
  strictnessVerdict: StrictnessVerdict | null
  onSelectExhibitions: () => void
  onSelectBreeds: () => void
  onToggleGrade: (key: GradeFilterKey) => void
  onBack?: () => void
}) {
  const displayName = formatJudgeDisplayName(judgeName)
  const initials = getJudgeInitials(judgeName)
  const strictnessBadge = getStrictnessBadge(
    periodStrictness.excellent_rate,
    periodStrictness.graded,
  )

  const judgePctNumber =
    periodStrictness.excellent_rate != null
      ? periodStrictness.excellent_rate * 100
      : null
  const sitePctNumber =
    baselineExcellentRate != null ? baselineExcellentRate * 100 : null

  return (
    <div className="min-w-0 rounded-2xl border border-old-money-200/90 bg-white p-4 sm:p-6 md:p-8 shadow-xs">
      {/* Top Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          {/* Monogram Badge */}
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl border border-old-money-200/80 bg-gradient-to-br from-cream-100 via-cream-50 to-amber-50/50 text-xl font-bold tracking-tight text-camel-800 shadow-xs">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 rounded-md border border-camel-200/90 bg-cream-100/90 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-camel-800">
                <Award className="h-3 w-3 text-camel-600" />
                Судья РКФ / FCI
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight ${strictnessBadge.badgeClass}`}
                title={strictnessBadge.detail}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${strictnessBadge.dotClass}`} />
                {strictnessBadge.label}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-charcoal-900 sm:text-3xl line-clamp-2">
              {displayName}
            </h1>
          </div>
        </div>

        {/* Year Filter */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto pt-2 border-t border-old-money-100/70 sm:border-0 sm:pt-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 sm:hidden">
            Период:
          </span>
          <select
            id="judge-year"
            aria-label="Период"
            value={yearParam}
            onChange={(e) => onYearChange(e.target.value)}
            className="h-9 sm:h-10 rounded-xl border border-old-money-200 bg-white px-3 sm:px-3.5 text-xs sm:text-sm font-medium text-charcoal-800 shadow-2xs hover:border-camel-400 focus:border-camel-500 focus:outline-none focus:ring-2 focus:ring-camel-100 transition-colors"
          >
            <option value="">Все года (всё время)</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>
                Сезон {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary Key Statistics Cards (4 cards) */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onSelectExhibitions}
          className="group flex items-center justify-between rounded-xl border border-old-money-200/80 bg-cream-50/50 p-3.5 sm:p-4 text-left transition-all hover:border-camel-300 hover:bg-cream-100/70 hover:shadow-2xs"
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
          className="group flex items-center justify-between rounded-xl border border-old-money-200/80 bg-cream-50/50 p-3.5 sm:p-4 text-left transition-all hover:border-camel-300 hover:bg-cream-100/70 hover:shadow-2xs"
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

        <div className="flex items-center justify-between rounded-xl border border-old-money-200/80 bg-cream-50/50 p-3.5 sm:p-4 text-left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
              Всего оценок
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-bold tabular-nums text-charcoal-900">
              {periodStrictness.graded}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream-200/60 text-camel-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-old-money-200/80 bg-cream-50/50 p-3.5 sm:p-4 text-left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
              «Отлично»
            </p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <p className={`text-2xl sm:text-3xl font-bold tabular-nums ${strictnessBadge.textClass}`}>
                {excellentPct ? `${excellentPct}` : '—'}
              </p>
              {excellentPct && (
                <span className="text-[11px] font-medium text-charcoal-400">доля</span>
              )}
            </div>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <Award className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Interactive Grade Tiles */}
      {hasGrades && (
        <div className="mt-6 border-t border-old-money-100 pt-5">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {GRADE_TILES.map(({ key, label }) => {
              const count = periodGrades[key] || 0
              const active = gradeFilter === key
              const disabled = count === 0
              const accent = GRADE_ACCENTS[key] ?? DEFAULT_GRADE_ACCENT

              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  aria-pressed={active}
                  title={disabled ? undefined : `Фильтр выставок: ${label}`}
                  onClick={() => onToggleGrade(key)}
                  className={`flex h-[4.25rem] w-full flex-col items-center justify-center rounded-xl border px-2 transition-all ${
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
      )}

      {/* Visual Strictness Indicator Bar */}
      {periodStrictness.graded > 0 && (
        <div className="mt-6 border-t border-old-money-100 pt-5">
          {periodStrictness.graded < 30 ? (
            <p className="text-center text-sm text-charcoal-500 py-2">
              Мало данных для шкалы строгости (нужно от 30 оценок, сейчас {periodStrictness.graded})
            </p>
          ) : (
            <div className="w-full">
              <div className="rounded-xl border border-old-money-200/80 bg-cream-50/40 p-3 sm:p-3.5">
                <div className="flex items-center justify-between text-xs font-semibold text-charcoal-600 mb-2">
                  <span className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${strictnessBadge.dotClass}`} />
                    Эксперт: <strong className="text-charcoal-900">{excellentPct}</strong>
                  </span>
                  {sitePct && (
                    <span className="text-charcoal-500">
                      В среднем по РКФ: <strong className="text-charcoal-800">{sitePct}</strong>
                    </span>
                  )}
                </div>

                {/* Multi-zone progress bar */}
                <div className="relative h-2.5 overflow-hidden rounded-full bg-cream-200 border border-old-money-200/50">
                  {/* Visual zones background */}
                  <div className="absolute inset-0 flex">
                    <div className="w-[70%] bg-rose-100/50 border-r border-rose-200/50" title="Зона строгости (<70%)" />
                    <div className="w-[10%] bg-amber-100/50 border-r border-amber-200/50" title="Умеренная зона (70-80%)" />
                    <div className="w-[20%] bg-emerald-100/50" title="Лояльная зона (>80%)" />
                  </div>

                  {/* Judge's filled value */}
                  {judgePctNumber != null && (
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 opacity-80 ${
                        judgePctNumber >= 80
                          ? 'bg-emerald-500'
                          : judgePctNumber >= 70
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, judgePctNumber))}%` }}
                    />
                  )}

                  {/* Site baseline vertical tick */}
                  {sitePctNumber != null && (
                    <div
                      className="absolute top-0 bottom-0 w-1 rounded-full bg-charcoal-900 shadow-sm"
                      style={{ left: `${Math.min(100, Math.max(0, sitePctNumber))}%` }}
                      title={`Среднее по сайту: ${sitePct}`}
                    />
                  )}
                </div>

                <div className="mt-2 flex justify-between text-[11px] font-medium text-charcoal-500">
                  <span className="text-rose-700">Строгий &lt;70%</span>
                  <span className="text-amber-700">Умеренный 70–80%</span>
                  <span className="text-emerald-700">Лояльный &gt;80%</span>
                </div>

                <p className="mt-2.5 text-center text-xs text-charcoal-500">
                  {strictnessVerdict?.hint ??
                    'Полоса — доля «отлично» у судьи; темная черта — среднее по выставкам'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {yearParam && !hasPerExhibitionGrades && hasGrades && (
        <p className="mt-3 text-xs text-amber-700">
          Для фильтра оценок по году нужна пересборка индексов (`build-show-indexes`).
        </p>
      )}
    </div>
  )
}
