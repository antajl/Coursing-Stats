import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import ModernDropdown from '../../../components/ui/ModernDropdown'
import { toolbarPillTriggerClass } from '../../../lib/toolbar'
import type { ShowExhibitionScope } from '../../../lib/showTypes'

export type ShowScopeFilter = 'all' | ShowExhibitionScope

export interface ShowScopeOption {
  value: ShowScopeFilter
  label: string
  shortLabel: string
  tip: string
  colorClass?: string
}

export const SHOW_SCOPE_OPTIONS: ShowScopeOption[] = [
  {
    value: 'all',
    label: 'Все выставки',
    shortLabel: 'Формат',
    tip: 'Все сертификатные и монопородные выставки',
  },
  {
    value: 'mono',
    label: 'Монопородные (НКП / КЧК)',
    shortLabel: 'Моно',
    tip: 'Выставки Национальных клубов пород рангов ЧК, ПК, КЧК',
    colorClass: 'bg-amber-600',
  },
  {
    value: 'all_breed',
    label: 'Всепородные (САС / CACIB)',
    shortLabel: 'Всепородные',
    tip: 'Выставки всех пород рангов САС, CACIB, ЧРКФ',
    colorClass: 'bg-warm-blue-600',
  },
]

interface ShowScopeDropdownProps {
  selectedScope: ShowScopeFilter
  onSelect: (scope: ShowScopeFilter) => void
  className?: string
  compact?: boolean
}

export default function ShowScopeDropdown({
  selectedScope = 'all',
  onSelect,
  className = '',
  compact = false,
}: ShowScopeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const activeOption = SHOW_SCOPE_OPTIONS.find((opt) => opt.value === selectedScope) || SHOW_SCOPE_OPTIONS[0]
  const isActive = selectedScope !== 'all'

  const trigger = (
    <button
      type="button"
      className={`shrink-0 ${toolbarPillTriggerClass(isActive)} ${className}`}
      aria-label={`Выбор формата выставок: ${activeOption.label}`}
      title={activeOption.tip}
    >
      {activeOption.colorClass && (
        <span className={`h-2 w-2 rounded-full shrink-0 ${activeOption.colorClass}`} aria-hidden />
      )}
      <span className={compact ? 'max-w-[70px] truncate' : undefined}>
        {compact ? activeOption.shortLabel : activeOption.label}
      </span>
      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
    </button>
  )

  return (
    <ModernDropdown
      trigger={trigger}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      width="240px"
    >
      <div className="p-1 space-y-0.5" role="menu">
        {SHOW_SCOPE_OPTIONS.map((opt) => {
          const isSelected = opt.value === selectedScope
          return (
            <button
              key={opt.value}
              type="button"
              role="menuitem"
              onClick={() => {
                onSelect(opt.value)
                setIsOpen(false)
              }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs rounded-md text-left transition-colors ${
                isSelected
                  ? 'bg-camel-100 text-camel-950 font-semibold'
                  : 'text-charcoal-700 hover:bg-camel-50/80 hover:text-charcoal-900'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {opt.colorClass ? (
                  <span className={`h-2 w-2 rounded-full shrink-0 ${opt.colorClass}`} aria-hidden />
                ) : (
                  <span className="h-2 w-2 rounded-full shrink-0 bg-charcoal-300" aria-hidden />
                )}
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{opt.label}</span>
                  <span className="text-[10px] text-charcoal-400 font-normal truncate">
                    {opt.tip}
                  </span>
                </div>
              </div>
              {isSelected && <Check className="h-3.5 w-3.5 text-camel-700 shrink-0 ml-1" />}
            </button>
          )
        })}
      </div>
    </ModernDropdown>
  )
}
