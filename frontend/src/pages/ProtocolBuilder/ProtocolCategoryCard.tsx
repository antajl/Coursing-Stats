import React from 'react'
import { Plus, Trash2, Check, ChevronDown } from 'lucide-react'
import type {
  CategoryGroup,
  DogParticipant,
  CompetitionKind,
  CoursingScores,
  RunStatus,
  ActiveRunMenuState,
  ActiveSearchDogState,
  ActiveAwardsMenuState,
  ActiveCategoryMenuState,
  ActiveDogSexMenuState
} from './types'
import { ProtocolParticipantRow } from './ProtocolParticipantRow'
import { ALL_KNOWN_BREEDS, CLASSES } from './constants'

interface ProtocolCategoryCardProps {
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
  // Props for participant row
  updateDog: (categoryId: string, dogId: string, updates: Partial<DogParticipant>) => void
  removeDogFromCategory: (categoryId: string, dogId: string) => void
  updateRunField: (
    categoryId: string,
    dogId: string,
    runIndex: number,
    field: 'heat' | 'blanket',
    value: string
  ) => void
  cycleBlanket: (categoryId: string, dogId: string, runIndex: number) => void
  updateRunScore: (
    categoryId: string,
    dogId: string,
    runIndex: number,
    criterion: keyof CoursingScores,
    value: string
  ) => void
  setRunStatus: (
    categoryId: string,
    dogId: string,
    runIndex: number,
    status: RunStatus,
    reason?: string
  ) => void
  updateRunReason: (
    categoryId: string,
    dogId: string,
    runIndex: number,
    reason: string
  ) => void
  activeAwardsMenu: ActiveAwardsMenuState | null
  setActiveAwardsMenu: (state: ActiveAwardsMenuState | null) => void
  activeSearchDog: ActiveSearchDogState | null
  setActiveSearchDog: (state: ActiveSearchDogState | null) => void
  setSearchQuery: (query: string) => void
  activeRunMenu: ActiveRunMenuState | null
  setActiveRunMenu: (state: ActiveRunMenuState | null) => void
  setActiveDogSexMenu: (state: ActiveDogSexMenuState | null) => void
}

