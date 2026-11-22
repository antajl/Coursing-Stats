import { memo } from 'react'
import { Link } from 'react-router-dom'
import DogSexIcon from '../../../components/DogSexIcon'
import HoverTooltip from '../../../components/ui/HoverTooltip'
import { awardTooltipForKey } from '../../../lib/awardTooltip'
import { parseDogName } from '../../../lib/dogName'
import { breedToSlug } from '../../../lib/breedMapping'
import type { AnnualShowDogLeader } from '../../../hooks/useStaticData'
import { DesktopEmptyCell, type DesktopCellProps } from './DesktopRowCells'

export const DesktopShowsMonoCell = memo(function DesktopShowsMonoCell({
  item,
  year,
  canonicalKey,
}: DesktopCellProps<AnnualShowDogLeader>) {
  if (!item) {
    return <DesktopEmptyCell year={year} />
  }

  const { primary, secondary } = parseDogName(item.name_lat, item.name_ru)
  const isMale = item.sex === 'M' || item.sex === 'К'
  const isFemale = item.sex === 'F' || item.sex === 'С'
  const sexVal = isMale ? 'm' : isFemale ? 'f' : ''

  const kchk = item.titles?.KCHK || 0
  const vkchk = item.titles?.VKCHK || 0
  const ykchk = item.titles?.YKCHK || 0
  const kchkCount = kchk + vkchk + ykchk

  const kchp = item.titles?.KCHP || 0
  const vkchp = item.titles?.VKCHP || 0
  const ykchp = item.titles?.YKCHP || 0
  const kchpCount = kchp + vkchp + ykchp

  const ss = item.titles?.SS || 0
  const vss = item.titles?.VSS || 0
  const yss = item.titles?.YSS || 0
  const ssCount = ss + vss + yss

  const effectiveKchk = kchk + kchp * 2 + Math.floor(ss / 3)
  const isChNkp = effectiveKchk >= 4
  const effectiveYkchk = ykchk + ykchp * 2 + Math.floor(yss / 3)
  const isYchNkp = !isChNkp && effectiveYkchk >= 3
  const effectiveVkchk = vkchk + vkchp * 2 + Math.floor(vss / 3)
  const isVchNkp = !isChNkp && !isYchNkp && effectiveVkchk >= 3

  const normativeBadge = isChNkp
    ? { badge: 'ЧНКП ✓', title: `Норматив Чемпиона Клуба (ЧНКП) выполнен: зачтено ${effectiveKchk} КЧК при норме 4` }
    : isYchNkp
      ? { badge: 'ЮЧНКП ✓', title: `Норматив Юного Чемпиона Клуба выполнен: зачтено ${effectiveYkchk} ЮКЧК при норме 3` }
      : isVchNkp
        ? { badge: 'ВЧНКП ✓', title: `Норматив Ветерана Чемпиона Клуба выполнен: зачтено ${effectiveVkchk} ВКЧК при норме 3` }
        : null

  const tooltipTitle = `Победитель монопородных выставок НКП ${item.year} года: ${item.total_shows} смотров${isChNkp ? ', норматив ЧНКП выполнен' : ''}${kchkCount > 0 ? `, ${kchkCount} КЧК` : ''}`
  const slug = breedToSlug(canonicalKey)
  const dogProfileId = item.competition_dog_id != null ? item.competition_dog_id : item.dog_id

  return (
    <div className="flex items-center gap-2 w-full min-w-0" title={tooltipTitle}>
      <div className="w-14 shrink-0 text-center">
        <Link
          to={`/shows/?tab=calendar&year=${item.year}&breed=${encodeURIComponent(slug)}&scope=mono`}
          className="inline-block px-2 py-0.5 rounded-full font-bold font-sans tabular-nums text-xs bg-camel-100 hover:bg-camel-200 active:scale-95 text-camel-950 border border-camel-200/80 transition-all shadow-2xs cursor-pointer"
          title={`Монопородный календарь НКП ${item.year} года`}
        >
          {item.year}
        </Link>
      </div>

      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center gap-1 min-w-0">
          <Link
            to={`/dog/${dogProfileId}/`}
            className="font-medium text-camel-950 hover:text-camel-800 hover:underline truncate block text-sm"
            title={primary}
          >
            {primary}
          </Link>
          {sexVal && (
            <span title={isMale ? 'Кобель' : 'Сука'} className="inline-flex shrink-0">
              <DogSexIcon sex={sexVal} size={12} variant="colored" />
            </span>
          )}
        </div>
        {secondary && (
          <span className="text-[11px] text-charcoal-500 block leading-tight truncate" title={secondary}>
            {secondary}
          </span>
        )}
      </div>

      <div className="w-[114px] xl:w-[124px] shrink-0 text-right flex flex-col items-end gap-0.5">
        <div className="text-[11px] font-sans font-medium text-charcoal-600 leading-tight">
          НКП · {item.total_shows} смотр.
        </div>
        <div className="flex items-center justify-end gap-1 flex-wrap">
          {normativeBadge && (
            <HoverTooltip
              label={normativeBadge.title}
              placement="top"
              variant="site"
              delayMs={0}
              portal
            >
              <span
                tabIndex={0}
                className="inline-flex items-center px-1.5 py-0.5 rounded font-sans font-bold text-[10px] leading-none bg-amber-500/15 text-amber-900 border border-amber-500/60 cursor-help"
              >
                {normativeBadge.badge}
              </span>
            </HoverTooltip>
          )}
          {kchkCount > 0 && (
            <HoverTooltip
              label={awardTooltipForKey('KCHK', kchkCount)}
              placement="top"
              variant="site"
              delayMs={0}
              portal
            >
              <span
                tabIndex={0}
                className="inline-flex items-center px-1.5 py-0.5 rounded font-sans font-medium text-[10px] leading-none bg-cream-100 text-charcoal-700 border border-cream-300 cursor-help"
              >
                КЧК {kchkCount > 1 ? kchkCount : ''}
              </span>
            </HoverTooltip>
          )}
          {kchkCount === 0 && kchpCount > 0 && (
            <HoverTooltip
              label={awardTooltipForKey('KCHP', kchpCount)}
              placement="top"
              variant="site"
              delayMs={0}
              portal
            >
              <span
                tabIndex={0}
                className="inline-flex items-center px-1.5 py-0.5 rounded font-sans font-medium text-[10px] leading-none bg-cream-100 text-charcoal-700 border border-cream-300 cursor-help"
              >
                КЧП {kchpCount > 1 ? kchpCount : ''}
              </span>
            </HoverTooltip>
          )}
          {kchkCount === 0 && kchpCount === 0 && ssCount > 0 && (
            <HoverTooltip
              label={awardTooltipForKey('SS', ssCount)}
              placement="top"
              variant="site"
              delayMs={0}
              portal
            >
              <span
                tabIndex={0}
                className="inline-flex items-center px-1.5 py-0.5 rounded font-sans font-medium text-[10px] leading-none bg-cream-100 text-charcoal-700 border border-cream-300 cursor-help"
              >
                СС {ssCount}
              </span>
            </HoverTooltip>
          )}
          {!normativeBadge && kchkCount === 0 && kchpCount === 0 && ssCount === 0 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded font-sans font-medium text-[10px] leading-none bg-cream-100 text-charcoal-700 border border-cream-300">
              НКП
            </span>
          )}
        </div>
      </div>
    </div>
  )
})
