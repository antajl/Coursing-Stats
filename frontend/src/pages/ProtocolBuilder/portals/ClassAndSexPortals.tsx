import React from 'react'
import { createPortal } from 'react-dom'
import { X, Check, Plus } from 'lucide-react'
import type {
  CategoryGroup,
  DogParticipant,
  ActiveCategoryMenuState,
  ActiveDogSexMenuState
} from '../types'
import { CLASSES } from '../constants'

interface ClassAndSexPortalsProps {
  categories: CategoryGroup[]
  activeClassMenu: ActiveCategoryMenuState | null
  onCloseClassMenu: () => void
  updateCategoryMeta: (catId: string, updates: Partial<CategoryGroup>) => void
  setCustomClassCatIds: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  activeCategorySexMenu: ActiveCategoryMenuState | null
  onCloseCategorySexMenu: () => void
  activeDogSexMenu: ActiveDogSexMenuState | null
  onCloseDogSexMenu: () => void
  updateDog: (catId: string, dogId: string, updates: Partial<DogParticipant>) => void
}

export const ClassAndSexPortals: React.FC<ClassAndSexPortalsProps> = ({
  categories,
  activeClassMenu,
  onCloseClassMenu,
  updateCategoryMeta,
  setCustomClassCatIds,
  activeCategorySexMenu,
  onCloseCategorySexMenu,
  activeDogSexMenu,
  onCloseDogSexMenu,
  updateDog,
}) => {
  if (typeof document === 'undefined') return null

  const targetClassCat = activeClassMenu ? categories.find((c) => c.id === activeClassMenu.catId) : null
  const targetCategorySexCat = activeCategorySexMenu ? categories.find((c) => c.id === activeCategorySexMenu.catId) : null
  const targetDogSexCat = activeDogSexMenu ? categories.find((c) => c.id === activeDogSexMenu.catId) : null
  const targetDog = targetDogSexCat && activeDogSexMenu ? targetDogSexCat.dogs.find((d) => d.id === activeDogSexMenu.dogId) : null

  const categorySexOptions: Array<{ value: 'male' | 'female' | 'mixed'; label: string }> = [
    { value: 'male', label: 'Кобели' },
    { value: 'female', label: 'Суки' },
    { value: 'mixed', label: 'Микс' }
  ]

  const dogSexOptions: Array<{ value: 'male' | 'female'; label: string }> = [
    { value: 'male', label: 'Кобель' },
    { value: 'female', label: 'Сука' }
  ]

  return (
    <>
      {/* Портал выпадающего меню выбора класса */}
      {activeClassMenu && targetClassCat &&
        createPortal(
          <>
            <div className="fixed inset-0 z-50" onClick={onCloseClassMenu} />
            <div
              data-portal-menu
              className="fixed z-50 w-52 bg-cream-50 rounded-xl border border-om-300 shadow-2xl p-1 text-xs ring-1 ring-char-900/10 animate-in fade-in zoom-in-95 duration-100"
              style={{
                top:
                  window.innerHeight - activeClassMenu.rect.bottom < 240
                    ? Math.max(10, activeClassMenu.rect.top - 230)
                    : activeClassMenu.rect.bottom + 4,
                left: Math.max(10, Math.min(activeClassMenu.rect.left, window.innerWidth - 220))
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-2.5 py-1 text-[10px] font-bold text-camel-800 uppercase tracking-wider border-b border-om-200/70 mb-1 flex items-center justify-between">
                <span>Выбор класса</span>
                <button
                  type="button"
                  onClick={onCloseClassMenu}
                  className="text-char-400 hover:text-char-700 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="p-0.5 space-y-0.5 max-h-56 overflow-y-auto">
                {CLASSES.map((c) => {
                  const isSelected = targetClassCat.className === c
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        updateCategoryMeta(targetClassCat.id, { className: c })
                        onCloseClassMenu()
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex justify-between items-center transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-camel-100 text-camel-900 font-bold'
                          : 'hover:bg-om-100 text-char-700'
                      }`}
                    >
                      <span>{c}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-camel-700 shrink-0" />}
                    </button>
                  )
                })}
                {!CLASSES.includes(targetClassCat.className) && targetClassCat.className && (
                  <button
                    type="button"
                    onClick={onCloseClassMenu}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex justify-between items-center bg-camel-100 text-camel-900 font-bold"
                  >
                    <span>{targetClassCat.className}</span>
                    <Check className="w-3.5 h-3.5 text-camel-700 shrink-0" />
                  </button>
                )}
                <div className="pt-1 mt-1 border-t border-om-200/70">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomClassCatIds((prev) => ({ ...prev, [targetClassCat.id]: true }))
                      onCloseClassMenu()
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-camel-800 font-semibold hover:bg-om-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-camel-600" />
                    <span>Другой класс...</span>
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}

      {/* Портал выпадающего меню выбора пола в категории */}
      {activeCategorySexMenu && targetCategorySexCat &&
        createPortal(
          <>
            <div className="fixed inset-0 z-50" onClick={onCloseCategorySexMenu} />
            <div
              data-portal-menu
              className="fixed z-50 w-36 bg-cream-50 rounded-xl border border-om-300 shadow-2xl p-1 text-xs ring-1 ring-char-900/10 animate-in fade-in zoom-in-95 duration-100"
              style={{
                top:
                  window.innerHeight - activeCategorySexMenu.rect.bottom < 150
                    ? Math.max(10, activeCategorySexMenu.rect.top - 140)
                    : activeCategorySexMenu.rect.bottom + 4,
                left: Math.max(10, Math.min(activeCategorySexMenu.rect.left, window.innerWidth - 160))
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-0.5 space-y-0.5">
                {categorySexOptions.map((opt) => {
                  const isSelected = targetCategorySexCat.sex === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        updateCategoryMeta(targetCategorySexCat.id, { sex: opt.value })
                        onCloseCategorySexMenu()
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex justify-between items-center transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-camel-100 text-camel-900 font-bold'
                          : 'hover:bg-om-100 text-char-700'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-camel-700 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </>,
          document.body
        )}

      {/* Портал выпадающего меню выбора пола в строке собаки */}
      {activeDogSexMenu && targetDogSexCat && targetDog &&
        createPortal(
          <>
            <div className="fixed inset-0 z-50" onClick={onCloseDogSexMenu} />
            <div
              data-portal-menu
              className="fixed z-50 w-32 bg-cream-50 rounded-xl border border-om-300 shadow-2xl p-1 text-xs ring-1 ring-char-900/10 animate-in fade-in zoom-in-95 duration-100"
              style={{
                top:
                  window.innerHeight - activeDogSexMenu.rect.bottom < 120
                    ? Math.max(10, activeDogSexMenu.rect.top - 110)
                    : activeDogSexMenu.rect.bottom + 4,
                left: Math.max(10, Math.min(activeDogSexMenu.rect.left, window.innerWidth - 140))
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-0.5 space-y-0.5">
                {dogSexOptions.map((opt) => {
                  const isSelected = targetDog.sex === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        updateDog(targetDogSexCat.id, targetDog.id, { sex: opt.value })
                        onCloseDogSexMenu()
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex justify-between items-center transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-camel-100 text-camel-900 font-bold'
                          : 'hover:bg-om-100 text-char-700'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-camel-700 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  )
}
