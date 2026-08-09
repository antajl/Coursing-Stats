import type { RankingTab, TopDog, CoursingRecord } from '../types'
import type { ShowHomeTopDog } from '../../../lib/staticData'

/** Russian plural: участие / участия / участий */
export function formatStarts(n?: number | null): string | null {
  if (n == null || Number.isNaN(n)) return null
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return `${n} участий`
  if (mod10 === 1) return `${n} участие`
  if (mod10 >= 2 && mod10 <= 4) return `${n} участия`
  return `${n} участий`
}

export function formatScore(value?: number | null): string {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return Number(value).toFixed(1)
}

export function formatIndex(value?: number | null): string {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return Number(value).toFixed(2)
}

export function formatSpeed(value?: number | string | null): string {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return Number(value).toFixed(1)
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString

    const day = date.getDate()
    const months = ['янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.', 'июл.', 'авг.', 'сен.', 'окт.', 'ноя.', 'дек.']
    const month = months[date.getMonth()]

    return `${day} ${month}`
  } catch {
    return dateString
  }
}

export function competitionMetric(dog: TopDog, tab: RankingTab): string {
  if (tab === 'speed') {
    return `${formatSpeed(dog.best_speed)} км/ч`
  }
  return formatIndex(dog.rating_score ?? dog.avg_judge_score)
}

export function competitionMeta(dog: TopDog, tab: RankingTab): string {
  // Only show year, breed is passed separately
  return '2026'
}

export function showHomeMetric(dog: ShowHomeTopDog): string {
  // Format titles from object counters (e.g., { BIS: 2, CAC: 1 })
  if (dog.titles && typeof dog.titles === 'object') {
    const titleEntries = Object.entries(dog.titles)
      .filter(([_, count]) => count > 0)
      .slice(0, 2)
      .map(([title, count]) => {
        // Only show count if > 1
        return count > 1 ? `${title}×${count}` : title
      })
    
    if (titleEntries.length > 0) {
      return titleEntries.join(', ')
    }
  }
  // Fallback to best_award
  return dog.best_award || '—'
}

export function rankCoursingRecords(records: CoursingRecord[]): CoursingRecord[] {
  return [...records].sort((a, b) => a.time_seconds - b.time_seconds).slice(0, 3)
}
