import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Icons } from '../../lib/icons'
import { computeSearchResults } from './quickSearchScoring'
import type {
  CalendarSearchEvent,
  HomeSearchDog,
  SearchItem,
} from './quickSearchTypes'
import { QuickSearchEmptyState } from './search/QuickSearchEmptyState'
import { QuickSearchResults } from './search/QuickSearchResults'

// Re-export types for backward compatibility
export type {
  BreedHubSearchItem,
  CalendarSearchEvent,
  HomeSearchDog,
  NavigationRouteItem,
  SearchItem,
} from './quickSearchTypes'

interface QuickSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

let cachedDogs: HomeSearchDog[] | null = null
let cachedEvents: CalendarSearchEvent[] | null = null

export default function QuickSearchModal({ isOpen, onClose }: QuickSearchModalProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [dogs, setDogs] = useState<HomeSearchDog[] | null>(cachedDogs)
  const [events, setEvents] = useState<CalendarSearchEvent[] | null>(cachedEvents)

  // Fetch indexes when opened
  useEffect(() => {
    if (!isOpen) return

    let cancelled = false

    if (!cachedDogs) {
      fetch('/data/v1/indexes/dogs-index.json')
        .then((r) => (r.ok ? r.json() : []))
        .then((data: HomeSearchDog[]) => {
          if (cancelled) return
          cachedDogs = Array.isArray(data) ? data : []
          setDogs(cachedDogs)
        })
        .catch(() => {})
    }

    if (!cachedEvents) {
      fetch('/data/v1/indexes/calendar-index.json')
        .then((r) => (r.ok ? r.json() : []))
        .then((data: CalendarSearchEvent[]) => {
          if (cancelled) return
          cachedEvents = Array.isArray(data) ? data : []
          setEvents(cachedEvents)
        })
        .catch(() => {})
    }

    return () => {
      cancelled = true
    }
  }, [isOpen])

  // Focus input and lock body scroll on open
  useEffect(() => {
    if (!isOpen) return

    setQuery('')
    setSelectedIndex(0)

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 40)

    return () => {
      document.body.style.overflow = prevOverflow
      clearTimeout(timer)
    }
  }, [isOpen])

  // Compute matched items via pure scoring function
  const { navItems, breedItems, dogItems, eventItems, allItems } = useMemo(
    () => computeSearchResults(query, dogs, events),
    [dogs, events, query],
  )

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleSelectItem = (item: SearchItem) => {
    onClose()
    if (item.type === 'nav') {
      navigate(item.item.to)
    } else if (item.type === 'breed') {
      navigate(item.item.to)
    } else if (item.type === 'dog') {
      navigate(`/dog/${item.dog.id}/`)
    } else {
      navigate(`/event/${item.event.id}/`)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }

    if (allItems.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % allItems.length)
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length)
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      const selected = allItems[selectedIndex]
      if (selected) {
        handleSelectItem(selected)
      }
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Быстрый поиск и навигация"
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[8vh] sm:pt-[11vh] px-3 sm:px-4 bg-charcoal-900/40 backdrop-blur-sm transition-all"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-xl bg-cream-50 rounded-2xl shadow-[0_20px_50px_-10px_rgba(43,37,32,0.35)] border border-old-money-200 overflow-hidden flex flex-col will-change-transform animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="relative flex items-center px-3.5 sm:px-4 py-3 sm:py-3.5 border-b border-old-money-200 bg-white">
          <Icons.search className="w-4 h-4 sm:w-5 sm:h-5 text-camel-700 shrink-0 mr-2.5 sm:mr-3" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Поиск по сайту: собака, порода, турнир или раздел..."
            className="min-w-0 flex-1 bg-transparent border-0 !outline-none focus:!outline-none focus-visible:!outline-none focus:!ring-0 focus-visible:!ring-0 text-sm sm:text-base text-charcoal-900 placeholder:text-charcoal-400 font-medium mr-2"
            style={{ outline: 'none' }}
          />
          <div className="flex items-center shrink-0 gap-1.5 ml-auto">
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  inputRef.current?.focus()
                }}
                className="p-1 rounded text-charcoal-400 hover:text-charcoal-700 transition-colors cursor-pointer"
                aria-label="Очистить"
              >
                <Icons.close className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border border-old-money-200 bg-old-money-100/70 text-charcoal-500 select-none shadow-2xs">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results Container */}
        <div ref={listRef} className="max-h-[58vh] overflow-y-auto overscroll-contain py-2 divide-y divide-old-money-100">
          {!query.trim() || allItems.length === 0 ? (
            <QuickSearchEmptyState
              query={query}
              hasNoResults={query.trim().length > 0 && allItems.length === 0}
              onSelectShortcut={(to) => {
                onClose()
                navigate(to)
              }}
              onSelectBreed={(breed) => {
                setQuery(breed)
                inputRef.current?.focus()
              }}
            />
          ) : (
            <QuickSearchResults
              navItems={navItems}
              breedItems={breedItems}
              dogItems={dogItems}
              eventItems={eventItems}
              allItems={allItems}
              selectedIndex={selectedIndex}
              onSelectItem={handleSelectItem}
              onHoverIndex={setSelectedIndex}
            />
          )}
        </div>

        {/* Footer info & hotkey hints */}
        <div className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-old-money-50/90 border-t border-old-money-200 flex items-center justify-between text-[11px] text-charcoal-500">
          <span>
            {allItems.length > 0 ? `Найдено результатов: ${allItems.length}` : 'База данных Coursing Stats'}
          </span>
          <div className="flex items-center gap-2.5 sm:gap-3 text-charcoal-500">
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="font-mono bg-white border border-old-money-200 px-1 rounded text-[10px]">↑</kbd>
              <kbd className="font-mono bg-white border border-old-money-200 px-1 rounded text-[10px]">↓</kbd>
              <span>выбор</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="font-mono bg-white border border-old-money-200 px-1.5 rounded text-[10px]">↵</kbd>
              <span>открыть</span>
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
