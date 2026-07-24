import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { TOOLBAR_CHIP, TOOLBAR_CHIP_ACTIVE, TOOLBAR_CHIP_IDLE } from '../../lib/toolbar'

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
}

export default function ToolbarFiltersDropdown({
  children,
  onReset,
  active = false,
  activeCount = 0,
  label = 'Фильтры',
  fillContent = false,
  panelClassName = '',
}: ToolbarFiltersDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const showBadge = activeCount > 0

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    const mq = window.matchMedia('(max-width: 767px)')
    if (mq.matches) document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
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
            className="fixed inset-0 z-40 bg-charcoal-900/35 md:hidden"
            onClick={() => setOpen(false)}
          />
          <div
            id={panelId}
            role="dialog"
            aria-label={label}
            className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[min(88vh,640px)] flex-col rounded-t-2xl border border-old-money-200 bg-cream-50 shadow-2xl dark:border-charcoal-600 dark:bg-charcoal-800 md:absolute md:inset-auto md:right-0 md:top-full md:mt-1.5 md:max-h-[min(440px,72vh)] md:w-[min(320px,calc(100vw-2rem))] md:rounded-xl md:shadow-xl ${panelClassName}`}
          >
            <div className="flex shrink-0 justify-center pt-2 md:hidden" aria-hidden>
              <span className="h-1 w-10 rounded-full bg-old-money-300 dark:bg-charcoal-500" />
            </div>
            <div
              className={
                fillContent
                  ? 'flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-1 pt-3 md:pt-4'
                  : 'min-h-0 flex-1 overflow-y-auto px-4 pb-1 pt-3 md:pt-4'
              }
            >
              {children}
            </div>
            <div className="shrink-0 border-t border-old-money-200/80 bg-cream-50/95 px-4 py-3 backdrop-blur-sm dark:border-charcoal-600/80 dark:bg-charcoal-800/95">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onReset()
                    setOpen(false)
                  }}
                  className="flex-1 rounded-lg border border-old-money-200 bg-white px-3 py-2.5 text-xs font-medium text-charcoal-700 transition-colors hover:bg-old-money-100 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-charcoal-200 dark:hover:bg-charcoal-600"
                >
                  Сбросить
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
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
