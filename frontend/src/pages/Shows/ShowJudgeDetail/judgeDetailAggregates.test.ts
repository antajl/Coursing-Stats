import { describe, it, expect } from 'vitest'
import {
  parseDateToComparable,
  compareExhibitionDates,
  formatDate,
  exhibitionYear,
} from './judgeDetailAggregates'

describe('judgeDetailAggregates date utilities', () => {
  it('parses Russian DD.MM.YYYY dates to comparable numbers', () => {
    expect(parseDateToComparable('31.08.2025')).toBe(20250831)
    expect(parseDateToComparable('01.02.2024')).toBe(20240201)
    expect(parseDateToComparable('5.3.2023')).toBe(20230305)
  })

  it('parses ISO YYYY-MM-DD dates to comparable numbers', () => {
    expect(parseDateToComparable('2025-08-31')).toBe(20250831)
    expect(parseDateToComparable('2024-02-01')).toBe(20240201)
  })

  it('returns 0 for empty or invalid dates', () => {
    expect(parseDateToComparable('')).toBe(0)
    expect(parseDateToComparable(undefined)).toBe(0)
    expect(parseDateToComparable(null)).toBe(0)
    expect(parseDateToComparable('invalid')).toBe(0)
  })

  it('sorts exhibitions by date descending by default (newer first)', () => {
    const list = [
      { id: 1, date: '30.08.2025' },
      { id: 2, date: '31.05.2025' },
      { id: 3, date: '31.08.2025' },
      { id: 4, date: '15.01.2024' },
      { id: 5, date: '' },
    ]

    const sorted = [...list].sort((a, b) => compareExhibitionDates(a, b, 'desc'))

    expect(sorted.map((item) => item.id)).toEqual([3, 1, 2, 4, 5])
  })

  it('sorts exhibitions by date ascending (older first)', () => {
    const list = [
      { id: 1, date: '30.08.2025' },
      { id: 2, date: '31.05.2025' },
      { id: 3, date: '31.08.2025' },
      { id: 4, date: '15.01.2024' },
      { id: 5, date: '' },
    ]

    const sorted = [...list].sort((a, b) => compareExhibitionDates(a, b, 'asc'))

    // 15.01.2024, 31.05.2025, 30.08.2025, 31.08.2025, and empty date at the end
    expect(sorted.map((item) => item.id)).toEqual([4, 2, 1, 3, 5])
  })

  it('tie-breaks identical dates by id', () => {
    const list = [
      { id: 100, date: '31.08.2025' },
      { id: 200, date: '31.08.2025' },
    ]

    const desc = [...list].sort((a, b) => compareExhibitionDates(a, b, 'desc'))
    expect(desc.map((item) => item.id)).toEqual([200, 100])

    const asc = [...list].sort((a, b) => compareExhibitionDates(a, b, 'asc'))
    expect(asc.map((item) => item.id)).toEqual([100, 200])
  })

  it('handles formatDate and exhibitionYear correctly', () => {
    expect(formatDate('2025-08-31')).toBe('31.08.2025')
    expect(formatDate('31.08.2025')).toBe('31.08.2025')
    expect(formatDate('')).toBe('—')
    expect(exhibitionYear('31.08.2025')).toBe('2025')
    expect(exhibitionYear('2025-08-31')).toBe('2025')
  })
})
