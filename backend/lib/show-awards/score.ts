import {
  EMPTY_SHOW_TITLES,
  SHOW_AWARD_BADGE,
  SHOW_AWARD_CATEGORY,
  SHOW_AWARD_CATEGORY_ORDER,
  SHOW_AWARD_ORDER,
  SHOW_AWARD_WEIGHTS,
  type ShowAwardCategory,
  type ShowAwardKey,
  type ShowTitleCounts,
} from './order'
import { matchShowAwardToken, splitShowTitleTokens } from './match'

/** Парсинг колонки «титул» протокола; CACIB/JCAC/R.CAC не дают лишний CAC. */
export function parseShowTitles(title: string): ShowTitleCounts {
  const counts = { ...EMPTY_SHOW_TITLES }
  if (!title?.trim()) return counts

  for (const part of splitShowTitleTokens(title)) {
    const key = matchShowAwardToken(part)
    if (key) counts[key]++
  }
  return counts
}

export function mergeShowTitles(a: ShowTitleCounts, b: ShowTitleCounts): ShowTitleCounts {
  const out = { ...EMPTY_SHOW_TITLES }
  for (const key of SHOW_AWARD_ORDER) {
    out[key] = (a[key] || 0) + (b[key] || 0)
  }
  return out
}

export function showRankScore(titles: ShowTitleCounts): number {
  return SHOW_AWARD_ORDER.reduce((sum, key) => sum + (titles[key] || 0) * SHOW_AWARD_WEIGHTS[key], 0)
}

/** Лучшая категория награды по иерархии (не счётчик). */
export function bestShowAward(titles: ShowTitleCounts): ShowAwardKey | null {
  for (const key of SHOW_AWARD_ORDER) {
    if ((titles[key] || 0) > 0) return key
  }
  return null
}

export function compareShowDogs(
  a: { rank_score?: number; titles: ShowTitleCounts; total_shows: number },
  b: { rank_score?: number; titles: ShowTitleCounts; total_shows: number },
): number {
  const scoreA = a.rank_score ?? showRankScore(a.titles)
  const scoreB = b.rank_score ?? showRankScore(b.titles)
  if (scoreB !== scoreA) return scoreB - scoreA

  for (const key of SHOW_AWARD_ORDER) {
    const diff = (b.titles[key] || 0) - (a.titles[key] || 0)
    if (diff !== 0) return diff
  }

  return b.total_shows - a.total_shows
}

/** Ненулевые ключи в порядке приоритета. */
export function presentShowAwards(titles: ShowTitleCounts): ShowAwardKey[] {
  return SHOW_AWARD_ORDER.filter((key) => (titles[key] || 0) > 0)
}

/** Развернуть компактные titles (только ненулевые) в полный объект со всеми ключами. */
export function expandShowTitles(
  partial?: Partial<ShowTitleCounts> | ShowTitleCounts | null,
): ShowTitleCounts {
  if (!partial) return { ...EMPTY_SHOW_TITLES }
  return { ...EMPTY_SHOW_TITLES, ...partial }
}

/** Каноническая подпись бейджа для сырого токена протокола («BOB/ЛПП» → «ЛПП»). */
export function displayShowAwardToken(raw: string): string {
  const key = matchShowAwardToken(raw)
  return key ? SHOW_AWARD_BADGE[key] : raw.trim()
}

/**
 * Краткая «причина» места в рейтинге для главной / компактных списков:
 * «ЛПП ×18 · VCAC ×27» (до max самых весомых титулов с ненулевым счётчиком).
 */
export function formatShowRankingReason(
  titles: Partial<ShowTitleCounts> | ShowTitleCounts | null | undefined,
  max = 2,
): string {
  if (!titles) return ''
  const parts: string[] = []
  for (const key of SHOW_AWARD_ORDER) {
    const n = titles[key] || 0
    if (n <= 0) continue
    parts.push(n > 1 ? `${SHOW_AWARD_BADGE[key]} ×${n}` : SHOW_AWARD_BADGE[key])
    if (parts.length >= max) break
  }
  return parts.join(' · ')
}

/** Только ненулевые счётчики — для лёгких home-top / ranking JSON. */
export function compactShowTitles(titles: ShowTitleCounts): Partial<ShowTitleCounts> {
  const out: Partial<ShowTitleCounts> = {}
  for (const key of SHOW_AWARD_ORDER) {
    const n = titles[key] || 0
    if (n > 0) out[key] = n
  }
  return out
}

/** Шард файла подробностей: shows/indexes/dog-details/{shard}.json */
export function showDogDetailShard(id: string | number, shardCount = 256): string {
  // Handle numeric IDs (competition_dog_id, FNV-1a stable IDs)
  const numId = Number(id)
  if (!isNaN(numId) && numId > 0) {
    return String(Math.abs(numId) % shardCount).padStart(3, '0')
  }

  // Handle hex IDs (SHA256-based IDs for collision fixes)
  // Use simple hash of the string to determine shard
  const strId = String(id)
  let hash = 0
  for (let i = 0; i < strId.length; i++) {
    hash = ((hash << 5) - hash) + strId.charCodeAt(i)
    hash |= 0 // Convert to 32-bit integer
  }
  return String(Math.abs(hash) % shardCount).padStart(3, '0')
}

/** Ключи, сгруппированные по категории (prestige → certificate → diploma). */
export function groupShowAwardsByCategory(
  keys: readonly ShowAwardKey[],
): Array<{ category: ShowAwardCategory; keys: ShowAwardKey[] }> {
  const buckets: Record<ShowAwardCategory, ShowAwardKey[]> = {
    prestige: [],
    certificate: [],
    diploma: [],
  }
  for (const key of SHOW_AWARD_ORDER) {
    if (!keys.includes(key)) continue
    buckets[SHOW_AWARD_CATEGORY[key]].push(key)
  }
  return SHOW_AWARD_CATEGORY_ORDER.filter((c) => buckets[c].length > 0).map((category) => ({
    category,
    keys: buckets[category],
  }))
}
