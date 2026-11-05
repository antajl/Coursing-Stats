import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ModernDropdown from '../../components/ui/ModernDropdown'
import BreedSearchDropdown from '../../components/ui/BreedSearchDropdown'
import { toolbarPillTriggerClass } from '../../lib/toolbar'
import { formatBreedName } from '../../lib/breedMapping'

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
  onResetFilters: () => void
}

export function ShowJudgesToolbar({
  searchQuery,
  setSearchQuery,
  filterYear,
  setFilterYear,
  showYears,
  isYearNonDefault,
  availableBreeds,
  filterBreed,
  onSelectBreed,
  onResetFilters,
}: ShowJudgesToolbarProps) {
  const [mobileYearOpen, setMobileYearOpen] = useState(false)
  const [desktopYearOpen, setDesktopYearOpen] = useState(false)

  const renderYearMenuItems = (closeDropdown: () => void) => (
    <div className="p-1 max-h-60 overflow-y-auto" role="menu">
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          setFilterYear('')
          closeDropdown()
        }}
        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
          !filterYear
            ? 'bg-camel-100 text-camel-950 font-semibold'
            : 'text-charcoal-700 hover:bg-camel-100'
        }`}
      >
        Все года
      </button>
      {showYears.map((year) => (
        <button
          key={year}
          type="button"
          role="menuitem"
          onClick={() => {
            setFilterYear(year)
            closeDropdown()
          }}
          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
            filterYear === year
              ? 'bg-camel-100 text-camel-950 font-semibold'
              : 'text-charcoal-700 hover:bg-camel-100'
          }`}
        >
          {year}
        </button>
      ))}
    </div>
  )

  const hasActiveFilters = Boolean(isYearNonDefault || filterBreed || searchQuery.trim())

  return (
    <PageToolbar
      bare
      topRowClassName="flex-nowrap"
      filters={
        <div className="w-full min-w-0">
          {/* Мобильная компактная строка (32px): Поиск + Год + Порода + Сброс */}
          <div className="flex sm:hidden items-center gap-1.5 w-full min-w-0 overflow-x-auto no-scrollbar py-0.5">
            <ToolbarSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Фамилия…"
            />

            {/* Year Dropdown */}
            <ModernDropdown
              trigger={
                <button
                  type="button"
                  className={`shrink-0 ${toolbarPillTriggerClass(isYearNonDefault)}`}
                >
                  <span>{!filterYear ? 'Все года' : filterYear}</span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                </button>
              }
              isOpen={mobileYearOpen}
              onOpenChange={setMobileYearOpen}
              width="130px"
            >
              {renderYearMenuItems(() => setMobileYearOpen(false))}
            </ModernDropdown>

            {/* Breed Dropdown */}
            <BreedSearchDropdown
              breeds={availableBreeds}
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
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                </button>
              }
            />

            {/* Reset Filters button on mobile */}
            {hasActiveFilters && (
              <div className="ml-auto shrink-0">
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="cs-glass-pill shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full !text-charcoal-500 hover:!text-charcoal-800 transition-colors cursor-pointer select-none"
                  title="Сбросить фильтры"
                  aria-label="Сбросить фильтры"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Десктопная строка */}
          <div className="hidden sm:flex sm:items-center gap-2 w-full">
            <ToolbarSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Фамилия судьи…"
            />
            <div className="flex max-w-full items-center gap-1.5 shrink-0">
              {/* Year Dropdown */}
              <ModernDropdown
                trigger={
                  <button
                    type="button"
                    className={`shrink-0 ${toolbarPillTriggerClass(isYearNonDefault)}`}
                  >
                    <span>{!filterYear ? 'Все года' : filterYear}</span>
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                  </button>
                }
                isOpen={desktopYearOpen}
                onOpenChange={setDesktopYearOpen}
                width="130px"
              >
                {renderYearMenuItems(() => setDesktopYearOpen(false))}
              </ModernDropdown>

              {/* Breed Dropdown */}
              <BreedSearchDropdown
                breeds={availableBreeds}
                selectedBreed={filterBreed}
                onSelect={onSelectBreed}
                trigger={
                  <button
                    type="button"
                    className={`shrink-0 ${toolbarPillTriggerClass(Boolean(filterBreed))}`}
                  >
                    <span className="truncate max-w-[140px]">
                      {filterBreed ? formatBreedName(filterBreed) : 'Порода'}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                  </button>
                }
              />

              {/* Reset Filters button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="cs-glass-pill shrink-0 inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold !text-charcoal-600 hover:!text-charcoal-900 transition-colors cursor-pointer select-none"
                  title="Сбросить все фильтры"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Сбросить</span>
                </button>
              )}
            </div>
          </div>
        </div>
      }
    />
  )
}
