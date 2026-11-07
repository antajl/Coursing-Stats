import { ChevronDown } from 'lucide-react'
import DogSexIcon from '../../../components/DogSexIcon'
import ModernDropdown from '../../../components/ui/ModernDropdown'
import { toolbarPillTriggerClass } from '../../../lib/toolbar'

export function sexLabel(sex: string): string {
  if (sex === 'С') return 'Сука'
  if (sex === 'К') return 'Кобель'
  return sex
}

interface DoninoSexDropdownProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  sexes: string[]
  filterSexes: string[]
  sexTriggerLabel: string
  onSelectSex: (sex: string) => void
}

export function DoninoSexDropdown({
  isOpen,
  onOpenChange,
  sexes,
  filterSexes,
  sexTriggerLabel,
  onSelectSex,
}: DoninoSexDropdownProps) {
  return (
    <ModernDropdown
      trigger={
        <button
          type="button"
          className={toolbarPillTriggerClass(filterSexes.length > 0)}
        >
          {sexTriggerLabel}
          <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
        </button>
      }
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      width="130px"
    >
      {isOpen ? (
      <div className="p-1" role="menu">
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onSelectSex('')
            onOpenChange(false)
          }}
          className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
            filterSexes.length === 0
              ? 'bg-camel-100 text-camel-950 font-semibold'
              : 'text-charcoal-700 hover:bg-camel-100'
          }`}
        >
          Любой пол
        </button>
        {sexes.map((sex) => {
          const active = filterSexes.includes(sex)
          return (
            <button
              key={sex}
              type="button"
              role="menuitem"
              onClick={() => {
                onSelectSex(sex)
                onOpenChange(false)
              }}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                active
                  ? 'bg-camel-100 text-camel-950 font-semibold'
                  : 'text-charcoal-700 hover:bg-camel-100'
              }`}
            >
              <DogSexIcon sex={sex} />
              <span>{sexLabel(sex)}</span>
            </button>
          )
        })}
      </div>
      ) : null}
    </ModernDropdown>
  )
}
