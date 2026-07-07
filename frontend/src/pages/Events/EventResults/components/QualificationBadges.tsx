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
            ? 'border border-camel-300 dark:border-camel-600 bg-camel-100 dark:bg-camel-700/40 text-camel-800 dark:text-camel-200'
            : isCACL && !isReg
              ? 'border border-old-money-300 dark:border-charcoal-500 bg-old-money-100 dark:bg-charcoal-700 text-old-money-800 dark:text-old-money-200'
              : isReg
                ? 'border border-old-money-200 dark:border-charcoal-600 bg-cream-100 dark:bg-charcoal-800 text-charcoal-600 dark:text-charcoal-300'
                : 'border border-old-money-200 dark:border-charcoal-600 bg-cream-50 dark:bg-charcoal-800 text-charcoal-500 dark:text-charcoal-400',
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
