export interface CalendarEvent {
  id: number
  year?: number
  date_start: string
  date_end?: string | null
  rank_label?: string | null
  event_type?: string
  competition_kind?: string | null
  competition_type?: string | null
  title?: string | null
  host_club?: string | null
  location?: string | null
  results_url?: string | null
  judges?: string | null
  participants_count?: number
}

export const DISCIPLINE_BORDER: Record<string, string> = {
  coursing: 'border-l-forest-300 dark:border-l-forest-600',
  bzmp: 'border-l-blue-500 dark:border-l-blue-600',
  racing: 'border-l-rose-300 dark:border-l-rose-600',
  other: 'border-l-amber-300 dark:border-l-amber-600',
  default: 'border-l-old-money-300 dark:border-l-charcoal-600',
}

export const DISCIPLINE_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  coursing: {
    bg: 'bg-forest-100 dark:bg-forest-900/40',
    text: 'text-forest-700 dark:text-forest-300',
    label: 'Курсинг',
  },
  bzmp: {
    bg: 'bg-blue-100 dark:bg-blue-900/40',
    text: 'text-blue-700 dark:text-blue-300',
    label: 'БЗМП',
  },
  racing: {
    bg: 'bg-rose-100 dark:bg-rose-900/40',
    text: 'text-rose-700 dark:text-rose-300',
    label: 'Бега',
  },
  other: {
    bg: 'bg-amber-100 dark:bg-amber-900/40',
    text: 'text-amber-700 dark:text-amber-300',
    label: 'Другие',
  },
}

export const LEGEND_DOT_COLOR: Record<string, string> = {
  coursing: 'bg-forest-300 dark:bg-forest-600',
  bzmp: 'bg-blue-500 dark:bg-blue-600',
  racing: 'bg-rose-300 dark:bg-rose-600',
  other: 'bg-amber-300 dark:bg-amber-600',
  championship: 'bg-camel-500',
}

export function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatDateRange(dateStart: string, dateEnd?: string | null): string {
  if (!dateStart) return ''
  const [year, month, day] = dateStart.split('-')
  if (!dateEnd) return `${day}.${month}.${year}`

  const endParts = dateEnd.split('-')
  if (endParts.length !== 3) return `${day}.${month}.${year}`
  const [, , endDay] = endParts
  return `${day}-${endDay}.${month}.${year}`
}

export function formatRowDateParts(
  dateStart: string,
  dateEnd?: string | null
): {
  dayLine: string
  metaLine: string
  /** @deprecated use dayLine */
  day: number
  dayEnd?: number
  month: string
  weekday: string
} | null {
  const d = parseDate(dateStart)
  if (!d) return null

  const month = d.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '')
  const weekday = d.toLocaleDateString('ru-RU', { weekday: 'short' })
  const end = dateEnd ? parseDate(dateEnd) : null
  const dayEnd =
    end && end.getTime() !== d.getTime() && end.getMonth() === d.getMonth()
      ? end.getDate()
      : undefined
  const weekdayEnd =
    dayEnd && end
      ? end.toLocaleDateString('ru-RU', { weekday: 'short' })
      : undefined

  const dayLine = dayEnd ? `${d.getDate()}–${dayEnd}` : String(d.getDate())
  // Месяц уже в заголовке группы — в строке только дни недели
  const metaLine =
    weekdayEnd && weekday !== weekdayEnd ? `${weekday}–${weekdayEnd}` : weekday

  return {
    dayLine,
    metaLine,
    day: d.getDate(),
    dayEnd,
    month,
    weekday,
  }
}

export function normalizeRankLabel(rankLabel?: string | null): string {
  if (!rankLabel) return ''
  return rankLabel
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .trim()
}

/** Сокращения дисциплин для заголовка календаря */
export function normalizeDisciplineLabel(label: string): string {
  const trimmed = label.trim()
  if (/бега\s+за\s+механической\s+приманкой/i.test(trimmed)) return 'БЗМП'
  if (trimmed.toUpperCase() === 'БЗМП') return 'БЗМП'
  return trimmed
}

