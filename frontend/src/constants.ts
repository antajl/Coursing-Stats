// Константы для фронтенда

export const DISCIPLINE_COLORS = {
  coursing: 'bg-forest-100 hover:bg-forest-200 dark:bg-forest-900/25 dark:hover:bg-forest-900/35',
  bzmp: 'bg-warm-blue-100 hover:bg-warm-blue-200 dark:bg-warm-blue-900/25 dark:hover:bg-warm-blue-900/35',
  racing: 'bg-terracotta-100 hover:bg-terracotta-200 dark:bg-terracotta-900/25 dark:hover:bg-terracotta-900/35',
  other: 'bg-yellow-100 hover:bg-yellow-200 dark:bg-camel-900/25 dark:hover:bg-camel-900/35',
  default: 'hover:bg-old-money-50 dark:hover:bg-charcoal-700'
}

export function getDisciplineColor(eventType) {
  return DISCIPLINE_COLORS[eventType] || DISCIPLINE_COLORS.default
}

export const STATUSES = {
  FINISHED: 'finished',
  DISQUALIFIED: 'disqualified',
  DNS: 'dns'
}

export const STATUS_LABELS = {
  [STATUSES.FINISHED]: 'Финишировал',
  [STATUSES.DISQUALIFIED]: 'Дисквалифицирован',
  [STATUSES.DNS]: 'Неявка'
}
