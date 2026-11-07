import { describe, it, expect } from 'vitest'
import { findLatestMonthWithProtocols, getMonthsWithProtocols } from './showCalendarDate'
import type { ShowRkfCalendarEntry } from '../../lib/staticData'

describe('findLatestMonthWithProtocols', () => {
  it('returns the latest month that has exhibitions with protocols', () => {
    const exhibitions: ShowRkfCalendarEntry[] = [
      { id: 1, date: '15.01.2026', title: 'Jan', has_lc_protocol: true } as ShowRkfCalendarEntry,
      { id: 2, date: '20.08.2026', title: 'Aug', has_report_link: true } as ShowRkfCalendarEntry,
      { id: 3, date: '05.09.2026', title: 'Sep', has_lc_protocol: true } as ShowRkfCalendarEntry,
      { id: 4, date: '10.10.2026', title: 'Oct', has_lc_protocol: false, has_report_link: false } as ShowRkfCalendarEntry,
      { id: 5, date: '12.11.2026', title: 'Nov', has_lc_protocol: false, has_report_link: false } as ShowRkfCalendarEntry,
    ]

    expect(findLatestMonthWithProtocols(exhibitions)).toBe(9)
  })

  it('falls back to the latest month with any events if no protocols exist yet', () => {
    const exhibitions: ShowRkfCalendarEntry[] = [
      { id: 1, date: '15.01.2026', title: 'Jan', has_lc_protocol: false } as ShowRkfCalendarEntry,
      { id: 2, date: '20.04.2026', title: 'Apr', has_lc_protocol: false } as ShowRkfCalendarEntry,
    ]

    expect(findLatestMonthWithProtocols(exhibitions)).toBe(4)
  })

  it('falls back to current month if list is empty', () => {
    const currentMonth = new Date().getMonth() + 1
    expect(findLatestMonthWithProtocols([])).toBe(currentMonth)
  })
})

describe('getMonthsWithProtocols', () => {
  it('returns sorted month numbers with protocols, excluding empty future months', () => {
    const exhibitions: ShowRkfCalendarEntry[] = [
      { id: 1, date: '15.01.2026', title: 'Jan', has_lc_protocol: true } as ShowRkfCalendarEntry,
      { id: 2, date: '20.08.2026', title: 'Aug', has_report_link: true } as ShowRkfCalendarEntry,
      { id: 3, date: '05.09.2026', title: 'Sep', has_lc_protocol: true } as ShowRkfCalendarEntry,
      { id: 4, date: '10.10.2026', title: 'Oct', has_lc_protocol: false, has_report_link: false } as ShowRkfCalendarEntry,
      { id: 5, date: '12.11.2026', title: 'Nov', has_lc_protocol: false, has_report_link: false } as ShowRkfCalendarEntry,
    ]

    expect(getMonthsWithProtocols(exhibitions)).toEqual([1, 8, 9])
  })

  it('returns empty array when list is empty', () => {
    expect(getMonthsWithProtocols([])).toEqual([])
  })
})
