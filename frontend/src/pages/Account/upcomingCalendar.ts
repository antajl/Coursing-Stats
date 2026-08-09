import { getEvents } from '../../lib/staticData'

export type UpcomingCalendarEvent = {
  id: string
  date_start: string
  title: string
  location: string
  event_type: string
  /** Extra text for soft breed matching */
  haystack: string
}

export function todayIso(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Whole calendar days from today (local) to YYYY-MM-DD. */
export function daysUntilDate(isoDate: string, today = todayIso()): number {
  const [y, m, d] = isoDate.split('-').map(Number)
  const [ty, tm, td] = today.split('-').map(Number)
  if (!y || !m || !d || !ty || !tm || !td) return Number.POSITIVE_INFINITY
  const target = Date.UTC(y, m - 1, d)
  const start = Date.UTC(ty, tm - 1, td)
  return Math.round((target - start) / 86_400_000)
}

function normalizeBreedToken(s: string): string {
  return s
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9]+/gi, ' ')
    .trim()
}

/** Soft match: breed name appears in event title/location/haystack. */
export function eventMatchesBreeds(
  event: Pick<UpcomingCalendarEvent, 'haystack'>,
  breeds: string[],
): boolean {
  if (breeds.length === 0) return true
  const hay = normalizeBreedToken(event.haystack)
  if (!hay) return false
  return breeds.some((b) => {
    const token = normalizeBreedToken(b)
    return token.length >= 3 && hay.includes(token)
  })
}

export function pickNearestUpcoming(
  events: UpcomingCalendarEvent[],
  opts: { breeds?: string[]; withinDays?: number; today?: string } = {},
): UpcomingCalendarEvent | null {
  const today = opts.today ?? todayIso()
  const within = opts.withinDays ?? 45
  const breeds = opts.breeds ?? []

  const future = events
    .filter((e) => e.date_start >= today)
    .filter((e) => daysUntilDate(e.date_start, today) <= within)
    .sort((a, b) => a.date_start.localeCompare(b.date_start))

  if (future.length === 0) return null

  const matched = breeds.length > 0 ? future.filter((e) => eventMatchesBreeds(e, breeds)) : future
  return matched[0] ?? future[0]
}

export async function loadUpcomingCalendarEvents(year?: number): Promise<UpcomingCalendarEvent[]> {
  const y = year ?? new Date().getFullYear()
  const res = await getEvents(String(y))
  if (!res.success || !res.data) return []

  return res.data
    .map((raw) => {
      const id = raw.id != null ? String(raw.id) : ''
      const date_start = typeof raw.date_start === 'string' ? raw.date_start : ''
      if (!id || !date_start) return null
      const title = typeof raw.title === 'string' ? raw.title : ''
      const location = typeof raw.location === 'string' ? raw.location : ''
      const event_type = typeof raw.event_type === 'string' ? raw.event_type : ''
      const rank = typeof raw.rank_label === 'string' ? raw.rank_label : ''
      return {
        id,
        date_start,
        title: title || 'Соревнование',
        location,
        event_type,
        haystack: [title, location, rank, event_type].filter(Boolean).join(' '),
      } satisfies UpcomingCalendarEvent
    })
    .filter((e): e is UpcomingCalendarEvent => e !== null)
}
