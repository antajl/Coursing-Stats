import { Link } from 'react-router-dom'
import { Icons } from '../lib/icons'
import {
  type CalendarEvent,
  DISCIPLINE_BORDER,
  getEventDiscipline,
  formatRowDateParts,
  getEventHeadline,
  isImportantCompetition,
} from '../pages/Events/eventListUtils'

type HomeEventRowVariant = 'default' | 'compact'

interface HomeEventRowProps {
  event: CalendarEvent
  variant?: HomeEventRowVariant
}

export default function HomeEventRow({ event, variant = 'default' }: HomeEventRowProps) {
  const eventType = getEventDiscipline(event)
  const borderClass = DISCIPLINE_BORDER[eventType] || DISCIPLINE_BORDER.default
  const dateParts = formatRowDateParts(event.date_start, event.date_end)
  const important = isImportantCompetition(event.competition_kind)
  const TrophyIcon = Icons.championship

  const className = `home-event-row border-l-4 ${borderClass} ${
    important ? 'home-event-row--champ' : ''
  } ${variant === 'compact' ? 'home-event-row--compact' : ''}`

  return (
    <Link
      to={`/event/${event.id}/`}
      className={className}
      title={getEventHeadline(event)}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {important && (
            <TrophyIcon className="h-3 w-3 shrink-0 text-camel-600" strokeWidth={2} />
          )}
          <span className="truncate text-xs font-semibold text-charcoal-900">
            {getEventHeadline(event)}
          </span>
        </div>
        {event.location && (
          <p className="mt-0.5 truncate text-[11px] text-charcoal-500">
            {event.location}
          </p>
        )}
      </div>
      <div className="home-event-row-date shrink-0 text-sm leading-tight text-charcoal-900">
        {dateParts ? (
          <>
            <span className="block whitespace-nowrap font-semibold tabular-nums">{dateParts.dayLine}</span>
            {variant === 'compact' ? (
              <span className="block whitespace-nowrap text-[11px] text-charcoal-500">
                {dateParts.month}
              </span>
            ) : (
              <span className="block whitespace-nowrap text-[11px] text-charcoal-500">
                {dateParts.metaLine}
              </span>
            )}
          </>
        ) : (
          '—'
        )}
      </div>
    </Link>
  )
}
