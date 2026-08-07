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
  SHOW_AWARD_ORDER,
  EMPTY_SHOW_TITLES,
  expandShowTitles,
  mergeShowTitles,
  parseShowTitles,
  presentShowAwards,
  type ShowAwardKey,
  type ShowTitleCounts,
  matchShowAwardToken,
} from '../../../backend/lib/show-award-ranking'
import {
  aggregateQualificationTitles,
  compareCompetitionTitles,
  competitionTitleDisplayName,
  competitionTitleKey,
  competitionTitleRank,
} from '../../../backend/lib/competition-titles'

export type DogTitle = {
  title: string
  count: number
}

/** Титулы шапки профиля, разделённые по домену. */
export type DogProfileTitleGroups = {
  competition: DogTitle[]
  show: DogTitle[]
}

export function formatTitleLine({ title, count }: DogTitle): string {
  return count > 1 ? `${title} ×${count}` : title
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

/** Объединение списков титулов: по ключу берём max(count), не сумму.
 * Выставки — ShowAwardKey; курсинг/беги — competitionTitleKey (старые «Чемпион РКФ» → ЧРКФ РК).
 */
export function maxMergeDogTitles(...lists: DogTitle[][]): DogTitle[] {
  const byKey = new Map<string, DogTitle>()
  for (const list of lists) {
    for (const t of list) {
      if (t.count <= 0 || !t.title.trim()) continue
      const showKey = matchShowAwardToken(t.title)
      const mergeKey = showKey
        ? `show:${showKey}`
        : `comp:${competitionTitleKey(t.title) || t.title.trim().toUpperCase()}`
      const display = showKey ? SHOW_AWARD_BADGE[showKey] : competitionTitleDisplayName(t.title)
      const existing = byKey.get(mergeKey)
      if (!existing || t.count > existing.count) {
        byKey.set(mergeKey, { title: display, count: t.count })
      }
    }
  }
  return [...byKey.values()].sort((a, b) => compareDogProfileTitles(a.title, b.title))
}

/**
 * Титулы курсинга/БЗМП/бегов: индекс профиля + пересчёт по истории стартов
 * (finished + непустой qualification), max по ключу — чтобы ничего не потерять.
 */
export function resolveCompetitionTitles(opts: {
  indexed?: DogTitle[] | null
  competitions?: Array<{ qualification?: string | null; status?: string | null }> | null
}): DogTitle[] {
  const indexed = Array.isArray(opts.indexed) ? opts.indexed : []
  const fromHistory = aggregateQualificationTitles(
    (opts.competitions ?? [])
      .filter(
        (row) =>
          row.status === 'finished' &&
          typeof row.qualification === 'string' &&
          row.qualification.trim() !== '',
      )
      .map((row) => ({ qualification: row.qualification ?? null })),
  )
  return maxMergeDogTitles(indexed, fromHistory)
}

/**
 * Выставочные титулы: счётчики карточки + сумма по history.title, затем max по ключу.
 */
export function resolveShowTitles(opts: {
  titles?: ShowTitleCounts | Partial<ShowTitleCounts> | null
  history?: Array<{ title?: string | null }> | null
}): DogTitle[] {
  const fromCard = expandShowTitles(opts.titles)
  let fromHistory = { ...EMPTY_SHOW_TITLES }
  for (const entry of opts.history ?? []) {
    if (!entry.title?.trim()) continue
    fromHistory = mergeShowTitles(fromHistory, parseShowTitles(entry.title))
  }
  return dogTitlesFromShowCounts(maxMergeShowTitleCounts(fromCard, fromHistory))
}

function maxMergeShowTitleCounts(a: ShowTitleCounts, b: ShowTitleCounts): ShowTitleCounts {
  const out = { ...EMPTY_SHOW_TITLES }
  for (const key of SHOW_AWARD_ORDER) {
    out[key] = Math.max(a[key] || 0, b[key] || 0)
  }
  return out
}

/** Раздельные группы для шапки: выставки и курсинг/беги. */
export function buildDogProfileTitleGroups(opts: {
  competitionIndexed?: DogTitle[] | null
  competitions?: Array<{ qualification?: string | null; status?: string | null }> | null
  showTitles?: ShowTitleCounts | Partial<ShowTitleCounts> | null
  showHistory?: Array<{ title?: string | null }> | null
}): DogProfileTitleGroups {
  return {
    competition: resolveCompetitionTitles({
      indexed: opts.competitionIndexed,
      competitions: opts.competitions,
    }),
    show: resolveShowTitles({
      titles: opts.showTitles,
      history: opts.showHistory,
    }),
  }
}

/**
 * Плоский список (SEO / legacy): курсинг/беги + выставки.
 * Одинаковые подписи — max; «Чемпион РКФ» (РК) и «ЧРКФ» (красота) — разные строки.
 */
export function mergeDogProfileTitles(
  competition: DogTitle[],
  show?: ShowTitleCounts | Partial<ShowTitleCounts> | null,
): DogTitle[] {
  return maxMergeDogTitles(competition, dogTitlesFromShowCounts(show))
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
