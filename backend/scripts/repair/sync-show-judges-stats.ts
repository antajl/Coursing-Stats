import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { cdnPackShardKey } from '../../lib/cdn-packs'
import { writeJudgesPage0 } from '../shows/generate-show-page0-indexes'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')
const INDEXES_DIR = path.join(ROOT, 'data/v1/shows/indexes')
const DETAILS_DIR = path.join(INDEXES_DIR, 'judge-details')

function extractYear(d?: string): string | null {
  if (!d) return null
  const iso = d.match(/^(\d{4})/)
  if (iso) return iso[1]
  const dmy = d.match(/(\d{4})$/)
  if (dmy) return dmy[1]
  return null
}

export function syncShowJudgesStats() {
  console.log('--- Starting Show Judges Stats Synchronization ---')

  const judgesPath = path.join(INDEXES_DIR, 'judges.json')
  const judges: any[] = JSON.parse(fs.readFileSync(judgesPath, 'utf8'))
  console.log(`Loaded ${judges.length} judges from judges.json`)

  const packFiles = fs.readdirSync(DETAILS_DIR).filter((f) => /^pack-.*\.json$/.test(f))
  console.log(`Found ${packFiles.length} detail pack files`)

  const detailsByKey = new Map<string, any>()

  for (const f of packFiles) {
    const full = path.join(DETAILS_DIR, f)
    const doc = JSON.parse(fs.readFileSync(full, 'utf8'))
    if (doc && doc.byKey) {
      for (const [k, v] of Object.entries(doc.byKey)) {
        detailsByKey.set(k, v)
      }
    }
  }

  console.log(`Loaded ${detailsByKey.size} judge details from packs`)

  let updatedDetailsCount = 0

  for (const detail of detailsByKey.values()) {
    const exhibitions = detail.exhibitions || []

    // 1. Gather all grade counts
    const totalGrades: Record<string, number> = {
      excellent: 0,
      very_good: 0,
      good: 0,
      satisfactory: 0,
      dq: 0,
      very_promising: 0,
      promising: 0,
    }

    const byYearAdultGraded: Record<string, number> = {}
    const byYearAdultExc: Record<string, number> = {}
    const byYearPuppyGraded: Record<string, number> = {}
    const byYearPuppyVp: Record<string, number> = {}

    let hasExhibitionGrades = false

    for (const ex of exhibitions) {
      const y = extractYear(ex.date)
      const gc = ex.grade_counts || {}
      for (const [k, v] of Object.entries(gc)) {
        if (typeof v === 'number' && v > 0) {
          totalGrades[k] = (totalGrades[k] || 0) + v
          hasExhibitionGrades = true
        }
      }

      if (y) {
        const exc = gc.excellent || 0
        const vg = gc.very_good || 0
        const good = gc.good || 0
        const sat = gc.satisfactory || 0
        const dq = gc.dq || 0
        const vp = gc.very_promising || 0
        const prom = gc.promising || 0

        const adult = exc + vg + good + sat + dq
        const puppy = vp + prom

        if (adult > 0) {
          byYearAdultGraded[y] = (byYearAdultGraded[y] || 0) + adult
          byYearAdultExc[y] = (byYearAdultExc[y] || 0) + exc
        }
        if (puppy > 0) {
          byYearPuppyGraded[y] = (byYearPuppyGraded[y] || 0) + puppy
          byYearPuppyVp[y] = (byYearPuppyVp[y] || 0) + vp
        }
      }
    }

    // Fallback if detail has strictness.grades but exhibitions lacked per-exhibition breakdown
    if (!hasExhibitionGrades && detail.strictness?.grades) {
      for (const [k, v] of Object.entries(detail.strictness.grades)) {
        if (typeof v === 'number') totalGrades[k] = v
      }
    }

    const adultGraded =
      (totalGrades.excellent || 0) +
      (totalGrades.very_good || 0) +
      (totalGrades.good || 0) +
      (totalGrades.satisfactory || 0) +
      (totalGrades.dq || 0)

    const puppyGraded =
      (totalGrades.very_promising || 0) +
      (totalGrades.promising || 0)

    const totalDogs = adultGraded + puppyGraded

    const excellentRate = adultGraded > 0 ? (totalGrades.excellent || 0) / adultGraded : null
    const belowExcellentRate = adultGraded > 0 ? (adultGraded - (totalGrades.excellent || 0)) / adultGraded : null
    const puppyRate = puppyGraded > 0 ? (totalGrades.very_promising || 0) / puppyGraded : null

    // By-year rates
    const by_year_excellent: Record<string, number> = {}
    for (const [yr, cnt] of Object.entries(byYearAdultGraded)) {
      if (cnt > 0) {
        by_year_excellent[yr] = (byYearAdultExc[yr] || 0) / cnt
      }
    }

    const by_year_puppy_rate: Record<string, number> = {}
    for (const [yr, cnt] of Object.entries(byYearPuppyGraded)) {
      if (cnt > 0) {
        by_year_puppy_rate[yr] = (byYearPuppyVp[yr] || 0) / cnt
      }
    }

    const by_year_total_dogs: Record<string, number> = {}
    const allYears = new Set([...Object.keys(byYearAdultGraded), ...Object.keys(byYearPuppyGraded)])
    for (const yr of allYears) {
      by_year_total_dogs[yr] = (byYearAdultGraded[yr] || 0) + (byYearPuppyGraded[yr] || 0)
    }

    // Update detail
    detail.strictness = {
      graded: adultGraded,
      grades: totalGrades,
      excellent_rate: excellentRate,
      below_excellent_rate: belowExcellentRate,
    }
    detail.puppy_graded = puppyGraded
    detail.puppy_rate = puppyRate
    detail.total_dogs = totalDogs

    if (Object.keys(byYearPuppyGraded).length > 0) {
      detail.by_year_puppy_graded = byYearPuppyGraded
      detail.by_year_puppy_rate = by_year_puppy_rate
    }
    if (Object.keys(by_year_total_dogs).length > 0) {
      detail.by_year_total_dogs = by_year_total_dogs
    }

    updatedDetailsCount++
  }

  console.log(`Recalibrated ${updatedDetailsCount} judge details with separate adult/puppy stats`)

  // Save updated packs
  const buckets = new Map<string, Record<string, any>>()
  for (const [key, detail] of detailsByKey.entries()) {
    const shard = cdnPackShardKey(key)
    const bucket = buckets.get(shard) || {}
    bucket[key] = detail
    buckets.set(shard, bucket)
  }

  for (const [shard, byKey] of [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const body = JSON.stringify({
      schema: 'coursing-stats/show-judge-detail-pack-v1',
      shard,
      byKey,
    })
    fs.writeFileSync(path.join(DETAILS_DIR, `pack-${shard}.json`), body, 'utf8')
  }
  console.log(`Saved ${buckets.size} packs to ${DETAILS_DIR}`)

  // Update judges.json
  function showJudgeDetailFileKey(id: string): string {
    return Buffer.from(id, 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  let matchedJudges = 0
  for (const j of judges) {
    const key = showJudgeDetailFileKey(j.id)
    const detail = detailsByKey.get(key)
    if (detail) {
      matchedJudges++
      j.graded = detail.strictness.graded
      j.excellent_rate = detail.strictness.excellent_rate
      j.puppy_graded = detail.puppy_graded
      j.puppy_rate = detail.puppy_rate
      j.total_dogs = detail.total_dogs

      // By year adult
      const byYearAdultGraded: Record<string, number> = {}
      const byYearAdultExc: Record<string, number> = {}
      for (const ex of detail.exhibitions || []) {
        const y = extractYear(ex.date)
        if (!y) continue
        const gc = ex.grade_counts || {}
        const adult = (gc.excellent || 0) + (gc.very_good || 0) + (gc.good || 0) + (gc.satisfactory || 0) + (gc.dq || 0)
        if (adult > 0) {
          byYearAdultGraded[y] = (byYearAdultGraded[y] || 0) + adult
          byYearAdultExc[y] = (byYearAdultExc[y] || 0) + (gc.excellent || 0)
        }
      }
      const by_year_excellent: Record<string, number> = {}
      for (const [yr, cnt] of Object.entries(byYearAdultGraded)) {
        if (cnt > 0) by_year_excellent[yr] = (byYearAdultExc[yr] || 0) / cnt
      }

      if (Object.keys(byYearAdultGraded).length > 0) {
        j.by_year_graded = byYearAdultGraded
        j.by_year_excellent = by_year_excellent
      }

      if (detail.by_year_puppy_graded) {
        j.by_year_puppy_graded = detail.by_year_puppy_graded
        j.by_year_puppy_rate = detail.by_year_puppy_rate
      }
      if (detail.by_year_total_dogs) {
        j.by_year_total_dogs = detail.by_year_total_dogs
      }
    }
  }

  fs.writeFileSync(judgesPath, JSON.stringify(judges), 'utf8')
  console.log(`Updated judges.json (${matchedJudges}/${judges.length} matched with details)`)

  writeJudgesPage0(judges)
  console.log('Regenerated judges-page0.json')

  console.log('--- Show Judges Stats Synchronization Complete ---')
}

if (process.argv[1] && process.argv[1].endsWith('sync-show-judges-stats.ts')) {
  syncShowJudgesStats()
}
