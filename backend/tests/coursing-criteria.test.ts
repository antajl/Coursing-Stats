import { describe, expect, it } from 'vitest'
import {
  buildDogCoursingCriteriaMap,
  extractHeatCriteriaTuples,
} from '../lib/coursing-criteria'

describe('coursing-criteria aggregator', () => {
  it('averages multiple judges per heat and skips disqualified heats', () => {
    const raw = JSON.stringify({
      heats: [
        {
          heat_number: 1,
          judges: [
            { scores: [18, 19, 17, 18, 19] },
            { scores: [16, 17, 17, 18, 17] },
          ],
          disqualified: false,
        },
        {
          heat_number: 2,
          judges: [{ scores: [10, 10, 10, 10, 10] }],
          disqualified: true,
        },
      ],
    })

    const tuples = extractHeatCriteriaTuples(raw)
    expect(tuples).toHaveLength(1)
    expect(tuples[0].roundNumber).toBe(1)
    expect(tuples[0].scores).toEqual([17, 18, 17, 18, 18])
  })

  it('ignores all-zero placeholder arrays and invalid lengths', () => {
    const raw = JSON.stringify({
      heats: [
        { heat_number: 1, judges: [{ scores: [0, 0, 0, 0, 0] }, { scores: [18, 17] }] },
      ],
    })
    expect(extractHeatCriteriaTuples(raw)).toEqual([])
  })

  it('computes peer breed baseline (excluding lone dog) and run1 vs run2 averages', () => {
    const rows = [
      {
        dog_id: 1,
        event_id: 100,
        raw_scores_json: JSON.stringify({
          heats: [
            { heat_number: 1, judges: [{ scores: [18, 19, 18, 17, 19] }] },
            { heat_number: 2, judges: [{ scores: [18, 18, 16, 17, 18] }] },
          ],
        }),
      },
      // Peer whippet runs (>= 5 total peer heats, >= 3 last-round peer heats)
      ...[2, 3, 4].map((dogId) => ({
        dog_id: dogId,
        event_id: 100,
        raw_scores_json: JSON.stringify({
          heats: [
            { heat_number: 1, judges: [{ scores: [16, 17, 17, 16, 17] }] },
            { heat_number: 2, judges: [{ scores: [15, 16, 16, 15, 16] }] },
          ],
        }),
      })),
      // Rare breed with only 1 dog -> should fall back to global baseline
      {
        dog_id: 99,
        event_id: 100,
        raw_scores_json: JSON.stringify({
          heats: [{ heat_number: 1, judges: [{ scores: [15, 16, 15, 15, 16] }] }],
        }),
      },
    ]

    const breeds: Record<number, string> = {
      1: 'УИППЕТ',
      2: 'УИППЕТ',
      3: 'УИППЕТ',
      4: 'УИППЕТ',
      99: 'АЗАВАК',
    }

    const result = buildDogCoursingCriteriaMap(rows, (id) => breeds[id] || '')
    const whippet1 = result.get(1)!
    expect(whippet1.events_count).toBe(1)
    expect(whippet1.heats_count).toBe(2)
    expect(whippet1.dog_avg).toEqual([18, 18.5, 17, 17, 18.5])
    expect(whippet1.run1_avg).toEqual([18, 19, 18, 17, 19])
    expect(whippet1.run2_avg).toEqual([18, 18, 16, 17, 18])
    expect(whippet1.breed_avg).toEqual([15.5, 16.5, 16.5, 15.5, 16.5])
    expect(whippet1.breed_heats_count).toBe(6)
    expect(whippet1.is_global_baseline).toBeUndefined()
    expect(whippet1.breed_last_avg).toEqual([15, 16, 16, 15, 16])
    expect(whippet1.breed_last_heats_count).toBe(3)
    expect(whippet1.is_last_global_baseline).toBeUndefined()

    const azavak = result.get(99)!
    expect(azavak.is_global_baseline).toBe(true)
    expect(azavak.breed_heats_count).toBe(9)
    expect(azavak.run2_avg).toBeNull()
    expect(azavak.breed_last_avg).toBeNull()
  })
})
