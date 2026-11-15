import { useState } from 'react'
import { ArrowUpDown, Check, ChevronDown } from 'lucide-react'
import ModernDropdown from '../../components/ui/ModernDropdown'

export type BreedSortKey = 'dogs' | 'starts' | 'speed' | 'seasons' | 'name'

export interface BreedSortOption {
  value: BreedSortKey
  label: string
  shortLabel: string
}

export const BREED_SORT_OPTIONS: BreedSortOption[] = [
  { value: 'dogs', label: 'По числу собак', shortLabel: 'Собаки' },
  { value: 'starts', label: 'По числу забегов', shortLabel: 'Забеги' },
  { value: 'speed', label: 'По рекорду скорости', shortLabel: 'Скорость' },
  { value: 'seasons', label: 'По числу сезонов', shortLabel: 'Сезоны' },
  { value: 'name', label: 'По алфавиту (А–Я)', shortLabel: 'А–Я' },
]

interface BreedSortDropdownProps {
  value: BreedSortKey
  onChange: (sort: BreedSortKey) => void
}

export default function BreedSortDropdown({
  value,
  onChange,
}: BreedSortDropdownProps) {
  const [open, setOpen] = useState(false)
  const currentOption = BREED_SORT_OPTIONS.find((o) => o.value === value) || BREED_SORT_OPTIONS[0]

  const trigger = (
    <button
      type="button"
      className="group inline-flex min-h-[32px] items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold text-charcoal-800 hover:text-camel-900 hover:bg-cream-200/50 active:bg-cream-200 transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-camel-500/50"
      aria-label={`Сортировка пород: ${currentOption.label}`}
      title={`Сортировка: ${currentOption.label}`}
    >
      <ArrowUpDown className="h-3.5 w-3.5 text-camel-700 group-hover:text-camel-900 transition-colors shrink-0" aria-hidden />
      <span className="truncate">
        <span className="sm:hidden">{currentOption.shortLabel}</span>
        <span className="hidden sm:inline">{currentOption.label}</span>
      </span>
      <ChevronDown className="h-3.5 w-3.5 text-camel-600/80 group-hover:text-camel-900 transition-transform duration-150 shrink-0" aria-hidden />
    </button>
  )

  return (
    <ModernDropdown
      trigger={trigger}
      isOpen={open}
      onOpenChange={setOpen}
      width="230px"
      portal
      closeOnScroll
    >
      {(close) => (
        <div className="p-1 space-y-0.5 text-xs" role="menu">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-charcoal-400 border-b border-old-money-100">
            Сортировка пород
          </div>
          {BREED_SORT_OPTIONS.map((opt) => {
            const isSelected = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitem"
                onClick={() => {
                  onChange(opt.value)
                  close()
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                  isSelected
                    ? 'bg-camel-100/90 text-camel-950 font-semibold'
                    : 'text-charcoal-700 hover:bg-cream-100/80'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-camel-700 shrink-0 ml-1.5" />}
              </button>
            )
          })}
        </div>
      )}
    </ModernDropdown>
  )
}
