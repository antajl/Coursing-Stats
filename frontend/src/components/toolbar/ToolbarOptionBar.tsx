import { TOOLBAR_SORT_ACTIVE, TOOLBAR_SORT_CHIP, TOOLBAR_SORT_IDLE } from '../../lib/toolbar'

interface ToolbarOptionBarProps {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

export default function ToolbarOptionBar({ label, options, value, onChange }: ToolbarOptionBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-old-money-500 dark:text-old-money-400">{label}</span>
      <div className="inline-flex flex-wrap items-center gap-1.5">
        {options.map((option) => {
          const active = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`${TOOLBAR_SORT_CHIP} ${active ? TOOLBAR_SORT_ACTIVE : TOOLBAR_SORT_IDLE}`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
