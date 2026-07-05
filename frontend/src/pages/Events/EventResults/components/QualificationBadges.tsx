import HoverTooltip from '../../../../components/ui/HoverTooltip'

interface QualificationBadgesProps {
  qualification: string
}

const LONG_TITLE_THRESHOLD = 28

export default function QualificationBadges({ qualification }: QualificationBadgesProps) {
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {qualification.split(',').map((title, i) => {
        const trimmed = title.trim()
        const titleLower = trimmed.toLowerCase()
        const isChampion = titleLower.includes('чемпион') || titleLower.includes('champion')
        const isCACL = titleLower.includes('cacl')
        const isReg = titleLower.includes('reg')
        const isLong = trimmed.length > LONG_TITLE_THRESHOLD

        const badgeClass = [
          'inline-block max-w-full rounded px-1.5 py-0.5 text-xs font-medium',
          isLong ? 'truncate md:max-w-[220px]' : '',
          isChampion
            ? 'border border-camel-300 bg-camel-100 text-camel-800 dark:border-camel-600 dark:bg-camel-900 dark:text-camel-300'
            : isCACL
              ? 'border border-camel-200 bg-camel-50 text-camel-800 dark:border-camel-700 dark:bg-camel-950/40 dark:text-camel-300'
              : isReg
                ? 'border border-old-money-300 bg-old-money-100 text-old-money-700 dark:border-charcoal-500 dark:bg-charcoal-700 dark:text-old-money-300'
                : 'border border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400',
        ].filter(Boolean).join(' ')

        const badge = <span className={badgeClass}>{trimmed}</span>

        return (
          <span key={i}>
            {isLong ? (
              <HoverTooltip label={trimmed} placement="bottom">
                {badge}
              </HoverTooltip>
            ) : (
              badge
            )}
          </span>
        )
      })}
    </div>
  )
}
