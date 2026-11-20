import type { ReactNode } from 'react'
import { Crown } from 'lucide-react'
import HoverTooltip from '../../components/ui/HoverTooltip'
import { matchShowAwardToken } from '../../../../backend/lib/show-award-ranking'
import { competitionTitleDisplayName } from '../../../../backend/lib/competition-titles'
import {
  compareDogProfileTitles,
  formatTitleLine,
  isOfficialDogTitleToken,
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

function cleanDisciplineSuffix(title: string): string {
  return title.replace(/\s*\((?:КБ|ББ|БЗМП|LC|LR)\)/gi, '').trim()
}

type DogProfileAwardsBarProps = {
  supremeTitles?: DogTitle[]
  coursingTitles?: DogTitle[]
  racingTitles?: DogTitle[]
  competitionTitles?: DogTitle[]
  showTitles: DogTitle[]
  achievements?: DogAchievementItem[]
  titleExplanations?: Record<string, string>
}

export function DogProfileAwardsBar({
  supremeTitles = [],
  coursingTitles = [],
  racingTitles = [],
  competitionTitles = [],
  showTitles,
  achievements = [],
  titleExplanations = {},
}: DogProfileAwardsBarProps): ReactNode {
  // Оставляем ТОЛЬКО официальные чемпионские звания РКФ/FCI (без сертификатов, без расстановок дня BIS/BIG/ЛПП и без клубных лиг)
  const pureSupremeTitles = supremeTitles.filter(
    (item) => isOfficialDogTitleToken(item.title, 'sport') || isOfficialDogTitleToken(item.title, 'show'),
  )
  const pureCoursingTitles = coursingTitles.filter((item) => isOfficialDogTitleToken(item.title, 'sport'))
  const pureRacingTitles = racingTitles.filter((item) => isOfficialDogTitleToken(item.title, 'sport'))
  const pureCompTitles = competitionTitles.filter((item) => isOfficialDogTitleToken(item.title, 'sport'))
  const pureShowTitles = showTitles.filter((item) => isOfficialDogTitleToken(item.title, 'show'))

  const hasSupreme = pureSupremeTitles.length > 0
  const hasCoursing = pureCoursingTitles.length > 0
  const hasRacing = pureRacingTitles.length > 0
  const hasComp = pureCompTitles.length > 0
  const hasShow = pureShowTitles.length > 0
  const hasAchievements = achievements.length > 0

  if (!hasSupreme && !hasCoursing && !hasRacing && !hasComp && !hasShow && !hasAchievements) return null

  const sortedSupreme = [...pureSupremeTitles].sort((a, b) =>
    compareDogProfileTitles(a.title, b.title),
  )
  const sortedCoursing = [...pureCoursingTitles].sort((a, b) =>
    compareDogProfileTitles(a.title, b.title),
  )
  const sortedRacing = [...pureRacingTitles].sort((a, b) =>
    compareDogProfileTitles(a.title, b.title),
  )
  const sortedComp = [...pureCompTitles].sort((a, b) =>
    compareDogProfileTitles(a.title, b.title),
  )
  const sortedShow = [...pureShowTitles].sort((a, b) =>
    compareDogProfileTitles(a.title, b.title),
  )

  const renderChip = (item: DogTitle, keyPrefix: string) => {
    const isSupreme = keyPrefix === 'supreme'
    const isShow = keyPrefix === 'show'
    const showKey = matchShowAwardToken(item.title)
    // ВАЖНО: для выставок титул «ЧР» — это Чемпион России (не путать с «ЧР РК»)
    const rawBadgeTitle = isShow
      ? (/^(ЧР|ЮЧР|ВЧР|ЧРКФ|ЮЧРКФ|ВЧРКФ|ГЧР|ЮГЧР|ВГЧР|ЧНКП|ЮЧНКП|ВЧНКП|ЧП|ЮЧП|ВЧП|ШОУ ЧР)$/i.test(item.title)
          ? item.title
          : (showKey ? item.title : item.title))
      : competitionTitleDisplayName(item.title)

    // В строках «Курсинг», «Рейсинг» и «Высшие звания» опускаем суффиксы дисциплин (КБ / ББ)
    const badgeTitle = (keyPrefix === 'coursing' || keyPrefix === 'racing' || keyPrefix === 'supreme')
      ? cleanDisciplineSuffix(rawBadgeTitle)
      : rawBadgeTitle

    const line = formatTitleLine({ title: badgeTitle, count: item.count })
    const explanation =
      titleExplanations[`${keyPrefix}:${badgeTitle}`] ||
      titleExplanations[`${keyPrefix}:${item.title}`] ||
      titleExplanations[badgeTitle] ||
      titleExplanations[item.title]

    const chipClass = isSupreme
      ? 'border border-amber-500/80 bg-gradient-to-r from-amber-50 via-cream-50 to-amber-100/60 text-amber-950 font-bold shadow-2xs hover:border-amber-600'
      : titleBadgeClass(badgeTitle)

    return (
      <HoverTooltip
        key={`${keyPrefix}-${badgeTitle}`}
        label={
          explanation ? (
            <div className="flex flex-col gap-1 max-w-xs text-left">
              <div className="flex items-center gap-1.5 font-bold text-xs text-charcoal-900">
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold ${chipClass}`}>
                  {isSupreme && <Crown className="h-3 w-3 text-amber-600 shrink-0" aria-hidden />}
                  <span>{badgeTitle}</span>
                </span>
                <span className="text-[11px] font-medium leading-snug">
                  {awardTooltipForDogTitle(item.title, item.count, isShow)}
                </span>
              </div>
              <p className="text-[11px] leading-snug text-charcoal-600 font-normal border-t border-cream-200/80 pt-1 mt-0.5">
                {explanation}
              </p>
            </div>
          ) : (
            awardTooltipForDogTitle(item.title, item.count, isShow)
          )
        }
        placement="top"
        variant="site"
        delayMs={0}
        portal
      >
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums whitespace-nowrap transition-transform hover:scale-105 ${chipClass}`}
          tabIndex={0}
        >
          {isSupreme && <Crown className="h-3 w-3 text-amber-600 shrink-0" aria-hidden />}
          <span>{line}</span>
        </span>
      </HoverTooltip>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-6">
      {/* СЛЕВА: Титулы высших званий, курсинга, рейсинга и выставок */}
      {(hasSupreme || hasCoursing || hasRacing || hasComp || hasShow) && (
        <div className="space-y-1.5 min-w-0 flex-1">
          {hasSupreme && (
            <div className="grid grid-cols-[6.5rem_1fr] items-baseline gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700/90 select-none flex items-center gap-1">
                <Crown className="h-3 w-3 text-amber-600 shrink-0" aria-hidden />
                <span>Высшие</span>
              </span>
              <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                {sortedSupreme.map((item) => renderChip(item, 'supreme'))}
              </div>
            </div>
          )}

          {hasCoursing && (
            <div className="grid grid-cols-[6.5rem_1fr] items-baseline gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 select-none">
                Курсинг
              </span>
              <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                {sortedCoursing.map((item) => renderChip(item, 'coursing'))}
              </div>
            </div>
          )}

          {hasRacing && (
            <div className="grid grid-cols-[6.5rem_1fr] items-baseline gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 select-none">
                Рейсинг
              </span>
              <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                {sortedRacing.map((item) => renderChip(item, 'racing'))}
              </div>
            </div>
          )}

          {hasComp && !hasCoursing && !hasRacing && (
            <div className="grid grid-cols-[6.5rem_1fr] items-baseline gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 select-none">
                Спорт
              </span>
              <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                {sortedComp.map((item) => renderChip(item, 'comp'))}
              </div>
            </div>
          )}

          {hasShow && (
            <div className="grid grid-cols-[6.5rem_1fr] items-baseline gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 select-none">
                Выставки
              </span>
              <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                {sortedShow.map((item) => renderChip(item, 'show'))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* СПРАВА: Сезонные ачивки рейтинга (вертикально друг под другом, параллельно строкам титулов) */}
      {hasAchievements && (
        <div className="flex flex-col gap-1.5 shrink-0 items-start lg:items-end justify-center">
          {achievements.slice(0, 3).map((ach) => (
            <HoverTooltip key={ach.id} label={ach.tooltip} placement="top" portal>
              <div
                className={`cs-glass-pill inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums whitespace-nowrap transition-transform hover:scale-105 cursor-default ${ach.color}`}
                tabIndex={0}
              >
                {ach.icon}
                <span className="truncate">{ach.label}</span>
                {ach.sublabel && (
                  <span className="text-[10px] font-normal text-charcoal-500 truncate">· {ach.sublabel}</span>
                )}
              </div>
            </HoverTooltip>
          ))}
        </div>
      )}
    </div>
  )
}
