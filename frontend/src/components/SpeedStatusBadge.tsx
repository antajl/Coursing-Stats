import { formatRecordDate } from '../lib/recordDates'

export interface SpeedStatusBadgeProps {
  variant: 'new' | 'upd'
  date?: string | number | null
  currentValue?: number | string | null
  prevValue?: number | string | null
  unit?: string
  title?: string
}

const badgeBase =
  'absolute -right-1 -top-1.5 inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider shadow-2xs border leading-none select-none transition-transform group-hover:scale-105'

export default function SpeedStatusBadge({
  variant,
  date,
  currentValue,
  prevValue,
  unit,
  title: customTitle,
}: SpeedStatusBadgeProps) {
  const formattedDate = date ? formatRecordDate(date) : null

  if (variant === 'new') {
    const title =
      customTitle ||
      (formattedDate
        ? `Дебютный замер на полигоне (${formattedDate})`
        : 'Дебютный результат на полигоне Донино')

    return (
      <span
        title={title}
        aria-label={title}
        className={`${badgeBase} border-forest-700 bg-forest-600 text-white`}
      >
        new
      </span>
    )
  }

  let title = customTitle
  if (!title) {
    if (prevValue != null && currentValue != null && unit) {
      title = `Личный рекорд обновлен: с ${prevValue} до ${currentValue} ${unit}${formattedDate ? ` (${formattedDate})` : ''}`
    } else if (formattedDate) {
      title = `Личный рекорд обновлен (${formattedDate})`
    } else {
      title = 'Обновленный личный рекорд'
    }
  }

  return (
    <span
      title={title}
      aria-label={title}
      className={`${badgeBase} border-warm-blue-700 bg-warm-blue-600 text-white`}
    >
      upd ↑
    </span>
  )
}
