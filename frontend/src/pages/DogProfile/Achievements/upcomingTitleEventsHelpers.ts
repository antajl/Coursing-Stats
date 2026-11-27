import type { ShowRkfCalendarEntry } from '../../../lib/staticData/shows'
import type { CumulativeTitle } from '../../../lib/cumulativeTitles'
import { breedToSlug, canonicalBreed, matchesBreedFilter } from '../../../lib/breedMapping'
import { getBreedFciGroup } from '../../../lib/fciGroups'
import {
  resolveTitleUpcomingNeeds,
  type ShowNeedKind,
  type SportNeed,
  type SportRankNeed,
} from './upcomingTitleNeeds'

export { resolveTitleUpcomingNeeds }

export interface UpcomingTitleEventLink {
  id: string
  title: string
  dateLabel: string
  location?: string
  to: string
  kindLabel: string
}

export interface SportCalendarEventRaw {
  id: number | string
  date_start?: string
  title?: string
  event_type?: string
  competition_kind?: string
  location?: string
  region?: string
}

export interface TitleUpcomingResult {
  matches: UpcomingTitleEventLink[]
  calendarKind: 'show' | 'sport' | 'both'
}

export function parseRuDateToIso(ruDate: string): string {
  const [dd, mm, yyyy] = (ruDate || '').split('.')
  if (!dd || !mm || !yyyy) return ''
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
}

export function formatIsoDateShort(iso: string): string {
  const [yyyy, mm, dd] = iso.split('-')
  if (!yyyy || !mm || !dd) return iso
  return `${dd}.${mm}.${yyyy}`
}

function getDogFciGroup(dogBreed?: string): number {
  if (!dogBreed) return 0
  const slug = breedToSlug(dogBreed)
  if (!slug || slug === dogBreed) return 0
  return getBreedFciGroup(slug)
}

function matchesShowBreed(sh: ShowRkfCalendarEntry, dogBreed?: string): boolean {
  if (!dogBreed) return true
  if (sh.breeds && sh.breeds.trim()) {
    return sh.breeds
      .split(/[,;]+/)
      .map((b) => b.trim())
      .filter(Boolean)
      .some((b) => matchesBreedFilter(b, dogBreed))
  }
  if (sh.national_breed_club_name && sh.national_breed_club_name.trim()) {
    const cleaned = sh.national_breed_club_name.replace(/^НКП\s+/i, '').trim()
    if (matchesBreedFilter(cleaned, dogBreed)) return true
    const canon = canonicalBreed(dogBreed)
    return Boolean(canon && cleaned.toUpperCase().includes(canon))
  }
  const canon = canonicalBreed(dogBreed)
  return Boolean(canon && (sh.title || '').toUpperCase().includes(canon))
}

function matchesShowNeed(sh: ShowRkfCalendarEntry, need: ShowNeedKind, dogBreed?: string, dogGroup = 0): boolean {
  const rank = (sh.ranks ?? sh.rank ?? '').trim()
  const title = sh.title || ''
  const givesKchk = /кчк|кчп|победитель клуба/i.test(rank)
  const isMonoOnly = givesKchk || /^пп$/i.test(rank) || /монопородн/i.test(title)

  const groupMatch = rank.match(/(\d+)\s*гр\./i)
  if (groupMatch && dogGroup > 0 && Number(groupMatch[1]) !== dogGroup) {
    return false
  }

  if (need === 'kchk') {
    return givesKchk && matchesShowBreed(sh, dogBreed)
  }
  if (need === 'cac') {
    if (isMonoOnly) return false
    if (/без\s*(?:cac|сас)/i.test(rank)) return false
    return /cac|сас|чркф/i.test(rank)
  }
  if (need === 'chrkf') {
    if (isMonoOnly) return false
    return /чркф|чф/i.test(rank)
  }
  if (need === 'cacib') {
    return /cacib|особым статусом/i.test(`${rank} ${title}`)
  }
  return false
}

