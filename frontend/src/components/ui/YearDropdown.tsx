import { useState, useRef, type KeyboardEvent } from 'react'
import ModernDropdown from './ModernDropdown'

interface YearDropdownProps {
  years: (string | number)[]
  selectedYear: string
  currentSeason: string
  onSelect: (year: string) => void
  trigger: React.ReactNode
  className?: string
}

export default function YearDropdown({
  years,
  selectedYear,
  currentSeason,
  onSelect,
  trigger,
  className = '',
}: YearDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const sortedYears = [...years].map(String).sort((a, b) => Number(b) - Number(a))

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const items = listRef.current?.querySelectorAll('[role="menuitem"]')
      if (!items || items.length === 0) return

      const currentIndex = Array.from(items).findIndex(
        (item) => item === document.activeElement
      )
      
      let nextIndex
      if (e.key === 'ArrowDown') {
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
      } else {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
      }

      ;(items[nextIndex] as HTMLElement)?.focus()
    }
  }

  const handleSelect = (year: string) => {
    onSelect(year)
    setIsOpen(false)
  }

  const handleClear = () => {
    onSelect(currentSeason)
    setIsOpen(false)
  }

  const displayYear = (year: string) => {
    return year
  }

  return (
    <ModernDropdown
      trigger={trigger}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      className={className}
      width="180px"
    >
      <div className="p-1 min-w-[120px]" onKeyDown={handleKeyDown}>
        <div
          ref={listRef}
          className="max-h-60 overflow-y-auto"
          role="menu"
        >
          {sortedYears.map((year) => {
            const isSelected = year === selectedYear
            
            return (
              <button
                key={year}
                role="menuitem"
                onClick={() => handleSelect(year)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  isSelected
                    ? 'bg-camel-500 text-charcoal-900 dark:bg-camel-600 dark:text-cream-50'
                    : 'text-charcoal-700 hover:bg-camel-100 dark:text-charcoal-200 dark:hover:bg-camel-900/30'
                }`}
              >
                {displayYear(year)}
              </button>
            )
          })}
        </div>

        {selectedYear !== currentSeason && (
          <div className="mt-1 pt-1 border-t border-old-money-200 dark:border-charcoal-600">
            <button
              onClick={handleClear}
              className="w-full px-3 py-1.5 text-sm text-charcoal-500 hover:text-charcoal-700 dark:text-charcoal-400 dark:hover:text-charcoal-200 transition-colors"
            >
              {currentSeason}
            </button>
          </div>
        )}
      </div>
    </ModernDropdown>
  )
}
