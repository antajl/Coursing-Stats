import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
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
    <div className="relative mb-6">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="relative z-10 mb-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-old-money-500 transition-colors hover:bg-old-money-50 hover:text-camel-700 md:absolute md:right-full md:top-8 md:mb-0 md:mr-0.5 dark:text-old-money-400 dark:hover:bg-charcoal-700 dark:hover:text-camel-400"
          aria-label="Назад"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
      )}

      <div className="min-w-0 rounded-xl border border-old-money-200 bg-cream-50 p-4 dark:border-charcoal-600 dark:bg-charcoal-800/40 md:p-6">
        <div className="flex items-start justify-between gap-2">
          <h1 className="min-w-0 font-serif text-xl font-bold leading-tight tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-2xl">
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
          {archiveResultsUrl && (
            <a
              href={archiveResultsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-old-money-200 bg-white/90 py-1 pl-1 pr-2.5 text-xs font-semibold text-camel-700 shadow-sm transition-colors hover:border-camel-400 hover:bg-camel-50 hover:text-camel-800 dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-camel-400 dark:hover:border-camel-600 dark:hover:bg-charcoal-700 dark:hover:text-camel-300"
              aria-label="Открыть протокол в web.archive.org"
              title="Открыть протокол в web.archive.org"
            >
              <img
                src="/assets/web-archive-favicon.ico"
                alt=""
                className="h-5 w-5 rounded-full"
                width={20}
                height={20}
                decoding="async"
              />
              <span>Archive</span>
            </a>
          )}
        </div>

        <BreedGroupDivider />

        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatPill value={dateText} label="дата" />
          <StatPill value={participantsCount} label="собак" />
          <StatPill value={breedsCount} label="пород" />
          <StatPill
            value={
              locationText.length > 40 ? (
                <HoverTooltip label={locationText} placement="bottom">
                  <span className="line-clamp-2 cursor-help text-sm leading-snug md:text-base">{locationText}</span>
                </HoverTooltip>
              ) : (
                <span className="text-sm leading-snug md:text-base">{locationText}</span>
              )
            }
            label="место"
            valueClassName="text-sm md:text-base"
            className="col-span-2 sm:col-span-1"
          />
        </div>

        <div className="grid gap-4 border-t border-old-money-200 pt-4 dark:border-charcoal-600 md:grid-cols-2">
          {event.host_club && (
            <DetailField label="Клуб-организатор">{event.host_club}</DetailField>
          )}

          {event.judges && (
            <DetailField label="Судьи">{event.judges}</DetailField>
          )}

          {trackSchemes.length > 0 && (
            <DetailField label="Схемы трасс">
              <div className="flex flex-wrap gap-2">
                {trackSchemes.map((scheme, index) => (
                  <span key={index} className="group relative inline-block">
                    <span className="inline-block cursor-pointer rounded-lg border border-old-money-200 bg-white px-2.5 py-1 text-xs font-medium text-camel-800 transition-colors hover:border-camel-300 hover:bg-camel-50 dark:border-charcoal-500 dark:bg-charcoal-700 dark:text-camel-300 dark:hover:border-camel-700">
                      {scheme.name}
                      {scheme.length && ` (${scheme.length})`}
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
            </DetailField>
          )}
        </div>
      </div>
    </div>
  )
}
