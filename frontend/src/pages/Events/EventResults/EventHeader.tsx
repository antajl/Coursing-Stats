import type { ReactNode } from 'react'
import { ChevronLeft, Calendar, Users, MapPin, Building2, User, PawPrint } from 'lucide-react'
import BreedGroupDivider from './components/BreedGroupDivider'
import HoverTooltip from '../../../components/ui/HoverTooltip'
import { toProcoursingArchiveUrl } from '../../../lib/procoursingArchive'
import { formatDate } from './utils'
import { getEventHeadline } from '../eventListUtils'
import type { Event, Result, TrackScheme } from './types'

interface EventHeaderProps {
  event: Event
  results: Result[]
  onBack?: () => void
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
      className={`rounded-lg border border-old-money-200 bg-white/80 px-3 py-2 dark:border-charcoal-600 dark:bg-charcoal-800/60 ${className}`}
    >
      <div
        className={`font-serif font-bold tabular-nums leading-tight text-charcoal-900 dark:text-charcoal-100 ${valueClassName || 'text-lg md:text-xl'}`}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
        {label}
      </div>
    </div>
  )
}

function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium leading-snug text-charcoal-800 dark:text-charcoal-200">
        {children}
      </div>
    </div>
  )
}

export default function EventHeader({ event, results, onBack }: EventHeaderProps) {
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
  const archiveResultsUrl = toProcoursingArchiveUrl(event.results_url)
  const dateText = formatDate(event.date_start) || event.event_date || '—'
  const locationText = event.protocol_location || event.location || '—'
  const participantsCount = new Set(results.map(r => r.dog_id)).size
  const breedsCount = new Set(results.map(r => r.breed)).size

  return (
    <div className="relative mb-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="relative z-10 mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg text-old-money-500 transition-colors hover:bg-old-money-50 hover:text-camel-700 md:absolute md:right-full md:top-6 md:mb-0 md:mr-0.5 dark:text-old-money-400 dark:hover:bg-charcoal-700 dark:hover:text-camel-400"
          aria-label="Назад"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
      )}

      <div className="min-w-0 rounded-xl border border-old-money-200 bg-gradient-to-br from-cream-50 to-white px-4 py-4 dark:border-charcoal-600 dark:from-charcoal-800/50 dark:to-charcoal-800/30 md:px-5 md:py-4.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="min-w-0 font-serif text-lg font-bold leading-tight tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-xl">
              {archiveResultsUrl ? (
                <a
                  href={archiveResultsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-camel-700 dark:hover:text-camel-400"
                >
                  {title}
                </a>
              ) : (
                title
              )}
            </h1>
            <div className="mt-3 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 dark:bg-charcoal-900/40 shrink-0">
                <Calendar className="h-4 w-4 text-camel-600 dark:text-camel-400" />
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-old-money-500 dark:text-old-money-400">Дата</div>
                  <div className="text-sm font-semibold text-charcoal-900 dark:text-charcoal-100">{dateText}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 dark:bg-charcoal-900/40 shrink-0">
                <Users className="h-4 w-4 text-camel-600 dark:text-camel-400" />
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-old-money-500 dark:text-old-money-400">Участников</div>
                  <div className="text-sm font-semibold text-charcoal-900 dark:text-charcoal-100">{participantsCount}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 dark:bg-charcoal-900/40 shrink-0">
                <PawPrint className="h-4 w-4 text-camel-600 dark:text-camel-400" />
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-old-money-500 dark:text-old-money-400">Пород</div>
                  <div className="text-sm font-semibold text-charcoal-900 dark:text-charcoal-100">{breedsCount}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 dark:bg-charcoal-900/40 min-w-0 flex-1">
                <MapPin className="h-4 w-4 text-camel-600 dark:text-camel-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-wide text-old-money-500 dark:text-old-money-400">Место</div>
                  <div className="text-sm font-semibold text-charcoal-900 dark:text-charcoal-100">
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
          {archiveResultsUrl && (
            <a
              href={archiveResultsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-camel-200 bg-camel-50 px-2.5 py-1.5 text-xs font-medium text-camel-700 shadow-sm transition-colors hover:border-camel-400 hover:bg-camel-100 dark:border-camel-800 dark:bg-camel-950/50 dark:text-camel-400 dark:hover:border-camel-700 dark:hover:bg-camel-900"
              aria-label="Открыть протокол в web.archive.org"
              title="Открыть протокол в web.archive.org"
            >
              <img
                src="/assets/icons/web-archive.ico"
                alt=""
                className="h-4 w-4 rounded-full"
                width={16}
                height={16}
                decoding="async"
              />
              <span className="hidden sm:inline">Archive</span>
            </a>
          )}
        </div>

        {(event.host_club || event.judges || trackSchemes.length > 0) && (
          <div className="mt-4 pt-4 border-t border-old-money-200/60 dark:border-charcoal-600/60">
            <div className="flex flex-wrap gap-4 sm:gap-6">
              {event.host_club && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-old-money-500 dark:text-old-money-400" />
                  <span className="text-old-money-700 dark:text-old-money-300">{event.host_club}</span>
                </div>
              )}
              {event.judges && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-old-money-500 dark:text-old-money-400" />
                  <span className="text-old-money-700 dark:text-old-money-300">{event.judges}</span>
                </div>
              )}
              {trackSchemes.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex flex-wrap gap-1.5">
                    {trackSchemes.map((scheme, index) => (
                      <span key={index} className="group relative inline-block">
                        <span className="inline-flex items-center gap-1.5 cursor-pointer rounded-md border border-camel-200 bg-camel-50 px-2.5 py-1 text-xs font-medium text-camel-800 transition-colors hover:border-camel-400 hover:bg-camel-100 dark:border-camel-800 dark:bg-camel-950/50 dark:text-camel-400 dark:hover:border-camel-700 dark:hover:bg-camel-900">
                          <span>{scheme.name}</span>
                          {scheme.length && <span className="text-old-money-500 dark:text-old-money-400">({scheme.length})</span>}
                        </span>
                        {scheme.url && (
                          <div className="absolute left-0 top-full z-50 mt-2 hidden w-max max-w-[90vw] rounded-lg border border-old-money-200 bg-white p-2 shadow-xl group-hover:block dark:border-charcoal-600 dark:bg-charcoal-800 md:max-w-md">
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
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
