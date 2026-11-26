import React from 'react'
import { ChevronDown } from 'lucide-react'
import { CORE_BREED_HUBS } from '../../lib/breed-hubs-data'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import BreedSearchDropdown from '../../components/ui/BreedSearchDropdown'
import QuickBreedBar from '../TopDogs/QuickBreedBar'
import FciGroupDropdown from './FciGroupDropdown'
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
      {/* 1. Мобильная панель фильтров: Поиск + Группа FCI ▾ + Порода ▾ */}
      <div className="flex items-center gap-1.5 w-full md:hidden py-1.5 overflow-x-auto no-scrollbar">
        {/* Поиск */}
        <div className="shrink-0">
          <ToolbarSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Поиск породы…"
          />
        </div>

        {/* Выпадающий список групп FCI сразу после поиска */}
        <div className="shrink-0">
          <FciGroupDropdown
            selectedGroup={selectedGroup}
            onSelectGroup={handleSelectGroup}
            groupCounts={groupCounts}
            sortedGroupKeys={sortedGroupKeys}
          />
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

      {/* 2. Десктопный тулбар: Поиск + Группа FCI ▾ сразу после поиска + Разделитель + QuickBreedBar (Породы) */}
      <div className="hidden md:block">
        <PageToolbar
          bare
          topRowClassName="w-full flex-nowrap"
          filters={
            <div className="flex items-center w-full min-w-0 py-2 -my-2">
              {/* 1. Поиск */}
              <div className="shrink-0">
                <ToolbarSearch
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Поиск породы или код FCI…"
                />
              </div>

              {/* 2. Выпадающий список групп FCI сразу после поиска */}
              <div className="shrink-0 ml-1.5 sm:ml-2">
                <FciGroupDropdown
                  selectedGroup={selectedGroup}
                  onSelectGroup={handleSelectGroup}
                  groupCounts={groupCounts}
                  sortedGroupKeys={sortedGroupKeys}
                />
              </div>

              {/* Разделитель */}
              <div className="h-5 w-px bg-old-money-300/80 shrink-0 mx-2.5 sm:mx-3 hidden sm:block" aria-hidden="true" />

              {/* 3. Породы (QuickBreedBar) следуют после и занимают всё свободное место */}
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
          }
        />
      </div>
    </>
  )
}

export default BreedsToolbar
