export type CriteriaTuple = [number, number, number, number, number]

export interface DogCoursingCriteriaSummary {
  events_count: number
  heats_count: number
  dog_avg: CriteriaTuple
  breed_avg: CriteriaTuple
  breed_heats_count: number
  is_global_baseline?: boolean
  run1_avg: CriteriaTuple | null
  run2_avg: CriteriaTuple | null
}

export type CriteriaCompareMode = 'breed' | 'rounds'

export interface CriterionMeta {
  key: 'М' | 'Р' | 'В' | 'П' | 'Э'
  label: string
  shortLabel: string
  summary: string
}

export const COURSING_CRITERIA_ITEMS: readonly CriterionMeta[] = [
  {
    key: 'М',
    label: 'Маневренность',
    shortLabel: 'Маневр.',
    summary: 'Способность быстро менять направление вслед за резкими виражами приманки без потери темпа.',
  },
  {
    key: 'Р',
    label: 'Резвость',
    shortLabel: 'Резвость',
    summary: 'Скорость движения на дистанции, ускорение при отрыве приманки и бросок на финише.',
  },
  {
    key: 'В',
    label: 'Выносливость',
    shortLabel: 'Выносл.',
    summary: 'Физическая стойкость и сохранение темпа на всей дистанции и во втором круге.',
  },
  {
    key: 'П',
    label: 'Преследование',
    shortLabel: 'Преслед.',
    summary: 'Концентрация на приманке и выбор точной траектории перехвата без срезания углов.',
  },
  {
    key: 'Э',
    label: 'Энтузиазм',
    shortLabel: 'Энтуз.',
    summary: 'Охотничий азарт, настойчивость при потере приманки из вида и активная атака на финише.',
  },
] as const

export interface CriteriaInsight {
  strongestLabel: string
  strongestScore: number
  strongestDelta: number
  roundNote: string | null
}

export function buildCriteriaInsights(
  criteria: DogCoursingCriteriaSummary,
  breed: string,
): CriteriaInsight {
  const baseline = criteria.breed_avg
  let bestIdx = 0
  let bestScore = -1
  let bestDelta = -99

  for (let i = 0; i < 5; i++) {
    const score = criteria.dog_avg[i]
    const delta = score - baseline[i]
    if (score > bestScore || (score === bestScore && delta > bestDelta)) {
      bestScore = score
      bestDelta = delta
      bestIdx = i
    }
  }

  let roundNote: string | null = null
  if (criteria.run1_avg && criteria.run2_avg) {
    const sum1 = criteria.run1_avg.reduce((a, b) => a + b, 0)
    const sum2 = criteria.run2_avg.reduce((a, b) => a + b, 0)
    const diffTotal = Math.round((sum2 - sum1) * 10) / 10
    const staminaDiff = Math.round((criteria.run2_avg[2] - criteria.run1_avg[2]) * 10) / 10
    const prefix = diffTotal >= 0 ? `+${diffTotal.toFixed(1)}` : diffTotal.toFixed(1)
    if (Math.abs(staminaDiff) >= 0.3) {
      const staminaTxt = staminaDiff > 0 ? `+${staminaDiff.toFixed(1)}` : staminaDiff.toFixed(1)
      roundNote = `Во 2-м круге ${prefix} б. к сумме (выносливость ${staminaTxt})`
    } else {
      roundNote = `Во 2-м круге ${prefix} б. — ровный темп обоих забегов`
    }
  } else if (breed && !criteria.is_global_baseline) {
    roundNote = `База сравнения: ${criteria.breed_heats_count} судейских листов породы`
  }

  return {
    strongestLabel: COURSING_CRITERIA_ITEMS[bestIdx].label,
    strongestScore: bestScore,
    strongestDelta: Math.round(bestDelta * 10) / 10,
    roundNote,
  }
}
