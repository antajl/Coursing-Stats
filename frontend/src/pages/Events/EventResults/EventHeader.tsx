import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Dog,
  PawPrint,
  Building2,
  MapPin,
  User,
  FileSpreadsheet,
  BookOpen,
  FileText,
} from 'lucide-react'
import HoverTooltip from '../../../components/ui/HoverTooltip'
import { formatDate } from './utils'
import { getEventHeadline, formatCompetitionJudgesWithRoles, parseJudgeNames } from '../eventListUtils'
import type { Event, Result, TrackScheme } from './types'

interface EventHeaderProps {
  event: Event
  results: Result[]
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
  const participantsCount = new Set(results.map((r) => r.dog_id)).size
  const breedsCount = new Set(results.map((r) => r.breed)).size

  const rulesUrl = event.rules_url?.trim()
  const catalogUrl = event.catalog_url?.trim()
  const eventId = event.id ? String(event.id) : null
  const protocolUrl = eventId ? `/protocols/${eventId}.html` : null
  const hasLinks = Boolean(rulesUrl || catalogUrl || protocolUrl)
  const isDoninoSeries =
    event.competition_kind === 'Клубный чемпионат' ||
    Boolean(event.title?.includes('Клубный чемпионат')) ||
    ['2026004', '2022001', '2026005'].includes(String(event.id))

