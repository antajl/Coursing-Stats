import {
  parseShowTitles,
  type ShowAwardKey,
} from '../../../../backend/lib/show-award-ranking'
import { bestShowGradeLabel } from '../../../../backend/lib/show-grades'
import type { ShowDogCardData } from '../Shows/ShowDogCard'

export type ShowHistoryEntry = {
  date: string
  exhibition_id: number
  exhibition_title?: string
  placement: number
  title?: string
  grade?: string
}

export function formatShowsCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 19) return `${count} выставок`
  if (mod10 === 1) return `${count} выставка`
  if (mod10 >= 2 && mod10 <= 4) return `${count} выставки`
  return `${count} выставок`
}

export function resolveBestGradeLabel(
  dog: ShowDogCardData & { history?: ShowHistoryEntry[] },
): string | null {
  if (dog.best_grade?.trim()) return dog.best_grade.trim()
  const history = Array.isArray(dog.history) ? dog.history : []
  return bestShowGradeLabel(history.map((h) => h.grade))
}

export function resolveBestAwardExhibitionId(
  history: ShowHistoryEntry[],
  bestKey: ShowAwardKey | null,
  bestBadge: string | null,
): number | null {
  if (!history || history.length === 0) return null

  // 1. Поиск выставки с высшей наградой bestKey
  if (bestKey) {
    const matched = history.find((entry) => {
      if (!entry.exhibition_id) return false
      try {
        const parsed = parseShowTitles(entry.title || '')
        if (parsed[bestKey] && parsed[bestKey] > 0) return true
      } catch {
        // ignore
      }
      if (bestBadge && entry.title && entry.title.includes(bestBadge)) {
        return true
      }
      return false
    })
    if (matched?.exhibition_id) return matched.exhibition_id
  }

  // 2. Fallback: выставка с отличной оценкой
  const bestGradeMatch = history.find(
    (entry) => entry.exhibition_id && /отл/i.test(entry.grade || ''),
  )
  if (bestGradeMatch?.exhibition_id) return bestGradeMatch.exhibition_id

  // 3. Fallback: первая выставка в истории с ID
  const fallback = history.find((entry) => Boolean(entry.exhibition_id))
  return fallback?.exhibition_id ?? null
}
