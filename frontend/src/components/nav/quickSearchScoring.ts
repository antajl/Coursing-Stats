import { canonicalBreed, displayBreed } from '../../lib/breedMapping'
import {
  dogNameMatchesQuery,
  dogNameSearchText,
  dogQuerySearchTokens,
  parseDogName,
  transliterateCyrillicToLatin,
} from '../../lib/dogName'
import type {
  BreedHubSearchItem,
  CalendarSearchEvent,
  HomeSearchDog,
  NavigationRouteItem,
  SearchItem,
} from './quickSearchTypes'
import { BREED_HUBS, SITE_NAVIGATION_ROUTES } from './quickSearchData'

export function normalizeText(q: string): string {
  return q
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9\s'-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function scoreNavigation(item: NavigationRouteItem, q: string): number {
  const qClean = normalizeText(q)
  if (!qClean) return 0

  const title = normalizeText(item.title)
  const subtitle = normalizeText(item.subtitle)

  if (title === qClean) return 110
  for (const kw of item.keywords) {
    if (kw === qClean) return 105
  }

  if (title.startsWith(qClean) || title.includes(` ${qClean}`)) return 95
  for (const kw of item.keywords) {
    if (kw.startsWith(qClean) || kw.includes(` ${qClean}`)) return 90
  }

  if (title.includes(qClean)) return 85
  for (const kw of item.keywords) {
    if (kw.includes(qClean)) return 80
  }

  if (subtitle.includes(qClean)) return 60
  return 0
}

export function scoreBreedHub(hub: BreedHubSearchItem, q: string): number {
  const qClean = normalizeText(q)
  if (!qClean) return 0

  const nameRu = normalizeText(hub.nameRu)
  const nameLat = normalizeText(hub.nameLat)

  if (nameRu === qClean || nameLat === qClean) return 110
  for (const kw of hub.keywords) {
    if (kw === qClean) return 105
  }

  if (nameRu.startsWith(qClean) || nameLat.startsWith(qClean)) return 95
  for (const kw of hub.keywords) {
    if (kw.startsWith(qClean)) return 90
  }

  if (nameRu.includes(qClean) || nameLat.includes(qClean)) return 80
  for (const kw of hub.keywords) {
    if (kw.includes(qClean)) return 75
  }

  return 0
}

export function dogDedupeKey(dog: HomeSearchDog): string {
  const { primary } = parseDogName(dog.name_lat, dog.name_ru)
  const base = primary.split('/')[0]?.trim() || ''
  const lat = transliterateCyrillicToLatin(base)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
  const breed = canonicalBreed(dog.breed || '')
  return `${lat}|${breed}`
}

export function scoreDog(dog: HomeSearchDog, q: string): number {
  if (!q.trim()) return 0
  const breedQ = normalizeText(q)
  const breed = normalizeText(dog.breed || '')
  const display = dog.breed ? displayBreed(dog.breed) : null
  const displayPrimary = display?.primary ? normalizeText(display.primary) : ''
  const displaySecondary = display?.secondary ? normalizeText(display.secondary) : ''
  const breedHit =
    breedQ.length >= 2 &&
    (breed.includes(breedQ) ||
      (displayPrimary && displayPrimary.includes(breedQ)) ||
      (displaySecondary && displaySecondary.includes(breedQ)))

  if (!dogNameMatchesQuery(dog.name_lat, dog.name_ru, q) && !breedHit) return 0

  const hay = dogNameSearchText(dog.name_lat, dog.name_ru)
  const tokens = dogQuerySearchTokens(q)
  let best = breedHit ? 35 : 0
  for (const token of tokens) {
    if (hay === token) best = Math.max(best, 100)
    else if (hay.startsWith(token) || hay.includes(` ${token}`)) best = Math.max(best, 80)
    else if (hay.includes(token)) best = Math.max(best, 55)
  }
  return best
}

export function scoreEvent(event: CalendarSearchEvent, q: string): number {
  const qClean = normalizeText(q)
  if (!qClean || qClean.length < 2) return 0
  const title = normalizeText(event.title || '')
  const loc = normalizeText(event.location || '')
  const rank = normalizeText(event.rank_code || '')
  const yearStr = String(event.year || '')

  if (title.includes(qClean)) return 90
  if (loc.includes(qClean)) return 70
  if (rank.includes(qClean)) return 60
  if (yearStr === qClean) return 50
  return 0
}

export interface SearchMatchResults {
  navItems: { type: 'nav'; item: NavigationRouteItem; score: number }[]
  breedItems: { type: 'breed'; item: BreedHubSearchItem; score: number }[]
  dogItems: { type: 'dog'; dog: HomeSearchDog; score: number }[]
  eventItems: { type: 'event'; event: CalendarSearchEvent; score: number }[]
  allItems: SearchItem[]
}

/** Выполняет поиск по всем категориям и возвращает сгруппированные результаты */
export function computeSearchResults(
  query: string,
  dogs: HomeSearchDog[] | null,
  events: CalendarSearchEvent[] | null,
): SearchMatchResults {
  const q = query.trim()
  if (!q) {
    return { navItems: [], breedItems: [], dogItems: [], eventItems: [], allItems: [] }
  }

  // 1. Match Navigation sections
  const matchedNav = SITE_NAVIGATION_ROUTES.map((route) => ({
    type: 'nav' as const,
    item: route,
    score: scoreNavigation(route, q),
  }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  // 2. Match Breed Hubs
  const matchedBreeds = BREED_HUBS.map((hub) => ({
    type: 'breed' as const,
    item: hub,
    score: scoreBreedHub(hub, q),
  }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  // 3. Match Dogs (only if query >= 2 chars)
  let matchedDogs: { type: 'dog'; dog: HomeSearchDog; score: number }[] = []
  if (q.length >= 2 && dogs) {
    const bestByKey = new Map<string, { dog: HomeSearchDog; score: number }>()
    for (const dog of dogs) {
      if (!dog.id || /^\d+$/.test(String(dog.breed || ''))) continue
      const s = scoreDog(dog, q)
      if (s <= 0) continue
      const key = dogDedupeKey(dog)
      const prev = bestByKey.get(key)
      if (
        !prev ||
        s > prev.score ||
        (s === prev.score && (dog.competition_count || 0) > (prev.dog.competition_count || 0)) ||
        (s === prev.score &&
          (dog.competition_count || 0) === (prev.dog.competition_count || 0) &&
          dog.id < prev.dog.id)
      ) {
        bestByKey.set(key, { dog, score: s })
      }
    }
    matchedDogs = [...bestByKey.values()]
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return (b.dog.competition_count || 0) - (a.dog.competition_count || 0)
      })
      .slice(0, 6)
      .map((x) => ({ type: 'dog' as const, dog: x.dog, score: x.score }))
  }

  // 4. Match Events (only if query >= 2 chars)
  let matchedEvents: { type: 'event'; event: CalendarSearchEvent; score: number }[] = []
  if (q.length >= 2 && events) {
    matchedEvents = events
      .map((ev) => ({ type: 'event' as const, event: ev, score: scoreEvent(ev, q) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return (b.event.year || 0) - (a.event.year || 0)
      })
      .slice(0, 3)
  }

  const combined: SearchItem[] = [
    ...matchedNav,
    ...matchedBreeds,
    ...matchedDogs,
    ...matchedEvents,
  ]

  return {
    navItems: matchedNav,
    breedItems: matchedBreeds,
    dogItems: matchedDogs,
    eventItems: matchedEvents,
    allItems: combined,
  }
}
