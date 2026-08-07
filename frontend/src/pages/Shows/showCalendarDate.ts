import type { ShowRkfCalendarEntry } from '../../lib/staticData'
import { formatMonthShortRu } from '../Events/eventListUtils'
import {
  groupMatchesSearch,
  groupRkfMonoVariants,
  type RkfCalendarGroup,
} from './showCalendarGroup'

export function parseShowDate(dateStr: string): Date | null {
  if (!dateStr) return null
  const parts = dateStr.split('.')
  if (parts.length !== 3) return null
  const [day, month, year] = parts.map(Number)
  return new Date(year, month - 1, day)
}

/** Calendar-day compare in local time (same as parseShowDate). */
export function isShowNotStartedYet(dateStr: string): boolean {
  const start = parseShowDate(dateStr)
  if (!start) return false
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return start.getTime() > today.getTime()
}

export function formatShowDate(dateStr: string): string | null {
  const date = parseShowDate(dateStr)
  if (!date) return null
  const day = date.getDate()
  const month = formatMonthShortRu(date.getMonth())
  return `${day} ${month}`
}

export function monthLabel(year: number, monthIndex: number): string {
  const label = new Date(year, monthIndex, 1).toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function filterShowCalendarGroups(
  exhibitions: ShowRkfCalendarEntry[],
  opts: {
    filterMonth: string
    filterLcOnly: boolean
    searchQuery: string
    quickPreset: 'upcoming30' | null
  },
): RkfCalendarGroup[] {
  const upcomingRange =
    opts.quickPreset === 'upcoming30'
      ? (() => {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const in30 = new Date(today)
          in30.setDate(in30.getDate() + 30)
          return { from: today, to: in30 }
        })()
      : null

  // Ascending by date — same as competitions calendar (`Events/index.tsx`).
  const sorted = [...exhibitions].sort((a, b) => {
    const dateA = parseShowDate(a.date)
    const dateB = parseShowDate(b.date)
    if (!dateA && !dateB) return 0
    if (!dateA) return 1
    if (!dateB) return -1
    return dateA.getTime() - dateB.getTime()
  })

  let monthFiltered = sorted
  if (opts.filterMonth) {
    monthFiltered = sorted.filter((ex) => {
      const date = parseShowDate(ex.date)
      if (!date) return false
      return date.getMonth() + 1 === Number(opts.filterMonth)
    })
  }

  const groups = groupRkfMonoVariants(monthFiltered)
  return groups.filter((group) => {
    if (opts.filterLcOnly && !group.hasProtocol) return false
    if (upcomingRange) {
      const start = parseShowDate(group.representative.date)
      if (!start || start < upcomingRange.from || start > upcomingRange.to) return false
    }
    if (opts.searchQuery.trim() && !groupMatchesSearch(group, opts.searchQuery.trim())) {
      return false
    }
    return true
  })
}

/** Same ascending month order as competitions calendar (`groupEventsByMonth`). */
export function groupExhibitionsByMonth(groups: RkfCalendarGroup[]) {
  const months = new Map<string, { label: string; events: RkfCalendarGroup[] }>()

  groups.forEach((group) => {
    const date = parseShowDate(group.representative.date)
    if (!date) return

    const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`
    if (!months.has(key)) {
      months.set(key, {
        label: monthLabel(date.getFullYear(), date.getMonth()),
        events: [],
      })
    }
    months.get(key)!.events.push(group)
  })

  // Month header counts merged groups (not raw NKP cards) so totals feel less inflated.
  return [...months.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({ key, label: value.label, events: value.events }))
}
