import { Link } from 'react-router-dom'
import type { ShowRkfCalendarEntry } from '../lib/staticData'
import { isLocalDev } from '../lib/env'
import { formatMonthShortRu } from '../pages/Events/eventListUtils'

function parseShowDate(dateStr: string): Date | null {
  if (!dateStr) return null
  const parts = dateStr.split('.')
  if (parts.length !== 3) return null
  const [day, month, year] = parts.map(Number)
  if (!day || !month || !year) return null
  return new Date(year, month - 1, day)
}

function formatShowRowDate(dateStr: string, dateEnd?: string): { dayLine: string; month: string } | null {
  const start = parseShowDate(dateStr)
  if (!start) return null
  const end = dateEnd ? parseShowDate(dateEnd) : null
  const month = formatMonthShortRu(start.getMonth())
  if (end && end.getTime() !== start.getTime()) {
    return {
      dayLine: `${start.getDate()}–${end.getDate()}`,
      month,
    }
  }
  return { dayLine: String(start.getDate()), month }
}

export function pickFeaturedShows(
  exhibitions: ShowRkfCalendarEntry[],
  count = 3,
): ShowRkfCalendarEntry[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const withDate = exhibitions
    .map((e) => ({ e, t: parseShowDate(e.date)?.getTime() ?? NaN }))
    .filter((x) => Number.isFinite(x.t))

  const upcoming = withDate
    .filter((x) => x.t! >= today.getTime())
    .sort((a, b) => a.t! - b.t!)
    .map((x) => x.e)

  if (upcoming.length >= count) return upcoming.slice(0, count)

  const past = withDate
    .filter((x) => x.t! < today.getTime())
    .sort((a, b) => b.t! - a.t!)
    .map((x) => x.e)

  const combined = [...upcoming]
  for (const ex of past) {
    if (combined.length >= count) break
    combined.push(ex)
  }
  return combined.slice(0, count)
}

interface HomeShowEventRowProps {
  exhibition: ShowRkfCalendarEntry
}

export default function HomeShowEventRow({ exhibition }: HomeShowEventRowProps) {
  const dateParts = formatShowRowDate(exhibition.date, exhibition.date_end)
  const place = exhibition.city || exhibition.location || ''
  const rank = (exhibition.ranks || exhibition.rank || '').split(',')[0]?.trim()
  const title = exhibition.title?.trim() || 'Выставка'
  const headline = rank ? `${rank} · ${title}` : title

  const className =
    'home-event-row home-event-row--compact border-l-4 border-l-camel-400 dark:border-l-camel-600'

  const content = (
    <>
      <div className="home-event-row-date shrink-0 text-sm leading-tight text-charcoal-900 dark:text-charcoal-100">
        {dateParts ? (
          <>
            <span className="block whitespace-nowrap font-semibold tabular-nums">{dateParts.dayLine}</span>
            <span className="block whitespace-nowrap text-[11px] text-charcoal-500 dark:text-charcoal-400">
              {dateParts.month}
            </span>
          </>
        ) : (
          '—'
        )}
      </div>
      <div className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold text-charcoal-900 dark:text-charcoal-100">
          {headline}
        </span>
        {place ? (
          <p className="mt-0.5 truncate text-[11px] text-charcoal-500 dark:text-charcoal-400">{place}</p>
        ) : null}
      </div>
    </>
  )

  if (isLocalDev) {
    return (
      <Link to={`/shows/exhibition/${exhibition.id}`} className={className} title={title}>
        {content}
      </Link>
    )
  }

  if (exhibition.url) {
    return (
      <a href={exhibition.url} target="_blank" rel="noopener noreferrer" className={className} title={title}>
        {content}
      </a>
    )
  }

  return (
    <Link to="/shows?tab=calendar" className={className} title={title}>
      {content}
    </Link>
  )
}
