import { describe, expect, it } from 'vitest'
import { medalStrength, standingScore } from '../../lib/eloRank'
import { buildCombinedRanking } from './mergeCombinedRanking'

describe('medalStrength / standingScore', () => {
  it('weights gold > silver > bronze', () => {
    expect(medalStrength({ gold: 1, silver: 2, bronze: 2 })).toBe(3 + 2 + 1)
  })

  it('standingScore divides by starts + 4 (no prior medals in numerator)', () => {
    // 1 gold / 1 start → 3/5 = 0.6 (does not flash above dense seasons)
    expect(standingScore({ gold: 1, total_starts: 1 })).toBeCloseTo(0.6, 5)
    // 7 gold / 9 starts → 21/13
    expect(standingScore({ gold: 7, total_starts: 9 })).toBeCloseTo(21 / 13, 5)
  })
})

describe('buildCombinedRanking season standing B', () => {
  it('ranks by standingScore and ignores higher Elo', () => {
    const rows = buildCombinedRanking(
      [
        {
          dog_id: 1,
          name_lat: 'Medals',
          breed: 'x',
          gold: 5,
          silver: 1,
          bronze: 2,
          total_starts: 10,
        },
        {
          dog_id: 2,
          name_lat: 'EloFlash',
          breed: 'x',
          gold: 0,
          silver: 0,
          bronze: 0,
          total_starts: 2,
        },
      ],
      [
        { dog_id: 1, rating_score: 84, judge_eval_count: 10 },
        { dog_id: 2, rating_score: 90, judge_eval_count: 10 },
      ],
      [
        { dog_id: 1, elo_rating: 1450, elo_races: 20 },
        { dog_id: 2, elo_rating: 1600, elo_races: 20 },
      ]
    )
    expect(rows[0].dog_id).toBe(1)
    expect(rows[1].elo_rating).toBe(1600)
  })

  it('uses CS when standingScores are within gap', () => {
    const rows = buildCombinedRanking(
      [
        { dog_id: 1, name_lat: 'A', breed: 'x', gold: 2, total_starts: 5 },
        { dog_id: 2, name_lat: 'B', breed: 'x', gold: 2, total_starts: 5 },
      ],
      [
        { dog_id: 1, rating_score: 84, judge_eval_count: 5 },
        { dog_id: 2, rating_score: 87, judge_eval_count: 5 },
      ],
      []
    )
    expect(rows[0].dog_id).toBe(2)
  })

  it('does not demote low elo_races dogs into a separate pool', () => {
    const rows = buildCombinedRanking(
      [
        { dog_id: 1, name_lat: 'FewRaces', breed: 'x', gold: 4, total_starts: 5 },
        { dog_id: 2, name_lat: 'ManyRaces', breed: 'x', gold: 0, total_starts: 20 },
      ],
      [
        { dog_id: 1, rating_score: 85, judge_eval_count: 5 },
        { dog_id: 2, rating_score: 85, judge_eval_count: 5 },
      ],
      [
        { dog_id: 1, elo_rating: 1400, elo_races: 2 },
        { dog_id: 2, elo_rating: 1550, elo_races: 40 },
      ]
    )
    expect(rows[0].dog_id).toBe(1)
  })

  it('does not let career medals/starts from Elo year index overwrite season stats', () => {
    const rows = buildCombinedRanking(
      [
        {
          dog_id: 5735,
          name_lat: 'DZHANA',
          breed: 'БАСЕНДЖИ',
          gold: 2,
          silver: 1,
          bronze: 0,
          total_starts: 3,
        },
      ],
      [
        {
          dog_id: 5735,
          rating_score: 85.09,
          judge_eval_count: 12,
          avg_judge_score: 82.5,
          best_judge_score: 86,
          best_score: 333,
          total_starts: 3,
        },
      ],
      [
        {
          dog_id: 5735,
          elo_rating: 1561,
          elo_races: 6,
          // Career fields from dog-profile snapshot in top-elo-YYYY
          gold: 16,
          silver: 2,
          bronze: 0,
          total_starts: 19,
          best_score: 356,
          avg_judge_score: 85.52,
          rating_score: 90,
        },
      ]
    )
    expect(rows).toHaveLength(1)
    const dog = rows[0]
    expect(dog.gold).toBe(2)
    expect(dog.silver).toBe(1)
    expect(dog.bronze).toBe(0)
    expect(dog.total_starts).toBe(3)
    expect(dog.rating_score).toBe(85.09)
    expect(dog.best_score).toBe(333)
    expect(dog.avg_judge_score).toBe(82.5)
    expect(dog.elo_rating).toBe(1561)
    expect(dog.elo_races).toBe(6)
  })
})