function matchesSportNeed(ev: SportCalendarEventRaw, need: SportNeed, dogBreed?: string, dogGroup = 0): boolean {
  if (ev.event_type === 'racing' && need.discipline !== 'racing') return false
  if (ev.event_type === 'coursing' && need.discipline !== 'coursing') return false
  if (ev.event_type === 'bzmp') {
    if (need.discipline !== 'coursing' || dogGroup === 10) return false
  }

  const rawKind = `${ev.competition_kind || ''} ${ev.title || ''}`.trim()
  const monoBreedMatch = rawKind.match(/пчркф\s*[—–-]\s*([^\n(]+)/i)
  let eventRank: SportRankNeed = 'cacl'
  if (monoBreedMatch) {
    eventRank = 'pchrkf'
    if (dogBreed && !matchesBreedFilter(monoBreedMatch[1]!.trim(), dogBreed)) {
      return false
    }
  } else if (/монопородн/i.test(rawKind)) {
    eventRank = 'pchrkf'
  } else if (/чемпионат россии/i.test(rawKind)) {
    eventRank = 'chr'
  } else if (/кубок россии/i.test(rawKind)) {
    eventRank = 'pkr'
  } else if (/чркф/i.test(rawKind)) {
    eventRank = 'chrkf'
  } else if (/cacil/i.test(rawKind)) {
    eventRank = 'cacil'
  }

  if (dogBreed) {
    const canon = canonicalBreed(dogBreed).toLowerCase()
    const lower = rawKind.toLowerCase()
    if (canon.includes('басенджи') && lower.includes('борз') && !lower.includes('басенджи')) {
      return false
    }
  }

  if (eventRank === 'pchrkf') {
    return need.ranks.includes('pchrkf')
  }
  if (eventRank === 'chr') {
    return need.ranks.includes('chr') || need.ranks.includes('cacl') || need.ranks.includes('pchrkf')
  }
  if (eventRank === 'pkr') {
    return need.ranks.includes('pkr') || need.ranks.includes('cacl')
  }
  if (eventRank === 'chrkf') {
    return need.ranks.includes('chrkf') || need.ranks.includes('cacl')
  }
  return need.ranks.includes(eventRank)
}

export function selectUpcomingEventsForTitle(
  title: CumulativeTitle,
  allTitles: CumulativeTitle[],
  opts: {
    sportEvents: SportCalendarEventRaw[] | null
    showEvents: ShowRkfCalendarEntry[] | null
    breed?: string
    todayIso: string
  },
): TitleUpcomingResult {
  const needs = resolveTitleUpcomingNeeds(title, allTitles)
  const dogGroup = getDogFciGroup(opts.breed)
  const matches: UpcomingTitleEventLink[] = []

  if (needs.sportNeeds.length > 0 && opts.sportEvents) {
    const upcomingSport = opts.sportEvents
      .filter((ev) => (ev.date_start || '') >= opts.todayIso)
      .filter((ev) => needs.sportNeeds.some((need) => matchesSportNeed(ev, need, opts.breed, dogGroup)))
      .sort((a, b) => (a.date_start || '').localeCompare(b.date_start || ''))
      .slice(0, 3)

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

  if (needs.showNeeds.length > 0 && opts.showEvents) {
    const upcomingShows = opts.showEvents
      .map((sh) => ({ sh, iso: parseRuDateToIso(sh.date) }))
      .filter(({ iso }) => iso >= opts.todayIso)
      .filter(({ sh }) => needs.showNeeds.some((need) => matchesShowNeed(sh, need, opts.breed, dogGroup)))
      .sort((a, b) => a.iso.localeCompare(b.iso))
      .slice(0, 3)

    for (const { sh } of upcomingShows) {
      matches.push({
        id: `show-${sh.id}`,
        title: sh.title || 'Выставка РКФ',
        dateLabel: sh.date || '',
        location: sh.location || undefined,
        to: `/shows/exhibition/${sh.id}/`,
        kindLabel: sh.rank || sh.ranks || 'Выставка РКФ',
      })
    }
  }

  return {
    matches: matches.slice(0, 3),
    calendarKind: needs.calendarKind,
  }
}
