import {
  GRADE_TILES,
  type GradeFilterKey,
  type StrictnessVerdict,
} from './judgeDetailAggregates'

type PeriodStrictness = {
  graded: number
  excellent_rate: number | null
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
}) {
  return (
    <div className="min-w-0 rounded-xl border border-old-money-200/80 bg-white p-5 dark:border-charcoal-600 dark:bg-charcoal-800/50 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="min-w-0 text-2xl font-bold tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-3xl">
          {judgeName}
        </h1>
        <select
          id="judge-year"
          aria-label="Период"
          value={yearParam}
          onChange={(e) => onYearChange(e.target.value)}
          className="h-10 rounded-lg border border-old-money-200 bg-white px-3 text-sm text-charcoal-800 focus:border-camel-500 focus:outline-none focus:ring-2 focus:ring-camel-100 dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-200 dark:focus:ring-camel-900"
        >
          <option value="">Все года</option>
          {availableYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 border-t border-old-money-100 pt-5 text-center dark:border-charcoal-600 sm:gap-8">
        <button type="button" onClick={onSelectExhibitions} className="transition-opacity hover:opacity-80">
          <p className="text-3xl font-bold tabular-nums tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-4xl">
            {periodExhibitionCount}
          </p>
          <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">выставок</p>
        </button>
        <button type="button" onClick={onSelectBreeds} className="transition-opacity hover:opacity-80">
          <p className="text-3xl font-bold tabular-nums tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-4xl">
            {periodBreedCount}
          </p>
          <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">пород</p>
        </button>
        <div>
          <p className="text-3xl font-bold tabular-nums tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-4xl">
            {periodStrictness.excellent_rate != null
              ? `${(periodStrictness.excellent_rate * 100).toFixed(0)}%`
              : '—'}
          </p>
          <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">отлично</p>
        </div>
      </div>

      {hasGrades && (
        <div className="mt-6 border-t border-old-money-100 pt-5 dark:border-charcoal-600">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {GRADE_TILES.map(({ key, label }) => {
              const count = periodGrades[key] || 0
              const active = gradeFilter === key
              const disabled = count === 0
              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  aria-pressed={active}
                  title={disabled ? undefined : `Фильтр выставок: ${label}`}
                  onClick={() => onToggleGrade(key)}
                  className={`flex h-[4.25rem] w-full flex-col items-center justify-center rounded-xl border px-2 transition-colors ${
                    active
                      ? 'border-camel-500 bg-camel-50 dark:border-camel-500 dark:bg-camel-950/50'
                      : disabled
                        ? 'cursor-not-allowed border-transparent bg-old-money-50/70 opacity-40 dark:bg-charcoal-900/40'
                        : 'border-old-money-200 bg-white hover:border-camel-400 hover:bg-camel-50/40 dark:border-charcoal-600 dark:bg-charcoal-800 dark:hover:border-camel-600'
                  }`}
                >
                  <span className="text-[11px] uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
                    {label}
                  </span>
                  <span className="mt-0.5 text-base font-bold tabular-nums text-charcoal-800 dark:text-charcoal-100">
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {periodStrictness.graded > 0 && (
        <div className="mt-6 border-t border-old-money-100 pt-5 dark:border-charcoal-600">
          {periodStrictness.graded < 30 ? (
            <p className="text-center text-sm text-charcoal-500 dark:text-charcoal-400">
              Мало данных для сравнения ({periodStrictness.graded} оценок)
            </p>
          ) : (
            <div className="mx-auto max-w-3xl space-y-4">
              {baselineExcellentRate != null && periodStrictness.excellent_rate != null && (
                <div className="rounded-xl border border-old-money-200 bg-old-money-50/40 px-4 py-3 dark:border-charcoal-600 dark:bg-charcoal-900/30">
                  <div className="mb-2 flex items-end justify-between gap-3 text-xs text-charcoal-500 dark:text-charcoal-400">
                    <span>
                      Судья{' '}
                      <span className="font-semibold tabular-nums text-charcoal-800 dark:text-charcoal-100">
                        {excellentPct}
                      </span>
                    </span>
                    <span>
                      Сайт{' '}
                      <span className="font-semibold tabular-nums text-charcoal-800 dark:text-charcoal-100">
                        {sitePct}
                      </span>
                    </span>
                  </div>
                  <div className="relative h-3 overflow-hidden rounded-full bg-cream-200 dark:bg-charcoal-700">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-camel-500/80 dark:bg-camel-600/80"
                      style={{
                        width: `${Math.min(100, Math.max(0, periodStrictness.excellent_rate * 100))}%`,
                      }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-charcoal-800 dark:bg-charcoal-100"
                      style={{
                        left: `${Math.min(100, Math.max(0, baselineExcellentRate * 100))}%`,
                      }}
                      title={`Среднее по сайту ${sitePct}`}
                    />
                  </div>
                  <p className="mt-2 text-center text-xs text-charcoal-500 dark:text-charcoal-400">
                    {strictnessVerdict?.hint ??
                      'Полоса — доля «отлично» у судьи; черта — среднее по сайту'}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="flex h-[4.25rem] flex-col items-center justify-center rounded-xl border border-old-money-200 bg-old-money-50/40 dark:border-charcoal-600 dark:bg-charcoal-900/30">
                  <span className="text-[11px] uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
                    % отлично
                  </span>
                  <span className="mt-0.5 text-base font-bold tabular-nums text-charcoal-800 dark:text-charcoal-100">
                    {excellentPct ?? '—'}
                  </span>
                </div>
                <div className="flex h-[4.25rem] flex-col items-center justify-center rounded-xl border border-old-money-200 bg-old-money-50/40 dark:border-charcoal-600 dark:bg-charcoal-900/30">
                  <span className="text-[11px] uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
                    Среднее
                  </span>
                  <span
                    className="mt-0.5 text-base font-bold tabular-nums text-charcoal-800 dark:text-charcoal-100"
                    title="Средний % «отлично» по всем судьям на сайте"
                  >
                    {sitePct ?? '—'}
                  </span>
                </div>
                <div className="flex h-[4.25rem] flex-col items-center justify-center rounded-xl border border-old-money-200 bg-old-money-50/40 dark:border-charcoal-600 dark:bg-charcoal-900/30">
                  <span className="text-[11px] uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
                    Разница
                  </span>
                  <span
                    className={`mt-0.5 text-sm font-bold ${
                      strictnessVerdict?.tone === 'soft'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : strictnessVerdict?.tone === 'strict'
                          ? 'text-rose-700 dark:text-rose-400'
                          : 'text-charcoal-800 dark:text-charcoal-100'
                    }`}
                    title={strictnessVerdict?.hint}
                  >
                    {strictnessVerdict?.label ?? '—'}
                  </span>
                </div>
                <div className="flex h-[4.25rem] flex-col items-center justify-center rounded-xl border border-old-money-200 bg-old-money-50/40 dark:border-charcoal-600 dark:bg-charcoal-900/30">
                  <span className="text-[11px] uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
                    Оценок
                  </span>
                  <span
                    className="mt-0.5 text-base font-bold tabular-nums text-charcoal-800 dark:text-charcoal-100"
                    title="Всего записей с оценкой в протоколах (неявки не считаются)"
                  >
                    {periodStrictness.graded}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {yearParam && !hasPerExhibitionGrades && hasGrades && (
        <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">
          Для фильтра оценок по году нужна пересборка индексов (`build-show-indexes`).
        </p>
      )}
    </div>
  )
}
