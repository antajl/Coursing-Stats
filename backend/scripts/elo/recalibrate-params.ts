/**
 * Elo v2 recalibration: grid search scale × K0 on scored pairs only (time-series CV).
 * Writes tasks/elo-calibration/elo-v2-calibration-report.md
 */
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import {
  calculateEloRatings,
  calculateActualScore,
  calculateExpectedScore,
  type Race,
  type DogRating,
} from '../../lib/rating/elo-calculator'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const RACES_FILE = resolve(__dirname, '../../../tasks/elo-calibration/races-data.json')
const REPORT_FILE = resolve(__dirname, '../../../tasks/elo-calibration/elo-v2-calibration-report.md')

const SCALES = [5, 8, 10, 12]
const K0S = [40, 45, 50, 55, 60]
const FOLDS = 5
const MIN_BREED_RACES = 100
const BASELINE_SCALE = 8
const BASELINE_K0 = 50

function scoredOnly(races: Race[]): Race[] {
  return races.filter((r) => (r.outcome ?? 'scored') === 'scored' && r.breed_a === r.breed_b)
}

function logLossForTest(testRaces: Race[], ratings: Map<number, DogRating>, scale: number): number {
  let total = 0
  let n = 0
  for (const race of testRaces) {
    const a = ratings.get(race.dog_id_a)
    const b = ratings.get(race.dog_id_b)
    if (!a || !b) continue
    const e = calculateExpectedScore(a.rating, b.rating)
    const s = calculateActualScore(race.score_a, race.score_b, scale)
    const clampedE = Math.min(1 - 1e-12, Math.max(1e-12, e))
    total += -s * Math.log(clampedE) - (1 - s) * Math.log(1 - clampedE)
    n++
  }
  return n === 0 ? Infinity : total / n
}

function baselineLogLoss(testRaces: Race[], scale: number): number {
  let total = 0
  for (const race of testRaces) {
    const s = calculateActualScore(race.score_a, race.score_b, scale)
    total += -s * Math.log(0.5) - (1 - s) * Math.log(0.5)
  }
  return total / testRaces.length
}

function timeSeriesFolds(races: Race[], folds: number): Array<{ train: Race[]; test: Race[] }> {
  const sorted = [...races].sort(
    (a, b) => a.date.localeCompare(b.date) || a.event_id - b.event_id || a.heat_number - b.heat_number
  )
  const foldSize = Math.floor(sorted.length / folds)
  const out: Array<{ train: Race[]; test: Race[] }> = []
  for (let f = 1; f < folds; f++) {
    const split = foldSize * f
    if (split < 20 || sorted.length - split < 10) continue
    out.push({ train: sorted.slice(0, split), test: sorted.slice(split, split + foldSize) })
  }
  // last fold: train on all but last chunk
  const lastSplit = foldSize * (folds - 1)
  if (lastSplit >= 20 && sorted.length - lastSplit >= 10) {
    out.push({ train: sorted.slice(0, lastSplit), test: sorted.slice(lastSplit) })
  }
  return out
}

function meanStd(values: number[]): { mean: number; std: number } {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length
  return { mean, std: Math.sqrt(variance) }
}

function bootstrapImprovementCI(
  testRaces: Race[],
  ratings: Map<number, DogRating>,
  scale: number,
  nBoot = 500
): [number, number] {
  const improvements: number[] = []
  for (let i = 0; i < nBoot; i++) {
    const sample: Race[] = []
    for (let j = 0; j < testRaces.length; j++) {
      sample.push(testRaces[Math.floor(Math.random() * testRaces.length)])
    }
    const base = baselineLogLoss(sample, scale)
    const elo = logLossForTest(sample, ratings, scale)
    improvements.push(base - elo)
  }
  improvements.sort((a, b) => a - b)
  return [improvements[Math.floor(nBoot * 0.025)], improvements[Math.floor(nBoot * 0.975)]]
}

