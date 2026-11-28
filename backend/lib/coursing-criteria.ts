/**
 * Aggregation of the 5 FCI/RKF coursing judging criteria ([М, Р, В, П, Э], max 20 each)
 * from raw_scores_json.heats for dog profile analytics.
 */

export type CriteriaTuple = [number, number, number, number, number]

export interface DogCoursingCriteriaSummary {
  events_count: number
  heats_count: number
  dog_avg: CriteriaTuple
  breed_avg: CriteriaTuple
  breed_heats_count: number
  is_global_baseline?: boolean
  run1_avg: CriteriaTuple | null
  run2_avg: CriteriaTuple | null
  breed_last_avg: CriteriaTuple | null
  breed_last_heats_count?: number
  is_last_global_baseline?: boolean
}

export interface CoursingCriteriaRowInput {
  dog_id: number
  event_id: number
  raw_scores_json: string | null
}

interface ParsedHeatCriteria {
  roundNumber: number
  scores: CriteriaTuple
}

function round1(val: number): number {
  return Math.round(val * 10) / 10
}

function emptySums(): CriteriaTuple {
  return [0, 0, 0, 0, 0]
}

function addTuple(acc: CriteriaTuple, item: CriteriaTuple): void {
  for (let i = 0; i < 5; i++) acc[i] += item[i]
}

function subTuple(acc: CriteriaTuple, item: CriteriaTuple): void {
  for (let i = 0; i < 5; i++) acc[i] -= item[i]
}

function averageTuple(sums: CriteriaTuple, count: number): CriteriaTuple {
  return [
    round1(sums[0] / count),
    round1(sums[1] / count),
    round1(sums[2] / count),
    round1(sums[3] / count),
    round1(sums[4] / count),
  ]
}

function isValidCriteriaScores(scores: unknown): scores is CriteriaTuple {
  if (!Array.isArray(scores) || scores.length !== 5) return false
  let positiveCount = 0
  for (const val of scores) {
    if (typeof val !== 'number' || !Number.isFinite(val) || val < 0 || val > 20) {
      return false
    }
    if (val > 0) positiveCount += 1
  }
  return positiveCount > 0
}

/**
 * Extracts per-heat averaged [М, Р, В, П, Э] criteria tuples from raw_scores_json.
 * Skips disqualified heats and all-zero judge arrays.
 */
export function extractHeatCriteriaTuples(rawScoresJson: string | Record<string, unknown> | null): ParsedHeatCriteria[] {
  if (!rawScoresJson) return []
  let parsed: { heats?: Array<{ heat_number?: number; disqualified?: boolean; judges?: Array<{ scores?: unknown }> }> } | null = null
  if (typeof rawScoresJson === 'string') {
    try {
      parsed = JSON.parse(rawScoresJson)
    } catch {
      return []
    }
  } else if (typeof rawScoresJson === 'object') {
    parsed = rawScoresJson as typeof parsed
  }
  if (!parsed || !Array.isArray(parsed.heats)) return []

  const results: ParsedHeatCriteria[] = []
  for (let idx = 0; idx < parsed.heats.length; idx++) {
    const heat = parsed.heats[idx]
    if (!heat || heat.disqualified === true || !Array.isArray(heat.judges)) continue

    const sums = emptySums()
    let validJudges = 0
    for (const judge of heat.judges) {
      if (!judge || !isValidCriteriaScores(judge.scores)) continue
      addTuple(sums, judge.scores)
      validJudges += 1
    }
    if (validJudges === 0) continue

    const heatNum = typeof heat.heat_number === 'number' && heat.heat_number > 0 ? heat.heat_number : idx + 1
    results.push({
      roundNumber: heatNum,
      scores: [
        sums[0] / validJudges,
        sums[1] / validJudges,
        sums[2] / validJudges,
        sums[3] / validJudges,
        sums[4] / validJudges,
      ],
    })
  }
  return results
}

function resolveBreedBaseline(
  breedKey: string,
  dogCount: number,
  dogSums: CriteriaTuple,
  perBreed: Map<string, { sums: CriteriaTuple; count: number }>,
  globalAvg: CriteriaTuple,
  globalCount: number,
  minPeerHeats: number,
  minBreedHeatsFallback: number,
): { avg: CriteriaTuple; count: number; isGlobal: boolean } {
  if (breedKey) {
    const bStats = perBreed.get(breedKey)
    if (bStats && bStats.count - dogCount >= minPeerHeats) {
      const peerSums = [...bStats.sums] as CriteriaTuple
      subTuple(peerSums, dogSums)
      const count = bStats.count - dogCount
      return { avg: averageTuple(peerSums, count), count, isGlobal: false }
    }
    if (bStats && bStats.count >= minBreedHeatsFallback) {
      return { avg: averageTuple(bStats.sums, bStats.count), count: bStats.count, isGlobal: false }
    }
  }
  return { avg: globalAvg, count: globalCount, isGlobal: true }
}

