/**
 * Elo races extract v3: coursing + bzmp, scored / dq_pair / bye / dq_solo.
 * Schema: coursing-stats/elo-races-v3
 */
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { Race, ByeRun, SoloLoss } from '../../lib/rating/elo-calculator'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function writeFileRetry(filePath: string, data: string, attempts = 12): void {
  let lastErr: unknown
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      writeFileSync(filePath, data, 'utf-8')
      return
    } catch (e) {
      lastErr = e
      const code = (e as NodeJS.ErrnoException)?.code
      if (code !== 'UNKNOWN' && code !== 'EPERM' && code !== 'EBUSY') throw e
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 80 * (attempt + 1))
    }
  }
  throw lastErr
}

interface Heat {
  heat_number: number
  bib_number: number | null
  judges?: Array<{
    judge_number: number
    scores: number[]
    sum: number
  }>
  total: number | null
  disqualified: boolean
  disqualification_reason?: string | null
}

interface Result {
  id: number
  event_id: number
  dog_id: number
  breed: string
  status: string
  judge_count: number
  raw_scores_json?: {
    heats?: Heat[]
  } | null
  dog: {
    id: number
    breed: string
  }
}

interface Competition {
  event_id: number
  event: {
    id: number
    date_start: string
    event_type: string
    competition_kind: string
  }
  results: Result[]
}

type HeatEntry = {
  result: Result
  heat: Heat
  isDq: boolean
  avgScore: number | null
  judgeCount: number
}

const COMPETITIONS_DIR = resolve(__dirname, '../../../data/v1/competitions')
const OUTPUT_FILE = resolve(__dirname, '../../../tasks/elo-calibration/races-data.json')
const ELO_EVENT_TYPES = new Set(['coursing', 'bzmp'])

interface ExtractionResult {
  races: Race[]
  byeRuns: ByeRun[]
  soloLosses: SoloLoss[]
  crossBreedPairs: number
  counts: {
    scored: number
    dq_pair: number
    bye: number
    dq_solo: number
    dq_synth_no_heats: number
  }
}

function avgJudgeSum(heat: Heat): number | null {
  if (!heat.judges || heat.judges.length === 0) return null
  return heat.judges.reduce((sum, j) => sum + j.sum, 0) / heat.judges.length
}

function heatIsDq(result: Result, heat: Heat): boolean {
  if (heat.disqualified) return true
  // Result-level DQ with heats: heat without usable judges counts as DQ for that heat
  if (result.status === 'disqualified') {
    const hasScores = heat.judges && heat.judges.length > 0 && !heat.disqualified
    // If heat explicitly not DQ but has scores while result is DQ — still treat as scored
    // unless heat.disqualified. Plan: heat DQ flag OR (result DQ and no judges).
    if (!hasScores) return true
  }
  return false
}

function pairKey(heat: Heat): string {
  return `${heat.heat_number}-${heat.bib_number}`
}

