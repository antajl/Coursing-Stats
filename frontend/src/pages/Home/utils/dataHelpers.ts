import type { CalendarEvent } from '../../Events/eventListUtils'
import type { ShowRkfCalendarEntry } from '../../../lib/staticData'

export function pickFeaturedEvents(events: CalendarEvent[], count = 3): CalendarEvent[] {
  const dated = events
    .filter((e) => e.date_start)
    .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime())

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcoming = dated.filter((e) => new Date(e.date_start) >= today)
  const past = dated.filter((e) => new Date(e.date_start) < today).reverse()

  const combined = [...upcoming]
  for (const event of past) {
    if (combined.length >= count) break
    combined.push(event)
  }
  return combined.slice(0, count)
}

export function pickFeaturedShows(shows: ShowRkfCalendarEntry[], count = 3): ShowRkfCalendarEntry[] {
  const dated = shows
    .filter((s) => s.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcoming = dated.filter((s) => new Date(s.date) >= today)
  const past = dated.filter((s) => new Date(s.date) < today).reverse()

  const combined = [...upcoming]
  for (const show of past) {
    if (combined.length >= count) break
    combined.push(show)
  }
  return combined.slice(0, count)
}
