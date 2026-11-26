import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Clock, ChevronDown, Calendar, ArrowUpRight } from 'lucide-react'
import { titleBadgeClass } from '../../../lib/qualificationTitles'
import { TitleEvidenceList } from './TitleEvidenceList'
import { useUpcomingTitleEvents } from './useUpcomingTitleEvents'
import type { InProgressTitle } from '../../../lib/cumulativeTitles'

export interface OneStepAwaySectionProps {
  inProgressTitles: InProgressTitle[]
  eventResultsUrls?: Record<string | number, string>
  breed?: string
}

export function OneStepAwaySection({ inProgressTitles, eventResultsUrls = {}, breed }: OneStepAwaySectionProps) {
  const [expandedTitles, setExpandedTitles] = useState<Record<string, boolean>>({})
  const hasExpanded = Object.values(expandedTitles).some(Boolean)
  const upcomingByTitle = useUpcomingTitleEvents(hasExpanded, inProgressTitles, breed)

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
                <div className="min-w-0 flex-1 space-y-1 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`inline-flex shrink-0 items-center justify-center w-[84px] sm:w-[96px] rounded-lg px-2 py-0.5 text-xs font-bold tabular-nums text-center whitespace-nowrap tracking-tight ${chipClass}`}
                    >
                      {title.badge}
                    </span>
                    <h3 className="text-[13px] sm:text-sm font-bold text-charcoal-900 leading-tight sm:leading-snug">
                      {title.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 sm:shrink-0">
                    <div className="flex-1 sm:flex-none sm:w-16 h-1 sm:h-1.5 bg-amber-200/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          roundedPercent >= 75
                            ? 'bg-forest-600'
                            : 'bg-amber-600'
                        }`}
                        style={{ width: `${roundedPercent}%` }}
                      />
                    </div>
                    <span className="text-[10.5px] sm:text-xs font-bold text-amber-900 tabular-nums leading-none min-w-[26px] sm:min-w-[28px] text-right">
                      {roundedPercent}%
                    </span>
                  </div>
                </div>

                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180 text-amber-800' : 'text-charcoal-400'
                  }`}
                  aria-hidden
                />
              </div>

              {isExpanded && (() => {
                const completedReqs = title.requirements.filter((r) => r.completed)
                const pendingReqs = title.requirements.filter((r) => !r.completed)
                const hasEvidence = Boolean(title.evidence && title.evidence.length > 0)

                return (
                  <div className="px-3.5 sm:px-4 pb-3.5 pt-2.5 border-t border-amber-200/40 space-y-3 bg-amber-50/40 animate-in fade-in duration-150">
                    {/* 1. Как получить титул */}
                    {title.rulesSummary && (
                      <div className="rounded-xl border border-old-money-200/80 bg-white/80 px-3 py-2 text-xs text-charcoal-700 leading-relaxed">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 mb-0.5">
                          Как получить
                        </div>
                        <div>{title.rulesSummary}</div>
                      </div>
                    )}

                    {/* 2. Что уже есть в зачёте + история подходящих мероприятий */}
                    {(completedReqs.length > 0 || hasEvidence) && (
                      <div className="rounded-xl border border-forest-200/80 bg-forest-50/30 px-3 py-2.5 space-y-2">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-forest-800">
                          Уже есть в зачёте
                        </div>

                        {completedReqs.length > 0 && (
                          <div className="space-y-1.5">
                            {completedReqs.map((req, rIdx) => (
                              <div key={rIdx} className="flex items-start gap-2 text-xs text-charcoal-800">
                                <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" aria-hidden />
                                <div className="min-w-0">
                                  <span className="font-medium text-charcoal-900">{req.text}</span>
                                  {req.details && (
                                    <span className="text-charcoal-500 text-[11px] block mt-0.5">
                                      {req.details}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {hasEvidence && (
                          <TitleEvidenceList
                            heading="Мероприятия в зачёте"
                            items={title.evidence || []}
                            eventResultsUrls={eventResultsUrls}
                          />
                        )}
                      </div>
                    )}

                    {/* 3. Что осталось получить */}
                    {(title.nextStepAdvice || pendingReqs.length > 0) && (
                      <div className="rounded-xl border border-amber-300/80 bg-amber-100/60 px-3 py-2.5 space-y-2">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                          Осталось получить
                        </div>

                        {title.nextStepAdvice ? (
                          <div className="flex items-start gap-2 text-xs font-medium text-amber-950">
                            <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                            <div className="min-w-0">{title.nextStepAdvice}</div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {pendingReqs.map((req, rIdx) => (
                              <div key={rIdx} className="flex items-start gap-2 text-xs text-amber-950">
                                <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                                <div className="min-w-0">
                                  <span className="font-medium">{req.text}</span>
                                  {req.details && (
                                    <span className="text-amber-900/80 text-[11px] block mt-0.5">
                                      {req.details}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 4. Навигатор закрытия: ближайшие подходящие старты календаря */}
                    {(() => {
                      const matches = upcomingByTitle[title.id] || []
                      const fallbackTo =
                        title.domain === 'show'
                          ? '/shows/archive/'
                          : '/tracker/?tab=competitions'
                      const fallbackLabel =
                        title.domain === 'show'
                          ? 'Открыть календарь выставок РКФ'
                          : 'Открыть календарь состязаний РКФ'

                      return (
                        <div className="rounded-xl border border-old-money-200/80 bg-white/85 px-3 py-2 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
                              Ближайшие подходящие старты
                            </span>
                            <Link
                              to={fallbackTo}
                              className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-camel-700 hover:text-camel-900 hover:underline shrink-0"
                            >
                              <span>{fallbackLabel}</span>
                              <ArrowUpRight className="w-3 h-3" aria-hidden />
                            </Link>
                          </div>

                          {matches.length > 0 ? (
                            <div className="divide-y divide-old-money-100 rounded-lg border border-old-money-100 bg-cream-50/40">
                              {matches.map((ev) => (
                                <Link
                                  key={ev.id}
                                  to={ev.to}
                                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs hover:bg-camel-50/70 transition-colors"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Calendar className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
                                    <span className="font-medium text-charcoal-900 truncate">
                                      {ev.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0 text-[11px] text-charcoal-500 tabular-nums">
                                    {ev.kindLabel && (
                                      <span className="hidden sm:inline rounded bg-cream-100 px-1.5 py-0.5 text-[10px] font-medium text-charcoal-700">
                                        {ev.kindLabel}
                                      </span>
                                    )}
                                    <span>{ev.dateLabel}</span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-charcoal-500">
                              Предстоящие старты этого сезона обновляются в календаре автоматически.
                            </p>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )
              })()}
            </div>
          )
        })}
      </div>
    </div>
  )
}
