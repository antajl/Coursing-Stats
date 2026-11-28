import type { ReactNode } from 'react'

interface DisciplineHistoryRowProps {
  title: ReactNode
  subtitle?: string | null
  titleClassName: string
  metric?: ReactNode
  badgeSlot?: ReactNode
  date: string
  metaSuffix?: ReactNode
  chips?: ReactNode
}

/**
 * Компактная двухстрочная строка истории для колонок курсинга, бегов и выставок.
 * Первая строка — заголовок, локация, ключевая метрика и бейдж места/оценки.
 * Вторая строка — дата, дистанция и наградные чипсы в одну линию.
 */
export function DisciplineHistoryRow({
  title,
  subtitle,
  titleClassName,
  metric,
  badgeSlot,
  date,
  metaSuffix,
  chips,
}: DisciplineHistoryRowProps) {
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-baseline gap-1.5">
          <span className={`truncate ${titleClassName}`}>{title}</span>
          {subtitle ? (
            <span className="truncate text-[11px] font-medium text-charcoal-500">
              · {subtitle}
            </span>
          ) : null}
        </div>

        {(metric || badgeSlot) && (
          <div className="flex shrink-0 items-center gap-1.5">
            {metric}
            {badgeSlot ? (
              <div className="flex h-[22px] w-6 items-center justify-end">
                {badgeSlot}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
        <span className="shrink-0 text-[11px] font-medium tabular-nums text-charcoal-600">
          {date}
        </span>
        {metaSuffix ? (
          <span className="shrink-0 text-[11px] text-charcoal-500 tabular-nums">
            · {metaSuffix}
          </span>
        ) : null}
        {chips}
      </div>
    </div>
  )
}