  return (
    <div className="relative mb-3">
      <div className="min-w-0 rounded-xl border border-old-money-200 bg-gradient-to-br from-cream-50 to-white px-3.5 py-3 md:px-4.5 md:py-3.5">
        {/* Заголовок турнира и быстрые действия */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="min-w-0 flex-1">
            <h1 className="min-w-0 font-serif text-base sm:text-lg font-bold leading-snug tracking-tight text-charcoal-900">
              {title}
            </h1>
          </div>
          {hasLinks && (
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              {protocolUrl ? (
                <a
                  href={protocolUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[36px] sm:min-h-0 flex-shrink-0 items-center gap-1.5 rounded-full border border-camel-200 bg-camel-50 px-3 py-1 text-xs font-medium text-camel-800 shadow-2xs transition-colors hover:border-camel-400 hover:bg-camel-100"
                  aria-label="Протокол и документы"
                  title="Официальный протокол состязания и прикреплённые документы"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-camel-700" aria-hidden />
                  <span>Протокол и документы</span>
                </a>
              ) : (
                <>
                  {rulesUrl && (
                    <a
                      href={rulesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[36px] sm:min-h-0 flex-shrink-0 items-center gap-1.5 rounded-full border border-camel-200 bg-camel-50 px-2.5 py-1 text-xs font-medium text-camel-700 shadow-2xs transition-colors hover:border-camel-400 hover:bg-camel-100"
                      aria-label="Регламент"
                      title="Регламент"
                    >
                      <BookOpen className="h-3.5 w-3.5" aria-hidden />
                      <span className="hidden sm:inline">Регламент</span>
                    </a>
                  )}
                  {catalogUrl && (
                    <a
                      href={catalogUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[36px] sm:min-h-0 flex-shrink-0 items-center gap-1.5 rounded-full border border-camel-200 bg-camel-50 px-2.5 py-1 text-xs font-medium text-camel-700 shadow-2xs transition-colors hover:border-camel-400 hover:bg-camel-100"
                      aria-label="Каталог"
                      title="Каталог"
                    >
                      <FileText className="h-3.5 w-3.5" aria-hidden />
                      <span className="hidden sm:inline">Каталог</span>
                    </a>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Единая компактная строка метрик и деталей турнира */}
        <div className="mt-2.5 pt-2 border-t border-old-money-200/60 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs">
          {/* Числовые метрики */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-old-money-200/80 bg-cream-100/70 px-2.5 py-1 text-charcoal-800">
              <Calendar className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
              <span className="font-semibold text-charcoal-900">{dateText}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-lg border border-old-money-200/80 bg-cream-100/70 px-2.5 py-1 text-charcoal-800">
              <Dog className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
              <span className="font-semibold text-charcoal-900">{participantsCount} участников</span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-lg border border-old-money-200/80 bg-cream-100/70 px-2.5 py-1 text-charcoal-800">
              <PawPrint className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
              <span className="font-semibold text-charcoal-900">{breedsCount} пород</span>
            </div>
          </div>

          {/* Организатор, Место проведения, Судейство и Трасса */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-charcoal-700 min-w-0 justify-start sm:justify-end">
            {event.host_club && (
              <div className="flex items-center gap-1.5 min-w-0">
                <Building2 className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
                <span className="text-old-money-500 font-medium">Организатор:</span>
                <span className="font-semibold text-charcoal-900 truncate max-w-[200px] sm:max-w-xs" title={event.host_club}>
                  {event.host_club}
                </span>
              </div>
            )}

            {locationText && locationText !== '—' && (
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
                <span className="text-old-money-500 font-medium">Место:</span>
                <span className="font-semibold text-charcoal-900 truncate max-w-[240px] sm:max-w-sm" title={locationText}>
                  {locationText}
                </span>
              </div>
            )}

            {event.judges && (
              <div className="flex items-center gap-1.5 shrink-0">
                <User className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
                <span className="text-old-money-500 font-medium">Судьи:</span>
                <div className="flex flex-wrap items-center gap-x-1 font-semibold text-charcoal-900">
                  {parseJudgeNames(event.judges).length > 0 ? (
                    parseJudgeNames(event.judges).map((judgeName, idx, arr) => (
                      <span key={judgeName} className="inline-flex items-center">
                        <Link
                          to={`/judges/${encodeURIComponent(judgeName)}/`}
                          className="text-camel-800 hover:text-camel-900 hover:underline transition-colors"
                        >
                          {judgeName}
                        </Link>
                        {idx < arr.length - 1 && <span className="text-old-money-400 mr-1">,</span>}
                      </span>
                    ))
                  ) : (
                    <span>{formatCompetitionJudgesWithRoles(event.judges)}</span>
                  )}
                </div>
              </div>
            )}

            {trackSchemes.length > 0 && (
              <div className="flex items-center gap-1.5 shrink-0">
                {trackSchemes.map((scheme, index) => {
                  const schemeName =
                    !scheme.url && scheme.name === 'Схема трассы' ? 'Длина трассы' : scheme.name
                  return (
                    <span key={index} className="group relative inline-block">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border border-camel-200 bg-camel-50 px-2 py-0.5 text-xs font-medium text-camel-800 ${
                          scheme.url
                            ? 'cursor-pointer transition-colors hover:border-camel-400 hover:bg-camel-100'
                            : ''
                        }`}
                      >
                        <span>{schemeName}</span>
                        {scheme.length && <span className="text-old-money-500">({scheme.length})</span>}
                      </span>
                      {scheme.url && (
                        <div className="absolute right-0 sm:left-0 top-full z-50 mt-2 hidden w-max max-w-[90vw] rounded-lg border border-old-money-200 bg-white p-2 shadow-xl group-hover:block md:max-w-md">
                          <img
                            src={scheme.url}
                            alt={scheme.name}
                            className="max-h-96 max-w-[90vw] object-contain md:max-w-md"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Переключатель этапов серии */}
      {isDoninoSeries && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-xs font-medium text-charcoal-500 mr-1">Серия:</span>
          {[
            { id: '2026004', label: 'I этап (9 авг)' },
            { id: '2022001', label: 'II этап (20 сен)' },
            { id: '2026005', label: 'III этап (31 окт)' },
          ].map((stage) => {
            const isCurrent = String(event.id) === stage.id
            return isCurrent ? (
              <span
                key={stage.id}
                className="inline-flex h-8 shrink-0 items-center rounded-full bg-camel-500 text-charcoal-900 border border-camel-600 px-3 text-xs font-semibold shadow-xs whitespace-nowrap"
              >
                {stage.label}
              </span>
            ) : (
              <Link
                key={stage.id}
                to={'/event/' + stage.id + '/'}
                className="inline-flex h-8 shrink-0 items-center rounded-full border border-old-money-200/80 bg-cream-50 px-3 text-xs font-semibold text-charcoal-700 hover:bg-old-money-50 hover:text-charcoal-900 transition-all whitespace-nowrap"
              >
                {stage.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
