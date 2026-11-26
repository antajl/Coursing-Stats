import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import YearDropdown from '../../components/ui/YearDropdown'
import ModernDropdown from '../../components/ui/ModernDropdown'
import DogSexIcon from '../../components/DogSexIcon'
import QuickBreedBar, { SHOW_CANDIDATE_BREEDS } from '../TopDogs/QuickBreedBar'
import ShowRatingHint from './ShowRatingHint'
import type { DogsIndexEntry } from '../../lib/competingBreeds'
import BreedSearchDropdown from '../../components/ui/BreedSearchDropdown'
import { formatBreedName } from '../../lib/breedMapping'
import { toolbarPillTriggerClass } from '../../lib/toolbar'
import type { ShowMonoAgeCategory } from '../../../../backend/lib/show-award-ranking'

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
  filterSex?: string
  onSexChange: (value: string) => void
  filterAge?: ShowMonoAgeCategory
  onAgeChange?: (age: ShowMonoAgeCategory) => void
  dogIndex?: DogsIndexEntry[]
  onResetFilters?: () => void
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
  filterSex = '',
  onSexChange,
  filterAge = 'all',
  onAgeChange,
  dogIndex,
  onResetFilters: _onResetFilters,
  trailing,
  dropdownRef,
}: ShowRankingFiltersProps) {
  const [mobileYearDropdownOpen, setMobileYearDropdownOpen] = useState(false)
  const [mobileSexOpen, setMobileSexOpen] = useState(false)
  const [desktopSexOpen, setDesktopSexOpen] = useState(false)
  const [mobileAgeOpen, setMobileAgeOpen] = useState(false)
  const [desktopAgeOpen, setDesktopAgeOpen] = useState(false)

  const isSexActive = Boolean(filterSex)
  const isAgeActive = Boolean(filterAge && filterAge !== 'all')

  const sexTriggerLabel = filterSex === 'm' ? 'Кобели' : filterSex === 'f' ? 'Суки' : 'Пол'
  const ageTriggerLabel =
    filterAge === 'adult'
      ? 'Взрослые'
      : filterAge === 'junior'
        ? 'Юниоры'
        : filterAge === 'veteran'
          ? 'Ветераны'
          : 'Возраст'

  const sexTrigger = (
    <button
      type="button"
      className={`shrink-0 ${toolbarPillTriggerClass(isSexActive)}`}
    >
      {filterSex === 'm' && <DogSexIcon sex="m" size={12} variant="neutral" className="shrink-0 text-current" />}
      {filterSex === 'f' && <DogSexIcon sex="f" size={12} variant="neutral" className="shrink-0 text-current" />}
      <span>{sexTriggerLabel}</span>
      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
    </button>
  )

  const ageTrigger = (
    <button
      type="button"
      className={`shrink-0 ${toolbarPillTriggerClass(isAgeActive)}`}
    >
      <span>{ageTriggerLabel}</span>
      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
    </button>
  )

  const renderAgeMenu = (setOpen: (v: boolean) => void) => (
    <div className="p-1 min-w-[135px]" role="menu">
      {[
        { key: 'all', label: 'Все' },
        { key: 'adult', label: 'Взрослые' },
        { key: 'junior', label: 'Юниоры' },
        { key: 'veteran', label: 'Ветераны' },
      ].map((item) => {
        const isSelected = (!filterAge && item.key === 'all') || filterAge === item.key
        return (
          <button
            key={item.key}
            type="button"
            role="menuitem"
            onClick={() => {
              onAgeChange?.(item.key as ShowMonoAgeCategory)
              setOpen(false)
            }}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
              isSelected
                ? 'bg-camel-100 text-camel-950 font-semibold'
                : 'text-charcoal-700 hover:bg-camel-100'
            }`}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )

  const renderSexMenu = (setOpen: (v: boolean) => void) => (
    <div className="p-1 min-w-[125px]" role="menu">
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onSexChange('')
          setOpen(false)
        }}
        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
          !filterSex
            ? 'bg-camel-100 text-camel-950 font-semibold'
            : 'text-charcoal-700 hover:bg-camel-100'
        }`}
      >
        Все
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onSexChange('m')
          setOpen(false)
        }}
        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
          filterSex === 'm'
            ? 'bg-camel-100 text-camel-950 font-semibold'
            : 'text-charcoal-700 hover:bg-camel-100'
        }`}
      >
        <DogSexIcon sex="m" size={14} className={filterSex === 'm' ? 'text-charcoal-900' : 'text-slate-500'} />
        <span>Кобели</span>
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onSexChange('f')
          setOpen(false)
        }}
        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
          filterSex === 'f'
            ? 'bg-camel-100 text-camel-950 font-semibold'
            : 'text-charcoal-700 hover:bg-camel-100'
        }`}
      >
        <DogSexIcon sex="f" size={14} className={filterSex === 'f' ? 'text-charcoal-900' : 'text-rose-500'} />
        <span>Суки</span>
      </button>
    </div>
  )

  return (
    <div className="mb-2.5 sm:mb-4" ref={dropdownRef}>
      <PageToolbar
        bare
        topRowClassName="flex-nowrap"
        filters={
          <div className="w-full">
            {/* Мобильная и планшетная панель фильтров (< 1024px): компактный единый ряд */}
            <div className="flex lg:hidden items-center gap-1.5 w-full min-w-0 overflow-x-auto no-scrollbar py-1.5">
              <ToolbarSearch
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Кличка, порода…"
              />

              <div className="shrink-0">
                <YearDropdown
                  years={yearValues}
                  selectedYear={filterYear}
                  currentSeason={currentSeason}
                  onSelectYear={onYearChange}
                  showAllYears={true}
                  isOpen={mobileYearDropdownOpen}
                  onOpenChange={setMobileYearDropdownOpen}
                />
              </div>

              <div className="shrink-0">
                <ModernDropdown
                  trigger={sexTrigger}
                  isOpen={mobileSexOpen}
                  onOpenChange={setMobileSexOpen}
                  width="130px"
                >
                  {renderSexMenu(setMobileSexOpen)}
                </ModernDropdown>
              </div>

              <div className="shrink-0">
                <ModernDropdown
                  trigger={ageTrigger}
                  isOpen={mobileAgeOpen}
                  onOpenChange={setMobileAgeOpen}
                  width="135px"
                >
                  {renderAgeMenu(setMobileAgeOpen)}
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

                {trailing ?? <ShowRatingHint compact />}
              </div>
            </div>

            {/* Десктопная строка (>= 1024px): Поиск + Год + Пол + Возраст + О рейтинге + Разделитель + Порода (QuickBreedBar) */}
            <div className="hidden lg:flex lg:items-center gap-2 w-full min-w-0">
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
                  showAllYears={true}
                />

                <ModernDropdown
                  trigger={sexTrigger}
                  isOpen={desktopSexOpen}
                  onOpenChange={setDesktopSexOpen}
                  width="130px"
                >
                  {renderSexMenu(setDesktopSexOpen)}
                </ModernDropdown>

                <ModernDropdown
                  trigger={ageTrigger}
                  isOpen={desktopAgeOpen}
                  onOpenChange={setDesktopAgeOpen}
                  width="135px"
                >
                  {renderAgeMenu(setDesktopAgeOpen)}
                </ModernDropdown>

                {/* Кнопка «О рейтинге» — слева, сразу после выбора года и пола */}
                {trailing ?? <ShowRatingHint embedded />}

                {/* Сброс фильтров */}

              </div>

              {/* Разделитель между левыми контролами и породами на десктопе */}
              <div
                className="hidden lg:block h-5 w-px bg-old-money-300 shrink-0 mx-0.5"
                aria-hidden="true"
              />

              {/* Выбор породы QuickBreedBar — всегда самая правая часть фильтра до края страницы */}
              <div className="hidden lg:block flex-1 min-w-0">
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
