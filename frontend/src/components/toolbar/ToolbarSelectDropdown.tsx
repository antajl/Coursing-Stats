import { useId, useRef, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { TOOLBAR_CHIP, TOOLBAR_CHIP_ACTIVE, TOOLBAR_CHIP_IDLE } from '../../lib/toolbar'
import { useClickOutside } from '../../hooks/useClickOutside'

interface ToolbarSelectDropdownProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  className?: string
}

export default function ToolbarSelectDropdown({
  value,
  onChange,
  options,
  placeholder = 'Выбрать...',
  className = '',
}: ToolbarSelectDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const panelId = useId()

  const displayValue = value || placeholder

  useClickOutside(ref, { onClickOutside: () => setOpen(false) })

  const handleSelect = (option: string) => {
    onChange(option === value ? '' : option)
    setOpen(false)
  }

  return (
    <div className={`relative shrink-0 ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={displayValue}
        className={`${TOOLBAR_CHIP} gap-1.5 ${open ? TOOLBAR_CHIP_ACTIVE : value ? TOOLBAR_CHIP_ACTIVE : TOOLBAR_CHIP_IDLE} h-7 px-2`}
      >
        <span className="truncate max-w-[120px]">{displayValue}</span>
        <ChevronDown className={`h-3 w-3 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={2} />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Закрыть"
            className="fixed inset-0 z-40 bg-charcoal-900/40 md:hidden"
            onClick={() => setOpen(false)}
          />
          <div
            id={panelId}
            role="listbox"
            aria-label={placeholder}
            className={[
              'cs-filter-panel-enter fixed inset-x-0 bottom-0 z-50 flex flex-col overflow-hidden rounded-t-2xl border border-old-money-200 bg-cream-50 shadow-2xl',
              'dark:border-charcoal-600 dark:bg-charcoal-800',
              'max-h-[min(50vh,400px)]',
              // Desktop popover
              'md:absolute md:inset-auto md:left-0 md:top-full md:mt-1.5 md:w-[min(200px,calc(100vw-2rem))] md:rounded-xl md:shadow-xl',
            ].join(' ')}
          >
            <div className="flex shrink-0 justify-center pt-2.5 md:hidden" aria-hidden>
              <span className="h-1 w-10 rounded-full bg-old-money-300 dark:bg-charcoal-500" />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-2 pb-2 pt-1 md:px-1 md:pb-1 md:pt-1">
              <div className="space-y-0.5">
                {options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="option"
                    aria-selected={value === option}
                    onClick={() => handleSelect(option)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                      value === option
                        ? 'bg-camel-500 text-charcoal-900'
                        : 'text-charcoal-700 hover:bg-old-money-100 dark:text-charcoal-200 dark:hover:bg-charcoal-700'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
