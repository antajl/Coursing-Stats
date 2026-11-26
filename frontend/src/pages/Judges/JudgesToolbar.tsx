import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ModernDropdown from '../../components/ui/ModernDropdown'
import YearDropdown from '../../components/ui/YearDropdown'
import BreedSearchDropdown from '../../components/ui/BreedSearchDropdown'
import QuickBreedBar from '../TopDogs/QuickBreedBar'
import JudgesRatingHint from './JudgesRatingHint'
import { toolbarPillTriggerClass } from '../../lib/toolbar'
import { formatBreedName } from '../../lib/breedMapping'
import type { DogsIndexEntry } from '../../lib/competingBreeds'

export const DISCIPLINE_OPTIONS = [
  { value: 'coursing', label: 'Курсинг' },
  { value: 'bzmp', label: 'БЗМП' },
] as const

export interface JudgesToolbarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterYear: string
  setFilterYear: (year: string) => void
  availableYears: string[]
  isYearNonDefault: boolean
  filterBreed: string
  setFilterBreed: (breed: string) => void
  availableBreeds: string[]
  dogIndex: DogsIndexEntry[]
  filterDiscipline: string
  setFilterDiscipline: (disc: string) => void
  hasActiveFilters?: boolean
  clearFilters?: () => void
}

export function JudgesToolbar({
  searchQuery,
  setSearchQuery,
  filterYear,
  setFilterYear,
  availableYears,
  isYearNonDefault: _isYearNonDefault,
  filterBreed,
  setFilterBreed,
  availableBreeds,
  dogIndex,
  filterDiscipline,
  setFilterDiscipline,
  hasActiveFilters: _hasActiveFilters,
  clearFilters: _clearFilters,
}: JudgesToolbarProps) {
  const [mobileYearOpen, setMobileYearOpen] = useState(false)
  const [mobileDisciplineOpen, setMobileDisciplineOpen] = useState(false)
  const [desktopDisciplineOpen, setDesktopDisciplineOpen] = useState(false)

  const renderDisciplineMenuItems = (closeDropdown: () => void) => (
    <div className="p-1 max-h-60 overflow-y-auto" role="menu">
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          setFilterDiscipline('')
          closeDropdown()
        }}
        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
          !filterDiscipline
            ? 'bg-camel-100 text-camel-950 font-semibold'
            : 'text-charcoal-700 hover:bg-camel-100'
        }`}
      >
        Все
      </button>
      {DISCIPLINE_OPTIONS.map((d) => (
        <button
          key={d.value}
          type="button"
          role="menuitem"
          onClick={() => {
            setFilterDiscipline(d.value)
            closeDropdown()
          }}
          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
            filterDiscipline === d.value
              ? 'bg-camel-100 text-camel-950 font-semibold'
              : 'text-charcoal-700 hover:bg-camel-100'
          }`}
        >
          {d.label}
        </button>
      ))}
    </div>
  )

  const activeDisciplineLabel = DISCIPLINE_OPTIONS.find((d) => d.value === filterDiscipline)?.label

  return (
    <PageToolbar
      bare
      topRowClassName="flex-nowrap"
      filters={
        <div className="w-full min-w-0">
          {/* Мобильная строка (< 768px): Поиск + Год + Дисциплина + Порода */}
          <div className="flex md:hidden items-center gap-1.5 w-full min-w-0 overflow-x-auto no-scrollbar py-1.5">
            <ToolbarSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Фамилия судьи…"
            />

            {/* Year Dropdown */}
            <YearDropdown
              years={availableYears}
              selectedYear={filterYear}
              onSelectYear={setFilterYear}
              isOpen={mobileYearOpen}
              onOpenChange={setMobileYearOpen}
            />

            {/* Discipline Dropdown */}
            <ModernDropdown
              trigger={
                <button
                  type="button"
                  className={`shrink-0 ${toolbarPillTriggerClass(Boolean(filterDiscipline))}`}
                >
                  <span className="truncate max-w-[85px]">
                    {activeDisciplineLabel || 'Дисциплина'}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70 transition-transform" aria-hidden />
                </button>
              }
              isOpen={mobileDisciplineOpen}
              onOpenChange={setMobileDisciplineOpen}
              width="160px"
            >
              {mobileDisciplineOpen ? renderDisciplineMenuItems(() => setMobileDisciplineOpen(false)) : null}
            </ModernDropdown>

            {/* Breed Dropdown */}
            <BreedSearchDropdown
              breeds={availableBreeds}
              selectedBreed={filterBreed}
              onSelect={setFilterBreed}
              trigger={
                <button
                  type="button"
                  className={`shrink-0 ${toolbarPillTriggerClass(Boolean(filterBreed))}`}
                >
                  <span className="truncate max-w-[100px]">
                    {filterBreed ? formatBreedName(filterBreed) : 'Порода'}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                </button>
              }
              dogIndex={dogIndex}
            />

            <div className="ml-auto shrink-0 flex items-center gap-1.5">

              <JudgesRatingHint compact />
            </div>
          </div>

          {/* Десктопная строка (>= 768px): Поиск + Год + Дисциплина + О судействе + Разделитель + Порода (QuickBreedBar) */}
          <div className="hidden md:flex md:items-center gap-2 w-full min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <ToolbarSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Фамилия судьи…"
              />

              {/* Year Dropdown */}
              <YearDropdown
                years={availableYears}
                selectedYear={filterYear}
                onSelectYear={setFilterYear}
              />

              {/* Discipline Dropdown */}
              <ModernDropdown
                trigger={
                  <button
                    type="button"
                    className={`shrink-0 ${toolbarPillTriggerClass(Boolean(filterDiscipline))}`}
                  >
                    <span>{activeDisciplineLabel || 'Дисциплина'}</span>
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70 transition-transform" aria-hidden />
                  </button>
                }
                isOpen={desktopDisciplineOpen}
                onOpenChange={setDesktopDisciplineOpen}
                width="150px"
              >
                {desktopDisciplineOpen ? renderDisciplineMenuItems(() => setDesktopDisciplineOpen(false)) : null}
              </ModernDropdown>

              {/* Кнопка «О судействе» */}
              <JudgesRatingHint embedded />


            </div>

            <div className="h-5 w-px bg-old-money-300 shrink-0 mx-0.5" aria-hidden="true" />

            {/* Breed QuickBreedBar — всегда самая правая часть панели фильтра */}
            <div className="flex-1 min-w-0">
              <QuickBreedBar
                selectedBreed={filterBreed}
                onSelectBreed={setFilterBreed}
                breedValues={availableBreeds}
                dogIndex={dogIndex}
              />
            </div>
          </div>
        </div>
      }
    />
  )
}
