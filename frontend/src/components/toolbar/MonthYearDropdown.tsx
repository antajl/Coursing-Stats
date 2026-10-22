import { useEffect, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
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

export default function MonthYearDropdown({
  selectedYear,
  onSelectYear,
  selectedMonth,
  onSelectMonth,
  sortedYears,
  currentSeason = resolveActiveSeason(),
  onClearPreset,
  className = '',
}: MonthYearDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'months' | 'years'>('months')

  // Fallback years if empty
  const availableYears = sortedYears.length > 0 ? sortedYears : [currentSeason]

  // Track which year is being inspected in the picker view
  const [viewingYear, setViewingYear] = useState<string>(() => {
    return selectedYear || currentSeason || availableYears[0] || '2026'
  })

  // Whenever dropdown opens, sync viewing year and reset to months mode
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setViewingYear(selectedYear || currentSeason || availableYears[0] || '2026')
      setViewMode('months')
    }
    setIsOpen(open)
  }

  // Navigation index in availableYears (descending order, e.g. 2026, 2025...)
  const currentIndex = availableYears.indexOf(viewingYear)
  const isNewest = currentIndex <= 0
  const isOldest = currentIndex === -1 || currentIndex >= availableYears.length - 1

  const handlePrevYear = () => {
    if (!isOldest && currentIndex !== -1) {
      setViewingYear(availableYears[currentIndex + 1])
    }
  }

  const handleNextYear = () => {
    if (!isNewest && currentIndex > 0) {
      setViewingYear(availableYears[currentIndex - 1])
    }
  }

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
      width="276px"
    >
      <div className="p-3 text-xs text-charcoal-800 space-y-2.5">
        {/* Header: All Years Pill + Year Navigator */}
        <div className="flex items-center justify-between pb-2 border-b border-old-money-200/60 gap-1.5">
          <button
            type="button"
            onClick={() => {
              onSelectYear('')
              onSelectMonth('')
              onClearPreset?.()
              setIsOpen(false)
            }}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
              !selectedYear && !selectedMonth
                ? 'bg-camel-500 text-charcoal-900 font-semibold border-camel-600 shadow-xs'
                : 'bg-cream-100/70 hover:bg-camel-100 text-charcoal-700 border-old-money-200/60'
            }`}
          >
            Все года
          </button>

          {viewMode === 'months' ? (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handlePrevYear}
                disabled={isOldest}
                className="p-1 rounded-md text-charcoal-600 hover:bg-camel-100 hover:text-charcoal-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                aria-label="Предыдущий год"
                title="Предыдущий год"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setViewMode('years')}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-charcoal-900 hover:bg-camel-100 hover:text-charcoal-950 transition-colors"
                title="Выбрать другой год"
              >
                <span className="tabular-nums">{viewingYear}</span>
                <ChevronDown className="h-3 w-3 text-charcoal-500" />
              </button>

              <button
                type="button"
                onClick={handleNextYear}
                disabled={isNewest}
                className="p-1 rounded-md text-charcoal-600 hover:bg-camel-100 hover:text-charcoal-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                aria-label="Следующий год"
                title="Следующий год"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setViewMode('months')}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium text-charcoal-600 hover:bg-camel-100 hover:text-charcoal-900 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>К месяцам</span>
            </button>
          )}
        </div>

        {/* View Mode: Months Grid */}
        {viewMode === 'months' && (
          <div className="space-y-2">
            {/* Quick full-year button */}
            <button
              type="button"
              onClick={() => {
                onSelectYear(viewingYear)
                onSelectMonth('')
                onClearPreset?.()
                setIsOpen(false)
              }}
              className={`w-full py-1.5 px-3 rounded-lg text-xs transition-colors border text-center ${
                selectedYear === viewingYear && !selectedMonth
                  ? 'bg-camel-500 text-charcoal-900 font-semibold border-camel-600 shadow-xs'
                  : 'bg-cream-100/70 hover:bg-camel-100 text-charcoal-700 border-old-money-200/60 font-medium'
              }`}
            >
              Весь {viewingYear} год
            </button>

            {/* 4x3 Months Grid */}
            <div className="grid grid-cols-4 gap-1.5" role="grid" aria-label="Месяцы">
              {MONTHS_GRID.map((m) => {
                const isSelected =
                  (selectedYear === viewingYear || (!selectedYear && viewingYear === currentSeason)) &&
                  selectedMonth === m.value
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => {
                      onSelectYear(viewingYear)
                      onSelectMonth(m.value)
                      onClearPreset?.()
                      setIsOpen(false)
                    }}
                    className={`h-8 rounded-lg text-xs transition-all flex items-center justify-center font-medium ${
                      isSelected
                        ? 'bg-camel-500 text-charcoal-900 font-semibold shadow-xs'
                        : 'text-charcoal-700 hover:bg-camel-100 hover:text-charcoal-900 border border-transparent hover:border-old-money-200/60'
                    }`}
                    title={m.full}
                  >
                    {m.short}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* View Mode: Years Grid */}
        {viewMode === 'years' && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-medium text-charcoal-500 px-1">
              Выберите год архива:
            </div>
            <div className="grid grid-cols-3 gap-1.5 max-h-52 overflow-y-auto no-scrollbar p-0.5">
              {availableYears.map((year) => {
                const isCurrentViewing = year === viewingYear
                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => {
                      setViewingYear(year)
                      setViewMode('months')
                    }}
                    className={`h-8 rounded-lg text-xs transition-colors tabular-nums font-medium ${
                      isCurrentViewing
                        ? 'bg-camel-500 text-charcoal-900 font-semibold shadow-xs'
                        : 'bg-cream-100/60 text-charcoal-700 hover:bg-camel-100 hover:text-charcoal-900'
                    }`}
                  >
                    {year}
                  </button>
                )
              })}
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
