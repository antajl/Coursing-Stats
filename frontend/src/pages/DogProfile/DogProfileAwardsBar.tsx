import type { ReactNode } from 'react'
import HoverTooltip from '../../components/ui/HoverTooltip'
import { matchShowAwardToken } from '../../../../backend/lib/show-award-ranking'
import { competitionTitleDisplayName } from '../../../../backend/lib/competition-titles'
import {
  compareDogProfileTitles,
  formatTitleLine,
  titleBadgeClass,
  type DogTitle,
} from '../../lib/qualificationTitles'
import { awardTooltipForDogTitle } from '../../lib/awardTooltip'

export interface DogAchievementItem {
  id: string
  label: string
  sublabel?: string
  icon: ReactNode
  color: string
  tooltip: string
}

type DogProfileAwardsBarProps = {
  competitionTitles: DogTitle[]
  showTitles: DogTitle[]
  achievements?: DogAchievementItem[]
}

function isCertificateToken(rawTitle: string): boolean {
  const norm = rawTitle.toUpperCase().replace(/\s+/g, '')
  return (
    norm.startsWith('CAC') ||
    norm.startsWith('REGCAC') ||
    norm.startsWith('RCAC') ||
    norm.startsWith('R.CAC') ||
    norm === 'CC' ||
    norm === 'ЮСС' ||
    norm === 'СС' ||
    norm.startsWith('КЧК') ||
    norm.startsWith('ЮКЧК') ||
    norm.includes('CACL') ||
    norm.includes('CACIL')
  )
}

export function DogProfileAwardsBar({
  competitionTitles,
  showTitles,
  achievements = [],
}: DogProfileAwardsBarProps): ReactNode {
  // Оставляем только полноценные титулы
  const pureCompTitles = competitionTitles.filter((item) => !isCertificateToken(item.title))
  const pureShowTitles = showTitles.filter((item) => !isCertificateToken(item.title))

  const hasComp = pureCompTitles.length > 0
  const hasShow = pureShowTitles.length > 0
  const hasAchievements = achievements.length > 0

  if (!hasComp && !hasShow && !hasAchievements) return null

  const sortedComp = [...pureCompTitles].sort((a, b) =>
    compareDogProfileTitles(a.title, b.title),
  )
  const sortedShow = [...pureShowTitles].sort((a, b) =>
    compareDogProfileTitles(a.title, b.title),
  )

  const renderChip = (item: DogTitle, keyPrefix: string) => {
    const showKey = matchShowAwardToken(item.title)
    const badgeTitle = showKey ? item.title : competitionTitleDisplayName(item.title)
    const line = formatTitleLine({ title: badgeTitle, count: item.count })

    return (
      <HoverTooltip
        key={`${keyPrefix}-${badgeTitle}`}
        label={awardTooltipForDogTitle(item.title, item.count)}
        placement="top"
        variant="site"
        delayMs={0}
        portal
      >
        <span
          className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums whitespace-nowrap transition-transform hover:scale-105 ${titleBadgeClass(badgeTitle)}`}
          tabIndex={0}
        >
          {line}
        </span>
      </HoverTooltip>
    )
  }

  return (
    <div className="mt-3.5 pt-3 border-t border-old-money-200/70">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-3 lg:gap-6 items-center">
        {/* СЛЕВА: Титулы спорта и выставок */}
        <div className="space-y-1.5 min-w-0">
          {hasComp && (
            <div className="grid grid-cols-[4.5rem_1fr] sm:grid-cols-[5rem_1fr] items-baseline gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 select-none">
                Спорт
              </span>
              <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                {sortedComp.map((item) => renderChip(item, 'comp'))}
              </div>
            </div>
          )}

          {hasShow && (
            <div className="grid grid-cols-[4.5rem_1fr] sm:grid-cols-[5rem_1fr] items-baseline gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 select-none">
                Выставки
              </span>
              <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                {sortedShow.map((item) => renderChip(item, 'show'))}
              </div>
            </div>
          )}
        </div>

        {/* СПРАВА: Ачивки и рейтинги (максимум 2 в строку / 2 колонки) */}
        {hasAchievements && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 shrink-0 pt-1 lg:pt-0 border-t lg:border-t-0 border-old-money-100 max-w-full lg:max-w-md">
            {achievements.map((ach) => (
              <HoverTooltip key={ach.id} label={ach.tooltip} placement="top" portal>
                <div
                  className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums whitespace-nowrap transition-transform hover:scale-105 justify-start ${ach.color}`}
                  tabIndex={0}
                >
                  {ach.icon}
                  <span className="truncate">{ach.label}</span>
                  {ach.sublabel && (
                    <span className="text-[10px] font-normal opacity-75 truncate">· {ach.sublabel}</span>
                  )}
                </div>
              </HoverTooltip>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
