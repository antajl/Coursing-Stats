import type { ReactNode } from 'react'
import HoverTooltip from '../components/ui/HoverTooltip'
import {
  AWARD_CATEGORY_LABEL,
  categoryBadgeClass,
  classifyCompetitionTitle,
  groupItemsByCategory,
  type AwardCategory,
} from './awardCategories'
import {
  groupShowAwardsByCategory,
  matchShowAwardToken,
  presentShowAwards,
  SHOW_AWARD_BADGE,
  type ShowAwardKey,
  type ShowTitleCounts,
} from '../../../backend/lib/show-award-ranking'
import { compareCompetitionTitles } from '../../../backend/lib/competition-titles'
import {
  classifyDogProfileTitle,
  compareDogProfileTitles,
  formatTitleLine,
  showAwardBadgeClass,
  titleBadgeClass,
  type DogTitle,
} from './qualificationTitles'
import { awardTooltipForKey, awardTooltipList } from './awardTooltip'

const SEPARATOR_CLASS =
  'mx-0.5 h-3 w-px shrink-0 self-center bg-old-money-300 dark:bg-charcoal-500'

/** Квалификация события / история — только competition. */
function classifyEventTitle(title: string): AwardCategory {
  return classifyCompetitionTitle(title)
}

function sortTitlesByCoolness(titles: string[]): string[] {
  return [...titles].sort(compareCompetitionTitles)
}

function sortDogTitlesByCoolness(titles: DogTitle[]): DogTitle[] {
  return [...titles].sort((a, b) => compareDogProfileTitles(a.title, b.title))
}

/** Рендер чипов выставочных наград с разделителями категорий. */
export function renderShowAwardChips({
  titles,
  keys,
  maxVisible,
  size = 'sm',
  nowrap = false,
  showCounts = true,
}: {
  titles: ShowTitleCounts
  keys?: ShowAwardKey[]
  maxVisible?: number
  size?: 'sm' | 'md'
  /** Одна строка без переноса (карточка рейтинга). */
  nowrap?: boolean
  /** ×N на бейдже; выкл. для одной выставки в истории. */
  showCounts?: boolean
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
              label={awardTooltipForKey(key, showCounts ? titles[key] : undefined)}
              placement="top"
              variant="site"
              delayMs={0}
              portal
            >
              <span
                className={`inline-flex shrink-0 items-center gap-0.5 rounded-md font-semibold tabular-nums ${pad} ${textSize} ${showAwardBadgeClass(key)}`}
                tabIndex={0}
              >
                {SHOW_AWARD_BADGE[key]}
                {showCounts ? <span className="opacity-80">×{titles[key]}</span> : null}
              </span>
            </HoverTooltip>
          ))}
        </span>
      ))}
      {hiddenKeys.length > 0 ? (
        <>
          <span className={`${SEPARATOR_CLASS} shrink-0`} aria-hidden />
          <HoverTooltip
            label={awardTooltipList(
              hiddenKeys.map((key) => ({
                key,
                count: showCounts ? titles[key] : undefined,
              })),
            )}
            placement="top"
            variant="site"
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

/** Рендер титулов профиля (курсинг / бега / выставки) с группировкой по категориям. */
export function renderGroupedDogTitles(titles: DogTitle[]): ReactNode {
  if (titles.length === 0) return null

  const sorted = sortDogTitlesByCoolness(titles)
  const groups = groupItemsByCategory(sorted, (item) => classifyDogProfileTitle(item.title))

  return (
    <>
      {groups.map((group, gi) => (
        <span key={group.category} className="inline-flex flex-wrap items-center gap-1.5">
          {gi > 0 ? <span className={SEPARATOR_CLASS} aria-hidden /> : null}
          {group.items.map((item) => {
            const showKey = matchShowAwardToken(item.title)
            return (
              <HoverTooltip
                key={item.title}
                label={
                  showKey
                    ? awardTooltipForKey(showKey, item.count)
                    : AWARD_CATEGORY_LABEL[group.category]
                }
                placement="top"
                variant={showKey ? 'site' : 'default'}
                delayMs={showKey ? 0 : undefined}
                portal={Boolean(showKey)}
              >
                <span
                  className={`inline-flex rounded px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${titleBadgeClass(item.title)}`}
                  tabIndex={0}
                >
                  {formatTitleLine(item)}
                </span>
              </HoverTooltip>
            )
          })}
        </span>
      ))}
    </>
  )
}

/** Чипы квалификации события (через запятую) с категориями и сортировкой по крутости. */
export function renderQualificationChips(qualification: string | null | undefined): ReactNode {
  if (!qualification?.trim()) return null
  const parts = sortTitlesByCoolness(
    qualification
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean),
  )
  if (parts.length === 0) return null

  const groups = groupItemsByCategory(parts, (title) => classifyEventTitle(title))

  return (
    <>
      {groups.map((group, gi) => (
        <span key={group.category} className="inline-flex flex-wrap items-center gap-1">
          {gi > 0 ? <span className={SEPARATOR_CLASS} aria-hidden /> : null}
          {group.items.map((title) => (
            <span
              key={title}
              className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap ${categoryBadgeClass(classifyEventTitle(title))}`}
            >
              {title}
            </span>
          ))}
        </span>
      ))}
    </>
  )
}
