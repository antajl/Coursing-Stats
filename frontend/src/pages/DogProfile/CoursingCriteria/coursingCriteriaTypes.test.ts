import { describe, expect, it } from 'vitest'
import {
  buildCriteriaInsights,
  COURSING_CRITERIA_ITEMS,
  type DogCoursingCriteriaSummary,
} from './coursingCriteriaTypes'
import {
  computeDogSpeedBreedComparison,
  extractDogRacingSpeed,
} from './coursingSpeedBenchmark'

describe('buildCriteriaInsights', () => {
  it('picks the highest-scoring criterion and computes round2 vs round1 stamina note', () => {
    const sample: DogCoursingCriteriaSummary = {
      events_count: 3,
      heats_count: 6,
      dog_avg: [17.5, 18.8, 16.4, 17.2, 18.1],
      breed_avg: [17.0, 17.5, 17.0, 17.0, 17.6],
      breed_heats_count: 140,
      run1_avg: [17.6, 18.9, 17.2, 17.2, 18.2],
      run2_avg: [17.4, 18.7, 15.6, 17.2, 18.0],
    }

    const insight = buildCriteriaInsights(sample, 'Уиппет')
    expect(COURSING_CRITERIA_ITEMS).toHaveLength(5)
    expect(insight.strongestLabel).toBe('Резвость')
    expect(insight.strongestScore).toBe(18.8)
    expect(insight.strongestDelta).toBe(1.3)
    expect(insight.roundNote).toContain('Во 2-м круге')
    expect(insight.roundNote).toContain('выносливость -1.6')
  })

  it('handles steady two-round performance cleanly', () => {
    const sample: DogCoursingCriteriaSummary = {
      events_count: 1,
      heats_count: 2,
      dog_avg: [18.0, 18.0, 18.0, 18.0, 18.0],
      breed_avg: [17.0, 17.0, 17.0, 17.0, 17.0],
      breed_heats_count: 40,
      run1_avg: [18.0, 18.0, 18.0, 18.0, 18.0],
      run2_avg: [18.1, 18.0, 18.1, 18.0, 18.0],
    }

    const insight = buildCriteriaInsights(sample, 'Салюки')
    expect(insight.roundNote).toContain('ровный темп обоих забегов')
  })
})

describe('computeDogSpeedBreedComparison', () => {
  const indexItems = [
    { dog_id: 1, breed: 'УИППЕТ', avg_speed: 55.2, best_speed: 56.1 },
    { dog_id: 2, breed: 'Уиппет', avg_speed: 52.0, best_speed: 53.4 },
    { dog_id: 3, breed: 'WHIPPET', avg_speed: 54.0, best_speed: 55.0 },
    { dog_id: 4, breed: 'Салюки', avg_speed: 50.0, best_speed: 51.0 },
    { dog_id: 5, breed: 'Салюки', avg_speed: 51.0, best_speed: 52.0 },
    { dog_id: 6, breed: 'Борзая', avg_speed: 59.0, best_speed: 60.0 },
  ]

  it('compares racing avg_speed against same canonical breed excluding the dog itself', () => {
    const res = computeDogSpeedBreedComparison({
      racingStats: { avg_speed: '55.20', best_speed: '56.10' },
      breed: 'Уиппет',
      dogId: 1,
      items: indexItems,
    })
    expect(res).not.toBeNull()
    expect(res?.kind).toBe('avg')
    expect(res?.peerCount).toBe(2)
    expect(res?.breedAvg).toBeCloseTo(53.0, 5)
    expect(res?.delta).toBeCloseTo(2.2, 5)
    expect(res!.fillPct).toBeGreaterThan(res!.breedMarkerPct)
  })

  it('returns null when fewer than 2 same-breed peers exist', () => {
    const res = computeDogSpeedBreedComparison({
      racingStats: { avg_speed: '59.00' },
      breed: 'Борзая',
      dogId: 6,
      items: indexItems,
    })
    expect(res).toBeNull()
  })

  it('returns null when dog has no racing speed data', () => {
    expect(extractDogRacingSpeed(null)).toBeNull()
    expect(extractDogRacingSpeed({ total_starts: 0, avg_speed: '' })).toBeNull()
    const res = computeDogSpeedBreedComparison({
      racingStats: {},
      breed: 'Уиппет',
      dogId: 99,
      items: indexItems,
    })
    expect(res).toBeNull()
  })
})
