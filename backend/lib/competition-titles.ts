/**
 * Нормализация и ранг титулов соревнований (курсинг / БЗМП / бега) из поля qualification.
 * Общий модуль для агрегации профиля и сортировки чипов в UI.
 *
 * Иерархия сверена с:
 * — Положением РКФ о титулах по состязаниям (ред. 14.09.2022, с 15.12.2022)
 * — Правилами бегов/курсинга РКФ (разд. IV)
 * — презентацией runningdog.ru (схема; не заменяет документы)
 *
 * Крутость ≈ редкость / сложность пути: гранды и кумулятивы → титулы дня на статусе →
 * международный сертификат → национальный → породный → региональный.
 */

export type DogTitle = {
  title: string
  count: number
}

export type CompetitionTitleKey =
  | 'grand_champion_russia'
  | 'grand_champion_rkf'
  | 'champion_russia'
  | 'national_champion'
  | 'cup_russia'
  | 'champion_rkf'
  | 'breed_champion'
  | 'breed_champion_rkf'
  | 'cacil'
  | 'cacl'
  | 'caclbr'
  | 'regcacl'
  | 'international'
  | string

/** Короткие бейджи на чипах — как в справке (ЧР РК, CACIL…). */
export const COMPETITION_TITLE_BADGE: Record<string, string> = {
  grand_champion_russia: 'ГЧР РК',
  grand_champion_rkf: 'ГЧРКФ РК',
  champion_russia: 'ЧР РК',
  national_champion: 'НЧ РК',
  cup_russia: 'ПКР РК',
  champion_rkf: 'ЧРКФ РК',
  breed_champion: 'ПЧ РК',
  breed_champion_rkf: 'ПЧРКФ РК',
  international: 'C.I.C.',
  cacil: 'CACIL',
  cacl: 'CACL',
  caclbr: 'CACLBr',
  regcacl: 'RegCACL',
}

/** Полные названия для тултипов (как SHOW_AWARD_LABELS). */
export const COMPETITION_TITLE_LABELS: Record<string, string> = {
  grand_champion_russia: 'Гранд чемпион России по рабочим качествам собак',
  grand_champion_rkf: 'Гранд чемпион РКФ по рабочим качествам собак',
  champion_russia: 'Чемпион России по рабочим качествам собак',
  national_champion: 'Национальный чемпион по рабочим качествам собак',
  cup_russia: 'Победитель Кубка России по рабочим качествам собак',
  champion_rkf: 'Чемпион РКФ по рабочим качествам собак',
  breed_champion: 'Породный чемпион по рабочим качествам собак',
  breed_champion_rkf: 'Чемпион РКФ по рабочим качествам собак в породе',
  international: 'Интернациональный чемпион по бегам / курсингу (C.I.C., FCI)',
  cacil: 'CACIL — международный титульный сертификат (бега и курсинг борзых)',
  cacl: 'CACL — национальный титульный сертификат',
  caclbr: 'CACLBr — породный титульный сертификат (Br = breed)',
  regcacl: 'RegCACL — региональный / локальный сертификат (в протоколах; не в п. 1.4 Положения РКФ)',
}

/**
 * Выше = круче (сортировка убыванием).
 * Числа с запасом между ступенями — чтобы вставлять редкие титулы без перестановки соседей.
 */
export const COMPETITION_TITLE_RANK: Record<string, number> = {
  // Кумулятивы / FCI career (сложнее одного старта)
  grand_champion_russia: 140, // ГЧР РК: два ЧР по разным дисциплинам
  grand_champion_rkf: 135, // ГЧРКФ РК: два ЧРКФ по разным дисциплинам
  international: 130, // C.I.C. / Intern. Champion (FCI, набор CACIL)
  champion_russia: 120, // ЧР РК: 1-е на Чемпионате России (с 15.12.2022 — только так)
  national_champion: 115, // НЧ РК: набор ПКР/ЧРКФ/CACL (один раз на дисциплину)
  cup_russia: 110, // ПКР РК: 1-е на Кубке России
  champion_rkf: 100, // ЧРКФ РК: 1-е на Чемпионате РКФ
  breed_champion: 95, // ПЧ РК: 3× CACLBr у ≥2 судей
  breed_champion_rkf: 90, // ПЧРКФ РК: 1-е на монопородном ЧРКФ
  // Сертификаты (шаг к кумулятивам)
  cacil: 85, // международный
  cacl: 60, // национальный
  caclbr: 50, // породный (Br = breed)
  regcacl: 40, // региональный / локальный; в протоколах есть, в п. 1.4 Положения нет
}

