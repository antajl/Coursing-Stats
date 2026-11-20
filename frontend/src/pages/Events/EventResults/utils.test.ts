import { describe, it, expect } from 'vitest'
import {
  isRacingFormat,
  isCoursingFormat,
  formatGroupTitle,
  normalizeBibColorName,
  bibColorStyle,
  bibTextClass,
} from './utils'
import type { RawScores } from './types'

describe('EventResults format detection', () => {
  it('detects racing format correctly', () => {
    const racingScores: RawScores = {
      format: 'racing',
      heats: [{ heat_number: 1, time: 33.42, speed_kmh: 38.7 }],
      grand_total: 33.42,
    }
    expect(isRacingFormat(racingScores)).toBe(true)
    expect(isCoursingFormat(racingScores)).toBe(false)
  })

  it('detects coursing format correctly with judges scores', () => {
    const coursingScores: RawScores = {
      format: 'coursing',
      heats: [
        {
          heat_number: 1,
          judges: [{ scores: [18, 18, 17, 18, 18], sum: 89 }],
          total: 89,
        },
      ],
      grand_total: 89,
    }
    expect(isRacingFormat(coursingScores)).toBe(false)
    expect(isCoursingFormat(coursingScores)).toBe(true)
  })

  it('handles empty scores (DNS/absent participants) without misclassifying as coursing', () => {
    const emptyScores: RawScores = {
      heats: [],
      grand_total: null,
      normalized_score: null,
    }
    // Neither racing nor coursing when heats are empty and format is undefined
    expect(isRacingFormat(emptyScores)).toBe(false)
    expect(isCoursingFormat(emptyScores)).toBe(false)
  })

  it('recognizes racing format on DNS participants when format is explicit', () => {
    const dnsRacingScores: RawScores = {
      format: 'racing',
      heats: [],
      grand_total: null,
      normalized_score: null,
    }
    expect(isRacingFormat(dnsRacingScores)).toBe(true)
    expect(isCoursingFormat(dnsRacingScores)).toBe(false)
  })

  it('formats group titles with elegant interpuncts instead of ASCII dashes', () => {
    expect(formatGroupTitle('Русская псовая борзая - Стандартный - Кобели')).toBe(
      'Русская псовая борзая · Стандартный · Кобели'
    )
    expect(formatGroupTitle('Салюки - Стандартный - Кобели')).toBe('Салюки · Стандартный · Кобели')
    expect(formatGroupTitle('Неприбывшие участники')).toBe('Неприбывшие участники')
    expect(formatGroupTitle('')).toBe('')
  })
})

describe('normalizeBibColorName and bib styles (robustness against numbers/nulls)', () => {
  it('handles null, undefined, empty without throwing', () => {
    expect(normalizeBibColorName(null)).toBeNull()
    expect(normalizeBibColorName(undefined)).toBeNull()
    expect(normalizeBibColorName('')).toBeNull()
    expect(normalizeBibColorName('   ')).toBeNull()
  })

  it('handles numeric bib_color in coursing (1=red, 2=white, 3=blue)', () => {
    expect(normalizeBibColorName(1)).toBe('red')
    expect(normalizeBibColorName(2)).toBe('white')
    expect(normalizeBibColorName(3)).toBe('blue')
  })

  it('handles numeric bib_color in racing (1=red, 2=blue, 3=white, 4=black, 5=yellow, 6=stripes)', () => {
    expect(normalizeBibColorName(1, true)).toBe('red')
    expect(normalizeBibColorName(2, true)).toBe('blue')
    expect(normalizeBibColorName(3, true)).toBe('white')
    expect(normalizeBibColorName(4, true)).toBe('black')
    expect(normalizeBibColorName(5, true)).toBe('yellow')
    expect(normalizeBibColorName(6, true)).toBe('stripes')
  })

  it('handles numeric strings ("1", "2", "3")', () => {
    expect(normalizeBibColorName('1')).toBe('red')
    expect(normalizeBibColorName('2')).toBe('white')
    expect(normalizeBibColorName('2', true)).toBe('blue')
  })

  it('handles color names and hex values', () => {
    expect(normalizeBibColorName('red')).toBe('red')
    expect(normalizeBibColorName('#ff0000')).toBe('red')
    expect(normalizeBibColorName('blue')).toBe('blue')
    expect(normalizeBibColorName('#00a2e8')).toBe('blue')
    expect(normalizeBibColorName('white')).toBe('white')
    expect(normalizeBibColorName('#ffffff')).toBe('white')
    expect(normalizeBibColorName('black')).toBe('black')
    expect(normalizeBibColorName('green')).toBe('green')
    expect(normalizeBibColorName('stripes')).toBe('stripes')
  })

  it('safely computes bibColorStyle and bibTextClass with numbers without TypeError', () => {
    expect(() => bibColorStyle(1)).not.toThrow()
    expect(() => bibTextClass(1)).not.toThrow()
    expect(bibColorStyle(1)).toEqual({
      backgroundColor: '#ef4444',
      border: '1px solid rgba(0,0,0,0.15)',
    })
    expect(bibTextClass(1)).toBe('text-white')

    expect(bibColorStyle(2)).toEqual({
      backgroundColor: '#ffffff',
      border: '1px solid #d1d5db',
    })
    expect(bibTextClass(2)).toBe('text-charcoal-900')

    expect(bibColorStyle(null)).toEqual({
      backgroundColor: '#9ca3af',
      border: '1px solid rgba(0,0,0,0.15)',
    })
    expect(bibTextClass(null)).toBe('text-charcoal-900')
  })

  it('regression: safely handles real event 20221026 heats with numeric bib_color', () => {
    const heats = [
      { heat_number: 1, bib_number: 45, bib_color: 1 },
      { heat_number: 2, bib_number: 67, bib_color: 2 },
    ]

    for (const heat of heats) {
      expect(() => {
        const norm = normalizeBibColorName(heat.bib_color)
        bibColorStyle(heat.bib_color)
        bibTextClass(heat.bib_color)
        return norm
      }).not.toThrow()
    }

    expect(normalizeBibColorName(heats[0].bib_color)).toBe('red')
    expect(normalizeBibColorName(heats[1].bib_color)).toBe('white')
  })
})
