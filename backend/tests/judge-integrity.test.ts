import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { judgeDetailKey } from '../src/lib/static-api'
import { cdnPackShardKey, showJudgeDetailPackPath } from '../lib/cdn-packs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const DATA_V1 = path.join(ROOT, 'data/v1')

function readJson<T>(relPath: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_V1, relPath), 'utf-8')) as T
}

describe('Judge Data Integrity (List vs Profile consistency)', () => {
  describe('Sport Judges (indexes/judges-summary.json vs judge-details/*.json)', () => {
    const summaryPath = path.join(DATA_V1, 'indexes/judges-summary.json')
    const skipSport = !fs.existsSync(summaryPath)

    it.skipIf(skipSport)('every judge summary matches their individual detail profile exactly', () => {
      const summary = readJson<{
        count: number
        judges: Array<{
          id: string
          name: string
          total_evaluations: number
          total_evaluations_count: number
          avg_score: number | null
          unique_breeds: number
          unique_events: number
          unique_dogs: number
        }>
      }>('indexes/judges-summary.json')

      expect(Array.isArray(summary.judges)).toBe(true)
      expect(summary.judges.length).toBeGreaterThan(0)

      for (const judge of summary.judges) {
        const fileKey = judgeDetailKey(judge.name)
        const detailRel = `indexes/judge-details/${fileKey}.json`
        const detailFull = path.join(DATA_V1, detailRel)

        expect(
          fs.existsSync(detailFull),
          `Missing detail profile for judge: "${judge.name}" at ${detailRel}`,
        ).toBe(true)

        const detail = readJson<{
          judge_name: string
          total_evaluations: number
          avg_score: number | null
          breed_stats: Array<{ breed: string; count?: number; dogs?: Array<{ events?: Array<{ date?: string; title?: string }> }> }>
        }>(detailRel)

        // 1. Total evaluations must match
        expect(
          judge.total_evaluations,
          `Evaluations mismatch for "${judge.name}": summary=${judge.total_evaluations}, detail=${detail.total_evaluations}`,
        ).toBe(detail.total_evaluations)

        // 2. Total evaluations count (забегов / листов оценок) must match Math.round(total / 5)
        expect(judge.total_evaluations_count).toBe(Math.round(detail.total_evaluations / 5))

        // 3. Average score must match within floating precision
        if (judge.avg_score != null && detail.avg_score != null) {
          expect(judge.avg_score).toBeCloseTo(detail.avg_score, 4)
        } else {
          expect(judge.avg_score).toBe(detail.avg_score)
        }

        // 4. Unique breeds count must match
        expect(judge.unique_breeds).toBe(detail.breed_stats.length)

        // 5. Unique events in detail must match summary.unique_events
        const distinctEvents = new Set<string>()
        for (const b of detail.breed_stats) {
          for (const d of b.dogs || []) {
            for (const ev of d.events || []) {
              distinctEvents.add(`${ev.date || ''}|${ev.title || ''}`)
            }
          }
        }
        expect(
          judge.unique_events,
          `Events mismatch for "${judge.name}": summary=${judge.unique_events}, detail distinct events=${distinctEvents.size}`,
        ).toBe(distinctEvents.size)
      }
    })
  })

  describe('Show Judges (shows/indexes/judges.json vs judge-details/pack-*.json)', () => {
    const showJudgesPath = path.join(DATA_V1, 'shows/indexes/judges.json')
    const skipShow = !fs.existsSync(showJudgesPath)

    it.skipIf(skipShow)('every show judge matches their detail in CDN packs', () => {
      const judges = readJson<
        Array<{
          id: string
          name: string
          total_judged: number
          unique_breeds: number
          breeds: string[]
          by_year: Record<string, number>
          excellent_rate: number | null
          graded: number
        }>
      >('shows/indexes/judges.json')

      expect(Array.isArray(judges)).toBe(true)
      expect(judges.length).toBeGreaterThan(0)

      // Test a representative sample of judges
      const sample = judges.slice(0, 100)
      const packCache = new Map<string, Record<string, any>>()

      for (const j of sample) {
        const fileKey = judgeDetailKey(j.id)
        const shard = cdnPackShardKey(fileKey)
        let pack = packCache.get(shard)
        if (!pack) {
          const packRel = showJudgeDetailPackPath(shard)
          const packData = readJson<{ byKey: Record<string, any> }>(packRel)
          pack = packData.byKey
          packCache.set(shard, pack)
        }

        const detail = pack[fileKey]
        expect(detail, `Missing detail for show judge ${j.id} (${j.name}) in shard ${shard}`).toBeDefined()

        // 1. total_judged must match
        expect(j.total_judged).toBe(detail.total_judged)
        expect(j.total_judged).toBe(detail.exhibitions.length)

        // 2. unique_breeds must match
        expect(j.unique_breeds).toBe(detail.unique_breeds)
        expect(j.unique_breeds).toBe(detail.breeds.length)

        // 3. graded count must match
        const detailGraded = detail.strictness ? detail.strictness.graded : 0
        expect(j.graded).toBe(detailGraded)

        // 4. excellent rate must match
        if (j.excellent_rate != null && detail.strictness?.excellent_rate != null) {
          expect(j.excellent_rate).toBeCloseTo(detail.strictness.excellent_rate, 4)
        }
      }
    })
  })
})
