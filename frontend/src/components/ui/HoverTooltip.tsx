import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

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
  /** Delay before show in ms. Default 0 (instant). */
  delayMs?: number
  /**
   * Render tooltip in a portal with fixed position.
   * Use inside overflow:hidden / Link cards so the panel is not clipped.
   */
  portal?: boolean
}

/** Tooltip on hover (default: instant, no native title delay). */
export default function HoverTooltip({
  label,
  children,
  className = '',
  placement = 'top',
  variant = 'default',
  interactive = false,
  delayMs = 0,
  portal = false,
}: HoverTooltipProps) {
  const triggerRef = useRef<HTMLSpanElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const tipId = useId()
  const useCssOnly = !portal && delayMs <= 0

  const clearTimer = () => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const updateCoords = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    setCoords({
      top: placement === 'bottom' ? rect.bottom + 6 : rect.top - 6,
      left: rect.left + rect.width / 2,
    })
  }

  const show = () => {
    clearTimer()
    const run = () => {
      if (portal) updateCoords()
      setOpen(true)
    }
    if (delayMs <= 0) run()
    else timerRef.current = setTimeout(run, delayMs)
  }

  const hide = () => {
    clearTimer()
    setOpen(false)
  }

  useEffect(() => () => clearTimer(), [])

  useEffect(() => {
    if (!portal || !open) return
    const onScrollOrResize = () => updateCoords()
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
    // updateCoords closes over placement; re-bind when placement/open changes
  }, [portal, open, placement])

  const panelClass =
    variant === 'site'
      ? 'min-w-[15.5rem] max-w-[19rem] whitespace-normal text-left text-[11px] leading-snug rounded-lg border border-old-money-300 bg-cream-50 px-3 py-2.5 font-normal text-charcoal-800 shadow-lg dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-100'
      : 'max-w-[16rem] whitespace-pre-line text-left rounded-md bg-charcoal-800 px-2 py-1 text-xs font-normal text-white shadow-md dark:bg-charcoal-100 dark:text-charcoal-900'

  const pointerClass = interactive ? 'pointer-events-auto' : 'pointer-events-none'

  const positionClass =
    placement === 'bottom'
      ? 'top-full left-1/2 mt-1.5 -translate-x-1/2'
      : 'bottom-full left-1/2 mb-1.5 -translate-x-1/2'

  const portalPanel =
    portal && open && typeof document !== 'undefined'
      ? createPortal(
          <span
            id={tipId}
            role="tooltip"
            className={`${pointerClass} fixed z-[200] ${panelClass} -translate-x-1/2 ${
              placement === 'bottom' ? '' : '-translate-y-full'
            }`}
            style={{ top: coords.top, left: coords.left }}
          >
            {label}
          </span>,
          document.body,
        )
      : null

  return (
    <span
      ref={triggerRef}
      className={`group/tip relative ${className || 'inline-flex'}`}
      onMouseEnter={useCssOnly ? undefined : show}
      onMouseLeave={useCssOnly ? undefined : hide}
      onFocus={useCssOnly ? undefined : show}
      onBlur={useCssOnly ? undefined : hide}
      aria-describedby={!useCssOnly && open ? tipId : undefined}
    >
      {children}
      {portal ? (
        portalPanel
      ) : (
        <span
          id={tipId}
          role="tooltip"
          className={`${pointerClass} absolute ${positionClass} z-50 ${panelClass} transition-none ${
            useCssOnly
              ? 'invisible opacity-0 group-hover/tip:visible group-hover/tip:opacity-100 group-focus-within/tip:visible group-focus-within/tip:opacity-100'
              : open
                ? 'visible opacity-100'
                : 'invisible opacity-0'
          }`}
        >
          {label}
        </span>
      )}
    </span>
  )
}
