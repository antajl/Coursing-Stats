/**
 * Вспомогательные функции парсинга спортивных квалификаций, судей и регионов РФ.
 */

import type { DogCompetitionEntry } from './types'

export function splitQualTokens(qualification?: string | null): string[] {
  if (!qualification || typeof qualification !== 'string') return []
  return qualification
    .split(/[,;]+/)
    .map((t) => t.trim())
    .filter(Boolean)
}

export function hasExactCertToken(qualification: string | null | undefined, regex: RegExp): boolean {
  return splitQualTokens(qualification).some((tok) => regex.test(tok))
}

export function isValidSportResult(c: DogCompetitionEntry): boolean {
  return c.status !== 'dns' && c.status !== 'disqualified' && c.status !== 'dnf_aggression'
}

export function extractJudges(judgesStr?: string | null): string[] {
  if (!judgesStr || typeof judgesStr !== 'string') return []
  return judgesStr
    .split(/[,;/+]+/)
    .map((j) => j.trim())
    .filter((j) => j.length > 2)
}

export function normalizeSubjectName(location?: string | null): string | null {
  if (!location || typeof location !== 'string') return null
  const firstPart = location.split(',')[0]?.trim()
  if (!firstPart) return null
  return firstPart
    .replace(/^г\.\s*/i, '')
    .replace(/\bобл\.?/gi, 'область')
    .replace(/\bресп\.?/gi, 'Республика')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

export function countDistinctJudgeSets(events: DogCompetitionEntry[]): number {
  const judges = new Set<string>()
  let eventsWithoutJudges = 0
  for (const ev of events) {
    const list = extractJudges(ev.judges)
    if (list.length === 0) {
      eventsWithoutJudges++
    } else {
      for (const j of list) judges.add(j)
    }
  }
  return judges.size + (judges.size === 0 ? eventsWithoutJudges : 0)
}

export function hasTwoDistinctJudgeEvents(a: DogCompetitionEntry[], b: DogCompetitionEntry[]): boolean {
  const combined = [...a, ...b]
  if (combined.length < 2) return false
  const uniqueEventKeys = new Set(combined.map((e, i) => e.event_id ?? `${e.date_start}-${e.title}-${i}`))
  if (uniqueEventKeys.size < 2) return false
  const distinctJudges = countDistinctJudgeSets(combined)
  return distinctJudges >= 2 || combined.every((e) => extractJudges(e.judges).length === 0)
}

export function hasThreeDistinctJudgeEvents(primary: DogCompetitionEntry[], cacl: DogCompetitionEntry[]): boolean {
  if (primary.length < 1 || cacl.length < 2) return false
  const combined = [...primary.slice(0, 1), ...cacl]
  const distinctJudges = countDistinctJudgeSets(combined)
  return distinctJudges >= 3 || combined.some((e) => extractJudges(e.judges).length === 0)
}
