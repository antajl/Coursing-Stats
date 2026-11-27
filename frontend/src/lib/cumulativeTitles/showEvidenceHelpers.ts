/**
 * Хронологический отбор минимально достаточного набора выставочных мероприятий
 * для закрытия/прогресса титулов РКФ (без дублирования лишних сертификатов сверх нормы).
 */

import type { TitleEvidenceItem } from './types'
import { parseDateMs, toShowEvidence, type ShowCertEvent } from './showHelpers'

const DAY_MS = 86_400_000

export function sortShowEventsAsc<T extends { date?: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ams = parseDateMs(a.date)
    const bms = parseDateMs(b.date)
    if (ams === null && bms === null) return 0
    if (ams === null) return 1
    if (bms === null) return -1
    return ams - bms
  })
}

export function latestShowEvent<T extends { date?: string | null }>(items: T[]): T | undefined {
  if (items.length === 0) return undefined
  const sorted = sortShowEventsAsc(items)
  const withDate = sorted.filter((item) => parseDateMs(item.date) !== null)
  return withDate.length > 0 ? withDate[withDate.length - 1] : sorted[sorted.length - 1]
}

export interface SelectedCertResult {
  selected: ShowCertEvent[]
  reserveUsed: ShowCertEvent[]
  closingEvent?: ShowCertEvent
}

export function selectShowCertsUpToTarget(
  events: ShowCertEvent[],
  target: number,
  opts?: {
    requireYearSpan?: boolean
    reserveEvents?: ShowCertEvent[]
    canUseReservePair?: boolean
  },
): SelectedCertResult {
  const sorted = sortShowEventsAsc(events)
  if (sorted.length === 0 || target <= 0) {
    const reserveUsed =
      opts?.canUseReservePair && (opts.reserveEvents?.length ?? 0) >= 2
        ? sortShowEventsAsc(opts.reserveEvents!).slice(0, 2)
        : []
    return {
      selected: [],
      reserveUsed,
      closingEvent: latestShowEvent(reserveUsed),
    }
  }

  let selected: ShowCertEvent[] = []
  const seenJudges = new Set<string>()
  let accWeight = 0

  if (opts?.requireYearSpan && target >= 2) {
    const first = sorted[0]!
    const firstMs = parseDateMs(first.date)
    let spanClosing: ShowCertEvent | undefined
    if (firstMs !== null) {
      for (let i = 1; i < sorted.length; i++) {
        const candidate = sorted[i]!
        const cMs = parseDateMs(candidate.date)
        if (cMs === null || cMs - firstMs < 365 * DAY_MS) continue
        if (first.hasExplicitJudge && candidate.hasExplicitJudge && first.judge === candidate.judge) continue
        spanClosing = candidate
        break
      }
    }

    if (spanClosing) {
      selected.push(first)
      accWeight += first.weight
      if (first.hasExplicitJudge) seenJudges.add(first.judge)
      if (spanClosing.hasExplicitJudge) seenJudges.add(spanClosing.judge)

      for (let i = 1; i < sorted.length; i++) {
        const ev = sorted[i]!
        if (ev === spanClosing) continue
        if (accWeight + spanClosing.weight >= target) break
        if (ev.hasExplicitJudge && seenJudges.has(ev.judge)) continue
        selected.push(ev)
        accWeight += ev.weight
        if (ev.hasExplicitJudge) seenJudges.add(ev.judge)
      }

      selected.push(spanClosing)
      accWeight += spanClosing.weight
      selected = sortShowEventsAsc(selected)
    }
  }

  if (selected.length === 0) {
    for (const ev of sorted) {
      if (accWeight >= target) break
      if (ev.hasExplicitJudge && seenJudges.has(ev.judge)) continue
      selected.push(ev)
      accWeight += ev.weight
      if (ev.hasExplicitJudge) seenJudges.add(ev.judge)
    }
  }

  const reserveUsed: ShowCertEvent[] = []
  if (accWeight < target && opts?.canUseReservePair && (opts.reserveEvents?.length ?? 0) >= 2) {
    reserveUsed.push(...sortShowEventsAsc(opts.reserveEvents!).slice(0, 2))
  }

  const combined = [...selected, ...reserveUsed]
  return {
    selected,
    reserveUsed,
    closingEvent: latestShowEvent(combined),
  }
}

export function selectNkpEvidence(
  events: ShowCertEvent[],
  targetKchk: number,
  options?: { suffix?: string; fallbackLabel?: string },
): { items: TitleEvidenceItem[]; closingEvent?: ShowCertEvent } {
  const sorted = sortShowEventsAsc(events)
  const direct = sorted.filter((e) => e.weight > 0)
  const ssEvents = sorted.filter((e) => e.weight === 0)

  const chosen: ShowCertEvent[] = []
  let accWeight = 0
  for (const ev of direct) {
    if (accWeight >= targetKchk) break
    chosen.push(ev)
    accWeight += ev.weight
  }

  if (accWeight < targetKchk && ssEvents.length > 0) {
    if (ssEvents.length >= 2) {
      chosen.push(...ssEvents.slice(0, 2))
    } else {
      chosen.push(ssEvents[0]!)
    }
  }

  const items = chosen.map((ev) => {
    const baseAward = ev.nkpKind || options?.fallbackLabel || 'КЧК'
    const award = options?.suffix ? `${baseAward} (${options.suffix})` : baseAward
    return toShowEvidence(ev, award)
  })

  return {
    items,
    closingEvent: latestShowEvent(chosen),
  }
}
