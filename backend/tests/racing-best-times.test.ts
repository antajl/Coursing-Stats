import { describe, expect, it } from 'vitest'
import { getBestTimesByRace } from '../../frontend/src/pages/Events/EventResults/utils'
import { normalizeQualificationAndVc } from '../../frontend/src/pages/Events/EventResults/ResultSummary'
import type { Result } from '../../frontend/src/pages/Events/EventResults/types'

describe('getBestTimesByRace', () => {
  it('correctly calculates fastest time per race with multiple participants', () => {
    const results: Result[] = [
      {
        dog_id: 1,
        raw_scores_json: JSON.stringify({
          format: 'racing',
          heats: [
            { heat_number: 1, bib_number: 11, time: 32.74, bib_color: 'white' },
            { heat_number: 2, bib_number: 28, time: 32.82, bib_color: 'red' },
            { heat_number: 3, bib_number: 41, time: 32.61, bib_color: 'red' },
          ],
        }),
      },
      {
        dog_id: 2,
        raw_scores_json: JSON.stringify({
          format: 'racing',
          heats: [
            { heat_number: 1, bib_number: 11, time: 43.48, bib_color: 'red' },
            { heat_number: 2, bib_number: 28, time: 33.09, bib_color: 'blue' },
            { heat_number: 3, bib_number: 41, time: 32.91, bib_color: 'blue' },
          ],
        }),
      },
      {
        dog_id: 3,
        raw_scores_json: JSON.stringify({
          format: 'racing',
          heats: [
            { heat_number: 1, bib_number: 11, time: 46.96, bib_color: 'blue' },
            { heat_number: 2, bib_number: 28, time: 36.88, bib_color: 'white' },
            { heat_number: 3, bib_number: 41, time: 36.06, bib_color: 'white' },
          ],
        }),
      },
    ]

    const bestTimes = getBestTimesByRace(results)

    expect(bestTimes['11']).toBeCloseTo(32.74)
    expect(bestTimes['28']).toBeCloseTo(32.82)
    expect(bestTimes['41']).toBeCloseTo(32.61)
  })

  it('excludes disqualified runs and recognizes remaining winner', () => {
    const results: Result[] = [
      {
        dog_id: 1,
        raw_scores_json: JSON.stringify({
          format: 'racing',
          heats: [
            { heat_number: 1, bib_number: 5, time: 24.1, disqualified: true },
          ],
        }),
      },
      {
        dog_id: 2,
        raw_scores_json: JSON.stringify({
          format: 'racing',
          heats: [
            { heat_number: 1, bib_number: 5, time: 25.0, disqualified: false },
          ],
        }),
      },
    ]

    const bestTimes = getBestTimesByRace(results)
    expect(bestTimes['5']).toBe(25.0)
  })

  it('ignores solo runs where only 1 dog was scheduled', () => {
    const results: Result[] = [
      {
        dog_id: 1,
        raw_scores_json: JSON.stringify({
          format: 'racing',
          heats: [
            { heat_number: 1, bib_number: 99, time: 30.5 },
          ],
        }),
      },
    ]

    const bestTimes = getBestTimesByRace(results)
    expect(bestTimes['99']).toBeUndefined()
  })

  it('ignores absent/dns participants from counting towards live heats', () => {
    const results: Result[] = [
      {
        dog_id: 1,
        status: 'dns',
        raw_scores_json: JSON.stringify({
          format: 'racing',
          heats: [{ heat_number: 1, bib_number: 7, time: 30.0 }],
        }),
      },
      {
        dog_id: 2,
        status: 'finished',
        raw_scores_json: JSON.stringify({
          format: 'racing',
          heats: [{ heat_number: 1, bib_number: 7, time: 28.5 }],
        }),
      },
    ]

    // Only 1 finished dog in bib 7, DNS didn't run -> solo run
    const bestTimes = getBestTimesByRace(results)
    expect(bestTimes['7']).toBeUndefined()
  })
})

describe('normalizeQualificationAndVc', () => {
  it('swaps inverted VC and qualification when VC holds titles and qual holds CC', () => {
    const normalized = normalizeQualificationAndVc({
      dog_id: 1,
      qualification: 'CC',
      vc: 'Чемпион России, CACLBr, RegCACL',
    })

    expect(normalized.qualification).toBe('Чемпион России, CACLBr, RegCACL')
    expect(normalized.vc).toBe('CC')
  })

  it('keeps normal short VC and normal qualification intact', () => {
    const normalized = normalizeQualificationAndVc({
      dog_id: 2,
      qualification: 'CACL, RegCACL',
      vc: 'CC',
    })

    expect(normalized.qualification).toBe('CACL, RegCACL')
    expect(normalized.vc).toBe('CC')
  })

  it('clears long VC to qualification if qualification was empty', () => {
    const normalized = normalizeQualificationAndVc({
      dog_id: 3,
      qualification: null,
      vc: 'CACL, RegCACL',
    })

    expect(normalized.qualification).toBe('CACL, RegCACL')
    expect(normalized.vc).toBeNull()
  })

  it('ignores pure numeric values mistakenly stored in vc', () => {
    const normalized = normalizeQualificationAndVc({
      dog_id: 4,
      qualification: 'CACL',
      vc: '18',
    })

    expect(normalized.qualification).toBe('CACL')
    expect(normalized.vc).toBeNull()
  })

  it('deduplicates vc if qualification already contains it', () => {
    const normalized = normalizeQualificationAndVc({
      dog_id: 5,
      qualification: 'CACL, CC',
      vc: 'CC',
    })

    expect(normalized.qualification).toBe('CACL, CC')
    expect(normalized.vc).toBeNull()
  })
})
