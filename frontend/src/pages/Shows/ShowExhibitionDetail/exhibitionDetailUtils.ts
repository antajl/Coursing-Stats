import { SHOW_AWARD_BADGE } from '../../../../../backend/lib/show-award-ranking'
import { stableShowProfileId } from '../../../lib/showDogProfilePath'
import { splitDogNameDisplay } from '../showExhibitionUtils'
import type { MainRingRow } from './types'

export type MainRingTab = {
  id: string
  label: string
  shortLabel: string
  rows: MainRingRow[]
}

export const MAIN_RING_KEY_ORDER: Record<string, number> = {
  BIS: 0,
  BIS_BABY: 1,
  BIS_PUPPY: 2,
  BIS_JUNIOR: 3,
  BIS_VETERAN: 4,
  BIG: 5,
  OTHER: 6,
}

export function exhibitionDogProfilePath(dogName: string, breed: string): string | null {
  const name = splitDogNameDisplay(dogName).name.trim()
  const breedTrim = breed.trim()
  if (!name || !breedTrim) return null
  const id = stableShowProfileId(name, breedTrim)
  return `/dog/${id}?name=${encodeURIComponent(name)}&breed=${encodeURIComponent(breedTrim)}`
}

export function extractGroupNumber(label: string): number | null {
  const m =
    label.match(/(\d{1,2})\s*ГРУППА/i) ||
    label.match(/BEST\s+IN\s+GROUP\s+(\d{1,2})/i) ||
    label.match(/GROUP\s+(\d{1,2})/i) ||
    label.match(/^(\d{1,2})\s*FCI/i)
  if (m) {
    const num = Number(m[1])
    if (num >= 1 && num <= 10) return num
  }
  return null
}

export function cleanMainRingLabel(
  raw: string,
  key?: string,
  group?: number | null,
): string {
  let s = (raw || '').replace(/\s+/g, ' ').trim()
  s = s.replace(/^[\s/\\|–—-]+/, '').replace(/[\s/\\|–—-]+$/, '').trim()
  s = s.replace(/\s*\/\s*/g, ' / ')

  if (key === 'BIS_BABY') return 'ЛУЧШИЙ БЕБИ / BEST IN SHOW BABY'
  if (key === 'BIS_PUPPY') return 'ЛУЧШИЙ ЩЕНОК / BEST IN SHOW PUPPY'
  if (key === 'BIS_JUNIOR') return 'ЛУЧШИЙ ЮНИОР / BEST IN SHOW JUNIOR'
  if (key === 'BIS_VETERAN') return 'ЛУЧШИЙ ВЕТЕРАН / BEST IN SHOW VETERAN'
  if (key === 'BIS') return 'ЛУЧШАЯ СОБАКА ВЫСТАВКИ / BEST IN SHOW'
  if (key === 'BIG') {
    const g = group ?? extractGroupNumber(s)
    if (g != null && g > 0) {
      return `${g} ГРУППА FCI / BEST IN GROUP ${g}`
    }
    return s || 'BEST IN GROUP'
  }

  return s || key || ''
}

export function mainRingTabShortLabel(rows: MainRingRow[]): string {
  const sample = rows[0]
  if (!sample) return '—'
  const key = sample.competition_key
  if (key === 'BIG') {
    const g = sample.group ?? extractGroupNumber(sample.competition_label)
    return g != null ? `BIG ${g}` : 'BIG'
  }
  const fromPlace1 = rows.find((r) => r.place === 1 && r.award_badge)?.award_badge
  if (fromPlace1) return fromPlace1
  if (key === 'BIS') return SHOW_AWARD_BADGE.BIS
  if (key === 'BIS_BABY') return SHOW_AWARD_BADGE.BIS_BABY
  if (key === 'BIS_PUPPY') return SHOW_AWARD_BADGE.BIS_PUPPY
  if (key === 'BIS_JUNIOR') return SHOW_AWARD_BADGE.BIS_JUNIOR
  if (key === 'BIS_VETERAN') return SHOW_AWARD_BADGE.BIS_VETERAN
  const clean = cleanMainRingLabel(sample.competition_label, key, sample.group)
  return clean.slice(0, 24) || key
}

/** Группы главного ринга: BIS → возраст → BIG по номеру FCI. */
export function groupMainRing(rows: MainRingRow[]): MainRingTab[] {
  const byId = new Map<string, MainRingRow[]>()
  for (const row of rows) {
    const groupNum =
      row.group ??
      (row.competition_key === 'BIG' ? extractGroupNumber(row.competition_label) : null)
    const normalizedKey = row.competition_key || 'OTHER'
    const isStandard = normalizedKey !== 'OTHER'
    const cleanLabel = cleanMainRingLabel(row.competition_label, normalizedKey, groupNum)

    // Standard competitions (BIS, BIS_*, BIG) are keyed by key + group so split fragments merge!
    const id = isStandard
      ? `${normalizedKey}:${groupNum ?? ''}`
      : `OTHER:${cleanLabel}`

    if (!byId.has(id)) byId.set(id, [])
    byId.get(id)!.push({
      ...row,
      group: groupNum,
      competition_label: cleanLabel,
    })
  }

  const tabs: MainRingTab[] = [...byId.entries()].map(([id, list]) => {
    // Deduplicate any rows that have identical place + catalog_number/dog_name
    const seen = new Set<string>()
    const deduped: MainRingRow[] = []
    for (const r of list) {
      const sig = `${r.place}-${r.catalog_number}-${r.dog_name}`
      if (!seen.has(sig)) {
        seen.add(sig)
        deduped.push(r)
      }
    }
    const sorted = deduped.sort((a, b) => a.place - b.place)
    const first = sorted[0]
    return {
      id,
      label: first?.competition_label || id,
      shortLabel: mainRingTabShortLabel(sorted),
      rows: sorted,
    }
  })

  tabs.sort((a, b) => {
    const ka = a.rows[0]?.competition_key || 'OTHER'
    const kb = b.rows[0]?.competition_key || 'OTHER'
    const oa = MAIN_RING_KEY_ORDER[ka] ?? 9
    const ob = MAIN_RING_KEY_ORDER[kb] ?? 9
    if (oa !== ob) return oa - ob
    const ga = a.rows[0]?.group
    const gb = b.rows[0]?.group
    if (ga != null && gb != null && ga !== gb) return ga - gb
    return a.label.localeCompare(b.label, 'ru')
  })

  return tabs
}
