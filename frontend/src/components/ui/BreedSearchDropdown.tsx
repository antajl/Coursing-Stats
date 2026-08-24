import { useState, useEffect, useRef, useMemo, type KeyboardEvent } from 'react'
import ModernDropdown from './ModernDropdown'
import { uniqueCanonicalBreeds, displayBreed } from '../../lib/breedMapping'
import { deriveCompetingBreeds, type DogsIndexEntry } from '../../lib/competingBreeds'

interface BreedSearchDropdownProps {
  breeds: string[]
  selectedBreed?: string
  onSelect: (breed: string) => void
  trigger: React.ReactNode
  className?: string
  dogIndex?: DogsIndexEntry[]
}

export default function BreedSearchDropdown({
  breeds,
  selectedBreed,
  onSelect,
  trigger,
  className = '',
  dogIndex,
}: BreedSearchDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Get unique canonical breeds sorted by popularity if dogIndex is provided
  const uniqueBreeds = useMemo(() => {
    if (dogIndex && dogIndex.length > 0) {
      return deriveCompetingBreeds(dogIndex)
    }
    return uniqueCanonicalBreeds(breeds)
  }, [breeds, dogIndex])
  
  // Filter breeds based on search query
  const filteredBreeds = uniqueBreeds.filter((breed) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    const display = displayBreed(breed)
    return (
      breed.toLowerCase().includes(query) ||
      display.primary.toLowerCase().includes(query) ||
      (display.secondary && display.secondary.toLowerCase().includes(query))
    )
  })

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

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

  const handleSelect = (breed: string) => {
    onSelect(breed)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleClear = () => {
    onSelect('')
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <ModernDropdown
      trigger={trigger}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      className={className}
      width="320px"
    >
      <div className="p-2 min-w-[200px] max-w-xs">
        {/* Selected breed indicator */}
        {selectedBreed && !searchQuery && (
          <div className="mb-2 px-2 py-1.5 text-xs font-medium text-camel-700 dark:text-camel-400 bg-camel-50 dark:bg-camel-900/20 rounded-md">
            Выбрано: {displayBreed(selectedBreed).primary}
          </div>
        )}

        {/* Search input */}
        <div className="relative mb-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Поиск породы..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-old-money-200 rounded-md bg-white dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-charcoal-100 focus:outline-none focus:ring-2 focus:ring-camel-300"
            onKeyDown={handleKeyDown}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 dark:text-charcoal-500 dark:hover:text-charcoal-300"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Breed list */}
        <div
          ref={listRef}
          className="max-h-60 overflow-y-auto"
          role="menu"
        >
          {filteredBreeds.length === 0 ? (
            <div className="px-3 py-2 text-sm text-charcoal-500 dark:text-charcoal-400">
              Породы не найдены
            </div>
          ) : (
            filteredBreeds.map((breed) => {
              const display = displayBreed(breed)
              const isSelected = breed === selectedBreed
              
              return (
                <button
                  key={breed}
                  role="menuitem"
                  onClick={() => handleSelect(breed)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    isSelected
                      ? 'bg-camel-500 text-charcoal-900 dark:bg-camel-600 dark:text-cream-50'
                      : 'text-charcoal-700 hover:bg-camel-100 dark:text-charcoal-200 dark:hover:bg-camel-900/30'
                  }`}
                >
                  {display.primary}
                  {display.secondary && (
                    <span className="ml-2 text-charcoal-400 dark:text-charcoal-500">
                      {display.secondary}
                    </span>
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Clear selection button */}
        {selectedBreed && (
          <div className="mt-2 pt-2 border-t border-old-money-200 dark:border-charcoal-600">
            <button
              onClick={handleClear}
              className="w-full px-3 py-1.5 text-sm text-charcoal-500 hover:text-charcoal-700 dark:text-charcoal-400 dark:hover:text-charcoal-200 transition-colors"
            >
              Сбросить фильтр
            </button>
          </div>
        )}
      </div>
    </ModernDropdown>
  )
}
