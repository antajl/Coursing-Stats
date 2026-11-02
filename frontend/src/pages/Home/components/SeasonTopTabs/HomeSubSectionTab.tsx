import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface HomeSubSectionTabProps {
  targetLabel: string
  direction?: 'left' | 'right'
  isNudging?: boolean
  onToggle: () => void
}

export function HomeSubSectionTab({
  targetLabel,
  direction = 'right',
  isNudging = false,
  onToggle,
}: HomeSubSectionTabProps) {
  const isLeft = direction === 'left'
  const alignClass = isLeft
    ? 'left-0 rounded-r-full border-y border-r border-camel-400/60 pr-3 pl-2.5'
    : 'right-0 rounded-l-full border-y border-l border-camel-400/60 pl-3 pr-2.5'

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`md:hidden absolute top-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-1 bg-[#fbf7f0]/75 text-camel-950 font-bold text-[11px] py-1 shadow-xs backdrop-blur-md transition-all hover:bg-camel-100/90 active:scale-95 cursor-pointer touch-manipulation select-none ${alignClass} ${
        isNudging
          ? isLeft
            ? 'animate-tab-nudge-right'
            : 'animate-tab-nudge-left'
          : ''
      }`}
      title={`Перейти: ${targetLabel}`}
      aria-label={`Перейти: ${targetLabel}`}
    >
      {isLeft && (
        <ChevronLeft className="w-3.5 h-3.5 text-camel-800 shrink-0" />
      )}
      <span className="tracking-tight">{targetLabel}</span>
      {!isLeft && (
        <ChevronRight className="w-3.5 h-3.5 text-camel-800 shrink-0" />
      )}
    </button>
  )
}

/** Compatibility alias */
export const HomeSubSectionCapsule = HomeSubSectionTab
