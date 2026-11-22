import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { breedToSlug } from '../../../lib/breedMapping'
import type { AnnualShowDogLeader } from '../../../hooks/useStaticData'
import { useBreedHubSwipe } from './useBreedHubSwipe'
import { BreedDisciplinePlaque } from './BreedDisciplinePlaque'
import { DesktopShowsCacCell, DesktopShowsMonoCell } from './DesktopRowCells'
import { MobileShowLeaderCards } from './MobileDisciplineCards'

export interface BreedShowsColumnsProps {
  showsCacLeaders?: AnnualShowDogLeader[]
  showsMonoLeaders?: AnnualShowDogLeader[]
  annualLeadersLoading?: boolean
  canonicalKey: string
  breedNameRu: string
  breedSlug?: string
}

type ShowTabId = 'shows_cac' | 'shows_mono'

export default function BreedShowsColumns({
  showsCacLeaders = [],
  showsMonoLeaders = [],
  annualLeadersLoading = false,
  canonicalKey,
  breedNameRu,
  breedSlug,
}: BreedShowsColumnsProps) {
  const slug = breedSlug || breedToSlug(canonicalKey)

  const hasShowsCac = showsCacLeaders.length > 0 || annualLeadersLoading
  const hasShowsMono = showsMonoLeaders.length > 0

  const activeTabs = useMemo(() => {
    const tabs: Array<{
      id: ShowTabId
      label: string
      count: number
      rankingUrl: string
      actionTitle: string
    }> = []

    if (hasShowsCac) {
      tabs.push({
        id: 'shows_cac',
        label: 'Шоу САС',
        count: showsCacLeaders.length,
        rankingUrl: `/shows/?tab=ranking&breed=${encodeURIComponent(slug)}&scope=all_breed`,
        actionTitle: `Рейтинг всепородных выставок породы ${breedNameRu}`,
      })
    }
    if (hasShowsMono) {
      tabs.push({
        id: 'shows_mono',
        label: 'Моно НКП',
        count: showsMonoLeaders.length,
        rankingUrl: `/shows/?tab=calendar&breed=${encodeURIComponent(slug)}&scope=mono`,
        actionTitle: `Монопородный календарь НКП породы ${breedNameRu}`,
      })
    }
    return tabs
  }, [hasShowsCac, hasShowsMono, showsCacLeaders.length, showsMonoLeaders.length, slug, breedNameRu])

  const [activeMobileTab, setActiveMobileTab] = useState<ShowTabId>('shows_cac')

  useEffect(() => {
    if (activeTabs.length > 0 && !activeTabs.some((t) => t.id === activeMobileTab)) {
      setActiveMobileTab(activeTabs[0].id)
    }
  }, [activeTabs, activeMobileTab])

  const activeTabObj = useMemo(
    () => activeTabs.find((t) => t.id === activeMobileTab) || activeTabs[0],
    [activeTabs, activeMobileTab],
  )

  const activeTabIndex = useMemo(() => {
    const idx = activeTabs.findIndex((t) => t.id === activeMobileTab)
    return idx >= 0 ? idx : 0
  }, [activeTabs, activeMobileTab])

  const prevTab = useMemo(() => {
    if (activeTabIndex <= 0) return null
    return activeTabs[activeTabIndex - 1]
  }, [activeTabs, activeTabIndex])

  const nextTab = useMemo(() => {
    if (activeTabIndex >= activeTabs.length - 1) return null
    return activeTabs[activeTabIndex + 1]
  }, [activeTabs, activeTabIndex])

  const {
    trackRef,
    getSlideOffset,
    startDrag,
    moveDrag,
    endDrag,
    cancelDrag,
    handleClickCapture,
  } = useBreedHubSwipe({
    activeTabsCount: activeTabs.length,
    activeTabIndex,
    onTabChange: (targetIndex) => {
      setActiveMobileTab(activeTabs[targetIndex].id)
    },
  })

  const showsCacByYear = useMemo(() => {
    const map = new Map<number, AnnualShowDogLeader>()
    showsCacLeaders.forEach((item) => map.set(item.year, item))
    return map
  }, [showsCacLeaders])

  const showsMonoByYear = useMemo(() => {
    const map = new Map<number, AnnualShowDogLeader>()
    showsMonoLeaders.forEach((item) => map.set(item.year, item))
    return map
  }, [showsMonoLeaders])

  const allYears = useMemo(() => {
    const set = new Set<number>()
    showsCacLeaders.forEach((item) => set.add(item.year))
    showsMonoLeaders.forEach((item) => set.add(item.year))
    return Array.from(set).sort((a, b) => b - a)
  }, [showsCacLeaders, showsMonoLeaders])

  if (showsCacLeaders.length === 0 && showsMonoLeaders.length === 0 && !annualLeadersLoading) {
    return null
  }

  const gridClass = hasShowsCac && hasShowsMono ? 'lg:grid-cols-2' : 'lg:grid-cols-1'

  return (
    <div>
      {/* ================= ДЕСКТОПНЫЙ ВИД (>= 1024px): 2 широкие колонки (САС | Моно) ================= */}
      <div className="hidden lg:block w-full">
        {/* Шапка таблицы: 2 плашки дисциплин */}
        <div className={`grid ${gridClass} divide-x divide-[rgba(195,168,128,0.80)] bg-cream-100/90`}>
          {hasShowsCac && (
            <div>
              <BreedDisciplinePlaque
                discipline="shows_cac"
                count={showsCacLeaders.length}
                canonicalKey={canonicalKey}
                breedNameRu={breedNameRu}
              />
            </div>
          )}
          {hasShowsMono && (
            <div>
              <BreedDisciplinePlaque
                discipline="shows_mono"
                count={showsMonoLeaders.length}
                canonicalKey={canonicalKey}
                breedNameRu={breedNameRu}
              />
            </div>
          )}
        </div>

        {/* Строки таблицы со сквозными полосками */}
        {annualLeadersLoading ? (
          <p className="text-xs text-old-money-600 py-8 text-center">Загрузка архива по годам…</p>
        ) : allYears.length === 0 ? (
          <p className="text-xs text-old-money-600 py-8 text-center">Выставочных данных пока нет.</p>
        ) : (
          <div className="divide-y divide-old-money-100">
            {allYears.map((year) => {
              const showsCacItem = showsCacByYear.get(year)
              const showsMonoItem = showsMonoByYear.get(year)

              return (
                <div
                  key={year}
                  className={`grid ${gridClass} divide-x divide-[rgba(195,168,128,0.80)] hover:bg-cream-50/50 transition-colors items-center min-h-[52px]`}
                >
                  {hasShowsCac && (
                    <div className="px-3.5 py-2 min-w-0 h-full flex items-center">
                      <DesktopShowsCacCell
                        item={showsCacItem}
                        year={year}
                        canonicalKey={canonicalKey}
                      />
                    </div>
                  )}
                  {hasShowsMono && (
                    <div className="px-3.5 py-2 min-w-0 h-full flex items-center">
                      <DesktopShowsMonoCell
                        item={showsMonoItem}
                        year={year}
                        canonicalKey={canonicalKey}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ================= МОБИЛЬНЫЙ ВИД (< 1024px): переключатель язычков и свайп ================= */}
      <div className="block lg:hidden w-full">
        {/* Шапка таблицы с язычками перехода */}
        <div className="donino-column-plaque relative flex h-11 min-h-[44px] items-center justify-between border-b border-[rgba(195,168,128,0.55)] bg-cream-100/90 px-3 select-none overflow-hidden">
          {prevTab && (
            <button
              type="button"
              onClick={() => setActiveMobileTab(prevTab.id)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-1 bg-[#fbf7f0]/85 text-camel-950 font-bold text-[11px] py-1 pl-2.5 pr-3 rounded-r-full border-y border-r border-camel-400/60 shadow-xs backdrop-blur-md transition-all hover:bg-camel-100/90 active:scale-95 cursor-pointer select-none"
              title={`Перейти: ${prevTab.label}`}
            >
              <ChevronLeft className="w-3.5 h-3.5 text-camel-800 shrink-0" aria-hidden />
              <span className="tracking-tight">{prevTab.label}</span>
            </button>
          )}

          <div className="flex-1 text-center truncate px-12">
            <span className="font-serif font-bold text-xs sm:text-sm tracking-wide text-charcoal-900 inline-flex items-center gap-1.5">
              <span>{activeTabObj?.label || 'Выставки'}</span>
              <span className="text-[11px] font-sans font-semibold text-camel-800 tabular-nums">
                ({activeTabObj?.count || 0})
              </span>
            </span>
          </div>

          {nextTab && (
            <button
              type="button"
              onClick={() => setActiveMobileTab(nextTab.id)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-1 bg-[#fbf7f0]/85 text-camel-950 font-bold text-[11px] py-1 pl-3 pr-2.5 rounded-l-full border-y border-l border-camel-400/60 shadow-xs backdrop-blur-md transition-all hover:bg-camel-100/90 active:scale-95 cursor-pointer select-none"
              title={`Перейти: ${nextTab.label}`}
            >
              <span className="tracking-tight">{nextTab.label}</span>
              <ChevronRight className="w-3.5 h-3.5 text-camel-800 shrink-0" aria-hidden />
            </button>
          )}
        </div>

        {/* Свайп-контейнер */}
        <div
          ref={trackRef}
          className="relative w-full overflow-hidden touch-pan-y"
          onMouseDown={startDrag}
          onMouseMove={moveDrag}
          onMouseUp={endDrag}
          onMouseLeave={cancelDrag}
          onTouchStart={startDrag}
          onTouchMove={moveDrag}
          onTouchEnd={endDrag}
          onTouchCancel={cancelDrag}
          onClickCapture={handleClickCapture}
        >
          <div
            className="flex w-full"
            style={{
              transform: `translate3d(${getSlideOffset()}%, 0, 0)`,
              transition: 'transform 260ms cubic-bezier(0.25, 1, 0.5, 1)',
              willChange: 'transform',
            }}
          >
            {activeTabs.map((tab) => (
              <div key={tab.id} className="w-full shrink-0 min-w-full">
                {tab.id === 'shows_cac' && (
                  <MobileShowLeaderCards
                    items={showsCacLeaders}
                    canonicalKey={canonicalKey}
                    discipline="shows_cac"
                    loading={annualLeadersLoading}
                  />
                )}
                {tab.id === 'shows_mono' && (
                  <MobileShowLeaderCards
                    items={showsMonoLeaders}
                    canonicalKey={canonicalKey}
                    discipline="shows_mono"
                    loading={annualLeadersLoading}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
