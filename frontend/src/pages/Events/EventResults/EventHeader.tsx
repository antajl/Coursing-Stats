import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Users, MapPin, Building2, User, PawPrint, Download, FileText, BookOpen, FileSpreadsheet } from 'lucide-react'
import BreedGroupDivider from './components/BreedGroupDivider'
import HoverTooltip from '../../../components/ui/HoverTooltip'
import { formatDate } from './utils'
import { getEventHeadline, formatCompetitionJudgesWithRoles, parseJudgeNames } from '../eventListUtils'
import type { Event, Result, TrackScheme } from './types'

interface EventHeaderProps {
  event: Event
  results: Result[]
}

function StatPill({
  value,
  label,
  className = '',
  valueClassName = '',
}: {
  value: ReactNode
  label: string
  className?: string
  valueClassName?: string
}) {
  return (
    <div
      className={`rounded-lg border border-old-money-200 bg-white/80 px-3 py-2 ${className}`}
    >
      <div
        className={`font-serif font-bold tabular-nums leading-tight text-charcoal-900 ${valueClassName || 'text-lg md:text-xl'}`}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-old-money-500">
        {label}
      </div>
    </div>
  )
}

function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wide text-old-money-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium leading-snug text-charcoal-800">
        {children}
      </div>
    </div>
  )
}

