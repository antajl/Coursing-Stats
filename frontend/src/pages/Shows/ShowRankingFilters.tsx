import { useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import YearDropdown from '../../components/ui/YearDropdown'
import QuickBreedBar, { SHOW_CANDIDATE_BREEDS } from '../TopDogs/QuickBreedBar'
import ShowRatingHint from './ShowRatingHint'
import type { DogsIndexEntry } from '../../lib/competingBreeds'
import BreedSearchDropdown from '../../components/ui/BreedSearchDropdown'
import { formatBreedName } from '../../lib/breedMapping'
import { toolbarPillTriggerClass } from '../../lib/toolbar'
import { ChevronDown } from 'lucide-react'

interface ShowRankingFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterYear: string
  onYearChange: (value: string) => void
  currentSeason: string
  yearValues: (string | number)[]
  filterBreed: string
  onBreedChange: (value: string) => void
  breedValues: string[]
  dogIndex?: DogsIndexEntry[]
  onResetFilters: () => void
  trailing?: ReactNode
  dropdownRef?: React.RefObject<HTMLDivElement | null>
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
  onResetFilters,
  trailing,
  dropdownRef,
}: ShowRankingFiltersProps) {
  const [mobileYearDropdownOpen, setMobileYearDropdownOpen] = useState(false)
  const isYearNonDefault = filterYear !== currentSeason && Boolean(filterYear)
  const hasAnyFilter = Boolean(searchQuery.trim() || isYearNonDefault || filterBreed)

  return (
    <div className="mb-2.5 sm:mb-4" ref={dropdownRef}>
      <PageToolbar
        bare
        topRowClassName="flex-nowrap"
        filters={
          <div className="w-full">
            {/* Мобильная панель фильтров */}
            <div className="flex md:hidden items-center gap-1.5 w-full flex-wrap">
              <div className="flex-1 min-w-[140px]">
                <ToolbarSearch
                  value={searchQuery}
                  onChange={onSearchChange}
                  placeholder="Кличка, порода…"
                />
              </div>

              <div className="shrink-0">
                <YearDropdown
                  years={yearValues}
                  selectedYear={filterYear}
                  currentSeason={currentSeason}
                  onSelectYear={onYearChange}
                  isOpen={mobileYearDropdownOpen}
                  onOpenChange={setMobileYearDropdownOpen}
                />
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
                      <span className="truncate max-w-[85px]">
                        {filterBreed ? formatBreedName(filterBreed) : 'Порода'}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                    </button>
                  }
                  dogIndex={dogIndex}
                />
              </div>

              <div className="ml-auto shrink-0 flex items-center gap-1.5">
                {hasAnyFilter && (
                  <button
                    type="button"
                    onClick={onResetFilters}
                    className="cs-glass-pill shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full !text-charcoal-500 hover:!text-charcoal-800 transition-colors cursor-pointer select-none"
                    title="Сбросить все фильтры"
                    aria-label="Сбросить все фильтры"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {trailing ?? <ShowRatingHint />}
              </div>
            </div>

            {/* Десктопная строка: Поиск + Год + О рейтинге + Сброс + Разделитель + Порода (QuickBreedBar) */}
            <div className="hidden md:flex md:items-center gap-2 w-full min-w-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <ToolbarSearch
                  value={searchQuery}
                  onChange={onSearchChange}
                  placeholder="Кличка, порода…"
                />

                <YearDropdown
                  years={yearValues}
                  selectedYear={filterYear}
                  currentSeason={currentSeason}
                  onSelectYear={onYearChange}
                />

                {/* Кнопка «О рейтинге» — слева, сразу после выбора года */}
                {trailing ?? <ShowRatingHint embedded />}

                {/* Сброс фильтров */}
                {hasAnyFilter && (
                  <button
                    type="button"
                    onClick={onResetFilters}
                    className="cs-glass-pill shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full !text-charcoal-500 hover:!text-charcoal-800 transition-colors cursor-pointer select-none"
                    title="Сбросить все фильтры"
                    aria-label="Сбросить все фильтры"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Разделитель между левыми контролами и породами на десктопе */}
              <div
                className="hidden md:block h-5 w-px bg-old-money-300 shrink-0 mx-0.5"
                aria-hidden="true"
              />

              {/* Выбор породы QuickBreedBar — всегда самая правая часть фильтра до края страницы */}
              <div className="hidden md:block flex-1 min-w-0">
                <QuickBreedBar
                  selectedBreed={filterBreed}
                  onSelectBreed={onBreedChange}
                  breedValues={breedValues}
                  dogIndex={dogIndex}
                  candidateBreeds={SHOW_CANDIDATE_BREEDS}
                />
              </div>
            </div>
          </div>
        }
      />
    </div>
  )
}
