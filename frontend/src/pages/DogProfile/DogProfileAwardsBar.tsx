import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Rabbit, Sparkles } from 'lucide-react'
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

type DogProfileAwardsBarProps = {
  competitionTitles: DogTitle[]
  showTitles: DogTitle[]
}

export function DogProfileAwardsBar({
  competitionTitles,
  showTitles,
}: DogProfileAwardsBarProps): ReactNode {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const hasComp = competitionTitles.length > 0
  const hasShow = showTitles.length > 0

  const updateScrollIndicators = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const tolerance = 2
    const isLeft = el.scrollLeft > tolerance
    const isRight = el.scrollLeft + el.clientWidth < el.scrollWidth - tolerance
    setCanScrollLeft(isLeft)
    setCanScrollRight(isRight)
  }, [])

  useEffect(() => {
    updateScrollIndicators()
    const el = scrollRef.current
    if (!el) return

    const handleResize = () => updateScrollIndicators()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [updateScrollIndicators, competitionTitles, showTitles])

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current
    if (!el) return
    if (el.scrollWidth > el.clientWidth && e.deltaY !== 0) {
      el.scrollLeft += e.deltaY
      updateScrollIndicators()
    }
  }

  if (!hasComp && !hasShow) return null

  const sortedComp = [...competitionTitles].sort((a, b) =>
    compareDogProfileTitles(a.title, b.title),
  )
  const sortedShow = [...showTitles].sort((a, b) =>
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
    <div className="relative mt-3.5 pt-3 border-t border-old-money-200/80">
      {/* Плавные маски-градиенты по краям при переполнении */}
      {canScrollLeft && (
        <div
          className="pointer-events-none absolute left-0 top-3 bottom-0 w-8 bg-gradient-to-r from-white via-white/80 to-transparent z-10"
          aria-hidden
        />
      )}
      {canScrollRight && (
        <div
          className="pointer-events-none absolute right-0 top-3 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent z-10"
          aria-hidden
        />
      )}

      <div
        ref={scrollRef}
        onScroll={updateScrollIndicators}
        onWheel={handleWheel}
        className="flex w-full items-center gap-3 overflow-x-auto no-scrollbar py-0.5 scroll-smooth"
        tabIndex={0}
        aria-label="Награды и титулы собаки"
      >
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 min-w-min">
          {hasComp && (
            <div className="flex shrink-0 items-center gap-1.5 bg-forest-50/50 px-2.5 py-1 rounded-xl border border-forest-200/70">
              <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-forest-800">
                <Rabbit className="h-3.5 w-3.5 text-forest-600" aria-hidden />
                Спорт:
              </span>
              <div className="flex items-center gap-1">
                {sortedComp.map((item) => renderChip(item, 'comp'))}
              </div>
            </div>
          )}

          {hasShow && (
            <div className="flex shrink-0 items-center gap-1.5 bg-camel-50/50 px-2.5 py-1 rounded-xl border border-camel-200/70">
              <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-camel-900">
                <Sparkles className="h-3.5 w-3.5 text-camel-700" aria-hidden />
                Выставки:
              </span>
              <div className="flex items-center gap-1">
                {sortedShow.map((item) => renderChip(item, 'show'))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