function extractRacesFromCompetition(competition: Competition): ExtractionResult {
  const races: Race[] = []
  const byeRuns: ByeRun[] = []
  const soloLosses: SoloLoss[] = []
  let crossBreedPairs = 0
  const counts = {
    scored: 0,
    dq_pair: 0,
    bye: 0,
    dq_solo: 0,
    dq_synth_no_heats: 0,
  }

  const { event_id, event, results } = competition
  const date = event.date_start
  const eventType = event.event_type

  // Result-level DQ without heats → synthetic solo loss
  for (const result of results) {
    if (result.status !== 'disqualified') continue
    const heats = result.raw_scores_json?.heats
    if (!heats || heats.length === 0) {
      soloLosses.push({
        dog_id: result.dog_id,
        date,
        event_id,
        heat_number: 0,
        breed: result.dog?.breed ?? result.breed,
        event_type: eventType,
      })
      counts.dq_solo++
      counts.dq_synth_no_heats++
    }
  }

  // Eligible results: finished or disqualified with heats
  const eligible = results.filter(
    (r) =>
      (r.status === 'finished' || r.status === 'disqualified') &&
      r.raw_scores_json?.heats &&
      r.raw_scores_json.heats.length > 0
  )

  // Group heat entries by physical race key
  const byKey = new Map<string, HeatEntry[]>()
  for (const result of eligible) {
    for (const heat of result.raw_scores_json!.heats!) {
      const isDq = heatIsDq(result, heat)
      const avg = avgJudgeSum(heat)
      // Skip empty non-DQ heats (no scores, not DQ) — nothing to process
      if (!isDq && (avg == null || !heat.judges || heat.judges.length === 0)) {
        continue
      }
      const key = pairKey(heat)
      if (!byKey.has(key)) byKey.set(key, [])
      byKey.get(key)!.push({
        result,
        heat,
        isDq,
        avgScore: avg,
        judgeCount: heat.judges?.length ?? 0,
      })
    }
  }

  for (const [key, entries] of byKey) {
    const [heatNumStr, bibNumStr] = key.split('-')
    const heatNum = Number(heatNumStr)
    const bibNum = Number(bibNumStr)

    if (entries.length === 1) {
      const e = entries[0]
      const breed = e.result.dog?.breed ?? e.result.breed
      if (e.isDq) {
        soloLosses.push({
          dog_id: e.result.dog_id,
          date,
          event_id,
          heat_number: heatNum,
          breed,
          event_type: eventType,
        })
        counts.dq_solo++
      } else {
        byeRuns.push({
          dog_id: e.result.dog_id,
          date,
          event_id,
          heat_number: heatNum,
          bib_number: Number.isFinite(bibNum) ? bibNum : heatNum,
          breed,
          event_type: eventType,
        })
        counts.bye++
      }
      continue
    }

    if (entries.length !== 2) {
      console.warn(
        `⚠️  Event ${event_id}, Key ${key}: ${entries.length} dogs (expected 1–2) — skipped`
      )
      continue
    }

    const [a, b] = entries
    const breedA = a.result.dog?.breed ?? a.result.breed
    const breedB = b.result.dog?.breed ?? b.result.breed
    if (breedA !== breedB) {
      crossBreedPairs++
      // Cross-breed: treat each as solo DQ or bye independently
      for (const e of entries) {
        const breed = e.result.dog?.breed ?? e.result.breed
        if (e.isDq) {
          soloLosses.push({
            dog_id: e.result.dog_id,
            date,
            event_id,
            heat_number: heatNum,
            breed,
            event_type: eventType,
          })
          counts.dq_solo++
        } else {
          byeRuns.push({
            dog_id: e.result.dog_id,
            date,
            event_id,
            heat_number: heatNum,
            bib_number: Number.isFinite(bibNum) ? bibNum : heatNum,
            breed,
            event_type: eventType,
          })
          counts.bye++
        }
      }
      continue
    }

    if (a.isDq && b.isDq) {
      // Double DQ → two solo losses
      for (const e of [a, b]) {
        soloLosses.push({
          dog_id: e.result.dog_id,
          date,
          event_id,
          heat_number: heatNum,
          breed: e.result.dog?.breed ?? e.result.breed,
          event_type: eventType,
        })
        counts.dq_solo++
      }
      continue
    }

    if (a.isDq || b.isDq) {
      // Pair DQ: DQ dog S=0, partner S=1. Put non-DQ as A with forced_actual_a=1, or DQ as A with 0.
      const loser = a.isDq ? a : b
      const winner = a.isDq ? b : a
      races.push({
        event_id,
        date,
        heat_number: heatNum,
        dog_id_a: loser.result.dog_id,
        dog_id_b: winner.result.dog_id,
        breed_a: breedA,
        breed_b: breedB,
        score_a: loser.avgScore ?? 0,
        score_b: winner.avgScore ?? 0,
        judge_count: Math.max(loser.judgeCount, winner.judgeCount, 1),
        outcome: 'dq_pair',
        forced_actual_a: 0,
        event_type: eventType,
      })
      counts.dq_pair++
      continue
    }

    // Both scored
    races.push({
      event_id,
      date,
      heat_number: heatNum,
      dog_id_a: a.result.dog_id,
      dog_id_b: b.result.dog_id,
      breed_a: breedA,
      breed_b: breedB,
      score_a: a.avgScore!,
      score_b: b.avgScore!,
      judge_count: Math.max(a.judgeCount, b.judgeCount),
      outcome: 'scored',
      event_type: eventType,
    })
    counts.scored++
  }

  return { races, byeRuns, soloLosses, crossBreedPairs, counts }
}

