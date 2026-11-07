import EventListRow from './EventListRow'
import type { CalendarEvent } from './eventListUtils'
import { useListReveal } from '../../hooks/useListReveal'

function formatEventsCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return `${count} событий`
  if (mod10 === 1) return `${count} событие`
  if (mod10 >= 2 && mod10 <= 4) return `${count} события`
  return `${count} событий`
}

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

  return (
    <div ref={listRevealRef} className="space-y-4">
      {monthGroups.map((group) => (
        <div key={group.key} className="min-w-0">
          <div className="cs-glass-card min-w-0 overflow-hidden rounded-2xl bg-white flex flex-col">
            <div className="relative flex h-10 min-h-10 items-center justify-between border-b border-[rgba(195,168,128,0.55)] bg-cream-100/90 px-3.5">
              <h2 className="relative z-[1] text-xs font-bold uppercase tracking-wider text-camel-800 truncate">
                {group.label}
              </h2>
              <span className="relative z-[1] ml-auto shrink-0 pl-2 text-xs font-semibold text-old-money-600">
                {formatEventsCount(group.events.length)}
              </span>
            </div>

            <div className="flex flex-col divide-y divide-old-money-100">
              {group.events.map((event) => (
                <div key={event.id} data-list-item className="relative">
                  <EventListRow event={event} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