export default function EventHeader({ event, results }: EventHeaderProps) {
  const trackSchemes: TrackScheme[] = event.track_schemes ? JSON.parse(event.track_schemes) : []
  const title = getEventHeadline({
    id: 0,
    date_start: event.date_start || '',
    rank_label: event.rank_label,
    title: event.title,
    full_title: event.full_title,
    competition_kind: event.competition_kind,
    competition_type: event.competition_type,
  })
  const dateText = formatDate(event.date_start) || event.event_date || '—'
  const locationText = event.protocol_location || event.location || '—'
  const participantsCount = new Set(results.map(r => r.dog_id)).size
  const breedsCount = new Set(results.map(r => r.breed)).size

  const rulesUrl = event.rules_url?.trim()
  const catalogUrl = event.catalog_url?.trim()
  const eventId = event.id ? String(event.id) : null
  const protocolUrl = eventId ? `/protocols/${eventId}.html` : null
  const hasLinks = Boolean(rulesUrl || catalogUrl || protocolUrl)

  return (
    <div className="relative mb-4">
      <div className="min-w-0 rounded-xl border border-old-money-200 bg-gradient-to-br from-cream-50 to-white px-4 py-4 md:px-5 md:py-4.5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="min-w-0 font-serif text-lg font-bold leading-tight tracking-tight text-charcoal-900 md:text-xl">
              {title}
            </h1>
            <div className="mt-3 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 shrink-0">
                <Calendar className="h-4 w-4 text-camel-600" />
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-old-money-500">Дата</div>
                  <div className="text-sm font-semibold text-charcoal-900">{dateText}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 shrink-0">
                <Users className="h-4 w-4 text-camel-600" />
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-old-money-500">Участников</div>
                  <div className="text-sm font-semibold text-charcoal-900">{participantsCount}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 shrink-0">
                <PawPrint className="h-4 w-4 text-camel-600" />
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-old-money-500">Пород</div>
                  <div className="text-sm font-semibold text-charcoal-900">{breedsCount}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 min-w-0 flex-1">
                <MapPin className="h-4 w-4 text-camel-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-wide text-old-money-500">Место</div>
                  <div className="text-sm font-semibold text-charcoal-900">
                    {locationText.length > 30 ? (
                      <HoverTooltip label={locationText} placement="bottom" variant="site" delayMs={0} portal>
                        <span className="cursor-help line-clamp-2">{locationText}</span>
                      </HoverTooltip>
                    ) : (
                      locationText
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {hasLinks && (
            <div className="mt-1 flex flex-wrap gap-2 shrink-0">
              {protocolUrl ? (
                <a
                  href={protocolUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] sm:min-h-0 flex-shrink-0 items-center gap-1.5 rounded-full border border-camel-200 bg-camel-50 px-3 py-1.5 text-xs font-medium text-camel-800 shadow-xs transition-colors hover:border-camel-400 hover:bg-camel-100"
                  aria-label="Протокол и документы"
                  title="Официальный протокол состязания и прикреплённые документы"
                >
                  <FileSpreadsheet className="h-4 w-4 text-camel-700" aria-hidden />
                  <span>Протокол и документы</span>
                </a>
              ) : (
                <>
                  {rulesUrl && (
                    <a
                      href={rulesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] sm:min-h-0 flex-shrink-0 items-center gap-1.5 rounded-full border border-camel-200 bg-camel-50 px-2.5 py-1.5 text-xs font-medium text-camel-700 shadow-xs transition-colors hover:border-camel-400 hover:bg-camel-100"
                      aria-label="Регламент"
                      title="Регламент"
                    >
                      <BookOpen className="h-4 w-4" aria-hidden />
                      <span className="hidden sm:inline">Регламент</span>
                    </a>
                  )}
                  {catalogUrl && (
                    <a
                      href={catalogUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] sm:min-h-0 flex-shrink-0 items-center gap-1.5 rounded-full border border-camel-200 bg-camel-50 px-2.5 py-1.5 text-xs font-medium text-camel-700 shadow-xs transition-colors hover:border-camel-400 hover:bg-camel-100"
                      aria-label="Каталог"
                      title="Каталог"
                    >
                      <FileText className="h-4 w-4" aria-hidden />
                      <span className="hidden sm:inline">Каталог</span>
                    </a>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {(event.host_club || event.judges || trackSchemes.length > 0) && (
          <div className="mt-4 pt-4 border-t border-old-money-200/60">
            <div className="flex flex-wrap gap-4 sm:gap-6">
              {event.host_club && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-old-money-500" />
                  <span className="text-old-money-700">{event.host_club}</span>
                </div>
              )}
              {event.judges && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-old-money-500 shrink-0" />
                  <div className="flex flex-wrap items-center gap-x-1.5 text-old-money-700">
                    <span className="text-old-money-500 font-medium">Судьи:</span>
                    {parseJudgeNames(event.judges).length > 0 ? (
                      parseJudgeNames(event.judges).map((judgeName, idx, arr) => (
                        <span key={judgeName} className="inline-flex items-center">
                          <Link
                            to={`/judges/${encodeURIComponent(judgeName)}/`}
                            className="text-camel-800 hover:text-camel-900 hover:underline font-medium transition-colors"
                          >
                            {judgeName}
                          </Link>
                          {idx < arr.length - 1 && <span className="text-old-money-400">,</span>}
                        </span>
                      ))
                    ) : (
                      <span>{formatCompetitionJudgesWithRoles(event.judges)}</span>
                    )}
                  </div>
                </div>
              )}
              {trackSchemes.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex flex-wrap gap-1.5">
                    {trackSchemes.map((scheme, index) => {
                      const schemeName =
                        !scheme.url && scheme.name === 'Схема трассы' ? 'Длина трассы' : scheme.name
                      return (
                        <span key={index} className="group relative inline-block">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md border border-camel-200 bg-camel-50 px-2.5 py-1 text-xs font-medium text-camel-800 ${
                              scheme.url
                                ? 'cursor-pointer transition-colors hover:border-camel-400 hover:bg-camel-100'
                                : ''
                            }`}
                          >
                            <span>{schemeName}</span>
                            {scheme.length && <span className="text-old-money-500">({scheme.length})</span>}
                          </span>
                          {scheme.url && (
                            <div className="absolute left-0 top-full z-50 mt-2 hidden w-max max-w-[90vw] rounded-lg border border-old-money-200 bg-white p-2 shadow-xl group-hover:block md:max-w-md">
                              <img
                                src={scheme.url}
                                alt={scheme.name}
                                className="max-h-96 max-w-[90vw] object-contain md:max-w-md"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            </div>
                          )}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {(() => {
          const DONINO_SERIES_STAGES = [
            { id: '2026004', label: 'I этап (9 авг)' },
            { id: '2022001', label: 'II этап (20 сен)' },
            { id: '2026005', label: 'III этап (31 окт)' },
          ]
          const isDoninoSeries = DONINO_SERIES_STAGES.some((s) => s.id === String(event.id))
          if (!isDoninoSeries) return null

          return (
            <div className="mt-3.5 pt-3 border-t border-amber-200/70 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-amber-900">
                  Серия Донино 2026:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {DONINO_SERIES_STAGES.map((stage) => {
                    const isCurrent = String(event.id) === stage.id
                    return (
                      <Link
                        key={stage.id}
                        to={`/event/${stage.id}/`}
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                          isCurrent
                            ? 'bg-amber-600 text-white shadow-2xs font-semibold'
                            : 'border border-amber-300/80 bg-amber-50/80 text-amber-900 hover:bg-amber-100 hover:border-amber-400'
                        }`}
                      >
                        {stage.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
              <Link
                to="/speed-records/"
                className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 hover:text-amber-900 hover:underline"
              >
                <span>Рекорды Донино</span>
                <span aria-hidden>→</span>
              </Link>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
