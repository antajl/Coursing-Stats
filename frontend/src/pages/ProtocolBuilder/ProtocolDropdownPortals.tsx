import React from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Check,
  Ban,
  Clock,
  Search,
  Plus
} from 'lucide-react'
import type {
  CategoryGroup,
  DogParticipant,
  RunStatus,
  ActiveRunMenuState,
  ActiveSearchDogState,
  ActiveAwardsMenuState,
  ActiveCategoryMenuState,
  ActiveDogSexMenuState
} from './types'
import {
  BREED_GROUPS,
  CLASSES,
  TITLES_LIST,
  type ExistingDog
} from './constants'
import DogSexIcon from '../../components/DogSexIcon'

export interface ProtocolDropdownPortalsProps {
  categories: CategoryGroup[]
  activeRunMenu: ActiveRunMenuState | null
  setActiveRunMenu: (val: ActiveRunMenuState | null) => void
  setRunStatus: (catId: string, dogId: string, rIdx: number, status: RunStatus, reason?: string) => void
  activeSearchDog: ActiveSearchDogState | null
  setActiveSearchDog: (val: ActiveSearchDogState | null) => void
  filteredExistingDogs: ExistingDog[]
  selectExistingDog: (catId: string, dogId: string, exDog: ExistingDog) => void
  activeAwardsMenu: ActiveAwardsMenuState | null
  setActiveAwardsMenu: (val: ActiveAwardsMenuState | null) => void
  toggleAward: (catId: string, dogId: string, title: string) => void
  activeBreedMenu: ActiveCategoryMenuState | null
  setActiveBreedMenu: (val: ActiveCategoryMenuState | null) => void
  breedSearch: string
  setBreedSearch: (val: string) => void
  updateCategoryMeta: (catId: string, updates: Partial<CategoryGroup>) => void
  setCustomBreedCatIds: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  activeClassMenu: ActiveCategoryMenuState | null
  setActiveClassMenu: (val: ActiveCategoryMenuState | null) => void
  setCustomClassCatIds: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  activeCategorySexMenu: ActiveCategoryMenuState | null
  setActiveCategorySexMenu: (val: ActiveCategoryMenuState | null) => void
  activeDogSexMenu: ActiveDogSexMenuState | null
  setActiveDogSexMenu: (val: ActiveDogSexMenuState | null) => void
  updateDog: (catId: string, dogId: string, updates: Partial<DogParticipant>) => void
}

