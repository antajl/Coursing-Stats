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

export function normalizeBreed(b: string): string {
  if (!b) return ''
  const s = b.trim().toLowerCase()
  if (s.includes('уиппет')) return 'Уиппет'
  if (s.includes('грейхаунд')) return 'Грейхаунд'
  if (s.includes('левретка')) return 'Левретка'
  if (s.includes('басенджи')) return 'Басенджи'
  if (s.includes('русская псовая') || s.includes('рпб')) return 'Русская псовая борзая'
  if (s.includes('салюки')) return 'Салюки'
  if (s.includes('азавак')) return 'Азавак'
  if (s.includes('афган') || s.includes('афганская')) return 'Афганская борзая'
  if (s.includes('ирландский волкодав')) return 'Ирландский волкодав'
  if (s.includes('дирхаунд')) return 'Дирхаунд'
  if (s.includes('фараонова')) return 'Фараонова собака'
  if (s.includes('родезийский')) return 'Родезийский риджбек'
  if (s.includes('хортая')) return 'Хортая борзая'
  if (s.includes('чирнеко')) return 'Чирнеко дель Этна'
  if (s.includes('гальго') || s.includes('испанская')) return 'Испанская борзая (гальго)'
  return b.trim()
}

export function parseBreedClass(breedClass?: string | null, defaultBreed: string = '', defaultSex: string = '') {
  let parts = (breedClass || '').split(' - ').map(s => s.trim())
  if (parts.length === 1 && breedClass && breedClass.includes('_')) {
    parts = breedClass.split('_').map(s => s.trim())
  }
  if (parts[0] === 'Неявившиеся участники' || parts[0] === 'Неприбывшие участники') {
    parts = []
  }
  const breed = parts[0] || normalizeBreed(defaultBreed) || ''
  const className = parts[1] || 'Стандартный'
  let category = parts[2] || defaultSex || 'Микс'

  if (category === 'Кобель' || category === 'Кобели') category = 'Кобели'
  else if (category === 'Сука' || category === 'Суки') category = 'Суки'
  else category = 'Микс'

  const groupHeader = `${breed} - ${className} - ${category}`
  return { breed, className, category, groupHeader }
}

export function groupResultsByBreedClass(results: Result[]): {
  grouped: Record<string, Result[]>
  sortedGroups: string[]
} {
  const grouped = results.reduce<Record<string, Result[]>>((acc, result) => {
    // Неявки всегда в отдельной группе в конце списка (как в modern-протоколах)
    if (result.status === 'dns' || result.status === 'absent') {
      if (!acc['Неприбывшие участники']) acc['Неприбывшие участники'] = []
      acc['Неприбывшие участники'].push(result)
      return acc
    }
    const info = parseBreedClass(result.breed_class, result.dog?.breed, result.dog?.sex)
    const groupKey = info.groupHeader || result.breed_class || 'Другие'
    if (!acc[groupKey]) acc[groupKey] = []
    acc[groupKey].push(result)
    return acc
  }, {})

  const sortedGroups = Object.keys(grouped).sort((a, b) => {
    // "Неявившиеся участники" всегда в самом низу
    if (a === 'Неявившиеся участники' || a === 'Неприбывшие участники') return 1
    if (b === 'Неявившиеся участники' || b === 'Неприбывшие участники') return -1

    // Порядок каталога (хронологический порядок забегов состязания)
    const minA = Math.min(...grouped[a].map(d => d.catalog_no || 9999))
    const minB = Math.min(...grouped[b].map(d => d.catalog_no || 9999))
    if (minA !== minB) return minA - minB

    return a.localeCompare(b, 'ru')
  })

  for (const groupKey of sortedGroups) {
    grouped[groupKey].sort((a, b) => {
      const aDns = (a.status === 'dns' || a.status === 'absent') ? 1 : 0
      const bDns = (b.status === 'dns' || b.status === 'absent') ? 1 : 0
      if (aDns !== bDns) return aDns - bDns
      const pa = a.placement || 999
      const pb = b.placement || 999
      if (pa !== pb) return pa - pb
      return (a.catalog_no || 999) - (b.catalog_no || 999)
    })
  }

  return { grouped, sortedGroups }
}

/**
 * Racing grouping: delegates to unified canonical catalog order matching protocol_cs
 */
export function groupRacingResults(results: Result[]): {
  grouped: Record<string, Result[]>
  sortedGroups: string[]
} {
  return groupResultsByBreedClass(results)
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

export function getBestTimesByRace(results: Result[]): Record<string, number> {
  const heatsByBib: Record<string, { times: number[]; totalParticipants: number }> = {}

  for (const r of results) {
    if (r.status === 'dns' || r.status === 'absent') continue

    const rawScores = parseRawScores(r.raw_scores_json)
    if (!rawScores?.heats) continue

    for (const heat of rawScores.heats) {
      if (heat.bib_number == null) continue
      const key = String(heat.bib_number)
      if (!heatsByBib[key]) {
        heatsByBib[key] = { times: [], totalParticipants: 0 }
      }
      heatsByBib[key].totalParticipants += 1

      if (!heat.disqualified && heat.time != null) {
        const t = typeof heat.time === 'number' ? heat.time : parseFloat(String(heat.time))
        if (!isNaN(t) && t > 0) {
          heatsByBib[key].times.push(t)
        }
      }
    }
  }

  const bestTimes: Record<string, number> = {}
  for (const [bib, data] of Object.entries(heatsByBib)) {
    if (data.totalParticipants >= 2 && data.times.length > 0) {
      bestTimes[bib] = Math.min(...data.times)
    }
  }

  return bestTimes
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
  if (normalized === 'white' || normalized === 'yellow') return 'text-charcoal-900'
  if (normalized === 'red' || normalized === 'blue' || normalized === 'black' || normalized === 'green') return 'text-white'
  return 'text-charcoal-900'
}

export function hasDisplayableRawScores(rawScores: RawScores | null): boolean {
  if (!rawScores) return false
  return !!(rawScores.heats || rawScores.format === 'racing')
}

/** Heat-level DQ is shown in ScoringDetail — avoid repeating the same label in the card header. */
export function hasDisqualifiedHeat(rawScores: RawScores | null): boolean {
  return Boolean(rawScores?.heats?.some(h => h.disqualified))
}

export function extractDogSex(result: Result): 'm' | 'f' | '' {
  const s = result.dog?.sex || (result.dog as any)?.gender || ''
  if (s) {
    const u = s.trim().toLowerCase()
    if (u === 'кобель' || u === 'к' || u === 'male' || u === 'm') return 'm'
    if (u === 'сука' || u === 'с' || u === 'female' || u === 'f') return 'f'
  }
  const bc = (result.breed_class || (result as any).class_label || '').toLowerCase()
  if (bc.includes('кобел')) return 'm'
  if (bc.includes('сук')) return 'f'
  return ''
}

