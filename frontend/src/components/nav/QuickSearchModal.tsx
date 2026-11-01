import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Icons } from '../../lib/icons'
import { displayBreed } from '../../lib/breedMapping'
import { parseDogName } from '../../lib/dogName'
import DogSexIcon from '../DogSexIcon'
import { POPULAR_BREEDS, QUICK_NAV_SHORTCUTS } from './quickSearchData'
import { computeSearchResults } from './quickSearchScoring'
import type {
  CalendarSearchEvent,
  HomeSearchDog,
  SearchItem,
} from './quickSearchTypes'

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
          {!query.trim() ? (
            <div className="p-4 sm:p-5">
              {/* Quick Navigation Shortcuts */}
              <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-2.5">
                Быстрый переход по сайту
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {QUICK_NAV_SHORTCUTS.map((item) => {
                  const ItemIcon = Icons[item.icon]
                  return (
                    <button
                      key={item.to}
                      type="button"
                      onClick={() => {
                        onClose()
                        navigate(item.to)
                      }}
                      className="px-2.5 py-2 text-left rounded-xl border border-old-money-200 bg-white hover:bg-old-money-50 hover:border-camel-300 text-charcoal-800 transition-all flex items-center gap-2 group cursor-pointer"
                    >
                      <ItemIcon className="w-4 h-4 text-camel-700 shrink-0 transition-transform group-hover:scale-110" />
                      <span className="text-xs font-semibold truncate">{item.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Popular Breeds */}
              <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-2">
                Популярные породы
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
                {POPULAR_BREEDS.map((breed) => (
                  <button
                    key={breed}
                    type="button"
                    onClick={() => {
                      setQuery(breed)
                      inputRef.current?.focus()
                    }}
                    className="px-2.5 py-1 text-xs rounded-lg border border-old-money-200 bg-white hover:bg-old-money-50 hover:border-camel-300 text-charcoal-700 transition-colors cursor-pointer"
                  >
                    {breed}
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-charcoal-400 leading-relaxed border-t border-old-money-100 pt-3">
                Введите кличку собаки, породу, турнир или раздел сайта (например: «судьи», «календарь», «правила», «донино», «протокол», «рпб»).
              </p>
            </div>
          ) : allItems.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <p className="text-sm font-medium text-charcoal-700 mb-1">
                Ничего не найдено по запросу «{query}»
              </p>
              <p className="text-xs text-charcoal-400">
                Попробуйте ввести кличку собаки, название раздела (например «судьи», «донино», «календарь») или породу
              </p>
            </div>
          ) : (
            <>
              {/* Navigation Sections */}
              {navItems.length > 0 && (
                <div className="py-1">
                  <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-camel-800 flex items-center justify-between">
                    <span>Разделы сайта</span>
                    <span className="text-[10px] text-charcoal-400 font-normal">Навигация</span>
                  </div>
                  {navItems.map((item) => {
                    const idx = allItems.indexOf(item)
                    const isSelected = idx === selectedIndex
                    const NavIcon = Icons[item.item.icon] || Icons.flag

                    return (
                      <button
                        key={`nav-${item.item.id}`}
                        type="button"
                        onClick={() => handleSelectItem(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-camel-100/75 border-l-2 border-camel-600'
                            : 'hover:bg-old-money-50/70 border-l-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-7 h-7 rounded-lg bg-old-money-100 border border-old-money-200 flex items-center justify-center shrink-0 text-camel-800">
                            <NavIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-charcoal-900 truncate">
                                {item.item.title}
                              </span>
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                                Раздел
                              </span>
                            </div>
                            <p className="text-[11px] text-charcoal-500 truncate mt-0.5">
                              {item.item.subtitle}
                            </p>
                          </div>
                        </div>
                        <Icons.chevronRight className="w-4 h-4 text-charcoal-400 shrink-0" />
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Breed Hubs */}
              {breedItems.length > 0 && (
                <div className="py-1">
                  <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-camel-800 flex items-center justify-between">
                    <span>Породы</span>
                    <span className="text-[10px] text-charcoal-400 font-normal">Породный хаб</span>
                  </div>
                  {breedItems.map((item) => {
                    const idx = allItems.indexOf(item)
                    const isSelected = idx === selectedIndex

                    return (
                      <button
                        key={`breed-${item.item.slug}`}
                        type="button"
                        onClick={() => handleSelectItem(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-camel-100/75 border-l-2 border-camel-600'
                            : 'hover:bg-old-money-50/70 border-l-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-800">
                            <Icons.paw className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-charcoal-900 truncate">
                                {item.item.nameRu} ({item.item.nameLat})
                              </span>
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                                Хаб
                              </span>
                            </div>
                            <p className="text-[11px] text-charcoal-500 truncate mt-0.5">
                              {item.item.subtitle}
                            </p>
                          </div>
                        </div>
                        <Icons.chevronRight className="w-4 h-4 text-charcoal-400 shrink-0" />
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Dogs Section */}
              {dogItems.length > 0 && (
                <div className="py-1">
                  <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-camel-800 flex items-center justify-between">
                    <span>Собаки ({dogItems.length})</span>
                    <span className="text-[10px] text-charcoal-400 font-normal">База собак</span>
                  </div>
                  {dogItems.map((item) => {
                    const idx = allItems.indexOf(item)
                    const isSelected = idx === selectedIndex
                    const { primary, secondary } = parseDogName(item.dog.name_lat, item.dog.name_ru)
                    const display = item.dog.breed ? displayBreed(item.dog.breed) : null

                    return (
                      <button
                        key={`dog-${item.dog.id}`}
                        type="button"
                        onClick={() => handleSelectItem(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-camel-100/75 border-l-2 border-camel-600'
                            : 'hover:bg-old-money-50/70 border-l-2 border-transparent'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-charcoal-900 truncate">
                              {primary}
                            </span>
                            {secondary && (
                              <span className="text-xs text-charcoal-500 truncate hidden sm:inline">
                                / {secondary}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-charcoal-500 mt-0.5">
                            <span className="font-medium text-charcoal-700 truncate">
                              {display?.primary || item.dog.breed}
                            </span>
                            {item.dog.sex && (
                              <>
                                <span className="text-charcoal-300">·</span>
                                <DogSexIcon sex={item.dog.sex} size={11} variant="neutral" />
                              </>
                            )}
                            {item.dog.competition_count ? (
                              <>
                                <span className="text-charcoal-300">·</span>
                                <span>{item.dog.competition_count} заб.</span>
                              </>
                            ) : null}
                          </div>
                        </div>
                        <Icons.chevronRight className="w-4 h-4 text-charcoal-400 shrink-0" />
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Events Section */}
              {eventItems.length > 0 && (
                <div className="py-1">
                  <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-camel-800 flex items-center justify-between">
                    <span>Соревнования ({eventItems.length})</span>
                    <span className="text-[10px] text-charcoal-400 font-normal">Турниры</span>
                  </div>
                  {eventItems.map((item) => {
                    const idx = allItems.indexOf(item)
                    const isSelected = idx === selectedIndex

                    return (
                      <button
                        key={`event-${item.event.id}`}
                        type="button"
                        onClick={() => handleSelectItem(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-camel-100/75 border-l-2 border-camel-600'
                            : 'hover:bg-old-money-50/70 border-l-2 border-transparent'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-charcoal-900 truncate">
                            {item.event.title}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-charcoal-500 mt-0.5 truncate">
                            <span>{item.event.date_start}</span>
                            {item.event.rank_code && (
                              <>
                                <span className="text-charcoal-300">·</span>
                                <span className="font-medium text-camel-800">{item.event.rank_code}</span>
                              </>
                            )}
                            {item.event.location && (
                              <>
                                <span className="text-charcoal-300">·</span>
                                <span className="truncate">{item.event.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Icons.chevronRight className="w-4 h-4 text-charcoal-400 shrink-0" />
                      </button>
                    )
                  })}
                </div>
              )}
            </>
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
