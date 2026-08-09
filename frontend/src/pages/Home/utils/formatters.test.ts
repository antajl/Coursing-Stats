import { describe, expect, it } from 'vitest'
import {
  formatStarts,
  formatScore,
  formatIndex,
  formatSpeed,
} from './formatters'

describe('formatters', () => {
  describe('formatStarts', () => {
    it('formats 1 as участие', () => {
      expect(formatStarts(1)).toBe('1 участие')
    })

    it('formats 2–4 as участия', () => {
      expect(formatStarts(2)).toBe('2 участия')
      expect(formatStarts(3)).toBe('3 участия')
      expect(formatStarts(4)).toBe('4 участия')
    })

    it('formats 5+ as участий', () => {
      expect(formatStarts(5)).toBe('5 участий')
      expect(formatStarts(20)).toBe('20 участий')
    })

    it('formats 11–14 as участий', () => {
      expect(formatStarts(11)).toBe('11 участий')
      expect(formatStarts(12)).toBe('12 участий')
      expect(formatStarts(13)).toBe('13 участий')
      expect(formatStarts(14)).toBe('14 участий')
    })

    it('returns null for invalid', () => {
      expect(formatStarts(null)).toBe(null)
      expect(formatStarts(undefined)).toBe(null)
      expect(formatStarts(NaN)).toBe(null)
    })
  })
})
