import type { ReactNode } from 'react'
import HoverTooltip from '../components/ui/HoverTooltip'
import {
  AWARD_CATEGORY_LABEL,
  classifyCompetitionTitle,
  classifyShowCumulativeTitle,
  groupItemsByCategory,
  type AwardCategory,
} from './awardCategories'
import {
  groupShowAwardsByCategory,
  presentShowAwards,
  SHOW_AWARD_BADGE,
  SHOW_AWARD_LABELS,
  type ShowAwardKey,
  type ShowTitleCounts,
} from '../../../backend/lib/show-award-ranking'
import { formatTitleLine, showAwardBadgeClass, titleBadgeClass, type DogTitle } from './qualificationTitles'

const SEPARATOR_CLASS =
  'mx-0.5 h-3 w-px shrink-0 self-center bg-old-money-300 dark:bg-charcoal-500'

function classifyProfileTitle(title: string): AwardCategory {
  const cum = classifyShowCumulativeTitle(title)
  if (cum) return cum
  return classifyCompetitionTitle(title)
}

/** Рендер чипов выставочных наград с разделителями категорий. */
export function renderShowAwardChips({
  titles,
  keys,
  maxVisible,
  size = 'sm',
  nowrap = false,
}: {
  titles: ShowTitleCounts
  keys?: ShowAwardKey[]
  maxVisible?: number
  size?: 'sm' | 'md'
  /** Одна строка без переноса (карточка рейтинга). */
  nowrap?: boolean
}): ReactNode {
  const allKeys = keys ?? presentShowAwards(titles)
  if (allKeys.length === 0) return null

  const groups = groupShowAwardsByCategory(allKeys)
  const flat: ShowAwardKey[] = groups.flatMap((g) => g.keys)
  const visibleKeys =
    maxVisible != null && flat.length > maxVisible ? flat.slice(0, maxVisible) : flat
  const hiddenKeys =
    maxVisible != null && flat.length > maxVisible ? flat.slice(maxVisible) : []

  const visibleGroups = groupShowAwardsByCategory(visibleKeys)

  const textSize = size === 'sm' ? 'text-[10px]' : 'text-[11px]'
  const pad = 'px-1.5 py-0.5'
  const groupClass = nowrap
    ? 'inline-flex shrink-0 flex-nowrap items-center gap-1'
    : 'inline-flex flex-wrap items-center gap-1'

  return (
    <>
      {visibleGroups.map((group, gi) => (
        <span key={group.category} className={groupClass}>
          {gi > 0 ? <span className={SEPARATOR_CLASS} aria-hidden /> : null}
          {group.keys.map((key) => (
            <HoverTooltip
              key={key}
              label={SHOW_AWARD_LABELS[key]}
              placement="top"
              delayMs={0}
              portal
            >
              <span
                className={`inline-flex shrink-0 items-center gap-0.5 rounded-md font-semibold tabular-nums ${pad} ${textSize} ${showAwardBadgeClass(key)}`}
                tabIndex={0}
              >
                {SHOW_AWARD_BADGE[key]}
                <span className="opacity-80">×{titles[key]}</span>
              </span>
            </HoverTooltip>
          ))}
        </span>
      ))}
      {hiddenKeys.length > 0 ? (
        <>
          <span className={`${SEPARATOR_CLASS} shrink-0`} aria-hidden />
          <HoverTooltip
            label={hiddenKeys
              .map((key) => `${SHOW_AWARD_BADGE[key]} ×${titles[key]} — ${SHOW_AWARD_LABELS[key]}`)
              .join('\n')}
            placement="top"
            delayMs={0}
            portal
          >
            <span
              className={`inline-flex shrink-0 items-center rounded-md bg-old-money-200/80 font-semibold tabular-nums text-charcoal-600 dark:bg-charcoal-600 dark:text-charcoal-200 ${pad} ${textSize}`}
              tabIndex={0}
            >
              +{hiddenKeys.length}
            </span>
          </HoverTooltip>
        </>
      ) : null}
    </>
  )
}

/** Рендер титулов профиля соревнований с группировкой по категориям. */
export function renderGroupedDogTitles(titles: DogTitle[]): ReactNode {
  if (titles.length === 0) return null

  const groups = groupItemsByCategory(titles, (item) => classifyProfileTitle(item.title))

  return (
    <>
      {groups.map((group, gi) => (
        <span key={group.category} className="inline-flex flex-wrap items-center gap-1.5">
          {gi > 0 ? <span className={SEPARATOR_CLASS} aria-hidden /> : null}
          {group.items.map((item) => (
            <HoverTooltip
              key={item.title}
              label={AWARD_CATEGORY_LABEL[group.category]}
              placement="top"
            >
              <span
                className={`inline-flex rounded px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${titleBadgeClass(item.title)}`}
                tabIndex={0}
              >
                {formatTitleLine(item)}
              </span>
            </HoverTooltip>
          ))}
        </span>
      ))}
    </>
  )
}

/** Чипы квалификации события (через запятую) с категориями. */
export function renderQualificationChips(qualification: string | null | undefined): ReactNode {
  if (!qualification?.trim()) return null
  const parts = qualification
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
  if (parts.length === 0) return null

  const groups = groupItemsByCategory(parts, (title) => classifyProfileTitle(title))

  return (
    <>
      {groups.map((group, gi) => (
        <span key={group.category} className="inline-flex flex-wrap items-center gap-1">
          {gi > 0 ? <span className={SEPARATOR_CLASS} aria-hidden /> : null}
          {group.items.map((title) => (
            <span
              key={title}
              className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap ${titleBadgeClass(title)}`}
            >
              {title}
            </span>
          ))}
        </span>
      ))}
    </>
  )
}
