import { describe, expect, it } from 'vitest'
import {
  toShowDateIso,
  compareShowHistoryDesc,
  sortShowHistory,
} from '../lib/show-dates'

describe('show-dates', () => {
  describe('toShowDateIso', () => {
    it('converts DD.MM.YYYY to YYYY-MM-DD', () => {
      expect(toShowDateIso('29.01.2023')).toBe('2023-01-29')
      expect(toShowDateIso('28.01.2024')).toBe('2024-01-28')
      expect(toShowDateIso('27.08.2023')).toBe('2023-08-27')
      expect(toShowDateIso('01.05.2026')).toBe('2026-05-01')
    })

    it('pads single-digit day and month', () => {
      expect(toShowDateIso('1.5.2024')).toBe('2024-05-01')
    })

    it('preserves already ISO strings', () => {
      expect(toShowDateIso('2024-01-28')).toBe('2024-01-28')
    })

    it('handles null, undefined and empty strings', () => {
      expect(toShowDateIso(null)).toBe('')
      expect(toShowDateIso(undefined)).toBe('')
      expect(toShowDateIso('')).toBe('')
      expect(toShowDateIso('   ')).toBe('')
    })
  })

  describe('compareShowHistoryDesc & sortShowHistory', () => {
    it('correctly sorts entries chronologically descending, fixing the DD.MM.YYYY lexicographical bug', () => {
      // The exact case from user bug report:
      // Under old code, "29.01.2023" came first because '29' > '28' > '27'
      const history = [
        { date: '29.01.2023', exhibition_title: 'МАСТЕРС 2023' },
        { date: '28.01.2024', exhibition_title: 'МАСТЕРС 2024' },
        { date: '27.08.2023', exhibition_title: 'ГЛОБУС ПЛЮС 2023' },
      ]

      const sorted = sortShowHistory([...history])

      expect(sorted.map((e) => e.date)).toEqual([
        '28.01.2024', // Newest: January 2024
        '27.08.2023', // Middle: August 2023
        '29.01.2023', // Oldest: January 2023
      ])
    })

    it('breaks ties using exhibition_id descending', () => {
      const history = [
        { date: '15.06.2024', exhibition_id: 100, placement: 1 },
        { date: '15.06.2024', exhibition_id: 200, placement: 2 },
      ]

      const sorted = sortShowHistory([...history])
      expect(sorted[0].exhibition_id).toBe(200)
      expect(sorted[1].exhibition_id).toBe(100)
    })

    it('breaks secondary ties using placement ascending (first place first)', () => {
      const history = [
        { date: '15.06.2024', exhibition_id: 100, placement: 2 },
        { date: '15.06.2024', exhibition_id: 100, placement: 1 },
      ]

      const sorted = sortShowHistory([...history])
      expect(sorted[0].placement).toBe(1)
      expect(sorted[1].placement).toBe(2)
    })
  })
})
