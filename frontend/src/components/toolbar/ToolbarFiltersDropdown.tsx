import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { TOOLBAR_CHIP, TOOLBAR_CHIP_ACTIVE, TOOLBAR_CHIP_IDLE } from '../../lib/toolbar'

interface ToolbarFiltersDropdownProps {
  children: ReactNode
  onReset: () => void
  active?: boolean
  label?: string
}

export default function ToolbarFiltersDropdown({
  children,
  onReset,
  active = false,
  label = 'Фильтры',
}: ToolbarFiltersDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="toolbar-filters-panel"
        aria-label={label}
        className={`${TOOLBAR_CHIP} gap-1.5 ${open || active ? TOOLBAR_CHIP_ACTIVE : TOOLBAR_CHIP_IDLE}`}
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={2} />
      </button>

      {open && (
        <div
          id="toolbar-filters-panel"
          className="absolute right-0 z-50 mt-1.5 w-[min(320px,calc(100vw-2rem))] rounded-xl border border-old-money-200 bg-white p-4 shadow-xl dark:border-charcoal-600 dark:bg-charcoal-800"
        >
          <div className="space-y-3">{children}</div>
          <div className="mt-4 flex gap-2 border-t border-old-money-200/80 pt-3 dark:border-charcoal-600/80">
            <button
              type="button"
              onClick={() => {
                onReset()
                setOpen(false)
              }}
              className="flex-1 rounded-lg border border-old-money-200 bg-cream-50 px-3 py-2 text-xs font-medium text-charcoal-700 transition-colors hover:bg-old-money-100 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-charcoal-200 dark:hover:bg-charcoal-600"
            >
              Сбросить
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg bg-camel-600 px-3 py-2 text-xs font-semibold text-charcoal-900 transition-colors hover:bg-camel-500 dark:bg-camel-600 dark:hover:bg-camel-500"
            >
              Готово
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
