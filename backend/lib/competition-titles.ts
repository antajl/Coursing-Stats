/**
 * Нормализация и ранг титулов соревнований (курсинг / БЗМП / бега) из поля qualification.
 * Общий модуль для агрегации профиля и сортировки чипов в UI.
 */

export type DogTitle = {
  title: string
  count: number
}

export type CompetitionTitleKey =
  | 'champion_russia'
  | 'cup_russia'
  | 'champion_rkf'
  | 'breed_champion_rkf'
  | 'cacil'
  | 'cacl'
  | 'caclbr'
  | 'regcacl'
  | 'international'
  | string

const DISPLAY_NAMES: Record<string, string> = {
  champion_russia: 'Чемпион России',
  cup_russia: 'Победитель Кубка России',
  champion_rkf: 'Чемпион РКФ',
  breed_champion_rkf: 'Чемпион РКФ в породе',
  regcacl: 'RegCACL',
  cacl: 'CACL',
  caclbr: 'CACLBr',
  cacil: 'CACIL',
  international: 'International Champion',
}

/** Выше = круче (сортировка убыванием). */
export const COMPETITION_TITLE_RANK: Record<string, number> = {
  champion_russia: 110,
  cup_russia: 105,
  champion_rkf: 100,
  breed_champion_rkf: 90,
  international: 88,
  cacil: 85,
  cacl: 60,
  caclbr: 50,
  regcacl: 40,
}

export function competitionTitleKey(raw: string): CompetitionTitleKey {
  const t = raw.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!t) return ''

  // Аббревиатуры / полные имена рабочих титулов
  if (
    /^чр(\s+рк)?$/.test(t) ||
    (t.includes('чемпион') && t.includes('россии') && !t.includes('ркф'))
  ) {
    return 'champion_russia'
  }
  if (/^пкр(\s+рк)?$/.test(t) || (t.includes('кубок') && t.includes('россии'))) {
    return 'cup_russia'
  }
  if (
    /^пчркф(\s+рк)?$/.test(t) ||
    (t.includes('чемпион') && t.includes('ркф') && (t.includes('пород') || t.includes(' в пород')))
  ) {
    return 'breed_champion_rkf'
  }
  if (/^чркф(\s+рк)?$/.test(t) || (t.includes('чемпион') && t.includes('ркф'))) {
    return 'champion_rkf'
  }

  // Сертификаты: узкие ключи раньше общего CACL
  if (t.includes('cacil') || t.includes('c.i.c')) return 'cacil'
  if (t.includes('caclbr') || /^cacl\s*br\b/.test(t) || t === 'cacl br') return 'caclbr'
  if (t.includes('regcacl') || (t.includes('reg') && t.includes('cacl'))) return 'regcacl'
  if (/\bcacl\b/.test(t) || t.startsWith('cacl')) return 'cacl'

  if (t.includes('international') && t.includes('champion')) return 'international'

  return t
}

export function competitionTitleDisplayName(raw: string, key = competitionTitleKey(raw)): string {
  if (DISPLAY_NAMES[key]) return DISPLAY_NAMES[key]
  return raw.trim()
}

export function competitionTitleRank(raw: string): number {
  const key = competitionTitleKey(raw)
  return COMPETITION_TITLE_RANK[key] ?? 10
}

/** Сортировка: круче → выше, затем по алфавиту. */
export function compareCompetitionTitles(a: string, b: string): number {
  const rankDiff = competitionTitleRank(b) - competitionTitleRank(a)
  if (rankDiff !== 0) return rankDiff
  return a.localeCompare(b, 'ru')
}

export function splitQualification(qualification: string): string[] {
  return qualification
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

export function aggregateQualificationTitles(
  rows: Array<{ qualification: string | null }>,
): DogTitle[] {
  const counts = new Map<CompetitionTitleKey, { title: string; count: number }>()

  for (const row of rows) {
    if (!row.qualification?.trim()) continue

    for (const part of splitQualification(row.qualification)) {
      const key = competitionTitleKey(part)
      if (!key) continue

      const existing = counts.get(key)
      if (existing) {
        existing.count += 1
      } else {
        counts.set(key, { title: competitionTitleDisplayName(part, key), count: 1 })
      }
    }
  }

  return [...counts.values()].sort((a, b) => compareCompetitionTitles(a.title, b.title))
}
