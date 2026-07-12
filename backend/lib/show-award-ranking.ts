/** Веса и утилиты рейтинга выставочных наград (conformation). */

export type ShowTitleCounts = {
  CAC: number
  CACIB: number
  BOB: number
  BIS: number
}

export type ShowAwardKey = keyof ShowTitleCounts

/** Приоритет: BIS → BOB → CACIB → CAC (см. docs/10-GUIDE.md). */
export const SHOW_AWARD_WEIGHTS: Record<ShowAwardKey, number> = {
  BIS: 10_000,
  BOB: 2_000,
  CACIB: 500,
  CAC: 100,
}

export const SHOW_AWARD_ORDER: ShowAwardKey[] = ['BIS', 'BOB', 'CACIB', 'CAC']

export const SHOW_AWARD_LABELS: Record<ShowAwardKey, string> = {
  BIS: 'Best in Show',
  BOB: 'Best of Breed',
  CACIB: 'CACIB',
  CAC: 'CAC',
}

export const EMPTY_SHOW_TITLES: ShowTitleCounts = { CAC: 0, CACIB: 0, BOB: 0, BIS: 0 }

/** Парсинг колонки «титул» протокола; CACIB/JCAC не дают лишний CAC. */
export function parseShowTitles(title: string): ShowTitleCounts {
  const counts = { ...EMPTY_SHOW_TITLES }
  const upper = title.toUpperCase()

  if (upper.includes('BIS')) counts.BIS++
  if (upper.includes('BOB')) counts.BOB++
  if (upper.includes('CACIB')) counts.CACIB++
  else if (upper.includes('CAC') && !upper.includes('JCAC')) counts.CAC++

  return counts
}

export function mergeShowTitles(a: ShowTitleCounts, b: ShowTitleCounts): ShowTitleCounts {
  return {
    CAC: a.CAC + b.CAC,
    CACIB: a.CACIB + b.CACIB,
    BOB: a.BOB + b.BOB,
    BIS: a.BIS + b.BIS,
  }
}

export function showRankScore(titles: ShowTitleCounts): number {
  return SHOW_AWARD_ORDER.reduce((sum, key) => sum + titles[key] * SHOW_AWARD_WEIGHTS[key], 0)
}

/** Лучшая категория награды по иерархии (не счётчик). */
export function bestShowAward(titles: ShowTitleCounts): ShowAwardKey | null {
  for (const key of SHOW_AWARD_ORDER) {
    if (titles[key] > 0) return key
  }
  return null
}

export function compareShowDogs(
  a: { rank_score?: number; titles: ShowTitleCounts; total_shows: number },
  b: { rank_score?: number; titles: ShowTitleCounts; total_shows: number }
): number {
  const scoreA = a.rank_score ?? showRankScore(a.titles)
  const scoreB = b.rank_score ?? showRankScore(b.titles)
  if (scoreB !== scoreA) return scoreB - scoreA

  for (const key of SHOW_AWARD_ORDER) {
    if (b.titles[key] !== a.titles[key]) return b.titles[key] - a.titles[key]
  }

  return b.total_shows - a.total_shows
}
