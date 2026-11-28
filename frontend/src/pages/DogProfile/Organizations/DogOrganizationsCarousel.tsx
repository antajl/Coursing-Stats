import { useState } from 'react'
import {
  Trophy,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useHorizontalSwipe } from '../../../hooks/useHorizontalSwipe'
import type { DogOrgStatsResult, DogOrgItem } from '../dogOrganizationsStats'
import { formatOrgsCount, formatShowMoreOrgs } from '../dogOrganizationsStats'
import { DogOrganizationRow } from './DogOrganizationRow'

export interface DogOrganizationsCarouselProps {
  orgStats: DogOrgStatsResult
  expandedOrgs: Set<string>
  onToggleOrg: (orgKey: string) => void
}

const INITIAL_LIMIT = 5
const EXPAND_THRESHOLD = 6

export function DogOrganizationsCarousel({
  orgStats,
  expandedOrgs,
  onToggleOrg,
}: DogOrganizationsCarouselProps) {
  const [isHigherExpanded, setIsHigherExpanded] = useState(false)
  const [isLowerExpanded, setIsLowerExpanded] = useState(false)

  // Мобильная карусель: вкладка 0 (Выше обычного) или 1 (Сложнее победить) со свайпом
  const [activeMobileTab, setActiveMobileTab] = useState<0 | 1>(0)
  const {
    trackRef,
    getSlideOffset,
    startDrag,
    moveDrag,
    endDrag,
    cancelDrag,
    handleClickCapture,
  } = useHorizontalSwipe({
    activeTabsCount: 2,
    activeTabIndex: activeMobileTab,
    onTabChange: (idx) => setActiveMobileTab(idx as 0 | 1),
  })

  const visibleHigher =
    isHigherExpanded || orgStats.higher_than_career.length <= EXPAND_THRESHOLD
      ? orgStats.higher_than_career
      : orgStats.higher_than_career.slice(0, INITIAL_LIMIT)

  const visibleLower =
    isLowerExpanded || orgStats.lower_than_career.length <= EXPAND_THRESHOLD
      ? orgStats.lower_than_career
      : orgStats.lower_than_career.slice(0, INITIAL_LIMIT)

  const renderOrgRow = (org: DogOrgItem, variant: 'higher' | 'lower') => (
    <DogOrganizationRow
      key={org.org_key}
      org={org}
      variant={variant}
      isExpanded={expandedOrgs.has(org.org_key)}
      onToggle={() => onToggleOrg(org.org_key)}
    />
  )

  const higherCard = (
    <div className="rounded-2xl border border-old-money-200/90 bg-white overflow-hidden shadow-2xs h-full flex flex-col">
      <div className="relative px-3.5 py-2.5 bg-forest-50/70 border-b border-old-money-200/80 flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5 min-w-0 pr-24 md:pr-0">
          <Trophy className="w-3.5 h-3.5 text-forest-700 shrink-0" strokeWidth={1.75} aria-hidden />
          <h3 className="text-xs font-semibold text-charcoal-800 truncate">
            Выше обычного
          </h3>
          <span className="text-[11px] text-forest-800 font-semibold tabular-nums ml-0.5">
            {formatOrgsCount(orgStats.higher_than_career.length)}
          </span>
        </div>

        {/* На мобилке: правый язычок для перехода к «Сложнее победить» */}
        <button
          type="button"
          onClick={() => setActiveMobileTab(1)}
          className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-1 bg-cream-50/95 text-camel-950 font-bold text-[11px] py-1 pl-2.5 pr-2 rounded-l-full border-y border-l border-camel-400/60 shadow-xs transition-colors hover:bg-camel-100/90 cursor-pointer touch-manipulation select-none min-h-[36px]"
          title="Перейти: Сложнее победить"
          aria-label="Перейти: Сложнее победить"
        >
          <span className="tracking-tight text-rose-900 font-semibold">Сложнее</span>
          <span className="text-[9px] tabular-nums font-bold px-1 py-0 rounded-full bg-rose-200/80 text-rose-950 shrink-0">
            {orgStats.lower_than_career.length}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-rose-800 shrink-0" strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      {orgStats.higher_than_career.length > 0 ? (
        <>
          <div className="divide-y divide-old-money-100 flex-1">
            {visibleHigher.map((org) => renderOrgRow(org, 'higher'))}
          </div>
          {orgStats.higher_than_career.length > EXPAND_THRESHOLD && (
            <button
              type="button"
              onClick={() => setIsHigherExpanded((prev) => !prev)}
              className="w-full py-2.5 px-3 bg-cream-50/70 hover:bg-cream-100/80 border-t border-old-money-200/70 text-xs font-semibold text-charcoal-700 hover:text-camel-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation min-h-[44px]"
            >
              {isHigherExpanded ? (
                <>
                  <span>Свернуть</span>
                  <ChevronUp className="w-3.5 h-3.5 text-charcoal-500" strokeWidth={1.75} aria-hidden />
                </>
              ) : (
                <>
                  <span>
                    {formatShowMoreOrgs(orgStats.higher_than_career.length - INITIAL_LIMIT)}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-charcoal-500" strokeWidth={1.75} aria-hidden />
                </>
              )}
            </button>
          )}
        </>
      ) : (
        <div className="p-4 text-center text-xs text-charcoal-500 flex-1 flex items-center justify-center">
          Пока нет организаций с процентом побед выше среднего
        </div>
      )}
    </div>
  )

  const lowerCard = (
    <div className="rounded-2xl border border-old-money-200/90 bg-white overflow-hidden shadow-2xs h-full flex flex-col">
      <div className="relative px-3.5 py-2.5 bg-rose-50/70 border-b border-old-money-200/80 flex items-center justify-between select-none">
        {/* На мобилке: левый язычок для перехода к «Выше обычного» */}
        <button
          type="button"
          onClick={() => setActiveMobileTab(0)}
          className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-1 bg-cream-50/95 text-camel-950 font-bold text-[11px] py-1 pl-2 pr-2.5 rounded-r-full border-y border-r border-camel-400/60 shadow-xs transition-colors hover:bg-camel-100/90 cursor-pointer touch-manipulation select-none min-h-[36px]"
          title="Перейти: Выше обычного"
          aria-label="Перейти: Выше обычного"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-forest-800 shrink-0" strokeWidth={1.75} aria-hidden />
          <span className="tracking-tight text-forest-900 font-semibold">Выше</span>
          <span className="text-[9px] tabular-nums font-bold px-1 py-0 rounded-full bg-forest-200/80 text-forest-950 shrink-0">
            {orgStats.higher_than_career.length}
          </span>
        </button>

        <div className="flex items-center gap-1.5 min-w-0 md:pl-0 pl-24 justify-end md:justify-start w-full">
          <TrendingDown className="w-3.5 h-3.5 text-rose-700 shrink-0" strokeWidth={1.75} aria-hidden />
          <h3 className="text-xs font-semibold text-charcoal-800 truncate">
            Сложнее победить
          </h3>
          <span className="text-[11px] text-rose-800 font-semibold tabular-nums ml-0.5">
            {formatOrgsCount(orgStats.lower_than_career.length)}
          </span>
        </div>
      </div>

      {orgStats.lower_than_career.length > 0 ? (
        <>
          <div className="divide-y divide-old-money-100 flex-1">
            {visibleLower.map((org) => renderOrgRow(org, 'lower'))}
          </div>
          {orgStats.lower_than_career.length > EXPAND_THRESHOLD && (
            <button
              type="button"
              onClick={() => setIsLowerExpanded((prev) => !prev)}
              className="w-full py-2.5 px-3 bg-cream-50/70 hover:bg-cream-100/80 border-t border-old-money-200/70 text-xs font-semibold text-charcoal-700 hover:text-camel-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation min-h-[44px]"
            >
              {isLowerExpanded ? (
                <>
                  <span>Свернуть</span>
                  <ChevronUp className="w-3.5 h-3.5 text-charcoal-500" strokeWidth={1.75} aria-hidden />
                </>
              ) : (
                <>
                  <span>
                    {formatShowMoreOrgs(orgStats.lower_than_career.length - INITIAL_LIMIT)}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-charcoal-500" strokeWidth={1.75} aria-hidden />
                </>
              )}
            </button>
          )}
        </>
      ) : (
        <div className="p-4 text-center text-xs text-charcoal-500 flex-1 flex items-center justify-center">
          Пока нет организаций со сложной статистикой
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Десктоп: 2 колонки рядом */}
      <div className="hidden md:grid md:grid-cols-2 gap-3 items-start">
        {higherCard}
        {lowerCard}
      </div>

      {/* Мобильный вид: горизонтальный свайп между колонками */}
      <div
        className="block md:hidden relative overflow-x-clip touch-pan-y select-none"
        onTouchStart={(e) => {
          if (e.touches.length === 1) startDrag(e.touches[0].clientX, e.touches[0].clientY)
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 1) moveDrag(e.touches[0].clientX, e.touches[0].clientY)
        }}
        onTouchEnd={(e) => {
          const touch = e.changedTouches[0]
          if (touch) endDrag(touch.clientX)
        }}
        onTouchCancel={cancelDrag}
        onClickCapture={handleClickCapture}
      >
        <div
          ref={trackRef}
          className="flex flex-nowrap w-full min-w-0 items-stretch gap-0"
          style={{
            transform: getSlideOffset(activeMobileTab),
            willChange: 'transform',
          }}
        >
          <div className="w-full max-w-full min-w-0 shrink-0 basis-full">{higherCard}</div>
          <div className="w-full max-w-full min-w-0 shrink-0 basis-full">{lowerCard}</div>
        </div>

        {/* Точки-индикаторы положения свайпа */}
        <div className="flex items-center justify-center gap-1.5 pt-2" aria-hidden="true">
          <button
            type="button"
            onClick={() => setActiveMobileTab(0)}
            className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
              activeMobileTab === 0 ? 'w-5 bg-camel-600' : 'w-1.5 bg-old-money-300'
            }`}
            aria-label="Слайд: Выше обычного"
          />
          <button
            type="button"
            onClick={() => setActiveMobileTab(1)}
            className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
              activeMobileTab === 1 ? 'w-5 bg-camel-600' : 'w-1.5 bg-old-money-300'
            }`}
            aria-label="Слайд: Сложнее победить"
          />
        </div>
      </div>
    </>
  )
}