function main() {
  console.log('Elo v2 recalibration on scored pairs...')
  const raw = JSON.parse(readFileSync(RACES_FILE, 'utf-8'))
  const scored = scoredOnly(raw.races as Race[])
  console.log(`Scored same-breed races: ${scored.length}`)

  const byBreed = new Map<string, Race[]>()
  for (const r of scored) {
    if (!byBreed.has(r.breed_a)) byBreed.set(r.breed_a, [])
    byBreed.get(r.breed_a)!.push(r)
  }

  const largeBreeds = [...byBreed.entries()]
    .filter(([, rs]) => rs.length >= MIN_BREED_RACES)
    .map(([b]) => b)
    .sort()

  console.log(`Large breeds (≥${MIN_BREED_RACES}): ${largeBreeds.join(', ')}`)

  type GridCell = { scale: number; k0: number; meanTest: number; stdTest: number }
  const gridResults: GridCell[] = []

  for (const scale of SCALES) {
    for (const k0 of K0S) {
      const foldLosses: number[] = []
      for (const breed of largeBreeds) {
        const folds = timeSeriesFolds(byBreed.get(breed)!, FOLDS)
        for (const { train, test } of folds) {
          const ratings = calculateEloRatings(train, [], scale, k0, 1500, true, [])
          foldLosses.push(logLossForTest(test, ratings, scale))
        }
      }
      const { mean, std } = meanStd(foldLosses)
      gridResults.push({ scale, k0, meanTest: mean, stdTest: std })
      console.log(`scale=${scale} K0=${k0} → mean test LL=${mean.toFixed(4)} ± ${std.toFixed(4)}`)
    }
  }

  gridResults.sort((a, b) => a.meanTest - b.meanTest)
  const best = gridResults[0]
  const baseline = gridResults.find((g) => g.scale === BASELINE_SCALE && g.k0 === BASELINE_K0)!
  const withinNoise = Math.abs(best.meanTest - baseline.meanTest) < baseline.stdTest

  // Lock: if best ≈ baseline within noise, keep 8/50
  const lockedScale = withinNoise ? BASELINE_SCALE : best.scale
  const lockedK0 = withinNoise ? BASELINE_K0 : best.k0
  const lockedReason = withinNoise
    ? `Best (${best.scale}/${best.k0}) within noise of baseline 8/50 — keep baseline.`
    : `Best (${best.scale}/${best.k0}) materially better than baseline — lock new params.`

  console.log('\n' + lockedReason)
  console.log(`Locked: scale=${lockedScale}, K0=${lockedK0}`)

  // Unreliable breeds: 80/20 time split, bootstrap CI of improvement fully negative
  const unreliable: Array<{ breed: string; races: number; ci95: [number, number] }> = []
  const reliableCheck: Array<{ breed: string; races: number; ci95: [number, number]; conclusion: string }> =
    []

  for (const [breed, races] of byBreed) {
    if (races.length < 40) continue
    const sorted = [...races].sort((a, b) => a.date.localeCompare(b.date))
    const split = Math.floor(sorted.length * 0.8)
    const train = sorted.slice(0, split)
    const test = sorted.slice(split)
    if (test.length < 8) continue
    const ratings = calculateEloRatings(train, [], lockedScale, lockedK0, 1500, true, [])
    const ci95 = bootstrapImprovementCI(test, ratings, lockedScale)
    let conclusion = 'INCONCLUSIVE'
    if (ci95[0] > 0) conclusion = 'GOOD'
    if (ci95[1] < 0) {
      conclusion = 'POOR'
      unreliable.push({ breed, races: races.length, ci95 })
    }
    reliableCheck.push({ breed, races: races.length, ci95, conclusion })
  }

  const lines: string[] = []
  lines.push('# Elo v2 Calibration Report')
  lines.push('')
  lines.push(`Generated: ${new Date().toISOString()}`)
  lines.push(`Corpus: ${scored.length} scored same-breed pairs (coursing + bzmp), schema elo-races-v3`)
  lines.push('')
  lines.push('## Locked parameters')
  lines.push('')
  lines.push(`- **scale = ${lockedScale}**`)
  lines.push(`- **K0 = ${lockedK0}**`)
  lines.push(`- **initial_rating = 1500**`)
  lines.push(`- **breedPools = true**`)
  lines.push(`- Reason: ${lockedReason}`)
  lines.push('')
  lines.push('## Grid search (mean test logloss across large breeds, time-series CV)')
  lines.push('')
  lines.push('| scale | K0 | mean test LL | std |')
  lines.push('|------:|---:|-------------:|----:|')
  for (const g of gridResults) {
    const mark =
      g.scale === lockedScale && g.k0 === lockedK0 ? ' **← locked**' : g === best ? ' (best raw)' : ''
    lines.push(
      `| ${g.scale} | ${g.k0} | ${g.meanTest.toFixed(4)}${mark} | ${g.stdTest.toFixed(4)} |`
    )
  }
  lines.push('')
  lines.push(`Baseline (8/50): mean=${baseline.meanTest.toFixed(4)} ± ${baseline.stdTest.toFixed(4)}`)
  lines.push(`Best raw: scale=${best.scale}, K0=${best.k0}, mean=${best.meanTest.toFixed(4)}`)
  lines.push('')
  lines.push('## Large breeds used for CV')
  lines.push('')
  for (const b of largeBreeds) {
    lines.push(`- ${b}: ${byBreed.get(b)!.length} scored races`)
  }
  lines.push('')
  lines.push('## Breed reliability (bootstrap 95% CI of improvement vs E=0.5)')
  lines.push('')
  lines.push('| Breed | Races | CI95 low | CI95 high | Conclusion |')
  lines.push('|-------|------:|---------:|----------:|------------|')
  for (const r of reliableCheck.sort((a, b) => b.races - a.races)) {
    lines.push(
      `| ${r.breed} | ${r.races} | ${r.ci95[0].toFixed(3)} | ${r.ci95[1].toFixed(3)} | ${r.conclusion} |`
    )
  }
  lines.push('')
  lines.push('### Unreliable breeds (hide Elo or mark unreliable in UI)')
  lines.push('')
  if (unreliable.length === 0) {
    lines.push('- None with fully negative 95% CI at current thresholds.')
  } else {
    for (const u of unreliable) {
      lines.push(`- **${u.breed}** (${u.races} races): CI95=[${u.ci95[0].toFixed(3)}, ${u.ci95[1].toFixed(3)}]`)
    }
  }
  lines.push('')
  lines.push('## Display thresholds (product)')
  lines.push('')
  lines.push('- `elo_races < 20`: hide numeric Elo / show insufficient data')
  lines.push('- `20–49`: show Elo + badge «мало данных»')
  lines.push('- `≥ 50`: normal display')
  lines.push('- Unreliable breeds list above: treat as hidden regardless of count')
  lines.push('')
  lines.push('## Notes')
  lines.push('')
  lines.push('- DQ outcomes use fixed S=0 and do not enter scale calibration.')
  lines.push('- Bye-runs only affect K via starts_count.')
  lines.push('- Version: elo-v2')

  writeFileSync(REPORT_FILE, lines.join('\n'), 'utf-8')
  writeFileSync(
    resolve(__dirname, '../../../tasks/elo-calibration/elo-v2-locked-params.json'),
    JSON.stringify(
      {
        scale: lockedScale,
        k0: lockedK0,
        initial_rating: 1500,
        breed_pools: true,
        unreliable_breeds: unreliable.map((u) => u.breed),
        reason: lockedReason,
      },
      null,
      2
    ),
    'utf-8'
  )
  console.log(`Report: ${REPORT_FILE}`)
}

main()
