import type { ReactNode } from 'react'
import {
  SHOW_AWARD_BADGE,
  SHOW_AWARD_LABELS,
  displayShowAwardToken,
  matchShowAwardToken,
  type ShowAwardKey,
} from '../../../backend/lib/show-award-ranking'
import {
  competitionTitleDisplayName,
  competitionTitleKey,
  competitionTitleLabel,
  isKnownCompetitionTitleKey,
} from '../../../backend/lib/competition-titles'
import { showAwardBadgeClass, titleBadgeClass } from './qualificationTitles'

/** Окошко тултипа: бейдж + полное название (как в справке). */
export function AwardTooltipRow({
  badge,
  label,
  badgeClass,
}: {
  badge: string
  label: string
  badgeClass: string
}): ReactNode {
  return (
    <div className="flex items-start gap-2 text-left">
      <span
        className={`mt-0.5 inline-flex shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${badgeClass}`}
      >
        {badge}
      </span>
      <span className="min-w-0 text-[11px] leading-snug text-charcoal-800 dark:text-charcoal-100">
        {label}
      </span>
    </div>
  )
}

export function awardTooltipForKey(key: ShowAwardKey, count?: number): ReactNode {
  const badge =
    count != null && count > 1 ? `${SHOW_AWARD_BADGE[key]} ×${count}` : SHOW_AWARD_BADGE[key]
  return (
    <AwardTooltipRow
      badge={badge}
      label={SHOW_AWARD_LABELS[key]}
      badgeClass={showAwardBadgeClass(key)}
    />
  )
}

/** Тултип рабочего титула (курсинг / БЗМП / бега) — тот же layout, что у выставок. */
export function awardTooltipForCompetitionTitle(raw: string, count?: number): ReactNode {
  const key = competitionTitleKey(raw)
  const badgeBase = competitionTitleDisplayName(raw, key)
  const badge = count != null && count > 1 ? `${badgeBase} ×${count}` : badgeBase
  return (
    <AwardTooltipRow
      badge={badge}
      label={competitionTitleLabel(raw, key)}
      badgeClass={titleBadgeClass(badgeBase)}
    />
  )
}

export function awardTooltipForToken(token: string): ReactNode {
  const showKey = matchShowAwardToken(token)
  if (showKey) return awardTooltipForKey(showKey)
  const key = competitionTitleKey(token)
  if (isKnownCompetitionTitleKey(key)) return awardTooltipForCompetitionTitle(token)
  const badge = displayShowAwardToken(token)
  return (
    <AwardTooltipRow badge={badge} label={token} badgeClass={titleBadgeClass(token)} />
  )
}

/** Тултип чипа шапки профиля (выставка или курсинг/беги). */
export function awardTooltipForDogTitle(title: string, count?: number): ReactNode {
  const showKey = matchShowAwardToken(title)
  if (showKey) return awardTooltipForKey(showKey, count)
  return awardTooltipForCompetitionTitle(title, count)
}

export function awardTooltipList(
  items: Array<{ key?: ShowAwardKey; token?: string; count?: number }>,
): ReactNode {
  return (
    <div className="flex min-w-[14rem] max-w-[20rem] flex-col gap-2">
      {items.map((item, i) => {
        if (item.key) {
          return <div key={`${item.key}-${i}`}>{awardTooltipForKey(item.key, item.count)}</div>
        }
        return (
          <div key={`${item.token}-${i}`}>{awardTooltipForToken(item.token || '')}</div>
        )
      })}
    </div>
  )
}
