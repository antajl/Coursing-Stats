import {
  categoryBadgeClass,
  classifyCompetitionTitle,
  classifyShowCumulativeTitle,
  type AwardCategory,
} from './awardCategories'
import {
  SHOW_AWARD_BADGE,
  SHOW_AWARD_CATEGORY,
  type ShowAwardKey,
  matchShowAwardToken,
} from '../../../backend/lib/show-award-ranking'

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

function categoryForTitleString(title: string): AwardCategory {
  const showKey = matchShowAwardToken(title)
  if (showKey) return SHOW_AWARD_CATEGORY[showKey]

  const cum = classifyShowCumulativeTitle(title)
  if (cum) return cum

  return classifyCompetitionTitle(title)
}

/** Класс бейджа по строке титула (протокол, профиль, справка). */
export function titleBadgeClass(title: string): string {
  const upper = title.trim().toUpperCase()
  const category = categoryForTitleString(title)
  const topPrestige = upper === 'BIS' || upper.startsWith('BEST IN SHOW')
  return categoryBadgeClass(category, { topPrestige })
}

/** Класс бейджа по ключу выставочной награды. */
export function showAwardBadgeClass(key: ShowAwardKey): string {
  return categoryBadgeClass(SHOW_AWARD_CATEGORY[key], { topPrestige: key === 'BIS' })
}

export function titleBadgeClassForCategory(category: AwardCategory, topPrestige = false): string {
  return categoryBadgeClass(category, { topPrestige })
}

export { SHOW_AWARD_BADGE }