export function parseRankLabelStructure(rankLabel: string): {
  kind: string
  disciplines: string[]
} {
  const label = normalizeRankLabel(rankLabel)
  if (!label) return { kind: '', disciplines: [] }

  const lines = label
    .split('\n')
    .map((line) => line.replace(/\[отмен[её]н\]/gi, '').trim())
    .filter(Boolean)

  const disciplineFromLine = (line: string) =>
    line.match(/^\(([^)]+)\)$/)?.[1]?.trim() || null

  const multilineDisciplines = lines
    .map(disciplineFromLine)
    .filter((d): d is string => Boolean(d))

  if (multilineDisciplines.length > 0) {
    const kind = lines.find((line) => !disciplineFromLine(line)) || lines[0] || ''
    return {
      kind: kind.split('(')[0]?.trim() || kind,
      disciplines: multilineDisciplines,
    }
  }

  const first = lines[0] || label
  const collapsed = first.match(/^([^(]+)\(([^)]+)\)/)
  if (collapsed) {
    return {
      kind: collapsed[1].trim(),
      disciplines: [collapsed[2].trim()],
    }
  }

  return { kind: first, disciplines: [] }
}

function headlineFromStructure(
  structure: { kind: string; disciplines: string[] },
  event: CalendarEvent
): string | null {
  const { kind, disciplines } = structure
  const normalized = disciplines.map(normalizeDisciplineLabel).filter(Boolean)

  if (kind && normalized.length > 0) {
    return `${kind} · ${normalized.join(' · ')}`
  }
  if (kind) return kind

  const competitionKind = event.competition_kind?.trim()
  const competitionType = event.competition_type?.trim()
  if (competitionKind && competitionType) {
    return `${competitionKind} · ${normalizeDisciplineLabel(competitionType)}`
  }
  if (competitionKind) return competitionKind
  if (competitionType) return normalizeDisciplineLabel(competitionType)

  return null
}

export function getEventHeadline(event: CalendarEvent): string {
  const label = normalizeRankLabel(event.rank_label)
  if (label) {
    const headline = headlineFromStructure(parseRankLabelStructure(label), event)
    if (headline) return headline
  }

  return event.title || 'Соревнование'
}

export function getEventSubtitle(_event: CalendarEvent): string | null {
  return null
}

export function isEventCancelled(event: CalendarEvent): boolean {
  return /\[отмен[её]н\]/i.test(normalizeRankLabel(event.rank_label))
}

export function isImportantCompetition(competitionKind?: string | null): boolean {
  if (!competitionKind) return false
  const upper = competitionKind.toUpperCase()
  return upper.includes('ЧЕМПИОНАТ РОССИИ') || upper.includes('КУБОК РОССИИ')
}

export function parseJudgeNames(judges?: string | null): string[] {
  if (!judges) return []

  let cleaned = judges.replace(/<br\s*\/?>/gi, ', ').trim()

  cleaned = cleaned
    .replace(/Главный\s+судья\s*[:\s-]+\s*/gi, '')
    .replace(/судья\s*[:\s-]+\s*/gi, '')
    .trim()

  const names = cleaned
    .split(',')
    .map((part) => {
      const trimmed = part.trim()
      return trimmed.match(/[-–—]\s*(.+)$/i)?.[1]?.trim() || trimmed
    })
    .filter(Boolean)

  if (names.length === 1 && cleaned.includes(' и ')) {
    return cleaned
      .split(' и ')
      .map((n) => n.trim())
      .filter(Boolean)
  }

  return names
}

export function formatJudgesShort(judges?: string | null): string {
  return parseJudgeNames(judges).join(', ')
}

/** @deprecated use getEventHeadline for calendar rows */
export function getEventTitle(event: CalendarEvent): string {
  if (event.title) return event.title
  const parts = [event.competition_kind, event.competition_type].filter(Boolean)
  return parts.join(' · ') || 'Соревнование'
}

export function getEventMeta(event: CalendarEvent): string {
  const parts: string[] = []
  if (event.location) parts.push(event.location)
  if (event.host_club) parts.push(event.host_club)
  return parts.join(' · ')
}

export function getEventYear(event: CalendarEvent): number | null {
  if (event.year) return event.year
  return parseDate(event.date_start)?.getFullYear() ?? null
}

function monthLabel(year: number, monthIndex: number): string {
  const label = new Date(year, monthIndex, 1).toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function groupEventsByMonth(events: CalendarEvent[]): { key: string; label: string; events: CalendarEvent[] }[] {
  const map = new Map<string, { label: string; events: CalendarEvent[] }>()

  for (const event of events) {
    const d = parseDate(event.date_start)
    if (!d) continue
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`

    if (!map.has(key)) {
      map.set(key, { label: monthLabel(d.getFullYear(), d.getMonth()), events: [] })
    }
    map.get(key)!.events.push(event)
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({ key, label: value.label, events: value.events }))
}

export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}
