import { useState, useEffect, useMemo } from 'react'
import { Trophy, Zap, Gauge } from 'lucide-react'
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
    const tabs: Array<{ id: ColumnTabId; label: string; count: number; icon: typeof Trophy }> = []
    if (hasCoursing) tabs.push({ id: 'coursing', label: 'Курсинг', count: coursingList.length, icon: Trophy })
    if (hasRacing) tabs.push({ id: 'racing', label: 'Рейсинг', count: racingList.length, icon: Zap })
    if (hasDonino) tabs.push({ id: 'donino', label: 'Донино', count: doninoList.length, icon: Gauge })
    return tabs
  }, [hasCoursing, hasRacing, hasDonino, coursingList.length, racingList.length, doninoList.length])

  const [activeMobileTab, setActiveMobileTab] = useState<ColumnTabId>('coursing')

  // Гарантируем, что активный мобильный таб существует среди доступных
  useEffect(() => {
    if (activeTabs.length > 0 && !activeTabs.some((t) => t.id === activeMobileTab)) {
      setActiveMobileTab(activeTabs[0].id)
    }
  }, [activeTabs, activeMobileTab])

  const activeTabIndex = useMemo(() => {
    const idx = activeTabs.findIndex((t) => t.id === activeMobileTab)
    return idx >= 0 ? idx : 0
  }, [activeTabs, activeMobileTab])

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
      {/* Мобильный переключатель колонок (если доступно 2 или 3 дисциплины) */}
      {activeTabs.length > 1 && (
        <div className="flex lg:hidden items-center p-1 rounded-xl bg-cream-100/90 border border-old-money-200/60 gap-1 select-none">
          {activeTabs.map((tab) => {
            const IconComponent = tab.icon
            const isActive = activeMobileTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveMobileTab(tab.id)}
                className={`flex-1 min-h-[36px] flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-camel-950 shadow-xs border border-old-money-200/80 font-bold'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                <IconComponent className="h-3.5 w-3.5 text-camel-700 shrink-0" />
                <span className="truncate">
                  {tab.label} ({tab.count})
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Единый монолитный блок */}
      <div className="rounded-2xl border border-[rgba(195,168,128,0.70)] bg-white shadow-2xs overflow-hidden">
        {/* ================= ДЕСКТОПНЫЙ ВИД (>= 1024px) ================= */}
        <div className="hidden lg:block w-full">
          {/* Шапка таблицы: плашки дисциплин */}
          <div className={`grid ${desktopGridClass} divide-x divide-[rgba(195,168,128,0.50)] bg-cream-100/90`}>
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

          {/* Строки таблицы со сквозными полосками через весь блок */}
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
                    className={`grid ${desktopGridClass} divide-x divide-[rgba(195,168,128,0.50)] hover:bg-cream-50/50 transition-colors items-center min-h-[52px]`}
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

        {/* ================= МОБИЛЬНЫЙ ВИД (< 1024px) ================= */}
        <div
          className="block lg:hidden w-full relative overflow-x-clip touch-pan-y select-none"
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
                <BreedDisciplinePlaque
                  discipline="coursing"
                  count={coursingList.length}
                  canonicalKey={canonicalKey}
                  breedNameRu={breedNameRu}
                />
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
                <BreedDisciplinePlaque
                  discipline="racing"
                  count={racingList.length}
                  canonicalKey={canonicalKey}
                  breedNameRu={breedNameRu}
                />
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
                <BreedDisciplinePlaque
                  discipline="donino"
                  count={doninoList.length}
                  canonicalKey={canonicalKey}
                  breedNameRu={breedNameRu}
                />
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
  )
}
