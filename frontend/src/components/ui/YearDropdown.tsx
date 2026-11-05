import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import ModernDropdown from './ModernDropdown'
import { toolbarPillTriggerClass } from '../../lib/toolbar'
import { resolveActiveSeason } from '../../lib/season'
import { sortYearsChronologically } from '../toolbar/MonthYearDropdown'

export interface YearDropdownProps {
  /** List of available years */
  years: (string | number)[]
  /** Currently selected year, or '' for all years */
  selectedYear: string
  /** Active / default season (e.g. '2026') */
  currentSeason?: string
  /** Callback when a year is selected ('' for all years) */
  onSelectYear?: (year: string) => void
  /** Backwards compatibility alias for onSelectYear */
  onSelect?: (year: string) => void
  /** Optional custom trigger node. If omitted, standard toolbar pill trigger is rendered */
  trigger?: React.ReactNode
  /** Optional custom class for the trigger/container */
  className?: string
  /** Width of the dropdown (defaults to '270px') */
  width?: string
  /** Label for all years button (defaults to 'Все года') */
  allYearsLabel?: string
  /** Title/hint for all years button */
  allYearsTitle?: string
  /** Header label above years grid (defaults to 'Выберите сезон:') */
  subtitle?: string
  /** Sort order of years in grid: 'asc' (2015->2026, default like in Archive) or 'desc' (2026->2015) */
  sortOrder?: 'asc' | 'desc'
  /** Controlled open state */
  isOpen?: boolean
  /** Controlled open change handler */
  onOpenChange?: (open: boolean) => void
}

export default function YearDropdown({
  years,
  selectedYear,
  currentSeason = resolveActiveSeason(),
  onSelectYear,
  onSelect,
  trigger,
  className = '',
  width = '270px',
  allYearsLabel = 'Все года',
  allYearsTitle = 'Показать данные за все доступные сезоны',
  subtitle = 'Выберите сезон:',
  sortOrder = 'asc',
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
}: YearDropdownProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isControlled = controlledIsOpen !== undefined
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen

  const setIsOpen = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalIsOpen(nextOpen)
    }
    controlledOnOpenChange?.(nextOpen)
  }

  const handleSelect = (year: string) => {
    onSelectYear?.(year)
    onSelect?.(year)
    setIsOpen(false)
  }

  // Chronological list of years (2015 -> 2026 by default)
  const displayYears = useMemo(() => {
    const list = sortYearsChronologically(years)
    const sorted = sortOrder === 'desc' ? [...list].reverse() : list
    return sorted.length > 0 ? sorted : [currentSeason || '2026']
  }, [years, sortOrder, currentSeason])

  const isNonDefault =
    Boolean(selectedYear) && selectedYear !== currentSeason

  const triggerLabel = selectedYear || allYearsLabel

  const effectiveTrigger = trigger ?? (
    <button
      type="button"
      className={`${toolbarPillTriggerClass(isNonDefault)} ${className}`}
      aria-label={`Сезон: ${triggerLabel}`}
      title={`Сезон: ${triggerLabel}`}
    >
      <span className="tabular-nums">{triggerLabel}</span>
      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70 transition-transform" aria-hidden />
    </button>
  )

  return (
    <ModernDropdown
      trigger={effectiveTrigger}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      width={width}
      className={className}
    >
      <div className="p-3 text-xs text-charcoal-800 space-y-2.5">
        {/* Full width button: Все года */}
        <button
          type="button"
          onClick={() => handleSelect('')}
          className={`w-full py-1.5 px-3 rounded-lg text-xs transition-colors border text-center cursor-pointer ${
            !selectedYear
              ? 'bg-camel-100 text-camel-950 font-semibold border-camel-600 shadow-xs'
              : 'bg-cream-100/70 hover:bg-camel-100 text-charcoal-700 border-old-money-200/60 font-medium'
          }`}
          title={allYearsTitle}
        >
          {allYearsLabel}
        </button>

        {/* 3-column Year Grid */}
        <div className="space-y-1">
          <div className="text-[11px] font-medium text-charcoal-500 px-0.5">
            {subtitle}
          </div>
          <div
            className="grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto no-scrollbar p-0.5"
            role="grid"
            aria-label="Годы"
          >
            {displayYears.map((year) => {
              const isSelected = selectedYear === year
              return (
                <button
                  key={year}
                  type="button"
                  onClick={() => handleSelect(year)}
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

        {/* Footer: Quick reset if non-default */}
        {isNonDefault && (
          <div className="pt-2 border-t border-old-money-200/60 flex items-center justify-end">
            <button
              type="button"
              onClick={() => handleSelect(currentSeason)}
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
