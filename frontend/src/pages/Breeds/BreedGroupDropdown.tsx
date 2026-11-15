import { useState } from 'react'
import { ChevronDown, Check, Layers } from 'lucide-react'
import ModernDropdown from '../../components/ui/ModernDropdown'
import { FCI_GROUPS } from '../../lib/fciGroups'

interface BreedGroupDropdownProps {
  value: string
  onChange: (value: string) => void
  counts: Record<string, number>
}

const QUICK_GROUP_IDS = ['all', '10', '5', '3']

export default function BreedGroupDropdown({
  value,
  onChange,
  counts,
}: BreedGroupDropdownProps) {
  const [open, setOpen] = useState(false)

  // Если выбрана одна из основных быстрых плашек (Все, 10, 5, 3), кнопка называется строго "Ещё группы"
  // и не подсвечивается как дублирующий активный элемент.
  // Если выбрана редкая группа из списка (например, FCI 1, 2, 4 и т.д.), кнопка подсвечивается и выводит её имя.
  const isAll = value === 'all'
  const isQuickGroup = QUICK_GROUP_IDS.includes(value)
  const currentGroup = !isQuickGroup ? FCI_GROUPS[Number(value)] : undefined
  const isDropdownActive = Boolean(currentGroup)

  const triggerLabel = currentGroup ? currentGroup.shortName : 'Ещё группы'

  const trigger = (
    <button
      type="button"
      className={`h-8 rounded-full px-3 text-xs font-semibold whitespace-nowrap cursor-pointer transition-all inline-flex items-center gap-1.5 shrink-0 ${
        isDropdownActive ? 'cs-glass-pill-active' : 'cs-glass-pill'
      }`}
      aria-label={`Классификация пород: ${triggerLabel}`}
      title={`Классификация пород FCI / РКФ: ${triggerLabel}`}
    >
      <Layers className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
      <span className="truncate max-w-[200px] sm:max-w-none">{triggerLabel}</span>
      <ChevronDown className="h-3 w-3 text-charcoal-400 group-hover:text-charcoal-700 transition-transform shrink-0" aria-hidden />
    </button>
  )

  const sortedGroupKeys = Object.keys(FCI_GROUPS).sort(
    (a, b) => FCI_GROUPS[Number(a)].order - FCI_GROUPS[Number(b)].order,
  )

  return (
    <ModernDropdown
      trigger={trigger}
      isOpen={open}
      onOpenChange={setOpen}
      width="300px"
      portal
      closeOnScroll
    >
      {(close) => (
        <div className="p-1 space-y-0.5 text-xs" role="menu">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-charcoal-400 border-b border-old-money-100">
            Группы пород по классификации FCI / РКФ
          </div>

          {/* Все группы */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onChange('all')
              close()
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
              isAll
                ? 'bg-camel-100/90 text-camel-950 font-semibold'
                : 'text-charcoal-700 hover:bg-cream-100/80'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>Все группы пород</span>
              <span className="text-[10px] tabular-nums font-sans px-1.5 py-0.2 rounded-full bg-cream-100 text-charcoal-500">
                {counts['all'] || 82}
              </span>
            </div>
            {isAll && <Check className="h-3.5 w-3.5 text-camel-700 shrink-0 ml-1.5" />}
          </button>

          {/* Список групп по порядку FCI */}
          {sortedGroupKeys.map((key) => {
            const group = FCI_GROUPS[Number(key)]
            const count = counts[key] || 0
            if (count === 0) return null
            const isSelected = value === key

            return (
              <button
                key={key}
                type="button"
                role="menuitem"
                onClick={() => {
                  onChange(key)
                  close()
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
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
