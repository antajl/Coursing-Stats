import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import ModernDropdown from '../ui/ModernDropdown'
import { toolbarPillTriggerClass } from '../../lib/toolbar'
import { resolveActiveSeason } from '../../lib/season'

export const MONTHS_GRID = [
  { value: '1', short: 'Янв', full: 'Январь' },
  { value: '2', short: 'Фев', full: 'Февраль' },
  { value: '3', short: 'Мар', full: 'Март' },
  { value: '4', short: 'Апр', full: 'Апрель' },
  { value: '5', short: 'Май', full: 'Май' },
  { value: '6', short: 'Июн', full: 'Июнь' },
  { value: '7', short: 'Июл', full: 'Июль' },
  { value: '8', short: 'Авг', full: 'Август' },
  { value: '9', short: 'Сен', full: 'Сентябрь' },
  { value: '10', short: 'Окт', full: 'Октябрь' },
  { value: '11', short: 'Ноя', full: 'Ноябрь' },
  { value: '12', short: 'Дек', full: 'Декабрь' },
] as const

export interface MonthYearDropdownProps {
  selectedYear: string // '' for all years, '2026', '2025', etc.
  onSelectYear: (year: string) => void
  selectedMonth: string // '' for all months, '1'..'12'
  onSelectMonth: (month: string) => void
  sortedYears: string[]
  currentSeason?: string
  onClearPreset?: () => void
  className?: string
  /**
   * Optional map of year -> Set or array of available month numbers ('1'..'12').
   * If provided, months with no events will be disabled.
   */
  availableMonthsByYear?: Record<string, string[] | Set<string>>
  /**
   * Optional callback returning available month numbers ('1'..'12') for given year.
   */
  getAvailableMonths?: (year: string) => string[] | Set<string> | undefined
}

export function formatPeriodLabel(
  selectedYear: string,
  selectedMonth: string,
): string {
  const monthInfo = MONTHS_GRID.find((m) => m.value === selectedMonth)
  if (selectedMonth && monthInfo) {
    if (selectedYear) {
      return `${monthInfo.full} ${selectedYear}`
    }
    return `${monthInfo.full} (все года)`
  }
  if (selectedYear) {
    return selectedYear
  }
  return 'Все года'
}

/**
 * Sorts years strictly chronologically (ascending, earliest first: 2015 -> 2026).
 * Ensures deduplication and ignores invalid/non-numeric values.
 */
export function sortYearsChronologically(years: (string | number)[]): string[] {
  const numeric = years
    .map(String)
    .map((y) => y.trim())
    .filter((y) => y && !isNaN(Number(y)))
  const unique = Array.from(new Set(numeric))
  return unique.sort((a, b) => Number(a) - Number(b))
}

