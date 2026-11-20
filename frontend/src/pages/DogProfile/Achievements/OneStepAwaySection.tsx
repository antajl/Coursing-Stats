import { useState } from 'react'
import { CheckCircle2, Clock, ChevronDown } from 'lucide-react'
import { titleBadgeClass } from '../../../lib/qualificationTitles'
import type { InProgressTitle } from '../../../lib/cumulativeTitles'

export interface OneStepAwaySectionProps {
  inProgressTitles: InProgressTitle[]
}

export function OneStepAwaySection({ inProgressTitles }: OneStepAwaySectionProps) {
  const [expandedTitles, setExpandedTitles] = useState<Record<string, boolean>>({})

  const toggleTitle = (id: string) => {
    setExpandedTitles((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  if (inProgressTitles.length === 0) {
    return null
  }

  return (
    <div className="rounded-2xl border border-amber-200/80 bg-amber-50/30 overflow-hidden shadow-2xs">
      <div className="px-4 py-3 sm:px-5 sm:py-3 border-b border-amber-200/60 bg-amber-50/60 flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-bold text-amber-950">
          В шаге от титула
        </h2>
        <span className="rounded-full bg-amber-200/70 text-amber-900 text-xs font-bold px-2.5 py-0.5">
          {inProgressTitles.length}
        </span>
      </div>

      <div className="divide-y divide-amber-200/50 bg-white/70">
        {inProgressTitles.map((title) => {
          const isExpanded = Boolean(expandedTitles[title.id])
          const chipClass = titleBadgeClass(title.badge)
          const roundedPercent = Math.round(title.progressPercent)

          return (
            <div key={title.id} className="transition-colors">
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleTitle(title.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleTitle(title.id)
                  }
                }}
                className="px-3.5 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-2.5 cursor-pointer select-none hover:bg-amber-100/30 transition-colors"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`inline-flex shrink-0 items-center justify-center w-[92px] sm:w-[96px] rounded-lg px-2 py-0.5 text-xs font-bold tabular-nums text-center whitespace-nowrap tracking-tight ${chipClass}`}
                  >
                    {title.badge}
                  </span>
                  <h3 className="text-sm font-bold text-charcoal-900 leading-snug">
                    {title.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 sm:w-16 h-1.5 bg-amber-200/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          roundedPercent >= 75
                            ? 'bg-forest-600'
                            : 'bg-amber-600'
                        }`}
                        style={{ width: `${roundedPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-amber-900 tabular-nums min-w-[28px] text-right">
                      {roundedPercent}%
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-amber-800' : 'text-charcoal-400'
                    }`}
                    aria-hidden
                  />
                </div>
              </div>

              {isExpanded && (
                <div className="px-3.5 sm:px-4 pb-3.5 pt-1.5 border-t border-amber-200/40 space-y-2 bg-amber-50/40 animate-in fade-in duration-150">
                  {title.rulesSummary && (
                    <div className="text-xs text-charcoal-600 leading-relaxed">
                      <span className="font-semibold text-charcoal-800">Нормативное основание: </span>
                      <span>{title.rulesSummary}</span>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-1">
                    {title.requirements.map((req, rIdx) => (
                      <div
                        key={rIdx}
                        className="flex items-start gap-2.5 text-xs text-charcoal-700"
                      >
                        {req.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" aria-hidden />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className={req.completed ? 'font-medium text-charcoal-900' : 'text-charcoal-700'}>
                            {req.text}
                          </span>
                          {req.details && (
                            <span className="text-charcoal-500 text-[11px] block mt-0.5">
                              {req.details}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {title.nextStepAdvice && (
                    <div className="mt-2.5 rounded-xl bg-amber-100/70 border border-amber-300/80 p-2.5 text-xs text-amber-950">
                      <div>
                        <span className="font-semibold text-amber-900">Что осталось сделать: </span>
                        <span>{title.nextStepAdvice}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
