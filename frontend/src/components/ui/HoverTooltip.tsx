import type { ReactNode } from 'react'

interface HoverTooltipProps {
  label: string
  children: ReactNode
  className?: string
  /** top = above trigger; bottom = below (better for corner badges) */
  placement?: 'top' | 'bottom'
}

/** Instant tooltip on hover (no native title delay). */
export default function HoverTooltip({
  label,
  children,
  className = '',
  placement = 'top',
}: HoverTooltipProps) {
  const positionClass =
    placement === 'bottom'
      ? 'top-full left-1/2 mt-1.5 -translate-x-1/2'
      : 'bottom-full left-1/2 mb-1.5 -translate-x-1/2'

  return (
    <span className={`group/tip relative inline-flex ${className}`}>
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute ${positionClass} z-50 whitespace-nowrap rounded-md bg-charcoal-800 px-2 py-1 text-xs font-normal text-white shadow-md invisible group-hover/tip:visible group-focus-within/tip:visible dark:bg-charcoal-100 dark:text-charcoal-900`}
      >
        {label}
      </span>
    </span>
  )
}
