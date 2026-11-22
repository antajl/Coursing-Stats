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
    const kchk = titles.KCHK || 0
    const vkchk = titles.VKCHK || 0
    const ykchk = titles.YKCHK || 0
    const kchkCount = kchk + vkchk + ykchk

    const kchp = titles.KCHP || 0
    const vkchp = titles.VKCHP || 0
    const ykchp = titles.YKCHP || 0
    const kchpCount = kchp + vkchp + ykchp

    const ss = titles.SS || 0
    const vss = titles.VSS || 0
    const yss = titles.YSS || 0
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

    return (
      <div className="flex items-center justify-end gap-1 flex-nowrap shrink-0">
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
              КЧК {kchkCount}
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
              КЧП {kchpCount}
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
  const pRussia = (titles.P_RUSSIA || 0) + (titles.P_MOSCOW || 0)

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
      {bis === 0 && bisV === 0 && bisJ === 0 && big === 0 && bob === 0 && bos === 0 && chrkf === 0 && pRussia > 0 && (
        <HoverTooltip
          label={awardTooltipForKey('P_RUSSIA', pRussia)}
          placement="top"
          variant="site"
          delayMs={0}
          portal
        >
          <span
            tabIndex={0}
            className="inline-flex items-center px-1.5 py-0.5 rounded font-sans font-medium text-[10px] leading-none bg-cream-100 text-charcoal-700 border border-cream-300 cursor-help"
          >
            П «России» {pRussia > 1 ? pRussia : ''}
          </span>
        </HoverTooltip>
      )}
    </div>
  )
})
