import { useRef, useState } from 'react'
import { TOOLTIP } from '../../../lib/constants'
import HoverTooltip from '../../../components/ui/HoverTooltip'
import { awardTooltipForToken, awardTooltipList } from '../../../lib/awardTooltip'
import { SHOW_AWARD_CHIP_CLASS } from '../../../lib/ShowGradeChip'
import {
  displayShowAwardToken,
  matchShowAwardToken,
  SHOW_AWARD_WEIGHTS,
} from '../../../../../backend/lib/show-award-ranking'
import { splitShowTitleTokens } from '../showExhibitionUtils'

/** В таблице: один бейдж + «хвостик» следующего; hover — прокрутка ряда. */
export function TitleChips({ title }: { title: string }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  const tokens = splitShowTitleTokens(title)
  if (tokens.length === 0) return null

  const ranked = [...tokens].sort((a, b) => {
    const ka = matchShowAwardToken(a)
    const kb = matchShowAwardToken(b)
    const wa = ka ? SHOW_AWARD_WEIGHTS[ka] : 0
    const wb = kb ? SHOW_AWARD_WEIGHTS[kb] : 0
    return wb - wa
  })

  const scrollToEnd = () => {
    const track = trackRef.current
    const viewport = viewportRef.current
    if (!track || !viewport) return
    setOffset(Math.max(0, track.scrollWidth - viewport.clientWidth))
  }

  const scrollHome = () => setOffset(0)

  const chips = (
    <div
      ref={trackRef}
      className="flex w-max flex-nowrap items-center gap-1 transition-transform duration-700 ease-out"
      style={{ transform: `translateX(-${offset}px)` }}
    >
      {ranked.map((token, i) => (
        <span
          key={`${token}-${i}`}
          className={SHOW_AWARD_CHIP_CLASS}
        >
          {displayShowAwardToken(token)}
        </span>
      ))}
    </div>
  )

  if (ranked.length === 1) {
    return (
      <HoverTooltip
        label={awardTooltipForToken(ranked[0]!)}
        placement="top"
        variant="site"
        delayMs={TOOLTIP.DELAY_NONE}
        portal
      >
        <span className="inline-flex" tabIndex={0}>
          {chips}
        </span>
      </HoverTooltip>
    )
  }

  return (
    <HoverTooltip
      label={awardTooltipList(ranked.map((token) => ({ token })))}
      placement="top"
      variant="site"
      delayMs={TOOLTIP.DELAY_SHORT}
      portal
      className="block w-full min-w-0 max-w-full"
    >
      <div
        ref={viewportRef}
        className="relative w-full min-w-0 overflow-hidden"
        tabIndex={0}
        onMouseEnter={scrollToEnd}
        onMouseLeave={scrollHome}
        onFocus={scrollToEnd}
        onBlur={scrollHome}
      >
        {chips}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-white to-transparent dark:from-charcoal-800"
          aria-hidden
        />
      </div>
    </HoverTooltip>
  )
}
