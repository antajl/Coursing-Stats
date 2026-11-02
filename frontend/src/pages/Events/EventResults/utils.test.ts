import { describe, it, expect } from 'vitest'
import { isRacingFormat, isCoursingFormat } from './utils'
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
})
