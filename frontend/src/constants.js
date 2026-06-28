// Константы для фронтенда

export const DISCIPLINE_COLORS = {
  coursing: 'bg-forest-50 hover:bg-forest-100',
  bzmp: 'bg-warm-blue-50 hover:bg-warm-blue-100',
  racing: 'bg-terracotta-50 hover:bg-terracotta-100',
  other: 'bg-yellow-50 hover:bg-yellow-100',
  default: 'hover:bg-old-money-50'
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
