import React from 'react'
import { ChevronDown, Check, Layers } from 'lucide-react'
import { FCI_GROUPS } from '../../lib/fciGroups'
import { CORE_BREED_HUBS } from '../../lib/breed-hubs-data'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ModernDropdown from '../../components/ui/ModernDropdown'
import BreedSearchDropdown from '../../components/ui/BreedSearchDropdown'
import QuickBreedBar from '../TopDogs/QuickBreedBar'
import QuickGroupBar from './QuickGroupBar'
import { toolbarPillTriggerClass } from '../../lib/toolbar'

export interface BreedsToolbarProps {
  searchQuery: string
  setSearchQuery: (val: string) => void
  selectedGroup: string
  handleSelectGroup: (val: string) => void
  selectedBreed: string
  handleSelectBreed: (val: string) => void
  quickBreedBarValue: string
  groupCounts: Record<string, number>
  sortedGroupKeys: string[]
  mobileBreedList: string[]
  breedCandidates: Array<{ key: string; label: string; fullName: string; estWidth: number }>
  allBreedKeys: string[]
}

export const BreedsToolbar: React.FC<BreedsToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedGroup,
  handleSelectGroup,
  selectedBreed,
  handleSelectBreed,
  quickBreedBarValue,
  groupCounts,
  sortedGroupKeys,
  mobileBreedList,
  breedCandidates,
  allBreedKeys,
}) => {
  return (
    <>
      {/* 1. Мобильная панель фильтров: Поиск + Группа ▾ + Порода ▾ + Сброс */}
      <div className="flex items-center gap-1.5 w-full md:hidden py-1 overflow-x-auto no-scrollbar">
        {/* Поиск */}
        <div className="shrink-0">
          <ToolbarSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Поиск породы…"
          />
        </div>

        {/* Выпадающий список групп FCI */}
        <div className="shrink-0">
          <ModernDropdown
            trigger={
              <button
                type="button"
                className={toolbarPillTriggerClass(selectedGroup !== 'all', 'shrink-0')}
                aria-label="Выбрать группу пород"
              >
                <Layers className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
                <span className="truncate max-w-[95px] sm:max-w-[120px]">
                  {selectedGroup !== 'all'
                    ? (selectedGroup === '0' ? 'Спорт' : `FCI ${selectedGroup}`)
                    : 'Группы'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70 shrink-0" aria-hidden="true" />
              </button>
            }
            width="280px"
            closeOnScroll
            portal
          >
            {(close) => (
              <div className="p-1 space-y-0.5 text-xs" role="menu">
                {/* Все группы */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    handleSelectGroup('all')
                    close()
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                    selectedGroup === 'all'
                      ? 'bg-camel-100/90 text-camel-950 font-semibold'
                      : 'text-charcoal-700 hover:bg-cream-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>Все группы пород</span>
                    <span className="text-[10px] tabular-nums font-sans px-1.5 py-0.2 rounded-full bg-cream-100 text-charcoal-500">
                      {groupCounts['all'] || 82}
                    </span>
                  </div>
                  {selectedGroup === 'all' && <Check className="h-3.5 w-3.5 text-camel-700 shrink-0 ml-1.5" />}
                </button>

                {/* Список групп по порядку FCI */}
                {sortedGroupKeys.map((key) => {
                  const group = FCI_GROUPS[Number(key)]
                  const count = groupCounts[key] || 0
                  if (count === 0) return null
                  const isSelected = selectedGroup === key

                  return (
                    <button
                      key={key}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        handleSelectGroup(isSelected ? 'all' : key)
                        close()
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-camel-100/90 text-camel-950 font-semibold'
                          : 'text-charcoal-700 hover:bg-cream-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="truncate">{group.name}</span>
                        <span className="text-[10px] tabular-nums font-sans px-1.5 py-0.2 rounded-full bg-cream-100 text-charcoal-500 shrink-0">
                          {count}
                        </span>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-camel-700 shrink-0 ml-1.5" />}
                    </button>
                  )
                })}
              </div>
            )}
          </ModernDropdown>
        </div>

        {/* Выпадающий список пород */}
        <div className="shrink-0">
          <BreedSearchDropdown
            breeds={mobileBreedList}
            selectedBreed={quickBreedBarValue}
            onSelect={handleSelectBreed}
            trigger={
              <button
                type="button"
                className={toolbarPillTriggerClass(selectedBreed !== 'all', 'shrink-0')}
                aria-label="Выбрать породу"
              >
                <span className="truncate max-w-[95px] sm:max-w-[120px]">
                  {selectedBreed !== 'all'
                    ? (CORE_BREED_HUBS.find((b) => b.slug === selectedBreed || b.canonicalKey === selectedBreed)?.nameRu || 'Порода')
                    : 'Породы'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70 shrink-0" aria-hidden="true" />
              </button>
            }
          />
        </div>
      </div>

      {/* 2. Десктопный тулбар: две симметричные половины (ровно 50% / 50%) с центральным разделителем */}
      <div className="hidden md:block">
        <PageToolbar
          bare
          topRowClassName="w-full flex-nowrap"
          filters={
            <div className="flex items-center w-full min-w-0 py-2 -my-2 overflow-x-auto md:overflow-visible no-scrollbar">
              {/* Левая половина: ровно 50% ширины страницы (Поиск + Породы) */}
              <div className="flex-1 min-w-0 flex items-center gap-1.5 sm:gap-2">
                <div className="shrink-0">
                  <ToolbarSearch
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Поиск породы или код FCI…"
                  />
                </div>

                <div className="h-5 w-px bg-old-money-300/80 shrink-0 hidden sm:block" aria-hidden="true" />

                <div className="flex-1 min-w-0">
                  <QuickBreedBar
                    selectedBreed={quickBreedBarValue}
                    onSelectBreed={handleSelectBreed}
                    candidateBreeds={breedCandidates}
                    breedValues={allBreedKeys}
                    strictFilterByBreedValues={selectedGroup !== 'all'}
                    showHubLink={false}
                  />
                </div>
              </div>

              {/* Центральный разделитель: строго зафиксирован ровно по центру 50% */}
              <div className="h-5 w-px bg-old-money-300/80 shrink-0 mx-2 sm:mx-2.5 hidden md:block" aria-hidden="true" />

              {/* Правая половина: ровно 50% ширины страницы (Группы + Сброс) */}
              <div className="flex-1 min-w-0 flex items-center gap-1.5 sm:gap-2">
                <div className="flex-1 min-w-0">
                  <QuickGroupBar
                    value={selectedGroup}
                    onChange={handleSelectGroup}
                    counts={groupCounts}
                  />
                </div>
              </div>
            </div>
          }
        />
      </div>
    </>
  )
}
export default BreedsToolbar
