import { describe, expect, it } from 'vitest'
import {
  bestShowAward,
  compareShowDogs,
  mergeShowTitles,
  parseShowTitles,
  showRankScore,
} from '../lib/show-award-ranking'

describe('parseShowTitles', () => {
  it('parses CAC without double-counting CACIB', () => {
    expect(parseShowTitles('CAC')).toEqual({ CAC: 1, CACIB: 0, BOB: 0, BIS: 0 })
    expect(parseShowTitles('CACIB')).toEqual({ CAC: 0, CACIB: 1, BOB: 0, BIS: 0 })
    expect(parseShowTitles('JCAC')).toEqual({ CAC: 0, CACIB: 0, BOB: 0, BIS: 0 })
  })

  it('parses ring awards', () => {
    expect(parseShowTitles('BOB, CAC')).toEqual({ CAC: 1, CACIB: 0, BOB: 1, BIS: 0 })
    expect(parseShowTitles('BIS')).toEqual({ CAC: 0, CACIB: 0, BOB: 0, BIS: 1 })
  })
})

describe('showRankScore', () => {
  it('weights BIS above BOB and CAC', () => {
    const bisOnly = showRankScore({ BIS: 1, BOB: 0, CACIB: 0, CAC: 0 })
    const manyCac = showRankScore({ BIS: 0, BOB: 0, CACIB: 0, CAC: 50 })
    expect(bisOnly).toBeGreaterThan(manyCac)
  })
})

describe('bestShowAward', () => {
  it('returns highest tier with count > 0', () => {
    expect(bestShowAward({ BIS: 0, BOB: 1, CACIB: 2, CAC: 3 })).toBe('BOB')
    expect(bestShowAward({ BIS: 1, BOB: 1, CACIB: 0, CAC: 0 })).toBe('BIS')
    expect(bestShowAward({ BIS: 0, BOB: 0, CACIB: 0, CAC: 0 })).toBeNull()
  })
})

describe('compareShowDogs', () => {
  it('sorts by rank_score then tie-breakers', () => {
    const dogs = [
      { titles: { BIS: 0, BOB: 0, CACIB: 0, CAC: 5 }, total_shows: 3 },
      { titles: { BIS: 0, BOB: 1, CACIB: 0, CAC: 3 }, total_shows: 3 },
    ]
    dogs.sort(compareShowDogs)
    expect(dogs[0].titles.BOB).toBe(1)
  })
})

describe('mergeShowTitles', () => {
  it('sums counts', () => {
    expect(mergeShowTitles(parseShowTitles('CAC'), parseShowTitles('BOB'))).toEqual({
      CAC: 1,
      CACIB: 0,
      BOB: 1,
      BIS: 0,
    })
  })
})
