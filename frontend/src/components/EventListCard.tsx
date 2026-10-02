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
    <div className={`bg-gradient-to-br from-camel-100/95 to-cream-50/95 backdrop-blur-md rounded-xl p-3.5 md:p-4 shadow-xl border border-camel-200/50 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-charcoal-200/70">
        <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-camel-800">Последние результаты</p>
        <span className="text-[10px] uppercase tracking-wider text-charcoal-400 font-semibold">Календарь</span>
      </div>
      <div className="flex flex-col md:flex-row gap-3 md:gap-3.5 items-stretch flex-1">
        <div className="flex-1 flex flex-col justify-between space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 pb-0.5">
            Курсинг и бега
          </div>
          {events.length > 0 ? (
            events.slice(0, 3).map((event) => (
              <a
                key={event.id}
                href={event.results_url ?? '#'}
                target={event.results_url ? '_blank' : undefined}
                rel={event.results_url ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-1.5 text-xs hover:text-camel-700 transition-colors hover:bg-camel-50/60 p-1.5 rounded-lg group focus:outline-none focus:ring-1 focus:ring-camel-500"
              >
                <span className="text-charcoal-500 text-xs tabular-nums whitespace-nowrap shrink-0 group-hover:text-camel-700 font-medium">
                  {formatDate(event.date_start)}
                </span>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-semibold text-charcoal-900 line-clamp-2 hover:underline decoration-camel-500 decoration-1 underline-offset-2 text-xs leading-snug" title={event.title || event.full_title}>
                    {event.title || event.full_title}
                  </span>
                </div>
                <svg className="w-3 h-3 text-charcoal-400 group-hover:text-camel-600 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))
          ) : (
            <EmptyState
              title="Нет результатов"
              description="Протоколы появятся после соревнований"
            />
          )}
        </div>
        <div className="w-px bg-charcoal-200/70 mx-0.5 self-stretch hidden md:block" />
        <div className="flex-1 flex flex-col justify-between space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 pb-0.5">
            Выставки РКФ
          </div>
          {shows.length > 0 ? (
            shows.slice(0, 3).map((show) => (
              <a
                key={show.id}
                href={show.url ?? '#'}
                target={show.url ? '_blank' : undefined}
                rel={show.url ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-1.5 text-xs hover:text-camel-700 transition-colors hover:bg-camel-50/60 p-1.5 rounded-lg group focus:outline-none focus:ring-1 focus:ring-camel-500"
              >
                <span className="text-charcoal-500 text-xs tabular-nums whitespace-nowrap shrink-0 group-hover:text-camel-700 font-medium">
                  {formatDate(show.date)}
                </span>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-semibold text-charcoal-900 line-clamp-2 hover:underline decoration-camel-500 decoration-1 underline-offset-2 text-xs leading-snug" title={show.title}>
                    {show.title}
                  </span>
                </div>
                <svg className="w-3 h-3 text-charcoal-400 group-hover:text-camel-600 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))
          ) : (
            <EmptyState
              title="Нет результатов"
              description="Протоколы появятся после выставок"
            />
          )}
        </div>
      </div>
    </div>
  )
}
