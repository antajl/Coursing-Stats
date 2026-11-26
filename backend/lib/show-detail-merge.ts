import {
  bestShowAward,
  mergeShowTitles,
  parseShowTitles,
  showRankScore,
  type ShowTitleCounts,
} from './show-award-ranking'
import { bestShowGradeLabel } from './show-grades'

export interface MergeableShowHistoryEntry {
  exhibition_id: number
  title: string
  grade?: string
}

export interface MergeableShowDog<H extends MergeableShowHistoryEntry = MergeableShowHistoryEntry> {
  total_shows: number
  rank_score: number
  best_award: string | null
  best_grade: string | null
  titles: ShowTitleCounts
  history: H[]
}

/**
 * Merges a yearly show slice into an all-time show dog detail record without
 * double-counting titles for exhibitions already present in `existing.history`.
 */
export function mergeYearDogIntoDetail<H extends MergeableShowHistoryEntry>(
  existing: MergeableShowDog<H>,
  yearDog: Pick<MergeableShowDog<H>, 'history' | 'best_grade'>,
): void {
  const existingExIds = new Set(existing.history.map((h) => h.exhibition_id))
  let addedAny = false

  for (const h of yearDog.history) {
    if (!existingExIds.has(h.exhibition_id)) {
      existing.history.push(h)
      existingExIds.add(h.exhibition_id)
      existing.total_shows = (existing.total_shows || 0) + 1
      existing.titles = mergeShowTitles(existing.titles, parseShowTitles(h.title))
      addedAny = true
    }
  }

  if (addedAny) {
    const recalculatedScore = showRankScore(existing.titles)
    if (recalculatedScore > (existing.rank_score ?? 0)) {
      existing.rank_score = recalculatedScore
    }
    existing.best_award = bestShowAward(existing.titles)
    if (yearDog.best_grade && (!existing.best_grade || yearDog.best_grade !== existing.best_grade)) {
      existing.best_grade = bestShowGradeLabel(existing.history.map((h) => h.grade))
    }
  }
}
