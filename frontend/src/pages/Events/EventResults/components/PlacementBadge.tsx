import type { Result } from '../types'
import HoverTooltip from '../../../../components/ui/HoverTooltip'

interface PlacementBadgeProps {
  result: Result
}

export default function PlacementBadge({ result }: PlacementBadgeProps) {
  if (result.status === 'disqualified') {
    return (
      <HoverTooltip label="Отстранение" placement="top" variant="site" delayMs={0} portal>
        <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-red-100 dark:bg-red-900 border-2 border-red-500 dark:border-red-600 flex items-center justify-center cursor-help">
          <svg className="w-3 h-3 md:w-4 md:h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </HoverTooltip>
    )
  }

  if (result.status === 'dns') {
    return (
      <HoverTooltip label="Неявка" placement="top" variant="site" delayMs={0} portal>
        <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-gray-400 dark:border-gray-500 flex items-center justify-center cursor-help">
          <svg className="w-3 h-3 md:w-4 md:h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </HoverTooltip>
    )
  }

  if (result.placement === 1) {
    return (
      <HoverTooltip label="1 место" placement="top" variant="site" delayMs={0} portal>
        <div className="placement-badge-gold w-6 h-6 md:w-7 md:h-7 rounded-full border-2 flex items-center justify-center font-bold text-[10px] md:text-xs cursor-help">
          {result.placement}
        </div>
      </HoverTooltip>
    )
  }

  if (result.placement === 2) {
    return (
      <HoverTooltip label="2 место" placement="top" variant="site" delayMs={0} portal>
        <div className="placement-badge-silver w-6 h-6 md:w-7 md:h-7 rounded-full border-2 flex items-center justify-center font-bold text-[10px] md:text-xs cursor-help">
          {result.placement}
        </div>
      </HoverTooltip>
    )
  }

  if (result.placement === 3) {
    return (
      <HoverTooltip label="3 место" placement="top" variant="site" delayMs={0} portal>
        <div className="placement-badge-bronze w-6 h-6 md:w-7 md:h-7 rounded-full border-2 flex items-center justify-center font-bold text-[10px] md:text-xs cursor-help">
          {result.placement}
        </div>
      </HoverTooltip>
    )
  }

  if (result.placement) {
    return (
      <HoverTooltip label={`${result.placement} место`} placement="top" variant="site" delayMs={0} portal>
        <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-old-money-200 dark:bg-charcoal-600 border border-old-money-300 dark:border-charcoal-500 flex items-center justify-center text-old-money-700 dark:text-old-money-300 font-bold text-[10px] md:text-xs cursor-help">
          {result.placement}
        </div>
      </HoverTooltip>
    )
  }

  return null
}
