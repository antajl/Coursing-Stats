import { useMemo, useState, type ReactNode } from 'react'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarFiltersDropdown from '../../components/toolbar/ToolbarFiltersDropdown'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ModernDropdown from '../../components/ui/ModernDropdown'
import QuickBreedBar from './QuickBreedBar'
import {
  TOOLBAR_NUMBER_INPUT,
} from '../../lib/toolbar'

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
  dogIndex?: import('../../lib/competingBreeds').DogsIndexEntry[]
  filterMinStarts: string
  onMinStartsChange: (value: string) => void
  filterScoreFrom: string
  onScoreFromChange: (value: string) => void
  filterSpeedFrom: string
  onSpeedFromChange: (value: string) => void
  onResetFilters: () => void
  onResetPanelFilters: () => void
  dropdownRef?: React.RefObject<HTMLDivElement>
  trailing?: ReactNode
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
  dogIndex,
  filterMinStarts,
  onMinStartsChange,
  filterScoreFrom,
  onScoreFromChange,
  filterSpeedFrom,
  onSpeedFromChange,
  dropdownRef,
  trailing,
}: TopDogsFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const sortedYears = useMemo(
    () => [...yearValues].map(String).sort((a, b) => Number(b) - Number(a)),
    [yearValues]
  )

  const isYearNonDefault = filterYear !== '' && filterYear !== currentSeason

  const hasThresholdFilters = filterMinStarts || filterScoreFrom || filterSpeedFrom
  const thresholdCount = [filterMinStarts, filterScoreFrom, filterSpeedFrom].filter(Boolean).length

  const yearTrigger = (
    <button
      type="button"
      className={`inline-flex h-8 items-center rounded-full border px-3.5 text-xs font-semibold whitespace-nowrap transition-colors gap-1.5 ${
        isYearNonDefault
          ? 'border-camel-500 bg-camel-500 text-charcoal-900'
          : 'border-old-money-200 bg-cream-50 text-charcoal-700 hover:bg-old-money-50'
      }`}
    >
      {filterYear || 'Все года'}
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-3.5 w-3.5 transition-transform" aria-hidden>
        <path d="m6 9 6 6 6-6"></path>
      </svg>
    </button>
  )

  return (
    <div className="mb-4" ref={dropdownRef}>
      <PageToolbar
        bare
        topRowClassName="flex-wrap md:flex-nowrap"
        filters={
          <div className="flex flex-col md:flex-row md:items-center gap-2 w-full min-w-0">
            {/* Строка 1 на мобилке: Поиск + О рейтинге */}
            <div className="flex items-center gap-2 w-full md:hidden">
              <ToolbarSearch
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Кличка, порода…"
                className="flex-1 min-w-0"
              />
              {trailing && <div className="shrink-0">{trailing}</div>}
            </div>

            {/* Строка 2 на мобилке / левая группа на десктопе */}
            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
              <div className="hidden md:block">
                <ToolbarSearch
                  value={searchQuery}
                  onChange={onSearchChange}
                  placeholder="Кличка, порода…"
                  className="sm:w-44 md:w-40 lg:w-48"
                />
              </div>
              <div className="shrink-0">
                <ModernDropdown
                  trigger={yearTrigger}
                  isOpen={isOpen}
                  onOpenChange={setIsOpen}
                  width="120px"
                >
                  <div className="p-1 min-w-[100px]">
                    <div className="max-h-60 overflow-y-auto" role="menu">
                      <button
                        role="menuitem"
                        onClick={() => {
                          onYearChange('')
                          setIsOpen(false)
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
                            setIsOpen(false)
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

              {/* Выпадающий список порогов (если активны) */}
              {hasThresholdFilters && (
                <ToolbarFiltersDropdown
                  active={Boolean(hasThresholdFilters)}
                  activeCount={thresholdCount}
                  fillContent
                  panelClassName="md:w-[min(300px,calc(100vw-2rem))]"
                  onReset={() => {
                    onMinStartsChange('')
                    onScoreFromChange('')
                    onSpeedFromChange('')
                  }}
                  label="Пороги"
                >
                  <div className="flex flex-col gap-3 p-2">
                    <label className="block space-y-0.5">
                      <span className="text-[11px] font-medium text-charcoal-600">
                        Участия
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="мин."
                        value={filterMinStarts}
                        onChange={(e) => onMinStartsChange(e.target.value.replace(/[^0-9]/g, ''))}
                        className={`${TOOLBAR_NUMBER_INPUT} !h-8`}
                      />
                    </label>
                    <label className="block space-y-0.5">
                      <span className="text-[11px] font-medium text-charcoal-600">
                        CS
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        placeholder="мин."
                        value={filterScoreFrom}
                        onChange={(e) => onScoreFromChange(e.target.value.replace(/[^0-9.]/g, ''))}
                        className={`${TOOLBAR_NUMBER_INPUT} !h-8`}
                      />
                    </label>
                    <label className="block space-y-0.5">
                      <span className="text-[11px] font-medium text-charcoal-600">
                        Скорость
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        placeholder="км/ч"
                        value={filterSpeedFrom}
                        onChange={(e) => onSpeedFromChange(e.target.value.replace(/[^0-9.]/g, ''))}
                        className={`${TOOLBAR_NUMBER_INPUT} !h-8`}
                      />
                    </label>
                  </div>
                </ToolbarFiltersDropdown>
              )}
            </div>

            {/* Разделитель между годом и породами на десктопе */}
            <div className="hidden md:block h-5 w-px bg-old-money-300 shrink-0 mx-0.5" aria-hidden="true" />

            {/* Выбор породы на той же строке на md+ / строка 2 на мобилке */}
            <div className="flex-1 min-w-0 w-full md:w-auto">
              <QuickBreedBar
                selectedBreed={filterBreed}
                onSelectBreed={onBreedChange}
                breedValues={breedValues}
                dogIndex={dogIndex}
              />
            </div>
          </div>
        }
        trailing={trailing ? <div className="hidden md:block">{trailing}</div> : null}
      />
    </div>
  )
}
