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
 * Converts ALL CAPS judge name (e.g. "ГАВРИЛОВА ЯНА АДОЛЬФОВНА" or "ПРОЗОРОВ Д.А.")
 * into clean Title Case ("Гаврилова Яна Адольфовна", "Прозоров Д.А.").
 * Preserves already mixed-case names.
 */
export function formatJudgeDisplayName(name: string): string {
  if (!name) return ''
  // If name has cyrillic or latin letters and is completely uppercase
  if (name === name.toUpperCase() && /[А-ЯA-Z]/.test(name)) {
    return name
      .toLowerCase()
      .split(/\s+/)
      .map((word) => {
        if (!word) return ''
        return word
          .split('-')
          .map((part) => {
            if (part.includes('.')) {
              return part
                .split('.')
                .map((seg) => (seg ? seg.charAt(0).toUpperCase() + seg.slice(1) : ''))
                .join('.')
            }
            return part.charAt(0).toUpperCase() + part.slice(1)
          })
          .join('-')
      })
      .join(' ')
  }
  return name
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

/**
 * Categorizes a sport coursing judge's strictness based on their average criteria score (0-20):
 * - >= 17.2 (>86 б. из 100): Лояльный (emerald)
 * - 16.4 - 17.19 (82 - 85.9 б.): Умеренная строгость (amber)
 * - < 16.4 (<82 б.): Строгий (rose)
 * - < 30 оценок: Мало данных
 */
export function getSportJudgeStrictnessBadge(
  avgScore: number | null | undefined,
  totalEvals?: number | null,
): StrictnessBadgeInfo {
  if (avgScore == null || Number.isNaN(avgScore) || (totalEvals != null && totalEvals < 30)) {
    return {
      label: 'Мало данных',
      detail: totalEvals ? `Всего ${totalEvals} оценок` : 'Недостаточно данных',
      tone: 'unknown',
      badgeClass: 'bg-old-money-50/80 text-charcoal-500 border-old-money-200',
      borderClass: 'border-old-money-200',
      textClass: 'text-charcoal-500',
      dotClass: 'bg-charcoal-400',
    }
  }

  const score100 = avgScore * 5
  if (score100 >= 86) {
    return {
      label: 'Лояльный',
      detail: `Ср. ${score100.toFixed(1)} б. из 100`,
      tone: 'soft',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
      borderClass: 'border-emerald-500',
      textClass: 'text-emerald-700',
      dotClass: 'bg-emerald-500',
    }
  }

  if (score100 >= 82) {
    return {
      label: 'Умеренный',
      detail: `Ср. ${score100.toFixed(1)} б. из 100`,
      tone: 'moderate',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/90',
      borderClass: 'border-amber-500',
      textClass: 'text-amber-700',
      dotClass: 'bg-amber-500',
    }
  }

  return {
    label: 'Строгий',
    detail: `Ср. ${score100.toFixed(1)} б. из 100`,
    tone: 'strict',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200/90',
    borderClass: 'border-rose-500',
    textClass: 'text-rose-700',
    dotClass: 'bg-rose-500',
  }
}

