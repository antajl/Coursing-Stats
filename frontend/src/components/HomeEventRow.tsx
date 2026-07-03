import { Link } from 'react-router-dom'
import { Icons } from '../lib/icons'
import {
  type CalendarEvent,
  DISCIPLINE_BORDER,
  formatRowDateParts,
  getEventHeadline,
  isImportantCompetition,
} from '../pages/Events/eventListUtils'

interface HomeEventRowProps {
  event: CalendarEvent
  compact?: boolean
}

export default function HomeEventRow({ event, compact = false }: HomeEventRowProps) {
  const eventType = event.event_type || 'other'
  const borderClass = DISCIPLINE_BORDER[eventType] || DISCIPLINE_BORDER.default
  const dateParts = formatRowDateParts(event.date_start, event.date_end)
  const important = isImportantCompetition(event.competition_kind)
  const TrophyIcon = Icons.championship

  return (
    <Link
      to={`/event/${event.id}`}
      className={`home-event-row border-l-4 ${borderClass} ${
        important ? 'home-event-row--champ' : ''
      } ${compact ? 'home-event-row--compact' : ''}`}
    >
      <div className="home-event-row-date shrink-0 text-sm leading-tight text-charcoal-900 dark:text-charcoal-100">
        {dateParts ? (
          <>
            <span className="block whitespace-nowrap font-semibold tabular-nums">{dateParts.dayLine}</span>
            {!compact && (
              <span className="block whitespace-nowrap text-[11px] text-charcoal-500 dark:text-charcoal-400">
                {dateParts.metaLine}
              </span>
            )}
          </>
        ) : (
          '—'
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {important && (
            <TrophyIcon className="h-3 w-3 shrink-0 text-camel-600 dark:text-camel-400" strokeWidth={2} />
          )}
          <span className="truncate text-xs font-semibold text-charcoal-900 dark:text-charcoal-100">
            {getEventHeadline(event)}
          </span>
        </div>
        {event.location && (
          <p className="mt-0.5 truncate text-[11px] text-charcoal-500 dark:text-charcoal-400">
            {event.location}
          </p>
        )}
      </div>
    </Link>
  )
}
