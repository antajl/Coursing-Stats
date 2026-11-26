import { describe, it, expect } from 'vitest'
import { mergeYearDogIntoDetail } from '../lib/show-detail-merge'
import { parseShowTitles, showRankScore } from '../lib/show-award-ranking'

describe('mergeYearDogIntoDetail', () => {
  it('does not double-count titles for exhibitions already in all-time history', () => {
    const baseTitles = parseShowTitles('КЧП, ЮКЧП, ВКЧП')
    const existing = {
      total_shows: 1,
      rank_score: showRankScore(baseTitles),
      best_award: 'KCHP',
      best_grade: 'Отлично',
      titles: { ...baseTitles },
      history: [{ exhibition_id: 65031, title: 'КЧП, ЮКЧП, ВКЧП', grade: 'ОТЛ' }],
    }

    const yearSlice = {
      best_grade: 'Отлично',
      history: [{ exhibition_id: 65031, title: 'КЧП, ЮКЧП, ВКЧП', grade: 'ОТЛ' }],
    }

    mergeYearDogIntoDetail(existing, yearSlice)

    expect(existing.total_shows).toBe(1)
    expect(existing.titles.KCHP).toBe(1)
    expect(existing.titles.YKCHP).toBe(1)
    expect(existing.titles.VKCHP).toBe(1)
    expect(existing.rank_score).toBe(showRankScore(baseTitles))
  })

  it('adds titles only for newly discovered exhibitions', () => {
    const baseTitles = parseShowTitles('CAC')
    const existing = {
      total_shows: 1,
      rank_score: showRankScore(baseTitles),
      best_award: 'CAC',
      best_grade: 'Отлично',
      titles: { ...baseTitles },
      history: [{ exhibition_id: 100, title: 'CAC', grade: 'ОТЛ' }],
    }

    mergeYearDogIntoDetail(existing, {
      best_grade: 'Отлично',
      history: [
        { exhibition_id: 100, title: 'CAC', grade: 'ОТЛ' },
        { exhibition_id: 101, title: 'BOB, CAC', grade: 'ОТЛ' },
      ],
    })

    expect(existing.total_shows).toBe(2)
    expect(existing.titles.CAC).toBe(2)
    expect(existing.titles.BOB).toBe(1)
  })
})
