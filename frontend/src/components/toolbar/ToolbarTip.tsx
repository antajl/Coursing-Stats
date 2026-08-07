import type { ReactNode } from 'react'
import HoverTooltip from '../ui/HoverTooltip'

/**
 * Подсказка для контролов PageToolbar.
 * Тот же паттерн, что у чипов наград выставок: `HoverTooltip` + `delayMs={0}` + `portal`
 * (мгновенно, без native `title`, не клиппится overflow).
 */
export default function ToolbarTip({
  label,
  children,
  className = '',
}: {
  label: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <HoverTooltip label={label} placement="bottom" delayMs={0} portal className={className}>
      {children}
    </HoverTooltip>
  )
}
