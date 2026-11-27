import { useEffect, useState } from 'react'
import { getShowRkfCalendar, type ShowRkfCalendarEntry } from '../../../lib/staticData/shows'
import type { CumulativeTitle } from '../../../lib/cumulativeTitles'
import {
  resolveTitleUpcomingNeeds,
  selectUpcomingEventsForTitle,
  type SportCalendarEventRaw,
  type TitleUpcomingResult,
  type UpcomingTitleEventLink,
} from './upcomingTitleEventsHelpers'

export type { UpcomingTitleEventLink, TitleUpcomingResult }

/**
 * Лениво подбирает ближайшие подходящие мероприятия календаря для незакрытых титулов
 * только после раскрытия хотя бы одной карточки «В шаге от титула».
 */
export function useUpcomingTitleEvents(
  hasExpandedCard: boolean,
  titles: CumulativeTitle[],
  breed?: string,
): Record<string, TitleUpcomingResult> {
  const [sportEvents, setSportEvents] = useState<SportCalendarEventRaw[] | null>(null)
  const [showEvents, setShowEvents] = useState<ShowRkfCalendarEntry[] | null>(null)

  const resolvedNeeds = titles.map((t) => resolveTitleUpcomingNeeds(t, titles))
  const needsSport = hasExpandedCard && resolvedNeeds.some((n) => n.sportNeeds.length > 0)
  const needsShow = hasExpandedCard && resolvedNeeds.some((n) => n.showNeeds.length > 0)

  useEffect(() => {
    if (!needsSport || sportEvents !== null) return
    let cancelled = false
    fetch('/data/v1/calendar/2027.json')
      .then((r) => (r.ok ? r.json() : { events: [] }))
      .then((json) => {
        if (!cancelled) {
          setSportEvents(Array.isArray(json?.events) ? json.events : [])
        }
      })
      .catch(() => {
        if (!cancelled) setSportEvents([])
      })
    return () => {
      cancelled = true
    }
  }, [needsSport, sportEvents])

  useEffect(() => {
    if (!needsShow || showEvents !== null) return
    let cancelled = false
    getShowRkfCalendar('2026')
      .then((res) => {
        if (!cancelled) {
          setShowEvents(res.success && res.data ? res.data : [])
        }
      })
      .catch(() => {
        if (!cancelled) setShowEvents([])
      })
    return () => {
      cancelled = true
    }
  }, [needsShow, showEvents])

  const todayIso = new Date().toISOString().slice(0, 10)
  const result: Record<string, TitleUpcomingResult> = {}

  for (const title of titles) {
    result[title.id] = selectUpcomingEventsForTitle(title, titles, {
      sportEvents,
      showEvents,
      breed,
      todayIso,
    })
  }

  return result
}
