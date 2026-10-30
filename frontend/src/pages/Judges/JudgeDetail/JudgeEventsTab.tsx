import React from 'react'
import { Search, X } from 'lucide-react'
import type { JudgeEvent } from './types'
import { formatBreedName, formatDate } from './utils'

interface JudgeEventsTabProps {
  filteredEvents: JudgeEvent[]
  eventSearchQuery: string
  setEventSearchQuery: (query: string) => void
  eventBreedFilter: string
  onResetFilters: () => void
  showAllEvents: boolean
  setShowAllEvents: (show: boolean) => void
}

export const JudgeEventsTab: React.FC<JudgeEventsTabProps> = ({
  filteredEvents,
  eventSearchQuery,
  setEventSearchQuery,
  eventBreedFilter,
  onResetFilters,
  showAllEvents,
  setShowAllEvents,
}) => {
  return (
    <>
      {/* Search Toolbar */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
          <input
            type="search"
            value={eventSearchQuery}
            onChange={(e) => setEventSearchQuery(e.target.value)}
            placeholder="Поиск по названию соревнований, породе или дате..."
            className="h-9 w-full rounded-lg border border-old-money-200/90 bg-cream-50/60 pl-9 pr-8 text-xs sm:text-sm text-charcoal-900 placeholder:text-charcoal-400 hover:border-camel-300 focus:border-camel-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel-100 transition-colors"
          />
          {eventSearchQuery && (
            <button
              type="button"
              onClick={() => setEventSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700"
              aria-label="Очистить"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="py-12 text-center text-sm text-charcoal-500">
          {eventBreedFilter || eventSearchQuery ? (
            <div>
              Нет соревнований по заданному фильтру.
              <div className="mt-2">
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="font-medium text-camel-700 underline hover:text-camel-800"
                >
                  Сбросить все фильтры
                </button>
              </div>
            </div>
          ) : (
            'Нет данных о соревнованиях'
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2.5">
            {(showAllEvents || eventSearchQuery ? filteredEvents : filteredEvents.slice(0, 20)).map((ev) => (
              <div
                key={ev.key}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-old-money-200/80 bg-white p-3.5 transition-colors hover:border-camel-300 shadow-2xs"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="flex h-10 w-24 shrink-0 flex-col items-center justify-center rounded-lg border border-old-money-200/80 bg-cream-50/80 px-1 text-center">
                    <span className="text-xs font-bold tabular-nums text-charcoal-800">
                      {formatDate(ev.date)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-charcoal-900 leading-snug">
                      {ev.title}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  <span className="inline-flex items-center rounded-lg border border-camel-200/80 bg-cream-50 px-2.5 py-1 text-xs font-semibold text-camel-900">
                    {formatBreedName(ev.breed)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {!eventSearchQuery && filteredEvents.length > 20 && (
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setShowAllEvents(!showAllEvents)}
                className="rounded-xl border border-old-money-200 bg-white px-5 py-2 text-sm font-semibold text-charcoal-800 shadow-2xs hover:border-camel-400 hover:bg-cream-50 transition-colors"
              >
                {showAllEvents ? 'Свернуть список' : `Показать все ${filteredEvents.length} соревнований`}
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}
