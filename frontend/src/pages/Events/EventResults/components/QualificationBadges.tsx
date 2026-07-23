import HoverTooltip from '../../../../components/ui/HoverTooltip'
import {
  categoryBadgeClass,
  classifyCompetitionTitle,
  groupItemsByCategory,
} from '../../../../lib/awardCategories'
import { compareCompetitionTitles } from '../../../../../../backend/lib/competition-titles'

interface QualificationBadgesProps {
  qualification: string
}

const LONG_TITLE_THRESHOLD = 28

export default function QualificationBadges({ qualification }: QualificationBadgesProps) {
  const parts = [...qualification.split(',')]
    .map((t) => t.trim())
    .filter(Boolean)
    .sort(compareCompetitionTitles)

  const groups = groupItemsByCategory(parts, classifyCompetitionTitle)

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1">
      {groups.map((group, gi) => (
        <span key={group.category} className="inline-flex flex-wrap items-center gap-1">
          {gi > 0 ? (
            <span
              className="mx-0.5 h-3 w-px shrink-0 self-center bg-old-money-300 dark:bg-charcoal-500"
              aria-hidden
            />
          ) : null}
          {group.items.map((trimmed, i) => {
            const isLong = trimmed.length > LONG_TITLE_THRESHOLD
            const badge = (
              <span
                className={[
                  'inline-block max-w-full rounded px-1.5 py-0.5 text-xs font-medium',
                  isLong ? 'truncate md:max-w-[220px]' : '',
                  categoryBadgeClass(group.category),
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {trimmed}
              </span>
            )

            return (
              <span key={`${trimmed}-${i}`}>
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
        </span>
      ))}
    </div>
  )
}