function main() {
  console.log('Extracting race data for Elo v3 (coursing + bzmp, DQ)...')
  console.log('Competitions directory:', COMPETITIONS_DIR)

  if (!existsSync(COMPETITIONS_DIR)) {
    console.error('Competitions directory does not exist:', COMPETITIONS_DIR)
    process.exit(1)
  }

  const allRaces: Race[] = []
  const allByeRuns: ByeRun[] = []
  const allSoloLosses: SoloLoss[] = []
  let totalCrossBreedPairs = 0
  let processedCompetitions = 0
  let totalCompetitions = 0
  const outcomeTotals = {
    scored: 0,
    dq_pair: 0,
    bye: 0,
    dq_solo: 0,
    dq_synth_no_heats: 0,
  }
  const byEventType: Record<string, number> = {}

  const years = readdirSync(COMPETITIONS_DIR)

  for (const year of years) {
    const yearPath = join(COMPETITIONS_DIR, year)
    if (!existsSync(yearPath)) continue
    const months = readdirSync(yearPath)

    for (const month of months) {
      const monthPath = join(yearPath, month)
      if (!existsSync(monthPath)) continue
      const competitions = readdirSync(monthPath)

      for (const compFile of competitions) {
        if (!compFile.endsWith('.json')) continue
        totalCompetitions++
        const compPath = join(monthPath, compFile)

        try {
          const competition: Competition = JSON.parse(readFileSync(compPath, 'utf-8'))
          const eventType = competition.event.event_type
          if (!ELO_EVENT_TYPES.has(eventType)) continue

          const { races, byeRuns, soloLosses, crossBreedPairs, counts } =
            extractRacesFromCompetition(competition)
          allRaces.push(...races)
          allByeRuns.push(...byeRuns)
          allSoloLosses.push(...soloLosses)
          totalCrossBreedPairs += crossBreedPairs
          processedCompetitions++
          byEventType[eventType] = (byEventType[eventType] || 0) + 1
          for (const k of Object.keys(outcomeTotals) as (keyof typeof outcomeTotals)[]) {
            outcomeTotals[k] += counts[k]
          }
        } catch (error) {
          console.error(`Error processing ${compFile}:`, error)
        }
      }
    }
  }

  allRaces.sort((a, b) => a.date.localeCompare(b.date) || a.event_id - b.event_id || a.heat_number - b.heat_number)
  allByeRuns.sort((a, b) => a.date.localeCompare(b.date) || a.event_id - b.event_id || a.heat_number - b.heat_number)
  allSoloLosses.sort(
    (a, b) => a.date.localeCompare(b.date) || a.event_id - b.event_id || a.heat_number - b.heat_number
  )

  const outputDir = dirname(OUTPUT_FILE)
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  const dogIds = new Set<number>()
  for (const r of allRaces) {
    dogIds.add(r.dog_id_a)
    dogIds.add(r.dog_id_b)
  }
  for (const b of allByeRuns) dogIds.add(b.dog_id)
  for (const s of allSoloLosses) dogIds.add(s.dog_id)

  const breeds = [
    ...new Set([
      ...allRaces.flatMap((r) => [r.breed_a, r.breed_b]),
      ...allByeRuns.map((b) => b.breed).filter(Boolean),
      ...allSoloLosses.map((s) => s.breed).filter(Boolean),
    ]),
  ] as string[]

  const statistics = {
    total_races: allRaces.length,
    total_bye_runs: allByeRuns.length,
    total_solo_losses: allSoloLosses.length,
    total_cross_breed_pairs: totalCrossBreedPairs,
    total_competitions: totalCompetitions,
    processed_competitions: processedCompetitions,
    by_event_type: byEventType,
    by_outcome: outcomeTotals,
    date_range: {
      from: allRaces[0]?.date ?? allSoloLosses[0]?.date ?? null,
      to:
        allRaces[allRaces.length - 1]?.date ??
        allSoloLosses[allSoloLosses.length - 1]?.date ??
        null,
    },
    breeds,
    dog_count: dogIds.size,
  }

  const output = {
    schema: 'coursing-stats/elo-races-v3',
    extracted_at: new Date().toISOString(),
    statistics,
    races: allRaces,
    bye_runs: allByeRuns,
    solo_losses: allSoloLosses,
  }

  writeFileRetry(OUTPUT_FILE, JSON.stringify(output, null, 2))

  console.log('Extraction complete!')
  console.log(JSON.stringify(statistics, null, 2))
  console.log(`Output: ${OUTPUT_FILE}`)

  if (allRaces.length <= 1679) {
    console.warn('Warning: race count did not grow vs v2 scored-only baseline (1679)')
  }
  if (!byEventType.bzmp) {
    console.warn('Warning: no bzmp events processed')
  }
  if (outcomeTotals.dq_pair + outcomeTotals.dq_solo === 0) {
    console.warn('Warning: no DQ outcomes extracted')
  }
}

main()
