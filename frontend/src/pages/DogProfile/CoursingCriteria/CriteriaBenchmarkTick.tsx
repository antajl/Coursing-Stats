import type { ReactNode } from 'react'
import HoverTooltip from '../../../components/ui/HoverTooltip'

interface CriteriaBenchmarkTickProps {
  percent: number
  label: ReactNode
}

/**
 * Мгновенная подсказка на отметке среднего по породе / 1-го круга на шкалах критериев и скорости.
 * Расширенная невидимая область вокруг 3px-метки упрощает наведение мышью.
 */
export function CriteriaBenchmarkTick({ percent, label }: CriteriaBenchmarkTickProps) {
  const clamped = Math.max(0, Math.min(100, percent))

  return (
    <div
      className="absolute -top-1 -bottom-1 -translate-x-1/2 flex items-center"
      style={{ left: `${clamped.toFixed(1)}%` }}
    >
      <HoverTooltip label={label} placement="top" variant="site" delayMs={0} portal>
        <span
          tabIndex={0}
          aria-label={typeof label === 'string' ? label : 'Сравнительный уровень'}
          className="flex h-4 items-center justify-center px-1.5 cursor-help focus:outline-none"
        >
          <span className="h-3 w-[3px] rounded-full bg-camel-800 ring-1 ring-white/90" />
        </span>
      </HoverTooltip>
    </div>
  )
}
