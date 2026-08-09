import { Link } from 'react-router-dom'
import type { FavoriteDog, FavoriteLastEvent } from './accountFavorites'
import type { UpcomingCalendarEvent } from './upcomingCalendar'
import { daysUntilDate } from './upcomingCalendar'

function formatRuDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function eventTypeLabel(t: string | null | undefined): string | null {
  if (!t) return null
  const lower = t.toLowerCase()
  if (lower.includes('cours') || lower === 'c') return 'Курсинг'
  if (lower.includes('rac') || lower === 'r') return 'Бега'
  if (lower.includes('bzmp') || lower === 'b') return 'БЗМП'
  return t
}

type EventHighlightsProps = {
  upcoming: UpcomingCalendarEvent | null
  last: { dog: FavoriteDog; event: FavoriteLastEvent } | null
  calendarLoading?: boolean
}

export function EventHighlights({ upcoming, last, calendarLoading }: EventHighlightsProps) {
  if (!upcoming && !last && !calendarLoading) return null

  const days = upcoming ? daysUntilDate(upcoming.date_start) : null

  return (
    <section className="mb-10 grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-charcoal-200 dark:border-charcoal-700 bg-white/60 dark:bg-charcoal-800/50 px-4 py-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal-500 dark:text-charcoal-400 mb-3">
          Ближайшее событие
        </h2>
        {calendarLoading ? (
          <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Загрузка календаря…</p>
        ) : upcoming ? (
          <>
            <p className="text-2xl font-bold tabular-nums text-charcoal-900 dark:text-cream-100">
              {formatRuDate(upcoming.date_start)}
            </p>
            {days != null && days >= 0 && days <= 45 && (
              <p className="mt-1 text-xs text-charcoal-500 dark:text-charcoal-400">
                {days === 0 ? 'Сегодня' : days === 1 ? 'Завтра' : `Через ${days} дн.`}
                {' · '}
                по календарю
              </p>
            )}
            {eventTypeLabel(upcoming.event_type) && (
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-camel-800 dark:text-camel-300">
                {eventTypeLabel(upcoming.event_type)}
              </p>
            )}
            <p className="mt-1 text-sm font-medium text-charcoal-800 dark:text-cream-100 line-clamp-2">
              {upcoming.title}
            </p>
            {upcoming.location && (
              <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">{upcoming.location}</p>
            )}
            <Link
              to="/competitions?tab=calendar"
              className="mt-4 inline-flex text-sm font-medium text-camel-800 dark:text-camel-300 hover:underline"
            >
              Открыть календарь →
            </Link>
          </>
        ) : (
          <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
            Ближайших соревнований в календаре пока нет.{' '}
            <Link to="/competitions?tab=calendar" className="text-camel-800 dark:text-camel-300 hover:underline">
              Календарь
            </Link>
          </p>
        )}
      </div>

      <div className="rounded-xl border border-charcoal-200 dark:border-charcoal-700 bg-white/60 dark:bg-charcoal-800/50 px-4 py-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal-500 dark:text-charcoal-400 mb-3">
          Последний результат
        </h2>
        {last ? (
          <>
            {last.event.placement != null ? (
              <p className="text-2xl font-bold text-charcoal-900 dark:text-cream-100">
                {last.event.placement === 1
                  ? '🥇 1 место'
                  : last.event.placement === 2
                    ? '🥈 2 место'
                    : last.event.placement === 3
                      ? '🥉 3 место'
                      : `${last.event.placement} место`}
              </p>
            ) : (
              <p className="text-2xl font-bold text-charcoal-900 dark:text-cream-100">Участие</p>
            )}
            <p className="mt-2 text-sm text-charcoal-500 dark:text-charcoal-400">
              {formatRuDate(last.event.date_start)}
            </p>
            <p className="mt-3 text-sm font-medium text-charcoal-800 dark:text-cream-100 line-clamp-2">
              {last.event.title}
            </p>
            <Link
              to={`/dog/${last.dog.id}`}
              className="mt-1 block text-sm text-charcoal-600 dark:text-cream-300 hover:text-camel-700 dark:hover:text-camel-300 truncate"
            >
              {last.dog.name_lat}
            </Link>
            <Link
              to={`/event/${last.event.event_id}`}
              className="mt-4 inline-flex text-sm font-medium text-camel-800 dark:text-camel-300 hover:underline"
            >
              Открыть протокол →
            </Link>
          </>
        ) : (
          <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
            Пока нет результатов у избранных собак.
          </p>
        )}
      </div>
    </section>
  )
}
