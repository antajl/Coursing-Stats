import type { GradeScope } from '../../../../components/ShowJudgeCard'
import type { StrictnessBadge } from '../../../../lib/judgeUiUtils'
import type { StrictnessVerdict } from '../judgeDetailAggregates'
import type { PeriodStrictness } from './constants'

interface JudgeStrictnessBarProps {
  gradeScope: GradeScope
  periodStrictness: PeriodStrictness
  periodPuppyStrictness: { puppyGraded: number; puppyRate: number | null }
  puppyStrictnessBadge: StrictnessBadge
  strictnessBadge: StrictnessBadge
  puppyPct: string | null
  puppyVerdictHint: string | null
  excellentPct: string | null
  sitePct: string | null
  strictnessVerdict: StrictnessVerdict | null
  judgePctNumber: number | null
  sitePctNumber: number | null
}

export function JudgeStrictnessBar({
  gradeScope,
  periodStrictness,
  periodPuppyStrictness,
  puppyStrictnessBadge,
  strictnessBadge,
  puppyPct,
  puppyVerdictHint,
  excellentPct,
  sitePct,
  strictnessVerdict,
  judgePctNumber,
  sitePctNumber,
}: JudgeStrictnessBarProps) {
  if (periodStrictness.graded <= 0) return null

  return (
    <div className="mt-3.5 sm:mt-4">
      {gradeScope === 'puppy' ? (
        /* Puppy strictness calibration */
        periodPuppyStrictness.puppyGraded < 15 ? (
          <p className="text-center text-sm text-charcoal-500 py-2">
            Мало данных по щенкам (нужно от 15 оценок, сейчас {periodPuppyStrictness.puppyGraded})
          </p>
        ) : (
          <div className="w-full">
            <div className="rounded-xl border border-old-money-200/80 bg-cream-50/40 p-3 sm:p-3.5">
              <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-1 text-xs text-charcoal-600 mb-2">
                <div className="flex items-center justify-between md:justify-start gap-1.5 font-semibold shrink-0">
                  <span className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${puppyStrictnessBadge.dotClass}`} />
                    Эксперт: <strong className="text-charcoal-900">{puppyPct}</strong>
                  </span>
                  <span className="md:hidden text-charcoal-500 font-medium">
                    РКФ: <strong className="text-charcoal-800">94.0%</strong>
                  </span>
                </div>

                {puppyVerdictHint && (
                  <span className="text-[11px] md:text-xs text-charcoal-500 font-normal text-center truncate">
                    {puppyVerdictHint}
                  </span>
                )}

                <span className="hidden md:inline-block text-charcoal-500 font-semibold shrink-0 text-right">
                  В среднем по РКФ: <strong className="text-charcoal-800">94.0%</strong>
                </span>
              </div>

              <div className="relative h-2.5 overflow-hidden rounded-full bg-cream-200 border border-old-money-200/50">
                <div className="absolute inset-0 flex">
                  <div className="w-[90%] bg-rose-100/50 border-r border-rose-200/50" title="Строгий к щенкам (<90%)" />
                  <div className="w-[5%] bg-amber-100/50 border-r border-amber-200/50" title="Умеренный к щенкам (90-95%)" />
                  <div className="w-[5%] bg-emerald-100/50" title="Лояльный к щенкам (≥95%)" />
                </div>

                {periodPuppyStrictness.puppyRate != null && (
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 opacity-80 ${
                      periodPuppyStrictness.puppyRate >= 0.95
                        ? 'bg-emerald-500'
                        : periodPuppyStrictness.puppyRate >= 0.9
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, periodPuppyStrictness.puppyRate * 100))}%` }}
                  />
                )}

                <div
                  className="absolute top-0 bottom-0 w-1 rounded-full bg-charcoal-900 shadow-sm"
                  style={{ left: '94%' }}
                  title="Среднее по РКФ для щенков: 94%"
                />
              </div>

              <div className="mt-1.5 flex justify-between text-[11px] font-medium text-charcoal-500">
                <span className="text-rose-700">Строгий &lt;90%</span>
                <span className="text-amber-700">Умеренный 90–95%</span>
                <span className="text-emerald-700">Лояльный ≥95%</span>
              </div>
            </div>
          </div>
        )
      ) : (
        /* Adult CAC strictness calibration */
        periodStrictness.graded < 30 ? (
          <p className="text-center text-sm text-charcoal-500 py-2">
            Мало данных для шкалы строгости (нужно от 30 оценок, сейчас {periodStrictness.graded})
          </p>
        ) : (
          <div className="w-full">
            <div className="rounded-xl border border-old-money-200/80 bg-cream-50/40 p-3 sm:p-3.5">
              <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-1 text-xs text-charcoal-600 mb-2">
                <div className="flex items-center justify-between md:justify-start gap-1.5 font-semibold shrink-0">
                  <span className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${strictnessBadge.dotClass}`} />
                    Эксперт: <strong className="text-charcoal-900">{excellentPct}</strong>
                  </span>
                  {sitePct && (
                    <span className="md:hidden text-charcoal-500 font-medium">
                      РКФ: <strong className="text-charcoal-800">{sitePct}</strong>
                    </span>
                  )}
                </div>

                {strictnessVerdict?.hint && (
                  <span className="text-[11px] md:text-xs text-charcoal-500 font-normal text-center truncate">
                    {strictnessVerdict.hint}
                  </span>
                )}

                {sitePct && (
                  <span className="hidden md:inline-block text-charcoal-500 font-semibold shrink-0 text-right">
                    В среднем по РКФ: <strong className="text-charcoal-800">{sitePct}</strong>
                  </span>
                )}
              </div>

              {/* Multi-zone progress bar */}
              <div className="relative h-2.5 overflow-hidden rounded-full bg-cream-200 border border-old-money-200/50">
                <div className="absolute inset-0 flex">
                  <div className="w-[88%] bg-rose-100/50 border-r border-rose-200/50" title="Зона высокой строгости (<88%)" />
                  <div className="w-[8%] bg-amber-100/50 border-r border-amber-200/50" title="Умеренная зона (88-95%)" />
                  <div className="w-[4%] bg-emerald-100/50" title="Лояльная зона (≥96%)" />
                </div>

                {judgePctNumber != null && (
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 opacity-80 ${
                      judgePctNumber >= 96
                        ? 'bg-emerald-500'
                        : judgePctNumber >= 88
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, judgePctNumber))}%` }}
                  />
                )}

                {sitePctNumber != null && (
                  <div
                    className="absolute top-0 bottom-0 w-1 rounded-full bg-charcoal-900 shadow-sm"
                    style={{ left: `${Math.min(100, Math.max(0, sitePctNumber))}%` }}
                    title={`Среднее по сайту: ${sitePct}`}
                  />
                )}
              </div>

              <div className="mt-1.5 flex justify-between text-[11px] font-medium text-charcoal-500">
                <span className="text-rose-700">Строгий &lt;88%</span>
                <span className="text-amber-700">Умеренный 88–95%</span>
                <span className="text-emerald-700">Лояльный ≥96%</span>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  )
}
