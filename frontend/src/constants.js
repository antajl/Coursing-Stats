// Константы для фронтенда

export const DISCIPLINE_COLORS = {
  coursing: 'bg-green-50 hover:bg-green-100',
  bzmp: 'bg-blue-50 hover:bg-blue-100',
  racing: 'bg-red-50 hover:bg-red-100',
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
