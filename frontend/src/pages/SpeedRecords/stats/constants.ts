export const MIN_SAMPLES_FOR_AVG = 3

export const GROUP_BY_OPTIONS = [
  { value: 'breed', label: 'Порода' },
  { value: 'sex', label: 'Пол' },
  { value: 'year', label: 'Год' },
] as const

export type GroupBy = (typeof GROUP_BY_OPTIONS)[number]['value']
