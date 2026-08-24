import { useEffect, useId, useRef, useState, useCallback, useMemo, memo, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { TOOLBAR_CHIP, TOOLBAR_CHIP_ACTIVE, TOOLBAR_CHIP_IDLE } from '../../lib/toolbar'
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation'
import { useFocusTrap } from '../../hooks/useFocusManagement'
import { useClickOutside } from '../../hooks/useClickOutside'

interface ToolbarFiltersDropdownProps {
  children: ReactNode
  onReset: () => void
  active?: boolean
  /** Число активных условий внутри панели — бейдж на кнопке. */
  activeCount?: number
  label?: string
  /**
   * Контент сам управляет скроллом (flex-колонка на всю высоту).
   * Иначе скроллится всё тело панели.
   */
  fillContent?: boolean
  /** Доп. классы панели (ширина/высота). */
  panelClassName?: string
  /** Fired when the panel opens/closes (e.g. to prefetch heavier data). */
  onOpenChange?: (open: boolean) => void
}

function ToolbarFiltersDropdownInner({
  children,
  onReset,
  active = false,
  activeCount = 0,
  label = 'Фильтры',
  fillContent = false,
  panelClassName = '',
  onOpenChange,
}: ToolbarFiltersDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const showBadge = useMemo(() => activeCount > 0, [activeCount])

  useFocusTrap(open, panelRef)

  const setOpenState = useCallback((next: boolean) => {
    setOpen(next)
    onOpenChange?.(next)
  }, [onOpenChange])

  const { handleKeyDown } = useKeyboardNavigation({
    onEscape: () => setOpenState(false),
  })

  useClickOutside(ref, { onClickOutside: () => setOpenState(false) })

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    const prevPadding = document.body.style.paddingRight
    const mq = window.matchMedia('(max-width: 767px)')
    if (mq.matches) {
      document.body.style.overflow = 'hidden'
      // iOS: avoid rubber-band scroll of page behind sheet
      document.body.style.touchAction = 'none'
    }
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPadding
      document.body.style.touchAction = ''
    }
  }, [open])

  const mobileHeight = useMemo(
    () => fillContent
      ? 'h-[min(88dvh,640px)] max-h-[min(88dvh,640px)]'
      : 'max-h-[min(88dvh,640px)]',
    [fillContent]
  )

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpenState(!open)}
        onKeyDown={handleKeyDown}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={showBadge ? `${label}, активных: ${activeCount}` : label}
        className={`${TOOLBAR_CHIP} gap-1.5 ${open || active ? TOOLBAR_CHIP_ACTIVE : TOOLBAR_CHIP_IDLE}`}
      >
        {label}
        {showBadge ? (
          <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-charcoal-900/15 px-1 text-[10px] font-bold tabular-nums text-charcoal-900 dark:bg-charcoal-900/25">
            {activeCount > 9 ? '9+' : activeCount}
          </span>
        ) : null}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={2} />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Закрыть фильтры"
            className="fixed inset-0 z-40 bg-charcoal-900/40 md:hidden"
            onClick={() => setOpenState(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault()
                setOpenState(false)
              }
            }}
          />
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className={[
              'cs-filter-panel-enter fixed inset-x-0 bottom-0 z-50 flex flex-col overflow-hidden rounded-t-2xl border border-old-money-200 bg-cream-50 shadow-2xl',
              'dark:border-charcoal-600 dark:bg-charcoal-800',
              mobileHeight,
              // Desktop popover — по центру под кнопкой; высота всегда ограничена
              'md:absolute md:inset-auto md:left-1/2 md:top-full md:mt-1.5 md:w-[min(320px,calc(100vw-2rem))] md:-translate-x-1/2 md:rounded-xl md:shadow-xl',
              fillContent
                ? 'md:h-[min(440px,70vh)] md:max-h-[min(440px,70vh)]'
                : 'md:max-h-[min(440px,70vh)]',
              panelClassName,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className="flex shrink-0 justify-center pt-2.5 md:hidden" aria-hidden>
              <span className="h-1 w-10 rounded-full bg-old-money-300 dark:bg-charcoal-500" />
            </div>
            <div
              className={
                fillContent
                  ? 'flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-1 pt-2 md:pt-4'
                  : 'min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-1 pt-2 md:pt-4'
              }
            >
              {children}
            </div>
            <div className="shrink-0 border-t border-old-money-200/80 bg-cream-50/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm dark:border-charcoal-600/80 dark:bg-charcoal-800/95">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onReset()
                    setOpenState(false)
                  }}
                  className="flex-1 rounded-lg border border-old-money-200 bg-white px-3 py-2.5 text-xs font-medium text-charcoal-700 transition-colors hover:bg-old-money-100 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-charcoal-200 dark:hover:bg-charcoal-600"
                >
                  Сбросить
                </button>
                <button
                  type="button"
                  onClick={() => setOpenState(false)}
                  className="flex-1 rounded-lg bg-camel-600 px-3 py-2.5 text-xs font-semibold text-charcoal-900 transition-colors hover:bg-camel-500 dark:bg-camel-600 dark:hover:bg-camel-500"
                >
                  Готово
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default memo(ToolbarFiltersDropdownInner)
