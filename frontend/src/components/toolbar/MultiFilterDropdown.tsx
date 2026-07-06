import type { ReactNode } from 'react'
import { Icons } from '../../lib/icons'
import { TOOLBAR_FILTER_BTN, TOOLBAR_FILTER_PANEL } from '../../lib/toolbar'

interface MultiFilterDropdownProps {
  label: string
  selectedCount: number
  open: boolean
  onToggle: () => void
  children: ReactNode
  className?: string
}

export default function MultiFilterDropdown({
  label,
  selectedCount,
  open,
  onToggle,
  children,
  className = '',
}: MultiFilterDropdownProps) {
  const ChevronDown = Icons.chevronDown
  const displayLabel = selectedCount > 0 ? `${label}: ${selectedCount}` : label

  return (
    <div className={`relative w-fit shrink-0 text-left ${className}`}>
      <button type="button" onClick={onToggle} className={`${TOOLBAR_FILTER_BTN} flex w-full`} aria-expanded={open}>
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-charcoal-500 transition-transform ${open ? 'rotate-180' : ''}`}
          strokeWidth={2}
        />
      </button>
      {open && <div className={TOOLBAR_FILTER_PANEL}>{children}</div>}
    </div>
  )
}
