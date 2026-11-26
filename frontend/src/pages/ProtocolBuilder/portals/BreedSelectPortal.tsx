import React from 'react'
import { createPortal } from 'react-dom'
import { X, Check, Search, Plus } from 'lucide-react'
import type { CategoryGroup, ActiveCategoryMenuState } from '../types'
import { BREED_GROUPS } from '../constants'

interface BreedSelectPortalProps {
  categories: CategoryGroup[]
  activeBreedMenu: ActiveCategoryMenuState | null
  onClose: () => void
  breedSearch: string
  setBreedSearch: (val: string) => void
  updateCategoryMeta: (catId: string, updates: Partial<CategoryGroup>) => void
  setCustomBreedCatIds: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}

export const BreedSelectPortal: React.FC<BreedSelectPortalProps> = ({
  categories,
  activeBreedMenu,
  onClose,
  breedSearch,
  setBreedSearch,
  updateCategoryMeta,
  setCustomBreedCatIds,
}) => {
  if (!activeBreedMenu || typeof document === 'undefined') return null

  const cat = categories.find((c) => c.id === activeBreedMenu.catId)
  if (!cat) return null

  const isFinePointer = typeof window !== 'undefined' && window.matchMedia?.('(pointer: fine)').matches
  const query = breedSearch.toLowerCase().trim()
  const filteredGroups = BREED_GROUPS.map((group) => ({
    ...group,
    breeds: group.breeds.filter((b) => !query || b.toLowerCase().includes(query)),
  })).filter((g) => g.breeds.length > 0)

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Закрыть"
        className="fixed inset-0 z-50 bg-transparent border-none p-0 cursor-pointer touch-manipulation"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        data-portal-menu
        className="fixed z-50 w-72 bg-cream-50 rounded-2xl border border-om-300 shadow-2xl p-1.5 text-xs ring-1 ring-charcoal-900/10"
        style={{
          top:
            window.innerHeight - activeBreedMenu.rect.bottom < 300
              ? Math.max(10, activeBreedMenu.rect.top - 290)
              : activeBreedMenu.rect.bottom + 4,
          left: Math.max(10, Math.min(activeBreedMenu.rect.left, window.innerWidth - 300)),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-1 border-b border-om-200/80 mb-1 flex items-center gap-1.5">
          <div className="flex-1 flex items-center gap-1.5 px-2.5 min-h-[40px] bg-white rounded-xl border border-om-200 focus-within:ring-2 focus-within:ring-camel-500/40">
            <Search className="w-3.5 h-3.5 text-charcoal-500 shrink-0" />
            <input
              type="text"
              autoFocus={Boolean(isFinePointer)}
              value={breedSearch}
              onChange={(e) => setBreedSearch(e.target.value)}
              placeholder="Поиск породы..."
              className="w-full text-xs text-charcoal-900 bg-transparent focus:outline-none placeholder:text-charcoal-500"
            />
            {breedSearch && (
              <button
                type="button"
                onClick={() => setBreedSearch('')}
                className="text-charcoal-500 hover:text-charcoal-900 p-1 rounded cursor-pointer"
                aria-label="Очистить поиск породы"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center text-charcoal-600 hover:text-charcoal-900 rounded-xl hover:bg-om-100 cursor-pointer"
            aria-label="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-0.5 space-y-1 max-h-64 overflow-y-auto">
          {filteredGroups.map((group) => (
            <div key={group.groupName} className="space-y-0.5">
              <div className="px-2.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-camel-800">
                {group.groupName}
              </div>
              {group.breeds.map((b) => {
                const isSelected = cat.breed === b
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      updateCategoryMeta(cat.id, { breed: b })
                      onClose()
                    }}
                    className={`w-full min-h-[44px] sm:min-h-[36px] text-left px-3 py-1.5 rounded-xl text-xs flex justify-between items-center transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-camel-100 text-camel-950 font-semibold'
                        : 'hover:bg-om-100 text-charcoal-800'
                    }`}
                  >
                    <span>{b}</span>
                    {isSelected && <Check className="w-4 h-4 text-camel-700 shrink-0" />}
                  </button>
                )
              })}
            </div>
          ))}

          {filteredGroups.length === 0 && (
            <div className="px-3 py-4 text-center text-xs text-charcoal-600">Порода не найдена</div>
          )}

          <div className="pt-1 mt-1 border-t border-om-200/80">
            <button
              type="button"
              onClick={() => {
                setCustomBreedCatIds((prev) => ({ ...prev, [cat.id]: true }))
                onClose()
              }}
              className="w-full min-h-[44px] sm:min-h-[38px] text-left px-3 rounded-xl text-xs text-camel-800 font-semibold hover:bg-om-100 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-camel-700" />
              <span>Другая порода (ввести вручную)</span>
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
