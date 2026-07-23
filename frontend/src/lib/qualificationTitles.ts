import {
  categoryBadgeClass,
  classifyCompetitionTitle,
  classifyShowCumulativeTitle,
  type AwardCategory,
} from './awardCategories'
import {
  SHOW_AWARD_BADGE,
  SHOW_AWARD_CATEGORY,
  SHOW_AWARD_WEIGHTS,
  presentShowAwards,
  type ShowAwardKey,
  type ShowTitleCounts,
  matchShowAwardToken,
} from '../../../backend/lib/show-award-ranking'
import {
  compareCompetitionTitles,
  competitionTitleRank,
} from '../../../backend/lib/competition-titles'

export type DogTitle = {
  title: string
  count: number
}

export function formatTitleLine({ title, count }: DogTitle): string {
  return count > 1 ? `${title} X${count}` : title
}

export function parseQualificationTitles(qualification: string | null | undefined): string[] {
  if (!qualification?.trim()) return []
  return qualification
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

/** Выставочные счётчики → список титулов для шапки профиля. */
export function dogTitlesFromShowCounts(
  titles: ShowTitleCounts | Partial<ShowTitleCounts> | null | undefined,
): DogTitle[] {
  if (!titles) return []
  return presentShowAwards(titles as ShowTitleCounts).map((key) => ({
    title: SHOW_AWARD_BADGE[key],
    count: titles[key] || 0,
  }))
}

/**
 * Титулы шапки профиля: курсинг/БЗМП/беги + выставки.
 * Одинаковые подписи суммируются; «Чемпион РКФ» (РК) и «ЧРКФ» (красота) — разные строки.
 */
export function mergeDogProfileTitles(
  competition: DogTitle[],
  show?: ShowTitleCounts | Partial<ShowTitleCounts> | null,
): DogTitle[] {
  const byKey = new Map<string, DogTitle>()
  for (const t of competition) {
    const k = t.title.trim().toUpperCase()
    if (!k || t.count <= 0) continue
    byKey.set(k, { title: t.title, count: t.count })
  }
  for (const t of dogTitlesFromShowCounts(show)) {
    if (t.count <= 0) continue
    const k = t.title.trim().toUpperCase()
    const existing = byKey.get(k)
    if (existing) existing.count += t.count
    else byKey.set(k, { ...t })
  }
  return [...byKey.values()].sort((a, b) => compareDogProfileTitles(a.title, b.title))
}

/** Ранг для сортировки: вес выставки или ранг титула соревнований. */
export function dogProfileTitleRank(title: string): number {
  const showKey = matchShowAwardToken(title)
  if (showKey) return SHOW_AWARD_WEIGHTS[showKey]
  return competitionTitleRank(title)
}

export function compareDogProfileTitles(a: string, b: string): number {
  const diff = dogProfileTitleRank(b) - dogProfileTitleRank(a)
  if (diff !== 0) return diff
  return compareCompetitionTitles(a, b)
}

/** Категория чипа в шапке: ключ выставки → титул соревнований → кумулятив. */
export function classifyDogProfileTitle(title: string): AwardCategory {
  const showKey = matchShowAwardToken(title)
  if (showKey) return SHOW_AWARD_CATEGORY[showKey]

  // Сначала рабочие титулы (в т.ч. «Чемпион РКФ»), иначе beauty-эвристика съест их в cumulative
  const competition = classifyCompetitionTitle(title)
  if (competition !== 'other') return competition

  const cum = classifyShowCumulativeTitle(title)
  if (cum) return cum

  return 'other'
}

/** Класс бейджа по строке титула (протокол, профиль, справка). */
export function titleBadgeClass(title: string): string {
  const upper = title.trim().toUpperCase()
  const category = classifyDogProfileTitle(title)
  const showKey = matchShowAwardToken(title)
  const topPrestige =
    showKey === 'BIS' ||
    (showKey != null && showKey.startsWith('BIS_')) ||
    upper === 'BIS' ||
    upper.startsWith('BEST IN SHOW')
  return categoryBadgeClass(category, { topPrestige })
}

/** Класс бейджа по ключу выставочной награды. */
export function showAwardBadgeClass(key: ShowAwardKey): string {
  return categoryBadgeClass(SHOW_AWARD_CATEGORY[key], {
    topPrestige: key === 'BIS' || key.startsWith('BIS_'),
  })
}

export function titleBadgeClassForCategory(category: AwardCategory, topPrestige = false): string {
  return categoryBadgeClass(category, { topPrestige })
}

export { SHOW_AWARD_BADGE }
