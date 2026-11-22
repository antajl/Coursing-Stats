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
import { cdnPackShardKey } from '../cdn-packs'

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

/**
 * Веса наград для клубного (монопородного) рейтинга НКП:
 * Исключаются всепородные BIG (5 000) и BIS (10 000).
 * Ключевой селекционный вес отдается победам под породниками: КЧК, ПК, CW, титулам НКП.
 */
export const SHOW_MONO_AWARD_WEIGHTS: Record<ShowAwardKey, number> = {
  BIS: 0,
  BIG: 0,
  BIS_JUNIOR: 0,
  BIS_VETERAN: 0,
  BIS_PUPPY: 0,
  BIS_BABY: 0,
  BOB: 0,
  BOS: 0,
  LB: 0,
  LSH: 0,
  LYU: 0,
  LV: 0,
  CACIB: 0,
  CAC: 0,
  JCAC: 0,
  VCAC: 0,
  CHRKF: 0,
  YCHRKF: 0,
  VCHRKF: 0,
  R_CACIB: 0,
  R_CAC: 0,
  R_JCAC: 0,
  R_VCAC: 0,
  P_RUSSIA: 0,
  P_MOSCOW: 0,
  YP_RUSSIA: 0,
  YP_MOSCOW: 0,
  VP_RUSSIA: 0,
  VP_MOSCOW: 0,
  KCHP: 1_800,
  YKCHP: 1_200,
  VKCHP: 1_000,
  KCHK: 600,
  YKCHK: 450,
  VKCHK: 400,
  CW: 0,
  SS: 100,
  YSS: 70,
  VSS: 60,
}

/**
 * Веса наград для всепородного (САС / CACIB) рейтинга:
 * Исключаются монопородные клубные титулы (КЧК, ПК, СС).
 */
export const SHOW_CAC_AWARD_WEIGHTS: Record<ShowAwardKey, number> = {
  ...SHOW_AWARD_WEIGHTS,
  KCHP: 0,
  YKCHP: 0,
  VKCHP: 0,
  KCHK: 0,
  YKCHK: 0,
  VKCHK: 0,
  SS: 0,
  YSS: 0,
  VSS: 0,
}

export type ShowMonoAgeCategory = 'all' | 'adult' | 'junior' | 'veteran'

export const SHOW_MONO_ADULT_KEYS: ShowAwardKey[] = ['KCHP', 'KCHK', 'SS']
export const SHOW_MONO_JUNIOR_KEYS: ShowAwardKey[] = ['YKCHP', 'YKCHK', 'YSS']
export const SHOW_MONO_VETERAN_KEYS: ShowAwardKey[] = ['VKCHP', 'VKCHK', 'VSS']

export function showMonoRankScore(titles: ShowTitleCounts): number {
  return SHOW_AWARD_ORDER.reduce(
    (sum, key) => sum + (titles[key] || 0) * (SHOW_MONO_AWARD_WEIGHTS[key] || 0),
    0,
  )
}

export function showMonoRankScoreForCategory(
  titles: ShowTitleCounts,
  category: ShowMonoAgeCategory = 'all',
): number {
  if (category === 'junior') {
    return (
      (titles.YKCHP || 0) * (SHOW_MONO_AWARD_WEIGHTS.YKCHP || 0) +
      (titles.YKCHK || 0) * (SHOW_MONO_AWARD_WEIGHTS.YKCHK || 0) +
      (titles.YSS || 0) * (SHOW_MONO_AWARD_WEIGHTS.YSS || 0)
    )
  }
  if (category === 'veteran') {
    return (
      (titles.VKCHP || 0) * (SHOW_MONO_AWARD_WEIGHTS.VKCHP || 0) +
      (titles.VKCHK || 0) * (SHOW_MONO_AWARD_WEIGHTS.VKCHK || 0) +
      (titles.VSS || 0) * (SHOW_MONO_AWARD_WEIGHTS.VSS || 0)
    )
  }
  if (category === 'adult') {
    return (
      (titles.KCHP || 0) * (SHOW_MONO_AWARD_WEIGHTS.KCHP || 0) +
      (titles.KCHK || 0) * (SHOW_MONO_AWARD_WEIGHTS.KCHK || 0) +
      (titles.SS || 0) * (SHOW_MONO_AWARD_WEIGHTS.SS || 0)
    )
  }
  return showMonoRankScore(titles)
}

export function showCacRankScore(titles: ShowTitleCounts): number {
  return SHOW_AWARD_ORDER.reduce(
    (sum, key) => sum + (titles[key] || 0) * (SHOW_CAC_AWARD_WEIGHTS[key] || 0),
    0,
  )
}

export function compareShowDogsMono(
  a: { rank_score?: number; titles: ShowTitleCounts; total_shows: number },
  b: { rank_score?: number; titles: ShowTitleCounts; total_shows: number },
  category: ShowMonoAgeCategory = 'all',
): number {
  const scoreA = showMonoRankScoreForCategory(a.titles, category)
  const scoreB = showMonoRankScoreForCategory(b.titles, category)
  if (scoreB !== scoreA) return scoreB - scoreA

  const tieBreakKeys =
    category === 'junior'
      ? SHOW_MONO_JUNIOR_KEYS
      : category === 'veteran'
        ? SHOW_MONO_VETERAN_KEYS
        : category === 'adult'
          ? SHOW_MONO_ADULT_KEYS
          : SHOW_MONO_AWARD_ORDER

  for (const key of tieBreakKeys) {
    const diff = (b.titles[key] || 0) - (a.titles[key] || 0)
    if (diff !== 0) return diff
  }

  return b.total_shows - a.total_shows
}

export function compareShowDogsCac(
  a: { rank_score?: number; titles: ShowTitleCounts; total_shows: number },
  b: { rank_score?: number; titles: ShowTitleCounts; total_shows: number },
): number {
  const scoreA = showCacRankScore(a.titles)
  const scoreB = showCacRankScore(b.titles)
  if (scoreB !== scoreA) return scoreB - scoreA

  const cacTieBreakKeys: ShowAwardKey[] = [
    'BIS',
    'BIG',
    'BOB',
    'BOS',
    'CACIB',
    'CAC',
    'JCAC',
    'VCAC',
    'CHRKF',
    'CW',
  ]
  for (const key of cacTieBreakKeys) {
    const diff = (b.titles[key] || 0) - (a.titles[key] || 0)
    if (diff !== 0) return diff
  }

  return b.total_shows - a.total_shows
}

/** Лучшая категория награды по иерархии (не счётчик). */
export function bestShowAward(titles: ShowTitleCounts): ShowAwardKey | null {
  for (const key of SHOW_AWARD_ORDER) {
    if ((titles[key] || 0) > 0) return key
  }
  return null
}

export const SHOW_MONO_AWARD_ORDER: ShowAwardKey[] = [
  'KCHP',
  'YKCHP',
  'VKCHP',
  'KCHK',
  'YKCHK',
  'VKCHK',
  'SS',
  'YSS',
  'VSS',
]

/** Лучшая награда по иерархии монопородного рейтинга НКП. */
export function bestShowMonoAward(
  titles: ShowTitleCounts,
  category: ShowMonoAgeCategory = 'all',
): ShowAwardKey | null {
  const order =
    category === 'junior'
      ? SHOW_MONO_JUNIOR_KEYS
      : category === 'veteran'
        ? SHOW_MONO_VETERAN_KEYS
        : category === 'adult'
          ? SHOW_MONO_ADULT_KEYS
          : SHOW_MONO_AWARD_ORDER

  for (const key of order) {
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
  return cdnPackShardKey(id, shardCount)
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
