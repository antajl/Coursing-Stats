import { formatRecordDate } from '../lib/recordDates'

export interface SpeedStatusBadgeProps {
  variant: 'new' | 'upd'
  date?: string | number | null
  currentValue?: number | string | null
  prevValue?: number | string | null
  unit?: string
  title?: string
  className?: string
}

const badgeBase =
  'inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider border leading-none select-none shrink-0 shadow-2xs'

export default function SpeedStatusBadge({
  variant,
  date,
  currentValue,
  prevValue,
  unit,
  title: customTitle,
  className = '',
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
        className={`${badgeBase} border-amber-300/80 bg-amber-100 text-amber-900 ${className}`.trim()}
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
      className={`${badgeBase} border-emerald-300/80 bg-emerald-100 text-emerald-800 ${className}`.trim()}
    >
      upd ↑
    </span>
  )
}
