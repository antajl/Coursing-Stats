import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import YearDropdown from '../../components/ui/YearDropdown'
import BreedSearchDropdown from '../../components/ui/BreedSearchDropdown'
import type { DogsIndexEntry } from '../../lib/competingBreeds'
import QuickBreedBar, { SHOW_CANDIDATE_BREEDS } from '../TopDogs/QuickBreedBar'
import ShowJudgesRatingHint from './ShowJudgesRatingHint'
import ShowJudgeGradeScopeDropdown from './ShowJudgeGradeScopeDropdown'
import { toolbarPillTriggerClass } from '../../lib/toolbar'
import { formatBreedName } from '../../lib/breedMapping'
import type { GradeScope } from '../../components/ShowJudgeCard'

export interface ShowJudgesToolbarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterYear: string
  setFilterYear: (year: string) => void
  showYears: readonly string[]
  isYearNonDefault: boolean
  availableBreeds: string[]
  filterBreed: string
  onSelectBreed: (breed: string) => void
  dogIndex?: DogsIndexEntry[]
  gradeScope: GradeScope
  onGradeScopeChange: (scope: GradeScope) => void
  onResetFilters?: () => void
}

export function ShowJudgesToolbar({
  searchQuery,
  setSearchQuery,
  filterYear,
  setFilterYear,
  showYears,
  isYearNonDefault: _isYearNonDefault,
  availableBreeds,
  filterBreed,
  onSelectBreed,
  gradeScope,
  onGradeScopeChange,
  dogIndex,
  onResetFilters: _onResetFilters,
}: ShowJudgesToolbarProps) {
  const [mobileYearOpen, setMobileYearOpen] = useState(false)

  return (
    <PageToolbar
      bare
      topRowClassName="flex-nowrap"
      filters={
        <div className="w-full min-w-0">
          {/* Мобильная компактная строка (32px): Поиск + Год + Классы + Порода + Сброс */}
          <div className="flex sm:hidden items-center gap-1.5 w-full min-w-0 overflow-x-auto no-scrollbar py-0.5">
            <ToolbarSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Фамилия…"
            />

            {/* Year Dropdown */}
            <YearDropdown
              years={showYears as string[]}
              selectedYear={filterYear}
              onSelectYear={setFilterYear}
              isOpen={mobileYearOpen}
              onOpenChange={setMobileYearOpen}
            />

            {/* Grade Scope Dropdown */}
            <ShowJudgeGradeScopeDropdown
              gradeScope={gradeScope}
              onGradeScopeChange={onGradeScopeChange}
            />

            {/* Breed Dropdown */}
            <BreedSearchDropdown
              breeds={availableBreeds}
              dogIndex={dogIndex}
              selectedBreed={filterBreed}
              onSelect={onSelectBreed}
              trigger={
                <button
                  type="button"
                  className={`shrink-0 ${toolbarPillTriggerClass(Boolean(filterBreed))}`}
                >
                  <span className="truncate max-w-[120px]">
                    {filterBreed ? formatBreedName(filterBreed) : 'Порода'}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70 transition-transform" aria-hidden />
                </button>
              }
            />

            {/* Reset Filters and Info button on mobile */}
            <div className="ml-auto shrink-0 flex items-center gap-1.5">

              <ShowJudgesRatingHint compact />
            </div>
          </div>

          {/* Десктопная строка: Поиск + Год + Классы + О судействе + Сброс + Разделитель | + QuickBreedBar edge-to-edge */}
          <div className="hidden sm:flex sm:items-center gap-2 w-full min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <ToolbarSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Фамилия судьи…"
              />
              {/* Year Dropdown */}
              <YearDropdown
                years={showYears as string[]}
                selectedYear={filterYear}
                onSelectYear={setFilterYear}
              />

              {/* Grade Scope Dropdown */}
              <ShowJudgeGradeScopeDropdown
                gradeScope={gradeScope}
                onGradeScopeChange={onGradeScopeChange}
              />

              {/* Info button */}
              <ShowJudgesRatingHint />


            </div>

            {/* Разделитель между левыми контролами и породами */}
            <div
              className="h-5 w-px bg-old-money-300 shrink-0 mx-0.5"
              aria-hidden="true"
            />

            {/* Выбор породы QuickBreedBar — всегда самая правая часть фильтра до края страницы */}
            <div className="flex-1 min-w-0">
              <QuickBreedBar
                selectedBreed={filterBreed}
                onSelectBreed={onSelectBreed}
                breedValues={availableBreeds}
                dogIndex={dogIndex}
                candidateBreeds={SHOW_CANDIDATE_BREEDS}
              />
            </div>
          </div>
        </div>
      }
    />
  )
}
