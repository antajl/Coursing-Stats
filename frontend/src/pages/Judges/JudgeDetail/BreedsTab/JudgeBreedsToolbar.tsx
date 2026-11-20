import React from 'react'
import { ChevronDown, X } from 'lucide-react'
import ToolbarSearch from '../../../../components/toolbar/ToolbarSearch'
import BreedSearchDropdown from '../../../../components/ui/BreedSearchDropdown'
import { formatBreedSentenceCase } from '../../../../lib/breedMapping'
import { toolbarPillTriggerClass } from '../../../../lib/toolbar'
import { handleSortToggle, type SortState } from '../../../../lib/judgeSortUtils'

export interface JudgeBreedsToolbarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  allBreedNames: string[]
  selectedBreed: string
  handleSelectBreed: (breed: string) => void
  breedSort: SortState
  setBreedSort: (sort: SortState) => void
}

export const JudgeBreedsToolbar: React.FC<JudgeBreedsToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  allBreedNames,
  selectedBreed,
  handleSelectBreed,
  breedSort,
  setBreedSort,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 justify-between w-full min-w-0">
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <ToolbarSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Поиск по породе или кличке..."
        />

        <div className="shrink-0 flex items-center gap-1">
          <BreedSearchDropdown
            breeds={allBreedNames}
            selectedBreed={selectedBreed}
            onSelect={handleSelectBreed}
            trigger={
              <button
                type="button"
                className={`shrink-0 ${toolbarPillTriggerClass(Boolean(selectedBreed))} cursor-pointer`}
                title="Фильтр по породе"
              >
                <span className="truncate max-w-[120px] sm:max-w-[160px]">
                  {selectedBreed ? formatBreedSentenceCase(selectedBreed) : 'Все породы'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              </button>
            }
          />

          {selectedBreed && (
            <button
              type="button"
              onClick={() => handleSelectBreed('')}
              className="cs-glass-pill shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full !text-charcoal-500 hover:!text-charcoal-800 transition-colors cursor-pointer"
              title="Сбросить фильтр по породе"
              aria-label="Сбросить фильтр по породе"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Sort Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs w-full sm:w-auto shrink-0">
        <span className="text-charcoal-400 mr-1 hidden sm:inline shrink-0">Сортировка:</span>
        <button
          type="button"
          onClick={() => setBreedSort(handleSortToggle('evaluations_count', breedSort))}
          className={`shrink-0 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 font-medium transition-colors cursor-pointer ${
            breedSort.field === 'evaluations_count'
              ? 'bg-camel-100 text-camel-900 font-semibold shadow-2xs'
              : 'border border-old-money-200 bg-white text-charcoal-600 hover:bg-cream-50'
          }`}
        >
          Забеги {breedSort.field === 'evaluations_count' ? (breedSort.direction === 'desc' ? '↓' : '↑') : ''}
        </button>
        <button
          type="button"
          onClick={() => setBreedSort(handleSortToggle('avg_score', breedSort))}
          className={`shrink-0 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 font-medium transition-colors cursor-pointer ${
            breedSort.field === 'avg_score'
              ? 'bg-camel-100 text-camel-900 font-semibold shadow-2xs'
              : 'border border-old-money-200 bg-white text-charcoal-600 hover:bg-cream-50'
          }`}
        >
          Ср. балл {breedSort.field === 'avg_score' ? (breedSort.direction === 'desc' ? '↓' : '↑') : ''}
        </button>
        <button
          type="button"
          onClick={() => setBreedSort(handleSortToggle('breed', breedSort))}
          className={`shrink-0 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 font-medium transition-colors cursor-pointer ${
            breedSort.field === 'breed'
              ? 'bg-camel-100 text-camel-900 font-semibold shadow-2xs'
              : 'border border-old-money-200 bg-white text-charcoal-600 hover:bg-cream-50'
          }`}
        >
          Порода {breedSort.field === 'breed' ? (breedSort.direction === 'desc' ? '↓' : '↑') : ''}
        </button>
      </div>
    </div>
  )
}
export default JudgeBreedsToolbar
