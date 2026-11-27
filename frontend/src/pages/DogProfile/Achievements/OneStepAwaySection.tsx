import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Clock, ChevronDown, ArrowUpRight } from 'lucide-react'
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
    <div className="rounded-2xl border border-amber-200/80 bg-cream-50/45 overflow-hidden shadow-2xs">
      <div className="px-4 py-3 sm:px-5 border-b border-amber-200/70 bg-amber-50/60 flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-bold text-amber-950">
          В шаге от титула
        </h2>
        <span className="rounded-full bg-amber-200/70 text-amber-900 text-xs font-bold px-2.5 py-0.5 tabular-nums">
          {inProgressTitles.length}
        </span>
      </div>

      <div className="p-2.5 sm:p-3.5 space-y-3">
        {inProgressTitles.map((title) => {
          const isExpanded = Boolean(expandedTitles[title.id])
          const chipClass = titleBadgeClass(title.badge)
          const roundedPercent = Math.round(title.progressPercent)

          return (
            <div
              key={title.id}
              className={`rounded-xl border bg-white overflow-hidden transition-colors ${
                isExpanded
                  ? 'border-camel-400/90 shadow-xs'
                  : 'border-old-money-300/80 hover:border-camel-300'
              }`}
            >
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
                className="min-h-[44px] px-3.5 py-2.5 sm:px-4 flex items-center justify-between gap-2.5 cursor-pointer select-none hover:bg-cream-50/70 transition-colors"
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
                        className={`h-full rounded-full transition-[width] duration-300 ${
                          roundedPercent >= 75 ? 'bg-forest-600' : 'bg-amber-600'
                        }`}
                        style={{ width: `${roundedPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-amber-900 tabular-nums leading-none min-w-[28px] text-right">
                      {roundedPercent}%
                    </span>
                  </div>
                </div>

                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180 text-camel-800' : 'text-charcoal-500'
                  }`}
                  strokeWidth={1.75}
                  aria-hidden
                />
              </div>

              {isExpanded && (() => {
                const completedReqs = title.requirements.filter((r) => r.completed)
                const pendingReqs = title.requirements.filter((r) => !r.completed)
                const hasEvidence = Boolean(title.evidence && title.evidence.length > 0)
                const hasCredited = completedReqs.length > 0 || hasEvidence
                const hasRemaining = Boolean(title.nextStepAdvice || pendingReqs.length > 0)

                const upcoming = upcomingByTitle[title.id]
                const matches = upcoming?.matches || []
                const showCalendarFirst = upcoming ? upcoming.calendarKind === 'show' : title.domain === 'show'
                const fallbackTo = showCalendarFirst ? '/shows/archive/' : '/tracker/?tab=competitions'
                const fallbackLabel = showCalendarFirst ? 'Календарь выставок' : 'Календарь состязаний'

                return (
                  <div className="border-t border-old-money-300/90 divide-y divide-old-money-300/85 animate-in fade-in duration-150">
                    {/* Верхний ряд: Как получить | Осталось получить */}
                    {(title.rulesSummary || hasRemaining) && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-old-money-300/85">
                        {title.rulesSummary && (
                          <div className={`px-4 py-3.5 sm:px-5 sm:py-4 bg-white ${!hasRemaining ? 'lg:col-span-2' : ''}`}>
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-charcoal-600 mb-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-charcoal-400 shrink-0" aria-hidden />
                              <span>Как получить</span>
                            </div>
                            <p className="text-xs text-charcoal-800 leading-relaxed">
                              {title.rulesSummary}
                            </p>
                          </div>
                        )}

                        {hasRemaining && (
                          <div className={`px-4 py-3.5 sm:px-5 sm:py-4 bg-amber-50/35 ${!title.rulesSummary ? 'lg:col-span-2' : ''}`}>
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-charcoal-700 mb-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" aria-hidden />
                              <span>Осталось получить</span>
                            </div>

                            {title.nextStepAdvice ? (
                              <div className="flex items-start gap-2 text-xs font-medium text-amber-950 leading-relaxed">
                                <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" strokeWidth={1.75} aria-hidden />
                                <div className="min-w-0">{title.nextStepAdvice}</div>
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                {pendingReqs.map((req, rIdx) => (
                                  <div key={rIdx} className="flex items-start gap-2 text-xs text-amber-950">
                                    <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" strokeWidth={1.75} aria-hidden />
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
                      </div>
                    )}

                    {/* Нижний ряд: Уже есть в зачёте | Ближайшие подходящие мероприятия */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-old-money-300/85">
                      {hasCredited && (
                        <div className="px-4 py-3.5 sm:px-5 sm:py-4 bg-white space-y-2.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-charcoal-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-forest-600 shrink-0" aria-hidden />
                            <span>Уже есть в зачёте</span>
                          </div>

                          {completedReqs.length > 0 && (
                            <div className="space-y-1.5">
                              {completedReqs.map((req, rIdx) => (
                                <div key={rIdx} className="flex items-start gap-2 text-xs text-charcoal-800">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 shrink-0 mt-0.5" strokeWidth={1.75} aria-hidden />
                                  <div className="min-w-0 flex flex-wrap items-baseline gap-x-1.5">
                                    <span className="font-medium text-charcoal-900">{req.text}</span>
                                    {req.details && (
                                      <span className="text-charcoal-500 text-[11px]">
                                        · {req.details}
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
                              hasHeaderDivider={false}
                              flat
                            />
                          )}
                        </div>
                      )}

                      <div className={`px-4 py-3.5 sm:px-5 sm:py-4 bg-white space-y-2.5 ${!hasCredited ? 'lg:col-span-2' : ''}`}>
                        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-charcoal-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-camel-600 shrink-0" aria-hidden />
                            <span>Ближайшие подходящие мероприятия</span>
                          </div>
                          <Link
                            to={fallbackTo}
                            className="relative inline-flex items-center gap-0.5 text-[11px] font-semibold text-camel-800 hover:text-camel-900 hover:underline shrink-0 before:absolute before:-inset-y-2 before:-inset-x-2"
                          >
                            <span>{fallbackLabel}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden />
                          </Link>
                        </div>

                        {matches.length > 0 ? (
                          <div className="divide-y divide-old-money-200/80 border-t border-old-money-200/80">
                            {matches.map((ev) => (
                              <Link
                                key={ev.id}
                                to={ev.to}
                                className="min-h-[40px] sm:min-h-[34px] flex items-center justify-between gap-2 py-1.5 text-xs hover:bg-cream-50/80 transition-colors"
                              >
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                  {ev.kindLabel && (
                                    <span className="inline-flex shrink-0 rounded bg-cream-100/80 border border-old-money-300/60 px-1.5 py-0.5 text-[10px] font-semibold text-charcoal-800 whitespace-nowrap leading-none max-w-[140px] truncate">
                                      {ev.kindLabel}
                                    </span>
                                  )}
                                  <span className="font-medium text-charcoal-900 truncate">
                                    {ev.title}
                                  </span>
                                  <ArrowUpRight className="w-3 h-3 shrink-0 text-camel-700" strokeWidth={1.75} aria-hidden />
                                </div>
                                {ev.dateLabel && (
                                  <span className="text-[11px] text-charcoal-600 tabular-nums shrink-0 leading-none">
                                    {ev.dateLabel}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-charcoal-600 leading-relaxed pt-1 border-t border-old-money-200/70">
                            Предстоящие мероприятия этого сезона обновляются в календаре автоматически.
                          </p>
                        )}
                      </div>
                    </div>
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
