import EventListRow from './EventListRow'
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

  return (
    <div ref={listRevealRef}>
      {monthGroups.map((group) => (
        <div key={group.key} className="mb-1.5">
          <div className="sticky top-2 z-10 mb-1.5 flex items-baseline justify-between rounded-lg bg-old-money-100 dark:bg-charcoal-800 px-3.5 py-1.5 font-serif text-sm font-bold text-old-money-700 dark:text-old-money-300">
            <span>{group.label}</span>
            <span className="font-mono text-xs font-normal text-charcoal-500 dark:text-charcoal-300">
              {group.events.length}{' '}
              {group.events.length === 1 ? 'событие' : group.events.length < 5 ? 'события' : 'событий'}
            </span>
          </div>
          {group.events.map((event) => (
            <div key={event.id} data-list-item>
              <EventListRow event={event} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
