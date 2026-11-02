import { useMemo, useState, type ReactNode } from 'react'
import { ChevronDown, X } from 'lucide-react'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ModernDropdown from '../../components/ui/ModernDropdown'
import BreedSearchDropdown from '../../components/ui/BreedSearchDropdown'
import QuickBreedBar, { SHOW_CANDIDATE_BREEDS } from '../TopDogs/QuickBreedBar'
import ShowRatingHint from './ShowRatingHint'
import { formatBreedName } from '../../lib/breedMapping'
import { toolbarPillTriggerClass } from '../../lib/toolbar'
import {
  SHOW_FILTER_AWARD_KEYS,
  type ShowAwardKey,
} from '../../../../backend/lib/show-award-ranking'
import { ShowAwardsFilterPanel, FCI_GROUPS } from './ShowAwardsFilterPanel'

export { FCI_GROUPS }

export type ShowAwardMinFilters = Partial<Record<ShowAwardKey, string>>

interface ShowRankingFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterYear: string
  onYearChange: (value: string) => void
  currentSeason: string
  yearValues: string[]
  filterBreed: string
  onBreedChange: (value: string) => void
  breedValues: string[]
  dogIndex?: import('../../lib/competingBreeds').DogsIndexEntry[]
  filterGroup?: string
  onGroupChange?: (value: string) => void
  groupValues?: string[]
  awardMins: ShowAwardMinFilters
  onAwardMinChange: (key: ShowAwardKey, value: string) => void
  onResetFilters: () => void
  onResetPanelFilters: () => void
  dropdownRef?: React.RefObject<HTMLDivElement>
  trailing?: ReactNode
}

