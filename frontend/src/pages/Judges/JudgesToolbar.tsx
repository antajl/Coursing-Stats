import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ModernDropdown from '../../components/ui/ModernDropdown'
import YearDropdown from '../../components/ui/YearDropdown'
import BreedSearchDropdown from '../../components/ui/BreedSearchDropdown'
import QuickBreedBar from '../TopDogs/QuickBreedBar'
import { toolbarPillTriggerClass } from '../../lib/toolbar'
import { formatBreedName } from '../../lib/breedMapping'
import type { DogsIndexEntry } from '../../lib/competingBreeds'

export const DISCIPLINE_OPTIONS = [
  { value: 'coursing', label: 'Курсинг' },
  { value: 'bzmp', label: 'БЗМП' },
  { value: 'racing', label: 'Рейсинг' },
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
  hasActiveFilters: boolean
  clearFilters: () => void
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
  hasActiveFilters,
  clearFilters,
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
        Все дисциплины
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
          {/* Мобильная строка (32px): Поиск + Год + Дисциплина + Порода + Сброс */}
          <div className="flex sm:hidden items-center gap-1.5 w-full min-w-0 overflow-x-auto no-scrollbar py-0.5">
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

            {hasActiveFilters && (
              <div className="ml-auto shrink-0">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="cs-glass-pill shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full !text-charcoal-500 hover:!text-charcoal-800 transition-colors cursor-pointer select-none"
                  title="Сбросить фильтры"
                  aria-label="Сбросить фильтры"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Десктопная строка: Поиск + Год + Дисциплина + Разделитель + Порода (QuickBreedBar) + Сброс */}
          <div className="hidden sm:flex sm:items-center gap-2 w-full min-w-0">
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

              {/* Reset Filters button — слева перед разделителем */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="cs-glass-pill shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full !text-charcoal-500 hover:!text-charcoal-800 transition-colors cursor-pointer select-none"
                  title="Сбросить все фильтры"
                  aria-label="Сбросить все фильтры"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
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
