import { describe, expect, it } from 'vitest'
import {
  formatRowDateParts,
  getEventHeadline,
  getEventSubtitle,
  normalizeDisciplineLabel,
  parseRankLabelStructure,
} from '../../frontend/src/pages/Events/eventListUtils'

describe('calendar display utils', () => {
  it('abbreviates BZMP', () => {
    expect(normalizeDisciplineLabel('Бега за механической приманкой')).toBe('БЗМП')
  })

  it('parses collapsed rank_label with glued breeds', () => {
    expect(parseRankLabelStructure('ПЧРКФ(Курсинг борзых)УиппетСалюки')).toEqual({
      kind: 'ПЧРКФ',
      disciplines: ['Курсинг борзых'],
    })
  })

  it('unifies headline to kind · BZMP', () => {
    expect(
      getEventHeadline({
        id: 1,
        date_start: '2025-04-05',
        rank_label: 'ЧРКФ\n(Бега за механической приманкой)',
      })
    ).toBe('ЧРКФ · БЗМП')
  })

  it('unifies collapsed parentheses form', () => {
    expect(
      getEventHeadline({
        id: 1,
        date_start: '2026-04-19',
        rank_label: 'ЧРКФ(Курсинг борзых)',
      })
    ).toBe('ЧРКФ · Курсинг борзых')
  })

  it('hides breeds in calendar subtitle', () => {
    expect(
      getEventSubtitle({
        id: 1,
        date_start: '2026-06-27',
        rank_label: 'ПЧРКФ\n(Курсинг борзых)\nУиппет',
      })
    ).toBeNull()
  })

  it('stacked date layout for range', () => {
    const parts = formatRowDateParts('2026-04-26', '2026-04-27')
    expect(parts?.dayLine).toBe('26–27')
    expect(parts?.metaLine).toMatch(/–/)
  })
})
