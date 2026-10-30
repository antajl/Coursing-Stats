import { useMemo, useState, type ReactNode } from 'react'
import { ChevronDown, X, ArrowLeftRight } from 'lucide-react'
import DogSexIcon from '../../components/DogSexIcon'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ModernDropdown from '../../components/ui/ModernDropdown'
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
  const [mobileYearOpen, setMobileYearOpen] = useState(false)
  const [desktopYearOpen, setDesktopYearOpen] = useState(false)
  const [mobileSexOpen, setMobileSexOpen] = useState(false)
  const [desktopSexOpen, setDesktopSexOpen] = useState(false)

  const sortedYears = useMemo(
    () => [...yearValues].map(String).sort((a, b) => Number(b) - Number(a)),
    [yearValues]
  )

  const isYearNonDefault = filterYear !== '' && filterYear !== currentSeason
  const isSexActive = Boolean(filterSex)
  const hasActiveFilters = isYearNonDefault || Boolean(filterBreed) || Boolean(filterSex) || Boolean(searchQuery.trim())

  const yearTrigger = (
    <button
      type="button"
      className={toolbarPillTriggerClass(isYearNonDefault)}
    >
      {filterYear || 'Все года'}
      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
    </button>
  )

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
            ? 'bg-camel-500 text-charcoal-900 font-semibold'
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
            ? 'bg-camel-500 text-charcoal-900 font-semibold'
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
            ? 'bg-camel-500 text-charcoal-900 font-semibold'
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
          <ModernDropdown
            trigger={yearTrigger}
            isOpen={mobileYearOpen}
            onOpenChange={setMobileYearOpen}
            width="120px"
          >
            <div className="p-1 min-w-[100px]">
              <div className="max-h-60 overflow-y-auto" role="menu">
                <button
                  role="menuitem"
                  onClick={() => {
                    onYearChange('')
                    setMobileYearOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    !filterYear
                      ? 'bg-camel-500 text-charcoal-900'
                      : 'text-charcoal-700 hover:bg-camel-100'
                  }`}
                >
                  Все года
                </button>
                {sortedYears.map((year) => (
                  <button
                    key={year}
                    role="menuitem"
                    onClick={() => {
                      onYearChange(year)
                      setMobileYearOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      filterYear === year
                        ? 'bg-camel-500 text-charcoal-900'
                        : 'text-charcoal-700 hover:bg-camel-100'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
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

        {/* Выбор пола */}
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

        {/* Правая часть: Сброс + Кнопка дисциплины + Инфо */}
        <div className="ml-auto shrink-0 flex items-center gap-1.5">
          {/* Сброс фильтров (если активны) */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="relative shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full border border-old-money-200 bg-cream-50 text-charcoal-500 hover:text-charcoal-800 transition-colors before:absolute before:-inset-1.5 before:content-['']"
              title="Сбросить фильтры"
              aria-label="Сбросить фильтры"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Кнопка дисциплины (Чистый призрак со стрелочкой) */}
          {activeMobileColumn && onMobileColumnChange && (
            <button
              type="button"
              onClick={() => onMobileColumnChange(isCoursing ? 'racing' : 'coursing')}
              className="relative shrink-0 inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-charcoal-900 hover:bg-cream-200/60 active:bg-cream-200/90 active:scale-95 transition-all touch-manipulation cursor-pointer before:absolute before:-inset-1.5 before:content-['']"
              title={`Переключить на ${isCoursing ? 'рейсинг' : 'курсинг'} (или смахните экран)`}
              aria-label={`Переключить на ${isCoursing ? 'рейсинг' : 'курсинг'}`}
            >
              <span className="font-serif text-xs font-bold text-charcoal-900 tracking-tight whitespace-nowrap">
                {isCoursing ? 'Курсинг' : 'Рейсинг'}
              </span>
              <ArrowLeftRight className="h-3 w-3 text-camel-700 shrink-0" aria-hidden />
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
              <ToolbarSearch
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Кличка, порода…"
              />

              <div className="shrink-0">
                <ModernDropdown
                  trigger={yearTrigger}
                  isOpen={desktopYearOpen}
                  onOpenChange={setDesktopYearOpen}
                  width="120px"
                >
                  <div className="p-1 min-w-[100px]">
                    <div className="max-h-60 overflow-y-auto" role="menu">
                      <button
                        role="menuitem"
                        onClick={() => {
                          onYearChange('')
                          setDesktopYearOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          !filterYear
                            ? 'bg-camel-500 text-charcoal-900'
                            : 'text-charcoal-700 hover:bg-camel-100'
                        }`}
                      >
                        Все года
                      </button>
                      {sortedYears.map((year) => (
                        <button
                          key={year}
                          role="menuitem"
                          onClick={() => {
                            onYearChange(year)
                            setDesktopYearOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                            filterYear === year
                              ? 'bg-camel-500 text-charcoal-900'
                              : 'text-charcoal-700 hover:bg-camel-100'
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                </ModernDropdown>
              </div>

              {/* Выбор пола */}
              <div className="shrink-0">
                <ModernDropdown
                  trigger={sexTrigger}
                  isOpen={desktopSexOpen}
                  onOpenChange={setDesktopSexOpen}
                  width="130px"
                >
                  {renderSexMenu(setDesktopSexOpen)}
                </ModernDropdown>
              </div>

              <div className="h-5 w-px bg-old-money-300 shrink-0 mx-0.5" aria-hidden="true" />

              <div className="flex-1 min-w-0">
                <QuickBreedBar
                  selectedBreed={filterBreed}
                  onSelectBreed={onBreedChange}
                  breedValues={breedValues}
                  dogIndex={dogIndex}
                />
              </div>

              {/* Сброс фильтров (если активны) */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="relative shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full border border-old-money-200 bg-cream-50 text-charcoal-500 hover:text-charcoal-800 transition-colors before:absolute before:-inset-1.5 before:content-['']"
                  title="Сбросить фильтры"
                  aria-label="Сбросить фильтры"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          }
          trailing={trailing}
        />
      </div>
    </div>
  )
}
