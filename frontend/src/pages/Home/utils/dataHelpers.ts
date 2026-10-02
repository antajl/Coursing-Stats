import type { CalendarEvent } from '../../Events/eventListUtils'
import type { ShowRkfCalendarEntry } from '../../../lib/staticData'

export function pickFeaturedEvents(events: CalendarEvent[], count = 3): CalendarEvent[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Прошедшие события с готовым протоколом — сортируем от новых к старым
  const pastWithResults = events
    .filter((e) => e.date_start && new Date(e.date_start) < today && e.has_results)
    .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime())

  if (pastWithResults.length >= count) {
    return pastWithResults.slice(0, count)
  }

  // Если мало событий с результатами — добираем любые прошедшие
  const pastAny = events
    .filter((e) => e.date_start && new Date(e.date_start) < today && !e.has_results)
    .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime())

  return [...pastWithResults, ...pastAny].slice(0, count)
}

export function pickFeaturedShows(shows: ShowRkfCalendarEntry[], count = 3): ShowRkfCalendarEntry[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Прошедшие выставки у которых есть протокол (LC или отчёт РКФ) — от новых к старым
  const pastWithProtocol = shows
    .filter((s) => s.date && new Date(s.date) < today && (s.has_lc_protocol || s.has_report_link))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (pastWithProtocol.length >= count) {
    return pastWithProtocol.slice(0, count)
  }

  // Если мало — добираем любые прошедшие
  const pastAny = shows
    .filter((s) => s.date && new Date(s.date) < today && !s.has_lc_protocol && !s.has_report_link)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return [...pastWithProtocol, ...pastAny].slice(0, count)
}
