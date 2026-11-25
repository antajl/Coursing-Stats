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

  const renderCertificateCard = (
    id: string,
    title: string,
    badgeText: string,
    subtitle: string,
    eventsList: Array<{ eventId?: number | string; exhibitionId?: number | string; title: string; date?: string }>,
    disciplineTheme: 'forest' | 'sky' | 'camel',
    extraNote?: string,
  ) => {
    const isExpanded = Boolean(expandedTitles[id])
    const themeText =
      disciplineTheme === 'forest'
        ? 'text-forest-800'
        : disciplineTheme === 'sky'
          ? 'text-sky-800'
          : 'text-camel-800'

    return (
      <div className="rounded-xl border border-old-money-200/80 bg-cream-50/30 overflow-hidden">
        <div
          role="button"
          tabIndex={0}
          onClick={() => toggleTitle(id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              toggleTitle(id)
            }
          }}
          className="px-3.5 py-2 sm:px-4 sm:py-2 flex items-center justify-between gap-2.5 cursor-pointer select-none hover:bg-cream-100/50 transition-colors"
          aria-expanded={isExpanded}
        >
          <div className="min-w-0">
            <div className={`text-xs font-bold uppercase tracking-wider ${themeText}`}>
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
                  isExpanded ? 'rotate-180 text-charcoal-700' : 'text-charcoal-400'
                }`}
                aria-hidden
              />
            )}
          </div>
        </div>

        {extraNote && isExpanded && (
          <div className="px-3.5 pb-2 text-xs text-charcoal-500">{extraNote}</div>
        )}

        {isExpanded && eventsList.length > 0 && (
          <div className="px-3.5 pb-3 pt-2 border-t border-cream-200/80 bg-white space-y-1.5 animate-in fade-in duration-150">
            {eventsList.map((ev, i) => (
              <div
                key={i}
                className="text-xs text-charcoal-700 flex items-center justify-between gap-2"
              >
                <span className="truncate">{ev.title}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {ev.date && <span className="text-[11px] text-charcoal-400">{ev.date}</span>}
                  {(ev.eventId && eventResultsUrls[ev.eventId]) || ev.exhibitionId ? (
                    <Link
                      to={ev.eventId && eventResultsUrls[ev.eventId] ? eventResultsUrls[ev.eventId] : `${localExhibitionPath}/${ev.exhibitionId}`}
                      className="text-camel-700 hover:text-camel-900 inline-flex items-center p-0.5"
                      title="Открыть протокол"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-old-money-200/90 bg-white overflow-hidden shadow-2xs">
      <div className="px-4 py-3 sm:px-5 sm:py-3 border-b border-old-money-100 bg-cream-50/50 flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-bold text-charcoal-900">
          Официальные сертификаты и квалификационные допуски
        </h2>
        {totalCertificates > 0 && (
          <span className="rounded-full bg-cream-200/80 text-charcoal-800 text-xs font-bold px-2.5 py-0.5">
            {totalCertificates}
          </span>
        )}
      </div>

      <div className="p-2.5 sm:p-3 space-y-2">
        {/* CACL Курсинг */}
        {renderCertificateCard(
          'cert-cacl-coursing',
          'CACL · Курсинг борзых',
          `${certs.caclEventsCoursing.length} серт.`,
          'Кандидат в чемпионы России (курсинг)',
          certs.caclEventsCoursing,
          'forest',
        )}

        {/* CACL Бега борзых */}
        {renderCertificateCard(
          'cert-cacl-racing',
          'CACL · Бега борзых',
          `${certs.caclEventsRacing.length} серт.`,
          'Кандидат в чемпионы России (рейсинг)',
          certs.caclEventsRacing,
          'sky',
        )}

        {/* CACIL Международные состязания */}
        {certs.cacilEvents.length > 0 &&
          renderCertificateCard(
            'cert-cacil',
            'CACIL · Международные состязания FCI',
            `${certs.cacilEvents.length} серт.`,
            'Кандидат в Интернациональные чемпионы (C.I.C.)',
            certs.cacilEvents,
            'forest',
          )}

        {/* CACLBr Породные сертификаты */}
        {((certs.caclBrEventsCoursing?.length ?? 0) > 0 || (certs.caclBrEventsRacing?.length ?? 0) > 0) &&
          renderCertificateCard(
            'cert-cacl-br',
            'CACLBr · Породный чемпион по РК',
            `${(certs.caclBrEventsCoursing?.length ?? 0) + (certs.caclBrEventsRacing?.length ?? 0)} серт.`,
            'Кандидат в Породные чемпионы по рабочим качествам (ПЧ РК)',
            [...(certs.caclBrEventsCoursing ?? []), ...(certs.caclBrEventsRacing ?? [])],
            'forest',
          )}

        {/* CAC Выставки */}
        {renderCertificateCard(
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

        {/* JCAC Выставки (Юниоры) */}
        {totalJcac > 0 &&
          renderCertificateCard(
            'cert-jcac-shows',
            'JCAC · Юниоры (выставки РКФ)',
            `${totalJcac} серт.`,
            (certs.uniqueJcacJudgesCount ?? 0) > 0
              ? `Кандидат в Юные чемпионы России · ${certs.uniqueJcacJudgesCount} выст.`
              : 'Кандидат в Юные чемпионы России по красоте',
            certs.jcacShowEvents ?? [],
            'camel',
          )}

        {/* VCAC Выставки (Ветераны) */}
        {totalVcac > 0 &&
          renderCertificateCard(
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
