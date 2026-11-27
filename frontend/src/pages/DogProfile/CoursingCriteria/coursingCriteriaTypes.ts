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
}

export function buildCriteriaInsights(
  criteria: DogCoursingCriteriaSummary,
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

  return {
    strongestLabel: COURSING_CRITERIA_ITEMS[bestIdx].label,
    strongestScore: bestScore,
    strongestDelta: Math.round(bestDelta * 10) / 10,
  }
}
