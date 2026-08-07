// Константы для фронтенда

export const DISCIPLINE_COLORS = {
  coursing: 'bg-forest-400 hover:bg-forest-500 dark:bg-forest-900 dark:hover:bg-forest-800',
  bzmp: 'bg-warm-blue-400 hover:bg-warm-blue-500 dark:bg-warm-blue-900 dark:hover:bg-warm-blue-800',
  racing: 'bg-terracotta-400 hover:bg-terracotta-500 dark:bg-terracotta-900 dark:hover:bg-terracotta-800',
  other: 'bg-camel-400 hover:bg-camel-500 dark:bg-camel-900 dark:hover:bg-camel-800',
  default: 'hover:bg-old-money-50 dark:hover:bg-charcoal-700'
}

export function getDisciplineColor(eventType: string): string {
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