export default function MonthYearDropdown({
  selectedYear,
  onSelectYear,
  selectedMonth,
  onSelectMonth,
  sortedYears,
  currentSeason = resolveActiveSeason(),
  onClearPreset,
  className = '',
  availableMonthsByYear,
  getAvailableMonths,
}: MonthYearDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'years' | 'months'>('years')

  // Chronological order (earliest -> newest, e.g. 2015 -> 2026)
  const chronologicalYears = useMemo(() => {
    const list = sortYearsChronologically(sortedYears)
    return list.length > 0 ? list : [currentSeason || '2026']
  }, [sortedYears, currentSeason])

  // Context year for the month view
  const activeSeason =
    selectedYear ||
    currentSeason ||
    chronologicalYears[chronologicalYears.length - 1] ||
    '2026'

  // Whenever dropdown opens:
  // If a month filter is active, open on 'months'; if whole year or all years, open on 'years'
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setViewMode(selectedMonth ? 'months' : 'years')
    }
    setIsOpen(open)
  }

  // Determine available months for the active season
  const availableMonthsForActiveSeason = useMemo(() => {
    let raw: string[] | Set<string> | undefined
    if (getAvailableMonths) {
      raw = getAvailableMonths(activeSeason)
    } else if (availableMonthsByYear) {
      raw = availableMonthsByYear[activeSeason] || availableMonthsByYear[activeSeason || 'all']
    }
    if (!raw) return null
    return raw instanceof Set ? raw : new Set(raw)
  }, [activeSeason, getAvailableMonths, availableMonthsByYear])

  const isYearDisabled =
    availableMonthsForActiveSeason !== null && availableMonthsForActiveSeason.size === 0

  const isNonDefault =
    Boolean(selectedMonth) || (Boolean(selectedYear) && selectedYear !== currentSeason)

  const triggerLabel = formatPeriodLabel(selectedYear, selectedMonth)

  const trigger = (
    <button
      type="button"
      className={`${toolbarPillTriggerClass(isNonDefault)} ${className}`}
      aria-label={`Период: ${triggerLabel}`}
      title={`Период: ${triggerLabel}`}
    >
      <span className="tabular-nums">{triggerLabel}</span>
      <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform" aria-hidden />
    </button>
  )

  return (
    <ModernDropdown
      trigger={trigger}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      width="280px"
    >
      <div className="p-3 text-xs text-charcoal-800 space-y-2.5">
        {/* Segmented Mode Switcher: Год / Месяц */}
        <div
          className="grid grid-cols-2 p-0.5 rounded-lg bg-cream-100/90 border border-old-money-200/80 gap-0.5"
          role="tablist"
          aria-label="Режим выбора периода"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'years'}
            onClick={() => setViewMode('years')}
            className={`py-1 rounded-md text-xs font-semibold transition-all text-center cursor-pointer ${
              viewMode === 'years'
                ? 'bg-camel-100 text-camel-950 font-semibold shadow-2xs'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-200/60'
            }`}
          >
            Год
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'months'}
            onClick={() => setViewMode('months')}
            className={`py-1 rounded-md text-xs font-semibold transition-all text-center cursor-pointer ${
              viewMode === 'months'
                ? 'bg-camel-100 text-camel-950 font-semibold shadow-2xs'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-200/60'
            }`}
          >
            Месяц
          </button>
        </div>

        {/* View Mode: Years */}
        {viewMode === 'years' && (
          <div role="tabpanel" aria-label="Выбор года" className="space-y-2">
            <button
              type="button"
              onClick={() => {
                onSelectYear('')
                onSelectMonth('')
                onClearPreset?.()
                setIsOpen(false)
              }}
              className={`w-full py-1.5 px-3 rounded-lg text-xs transition-colors border text-center cursor-pointer ${
                !selectedYear && !selectedMonth
                  ? 'bg-camel-100 text-camel-950 font-semibold border-camel-600 shadow-xs'
                  : 'bg-cream-100/70 hover:bg-camel-100 text-charcoal-700 border-old-money-200/60 font-medium'
              }`}
              title="Показать события за все доступные сезоны архива"
            >
              Все года
            </button>

            <div className="space-y-1">
              <div className="text-[11px] font-medium text-charcoal-500 px-0.5">
                Выберите год архива:
              </div>
              <div
                className="grid grid-cols-3 gap-1.5 max-h-52 overflow-y-auto no-scrollbar p-0.5"
                role="grid"
                aria-label="Годы"
              >
                {chronologicalYears.map((year) => {
                  const isSelected = selectedYear === year && !selectedMonth
                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => {
                        onSelectYear(year)
                        onSelectMonth('')
                        onClearPreset?.()
                        setIsOpen(false)
                      }}
                      className={`h-8 rounded-lg text-xs transition-colors tabular-nums font-medium cursor-pointer ${
                        isSelected
                          ? 'bg-camel-100 text-camel-950 font-semibold shadow-xs'
                          : 'bg-cream-100/70 text-charcoal-700 hover:bg-camel-100 hover:text-charcoal-900 border border-old-money-200/60'
                      }`}
                      title={`Сезон ${year}`}
                    >
                      {year}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* View Mode: Months */}
        {viewMode === 'months' && (
          <div role="tabpanel" aria-label="Выбор месяца" className="space-y-2">
            <button
              type="button"
              disabled={isYearDisabled}
              aria-disabled={isYearDisabled}
              onClick={() => {
                if (isYearDisabled) return
                onSelectYear(activeSeason)
                onSelectMonth('')
                onClearPreset?.()
                setIsOpen(false)
              }}
              className={`w-full py-1.5 px-3 rounded-lg text-xs transition-colors border text-center ${
                isYearDisabled
                  ? 'text-charcoal-400/40 bg-cream-50/20 cursor-not-allowed select-none opacity-30 border-transparent'
                  : !selectedMonth
                    ? 'bg-camel-100 text-camel-950 font-semibold border-camel-600 shadow-xs cursor-pointer'
                    : 'bg-cream-100/70 hover:bg-camel-100 text-charcoal-700 border-old-money-200/60 font-medium cursor-pointer'
              }`}
              title={
                isYearDisabled
                  ? 'Все месяцы (нет событий)'
                  : `Все месяцы сезона ${activeSeason}`
              }
            >
              Все месяцы
            </button>

            <div className="space-y-1">
              <div className="text-[11px] font-medium text-charcoal-500 px-0.5">
                Месяцы сезона {activeSeason}:
              </div>

              {/* 4x3 Months Grid */}
              <div className="grid grid-cols-4 gap-1.5" role="grid" aria-label="Месяцы">
                {MONTHS_GRID.map((m) => {
                  const isSelected = selectedMonth === m.value
                  const isAvailable = availableMonthsForActiveSeason
                    ? availableMonthsForActiveSeason.has(m.value)
                    : true
                  return (
                    <button
                      key={m.value}
                      type="button"
                      disabled={!isAvailable}
                      aria-disabled={!isAvailable}
                      onClick={() => {
                        if (!isAvailable) return
                        onSelectYear(activeSeason)
                        onSelectMonth(m.value)
                        onClearPreset?.()
                        setIsOpen(false)
                      }}
                      className={`h-8 rounded-lg text-xs transition-all flex items-center justify-center font-medium ${
                        isSelected
                          ? 'bg-camel-100 text-camel-950 font-semibold shadow-xs cursor-pointer'
                          : !isAvailable
                            ? 'text-charcoal-400/40 bg-cream-50/20 cursor-not-allowed select-none opacity-30 border border-transparent'
                            : 'text-charcoal-700 hover:bg-camel-100 hover:text-charcoal-900 border border-transparent hover:border-old-money-200/60 cursor-pointer'
                      }`}
                      title={!isAvailable ? `${m.full} (нет событий)` : m.full}
                    >
                      {m.short}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Footer: Quick reset if non-default */}
        {isNonDefault && (
          <div className="pt-2 border-t border-old-money-200/60 flex items-center justify-end">
            <button
              type="button"
              onClick={() => {
                onSelectYear(currentSeason)
                onSelectMonth('')
                onClearPreset?.()
                setIsOpen(false)
              }}
              className="text-[11px] text-camel-800 hover:text-camel-950 font-medium hover:underline transition-colors cursor-pointer"
            >
              Сбросить на сезон {currentSeason}
            </button>
          </div>
        )}
      </div>
    </ModernDropdown>
  )
}


