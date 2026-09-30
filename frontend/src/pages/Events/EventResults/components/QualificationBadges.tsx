import HoverTooltip from '../../../../components/ui/HoverTooltip'
import {
  categoryBadgeClass,
  classifyCompetitionTitle,
  groupItemsByCategory,
} from '../../../../lib/awardCategories'
import {
  compareCompetitionTitles,
  competitionTitleDisplayName,
} from '../../../../../../backend/lib/competition-titles'
import { awardTooltipForCompetitionTitle } from '../../../../lib/awardTooltip'

interface QualificationBadgesProps {
  qualification: string
}

export default function QualificationBadges({ qualification }: QualificationBadgesProps) {
  const parts = [...qualification.split(',')]
    .map((t) => t.trim())
    .filter(Boolean)
    .sort(compareCompetitionTitles)

  // Check if this is a league transition (Абсолют, Чемпионов, Прогресс, Юниор)
  const leagueTransitions = ['Абсолют', 'Чемпионов', 'Прогресс', 'Юниор']
  const isLeagueTransition = parts.some(p => leagueTransitions.includes(p))

  if (isLeagueTransition) {
    return (
      <div className="flex flex-wrap items-center gap-1">
        {parts.map((raw, i) => {
          if (leagueTransitions.includes(raw)) {
            return (
              <HoverTooltip
                key={`league-${i}`}
                label={`Перешёл в лигу «${raw}»`}
                placement="top"
                variant="site"
                delayMs={0}
                portal
              >
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-camel-700 bg-camel-100 rounded-md px-1.5 py-0.5 whitespace-nowrap cursor-help">
                  → {raw}
                </span>
              </HoverTooltip>
            )
          }
          // Regular qualification titles
          const badge = competitionTitleDisplayName(raw)
          return (
            <HoverTooltip
              key={`${badge}-${i}`}
              label={awardTooltipForCompetitionTitle(raw)}
              placement="top"
              variant="site"
              delayMs={0}
              portal
            >
              <span
                className={`inline-flex rounded-md px-1.5 py-0.5 text-xs font-semibold whitespace-nowrap ${categoryBadgeClass(classifyCompetitionTitle(raw))}`}
                tabIndex={0}
              >
                {badge}
              </span>
            </HoverTooltip>
          )
        })}
      </div>
    )
  }

  const groups = groupItemsByCategory(parts, classifyCompetitionTitle)

  return (
    <div className="flex flex-wrap items-center gap-1">
      {groups.map((group, gi) => (
        <span key={group.category} className="inline-flex flex-wrap items-center gap-1">
          {gi > 0 ? (
            <span
              className="mx-0.5 h-3 w-px shrink-0 self-center bg-old-money-300"
              aria-hidden
            />
          ) : null}
          {group.items.map((raw, i) => {
            const badge = competitionTitleDisplayName(raw)
            return (
              <HoverTooltip
                key={`${badge}-${i}`}
                label={awardTooltipForCompetitionTitle(raw)}
                placement="top"
                variant="site"
                delayMs={0}
                portal
              >
                <span
                  className={`inline-flex rounded-md px-1.5 py-0.5 text-xs font-semibold whitespace-nowrap ${categoryBadgeClass(group.category)}`}
                  tabIndex={0}
                >
                  {badge}
                </span>
              </HoverTooltip>
            )
          })}
        </span>
      ))}
    </div>
  )
}