/**
 * Builds 5-criteria profiles for all coursing dogs with breed (or global fallback) baselines
 * both across all rounds and specifically for last rounds (>= 2 heats per event).
 */
export function buildDogCoursingCriteriaMap(
  rows: CoursingCriteriaRowInput[],
  resolveBreedKey: (dogId: number) => string,
): Map<number, DogCoursingCriteriaSummary> {
  type DogAcc = {
    breedKey: string
    events: Set<number>
    heatsCount: number
    totalSums: CriteriaTuple
    run1Count: number
    run1Sums: CriteriaTuple
    run2Count: number
    run2Sums: CriteriaTuple
    lastCount: number
    lastSums: CriteriaTuple
  }

  const perDog = new Map<number, DogAcc>()
  const perBreed = new Map<string, { sums: CriteriaTuple; count: number }>()
  const perBreedLast = new Map<string, { sums: CriteriaTuple; count: number }>()
  const globalSums = emptySums()
  let globalCount = 0
  const globalLastSums = emptySums()
  let globalLastCount = 0

  for (const row of rows) {
    const heats = extractHeatCriteriaTuples(row.raw_scores_json)
    if (heats.length === 0) continue

    const breedKey = resolveBreedKey(row.dog_id)
    let acc = perDog.get(row.dog_id)
    if (!acc) {
      acc = {
        breedKey,
        events: new Set(),
        heatsCount: 0,
        totalSums: emptySums(),
        run1Count: 0,
        run1Sums: emptySums(),
        run2Count: 0,
        run2Sums: emptySums(),
        lastCount: 0,
        lastSums: emptySums(),
      }
      perDog.set(row.dog_id, acc)
    }

    acc.events.add(row.event_id)

    for (const h of heats) {
      acc.heatsCount += 1
      addTuple(acc.totalSums, h.scores)

      if (h.roundNumber === 1) {
        acc.run1Count += 1
        addTuple(acc.run1Sums, h.scores)
      } else if (h.roundNumber === 2) {
        acc.run2Count += 1
        addTuple(acc.run2Sums, h.scores)
      }

      if (breedKey) {
        let bAcc = perBreed.get(breedKey)
        if (!bAcc) {
          bAcc = { sums: emptySums(), count: 0 }
          perBreed.set(breedKey, bAcc)
        }
        addTuple(bAcc.sums, h.scores)
        bAcc.count += 1
      }

      addTuple(globalSums, h.scores)
      globalCount += 1
    }

    if (heats.length >= 2) {
      const lastHeat = heats[heats.length - 1]
      acc.lastCount += 1
      addTuple(acc.lastSums, lastHeat.scores)

      if (breedKey) {
        let bLastAcc = perBreedLast.get(breedKey)
        if (!bLastAcc) {
          bLastAcc = { sums: emptySums(), count: 0 }
          perBreedLast.set(breedKey, bLastAcc)
        }
        addTuple(bLastAcc.sums, lastHeat.scores)
        bLastAcc.count += 1
      }

      addTuple(globalLastSums, lastHeat.scores)
      globalLastCount += 1
    }
  }

  const out = new Map<number, DogCoursingCriteriaSummary>()
  if (globalCount === 0) return out

  const globalAvg = averageTuple(globalSums, globalCount)
  const globalLastAvg = globalLastCount > 0 ? averageTuple(globalLastSums, globalLastCount) : null

  for (const [dogId, acc] of perDog.entries()) {
    if (acc.heatsCount === 0) continue

    const overall = resolveBreedBaseline(
      acc.breedKey,
      acc.heatsCount,
      acc.totalSums,
      perBreed,
      globalAvg,
      globalCount,
      5,
      15,
    )

    let breedLastAvg: CriteriaTuple | null = null
    let breedLastCount = 0
    let isLastGlobal = false
    if (acc.lastCount > 0 && globalLastAvg) {
      const lastRes = resolveBreedBaseline(
        acc.breedKey,
        acc.lastCount,
        acc.lastSums,
        perBreedLast,
        globalLastAvg,
        globalLastCount,
        3,
        8,
      )
      breedLastAvg = lastRes.avg
      breedLastCount = lastRes.count
      isLastGlobal = lastRes.isGlobal
    }

    out.set(dogId, {
      events_count: acc.events.size,
      heats_count: acc.heatsCount,
      dog_avg: averageTuple(acc.totalSums, acc.heatsCount),
      breed_avg: overall.avg,
      breed_heats_count: overall.count,
      ...(overall.isGlobal ? { is_global_baseline: true } : {}),
      run1_avg: acc.run1Count > 0 ? averageTuple(acc.run1Sums, acc.run1Count) : null,
      run2_avg: acc.run2Count > 0 ? averageTuple(acc.run2Sums, acc.run2Count) : null,
      breed_last_avg: breedLastAvg,
      ...(breedLastAvg ? { breed_last_heats_count: breedLastCount } : {}),
      ...(isLastGlobal ? { is_last_global_baseline: true } : {}),
    })
  }

  return out
}
