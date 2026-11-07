import { useState, type ReactNode } from 'react'
import { ChevronDown, X } from 'lucide-react'
import DogSexIcon from '../../components/DogSexIcon'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ModernDropdown from '../../components/ui/ModernDropdown'
import YearDropdown from '../../components/ui/YearDropdown'
import BreedSearchDropdown from '../../components/ui/BreedSearchDropdown'
import QuickBreedBar from './QuickBreedBar'
import { formatBreedName } from '../../lib/breedMapping'
import { toolbarPillTriggerClass } from '../../lib/toolbar'

interface TopDogsFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterYear: string
  onYearChange: (value: string) => void
  currentSeason: string
  yearValues: (string | number)[]
  filterBreed: string
  onBreedChange: (value: string) => void
  breedValues: string[]
  filterSex: string
  onSexChange: (value: string) => void
  dogIndex?: import('../../lib/competingBreeds').DogsIndexEntry[]
  filterMinStarts?: string
  onMinStartsChange?: (value: string) => void
  filterScoreFrom?: string
  onScoreFromChange?: (value: string) => void
  filterSpeedFrom?: string
  onSpeedFromChange?: (value: string) => void
  onResetFilters: () => void
  onResetPanelFilters?: () => void
  dropdownRef?: React.RefObject<HTMLDivElement>
  trailing?: ReactNode
  activeMobileColumn?: 'coursing' | 'racing'
  onMobileColumnChange?: (col: 'coursing' | 'racing') => void
  coursingCount?: number
  racingCount?: number
}

export default function TopDogsFilters({
  searchQuery,
  onSearchChange,
  filterYear,
  onYearChange,
  currentSeason,
  yearValues,
  filterBreed,
  onBreedChange,
  breedValues,
  filterSex,
  onSexChange,
  dogIndex,
  onResetFilters,
  dropdownRef,
  trailing,
  activeMobileColumn,
  onMobileColumnChange,
  coursingCount,
  racingCount,
}: TopDogsFiltersProps) {
  const [mobileSexOpen, setMobileSexOpen] = useState(false)
  const [desktopSexOpen, setDesktopSexOpen] = useState(false)

  const isYearNonDefault = filterYear !== '' && filterYear !== currentSeason
  const isSexActive = Boolean(filterSex)
  const hasActiveFilters = isYearNonDefault || Boolean(filterBreed) || Boolean(filterSex) || Boolean(searchQuery.trim())

  const sexTriggerLabel = filterSex === 'm' ? 'Кобели' : filterSex === 'f' ? 'Суки' : 'Пол'

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

  const isCoursing = activeMobileColumn === 'coursing'

  return (
    <div className="mb-2.5 sm:mb-4" ref={dropdownRef}>
      {/* 1. Мобильная консоль: единый компактный ряд (Поиск + Фильтры слева, Инфо + Дисциплина справа) */}
      <div className="flex items-center gap-1.5 w-full lg:hidden mb-2.5 overflow-x-auto no-scrollbar py-0.5">
        {/* Поиск */}
        <ToolbarSearch
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Кличка…"
        />

        {/* Выбор года */}
        <div className="shrink-0">
          <YearDropdown
            years={yearValues}
            selectedYear={filterYear}
            currentSeason={currentSeason}
            onSelectYear={onYearChange}
          />
        </div>

        {/* Выбор пола */}
        <div className="shrink-0">
          <ModernDropdown
            trigger={sexTrigger}
            isOpen={mobileSexOpen}
            onOpenChange={setMobileSexOpen}
            width="130px"
          >
            {mobileSexOpen ? renderSexMenu(setMobileSexOpen) : null}
          </ModernDropdown>
        </div>

        {/* Выбор породы */}
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

        {/* Правая часть: Сброс + Кнопка дисциплины + Инфо */}
        <div className="ml-auto shrink-0 flex items-center gap-1.5">
          {/* Сброс фильтров (если активны) */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="cs-glass-pill shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full !text-charcoal-500 hover:!text-charcoal-800 transition-colors cursor-pointer select-none"
              title="Сбросить фильтры"
              aria-label="Сбросить фильтры"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Кнопка Инфо о рейтинге (i) */}
          {trailing && <div className="shrink-0">{trailing}</div>}
        </div>
      </div>

      {/* 2. Десктопный тулбар (чистый 1 ряд) */}
      <div className="hidden lg:block">
        <PageToolbar
          bare
          topRowClassName="flex-nowrap"
          filters={
            <div className="flex items-center gap-2 w-full min-w-0">
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

                {/* Выбор пола */}
                <ModernDropdown
                  trigger={sexTrigger}
                  isOpen={desktopSexOpen}
                  onOpenChange={setDesktopSexOpen}
                  width="130px"
                >
                  {desktopSexOpen ? renderSexMenu(setDesktopSexOpen) : null}
                </ModernDropdown>

                {/* Кнопка Инфо о рейтинге (i) — слева */}
                {trailing && <div className="shrink-0">{trailing}</div>}

                {/* Сброс фильтров (если активны) — слева перед разделителем */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={onResetFilters}
                    className="cs-glass-pill shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full !text-charcoal-500 hover:!text-charcoal-800 transition-colors cursor-pointer select-none"
                    title="Сбросить фильтры"
                    aria-label="Сбросить фильтры"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="h-5 w-px bg-old-money-300 shrink-0 mx-0.5" aria-hidden="true" />

              {/* Породы — всегда самая правая часть панели фильтров */}
              <div className="flex-1 min-w-0">
                <QuickBreedBar
                  selectedBreed={filterBreed}
                  onSelectBreed={onBreedChange}
                  breedValues={breedValues}
                  dogIndex={dogIndex}
                />
              </div>
            </div>
          }
        />
      </div>
    </div>
  )
}
