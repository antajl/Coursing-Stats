import { useMemo, useState, type ReactNode } from 'react'
import { ChevronDown, X } from 'lucide-react'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarFiltersDropdown from '../../components/toolbar/ToolbarFiltersDropdown'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ModernDropdown from '../../components/ui/ModernDropdown'
import BreedSearchDropdown from '../../components/ui/BreedSearchDropdown'
import QuickBreedBar, { SHOW_CANDIDATE_BREEDS } from '../TopDogs/QuickBreedBar'
import ShowRatingHint from './ShowRatingHint'
import { formatBreedName } from '../../lib/breedMapping'
import {
  TOOLBAR_NUMBER_INPUT,
  toolbarPillTriggerClass,
} from '../../lib/toolbar'
import {
  SHOW_AWARD_BADGE,
  SHOW_FILTER_AWARD_KEYS,
  type ShowAwardKey,
} from '../../../../backend/lib/show-award-ranking'

export type ShowAwardMinFilters = Partial<Record<ShowAwardKey, string>>

const FCI_GROUPS = [
  'Борзые',
  'Шпицы и примитивные типы собак',
  'Гончие, гончие по кровяному следу и родственные породы',
  'Терьеры',
  'Таксы',
  'Комнатно-декоративные собаки',
  'Пастушьи и скотогонные собаки, кроме швейцарских скотогонных собак',
  'Пинчеры и шнауцеры - догообразные и швейцарские горные скотогонные собаки',
  'Легавые',
  'Ретриверы спаниели, водяные собаки',
]

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
          ? 'border-camel-500 bg-camel-500 text-charcoal-900 shadow-2xs'
          : 'border-old-money-200 bg-cream-50 text-charcoal-700 hover:bg-old-money-50'
      }`}
    >
      {filterYear || 'Все года'}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-chevron-down h-3.5 w-3.5 transition-transform"
        aria-hidden
      >
        <path d="m6 9 6 6 6-6"></path>
      </svg>
    </button>
  )

  return (
    <div className="mb-2 sm:mb-4" ref={dropdownRef}>
      <PageToolbar
        bare
        topRowClassName="flex-wrap md:flex-nowrap"
        filters={
          <div className="w-full min-w-0">
            {/* Мобильная версия: 2 компактные строки */}
            <div className="flex flex-col gap-1.5 w-full md:hidden">
              {/* Строка 1: [Поиск] [Год ∨] [Порода ∨] [Награды ∨] + [ⓘ] */}
              <div className="flex items-center gap-1.5 w-full min-w-0">
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
                    <div className="p-1 min-w-[100px]">
                      <div className="max-h-60 overflow-y-auto" role="menu">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            onYearChange('')
                            setMobileYearDropdownOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${
                            !filterYear
                              ? 'bg-camel-500 text-charcoal-900 font-medium'
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
                              setMobileYearDropdownOpen(false)
                            }}
                            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${
                              filterYear === year
                                ? 'bg-camel-500 text-charcoal-900 font-medium'
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
                <ToolbarFiltersDropdown
                  active={hasPanelFilters}
                  activeCount={panelFilterCount}
                  fillContent
                  panelClassName="md:w-[min(320px,calc(100vw-2rem))]"
                  onReset={onResetPanelFilters}
                  label="Награды"
                >
                  <div className="flex flex-col gap-3 p-3">
                    {onGroupChange && (
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-600">
                          Группа пород
                        </label>
                        <select
                          value={filterGroup}
                          onChange={(e) => onGroupChange(e.target.value)}
                          className="w-full h-8 text-xs rounded-lg border border-old-money-200 bg-white px-2.5 text-charcoal-800 focus:border-camel-500 focus:outline-none focus:ring-1 focus:ring-camel-500"
                        >
                          <option value="">Все группы FCI</option>
                          {FCI_GROUPS.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-600">
                          Минимум наград
                        </span>
                        {hasAwardMins && (
                          <span className="text-[10px] text-camel-700 font-medium">
                            активно: {awardMinCount}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-0.5">
                        {SHOW_FILTER_AWARD_KEYS.map((key) => (
                          <label key={key} className="block space-y-0.5">
                            <span className="text-[11px] font-medium text-charcoal-600">
                              {SHOW_AWARD_BADGE[key]}
                            </span>
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="мин."
                              value={awardMins[key] || ''}
                              onChange={(e) =>
                                onAwardMinChange(key, e.target.value.replace(/[^0-9]/g, ''))
                              }
                              className={`${TOOLBAR_NUMBER_INPUT} !h-8`}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </ToolbarFiltersDropdown>
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
            </div>

            {/* Десктопная строка: Поиск + Год + Награды */}
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
                  <div className="p-1 min-w-[100px]">
                    <div className="max-h-60 overflow-y-auto" role="menu">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          onYearChange('')
                          setDesktopYearDropdownOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${
                          !filterYear
                            ? 'bg-camel-500 text-charcoal-900 font-medium'
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
                            setDesktopYearDropdownOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${
                            filterYear === year
                              ? 'bg-camel-500 text-charcoal-900 font-medium'
                              : 'text-charcoal-700 hover:bg-camel-100'
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                </ModernDropdown>

                <div className="shrink-0">
                <ToolbarFiltersDropdown
                  active={hasPanelFilters}
                  activeCount={panelFilterCount}
                  fillContent
                  panelClassName="md:w-[min(320px,calc(100vw-2rem))]"
                  onReset={onResetPanelFilters}
                  label="Награды"
                >
                  <div className="flex flex-col gap-3 p-3">
                    {onGroupChange && (
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-600">
                          Группа пород
                        </label>
                        <select
                          value={filterGroup}
                          onChange={(e) => onGroupChange(e.target.value)}
                          className="w-full h-8 text-xs rounded-lg border border-old-money-200 bg-white px-2.5 text-charcoal-800 focus:border-camel-500 focus:outline-none focus:ring-1 focus:ring-camel-500"
                        >
                          <option value="">Все группы FCI</option>
                          {FCI_GROUPS.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-600">
                          Минимум наград
                        </span>
                        {hasAwardMins && (
                          <span className="text-[10px] text-camel-700 font-medium">
                            активно: {awardMinCount}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-0.5">
                        {SHOW_FILTER_AWARD_KEYS.map((key) => (
                          <label key={key} className="block space-y-0.5">
                            <span className="text-[11px] font-medium text-charcoal-600">
                              {SHOW_AWARD_BADGE[key]}
                            </span>
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="мин."
                              value={awardMins[key] || ''}
                              onChange={(e) =>
                                onAwardMinChange(key, e.target.value.replace(/[^0-9]/g, ''))
                              }
                              className={`${TOOLBAR_NUMBER_INPUT} !h-8`}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </ToolbarFiltersDropdown>
                </div>

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

            {/* Разделитель между поиском/годом и породами на десктопе */}
            <div
              className="hidden md:block h-5 w-px bg-old-money-300 shrink-0 mx-0.5"
              aria-hidden="true"
            />

            {/* Выбор породы QuickBreedBar — только на десктопе! */}
            <div className="hidden md:block flex-1 min-w-0 w-full md:w-auto">
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
        trailing={<div className="hidden md:block">{trailing ?? <ShowRatingHint embedded />}</div>}
      />
    </div>
  )
}
