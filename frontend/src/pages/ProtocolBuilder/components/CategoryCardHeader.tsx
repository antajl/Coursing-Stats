import React from 'react'
import { Check, ChevronDown, Plus, Trash2 } from 'lucide-react'
import type { ActiveCategoryMenuState, CategoryGroup, CompetitionKind } from '../types'
import { ALL_KNOWN_BREEDS, CLASSES } from '../constants'

interface CategoryCardHeaderProps {
  category: CategoryGroup
  kind: CompetitionKind
  categoriesCount: number
  customBreedCatIds: Record<string, boolean>
  setCustomBreedCatIds: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  customClassCatIds: Record<string, boolean>
  setCustomClassCatIds: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  addDogToCategory: (categoryId: string) => void
  removeCategory: (categoryId: string) => void
  updateCategoryMeta: (categoryId: string, updates: Partial<CategoryGroup>) => void
  setCategoryRunsCount: (categoryId: string, count: 1 | 2 | 3) => void
  setActiveBreedMenu: (state: ActiveCategoryMenuState | null) => void
  setBreedSearch: (query: string) => void
  setActiveClassMenu: (state: ActiveCategoryMenuState | null) => void
  setActiveCategorySexMenu: (state: ActiveCategoryMenuState | null) => void
}

export const CategoryCardHeader: React.FC<CategoryCardHeaderProps> = ({
  category,
  kind,
  categoriesCount,
  customBreedCatIds,
  setCustomBreedCatIds,
  customClassCatIds,
  setCustomClassCatIds,
  addDogToCategory,
  removeCategory,
  updateCategoryMeta,
  setCategoryRunsCount,
  setActiveBreedMenu,
  setBreedSearch,
  setActiveClassMenu,
  setActiveCategorySexMenu,
}) => {
  return (
    <div className="bg-om-100/75 px-3.5 py-3 border-b border-om-200/80 rounded-t-2xl flex flex-wrap items-center justify-between gap-2.5">
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        {customBreedCatIds[category.id] ? (
          <div className="inline-flex items-center gap-1">
            <input
              type="text"
              value={category.breed}
              onChange={(e) => updateCategoryMeta(category.id, { breed: e.target.value })}
              className="min-h-[44px] sm:min-h-[36px] px-2.5 bg-white rounded-lg border border-om-300 text-xs font-bold text-charcoal-900 w-44 focus:ring-2 focus:ring-camel-500/40 focus:outline-none"
              placeholder="Название породы"
            />
            <button
              type="button"
              onClick={() => setCustomBreedCatIds((prev) => ({ ...prev, [category.id]: false }))}
              className="min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center text-charcoal-700 hover:text-charcoal-900 rounded-lg bg-white border border-om-200 hover:bg-om-100 cursor-pointer"
              title="Сохранить породу"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setActiveBreedMenu({
                catId: category.id,
                rect: {
                  top: rect.top,
                  bottom: rect.bottom,
                  left: rect.left,
                  right: rect.right,
                  width: rect.width,
                },
              })
              setBreedSearch('')
            }}
            className="min-h-[44px] sm:min-h-[36px] px-3 bg-white hover:bg-cream-100 rounded-lg border border-om-300/90 text-xs font-bold text-charcoal-900 max-w-[230px] flex items-center justify-between gap-1.5 transition-colors cursor-pointer"
            title="Выбрать породу"
          >
            <span className="truncate">{category.breed || ALL_KNOWN_BREEDS[0]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-charcoal-500 shrink-0" />
          </button>
        )}

        {customClassCatIds[category.id] ? (
          <div className="inline-flex items-center gap-1">
            <input
              type="text"
              value={category.className}
              onChange={(e) => updateCategoryMeta(category.id, { className: e.target.value })}
              className="min-h-[44px] sm:min-h-[36px] px-2.5 bg-white rounded-lg border border-om-300 text-xs font-semibold text-charcoal-900 w-36 focus:ring-2 focus:ring-camel-500/40 focus:outline-none"
              placeholder="Название класса"
            />
            <button
              type="button"
              onClick={() => setCustomClassCatIds((prev) => ({ ...prev, [category.id]: false }))}
              className="min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center text-charcoal-700 hover:text-charcoal-900 rounded-lg bg-white border border-om-200 hover:bg-om-100 cursor-pointer"
              title="Сохранить класс"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setActiveClassMenu({
                catId: category.id,
                rect: {
                  top: rect.top,
                  bottom: rect.bottom,
                  left: rect.left,
                  right: rect.right,
                  width: rect.width,
                },
              })
            }}
            className="min-h-[44px] sm:min-h-[36px] px-3 bg-white hover:bg-cream-100 rounded-lg border border-om-300/90 text-xs font-semibold text-charcoal-800 flex items-center justify-between gap-1.5 transition-colors cursor-pointer"
            title="Выбрать класс"
          >
            <span className="truncate">{category.className || CLASSES[0]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-charcoal-500 shrink-0" />
          </button>
        )}

        <button
          type="button"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            setActiveCategorySexMenu({
              catId: category.id,
              rect: {
                top: rect.top,
                bottom: rect.bottom,
                left: rect.left,
                right: rect.right,
                width: rect.width,
              },
            })
          }}
          className="min-h-[44px] sm:min-h-[36px] px-3 bg-white hover:bg-cream-100 rounded-lg border border-om-300/90 text-xs font-semibold text-charcoal-800 flex items-center justify-between gap-1.5 transition-colors cursor-pointer"
          title="Пол собак в категории"
        >
          <span>{category.sex === 'male' ? 'Кобели' : category.sex === 'female' ? 'Суки' : 'Микс'}</span>
          <ChevronDown className="w-3.5 h-3.5 text-charcoal-500 shrink-0" />
        </button>

        {kind === 'coursing' && (
          <div className="flex items-center gap-1 bg-om-200/60 p-1 rounded-lg border border-om-300/50 text-xs">
            <span className="text-charcoal-700 font-medium px-1.5 text-[11px]">Забегов:</span>
            {([1, 2, 3] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCategoryRunsCount(category.id, n)}
                className={`min-w-[36px] min-h-[36px] sm:min-w-[30px] sm:min-h-[28px] relative rounded-md font-semibold text-center transition-all cursor-pointer before:absolute before:-inset-1 sm:before:hidden ${
                  category.runsCount === n
                    ? 'bg-camel-600 text-white shadow-2xs'
                    : 'text-charcoal-700 hover:text-charcoal-950 bg-white/80'
                }`}
                title={n === 1 ? '1 забег' : `${n} забега`}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button
          type="button"
          onClick={() => addDogToCategory(category.id)}
          className="min-h-[44px] sm:min-h-[36px] flex items-center gap-1.5 px-3 bg-white hover:bg-cream-100 text-charcoal-900 border border-om-300 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 text-camel-700" />
          <span>Добавить собаку</span>
        </button>

        <button
          type="button"
          onClick={() => removeCategory(category.id)}
          disabled={categoriesCount <= 1}
          className="min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center text-charcoal-500 hover:text-terracotta-700 hover:bg-terracotta-50 rounded-lg transition-colors disabled:opacity-25 cursor-pointer"
          aria-label="Удалить категорию"
          title="Удалить всю категорию"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
