import { CRITERIA_META } from './constants'
import type { BreedStat, JudgeEvent } from './types'

export function getCriteriaMeta(nameOrId: string) {
  const norm = nameOrId.toLowerCase().trim()
  const found = CRITERIA_META.find(
    (c) => c.id === nameOrId || c.name.toLowerCase() === norm,
  )
  return found || CRITERIA_META[0]
}

export function formatBreedName(breed: string): string {
  if (!breed) return ''
  const trimmed = breed.trim()
  if (/[a-zа-я]/.test(trimmed)) return trimmed
  return trimmed.charAt(0) + trimmed.slice(1).toLowerCase()
}

export function formatDate(date: string): string {
  if (!date) return '—'
  const iso = date.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[3]}.${iso[2]}.${iso[1]}`
  return date
}

export function getScoreTone(score20: number | null | undefined): {
  badge: string
  text: string
  bar: string
} {
  if (score20 == null || Number.isNaN(score20)) {
    return {
      badge: 'bg-old-money-50 text-charcoal-600 border-old-money-200',
      text: 'text-charcoal-700',
      bar: 'bg-charcoal-400',
    }
  }
  const score100 = score20 * 5
  if (score100 >= 86) {
    return {
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
      text: 'text-emerald-700',
      bar: 'bg-emerald-500',
    }
  }
  if (score100 >= 82) {
    return {
      badge: 'bg-amber-50 text-amber-800 border-amber-200/90',
      text: 'text-amber-700',
      bar: 'bg-amber-500',
    }
  }
  return {
    badge: 'bg-rose-50 text-rose-800 border-rose-200/90',
    text: 'text-rose-700',
    bar: 'bg-rose-500',
  }
}

export function collectEvents(breedStats: BreedStat[] | undefined): JudgeEvent[] {
  const map = new Map<string, JudgeEvent>()
  for (const stat of breedStats || []) {
    for (const dog of stat.dogs || []) {
      for (const ev of dog.events || []) {
        const date = ev.date || ''
        const title = ev.title || 'Мероприятие'
        const key = `${date}|${title}|${stat.breed}`
        if (!map.has(key)) {
          map.set(key, { key, title, date, breed: stat.breed })
        }
      }
    }
  }
  return [...map.values()].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}