export const ProtocolDropdownPortals: React.FC<ProtocolDropdownPortalsProps> = ({
  categories,
  activeRunMenu,
  setActiveRunMenu,
  setRunStatus,
  activeSearchDog,
  setActiveSearchDog,
  filteredExistingDogs,
  selectExistingDog,
  activeAwardsMenu,
  setActiveAwardsMenu,
  toggleAward,
  activeBreedMenu,
  setActiveBreedMenu,
  breedSearch,
  setBreedSearch,
  updateCategoryMeta,
  setCustomBreedCatIds,
  activeClassMenu,
  setActiveClassMenu,
  setCustomClassCatIds,
  activeCategorySexMenu,
  setActiveCategorySexMenu,
  activeDogSexMenu,
  setActiveDogSexMenu,
  updateDog
}) => {
  if (typeof document === 'undefined') return null

  return (
    <>
      {/* Портал выпадающего меню статуса забега */}
      {activeRunMenu &&
        createPortal(
          <>
            <div className="fixed inset-0 z-50" onClick={() => setActiveRunMenu(null)} />
            <div
              data-portal-menu
              className="fixed z-50 w-52 bg-cream-50 rounded-xl border border-om-300 shadow-2xl p-1 text-xs ring-1 ring-char-900/10 animate-in fade-in zoom-in-95 duration-100"
              style={{
                top:
                  window.innerHeight - activeRunMenu.rect.bottom < 130
                    ? Math.max(10, activeRunMenu.rect.top - 110)
                    : activeRunMenu.rect.bottom + 4,
                left: Math.max(10, Math.min(activeRunMenu.rect.right - 208, window.innerWidth - 220))
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-2.5 py-1 text-[10px] font-bold text-camel-800 uppercase tracking-wider border-b border-om-200/70 mb-1 flex items-center justify-between">
                <span>Статус забега</span>
                <button
                  type="button"
                  onClick={() => setActiveRunMenu(null)}
                  className="text-char-400 hover:text-char-700 p-0.5 rounded focus:outline-none cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {(() => {
                const activeCat = categories.find((c) => c.id === activeRunMenu.catId)
                const activeDog = activeCat?.dogs.find((d) => d.id === activeRunMenu.dogId)
                const currentRunStatus = activeDog?.runs[activeRunMenu.rIdx]?.status || 'normal'

                return (
                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setRunStatus(activeRunMenu.catId, activeRunMenu.dogId, activeRunMenu.rIdx, 'normal')
                        setActiveRunMenu(null)
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium flex items-center justify-between transition-colors cursor-pointer text-xs ${
                        currentRunStatus === 'normal'
                          ? 'bg-camel-100/70 text-camel-900'
                          : 'hover:bg-om-100 text-char-800'
                      }`}
                    >
                      <div>
                        <div className="font-semibold leading-tight">Оценки (баллы)</div>
                        <div className="text-[10px] text-char-400 font-normal">Баллы по 5 критериям</div>
                      </div>
                      {currentRunStatus === 'normal' && (
                        <Check className="w-3.5 h-3.5 text-camel-700 shrink-0" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRunStatus(activeRunMenu.catId, activeRunMenu.dogId, activeRunMenu.rIdx, 'withdrawn')
                        setActiveRunMenu(null)
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium flex items-center justify-between transition-colors cursor-pointer text-xs ${
                        currentRunStatus === 'withdrawn'
                          ? 'bg-terracotta-100/70 text-terracotta-900'
                          : 'hover:bg-terracotta-50 text-terracotta-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Ban className="w-3.5 h-3.5 text-terracotta-600 shrink-0" />
                        <div>
                          <div className="font-semibold leading-tight">Дисквалификация</div>
                          <div className="text-[10px] text-char-400 font-normal">Собака снята с забега</div>
                        </div>
                      </div>
                      {currentRunStatus === 'withdrawn' && (
                        <Check className="w-3.5 h-3.5 text-terracotta-700 shrink-0" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRunStatus(activeRunMenu.catId, activeRunMenu.dogId, activeRunMenu.rIdx, 'absent')
                        setActiveRunMenu(null)
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium flex items-center justify-between transition-colors cursor-pointer text-xs ${
                        currentRunStatus === 'absent'
                          ? 'bg-om-200/80 text-char-900'
                          : 'hover:bg-om-100 text-char-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-3.5 h-3.5 text-char-400 shrink-0" />
                        <div>
                          <div className="font-semibold leading-tight">Неявка</div>
                          <div className="text-[10px] text-char-400 font-normal">Не явилась на старт</div>
                        </div>
                      </div>
                      {currentRunStatus === 'absent' && (
                        <Check className="w-3.5 h-3.5 text-char-700 shrink-0" />
                      )}
                    </button>
                  </div>
                )
              })()}
            </div>
          </>,
          document.body
        )}

      {/* Портал автокомплита клички собаки из базы сайта */}
      {activeSearchDog &&
        filteredExistingDogs.length > 0 &&
        createPortal(
          <>
            <div className="fixed inset-0 z-50" onClick={() => setActiveSearchDog(null)} />
            <div
              data-portal-menu
              className="fixed z-50 bg-cream-50 rounded-xl border border-om-300 shadow-2xl py-1 divide-y divide-om-100 max-h-56 overflow-y-auto ring-1 ring-char-900/10 text-xs animate-in fade-in zoom-in-95 duration-100"
              style={{
                top:
                  window.innerHeight - activeSearchDog.rect.bottom < 180
                    ? Math.max(10, activeSearchDog.rect.top - 180)
                    : activeSearchDog.rect.bottom + 4,
                left: Math.max(10, Math.min(window.innerWidth - 300, activeSearchDog.rect.left)),
                width: Math.max(280, activeSearchDog.rect.width)
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-2.5 py-1 text-[9px] font-bold text-camel-800 uppercase tracking-wider bg-om-100/90 flex justify-between items-center sticky top-0 z-10 backdrop-blur-xs border-b border-om-200/60">
                <span>Собаки из базы сайта</span>
                <button
                  type="button"
                  onClick={() => setActiveSearchDog(null)}
                  className="text-char-400 hover:text-char-800 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
              {filteredExistingDogs.map((exDog, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectExistingDog(activeSearchDog.catId, activeSearchDog.dogId, exDog)}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-camel-100/70 text-xs flex justify-between items-center transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-char-900 truncate">{exDog.name}</span>
                  <div className="flex items-center gap-1.5 ml-2 shrink-0">
                    <span className="text-[10px] text-char-400">{exDog.breed}</span>
                    {exDog.sex && <DogSexIcon sex={exDog.sex} size={11} className="inline-block" />}
                  </div>
                </button>
              ))}
            </div>
          </>,
          document.body
        )}

      {/* Портал выпадающего меню выбора титулов */}
      {activeAwardsMenu &&
        (() => {
          const targetCat = categories.find((c) => c.id === activeAwardsMenu.catId)
          const targetDog = targetCat?.dogs.find((d) => d.id === activeAwardsMenu.dogId)
          if (!targetDog) return null

          return createPortal(
            <>
              <div className="fixed inset-0 z-50" onClick={() => setActiveAwardsMenu(null)} />
              <div
                data-portal-menu
                className="fixed z-50 w-52 bg-cream-50 rounded-xl border border-om-300 shadow-2xl p-1 text-xs ring-1 ring-char-900/10 animate-in fade-in zoom-in-95 duration-100"
                style={{
                  top:
                    window.innerHeight - activeAwardsMenu.rect.bottom < 240
                      ? Math.max(10, activeAwardsMenu.rect.top - 230)
                      : activeAwardsMenu.rect.bottom + 4,
                  left: Math.max(10, Math.min(activeAwardsMenu.rect.right - 208, window.innerWidth - 220))
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2.5 py-1 text-[10px] font-bold text-camel-800 uppercase tracking-wider border-b border-om-200/70 mb-1 flex items-center justify-between">
                  <span>Выбор титулов</span>
                  <button
                    type="button"
                    onClick={() => setActiveAwardsMenu(null)}
                    className="text-char-400 hover:text-char-700 p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="p-0.5 space-y-0.5 max-h-56 overflow-y-auto">
                  {TITLES_LIST.map((title) => {
                    const active = (targetDog.awards || []).includes(title)
                    return (
                      <button
                        key={title}
                        type="button"
                        onClick={() => toggleAward(activeAwardsMenu.catId, activeAwardsMenu.dogId, title)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex justify-between items-center transition-colors cursor-pointer ${
                          active
                            ? 'bg-camel-100 text-camel-900 font-bold'
                            : 'hover:bg-om-100 text-char-700'
                        }`}
                      >
                        <span>{title}</span>
                        {active && <Check className="w-3.5 h-3.5 text-camel-700 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>,
            document.body
          )
        })()}

      {/* Портал выпадающего меню выбора породы */}
      {activeBreedMenu &&
        (() => {
          const cat = categories.find((c) => c.id === activeBreedMenu.catId)
          if (!cat) return null

          const query = breedSearch.toLowerCase().trim()
          const filteredGroups = BREED_GROUPS.map((group) => ({
            ...group,
            breeds: group.breeds.filter((b) => !query || b.toLowerCase().includes(query))
          })).filter((g) => g.breeds.length > 0)

          return createPortal(
            <>
              <div className="fixed inset-0 z-50" onClick={() => setActiveBreedMenu(null)} />
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
                    onClick={() => setActiveBreedMenu(null)}
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
                              setActiveBreedMenu(null)
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
                        setActiveBreedMenu(null)
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
        })()}

      {/* Портал выпадающего меню выбора класса */}
      {activeClassMenu &&
        (() => {
          const cat = categories.find((c) => c.id === activeClassMenu.catId)
          if (!cat) return null

          return createPortal(
            <>
              <div className="fixed inset-0 z-50" onClick={() => setActiveClassMenu(null)} />
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
                    onClick={() => setActiveClassMenu(null)}
                    className="text-char-400 hover:text-char-700 p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="p-0.5 space-y-0.5 max-h-56 overflow-y-auto">
                  {CLASSES.map((c) => {
                    const isSelected = cat.className === c
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          updateCategoryMeta(cat.id, { className: c })
                          setActiveClassMenu(null)
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
                  {!CLASSES.includes(cat.className) && cat.className && (
                    <button
                      type="button"
                      onClick={() => setActiveClassMenu(null)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex justify-between items-center bg-camel-100 text-camel-900 font-bold"
                    >
                      <span>{cat.className}</span>
                      <Check className="w-3.5 h-3.5 text-camel-700 shrink-0" />
                    </button>
                  )}
                  <div className="pt-1 mt-1 border-t border-om-200/70">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomClassCatIds((prev) => ({ ...prev, [cat.id]: true }))
                        setActiveClassMenu(null)
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
          )
        })()}

      {/* Портал выпадающего меню выбора пола в категории */}
      {activeCategorySexMenu &&
        (() => {
          const cat = categories.find((c) => c.id === activeCategorySexMenu.catId)
          if (!cat) return null

          const sexOptions: Array<{ value: 'male' | 'female' | 'mixed'; label: string }> = [
            { value: 'male', label: 'Кобели' },
            { value: 'female', label: 'Суки' },
            { value: 'mixed', label: 'Микс' }
          ]

          return createPortal(
            <>
              <div className="fixed inset-0 z-50" onClick={() => setActiveCategorySexMenu(null)} />
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
                  {sexOptions.map((opt) => {
                    const isSelected = cat.sex === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          updateCategoryMeta(cat.id, { sex: opt.value })
                          setActiveCategorySexMenu(null)
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
          )
        })()}

      {/* Портал выпадающего меню выбора пола в строке собаки */}
      {activeDogSexMenu &&
        (() => {
          const cat = categories.find((c) => c.id === activeDogSexMenu.catId)
          const dog = cat?.dogs.find((d) => d.id === activeDogSexMenu.dogId)
          if (!cat || !dog) return null

          const sexOptions: Array<{ value: 'male' | 'female'; label: string }> = [
            { value: 'male', label: 'Кобель' },
            { value: 'female', label: 'Сука' }
          ]

          return createPortal(
            <>
              <div className="fixed inset-0 z-50" onClick={() => setActiveDogSexMenu(null)} />
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
                  {sexOptions.map((opt) => {
                    const isSelected = dog.sex === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          updateDog(cat.id, dog.id, { sex: opt.value })
                          setActiveDogSexMenu(null)
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
          )
        })()}
    </>
  )
}
