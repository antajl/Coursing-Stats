import type { ReactNode } from 'react'
import { CriteriaBenchmarkTick } from './CriteriaBenchmarkTick'

interface CriteriaMetricRowProps {
  badgeKey: string
  label: string
  title?: string
  fillPct: number
  tickPct: number
  tickTooltip: ReactNode
  valueText: string
  unitText: string
  deltaText: string
  deltaToneClass: string
}

/**
 * Единая строка критерия или скорости:
 * — на мобильных: заголовок + значения сверху, полоса во всю ширину ниже;
 * — с sm+: всё в одну горизонтальную линию с фиксированными колонками подписи и чисел,
 *   чтобы полосы начинались и заканчивались на одной оси и числа не смещались.
 */
export function CriteriaMetricRow({
  badgeKey,
  label,
  title,
  fillPct,
  tickPct,
  tickTooltip,
  valueText,
  unitText,
  deltaText,
  deltaToneClass,
}: CriteriaMetricRowProps) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-1 sm:grid-cols-[11.25rem_minmax(0,1fr)_auto] sm:gap-x-3">
      <div className="flex min-w-0 items-center gap-2 text-xs sm:text-sm" title={title}>
        <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-md border border-forest-200/80 bg-forest-50 font-mono text-[11px] font-bold text-forest-800">
          {badgeKey}
        </span>
        <span className="truncate font-medium text-charcoal-800">{label}</span>
      </div>

      <div className="relative col-span-2 order-3 h-2 w-full rounded-full bg-sand-100 sm:col-span-1 sm:order-2">
        <div
          className="h-full rounded-full bg-forest-600/80 transition-[width] duration-300"
          style={{ width: `${fillPct.toFixed(1)}%` }}
        />
        <CriteriaBenchmarkTick percent={tickPct} label={tickTooltip} />
      </div>

      <div className="order-2 grid grid-cols-[2.75rem_2.35rem_2.75rem] items-baseline gap-x-1.5 font-mono tabular-nums sm:order-3">
        <span className="text-right text-sm font-bold text-charcoal-900">{valueText}</span>
        <span className="text-left text-[11px] font-normal text-charcoal-500 whitespace-nowrap">
          {unitText}
        </span>
        <span className={`text-right text-xs font-semibold ${deltaToneClass}`}>
          {deltaText}
        </span>
      </div>
    </div>
  )
}
