export type DogTitle = {
  title: string
  count: number
}

type TitleKey = 'champion_russia' | 'champion_rkf' | 'cup_russia' | 'international' | 'cacil' | 'regcacl' | 'cacl' | string

const DISPLAY_NAMES: Record<string, string> = {
  champion_russia: 'Чемпион России',
  champion_rkf: 'Чемпион РКФ',
  cup_russia: 'Победитель Кубка России',
  regcacl: 'RegCACL',
  cacl: 'CACL',
  cacil: 'CACIL',
  international: 'International Champion',
}

const TITLE_RANK: Record<string, number> = {
  champion_russia: 110,
  champion_rkf: 100,
  cup_russia: 95,
  international: 90,
  cacil: 85,
  cacl: 60,
  regcacl: 40,
}

export function titleKey(raw: string): TitleKey {
  const t = raw.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!t) return ''

  if (t.includes('чемпион') && t.includes('россии') && !t.includes('ркф')) return 'champion_russia'
  if (t.includes('чемпион') && t.includes('ркф')) return 'champion_rkf'
  if (t.includes('кубок') && t.includes('россии')) return 'cup_russia'
  if (t.includes('cacil') || t.includes('c.i.c')) return 'cacil'
  if (t.includes('international') || t.includes('champion')) return 'international'
  if (t.includes('regcacl') || (t.includes('reg') && t.includes('cacl'))) return 'regcacl'
  if (t.includes('cacl')) return 'cacl'

  return t
}

function displayName(raw: string, key: TitleKey): string {
  if (DISPLAY_NAMES[key]) return DISPLAY_NAMES[key]
  return raw.trim()
}

export function splitQualification(qualification: string): string[] {
  return qualification
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

export function aggregateQualificationTitles(
  rows: Array<{ qualification: string | null }>
): DogTitle[] {
  const counts = new Map<TitleKey, { title: string; count: number }>()

  for (const row of rows) {
    if (!row.qualification?.trim()) continue

    for (const part of splitQualification(row.qualification)) {
      const key = titleKey(part)
      if (!key) continue

      const existing = counts.get(key)
      if (existing) {
        existing.count += 1
      } else {
        counts.set(key, { title: displayName(part, key), count: 1 })
      }
    }
  }

  return [...counts.values()].sort((a, b) => {
    const rankDiff = (TITLE_RANK[titleKey(b.title)] ?? 10) - (TITLE_RANK[titleKey(a.title)] ?? 10)
    if (rankDiff !== 0) return rankDiff
    return a.title.localeCompare(b.title, 'ru')
  })
}
