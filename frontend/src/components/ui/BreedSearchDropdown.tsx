import { useState, useEffect, useRef, useMemo, type KeyboardEvent } from 'react'
import ModernDropdown from './ModernDropdown'
import { canonicalBreed, uniqueCanonicalBreeds, displayBreed, matchesBreedFilter } from '../../lib/breedMapping'
import { deriveCompetingBreeds, countCompetingBreeds, type DogsIndexEntry } from '../../lib/competingBreeds'

interface BreedSearchDropdownProps {
  breeds?: string[]
  selectedBreed?: string
  onSelect: (breed: string) => void
  trigger: React.ReactNode
  className?: string
  dogIndex?: DogsIndexEntry[]
}

export default function BreedSearchDropdown({
  breeds = [],
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

  // Get unique canonical breeds sorted by popularity if dogIndex or breeds is provided (only when open)
  const uniqueBreeds = useMemo(() => {
    if (!isOpen) return []
    if (dogIndex && dogIndex.length > 0) {
      return deriveCompetingBreeds(dogIndex)
    }
    const safeBreeds = Array.isArray(breeds) ? breeds : []
    // Sort breeds by frequency/popularity descending, then alphabetically
    const counts = new Map<string, number>()
    for (const b of safeBreeds) {
      const canon = canonicalBreed(b || '')
      if (canon) counts.set(canon, (counts.get(canon) || 0) + 1)
    }
    const hasCounts = Array.from(counts.values()).some((c) => c > 1)
    if (hasCounts) {
      return Array.from(counts.keys()).sort((a, b) => {
        const byCount = (counts.get(b) || 0) - (counts.get(a) || 0)
        if (byCount !== 0) return byCount
        return a.localeCompare(b, 'ru')
      })
    }
    // If incoming breeds were already deduplicated/pre-ordered, preserve that order
    const seen = new Set<string>()
    const ordered: string[] = []
    for (const b of safeBreeds) {
      const canon = canonicalBreed(b || '')
      if (canon && !seen.has(canon)) {
        seen.add(canon)
        ordered.push(canon)
      }
    }
    return ordered.length > 0 ? ordered : uniqueCanonicalBreeds(safeBreeds)
  }, [breeds, dogIndex, isOpen])

  // Count dogs per breed if dogIndex or breeds with multiplicity is provided (only when open)
  const breedCounts = useMemo(() => {
    if (!isOpen) return new Map<string, number>()
    if (dogIndex && dogIndex.length > 0) {
      return countCompetingBreeds(dogIndex)
    }
    const safeBreeds = Array.isArray(breeds) ? breeds : []
    const counts = new Map<string, number>()
    for (const b of safeBreeds) {
      const canon = canonicalBreed(b || '')
      if (canon) counts.set(canon, (counts.get(canon) || 0) + 1)
    }
    const hasMultiplicity = Array.from(counts.values()).some((c) => c > 1)
    return hasMultiplicity ? counts : new Map<string, number>()
  }, [dogIndex, breeds, isOpen])
  
  // Filter breeds based on search query (only when open)
  const filteredBreeds = useMemo(() => {
    if (!isOpen) return []
    if (!searchQuery) return uniqueBreeds
    const query = searchQuery.toLowerCase()
    return uniqueBreeds.filter((breed) => {
      const display = displayBreed(breed)
      return (
        breed.toLowerCase().includes(query) ||
        display.primary.toLowerCase().includes(query) ||
        (display.secondary && display.secondary.toLowerCase().includes(query))
      )
    })
  }, [uniqueBreeds, searchQuery, isOpen])

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
      {isOpen ? (
        <div className="p-2 min-w-[200px] max-w-xs">
          {/* Selected breed indicator */}
          {selectedBreed && !searchQuery && (
            <div className="mb-2 px-2 py-1.5 text-xs font-medium text-camel-700 bg-camel-50 rounded-md">
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
              className="w-full px-3 py-2 text-sm border border-old-money-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-camel-300"
              onKeyDown={handleKeyDown}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
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
              <div className="px-3 py-2 text-sm text-charcoal-500">
                Породы не найдены
              </div>
            ) : (
              filteredBreeds.map((breed) => {
                const display = displayBreed(breed)
                const isSelected = selectedBreed ? matchesBreedFilter(selectedBreed, breed) : false
                const count = breedCounts.get(breed)
                
                return (
                  <button
                    key={breed}
                    role="menuitem"
                    onClick={() => handleSelect(breed)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-camel-100 text-camel-950 font-semibold'
                        : 'text-charcoal-700 hover:bg-camel-100'
                    }`}
                  >
                    <span className="truncate">
                      {display.primary}
                      {display.secondary && (
                        <span className="ml-2 text-charcoal-400 font-normal text-xs">
                          {display.secondary}
                        </span>
                      )}
                    </span>
                    {count != null && count > 0 && (
                      <span
                        className={`shrink-0 text-xs tabular-nums font-medium ${
                          isSelected ? 'text-charcoal-800' : 'text-charcoal-400'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* Clear selection button */}
          {selectedBreed && (
            <div className="mt-2 pt-2 border-t border-old-money-200">
              <button
                onClick={handleClear}
                className="w-full px-3 py-1.5 text-sm text-charcoal-500 hover:text-charcoal-700 transition-colors"
              >
                Сбросить фильтр
              </button>
            </div>
          )}
        </div>
      ) : null}
    </ModernDropdown>
  )
}
