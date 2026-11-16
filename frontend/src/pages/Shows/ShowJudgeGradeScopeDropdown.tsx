import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import ModernDropdown from '../../components/ui/ModernDropdown'
import { toolbarPillTriggerClass } from '../../lib/toolbar'
import type { GradeScope } from '../../components/ShowJudgeCard'

export interface ScopeOption {
  value: GradeScope
  label: string
  triggerLabel: string
  description: string
}

export const GRADE_SCOPE_OPTIONS: ScopeOption[] = [
  {
    value: 'all',
    label: 'Все собаки',
    triggerLabel: 'Все',
    description: 'Взрослые + щенки суммарно',
  },
  {
    value: 'adult',
    label: 'Взрослые классы (CAC)',
    triggerLabel: 'Взрослые',
    description: 'Оценки: отлично, оч. хор, хор',
  },
  {
    value: 'puppy',
    label: 'Щенки и бэби',
    triggerLabel: 'Щенки',
    description: 'Оценки: оч. перспективный, персп.',
  },
]

interface ShowJudgeGradeScopeDropdownProps {
  gradeScope: GradeScope
  onGradeScopeChange: (scope: GradeScope) => void
  className?: string
}

export default function ShowJudgeGradeScopeDropdown({
  gradeScope,
  onGradeScopeChange,
  className = '',
}: ShowJudgeGradeScopeDropdownProps) {
  const [open, setOpen] = useState(false)

  const currentOption =
    GRADE_SCOPE_OPTIONS.find((opt) => opt.value === gradeScope) ||
    GRADE_SCOPE_OPTIONS.find((opt) => opt.value === 'adult') ||
    GRADE_SCOPE_OPTIONS[0]

  const isNonDefault = gradeScope !== 'adult'

  const trigger = (
    <button
      type="button"
      className={`${toolbarPillTriggerClass(isNonDefault)} shrink-0 ${className}`}
      aria-label="Классы собак"
      title={`Классы: ${currentOption.label}`}
    >
      <span>Классы</span>
      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70 transition-transform" aria-hidden />
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
          {GRADE_SCOPE_OPTIONS.map((opt) => {
            const isSelected = opt.value === gradeScope
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitem"
                onClick={() => {
                  onGradeScopeChange(opt.value)
                  close()
                }}
                className={`w-full flex items-start justify-between px-2.5 py-2 rounded-md text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-camel-100/90 text-camel-950 font-semibold'
                    : 'text-charcoal-700 hover:bg-cream-100/80'
                }`}
              >
                <div className="flex flex-col gap-0.5 min-w-0 pr-1">
                  <span className="text-xs font-semibold leading-tight">{opt.label}</span>
                  <span
                    className={`text-[10px] leading-tight ${
                      isSelected ? 'text-camel-800' : 'text-charcoal-400'
                    }`}
                  >
                    {opt.description}
                  </span>
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 text-camel-700 shrink-0 ml-1 mt-0.5" aria-hidden />
                )}
              </button>
            )
          })}
        </div>
      )}
    </ModernDropdown>
  )
}
