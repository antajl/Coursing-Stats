import { formatDate } from './utils'
import type { Event, Result, TrackScheme } from './types'

interface EventHeaderProps {
  event: Event
  results: Result[]
}

export default function EventHeader({ event, results }: EventHeaderProps) {
  const trackSchemes: TrackScheme[] = event.track_schemes ? JSON.parse(event.track_schemes) : []

  return (
    <div className="mb-6 rounded-2xl bg-old-money-50 dark:bg-charcoal-700 p-4 md:p-6">
      <h1 className="mb-4 text-xl font-bold tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-2xl">
        {event.results_url ? (
          <a
            href={event.results_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-camel-700 dark:hover:text-camel-400 hover:underline transition-colors"
          >
            {event.full_title || `${event.competition_kind} ${event.competition_type}`}
          </a>
        ) : (
          event.full_title || `${event.competition_kind} ${event.competition_type}`
        )}
      </h1>

      <div className="flex flex-wrap gap-x-4 md:gap-x-6 gap-y-2 text-sm text-old-money-800 dark:text-old-money-300 mb-4">
        <span>
          <span className="text-old-money-500 dark:text-old-money-400">Дата:</span> {event.event_date || formatDate(event.date_start)}
        </span>
        <span>
          <span className="text-old-money-500 dark:text-old-money-400">Локация:</span> {event.protocol_location || event.location}
        </span>
        <span>
          <span className="text-old-money-500 dark:text-old-money-400">Участников:</span> {new Set(results.map(r => r.dog_id)).size}
        </span>
        <span>
          <span className="text-old-money-500 dark:text-old-money-400">Пород:</span> {new Set(results.map(r => r.breed)).size}
        </span>
      </div>

      <div className="space-y-1 text-sm text-old-money-800 dark:text-old-money-300">
        {event.host_club && (
          <div>
            <span className="text-old-money-500 dark:text-old-money-400">Кинологическая организация:</span> {event.host_club}
          </div>
        )}
        {event.title && (
          <div>
            <span className="text-old-money-500 dark:text-old-money-400">Клуб-организатор:</span>{' '}
            {event.telegram_url ? (
              <a
                href={event.telegram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-camel-700 dark:text-camel-400 underline transition-colors hover:text-camel-800 dark:hover:text-camel-300"
              >
                {event.title.replace(/Курсинг\d{4}/i, '').trim()}
              </a>
            ) : event.results_url ? (
              <a
                href={event.results_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-camel-700 dark:text-camel-400 underline transition-colors hover:text-camel-800 dark:hover:text-camel-300"
              >
                {event.title.replace(/Курсинг\d{4}/i, '').trim()}
              </a>
            ) : (
              <span className="text-camel-700 dark:text-camel-400">{event.title.replace(/Курсинг\d{4}/i, '').trim()}</span>
            )}
          </div>
        )}
        {event.judges && (
          <div>
            <span className="text-old-money-500 dark:text-old-money-400">Судьи:</span> {event.judges}
          </div>
        )}
        {trackSchemes.length > 0 && (
          <div>
            <span className="text-old-money-500 dark:text-old-money-400">Схемы трасс:</span>{' '}
            {trackSchemes.map((scheme, index) => (
              <span key={index} className="group relative inline-block mr-3 cursor-pointer">
                <span className="text-camel-700 dark:text-camel-400 underline transition-colors hover:text-camel-800 dark:hover:text-camel-300">
                  {scheme.name}{scheme.length && ` (${scheme.length})`}
                </span>
                {scheme.url && (
                  <div className="absolute left-1/2 top-full z-50 mt-2 hidden w-max max-w-[90vw] -translate-x-1/2 rounded-lg border border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 p-2 shadow-xl group-hover:block md:left-0 md:max-w-md md:-translate-x-0">
                    <img
                      src={scheme.url}
                      alt={scheme.name}
                      className="max-w-[90vw] md:max-w-md max-h-96 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
