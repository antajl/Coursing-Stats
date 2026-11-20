import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Zap, Gauge, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import DoninoColumnPlaque from '../SpeedRecords/DoninoColumnPlaque'
import { formatSeasonsCount } from './utils'
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
}: BreedHubColumnsProps) {
  const coursingList = useMemo(
    () => coursingLeaders || annualLeaders || [],
    [coursingLeaders, annualLeaders],
  )
  const racingList = useMemo(() => racingLeaders || [], [racingLeaders])
  const doninoList = useMemo(() => doninoLeaders || [], [doninoLeaders])

  const hasCoursing = coursingList.length > 0 || annualLeadersLoading
  const hasRacing = racingList.length > 0
  const hasDonino = doninoList.length > 0

  // Список активных колонок для мобильной навигации
  const activeTabs = useMemo(() => {
    const tabs: Array<{
      id: ColumnTabId
      label: string
      count: number
      icon: typeof Trophy
      rankingUrl: string
      actionTitle: string
    }> = []
    if (hasCoursing) {
      tabs.push({
        id: 'coursing',
        label: 'Курсинг',
        count: coursingList.length,
        icon: Trophy,
        rankingUrl: `/competitions/ranking/2026/?breed=${encodeURIComponent(breedToSlug(canonicalKey))}&tab=coursing`,
        actionTitle: `Рейтинг курсинга породы ${breedNameRu}`,
      })
    }
    if (hasRacing) {
      tabs.push({
        id: 'racing',
        label: 'Рейсинг',
        count: racingList.length,
        icon: Zap,
        rankingUrl: `/competitions/ranking/2026/?breed=${encodeURIComponent(breedToSlug(canonicalKey))}&tab=racing`,
        actionTitle: `Рейтинг рейсинга породы ${breedNameRu}`,
      })
    }
    if (hasDonino) {
      tabs.push({
        id: 'donino',
        label: 'Донино',
        count: doninoList.length,
        icon: Gauge,
        rankingUrl: `/speed-records/?breed=${encodeURIComponent(breedToSlug(canonicalKey))}`,
        actionTitle: `Рекорды Донино породы ${breedNameRu}`,
      })
    }
    return tabs
  }, [hasCoursing, hasRacing, hasDonino, coursingList.length, racingList.length, doninoList.length, canonicalKey, breedNameRu])

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
  const ActiveIcon = activeTabObj?.icon || Trophy

  const activeTabIndex = useMemo(() => {
    const idx = activeTabs.findIndex((t) => t.id === activeMobileTab)
    return idx >= 0 ? idx : 0
  }, [activeTabs, activeMobileTab])

  // Язычки-бейджики слева и справа от заголовка (линейная навигация без зацикливания)
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

  const totalRowsCount = allYears.length

  // Расчет классов адаптивной сетки десктопа
  const totalColumnsCount = (hasCoursing ? 1 : 0) + (hasRacing ? 1 : 0) + (hasDonino ? 1 : 0)
  const desktopGridClass =
    totalColumnsCount >= 3
      ? 'lg:grid-cols-3'
      : totalColumnsCount === 2
      ? 'lg:grid-cols-2'
      : 'lg:grid-cols-1'

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* Единый монолитный блок */}
      <div className="rounded-2xl border border-[rgba(195,168,128,0.70)] bg-white shadow-2xs overflow-hidden">
        {/* ================= ДЕСКТОПНЫЙ ВИД (>= 1024px): 3 колонки с четкими вертикальными разделителями ================= */}
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

          {/* Строки таблицы со сквозными полосками и четкими вертикальными разделителями */}
          {annualLeadersLoading ? (
            <p className="text-xs text-old-money-600 py-8 text-center">Загрузка архива состязаний…</p>
          ) : totalRowsCount === 0 ? (
            <p className="text-xs text-old-money-600 py-8 text-center">Данных по породе пока нет.</p>
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
          {/* Единая шапка таблицы: язычки-бейджики слева и справа (в стиле главной страницы), название в середине */}
          <div className="donino-column-plaque relative flex h-11 min-h-[44px] items-center justify-between border-b border-[rgba(195,168,128,0.55)] bg-cream-100/90 px-3 select-none overflow-hidden">
            {/* Левый язычок (стиль HomeSubSectionTab: прикреплён к левому краю, rounded-r-full) */}
            {prevTab && (
              <button
                type="button"
                onClick={() => setActiveMobileTab(prevTab.id)}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-1 bg-[#fbf7f0]/85 text-camel-950 font-bold text-[11px] py-1 pl-2.5 pr-3 rounded-r-full border-y border-r border-camel-400/60 shadow-xs backdrop-blur-md transition-all hover:bg-camel-100/90 active:scale-95 cursor-pointer touch-manipulation select-none"
                title={`Перейти: ${prevTab.label}`}
                aria-label={`Перейти: ${prevTab.label}`}
              >
                <ChevronLeft className="w-3.5 h-3.5 text-camel-800 shrink-0" aria-hidden />
                <span className="tracking-tight">{prevTab.label}</span>
                <span className="text-[9px] tabular-nums font-bold px-1 py-0 rounded-full bg-camel-200/70 text-camel-900 shrink-0">
                  {prevTab.count}
                </span>
              </button>
            )}

            {/* Название в середине заголовка: 2 строки (дисциплина + сезоны и ссылка на рейтинг), гарантированный отступ от язычков */}
            <div className={`flex min-w-0 flex-1 flex-col items-center justify-center text-center leading-tight ${activeTabs.length > 1 ? 'px-24 sm:px-28' : 'px-4'}`}>
              {activeTabObj ? (
                <Link
                  to={activeTabObj.rankingUrl}
                  className="flex flex-col items-center justify-center group max-w-full hover:text-camel-950 transition-colors"
                  title={activeTabObj.actionTitle}
                >
                  <div className="inline-flex items-center justify-center gap-1 text-xs font-bold uppercase tracking-wider text-camel-900 group-hover:underline truncate max-w-full">
                    <ActiveIcon className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
                    <span className="truncate">{activeTabObj.label}</span>
                  </div>
                  {activeTabObj.count > 0 && (
                    <div className="text-[10px] font-semibold text-old-money-500 inline-flex items-center justify-center gap-1 leading-none mt-0.5">
                      <span>{formatSeasonsCount(activeTabObj.count)}</span>
                      <span className="text-old-money-300">·</span>
                      <span className="text-camel-800 group-hover:underline inline-flex items-center gap-0.5 font-bold">
                        <span>{activeTabObj.id === 'donino' ? 'Все рекорды' : 'Рейтинг'}</span>
                        <ArrowUpRight className="h-2.5 w-2.5 text-camel-700 shrink-0" aria-hidden />
                      </span>
                    </div>
                  )}
                </Link>
              ) : (
                <span className="text-xs font-bold uppercase tracking-wider text-camel-800">По годам</span>
              )}
            </div>

            {/* Правый язычок (стиль HomeSubSectionTab: прикреплён к правому краю, rounded-l-full) */}
            {nextTab ? (
              <button
                type="button"
                onClick={() => setActiveMobileTab(nextTab.id)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-1 bg-[#fbf7f0]/85 text-camel-950 font-bold text-[11px] py-1 pl-3 pr-2.5 rounded-l-full border-y border-l border-camel-400/60 shadow-xs backdrop-blur-md transition-all hover:bg-camel-100/90 active:scale-95 cursor-pointer touch-manipulation select-none"
                title={`Перейти: ${nextTab.label}`}
                aria-label={`Перейти: ${nextTab.label}`}
              >
                <span className="tracking-tight">{nextTab.label}</span>
                <span className="text-[9px] tabular-nums font-bold px-1 py-0 rounded-full bg-camel-200/70 text-camel-900 shrink-0">
                  {nextTab.count}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-camel-800 shrink-0" aria-hidden />
              </button>
            ) : activeTabObj && activeTabs.length === 1 ? (
              <Link
                to={activeTabObj.rankingUrl}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-1 text-xs font-semibold text-camel-800 hover:text-camel-950 transition-colors cursor-pointer shrink-0"
                title={activeTabObj.actionTitle}
              >
                <span>{activeTabObj.id === 'donino' ? 'Все рекорды' : 'Рейтинг'}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-camel-700" aria-hidden />
              </Link>
            ) : null}
          </div>

          {/* Горизонтальный свайп между списками */}
          <div
            className="w-full relative overflow-x-clip touch-pan-y select-none"
            onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchMove={(e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchEnd={(e) => endDrag(e.changedTouches[0].clientX)}
            onTouchCancel={cancelDrag}
            onMouseDown={(e) => {
              if (e.button === 0) startDrag(e.clientX, e.clientY)
            }}
            onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
            onMouseUp={(e) => endDrag(e.clientX)}
            onMouseLeave={cancelDrag}
            onClickCapture={handleClickCapture}
          >
            <div
              ref={trackRef}
              className="flex flex-nowrap w-full min-w-0 items-stretch gap-0"
              style={{
                transform: activeTabs.length <= 1 ? 'none' : `translate3d(${getSlideOffset(activeTabIndex)}, 0, 0)`,
                willChange: activeTabs.length > 1 ? 'transform' : 'auto',
              }}
            >
              {/* Колонка 1: Курсинг по годам */}
              {hasCoursing && (
                <div className="w-full max-w-full min-w-0 shrink-0 basis-full flex flex-col bg-white">
                  <div className="flex-1 min-w-0 flex flex-col justify-start">
                    {annualLeadersLoading ? (
                      <p className="text-xs text-old-money-600 py-6 text-center">Загрузка архива по годам…</p>
                    ) : (
                      <MobileDogLeaderCards
                        items={coursingList}
                        mode="coursing"
                        canonicalKey={canonicalKey}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Колонка 2: Рейсинг по годам */}
              {hasRacing && (
                <div className="w-full max-w-full min-w-0 shrink-0 basis-full flex flex-col bg-white">
                  <div className="flex-1 min-w-0 flex flex-col justify-start">
                    {annualLeadersLoading ? (
                      <p className="text-xs text-old-money-600 py-6 text-center">Загрузка архива рейсинга…</p>
                    ) : (
                      <MobileDogLeaderCards
                        items={racingList}
                        mode="racing"
                        canonicalKey={canonicalKey}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Колонка 3: Донино по годам */}
              {hasDonino && (
                <div className="w-full max-w-full min-w-0 shrink-0 basis-full flex flex-col bg-white">
                  <div className="flex-1 min-w-0 flex flex-col justify-start">
                    {doninoLoading ? (
                      <p className="text-xs text-old-money-600 py-6 text-center">Загрузка архива Донино…</p>
                    ) : (
                      <MobileDoninoCards
                        items={doninoList}
                        canonicalKey={canonicalKey}
                        breedNameRu={breedNameRu}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
