import { describe, expect, it } from 'vitest'
import { computeDogOrganizationStats } from './DogOrganizationsSection'

describe('computeDogOrganizationStats with discipline filter', () => {
  const mixedCompetitions = [
    // Курсинг: 2 старта, 2 победы
    { event_id: 1, host_club: 'ВГООКС «Сириус»', placement: 1, total_score: 350, event_type: 'coursing' },
    { event_id: 2, host_club: 'ВГООКС «Сириус»', placement: 1, total_score: 352, event_type: 'coursing' },
    // Рейсинг: 2 старта, 0 побед
    { event_id: 3, host_club: 'МОРОО «Федерация спортивно-прикладного собаководства»', placement: 2, total_score: null, event_type: 'racing' },
    { event_id: 4, host_club: 'МОРОО «Федерация спортивно-прикладного собаководства»', placement: 3, total_score: null, event_type: 'racing' },
  ]

  it('computes overall stats when discipline is "all"', () => {
    const stats = computeDogOrganizationStats(mixedCompetitions, 'all')
    expect(stats).not.toBeNull()
    expect(stats?.total_starts).toBe(4)
    expect(stats?.total_wins).toBe(2)
    expect(stats?.career_win_rate).toBe(50)
    expect(stats?.orgs_count).toBe(2)
  })

  it('filters only coursing competitions when discipline is "coursing"', () => {
    const stats = computeDogOrganizationStats(mixedCompetitions, 'coursing')
    expect(stats).not.toBeNull()
    expect(stats?.total_starts).toBe(2)
    expect(stats?.total_wins).toBe(2)
    expect(stats?.career_win_rate).toBe(100)
    expect(stats?.orgs_count).toBe(1)
    expect(stats?.higher_than_career[0].short_name).toBe('ВГООКС «Сириус»')
  })

  it('filters only racing competitions when discipline is "racing"', () => {
    const stats = computeDogOrganizationStats(mixedCompetitions, 'racing')
    expect(stats).not.toBeNull()
    expect(stats?.total_starts).toBe(2)
    expect(stats?.total_wins).toBe(0)
    expect(stats?.career_win_rate).toBe(0)
    expect(stats?.orgs_count).toBe(1)
    expect(stats?.lower_than_career[0].short_name).toBe('МОРОО «ФСПС»')
  })
})
