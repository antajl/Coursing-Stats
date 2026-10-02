/**
 * Helpers for Judge UI: monograms, strictness badges, and labels.
 */

export interface StrictnessBadgeInfo {
  label: string
  detail: string
  tone: 'soft' | 'moderate' | 'strict' | 'unknown'
  badgeClass: string
  borderClass: string
  textClass: string
  dotClass: string
}

/**
 * Returns 1 or 2 uppercase letters for the judge's monogram avatar.
 * Examples:
 *   "Фабиан Альмендралес" -> "ФА"
 *   "Сиднева Алла Владимировна" -> "СА"
 *   "David Miller" -> "DM"
 */
export function getJudgeInitials(name: string): string {
  if (!name) return '?'
  // Clean special characters like | or punctuation
  const clean = name.replace(/[|*]+/g, ' ').trim()
  const parts = clean.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

/**
 * Categorizes a judge's strictness based on their excellent rate:
 * - >= 80%: Лояльный (зеленый)
 * - 70% - 79.9%: Умеренная строгость (янтарный)
 * - < 70%: Строгий (розовый/красный)
 * - < 30 оценок: Мало данных
 */
export function getStrictnessBadge(
  excellentRate: number | null | undefined,
  graded?: number | null,
): StrictnessBadgeInfo {
  if (
    excellentRate == null ||
    Number.isNaN(excellentRate) ||
    (graded != null && graded < 30)
  ) {
    return {
      label: 'Мало данных',
      detail: graded ? `Всего ${graded} оценок` : 'Недостаточно оценок',
      tone: 'unknown',
      badgeClass: 'bg-old-money-50/80 text-charcoal-500 border-old-money-200',
      borderClass: 'border-old-money-200',
      textClass: 'text-charcoal-500',
      dotClass: 'bg-charcoal-400',
    }
  }

  const pct = Math.round(excellentRate * 100)

  if (pct >= 80) {
    return {
      label: 'Лояльный',
      detail: `${pct}% «отлично»`,
      tone: 'soft',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      borderClass: 'border-emerald-300',
      textClass: 'text-emerald-700',
      dotClass: 'bg-emerald-500',
    }
  }

  if (pct >= 70) {
    return {
      label: 'Умеренный',
      detail: `${pct}% «отлично»`,
      tone: 'moderate',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
      borderClass: 'border-amber-300',
      textClass: 'text-amber-700',
      dotClass: 'bg-amber-500',
    }
  }

  return {
    label: 'Строгий',
    detail: `${pct}% «отлично»`,
    tone: 'strict',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200/80',
    borderClass: 'border-rose-300',
    textClass: 'text-rose-700',
    dotClass: 'bg-rose-500',
  }
}
