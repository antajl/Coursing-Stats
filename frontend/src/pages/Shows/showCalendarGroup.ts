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
 * Merge key for calendar event: same day + city + club.
 * Collapses all-breed (CAC/ЧРКФ), specialty (group CAC), and mono shows (NKP/КЧК)
 * organized by the same club on the same day into a single unified event card.
 */
export function rkfClubMergeKey(entry: ShowRkfCalendarEntry): string {
  const date = normalizeWs(entry.date)
  const city = normalizeMergeText(entry.city || entry.location)
  const club = normalizeMergeText(entry.club)
  if (club) {
    return [date, city, club].join('\0')
  }
  return [date, city, normalizeMergeText(entry.title)].join('\0')
}

/** Legacy alias for backward compatibility. */
export const rkfMonoMergeKey = rkfClubMergeKey

/** Prestige score to choose the best representative exhibition for a group card. */
export function exhibitionPrestige(entry: ShowRkfCalendarEntry): number {
  const ranks = (entry.ranks || entry.rank || '').toUpperCase()
  const title = (entry.title || '').toUpperCase()
  const hasMono = Boolean(entry.national_breed_club_name || entry.breeds)

  let score = 0
  if (ranks.includes('ОСОБЫМ СТАТУСОМ') || title.includes('ОСОБЫМ СТАТУСОМ')) score += 1000
  else if (ranks.includes('ЧРКФ') || title.includes('ЧРКФ')) score += 800
  else if (ranks.includes('ЧФ') || title.includes('ЧФ')) score += 600
  else if (ranks.includes('CAC') || ranks.includes('САС')) score += 500
  else if (ranks.includes('ПОБЕДИТЕЛЬ КЛУБА') || ranks.includes('ПК')) score += 300
  else if (ranks.includes('КЧК')) score += 200

  // All-breed shows are more representative of the club event than a single mono show
  if (!hasMono) {
    score += 400
  }

  if (entry.has_lc_protocol || entry.has_report_link || entry.reports_link) {
    score += 50
  }

  return score
}

/** Sort children inside an expanded group: all-breed first, group shows second, mono by breed third. */
export function compareGroupChildren(a: ShowRkfCalendarEntry, b: ShowRkfCalendarEntry): number {
  const pA = exhibitionPrestige(a)
  const pB = exhibitionPrestige(b)
  if (pA !== pB) return pB - pA

  const lA = a.breeds || a.national_breed_club_name || a.title || ''
  const lB = b.breeds || b.national_breed_club_name || b.title || ''
  return lA.localeCompare(lB, 'ru')
}

/** Format readable label for a child exhibition in the expanded list. */
export function formatChildHeading(child: ShowRkfCalendarEntry): string {
  const breed = child.breeds?.trim()
  const nkp = child.national_breed_club_name?.trim()
  if (breed) return breed
  if (nkp) return formatNkpDisplay(nkp)

  const ranks = child.ranks || child.rank || ''
  const m = ranks.match(/(\d+)\s*гр/i)
  if (m) {
    return `Выставка ${m[1]} группы FCI`
  }
  if (/чркф/i.test(ranks) || /особым статусом/i.test(ranks)) {
    return `Рейтинговая выставка ЧРКФ`
  }
  if (/cac|сас/i.test(ranks)) {
    return `Всепородная выставка САС`
  }
  return child.title || `Выставка ID ${child.id}`
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
  /** LC scraped protocol (legacy). */
  hasLc: boolean
  /** Any viewable protocol: LC, RKF report PDF, or BIS report. */
  hasProtocol: boolean
}

/** Exhibition has a protocol / report the UI can open. */
export function exhibitionHasProtocol(entry: ShowRkfCalendarEntry): boolean {
  return Boolean(
    entry.has_lc_protocol ||
      entry.has_report_link ||
      entry.reports_link?.trim() ||
      entry.bis_reports_link?.trim(),
  )
}

/** Group filtered calendar rows by club event; single-child groups render like flat rows. */
export function groupRkfMonoVariants(
  exhibitions: ShowRkfCalendarEntry[],
): RkfCalendarGroup[] {
  const map = new Map<string, ShowRkfCalendarEntry[]>()
  const order: string[] = []

  for (const entry of exhibitions) {
    const key = rkfClubMergeKey(entry)
    if (!map.has(key)) {
      map.set(key, [])
      order.push(key)
    }
    map.get(key)!.push(entry)
  }

  return order.map((key) => {
    const children = [...map.get(key)!].sort(compareGroupChildren)
    return {
      key,
      representative: children[0]!,
      children,
      hasLc: children.some((c) => Boolean(c.has_lc_protocol)),
      hasProtocol: children.some(exhibitionHasProtocol),
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
    const fields = [c.national_breed_club_name, c.breeds, c.title, c.city, c.club, c.ranks, c.rank]
    return fields.some((f) => f && f.toLowerCase().includes(q))
  })
}