export default function ShowRankingFilters({
  searchQuery,
  onSearchChange,
  filterYear,
  onYearChange,
  currentSeason,
  yearValues,
  filterBreed,
  onBreedChange,
  breedValues,
  dogIndex,
  filterGroup = '',
  onGroupChange,
  awardMins,
  onAwardMinChange,
  onResetFilters,
  onResetPanelFilters,
  dropdownRef,
  trailing,
}: ShowRankingFiltersProps) {
  const [mobileYearDropdownOpen, setMobileYearDropdownOpen] = useState(false)
  const [desktopYearDropdownOpen, setDesktopYearDropdownOpen] = useState(false)

  const sortedYears = useMemo(
    () => [...yearValues].sort((a, b) => Number(b) - Number(a)),
    [yearValues],
  )

  const hasAwardMins = SHOW_FILTER_AWARD_KEYS.some((key) => Boolean(awardMins[key]))
  const awardMinCount = SHOW_FILTER_AWARD_KEYS.filter((key) => Boolean(awardMins[key])).length
  const yearIsNonDefault = filterYear !== '' && filterYear !== currentSeason

  const panelFilterCount = (filterGroup ? 1 : 0) + awardMinCount
  const hasPanelFilters = panelFilterCount > 0
  const hasAnyFilter = Boolean(yearIsNonDefault || filterBreed || hasPanelFilters || searchQuery)

  const yearTrigger = (
    <button
      type="button"
      className={`inline-flex h-8 items-center rounded-full border px-3.5 text-xs font-semibold whitespace-nowrap transition-colors gap-1.5 cursor-pointer ${
        yearIsNonDefault
          ? 'border-camel-400 bg-camel-100 text-camel-950 shadow-2xs'
          : 'border-old-money-200 bg-cream-50 text-charcoal-700 hover:bg-old-money-50'
      }`}
    >
      {filterYear || 'Все года'}
      <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
    </button>
  )

  const renderYearMenuItems = (closeDropdown: () => void) => (
    <div className="p-1 min-w-[100px]">
      <div className="max-h-60 overflow-y-auto" role="menu">
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onYearChange('')
            closeDropdown()
          }}
          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${
            !filterYear
              ? 'bg-camel-100 text-camel-950 font-semibold'
              : 'text-charcoal-700 hover:bg-camel-100'
          }`}
        >
          Все года
        </button>
        {sortedYears.map((year) => (
          <button
            key={year}
            type="button"
            role="menuitem"
            onClick={() => {
              onYearChange(year)
              closeDropdown()
            }}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${
              filterYear === year
                ? 'bg-camel-100 text-camel-950 font-semibold'
                : 'text-charcoal-700 hover:bg-camel-100'
            }`}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  )

  const awardsPanelProps = {
    hasPanelFilters,
    panelFilterCount,
    onResetPanelFilters,
    filterGroup,
    onGroupChange,
    awardMins,
    onAwardMinChange,
    hasAwardMins,
    awardMinCount,
  }

  return (
    <div className="mb-2 sm:mb-4" ref={dropdownRef}>
      <PageToolbar
        bare
        topRowClassName="flex-nowrap"
        filters={
          <div className="w-full min-w-0">
            {/* Мобильная версия: единый компактный ряд */}
            <div className="flex items-center gap-1.5 w-full md:hidden overflow-x-auto no-scrollbar py-0.5">
              <ToolbarSearch
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Кличка, порода…"
              />

              <div className="shrink-0">
                <ModernDropdown
                  trigger={yearTrigger}
                  isOpen={mobileYearDropdownOpen}
                  onOpenChange={setMobileYearDropdownOpen}
                  width="120px"
                >
                  {renderYearMenuItems(() => setMobileYearDropdownOpen(false))}
                </ModernDropdown>
              </div>

              <div className="shrink-0">
                <BreedSearchDropdown
                  breeds={breedValues}
                  selectedBreed={filterBreed}
                  onSelect={onBreedChange}
                  trigger={
                    <button
                      type="button"
                      className={`shrink-0 ${toolbarPillTriggerClass(Boolean(filterBreed))}`}
                    >
                      <span className="truncate max-w-[110px]">
                        {filterBreed ? formatBreedName(filterBreed) : 'Порода'}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                    </button>
                  }
                  dogIndex={dogIndex}
                />
              </div>

              <div className="shrink-0">
                <ShowAwardsFilterPanel {...awardsPanelProps} />
              </div>

              <div className="ml-auto shrink-0 flex items-center gap-1.5">
                {hasAnyFilter && (
                  <button
                    type="button"
                    onClick={onResetFilters}
                    className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full border border-old-money-200 bg-cream-50 text-charcoal-500 hover:text-charcoal-800 transition-colors cursor-pointer"
                    title="Сбросить фильтры"
                    aria-label="Сбросить фильтры"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {trailing ?? <ShowRatingHint embedded compact />}
              </div>
            </div>

            {/* Десктопная строка: Поиск + Год + Разделитель + Порода + Награды + Сброс */}
            <div className="hidden md:flex md:items-center gap-2 w-full min-w-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <ToolbarSearch
                  value={searchQuery}
                  onChange={onSearchChange}
                  placeholder="Кличка, порода…"
                />

                <ModernDropdown
                  trigger={yearTrigger}
                  isOpen={desktopYearDropdownOpen}
                  onOpenChange={setDesktopYearDropdownOpen}
                  width="120px"
                >
                  {renderYearMenuItems(() => setDesktopYearDropdownOpen(false))}
                </ModernDropdown>
              </div>

              {/* Разделитель между поиском/годом и породами на десктопе */}
              <div
                className="hidden md:block h-5 w-px bg-old-money-300 shrink-0 mx-0.5"
                aria-hidden="true"
              />

              {/* Выбор породы QuickBreedBar */}
              <div className="hidden md:block flex-1 min-w-0 w-full md:w-auto">
                <QuickBreedBar
                  selectedBreed={filterBreed}
                  onSelectBreed={onBreedChange}
                  breedValues={breedValues}
                  dogIndex={dogIndex}
                  candidateBreeds={SHOW_CANDIDATE_BREEDS}
                />
              </div>

              {/* Уникальный фильтр: Награды */}
              <div className="shrink-0">
                <ShowAwardsFilterPanel {...awardsPanelProps} />
              </div>

              {/* Сброс фильтров справа от наград */}
              {hasAnyFilter && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="shrink-0 inline-flex h-8 items-center gap-1.5 rounded-full border border-old-money-200 bg-cream-50 px-3 text-xs font-semibold text-charcoal-600 hover:border-camel-500 hover:text-charcoal-900 hover:bg-cream-100 transition-colors cursor-pointer"
                  title="Сбросить все фильтры"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Сбросить</span>
                </button>
              )}
            </div>
          </div>
        }
        trailing={<div className="hidden md:block">{trailing ?? <ShowRatingHint embedded />}</div>}
      />
    </div>
  )
}
