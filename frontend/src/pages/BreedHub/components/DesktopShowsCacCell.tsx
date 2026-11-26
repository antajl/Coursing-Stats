import { memo } from 'react'
import { Link } from 'react-router-dom'
import DogSexIcon from '../../../components/DogSexIcon'
import HoverTooltip from '../../../components/ui/HoverTooltip'
import { awardTooltipForKey } from '../../../lib/awardTooltip'
import { parseDogName } from '../../../lib/dogName'
import { breedToSlug } from '../../../lib/breedMapping'
import type { AnnualShowDogLeader } from '../../../hooks/useStaticData'
import { DesktopEmptyCell, type DesktopCellProps } from './DesktopRowCells'

export const DesktopShowsCacCell = memo(function DesktopShowsCacCell({
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
  const bis = item.titles?.BIS || 0
  const bisV = item.titles?.BIS_VETERAN || 0
  const bisJ = item.titles?.BIS_JUNIOR || 0
  const big = item.titles?.BIG || 0
  const bob = item.titles?.BOB || 0
  const bos = item.titles?.BOS || 0
  const chrkf = (item.titles?.CHRKF || 0) + (item.titles?.VCHRKF || 0) + (item.titles?.YCHRKF || 0)
  const tooltipTitle = `Лидер всепородных выставок САС ${item.year} года: ${item.total_shows} выставок, ${(item.rank_score ?? 0).toLocaleString('ru-RU')} очков`
  const slug = breedToSlug(canonicalKey)
  const dogProfileId = item.competition_dog_id != null ? item.competition_dog_id : item.dog_id

  return (
    <div className="flex items-center gap-2 w-full min-w-0" title={tooltipTitle}>
      <div className="w-14 shrink-0 text-center">
        <Link
          to={`/shows/?tab=ranking&year=${item.year}&breed=${encodeURIComponent(slug)}&scope=all_breed`}
          className="inline-block px-2 py-0.5 rounded-full font-bold font-sans tabular-nums text-xs bg-camel-100 hover:bg-camel-200 active:scale-95 text-camel-950 border border-camel-200/80 transition-all shadow-2xs cursor-pointer"
          title={`Открыть рейтинг выставок ${item.year} года`}
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
          {item.total_shows} выст.
        </div>
        <div className="flex items-center justify-end gap-1 flex-wrap">
          {bis > 0 && (
            <HoverTooltip
              label={awardTooltipForKey('BIS', bis)}
              placement="top"
              variant="site"
              delayMs={0}
              portal
            >
              <span
                tabIndex={0}
                className="inline-flex items-center px-1.5 py-0.5 rounded font-sans font-bold text-[10px] leading-none bg-amber-100 text-amber-900 border border-amber-300 cursor-help"
              >
                BIS {bis > 1 ? bis : ''}
              </span>
            </HoverTooltip>
          )}
          {bis === 0 && bisV > 0 && (
            <HoverTooltip
              label={awardTooltipForKey('BIS_VETERAN', bisV)}
              placement="top"
              variant="site"
              delayMs={0}
              portal
            >
              <span
                tabIndex={0}
                className="inline-flex items-center px-1.5 py-0.5 rounded font-sans font-bold text-[10px] leading-none bg-amber-100 text-amber-900 border border-amber-300 cursor-help"
              >
                BIS-V {bisV > 1 ? bisV : ''}
              </span>
            </HoverTooltip>
          )}
          {bis === 0 && bisV === 0 && bisJ > 0 && (
            <HoverTooltip
              label={awardTooltipForKey('BIS_JUNIOR', bisJ)}
              placement="top"
              variant="site"
              delayMs={0}
              portal
            >
              <span
                tabIndex={0}
                className="inline-flex items-center px-1.5 py-0.5 rounded font-sans font-bold text-[10px] leading-none bg-amber-100 text-amber-900 border border-amber-300 cursor-help"
              >
                BIS-J {bisJ > 1 ? bisJ : ''}
              </span>
            </HoverTooltip>
          )}
          {big > 0 && (
            <HoverTooltip
              label={awardTooltipForKey('BIG', big)}
              placement="top"
              variant="site"
              delayMs={0}
              portal
            >
              <span
                tabIndex={0}
                className="inline-flex items-center px-1.5 py-0.5 rounded font-sans font-semibold text-[10px] leading-none bg-camel-100 text-camel-900 border border-camel-300 cursor-help"
              >
                BIG {big > 1 ? big : ''}
              </span>
            </HoverTooltip>
          )}
          {bob > 0 && (
            <HoverTooltip
              label={awardTooltipForKey('BOB', bob)}
              placement="top"
              variant="site"
              delayMs={0}
              portal
            >
              <span
                tabIndex={0}
                className="inline-flex items-center px-1.5 py-0.5 rounded font-sans font-medium text-[10px] leading-none bg-cream-100 text-charcoal-700 border border-cream-300 cursor-help"
              >
                BOB {bob}
              </span>
            </HoverTooltip>
          )}
          {bis === 0 && bisV === 0 && bisJ === 0 && big === 0 && bob === 0 && bos > 0 && (
            <HoverTooltip
              label={awardTooltipForKey('BOS', bos)}
              placement="top"
              variant="site"
              delayMs={0}
              portal
            >
              <span
                tabIndex={0}
                className="inline-flex items-center px-1.5 py-0.5 rounded font-sans font-medium text-[10px] leading-none bg-cream-100 text-charcoal-700 border border-cream-300 cursor-help"
              >
                BOS {bos}
              </span>
            </HoverTooltip>
          )}
          {bis === 0 && bisV === 0 && bisJ === 0 && big === 0 && bob === 0 && bos === 0 && chrkf > 0 && (
            <HoverTooltip
              label={awardTooltipForKey('CHRKF', chrkf)}
              placement="top"
              variant="site"
              delayMs={0}
              portal
            >
              <span
                tabIndex={0}
                className="inline-flex items-center px-1.5 py-0.5 rounded font-sans font-medium text-[10px] leading-none bg-cream-100 text-charcoal-700 border border-cream-300 cursor-help"
              >
                ЧРКФ {chrkf > 1 ? chrkf : ''}
              </span>
            </HoverTooltip>
          )}
          {bis === 0 && bisV === 0 && bisJ === 0 && big === 0 && bob === 0 && bos === 0 && chrkf === 0 && (
            <span className="text-[11px] font-sans font-medium text-camel-800 tabular-nums">
              {(item.rank_score ?? 0).toLocaleString('ru-RU')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
})
