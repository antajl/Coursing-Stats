/**
 * FCI / РКФ conformation grades (оценки экстерьера).
 * Adult: Excellent > Very Good > Good > Satisfactory (Sufficient).
 * Baby/puppy: Very Promising > Promising (ниже взрослых).
 * Неявка / дисквал / cannot be judged — не оценки.
 */

export const SHOW_GRADE_ORDER = [
  'excellent',
  'very_good',
  'good',
  'satisfactory',
  'very_promising',
  'promising',
] as const

export type ShowGradeKey = (typeof SHOW_GRADE_ORDER)[number]

/** Канонические RU-подписи для UI. */
export const SHOW_GRADE_LABELS_RU: Record<ShowGradeKey, string> = {
  excellent: 'Отлично',
  very_good: 'Очень хорошо',
  good: 'Хорошо',
  satisfactory: 'Удовлетворительно',
  very_promising: 'Очень перспективный',
  promising: 'Перспективный',
}

/** Чем меньше индекс — тем выше оценка. */
const GRADE_RANK: Record<ShowGradeKey, number> = Object.fromEntries(
  SHOW_GRADE_ORDER.map((key, i) => [key, i]),
) as Record<ShowGradeKey, number>

function normalizeGradeText(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Распознать оценку из строки протокола («Отлично (excellent)», «Very good», …).
 * Статусы вроде «Неявка» → null.
 */
export function parseShowGrade(raw: string | null | undefined): ShowGradeKey | null {
  if (!raw?.trim()) return null
  const t = normalizeGradeText(raw)

  // Не оценки
  if (
    /неявка|not present|absent|дисквал|disqual|не может быть оцен|cannot be judged|cannot be evaluated|снят|withdrawn/.test(
      t,
    )
  ) {
    return null
  }

  // Более длинные фразы раньше коротких («очень хорошо» до «хорошо»)
  if (/очень\s+перспектив|very\s+promising/.test(t)) return 'very_promising'
  if (/перспектив|promising/.test(t)) return 'promising'
  if (/отличн|excellent/.test(t)) return 'excellent'
  if (/очень\s+хорош|very\s+good/.test(t)) return 'very_good'
  if (/удовлетворительн|satisfactory|sufficient/.test(t)) return 'satisfactory'
  if (/хорош|\bgood\b/.test(t)) return 'good'

  return null
}

/** Лучшая (высшая) оценка среди сырых строк протокола. */
export function bestShowGrade(
  grades: Array<string | null | undefined>,
): ShowGradeKey | null {
  let best: ShowGradeKey | null = null
  let bestRank = Infinity
  for (const raw of grades) {
    const key = parseShowGrade(raw)
    if (!key) continue
    const rank = GRADE_RANK[key]
    if (rank < bestRank) {
      best = key
      bestRank = rank
    }
  }
  return best
}

/** RU-подпись лучшей оценки или null. */
export function bestShowGradeLabel(
  grades: Array<string | null | undefined>,
): string | null {
  const key = bestShowGrade(grades)
  return key ? SHOW_GRADE_LABELS_RU[key] : null
}
