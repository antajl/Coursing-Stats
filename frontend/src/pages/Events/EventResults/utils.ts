import type { CSSProperties } from 'react'
import type { RawScores, Result } from './types'

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}.${month}.${year}`
}

export function groupResultsByBreedClass(results: Result[]): {
  grouped: Record<string, Result[]>
  sortedGroups: string[]
} {
  const grouped = results.reduce<Record<string, Result[]>>((acc, result) => {
    const groupKey = result.breed_class || 'Другие'
    if (!acc[groupKey]) acc[groupKey] = []
    acc[groupKey].push(result)
    return acc
  }, {})

  const sortedGroups = Object.keys(grouped).sort((a, b) => {
    if (a === 'Неприбывшие участники') return 1
    if (b === 'Неприбывшие участники') return -1
    return a.localeCompare(b)
  })

  for (const groupKey of sortedGroups) {
    grouped[groupKey].sort((a, b) => (a.placement || 999) - (b.placement || 999))
  }

  return { grouped, sortedGroups }
}

export function parseRawScores(rawScoresJson: string | null | undefined): RawScores | null {
  if (!rawScoresJson) return null
  try {
    return JSON.parse(rawScoresJson) as RawScores
  } catch {
    return null
  }
}

export function isRacingFormat(rawScores: RawScores | null): boolean {
  if (!rawScores) return false
  return (
    rawScores.format === 'racing' ||
    !!(rawScores.heats?.[0] && (rawScores.heats[0].time !== undefined || rawScores.heats[0].speed_kmh !== undefined))
  )
}

export function bibColorStyle(bibColor: string | undefined): CSSProperties {
  return {
    backgroundColor:
      bibColor === 'red' ? '#ef4444' :
      bibColor === 'white' ? '#ffffff' :
      bibColor === 'blue' ? '#3b82f6' :
      '#9ca3af',
    border: bibColor === 'white' ? '1px solid #e5e7eb' : 'none',
  }
}

export function hasDisplayableRawScores(rawScores: RawScores | null): boolean {
  if (!rawScores) return false
  return !!(rawScores.heats || rawScores.format === 'racing')
}
