/**
 * Shared coursing-family score model (coursing + BZMP).
 * Racing uses time/speed heats — do not reuse this for racing.
 */

export type JudgeScoreBlock = {
  judge_number: number
  scores: (number | null)[]
  sum: number | null
}

export type HeatScoreBlock = {
  heat_number: number
  bib_number: number | null
  bib_color: string | null
  judges: JudgeScoreBlock[]
  total: number | null
  disqualified: boolean
  disqualification_reason: string | null
}

export type CoursingRawScores = {
  heats: HeatScoreBlock[]
  grand_total?: number | null
  format?: string
}

/** Sum of 5 criteria; null if no numeric scores. */
export function sumCriteriaScores(scores: (number | null)[] | null | undefined): number | null {
  if (!scores || !scores.some((s) => s !== null && s !== undefined)) return null
  return scores.reduce<number>((acc, s) => acc + (s ?? 0), 0)
}

export function makeJudge(judgeNumber: number, scores: (number | null)[]): JudgeScoreBlock | null {
  if (!scores.some((s) => s !== null)) return null
  return {
    judge_number: judgeNumber,
    scores: scores.slice(0, 5),
    sum: sumCriteriaScores(scores),
  }
}

export function makeHeat(opts: {
  heatNumber: number
  bibNumber: number | null
  bibColor?: string | null
  judges: JudgeScoreBlock[]
  total: number | null
  disqualified?: boolean
  disqualificationReason?: string | null
}): HeatScoreBlock {
  return {
    heat_number: opts.heatNumber,
    bib_number: opts.bibNumber,
    bib_color: opts.bibColor ?? null,
    judges: opts.judges,
    total: opts.total,
    disqualified: opts.disqualified ?? false,
    disqualification_reason: opts.disqualificationReason ?? null,
  }
}

/** Object form used in data/v1 competition JSON (UI accepts object or string). */
export function buildCoursingRawScores(
  heats: HeatScoreBlock[],
  grandTotal: number | null,
  extra?: { format?: string },
): CoursingRawScores {
  const out: CoursingRawScores = { heats }
  if (grandTotal !== null && grandTotal !== undefined) out.grand_total = grandTotal
  if (extra?.format) out.format = extra.format
  return out
}
