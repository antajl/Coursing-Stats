import { useState, useEffect } from 'react'
import { Sparkles, Layers } from 'lucide-react'
import EventListRow from './EventListRow'
import EventListRowModern from './EventListRowModern'
import type { CalendarEvent } from './eventListUtils'
import { useListReveal } from '../../hooks/useListReveal'

export type EventsMonthGroup = {
  key: string
  label: string
  events: CalendarEvent[]
}

type EventsMonthListProps = {
  monthGroups: EventsMonthGroup[]
  /** When true, list-reveal animation is armed (non-empty filtered list). */
  reveal: boolean
}

export default function EventsMonthList({ monthGroups, reveal }: EventsMonthListProps) {
  const listRevealRef = useListReveal(reveal)

  const [viewMode, setViewMode] = useState<'modern' | 'classic'>(() => {
    try {
      const saved = localStorage.getItem('coursing_events_view_mode')
      if (saved === 'classic' || saved === 'modern') return saved
    } catch {
      // ignore localStorage errors
    }
    return 'modern'
  })

  useEffect(() => {
    try {
      localStorage.setItem('coursing_events_view_mode', viewMode)
    } catch {
      // ignore
    }
  }, [viewMode])

  return (
    <div ref={listRevealRef}>
      {/* Панель переключения вида для визуального сравнения */}
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-old-money-200/90 bg-cream-50/90 px-3 py-2 sm:px-4 sm:py-2.5 shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="h-4 w-4 text-camel-600 shrink-0" strokeWidth={1.8} />
          <span className="text-xs font-semibold text-charcoal-800">
            Вид карточек в архиве:
          </span>
          <span className="hidden md:inline text-[11px] text-charcoal-500">
            {viewMode === 'modern'
              ? 'без смещающей иконки, идеальное выравнивание адреса и организации, кнопка «Результаты»'
              : 'исходное отображение с иконкой локации и отдельной правой колонкой'}
          </span>
        </div>

        <div className="inline-flex items-center rounded-lg bg-old-money-100/80 p-0.5 border border-old-money-200/80">
          <button
            type="button"
            onClick={() => setViewMode('classic')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'classic'
                ? 'bg-charcoal-800 text-cream-50 shadow-xs'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100/50'
            }`}
          >
            Классический
          </button>
          <button
            type="button"
            onClick={() => setViewMode('modern')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'modern'
                ? 'bg-camel-600 text-white shadow-xs'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100/50'
            }`}
          >
            <Sparkles className="h-3 w-3 text-cream-50" />
            <span>Обновлённый</span>
          </button>
        </div>
      </div>

      {monthGroups.map((group) => (
        <div key={group.key} className="mb-2">
          <div className="sticky top-2 z-10 mb-2 flex items-baseline justify-between rounded-lg bg-old-money-100 px-3.5 py-1.5 font-serif text-sm font-bold text-old-money-700 shadow-2xs">
            <span>{group.label}</span>
            <span className="font-mono text-xs font-normal text-charcoal-500">
              {group.events.length}{' '}
              {group.events.length === 1 ? 'событие' : group.events.length < 5 ? 'события' : 'событий'}
            </span>
          </div>
          {group.events.map((event) => (
            <div key={event.id} data-list-item>
              {viewMode === 'modern' ? (
                <EventListRowModern event={event} />
              ) : (
                <EventListRow event={event} />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
