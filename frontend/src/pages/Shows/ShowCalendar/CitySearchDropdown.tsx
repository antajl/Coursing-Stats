import { useState, useEffect, useRef, useMemo, type KeyboardEvent } from 'react'
import { ChevronDown, MapPin, X } from 'lucide-react'
import ModernDropdown from '../../../components/ui/ModernDropdown'
import { toolbarPillTriggerClass } from '../../../lib/toolbar'

export interface CityOption {
  city: string
  count: number
}

interface CitySearchDropdownProps {
  cities: CityOption[]
  selectedCity?: string
  onSelect: (city: string) => void
  className?: string
  compact?: boolean
}

export default function CitySearchDropdown({
  cities = [],
  selectedCity = '',
  onSelect,
  className = '',
  compact = false,
}: CitySearchDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Filter cities by search query
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return cities
    const query = searchQuery.trim().toLowerCase()
    return cities.filter((c) => c.city.toLowerCase().includes(query))
  }, [cities, searchQuery])

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setSearchQuery('')
    }
  }, [isOpen])

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const items = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')
      if (!items || items.length === 0) return

      const currentIndex = Array.from(items).findIndex(
        (item) => item === document.activeElement,
      )

      let nextIndex = 0
      if (e.key === 'ArrowDown') {
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
      } else {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
      }

      items[nextIndex]?.focus()
    }
  }

  const handleSelect = (city: string) => {
    onSelect(city === selectedCity ? '' : city)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleClear = () => {
    onSelect('')
    setIsOpen(false)
    setSearchQuery('')
  }

  const displayLabel = selectedCity || (compact ? 'Город' : 'Локация')

  const trigger = (
    <button
      type="button"
      className={`shrink-0 ${toolbarPillTriggerClass(Boolean(selectedCity))}`}
      title={selectedCity ? `Выбран город: ${selectedCity}` : 'Фильтр по городу'}
      aria-label={selectedCity ? `Выбран город: ${selectedCity}` : 'Фильтр по городу'}
    >
      <MapPin className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
      <span className="truncate max-w-[85px] sm:max-w-[110px]">
        {displayLabel}
      </span>
      <ChevronDown className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
    </button>
  )

  return (
    <ModernDropdown
      trigger={trigger}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      className={className}
      width="280px"
    >
      <div className="p-2 min-w-[220px] max-w-xs">
        {/* Search input */}
        <div className="relative mb-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Поиск города…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-old-money-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-camel-300 placeholder:text-charcoal-400"
            onKeyDown={handleKeyDown}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 p-0.5"
              aria-label="Очистить поиск"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Selected city indicator */}
        {selectedCity && !searchQuery && (
          <div className="mb-2 px-2.5 py-1 text-[11px] font-semibold text-camel-800 bg-camel-100/70 border border-camel-200/80 rounded-md flex items-center justify-between">
            <span className="truncate">Выбрано: {selectedCity}</span>
            <button
              type="button"
              onClick={handleClear}
              className="text-camel-700 hover:text-camel-900 ml-1 text-xs font-bold"
              title="Снять выбор"
            >
              ×
            </button>
          </div>
        )}

        {/* Cities list */}
        <div
          ref={listRef}
          className="max-h-64 overflow-y-auto space-y-0.5 overscroll-contain"
          role="menu"
        >
          {filteredCities.length === 0 ? (
            <div className="px-3 py-3 text-center text-xs text-charcoal-500">
              Города не найдены
            </div>
          ) : (
            filteredCities.map(({ city, count }) => {
              const isSelected = selectedCity.toLowerCase() === city.toLowerCase()
              return (
                <button
                  key={city}
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelect(city)}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-camel-100 text-camel-950 font-semibold'
                      : 'text-charcoal-700 hover:bg-camel-50'
                  }`}
                >
                  <span className="truncate">{city}</span>
                  <span
                    className={`shrink-0 text-[10.5px] font-mono tabular-nums ${
                      isSelected ? 'text-charcoal-800 font-bold' : 'text-charcoal-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })
          )}
        </div>

        {/* Clear selection button */}
        {selectedCity && (
          <div className="mt-2 pt-2 border-t border-old-money-200">
            <button
              type="button"
              onClick={handleClear}
              className="w-full px-2 py-1 text-center text-xs text-charcoal-500 hover:text-charcoal-800 transition-colors"
            >
              Сбросить фильтр города
            </button>
          </div>
        )}
      </div>
    </ModernDropdown>
  )
}
