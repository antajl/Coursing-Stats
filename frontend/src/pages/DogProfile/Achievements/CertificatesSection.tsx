import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ExternalLink } from 'lucide-react'
import { localExhibitionPath } from '../../../lib/env'
import type { CumulativeEvaluationResult } from '../../../lib/cumulativeTitles'

export type TitleCertificates = NonNullable<CumulativeEvaluationResult['certificates']>

export interface CertificatesSectionProps {
  certs: TitleCertificates
  totalCertificates: number
  totalCac: number
  totalJcac?: number
  totalVcac?: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  events: any[]
  eventResultsUrls: Record<string | number, string>
}

export function CertificatesSection({
  certs,
  totalCertificates,
  totalCac,
  totalJcac = 0,
  totalVcac = 0,
  eventResultsUrls,
}: CertificatesSectionProps) {
  const [expandedTitles, setExpandedTitles] = useState<Record<string, boolean>>({})

  const toggleTitle = (id: string) => {
    setExpandedTitles((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const renderCertificateRow = (
    id: string,
    title: string,
    badgeText: string,
    subtitle: string,
    eventsList: Array<{ eventId?: number | string; exhibitionId?: number | string; title: string; date?: string }>,
    disciplineTheme: 'forest' | 'warm-blue' | 'camel',
    extraNote?: string,
  ) => {
    const isExpanded = Boolean(expandedTitles[id])
    const themeText =
      disciplineTheme === 'forest'
        ? 'text-forest-800'
        : disciplineTheme === 'warm-blue'
          ? 'text-warm-blue-800'
          : 'text-camel-800'

    return (
      <div key={id}>
        <button
          type="button"
          onClick={() => toggleTitle(id)}
          className={`w-full min-h-[48px] px-4 py-2.5 sm:px-5 flex items-center justify-between gap-2.5 text-left cursor-pointer select-none transition-colors touch-manipulation ${
            isExpanded ? 'bg-cream-100/70 hover:bg-cream-100' : 'hover:bg-cream-50/70'
          }`}
          aria-expanded={isExpanded}
        >
          <div className="min-w-0">
            <div className={`text-xs font-bold ${themeText}`}>
              {title}
            </div>
            <p className="text-xs text-charcoal-600 truncate mt-0.5">{subtitle}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs sm:text-sm font-bold text-charcoal-900 tabular-nums">
              {badgeText}
            </span>
            {eventsList.length > 0 && (
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180 text-charcoal-700' : 'text-charcoal-500'
                }`}
                strokeWidth={1.75}
                aria-hidden
              />
            )}
          </div>
        </button>

        {isExpanded && (extraNote || eventsList.length > 0) && (
          <div className="px-4 pb-3 pt-2 sm:px-5 border-t border-old-money-200/80 bg-cream-50/45 space-y-2 animate-in fade-in duration-150">
            {extraNote && (
              <div className="text-xs text-charcoal-600">{extraNote}</div>
            )}

            {eventsList.length > 0 && (
              <div className="divide-y divide-old-money-200/80 border-t border-old-money-200/80">
                {eventsList.map((ev, i) => {
                  const href =
                    ev.eventId && eventResultsUrls[ev.eventId]
                      ? eventResultsUrls[ev.eventId]
                      : ev.exhibitionId
                        ? `${localExhibitionPath}/${ev.exhibitionId}`
                        : undefined

                  return href ? (
                    <Link
                      key={i}
                      to={href}
                      className="min-h-[40px] sm:min-h-[34px] py-1.5 text-xs text-charcoal-800 hover:text-camel-800 flex items-center justify-between gap-2 transition-colors"
                      title="Открыть протокол"
                    >
                      <span className="inline-flex items-center gap-1.5 min-w-0 flex-1 font-medium">
                        <span className="truncate">{ev.title}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 text-camel-700" strokeWidth={1.75} aria-hidden />
                      </span>
                      {ev.date && (
                        <span className="text-[11px] text-charcoal-600 tabular-nums shrink-0">
                          {ev.date}
                        </span>
                      )}
                    </Link>
                  ) : (
                    <div
                      key={i}
                      className="min-h-[40px] sm:min-h-[34px] py-1.5 text-xs text-charcoal-700 flex items-center justify-between gap-2"
                    >
                      <span className="truncate">{ev.title}</span>
                      {ev.date && (
                        <span className="text-[11px] text-charcoal-600 tabular-nums shrink-0">
                          {ev.date}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-old-money-200/90 bg-white overflow-hidden shadow-2xs">
      <div className="px-4 py-3 sm:px-5 border-b border-old-money-200/80 bg-cream-50/50 flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-bold text-charcoal-900">
          Официальные сертификаты и квалификационные допуски
        </h2>
        {totalCertificates > 0 && (
          <span className="rounded-full bg-cream-200/80 text-charcoal-800 text-xs font-bold px-2.5 py-0.5 tabular-nums">
            {totalCertificates}
          </span>
        )}
      </div>

      <div className="divide-y divide-old-money-200/80">
        {renderCertificateRow(
          'cert-cacl-coursing',
          'CACL · Курсинг борзых',
          `${certs.caclEventsCoursing.length} серт.`,
          'Кандидат в чемпионы России (курсинг)',
          certs.caclEventsCoursing,
          'forest',
        )}

        {renderCertificateRow(
          'cert-cacl-racing',
          'CACL · Бега борзых',
          `${certs.caclEventsRacing.length} серт.`,
          'Кандидат в чемпионы России (рейсинг)',
          certs.caclEventsRacing,
          'warm-blue',
        )}

        {certs.cacilEvents.length > 0 &&
          renderCertificateRow(
            'cert-cacil',
            'CACIL · Международные состязания FCI',
            `${certs.cacilEvents.length} серт.`,
            'Кандидат в Интернациональные чемпионы (C.I.C.)',
            certs.cacilEvents,
            'forest',
          )}

        {((certs.caclBrEventsCoursing?.length ?? 0) > 0 || (certs.caclBrEventsRacing?.length ?? 0) > 0) &&
          renderCertificateRow(
            'cert-cacl-br',
            'CACLBr · Породный чемпион по РК',
            `${(certs.caclBrEventsCoursing?.length ?? 0) + (certs.caclBrEventsRacing?.length ?? 0)} серт.`,
            'Кандидат в Породные чемпионы по рабочим качествам (ПЧ РК)',
            [...(certs.caclBrEventsCoursing ?? []), ...(certs.caclBrEventsRacing ?? [])],
            'forest',
          )}

        {renderCertificateRow(
          'cert-cac-shows',
          'CAC · Выставки РКФ',
          `${totalCac} серт.`,
          certs.uniqueCacJudgesCount > 0
            ? `Кандидат в ЧР по красоте · ${certs.uniqueCacJudgesCount} выст.`
            : 'Кандидат в чемпионы России по красоте',
          certs.cacShowEvents,
          'camel',
          certs.uniqueCacJudgesCount > 0
            ? `Засчитано на ${certs.uniqueCacJudgesCount} выставках РКФ`
            : undefined,
        )}

        {totalJcac > 0 &&
          renderCertificateRow(
            'cert-jcac-shows',
            'JCAC · Юниоры (выставки РКФ)',
            `${totalJcac} серт.`,
            (certs.uniqueJcacJudgesCount ?? 0) > 0
              ? `Кандидат в Юные чемпионы России · ${certs.uniqueJcacJudgesCount} выст.`
              : 'Кандидат в Юные чемпионы России по красоте',
            certs.jcacShowEvents ?? [],
            'camel',
          )}

        {totalVcac > 0 &&
          renderCertificateRow(
            'cert-vcac-shows',
            'VCAC · Ветераны (выставки РКФ)',
            `${totalVcac} серт.`,
            (certs.uniqueVcacJudgesCount ?? 0) > 0
              ? `Кандидат в Ветераны-чемпионы России · ${certs.uniqueVcacJudgesCount} выст.`
              : 'Кандидат в Ветераны-чемпионы России по красоте',
            certs.vcacShowEvents ?? [],
            'camel',
          )}
      </div>
    </div>
  )
}
