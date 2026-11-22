import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { breedToSlug } from '../../lib/breedMapping'
import type { AnnualDogLeader } from '../../hooks/useStaticData'
import type { AnnualDoninoLeader } from '../../lib/doninoAnnualLeaders'
import type { BreedHubColumnsProps, ColumnTabId } from './types'
import { useBreedHubSwipe } from './components/useBreedHubSwipe'
import { BreedDisciplinePlaque } from './components/BreedDisciplinePlaque'
import {
  DesktopCoursingCell,
  DesktopRacingCell,
  DesktopDoninoCell,
} from './components/DesktopRowCells'
import {
  MobileDogLeaderCards,
  MobileDoninoCards,
} from './components/MobileDisciplineCards'

export type { SpeedRecordItem } from './types'

export default function BreedHubColumns({
  annualLeaders,
  coursingLeaders,
  racingLeaders,
  doninoLeaders,
  annualLeadersLoading,
  doninoLoading,
  canonicalKey,
  breedNameRu,
  breedSlug,
}: BreedHubColumnsProps) {
  const coursingList = useMemo(
    () => coursingLeaders || annualLeaders || [],
    [coursingLeaders, annualLeaders],
  )
  const racingList = useMemo(() => racingLeaders || [], [racingLeaders])
  const doninoList = useMemo(() => doninoLeaders || [], [doninoLeaders])

  const slug = breedSlug || breedToSlug(canonicalKey)

  const hasCoursing = coursingList.length > 0 || annualLeadersLoading
  const hasRacing = racingList.length > 0
  const hasDonino = doninoList.length > 0

  // Список активных колонок для спортивной навигации
  const activeTabs = useMemo(() => {
    const tabs: Array<{
      id: ColumnTabId
      label: string
      count: number
      rankingUrl: string
      actionTitle: string
    }> = []

    if (hasCoursing) {
      tabs.push({
        id: 'coursing',
        label: 'Курсинг',
        count: coursingList.length,
        rankingUrl: `/competitions/ranking/2026/?breed=${encodeURIComponent(slug)}&tab=coursing`,
        actionTitle: `Рейтинг курсинга породы ${breedNameRu}`,
      })
    }
    if (hasRacing) {
      tabs.push({
        id: 'racing',
        label: 'Рейсинг',
        count: racingList.length,
        rankingUrl: `/competitions/ranking/2026/?breed=${encodeURIComponent(slug)}&tab=racing`,
        actionTitle: `Рейтинг рейсинга породы ${breedNameRu}`,
      })
    }
    if (hasDonino) {
      tabs.push({
        id: 'donino',
        label: 'Донино',
        count: doninoList.length,
        rankingUrl: `/speed-records/?breed=${encodeURIComponent(slug)}`,
        actionTitle: `Рекорды Донино породы ${breedNameRu}`,
      })
    }
    return tabs
  }, [hasCoursing, hasRacing, hasDonino, coursingList.length, racingList.length, doninoList.length, slug, breedNameRu])

  const [activeMobileTab, setActiveMobileTab] = useState<ColumnTabId>('coursing')

  // Гарантируем, что активный мобильный таб существует среди доступных
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

  // Язычки-бейджики слева и справа от заголовка
  const prevTab = useMemo(() => {
    if (activeTabIndex <= 0) return null
    return activeTabs[activeTabIndex - 1]
  }, [activeTabs, activeTabIndex])

  const nextTab = useMemo(() => {
    if (activeTabIndex >= activeTabs.length - 1) return null
    return activeTabs[activeTabIndex + 1]
  }, [activeTabs, activeTabIndex])

  // Мобильный свайп-жест между слайдами
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

  // Сводные данные по годам для выравнивания строк десктопа
  const coursingByYear = useMemo(() => {
    const map = new Map<number, AnnualDogLeader>()
    coursingList.forEach((item) => map.set(item.year, item))
    return map
  }, [coursingList])

  const racingByYear = useMemo(() => {
    const map = new Map<number, AnnualDogLeader>()
    racingList.forEach((item) => map.set(item.year, item))
    return map
  }, [racingList])

  const doninoByYear = useMemo(() => {
    const map = new Map<number, AnnualDoninoLeader>()
    doninoList.forEach((item) => map.set(item.year, item))
    return map
  }, [doninoList])

  const allYears = useMemo(() => {
    const set = new Set<number>()
    coursingList.forEach((item) => set.add(item.year))
    racingList.forEach((item) => set.add(item.year))
    doninoList.forEach((item) => set.add(item.year))
    return Array.from(set).sort((a, b) => b - a)
  }, [coursingList, racingList, doninoList])

  const totalColumnsCount =
    (hasCoursing ? 1 : 0) +
    (hasRacing ? 1 : 0) +
    (hasDonino ? 1 : 0)

  const desktopGridClass =
    totalColumnsCount === 3
      ? 'lg:grid-cols-3'
      : totalColumnsCount === 2
      ? 'lg:grid-cols-2'
      : 'lg:grid-cols-1'

  if (totalColumnsCount === 0) {
    return null
  }

  return (
    <div className="rounded-2xl border border-[rgba(195,168,128,0.70)] bg-white shadow-2xs overflow-hidden">
      {/* ================= ДЕСКТОПНЫЙ ВИД (>= 1024px): 3 параллельные колонки с четкими разделителями ================= */}
        <div className="hidden lg:block w-full">
          {/* Шапка таблицы: плашки дисциплин */}
          <div className={`grid ${desktopGridClass} divide-x divide-[rgba(195,168,128,0.80)] bg-cream-100/90`}>
            {hasCoursing && (
              <div>
                <BreedDisciplinePlaque
                  discipline="coursing"
                  count={coursingList.length}
                  canonicalKey={canonicalKey}
                  breedNameRu={breedNameRu}
                />
              </div>
            )}
            {hasRacing && (
              <div>
                <BreedDisciplinePlaque
                  discipline="racing"
                  count={racingList.length}
                  canonicalKey={canonicalKey}
                  breedNameRu={breedNameRu}
                />
              </div>
            )}
            {hasDonino && (
              <div>
                <BreedDisciplinePlaque
                  discipline="donino"
                  count={doninoList.length}
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
            <p className="text-xs text-old-money-600 py-8 text-center">Спортивных данных пока нет.</p>
          ) : (
            <div className="divide-y divide-old-money-100">
              {allYears.map((year) => {
                const coursingItem = coursingByYear.get(year)
                const racingItem = racingByYear.get(year)
                const doninoItem = doninoByYear.get(year)

                return (
                  <div
                    key={year}
                    className={`grid ${desktopGridClass} divide-x divide-[rgba(195,168,128,0.80)] hover:bg-cream-50/50 transition-colors items-center min-h-[52px]`}
                  >
                    {hasCoursing && (
                      <div className="px-3 py-2 min-w-0 h-full flex items-center">
                        <DesktopCoursingCell
                          item={coursingItem}
                          year={year}
                          canonicalKey={canonicalKey}
                        />
                      </div>
                    )}
                    {hasRacing && (
                      <div className="px-3 py-2 min-w-0 h-full flex items-center">
                        <DesktopRacingCell
                          item={racingItem}
                          year={year}
                          canonicalKey={canonicalKey}
                        />
                      </div>
                    )}
                    {hasDonino && (
                      <div className="px-3 py-2 min-w-0 h-full flex items-center">
                        <DesktopDoninoCell
                          item={doninoItem}
                          year={year}
                          canonicalKey={canonicalKey}
                          breedNameRu={breedNameRu}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ================= МОБИЛЬНЫЙ ВИД (< 1024px): язычки-бейджики по бокам, название в середине ================= */}
        <div className="block lg:hidden w-full">
          <div className="donino-column-plaque relative flex h-11 min-h-[44px] items-center justify-between border-b border-[rgba(195,168,128,0.55)] bg-cream-100/90 px-3 select-none overflow-hidden">
            {/* Левый язычок */}
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

            {/* Заголовок текущего экрана */}
            <div className="flex-1 text-center truncate px-12">
              <span className="font-serif font-bold text-xs sm:text-sm tracking-wide text-charcoal-900 inline-flex items-center gap-1.5">
                <span>{activeTabObj?.label || 'Дисциплина'}</span>
                <span className="text-[11px] font-sans font-semibold text-camel-800 tabular-nums">
                  ({activeTabObj?.count || 0})
                </span>
              </span>
            </div>

            {/* Правый язычок */}
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

          {/* Свайп-контейнер со слайдами */}
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
                  {tab.id === 'coursing' && (
                    <MobileDogLeaderCards
                      items={coursingList}
                      canonicalKey={canonicalKey}
                      discipline="coursing"
                      loading={annualLeadersLoading}
                    />
                  )}
                  {tab.id === 'racing' && (
                    <MobileDogLeaderCards
                      items={racingList}
                      canonicalKey={canonicalKey}
                      discipline="racing"
                      loading={annualLeadersLoading}
                    />
                  )}
                  {tab.id === 'donino' && (
                    <MobileDoninoCards
                      items={doninoList}
                      canonicalKey={canonicalKey}
                      breedNameRu={breedNameRu}
                      loading={doninoLoading}
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