export function competitionTitleKey(raw: string): CompetitionTitleKey {
  const t = raw.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!t) return ''

  // Кумулятивы — раньше «чемпион россии», иначе гранд/национальный съест ЧР
  if (
    /^гчр(\s+рк)?$/.test(t) ||
    (/гранд/.test(t) && /чемпион/.test(t) && /россии/.test(t) && !/ркф/.test(t))
  ) {
    return 'grand_champion_russia'
  }
  if (
    /^гчркф(\s+рк)?$/.test(t) ||
    (/гранд/.test(t) && /чемпион/.test(t) && /ркф/.test(t))
  ) {
    return 'grand_champion_rkf'
  }
  if (/^нч(\s+рк)?$/.test(t) || (/национальн/.test(t) && /чемпион/.test(t))) {
    return 'national_champion'
  }
  if (
    /^пч(\s+рк)?$/.test(t) ||
    (/породн/.test(t) && /чемпион/.test(t) && !/ркф/.test(t))
  ) {
    return 'breed_champion'
  }

  // Титулы дня на статусных мероприятиях
  if (
    /^чр(\s+рк)?$/.test(t) ||
    (/чемпион/.test(t) && /россии/.test(t) && !/ркф/.test(t) && !/гранд/.test(t) && !/национальн/.test(t))
  ) {
    return 'champion_russia'
  }
  if (/^пкр(\s+рк)?$/.test(t) || (/кубок/.test(t) && /россии/.test(t))) {
    return 'cup_russia'
  }
  if (
    /^пчркф(\s+рк)?$/.test(t) ||
    (/чемпион/.test(t) && /ркф/.test(t) && (/пород/.test(t) || / в пород/.test(t)))
  ) {
    return 'breed_champion_rkf'
  }
  if (/^чркф(\s+рк)?$/.test(t) || (/чемпион/.test(t) && /ркф/.test(t) && !/гранд/.test(t))) {
    return 'champion_rkf'
  }

  // FCI career label in protocols
  if (
    (/international/.test(t) && /champion/.test(t)) ||
    /\bc\.?i\.?c\b/.test(t) ||
    /интерчемпион/.test(t)
  ) {
    return 'international'
  }

  // Сертификаты: узкие ключи раньше общего CACL
  if (t.includes('cacil') || t.includes('c.i.c')) return 'cacil'
  if (t.includes('caclbr') || /^cacl\s*br\b/.test(t) || t === 'cacl br') return 'caclbr'
  if (t.includes('regcacl') || (t.includes('reg') && t.includes('cacl'))) return 'regcacl'
  if (/\bcacl\b/.test(t) || t.startsWith('cacl')) return 'cacl'

  return t
}

/** Известный канонический ключ (не «сырая» строка протокола). */
export function isKnownCompetitionTitleKey(key: string): boolean {
  return Object.prototype.hasOwnProperty.call(COMPETITION_TITLE_BADGE, key)
}

/** Короткий бейдж для чипа. */
export function competitionTitleDisplayName(raw: string, key = competitionTitleKey(raw)): string {
  if (COMPETITION_TITLE_BADGE[key]) return COMPETITION_TITLE_BADGE[key]
  return raw.trim()
}

/** Полная подпись для тултипа. */
export function competitionTitleLabel(raw: string, key = competitionTitleKey(raw)): string {
  if (COMPETITION_TITLE_LABELS[key]) return COMPETITION_TITLE_LABELS[key]
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
  return competitionTitleDisplayName(a).localeCompare(competitionTitleDisplayName(b), 'ru')
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
