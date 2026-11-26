import { describe, expect, it } from 'vitest'
import {
  buildCriteriaInsights,
  COURSING_CRITERIA_ITEMS,
  type DogCoursingCriteriaSummary,
} from './coursingCriteriaTypes'

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
