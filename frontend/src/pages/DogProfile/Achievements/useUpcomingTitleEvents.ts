import { useEffect, useState } from 'react'
import { getShowRkfCalendar, type ShowRkfCalendarEntry } from '../../../lib/staticData/shows'
import type { CumulativeTitle } from '../../../lib/cumulativeTitles'
import { canonicalBreed } from '../../../lib/breedMapping'

export interface UpcomingTitleEventLink {
  id: string
  title: string
  dateLabel: string
  location?: string
  to: string
  kindLabel: string
}

interface SportCalendarEventRaw {
  id: number | string
  date_start?: string
  title?: string
  event_type?: string
  competition_kind?: string
  location?: string
  region?: string
}

function parseRuDateToIso(ruDate: string): string {
  const [dd, mm, yyyy] = (ruDate || '').split('.')
  if (!dd || !mm || !yyyy) return ''
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
}

function formatIsoDateShort(iso: string): string {
  const [yyyy, mm, dd] = iso.split('-')
  if (!yyyy || !mm || !dd) return iso
  return `${dd}.${mm}.${yyyy}`
}

function matchesBreedHint(eventText: string, dogBreed?: string): boolean {
  if (!dogBreed) return true
  const canonical = canonicalBreed(dogBreed).toLowerCase()
  const lower = eventText.toLowerCase()
  // Mono/breed-specific events include breed keyword; open events apply to all breeds
  if (canonical.includes('басенджи') && lower.includes('борз') && !lower.includes('басенджи')) {
    return false
  }
  return true
}

/**
 * Лениво подбирает ближайшие подходящие старты календаря для незакрытых титулов
 * только после раскрытия хотя бы одной карточки «В шаге от титула».
 */
export function useUpcomingTitleEvents(
  hasExpandedCard: boolean,
  titles: CumulativeTitle[],
  breed?: string,
): Record<string, UpcomingTitleEventLink[]> {
  const [sportEvents, setSportEvents] = useState<SportCalendarEventRaw[] | null>(null)
  const [showEvents, setShowEvents] = useState<ShowRkfCalendarEntry[] | null>(null)

  const needsSport = hasExpandedCard && titles.some((t) => t.domain === 'sport' || t.domain === 'supreme')
  const needsShow = hasExpandedCard && titles.some((t) => t.domain === 'show' || t.domain === 'supreme')

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
  const result: Record<string, UpcomingTitleEventLink[]> = {}

  for (const title of titles) {
    const matches: UpcomingTitleEventLink[] = []
    const titleIdLower = title.id.toLowerCase()

    if ((title.domain === 'sport' || title.domain === 'supreme') && sportEvents) {
      const wantsRacing = titleIdLower.includes('bb') || titleIdLower.includes('rac')
      const wantsCoursing = titleIdLower.includes('kb') || titleIdLower.includes('cours') || !wantsRacing
      const upcomingSport = sportEvents
        .filter((ev) => (ev.date_start || '') >= todayIso)
        .filter((ev) => {
          const isRacing = ev.event_type === 'racing'
          if (wantsRacing && !wantsCoursing) return isRacing
          if (wantsCoursing && !wantsRacing) return !isRacing
          return true
        })
        .filter((ev) => matchesBreedHint(`${ev.title || ''} ${ev.competition_kind || ''}`, breed))
        .sort((a, b) => (a.date_start || '').localeCompare(b.date_start || ''))
        .slice(0, 2)

      for (const ev of upcomingSport) {
        matches.push({
          id: `sport-${ev.id}`,
          title: ev.title || 'Состязание РКФ',
          dateLabel: ev.date_start ? formatIsoDateShort(ev.date_start) : '',
          location: ev.location || ev.region || undefined,
          to: '/tracker/?tab=competitions',
          kindLabel: ev.event_type === 'racing' ? 'Рейсинг' : 'Курсинг',
        })
      }
    }

    if ((title.domain === 'show' || title.domain === 'supreme') && showEvents) {
      const upcomingShows = showEvents
        .map((sh) => ({ sh, iso: parseRuDateToIso(sh.date) }))
        .filter(({ iso }) => iso >= todayIso)
        .sort((a, b) => a.iso.localeCompare(b.iso))
        .slice(0, 2)

      for (const { sh } of upcomingShows) {
        matches.push({
          id: `show-${sh.id}`,
          title: sh.title || 'Выставка РКФ',
          dateLabel: sh.date || '',
          location: sh.location || undefined,
          to: `/shows/exhibition/${sh.id}/`,
          kindLabel: sh.rank || 'Выставка РКФ',
        })
      }
    }

    result[title.id] = matches.slice(0, 3)
  }

  return result
}
