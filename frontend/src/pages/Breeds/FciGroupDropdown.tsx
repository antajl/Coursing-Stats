import React from 'react'
import { ChevronDown, Check, Layers } from 'lucide-react'
import { FCI_GROUPS } from '../../lib/fciGroups'
import ModernDropdown from '../../components/ui/ModernDropdown'
import { toolbarPillTriggerClass } from '../../lib/toolbar'

export interface FciGroupDropdownProps {
  selectedGroup: string
  onSelectGroup: (val: string) => void
  groupCounts: Record<string, number>
  sortedGroupKeys: string[]
  className?: string
}

export const FciGroupDropdown: React.FC<FciGroupDropdownProps> = ({
  selectedGroup,
  onSelectGroup,
  groupCounts,
  sortedGroupKeys,
  className = '',
}) => {
  const isFiltered = selectedGroup !== 'all'
  const groupInfo = isFiltered ? FCI_GROUPS[Number(selectedGroup)] : null
  const label = groupInfo ? groupInfo.shortName : 'Все группы'

  return (
    <ModernDropdown
      trigger={
        <button
          type="button"
          className={toolbarPillTriggerClass(isFiltered, `shrink-0 ${className}`)}
          aria-label="Выбрать группу пород"
        >
          <Layers className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
          <span className="truncate max-w-[110px] sm:max-w-[150px] md:max-w-[170px]">
            {label}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-70 shrink-0" aria-hidden="true" />
        </button>
      }
      width="350px"
      closeOnScroll
      portal
    >
      {(close) => (
        <div className="p-1 space-y-0.5 text-xs" role="menu">
          {/* Все группы */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onSelectGroup('all')
              close()
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
              selectedGroup === 'all'
                ? 'bg-camel-100/90 text-camel-950 font-semibold'
                : 'text-charcoal-700 hover:bg-cream-100/80'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>Все группы пород</span>
              <span className="text-[10px] tabular-nums font-sans px-1.5 py-0.2 rounded-full bg-cream-100 text-charcoal-500">
                {groupCounts['all'] || 82}
              </span>
            </div>
            {selectedGroup === 'all' && <Check className="h-3.5 w-3.5 text-camel-700 shrink-0 ml-1.5" />}
          </button>

          {/* Разделитель */}
          <div className="h-px bg-old-money-100 my-1" />

          {/* Список групп по порядку FCI */}
          {sortedGroupKeys.map((key) => {
            const group = FCI_GROUPS[Number(key)]
            const count = groupCounts[key] || 0
            if (count === 0) return null
            const isSelected = selectedGroup === key

            return (
              <button
                key={key}
                type="button"
                role="menuitem"
                onClick={() => {
                  onSelectGroup(isSelected ? 'all' : key)
                  close()
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-camel-100/90 text-camel-950 font-semibold'
                    : 'text-charcoal-700 hover:bg-cream-100/80'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="truncate">{group.name}</span>
                  <span className="text-[10px] tabular-nums font-sans px-1.5 py-0.2 rounded-full bg-cream-100 text-charcoal-500 shrink-0">
                    {count}
                  </span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-camel-700 shrink-0 ml-1.5" />}
              </button>
            )
          })}
        </div>
      )}
    </ModernDropdown>
  )
}

export default FciGroupDropdown
