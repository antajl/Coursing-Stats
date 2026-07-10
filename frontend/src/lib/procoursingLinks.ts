export function normalizeProcoursingUrl(url: string | null | undefined): string | null {
  const raw = (url || '').trim()
  if (!raw) return null
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  return `http://procoursing.ru/${raw.replace(/^\//, '')}`
}

export function buildEventResultsUrlMap(
  events: Array<{ event_id?: number | string; results_url?: string | null }>,
): Map<number, string> {
  const map = new Map<number, string>()
  for (const event of events) {
    const id = event.event_id
    const url = normalizeProcoursingUrl(event.results_url)
    if (id != null && url) map.set(Number(id), url)
  }
  return map
}

export function procoursingUrlForEventId(
  map: Map<number, string>,
  eventId: number | string | null | undefined,
): string | null {
  if (eventId == null) return null
  return map.get(Number(eventId)) ?? null
}
