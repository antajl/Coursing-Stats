import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ColumnSwipeEdgeTabProps {
  direction: 'left' | 'right'
  label: string
  onClick: () => void
  isNudging?: boolean
  title?: string
}

/**
 * Боковой стеклянный язычок переключения колонок в мобильном свайп-виде (< 1024px).
 */
export function ColumnSwipeEdgeTab({
  direction,
  label,
  onClick,
  isNudging = false,
  title,
}: ColumnSwipeEdgeTabProps) {
  const isLeft = direction === 'left'
  const sideClasses = isLeft
    ? 'left-0 rounded-r-full border-y border-r pl-2 pr-3'
    : 'right-0 rounded-l-full border-y border-l pl-3 pr-2'
  const nudgeShift = isNudging ? (isLeft ? 'translate-x-1' : '-translate-x-1') : ''

  return (
    <button
      type="button"
      onClick={onClick}
      className={`lg:hidden absolute top-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-1 bg-[#fbf7f0]/90 text-camel-950 font-bold text-[11px] py-1 border-camel-400/75 shadow-xs backdrop-blur-md transition-all hover:bg-camel-100/95 active:scale-95 cursor-pointer touch-manipulation select-none before:absolute before:-inset-y-1.5 before:inset-x-0 before:content-[''] ${sideClasses} ${nudgeShift}`.trim()}
      title={title ?? `Перейти: ${label}`}
      aria-label={`Перейти: ${label}`}
    >
      {isLeft && <ChevronLeft className="w-3.5 h-3.5 text-camel-800 shrink-0" aria-hidden />}
      <span className="tracking-tight">{label}</span>
      {!isLeft && <ChevronRight className="w-3.5 h-3.5 text-camel-800 shrink-0" aria-hidden />}
    </button>
  )
}
