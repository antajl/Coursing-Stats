import { Link } from 'react-router-dom'
import { Icons } from '../../lib/icons'
import {
  type CalendarEvent,
  DISCIPLINE_BORDER,
  formatRowDateParts,
  getEventHeadline,
  getEventMeta,
  isEventCancelled,
  isImportantCompetition,
  parseJudgeNames,
} from './eventListUtils'

interface EventListRowProps {
  event: CalendarEvent
}

export default function EventListRow({ event }: EventListRowProps) {
  const important = isImportantCompetition(event.competition_kind)
  const eventType = event.event_type || 'other'
  const borderClass = DISCIPLINE_BORDER[eventType] || DISCIPLINE_BORDER.default
  const dateParts = formatRowDateParts(event.date_start, event.date_end)
  const judgeNames = parseJudgeNames(event.judges)
  const participants = event.participants_count ?? 0
  const visibleJudges = judgeNames.slice(0, 4)
  const extraJudges = judgeNames.length - visibleJudges.length
  const cancelled = isEventCancelled(event)
  const TrophyIcon = Icons.championship
  const PawIcon = Icons.paw

  const showJudgesColumn = visibleJudges.length > 0

  const participantsBadge =
    participants > 0 ? (
      <span
        className="hidden sm:inline-flex h-5 w-14 shrink-0 items-center justify-center gap-1 rounded-md bg-old-money-100/90 px-1 font-mono text-xs font-semibold tabular-nums text-charcoal-600 dark:bg-charcoal-700/90 dark:text-charcoal-200"
        title="Участников"
      >
        <PawIcon className="h-3.5 w-3.5 shrink-0 text-charcoal-400 dark:text-charcoal-400" strokeWidth={1.75} />
        {participants}
      </span>
    ) : null

  return (
    <Link
      to={`/event/${event.id}`}
      className={`grid grid-cols-[4.5rem_minmax(0,1fr)] ${
        showJudgesColumn ? 'sm:grid-cols-[5rem_minmax(0,1fr)_9.5rem]' : 'sm:grid-cols-[5rem_minmax(0,1fr)]'
      } items-center gap-3 sm:gap-4 rounded-[10px] border border-old-money-200 dark:border-charcoal-600 border-l-4 ${borderClass} bg-cream-50 dark:bg-charcoal-800 px-3 py-2.5 sm:px-3 sm:py-2.5 mb-1.5 transition-colors hover:bg-camel-100 dark:hover:bg-charcoal-700 hover:translate-x-0.5 ${
        cancelled ? 'opacity-70' : ''
      } ${
        important
          ? 'bg-gradient-to-r from-camel-100 to-cream-50 dark:from-camel-600/10 dark:to-charcoal-800 dark:hover:from-camel-600/15'
          : ''
      }`}
      aria-label="Открыть результаты"
    >
      <div className="w-[4.75rem] shrink-0 text-sm leading-tight text-charcoal-800 dark:text-charcoal-100 sm:w-[5rem]">
        {dateParts ? (
          <>
            <span className="block whitespace-nowrap font-semibold tabular-nums">{dateParts.dayLine}</span>
            <span className="block whitespace-nowrap text-xs text-charcoal-500 dark:text-charcoal-400">
              {dateParts.metaLine}
            </span>
          </>
        ) : (
          '—'
        )}
      </div>

      <div className="min-w-0">
        <div
          className={`flex items-center gap-1.5 text-[13.5px] font-semibold ${
            important ? 'font-serif text-camel-700 dark:text-camel-400' : 'text-charcoal-900 dark:text-charcoal-100'
          }`}
        >
          {important && <TrophyIcon className="h-3.5 w-3.5 shrink-0 text-camel-500" strokeWidth={1.75} />}
          {cancelled && (
            <span className="shrink-0 rounded-full bg-charcoal-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-charcoal-700 dark:bg-charcoal-600 dark:text-charcoal-200">
              Отменён
            </span>
          )}
          <span className="line-clamp-2 min-w-0 flex-1">{getEventHeadline(event)}</span>
          {participantsBadge}
        </div>
        {getEventMeta(event) && (
          <div className="text-xs text-charcoal-500 dark:text-charcoal-300 truncate mt-0.5">
            {getEventMeta(event)}
          </div>
        )}
      </div>

      {showJudgesColumn && (
        <div
          className="hidden sm:flex w-[9.5rem] shrink-0 flex-col items-end justify-center gap-0.5 self-stretch pl-3 border-l border-old-money-200/80 dark:border-charcoal-600/80"
          title={judgeNames.join(', ')}
        >
          {visibleJudges.map((name, index) => (
            <span
              key={`${name}-${index}`}
              className="w-full whitespace-nowrap text-right text-[11px] leading-tight text-charcoal-500 dark:text-charcoal-400"
            >
              {name}
            </span>
          ))}
          {extraJudges > 0 && (
            <span className="text-[10px] leading-tight text-charcoal-400 dark:text-charcoal-500">
              +{extraJudges}
            </span>
          )}
        </div>
      )}
    </Link>
  )
}
