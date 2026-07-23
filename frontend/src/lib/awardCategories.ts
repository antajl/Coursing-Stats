/**
 * Категории наград для UI (выставки + соревнования).
 * Выставочные ключи — из backend/lib/show-award-ranking.ts.
 */

import {
  SHOW_AWARD_CATEGORY,
  type ShowAwardCategory,
  type ShowAwardKey,
} from '../../../backend/lib/show-award-ranking'

export type AwardCategory = ShowAwardCategory | 'cumulative' | 'other'

export const AWARD_CATEGORY_ORDER: AwardCategory[] = [
  'prestige',
  'certificate',
  'diploma',
  'cumulative',
  'other',
]

export const AWARD_CATEGORY_LABEL: Record<AwardCategory, string> = {
  prestige: 'Крутые',
  certificate: 'Сертификаты',
  diploma: 'Титулы дня',
  cumulative: 'Собирательные',
  other: 'Прочее',
}

/**
 * Стили чипа по категории (единый язык выставки / соревнования / справка).
 * Только оттенки из tailwind.config (camel 100–700, без 800/900/950) —
 * иначе dark:bg-* не генерируется и light-фон + light-текст дают нечитаемые чипы
 * на footer `dark:bg-charcoal-700` (ShowDogCard / DogCard).
 */
export const AWARD_CATEGORY_BADGE_CLASS: Record<AwardCategory, string> = {
  prestige:
    'border border-camel-400 dark:border-camel-500 bg-camel-100 dark:bg-camel-700/40 text-camel-700 dark:text-camel-200',
  certificate:
    'border border-old-money-400 dark:border-charcoal-500 bg-old-money-100 dark:bg-charcoal-600 text-old-money-900 dark:text-charcoal-100',
  diploma:
    'border border-camel-300/80 dark:border-camel-600 bg-cream-50 dark:bg-charcoal-600/90 text-camel-700 dark:text-camel-300',
  cumulative:
    'border-2 border-camel-500 dark:border-camel-400 bg-cream-50 dark:bg-charcoal-800 text-camel-700 dark:text-camel-200',
  other:
    'border border-old-money-200 dark:border-charcoal-600 bg-cream-50 dark:bg-charcoal-800 text-charcoal-500 dark:text-charcoal-300',
}

/** Акцент для верхнего тира prestige (BIS). */
const PRESTIGE_TOP_CLASS =
  'border-2 border-camel-400 dark:border-camel-500 bg-camel-100 dark:bg-camel-700/40 text-camel-700 dark:text-camel-200'

export function showAwardCategory(key: ShowAwardKey): ShowAwardCategory {
  return SHOW_AWARD_CATEGORY[key]
}

export function categoryBadgeClass(category: AwardCategory, opts?: { topPrestige?: boolean }): string {
  if (opts?.topPrestige && category === 'prestige') return PRESTIGE_TOP_CLASS
  return AWARD_CATEGORY_BADGE_CLASS[category]
}

function normalizeCompetitionToken(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/[«»„“”]/g, '"')
    .replace(/ё/gi, 'е')
    .trim()
}

/**
 * Классификация титула соревнований (курсинг / бега) из протокола или профиля.
 * Не путать «ЧРКФ» выставок с «ЧРКФ РК» рабочих качеств.
 */
export function classifyCompetitionTitle(raw: string): AwardCategory {
  const t = normalizeCompetitionToken(raw)
  if (!t) return 'other'
  const u = t.toUpperCase()
  const compact = u.replace(/\s+/g, ' ')

  // Собирательные (кумулятивные)
  if (
    /^(НЧ|ПЧ|ГЧР|ГЧРКФ)(\s+РК)?$/.test(compact) ||
    compact.includes('НАЦИОНАЛЬНЫЙ ЧЕМПИОН') ||
    compact.includes('ПОРОДНЫЙ ЧЕМПИОН') ||
    compact.includes('ГРАНД ЧЕМПИОН') ||
    compact.includes('ГРАНД-ЧЕМПИОН')
  ) {
    return 'cumulative'
  }

  // Крутые титулы старта (ранг мероприятия / рабочие качества)
  if (
    /^(ЧР|ПКР|ЧРКФ|ПЧРКФ)(\s+РК)?$/.test(compact) ||
    compact.startsWith('ЧЕМПИОН РОССИИ') ||
    compact.startsWith('ПОБЕДИТЕЛЬ КУБКА РОССИИ') ||
    compact.startsWith('ЧЕМПИОН РКФ') ||
    compact.includes('ПЧРКФ') ||
    compact.includes('ПО РАБОЧИМ КАЧЕСТВАМ')
  ) {
    return 'prestige'
  }

  // Сертификаты
  if (/^CACIL/.test(compact) || /^CACL/.test(compact) || compact.includes('CACIL') || compact.includes('CACL')) {
    return 'certificate'
  }

  if (compact.includes('ДИПЛОМ') || compact.includes('ПОБЕДИТЕЛЬ')) {
    return 'diploma'
  }

  return 'other'
}

/** Кумулятивные / собирательные титулы выставок (оформление в РКФ, не счётчик дня). */
export function classifyShowCumulativeTitle(raw: string): AwardCategory | null {
  const t = normalizeCompetitionToken(raw)
  if (!t) return null
  const u = t.toUpperCase()
  if (
    u.includes('C.I.B') ||
    u.includes('CIB') ||
    u.includes('ИНТЕРНАЦИОНАЛЬН') ||
    // Beauty «Чемпион России» — не путать с рабочим «…по рабочим качествам»
    (u.includes('ЧЕМПИОН РОССИИ') && !u.includes('РАБОЧ')) ||
    u.includes('ЮНЫЙ ЧЕМПИОН') ||
    u.includes('ЮНЫЙ ЧЕМПИОН РОССИИ') ||
    (u.includes('ЧЕМПИОН РКФ') && !u.includes(' РК') && !u.includes('РАБОЧ')) ||
    (u.includes('ВЕТЕРАН') && u.includes('ЧЕМПИОН'))
  ) {
    return 'cumulative'
  }
  return null
}

export function classifyTitleString(raw: string, domain: 'show' | 'competition' = 'competition'): AwardCategory {
  if (domain === 'show') {
    const cum = classifyShowCumulativeTitle(raw)
    if (cum) return cum
    // Попытка как show badge token — вызывающий код обычно знает ShowAwardKey
    return 'other'
  }
  return classifyCompetitionTitle(raw)
}

export function groupItemsByCategory<T>(
  items: readonly T[],
  getCategory: (item: T) => AwardCategory,
): Array<{ category: AwardCategory; items: T[] }> {
  const buckets = new Map<AwardCategory, T[]>()
  for (const cat of AWARD_CATEGORY_ORDER) buckets.set(cat, [])
  for (const item of items) {
    const cat = getCategory(item)
    buckets.get(cat)!.push(item)
  }
  return AWARD_CATEGORY_ORDER.filter((c) => (buckets.get(c)?.length ?? 0) > 0).map((category) => ({
    category,
    items: buckets.get(category)!,
  }))
}
