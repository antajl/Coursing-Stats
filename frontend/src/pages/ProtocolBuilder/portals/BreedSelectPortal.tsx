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

  const query = breedSearch.toLowerCase().trim()
  const filteredGroups = BREED_GROUPS.map((group) => ({
    ...group,
    breeds: group.breeds.filter((b) => !query || b.toLowerCase().includes(query))
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
        className="fixed z-50 w-72 bg-cream-50 rounded-xl border border-om-300 shadow-2xl p-1 text-xs ring-1 ring-char-900/10 animate-in fade-in zoom-in-95 duration-100"
        style={{
          top:
            window.innerHeight - activeBreedMenu.rect.bottom < 280
              ? Math.max(10, activeBreedMenu.rect.top - 270)
              : activeBreedMenu.rect.bottom + 4,
          left: Math.max(10, Math.min(activeBreedMenu.rect.left, window.innerWidth - 300))
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-1 border-b border-om-200/70 mb-1 flex items-center gap-1.5">
          <div className="flex-1 flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-om-200 focus-within:ring-1 focus-within:ring-camel-500">
            <Search className="w-3.5 h-3.5 text-char-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={breedSearch}
              onChange={(e) => setBreedSearch(e.target.value)}
              placeholder="Поиск породы..."
              className="w-full text-xs text-char-900 bg-transparent focus:outline-none placeholder:text-char-400"
            />
            {breedSearch && (
              <button
                type="button"
                onClick={() => setBreedSearch('')}
                className="text-char-400 hover:text-char-700 p-0.5 rounded cursor-pointer"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-char-400 hover:text-char-700 p-1 rounded cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        <div className="p-0.5 space-y-1 max-h-60 overflow-y-auto">
          {filteredGroups.map((group) => (
            <div key={group.groupName} className="space-y-0.5">
              <div className="px-2 pt-1.5 pb-0.5 text-[9px] font-bold uppercase tracking-wider text-camel-800">
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
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex justify-between items-center transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-camel-100 text-camel-900 font-bold'
                        : 'hover:bg-om-100 text-char-700'
                    }`}
                  >
                    <span>{b}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-camel-700 shrink-0" />}
                  </button>
                )
              })}
            </div>
          ))}

          {filteredGroups.length === 0 && (
            <div className="px-3 py-3 text-center text-xs text-char-400">Порода не найдена</div>
          )}

          <div className="pt-1 mt-1 border-t border-om-200/70">
            <button
              type="button"
              onClick={() => {
                setCustomBreedCatIds((prev) => ({ ...prev, [cat.id]: true }))
                onClose()
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-camel-800 font-semibold hover:bg-om-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3 h-3 text-camel-600" />
              <span>Другая порода (ввести вручную)</span>
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
