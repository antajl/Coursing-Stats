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
  return `/dog/${stableShowProfileId(name, breedTrim)}`
}

export function mainRingTabShortLabel(rows: MainRingRow[]): string {
  const sample = rows[0]
  if (!sample) return '—'
  const key = sample.competition_key
  if (key === 'BIG') {
    return sample.group != null ? `BIG ${sample.group}` : 'BIG'
  }
  const fromPlace1 = rows.find((r) => r.place === 1 && r.award_badge)?.award_badge
  if (fromPlace1) return fromPlace1
  if (key === 'BIS') return SHOW_AWARD_BADGE.BIS
  if (key === 'BIS_BABY') return SHOW_AWARD_BADGE.BIS_BABY
  if (key === 'BIS_PUPPY') return SHOW_AWARD_BADGE.BIS_PUPPY
  if (key === 'BIS_JUNIOR') return SHOW_AWARD_BADGE.BIS_JUNIOR
  if (key === 'BIS_VETERAN') return SHOW_AWARD_BADGE.BIS_VETERAN
  return sample.competition_label.slice(0, 24) || key
}

/** Группы главного ринга: BIS → возраст → BIG по номеру FCI. */
export function groupMainRing(rows: MainRingRow[]): MainRingTab[] {
  const byId = new Map<string, MainRingRow[]>()
  for (const row of rows) {
    const id = `${row.competition_key}:${row.group ?? ''}:${row.competition_label || row.competition_key}`
    if (!byId.has(id)) byId.set(id, [])
    byId.get(id)!.push(row)
  }

  const tabs: MainRingTab[] = [...byId.entries()].map(([id, list]) => {
    const sorted = list.slice().sort((a, b) => a.place - b.place)
    return {
      id,
      label: sorted[0]?.competition_label || sorted[0]?.competition_key || id,
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
