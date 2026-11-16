import { useState } from 'react'
import { ArrowUpDown, Check, ChevronDown } from 'lucide-react'
import ModernDropdown from '../../components/ui/ModernDropdown'

export type ShowJudgeSortKey =
  | 'exhibitions'
  | 'dogs'
  | 'breeds'
  | 'strictness_strict'
  | 'strictness_soft'
  | 'name'

export interface ShowJudgeSortOption {
  value: ShowJudgeSortKey
  label: string
  shortLabel: string
}

export const SHOW_JUDGE_SORT_OPTIONS: ShowJudgeSortOption[] = [
  { value: 'exhibitions', label: 'По числу выставок', shortLabel: 'Выставки' },
  { value: 'dogs', label: 'По числу собак', shortLabel: 'Собаки' },
  { value: 'breeds', label: 'По числу пород', shortLabel: 'Породы' },
  { value: 'strictness_strict', label: 'По строгости (сначала строгие)', shortLabel: 'Строгие' },
  { value: 'strictness_soft', label: 'По строгости (сначала лояльные)', shortLabel: 'Лояльные' },
  { value: 'name', label: 'По алфавиту (А–Я)', shortLabel: 'А–Я' },
]

interface ShowJudgeSortDropdownProps {
  value: ShowJudgeSortKey
  onChange: (sort: ShowJudgeSortKey) => void
  compact?: boolean
}

export default function ShowJudgeSortDropdown({
  value,
  onChange,
  compact: _compact = false,
}: ShowJudgeSortDropdownProps) {
  const [open, setOpen] = useState(false)
  const currentOption =
    SHOW_JUDGE_SORT_OPTIONS.find((o) => o.value === value) || SHOW_JUDGE_SORT_OPTIONS[0]

  const trigger = (
    <button
      type="button"
      className="group inline-flex min-h-[32px] items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold text-charcoal-800 hover:text-camel-900 hover:bg-cream-200/50 active:bg-cream-200 transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-camel-500/50"
      aria-label={`Сортировка судей: ${currentOption.label}`}
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
      width="240px"
      portal
      closeOnScroll
    >
      {(close) => (
        <div className="p-1 space-y-0.5 text-xs" role="menu">
          {SHOW_JUDGE_SORT_OPTIONS.map((opt) => {
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
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
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