export const ProtocolCategoryCard: React.FC<ProtocolCategoryCardProps> = ({
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
  updateDog,
  removeDogFromCategory,
  updateRunField,
  cycleBlanket,
  updateRunScore,
  setRunStatus,
  updateRunReason,
  activeAwardsMenu,
  setActiveAwardsMenu,
  activeSearchDog,
  setActiveSearchDog,
  setSearchQuery,
  activeRunMenu,
  setActiveRunMenu,
  setActiveDogSexMenu
}) => {
  const isCategoryActive = (category.dogs || []).some(
    d => d.id === activeAwardsMenu?.dogId || d.id === activeSearchDog?.dogId || activeRunMenu?.dogId === d.id
  )

  const sortedCategoryDogs = [...(category.dogs || [])].sort((a, b) => {
    const aAbsent = (a.runs || []).slice(0, category.runsCount).some(r => r?.status === 'absent')
    const bAbsent = (b.runs || []).slice(0, category.runsCount).some(r => r?.status === 'absent')
    return (aAbsent ? 1 : 0) - (bAbsent ? 1 : 0)
  })

  return (
    <div
      className={`bg-cream-50/95 rounded-xl border border-om-200 shadow-xs ${
        isCategoryActive ? 'relative z-20' : 'relative z-0'
      }`}
    >
      {/* Шапка категории: Порода, Класс, Пол + Управление количеством забегов (1, 2, 3) */}
      <div className="bg-om-100/70 px-3 py-2.5 border-b border-om-200/80 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-camel-800 uppercase tracking-wider">
            Категория:
          </span>

          {/* Выбор породы */}
          {customBreedCatIds[category.id] ? (
            <div className="inline-flex items-center gap-1">
              <input
                type="text"
                value={category.breed}
                onChange={e => updateCategoryMeta(category.id, { breed: e.target.value })}
                className="px-2 py-0.5 bg-cream-50 rounded border border-om-200 text-xs font-bold text-char-900 w-44 focus:ring-1 focus:ring-camel-500 focus:outline-none"
                placeholder="Название породы"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setCustomBreedCatIds(prev => ({ ...prev, [category.id]: false }))}
                className="p-1 text-char-500 hover:text-char-900 rounded hover:bg-om-200/50"
                title="Готово (сохранить породу)"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect()
                setActiveBreedMenu({
                  catId: category.id,
                  rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width }
                })
                setBreedSearch('')
              }}
              className="px-2 py-0.5 bg-cream-50 hover:bg-cream-100 rounded border border-om-200 text-xs font-bold text-char-900 max-w-[210px] flex items-center justify-between gap-1.5 transition-colors cursor-pointer"
              title="Выбрать породу"
            >
              <span className="truncate">{category.breed || ALL_KNOWN_BREEDS[0]}</span>
              <ChevronDown className="w-3 h-3 text-char-400 shrink-0" />
            </button>
          )}

          {/* Выбор класса */}
          {customClassCatIds[category.id] ? (
            <div className="inline-flex items-center gap-1">
              <input
                type="text"
                value={category.className}
                onChange={e => updateCategoryMeta(category.id, { className: e.target.value })}
                className="px-2 py-0.5 bg-cream-50 rounded border border-om-200 text-xs font-semibold text-char-800 w-36 focus:ring-1 focus:ring-camel-500 focus:outline-none"
                placeholder="Название класса"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setCustomClassCatIds(prev => ({ ...prev, [category.id]: false }))}
                className="p-1 text-char-500 hover:text-char-900 rounded hover:bg-om-200/50"
                title="Готово (сохранить класс)"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect()
                setActiveClassMenu({
                  catId: category.id,
                  rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width }
                })
              }}
              className="px-2 py-0.5 bg-cream-50 hover:bg-cream-100 rounded border border-om-200 text-xs font-semibold text-char-800 flex items-center justify-between gap-1.5 transition-colors cursor-pointer"
              title="Выбрать класс"
            >
              <span className="truncate">{category.className || CLASSES[0]}</span>
              <ChevronDown className="w-3 h-3 text-char-400 shrink-0" />
            </button>
          )}

          {/* Выбор пола категории */}
          <button
            type="button"
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect()
              setActiveCategorySexMenu({
                catId: category.id,
                rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width }
              })
            }}
            className="px-2 py-0.5 bg-cream-50 hover:bg-cream-100 rounded border border-om-200 text-xs font-semibold text-char-800 flex items-center justify-between gap-1.5 transition-colors cursor-pointer"
            title="Пол собак в категории"
          >
            <span>{category.sex === 'male' ? 'Кобели' : category.sex === 'female' ? 'Суки' : 'Микс'}</span>
            <ChevronDown className="w-3 h-3 text-char-400 shrink-0" />
          </button>

          {/* Переключатель количества забегов: 1, 2, 3 */}
          {kind === 'coursing' && (
            <div className="flex items-center gap-1 ml-2 bg-om-200/50 p-0.5 rounded border border-om-300/40 text-[10px]">
              <span className="text-char-500 font-medium px-1">Забегов:</span>
              {([1, 2, 3] as const).map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCategoryRunsCount(category.id, n)}
                  className={`w-6 py-0.5 rounded font-bold text-center transition-all ${
                    category.runsCount === n
                      ? 'bg-camel-600 text-white shadow-2xs'
                      : 'text-char-600 hover:text-char-900 bg-cream-50/70'
                  }`}
                  title={n === 1 ? '1 забег' : `${n} забега`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => addDogToCategory(category.id)}
            className="flex items-center gap-1 px-2.5 py-1 bg-cream-50 hover:bg-cream-100 text-char-800 border border-om-200 rounded text-xs font-medium transition-all"
          >
            <Plus className="w-3 h-3 text-camel-600" />
            Добавить собаку
          </button>

          <button
            onClick={() => removeCategory(category.id)}
            disabled={categoriesCount <= 1}
            className="p-1 text-char-400 hover:text-terracotta-600 transition-colors disabled:opacity-30"
            title="Удалить всю категорию"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Список собак в категории */}
      <div className="p-2 space-y-1.5 overflow-x-auto">
        <div className="text-[10px] text-char-400 font-medium pb-1 md:hidden">
          Прокручивайте строку вправо для ввода баллов и титулов &rarr;
        </div>
        {/* Заголовок колонок для выравнивания */}
        <div className="flex items-center gap-3 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-char-400 select-none min-w-max border-b border-om-200/50 mb-1">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-9 text-center shrink-0">№</span>
            <span className="w-56 sm:w-60 md:w-64 lg:w-72 px-2 text-left shrink-0">Кличка собаки</span>
            <span className="w-[92px] text-center shrink-0">Пол</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {kind === 'coursing' ? (
              Array.from({ length: category.runsCount }).map((_, r) => (
                <span
                  key={r}
                  className="text-center font-bold text-camel-800 shrink-0"
                  style={{ width: category.runsCount === 3 ? 236 : category.runsCount === 1 ? 300 : 264 }}
                >
                  {r + 1} Забег
                </span>
              ))
            ) : (
              <span className="text-center font-bold text-camel-800 shrink-0" style={{ width: 264 }}>
                Заезды (Бокс / 1 / 2 / Финал)
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <span className="w-20 text-center shrink-0">Итог</span>
            <span className="w-28 text-center shrink-0">Титулы</span>
            <span className="w-7 shrink-0" />
          </div>
        </div>

        {sortedCategoryDogs.map(dog => (
          <ProtocolParticipantRow
            key={dog.id}
            dog={dog}
            category={category}
            kind={kind}
            updateDog={updateDog}
            removeDogFromCategory={removeDogFromCategory}
            updateRunField={updateRunField}
            cycleBlanket={cycleBlanket}
            updateRunScore={updateRunScore}
            setRunStatus={setRunStatus}
            updateRunReason={updateRunReason}
            activeAwardsMenu={activeAwardsMenu}
            setActiveAwardsMenu={setActiveAwardsMenu}
            activeSearchDog={activeSearchDog}
            setActiveSearchDog={setActiveSearchDog}
            setSearchQuery={setSearchQuery}
            activeRunMenu={activeRunMenu}
            setActiveRunMenu={setActiveRunMenu}
            setActiveDogSexMenu={setActiveDogSexMenu}
          />
        ))}
      </div>
    </div>
  )
}
