import type { ReactNode } from 'react'

interface HoverTooltipProps {
  label: ReactNode
  children: ReactNode
  className?: string
  /** top = above trigger; bottom = below (better for corner badges) */
  placement?: 'top' | 'bottom'
  /** Wider panel for multi-line hints (SALUKI cream/charcoal). */
  variant?: 'default' | 'site'
  /** Allow hover/click inside the panel (e.g. link to /guide). */
  interactive?: boolean
}

/** Instant tooltip on hover (no native title delay). */
export default function HoverTooltip({
  label,
  children,
  className = '',
  placement = 'top',
  variant = 'default',
  interactive = false,
}: HoverTooltipProps) {
  const positionClass =
    placement === 'bottom'
      ? 'top-full left-1/2 mt-1.5 -translate-x-1/2'
      : 'bottom-full left-1/2 mb-1.5 -translate-x-1/2'

  const panelClass =
    variant === 'site'
      ? 'min-w-[15.5rem] max-w-[19rem] whitespace-normal text-left text-[11px] leading-snug rounded-lg border border-old-money-300 bg-cream-50 px-3 py-2.5 font-normal text-charcoal-800 shadow-lg dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-100'
      : 'whitespace-nowrap rounded-md bg-charcoal-800 px-2 py-1 text-xs font-normal text-white shadow-md dark:bg-charcoal-100 dark:text-charcoal-900'

  const pointerClass = interactive ? 'pointer-events-auto' : 'pointer-events-none'

  return (
    <span className={`group/tip relative inline-flex ${className}`}>
      {children}
      <span
        role="tooltip"
        className={`${pointerClass} absolute ${positionClass} z-50 ${panelClass} invisible opacity-0 transition-none group-hover/tip:visible group-hover/tip:opacity-100 group-focus-within/tip:visible group-focus-within/tip:opacity-100`}
      >
        {label}
      </span>
    </span>
  )
}
