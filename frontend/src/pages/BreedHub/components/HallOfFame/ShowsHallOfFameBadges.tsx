import { memo } from 'react'
import HoverTooltip from '../../../../components/ui/HoverTooltip'
import { awardTooltipForKey } from '../../../../lib/awardTooltip'

interface ShowsHallOfFameBadgesProps {
  isMono: boolean
  titles?: Record<string, number>
}

export const ShowsHallOfFameBadges = memo(function ShowsHallOfFameBadges({
  isMono,
  titles = {},
}: ShowsHallOfFameBadgesProps) {
  if (isMono) {
    const pkCount =
      (titles.P_RUSSIA || 0) +
      (titles.P_MOSCOW || 0) +
      (titles.VP_RUSSIA || 0) +
      (titles.VP_MOSCOW || 0) +
      (titles.YP_RUSSIA || 0) +
      (titles.YP_MOSCOW || 0)
    const kchkCount =
      (titles.KCHK || 0) +
      (titles.VKCHK || 0) +
      (titles.YKCHK || 0) +
      (titles.KCHP || 0) +
      (titles.VKCHP || 0) +
      (titles.YKCHP || 0)
    const ssCount =
      (titles.SS || 0) +
      (titles.VSS || 0) +
      (titles.YSS || 0)

    return (
      <div className="flex items-center justify-end gap-1 flex-nowrap shrink-0">
        {pkCount > 0 && (
          <HoverTooltip
            label={awardTooltipForKey('P_RUSSIA', pkCount)}
            placement="top"
            variant="site"
            delayMs={0}
            portal
          >
            <span
              tabIndex={0}
              className="inline-flex items-center px-1.5 py-0.5 rounded font-sans font-bold text-[10px] leading-none bg-amber-100 text-amber-900 border border-amber-300 cursor-help"
            >
              ПК {pkCount > 1 ? pkCount : ''}
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
              КЧК {kchkCount}
            </span>
          </HoverTooltip>
        )}
        {pkCount === 0 && kchkCount === 0 && ssCount > 0 && (
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
      </div>
    )
  }

  // All-breed awards (strictly ring nominations and official RKF diplomas)
  const bis = titles.BIS || 0
  const bisV = titles.BIS_VETERAN || 0
  const bisJ = titles.BIS_JUNIOR || 0
  const big = titles.BIG || 0
  const bob = titles.BOB || 0
  const bos = titles.BOS || 0
  const chrkf = (titles.CHRKF || 0) + (titles.VCHRKF || 0) + (titles.YCHRKF || 0)

  return (
    <div className="flex items-center justify-end gap-1 flex-nowrap shrink-0">
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
      {((bis === 0 && big === 0) || (bis === 0 && big > 0) || (bis > 0 && big === 0)) && bob > 0 && (
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
    </div>
  )
})
