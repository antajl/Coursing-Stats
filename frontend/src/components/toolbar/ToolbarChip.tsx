import type { ReactNode } from 'react'
import { TOOLBAR_CHIP, TOOLBAR_CHIP_ACTIVE, TOOLBAR_CHIP_IDLE } from '../../lib/toolbar'

interface ToolbarChipProps {
  active?: boolean
  onClick?: () => void
  children: ReactNode
  className?: string
  type?: 'button' | 'submit'
}

export default function ToolbarChip({
  active = false,
  onClick,
  children,
  className = '',
  type = 'button',
}: ToolbarChipProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${TOOLBAR_CHIP} ${active ? TOOLBAR_CHIP_ACTIVE : TOOLBAR_CHIP_IDLE} ${className}`}
    >
      {children}
    </button>
  )
}
