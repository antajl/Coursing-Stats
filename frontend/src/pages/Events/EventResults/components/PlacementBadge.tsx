import type { Result } from '../types'

interface PlacementBadgeProps {
  result: Result
}

export default function PlacementBadge({ result }: PlacementBadgeProps) {
  if (result.status === 'disqualified') {
    return (
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-100 dark:bg-red-900 border-2 border-red-500 dark:border-red-600 flex items-center justify-center">
        <svg className="w-4 h-4 md:w-6 md:h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    )
  }

  if (result.status === 'dns') {
    return (
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-gray-400 dark:border-gray-500 flex items-center justify-center">
        <svg className="w-4 h-4 md:w-6 md:h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    )
  }

  if (result.placement === 1) {
    return (
      <div className="placement-badge-gold w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs md:text-sm">
        {result.placement}
      </div>
    )
  }

  if (result.placement === 2) {
    return (
      <div className="placement-badge-silver w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs md:text-sm">
        {result.placement}
      </div>
    )
  }

  if (result.placement === 3) {
    return (
      <div className="placement-badge-bronze w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs md:text-sm">
        {result.placement}
      </div>
    )
  }

  if (result.placement) {
    return (
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-old-money-200 dark:bg-charcoal-600 border border-old-money-300 dark:border-charcoal-500 flex items-center justify-center text-old-money-700 dark:text-old-money-300 font-bold text-xs md:text-sm">
        {result.placement}
      </div>
    )
  }

  return null
}
