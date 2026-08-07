import { type CalendarEvent } from '../pages/Events/eventListUtils'
import { type ShowRkfCalendarEntry } from '../lib/staticData'
import EmptyState from './EmptyState'

interface EventListCardProps {
  events: CalendarEvent[]
  shows: ShowRkfCalendarEntry[]
  formatDate: (date: string) => string
  className?: string
}

export default function EventListCard({
  events,
  shows,
  formatDate,
  className = '',
}: EventListCardProps) {
  return (
    <div className={`bg-gradient-to-br from-camel-100/95 to-cream-50/95 dark:from-camel-900/80 dark:to-charcoal-800/80 backdrop-blur-md rounded-xl p-4 md:p-5 shadow-xl border border-camel-200/50 dark:border-camel-700/50 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${className}`}>
      <div className="flex items-center justify-center mb-3 pb-3 border-b border-charcoal-200 dark:border-charcoal-700">
        <p className="text-sm font-semibold text-camel-700 dark:text-camel-300">Ближайшие события</p>
      </div>
      <div className="flex flex-col md:flex-row gap-3 md:gap-0 items-start">
        <div className="flex-1 space-y-1">
          {events.length > 0 ? (
            events.slice(0, 3).map((event) => (
              <a
                key={event.id}
                href={event.results_url ?? '#'}
                target={event.results_url ? '_blank' : undefined}
                rel={event.results_url ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-2 text-xs hover:text-camel-600 dark:hover:text-camel-400 transition-colors hover:bg-camel-50/50 dark:hover:bg-camel-900/30 p-1.5 rounded group focus:outline-none focus:ring-2 focus:ring-camel-500 focus:ring-offset-2 dark:focus:ring-offset-charcoal-900"
              >
                <span className="text-charcoal-500 dark:text-charcoal-400 text-xs whitespace-nowrap shrink-0 group-hover:text-camel-600 dark:group-hover:text-camel-400">
                  {formatDate(event.date_start)}
                </span>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-semibold text-charcoal-900 dark:text-charcoal-100 line-clamp-2 hover:underline decoration-camel-500 dark:decoration-camel-400 decoration-2 underline-offset-2 text-sm" title={event.title || event.full_title}>
                    {event.title || event.full_title}
                  </span>
                </div>
                <svg className="w-3 h-3 text-charcoal-400 dark:text-charcoal-600 group-hover:text-camel-600 dark:group-hover:text-camel-400 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))
          ) : (
            <EmptyState
              title="Нет ближайших соревнований"
              description="Проверьте позже"
            />
          )}
        </div>
        <div className="w-px bg-charcoal-200 dark:bg-charcoal-700 mx-2 self-stretch hidden md:block" />
        <div className="flex-1 space-y-1">
          {shows.length > 0 ? (
            shows.slice(0, 3).map((show) => (
              <a
                key={show.id}
                href={show.url ?? '#'}
                target={show.url ? '_blank' : undefined}
                rel={show.url ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-2 text-xs hover:text-camel-600 dark:hover:text-camel-400 transition-colors hover:bg-camel-50/50 dark:hover:bg-camel-900/30 p-1.5 rounded group focus:outline-none focus:ring-2 focus:ring-camel-500 focus:ring-offset-2 dark:focus:ring-offset-charcoal-900"
              >
                <span className="text-charcoal-500 dark:text-charcoal-400 text-xs whitespace-nowrap shrink-0 group-hover:text-camel-600 dark:group-hover:text-camel-400">
                  {formatDate(show.date)}
                </span>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-semibold text-charcoal-900 dark:text-charcoal-100 line-clamp-2 hover:underline decoration-camel-500 dark:decoration-camel-400 decoration-2 underline-offset-2 text-sm" title={show.title}>
                    {show.title}
                  </span>
                </div>
                <svg className="w-3 h-3 text-charcoal-400 dark:text-charcoal-600 group-hover:text-camel-600 dark:group-hover:text-camel-400 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))
          ) : (
            <EmptyState
              title="Нет ближайших выставок"
              description="Проверьте позже"
            />
          )}
        </div>
      </div>
    </div>
  )
}
