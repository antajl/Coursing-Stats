import { describe, expect, it } from 'vitest'
import {
  buildCriteriaInsights,
  COURSING_CRITERIA_ITEMS,
  type DogCoursingCriteriaSummary,
} from './coursingCriteriaTypes'
import {
  computeDogSpeedBreedComparison,
  extractDogRacingSpeed,
  formatSpeedInsight,
} from './coursingSpeedBenchmark'

describe('buildCriteriaInsights', () => {
  it('picks the highest-scoring criterion and delta vs breed', () => {
    const sample: DogCoursingCriteriaSummary = {
      events_count: 3,
      heats_count: 6,
      dog_avg: [17.5, 18.8, 16.4, 17.2, 18.1],
      breed_avg: [17.0, 17.5, 17.0, 17.0, 17.6],
      breed_heats_count: 140,
      run1_avg: [17.6, 18.9, 17.2, 17.2, 18.2],
      run2_avg: [17.4, 18.7, 15.6, 17.2, 18.0],
    }

    const insight = buildCriteriaInsights(sample)
    expect(COURSING_CRITERIA_ITEMS).toHaveLength(5)
    expect(insight.strongestLabel).toBe('Резвость')
    expect(insight.strongestScore).toBe(18.8)
    expect(insight.strongestDelta).toBe(1.3)
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

  it('compares racing avg_speed against same canonical breed using breed max_speed as 100% ceiling', () => {
    const res = computeDogSpeedBreedComparison({
      racingStats: {
        avg_speed: '55.20',
        best_speed: '56.10',
        run1_avg_speed: '54.40',
        run2_avg_speed: '55.90',
        run3_avg_speed: '56.00',
        first_avg_speed: '54.40',
        last_avg_speed: '56.05',
        last_heat_max: 3,
      },
      breed: 'Уиппет',
      dogId: 1,
      items: indexItems,
    })
    expect(res).not.toBeNull()
    expect(res?.kind).toBe('avg')
    expect(res?.peerCount).toBe(2)
    expect(res?.breedAvg).toBeCloseTo(53.0, 5)
    expect(res?.breedMaxSpeed).toBeCloseTo(56.1, 5)
    expect(res?.delta).toBeCloseTo(2.2, 5)
    expect(res?.fillPct).toBeCloseTo((55.2 / 56.1) * 100, 4)
    expect(res?.breedMarkerPct).toBeCloseTo((53.0 / 56.1) * 100, 4)
    expect(res?.firstRunSpeed).toBeCloseTo(54.4, 5)
    expect(res?.lastRunSpeed).toBeCloseTo(56.05, 5)
    expect(res?.lastHeatMax).toBe(3)
    expect(formatSpeedInsight(res!)).toBe('55.2 км/ч (+2.2 к породе, лучшая 56.1)')
  })

  it('formats speed insight cleanly when near breed average or best-only', () => {
    const steady = computeDogSpeedBreedComparison({
      racingStats: { avg_speed: '53.05', best_speed: '53.05' },
      breed: 'Уиппет',
      dogId: 10,
      items: indexItems.filter((row) => row.dog_id !== 1),
    })
    expect(steady).not.toBeNull()
    expect(formatSpeedInsight(steady!)).toBe('53.0 км/ч (на уровне породы)')
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
