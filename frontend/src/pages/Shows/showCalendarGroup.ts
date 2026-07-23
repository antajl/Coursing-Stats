import type { ShowRkfCalendarEntry } from '../../lib/staticData'

/** Collapse whitespace so merge keys stay stable across catalog quirks. */
export function normalizeWs(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

/**
 * Normalize title/club for calendar merge: drop quotes and collapse punctuation
 * so «клуба "ТООЛЖ"» ≡ «клуба ТООЛЖ».
 */
export function normalizeMergeText(value: string | null | undefined): string {
  return normalizeWs(value)
    .replace(/[\u0022\u0027\u00AB\u00BB\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F\u2039\u203A`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

/**
 * Display NKP as `НКП: {rest}`. Strips a redundant leading `НКП` / `НКП:`
 * from the catalog value so we never show `НКП: НКП БАССЕТ-ХАУНД`.
 */
export function formatNkpDisplay(name: string | null | undefined): string {
  const trimmed = normalizeWs(name)
  if (!trimmed) return 'НКП'
  const rest = trimmed.replace(/^нкп\s*:?\s*/iu, '').trim()
  return rest ? `НКП: ${rest}` : 'НКП'
}

/**
 * Merge key: same day + title + city + club (quotes/punctuation ignored).
 * Different ranks (CAC 3 гр. / 5 гр.) and NKP variants collapse into one card.
 */
export function rkfMonoMergeKey(entry: ShowRkfCalendarEntry): string {
  return [
    normalizeWs(entry.date),
    normalizeMergeText(entry.title),
    normalizeMergeText(entry.city || entry.location),
    normalizeMergeText(entry.club),
  ].join('\0')
}

/** Unique rank chips across grouped children (order preserved). */
export function collectGroupRanks(children: ShowRkfCalendarEntry[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const child of children) {
    const raw = child.ranks || child.rank || ''
    for (const part of raw.split(/[,;|]/).map((s) => s.trim()).filter(Boolean)) {
      const key = part.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      out.push(part)
    }
  }
  return out
}

export interface RkfCalendarGroup {
  key: string
  /** First child (stable display fields: date, title, ranks, place). */
  representative: ShowRkfCalendarEntry
  children: ShowRkfCalendarEntry[]
  hasLc: boolean
}

function childLabel(entry: ShowRkfCalendarEntry): string {
  const nkp =
    normalizeWs(entry.national_breed_club_name) ||
    normalizeWs(entry.breeds) ||
    ''
  const ranks = normalizeWs(entry.ranks || entry.rank)
  if (nkp && ranks) return `${nkp} · ${ranks}`
  return nkp || ranks || String(entry.id)
}

/** Group filtered calendar rows; single-child groups render like today’s flat rows. */
export function groupRkfMonoVariants(
  exhibitions: ShowRkfCalendarEntry[],
): RkfCalendarGroup[] {
  const map = new Map<string, ShowRkfCalendarEntry[]>()
  const order: string[] = []

  for (const entry of exhibitions) {
    const key = rkfMonoMergeKey(entry)
    if (!map.has(key)) {
      map.set(key, [])
      order.push(key)
    }
    map.get(key)!.push(entry)
  }

  return order.map((key) => {
    const children = [...map.get(key)!].sort((a, b) =>
      childLabel(a).localeCompare(childLabel(b), 'ru'),
    )
    return {
      key,
      representative: children[0]!,
      children,
      hasLc: children.some((c) => Boolean(c.has_lc_protocol)),
    }
  })
}

export function groupMatchesSearch(
  group: RkfCalendarGroup,
  query: string,
): boolean {
  const q = query.toLowerCase()
  const rep = group.representative
  const headFields = [rep.title, rep.city, rep.location, rep.club, rep.type, rep.ranks, rep.rank]
  if (headFields.some((f) => f && f.toLowerCase().includes(q))) return true
  return group.children.some((c) => {
    const fields = [c.national_breed_club_name, c.breeds, c.title, c.city, c.club]
    return fields.some((f) => f && f.toLowerCase().includes(q))
  })
}
