import type { CSSProperties } from 'react'
import type { RawScores, Result } from './types'

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}.${month}.${year}`
}

export function formatDateLong(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
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

export function parseRawScores(rawScoresJson: string | RawScores | null | undefined): RawScores | null {
  if (!rawScoresJson) return null
  if (typeof rawScoresJson === 'object') return rawScoresJson as RawScores
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

export function normalizeBibColorName(bibColor: string | undefined): string | null {
  const c = bibColor?.toLowerCase() ?? ''
  if (c === 'red' || c === '#ff0000') return 'red'
  if (c === 'white' || c === '#ffffff') return 'white'
  if (c === 'blue' || c === '#0000ff' || c === '#00ccff' || c === '#00ffff') return 'blue'
  if (c === 'black' || c === '#000000' || c === '#000') return 'black'
  if (c === 'green' || c === '#00ff00' || c === '#008000') return 'green'
  if (c === 'yellow' || c === '#ffff00' || c === '#efe4b0' || c === '#fff8dc') return 'yellow'
  if (!c) return null
  return bibColor!
}

export function bibColorStyle(bibColor: string | undefined): CSSProperties {
  const normalized = normalizeBibColorName(bibColor)
  const backgroundColor =
    normalized === 'red' ? '#ef4444' :
    normalized === 'white' ? '#ffffff' :
    normalized === 'blue' ? '#3b82f6' :
    normalized === 'black' ? '#111827' :
    normalized === 'green' ? '#22c55e' :
    normalized === 'yellow' ? '#eab308' :
    bibColor?.startsWith('#') ? bibColor! :
    '#9ca3af'
  return {
    backgroundColor,
    border: normalized === 'white' ? '1px solid #d1d5db' : '1px solid rgba(0,0,0,0.15)',
  }
}

export function bibTextClass(bibColor: string | undefined): string {
  const normalized = normalizeBibColorName(bibColor)
  if (normalized === 'white' || normalized === 'yellow') return 'text-charcoal-900 dark:text-charcoal-100'
  if (normalized === 'red' || normalized === 'blue' || normalized === 'black' || normalized === 'green') return 'text-white'
  return 'text-charcoal-900 dark:text-charcoal-100'
}

export function hasDisplayableRawScores(rawScores: RawScores | null): boolean {
  if (!rawScores) return false
  return !!(rawScores.heats || rawScores.format === 'racing')
}
