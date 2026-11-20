import React, { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { DisciplineTabId, DisciplineTabItem } from './types'
import { useHorizontalSwipe } from '../../hooks/useHorizontalSwipe'
import { EmptyDisciplineColumn } from './EmptyDisciplineColumn'

interface DogDisciplinesMobileViewProps {
  availableTabs: DisciplineTabItem[]
  activeDiscipline: DisciplineTabId
  setActiveDiscipline: (id: DisciplineTabId) => void
  renderTabContent: (tabId: DisciplineTabId) => React.ReactNode
}

export function formatDisciplineCount(id: DisciplineTabId, count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (id === 'coursing') {
    if (mod100 >= 11 && mod100 <= 19) return `${count} состязаний`
    if (mod10 === 1) return `${count} состязание`
    if (mod10 >= 2 && mod10 <= 4) return `${count} состязания`
    return `${count} состязаний`
  }
  if (id === 'racing') {
    if (mod100 >= 11 && mod100 <= 19) return `${count} забегов`
    if (mod10 === 1) return `${count} забег`
    if (mod10 >= 2 && mod10 <= 4) return `${count} забега`
    return `${count} забегов`
  }
  if (id === 'shows') {
    if (mod100 >= 11 && mod100 <= 19) return `${count} выставок`
    if (mod10 === 1) return `${count} выставка`
    if (mod10 >= 2 && mod10 <= 4) return `${count} выставки`
    return `${count} выставок`
  }
  return `${count}`
}

export const DogDisciplinesMobileView: React.FC<DogDisciplinesMobileViewProps> = ({
  availableTabs,
  activeDiscipline,
  setActiveDiscipline,
  renderTabContent,
}) => {
  const activeIndex = Math.max(
    0,
    availableTabs.findIndex((t) => t.id === activeDiscipline),
  )

  const activeTabObj = useMemo(
    () => availableTabs[activeIndex] || availableTabs[0],
    [availableTabs, activeIndex],
  )

  // Язычки-бейджики слева и справа от заголовка (линейная навигация без зацикливания, как в /breeds/whippet/)
  const prevTab = useMemo(() => {
    if (activeIndex <= 0) return null
    return availableTabs[activeIndex - 1]
  }, [availableTabs, activeIndex])

  const nextTab = useMemo(() => {
    if (activeIndex >= availableTabs.length - 1) return null
    return availableTabs[activeIndex + 1]
  }, [availableTabs, activeIndex])

  // Мобильный свайп-жест между дисциплинами (аппаратное ускорение 120 FPS)
  const {
    trackRef,
    getSlideOffset,
    startDrag,
    moveDrag,
    endDrag,
    cancelDrag,
    handleClickCapture,
  } = useHorizontalSwipe({
    activeTabsCount: availableTabs.length,
    activeTabIndex: activeIndex,
    onTabChange: (newIndex) => {
      if (newIndex >= 0 && newIndex < availableTabs.length) {
        setActiveDiscipline(availableTabs[newIndex].id)
      }
    },
  })

  return (
    <div className="mb-6 block lg:hidden w-full">
      {availableTabs.length === 0 ? (
        <EmptyDisciplineColumn title="Курсинг / БЗМП" theme="forest" />
      ) : (
        <>
          {/* Единая шапка таблицы дисциплин: язычки-бейджики слева и справа, название в середине */}
          {availableTabs.length > 1 && (
            <div className="donino-column-plaque relative flex h-11 min-h-[44px] items-center justify-between rounded-xl border border-[rgba(195,168,128,0.70)] bg-cream-100/90 px-3 mb-3 select-none overflow-hidden shadow-2xs">
              {/* Левый язычок (прикреплён к левому краю, rounded-r-full) */}
              {prevTab && (
                <button
                  type="button"
                  onClick={() => setActiveDiscipline(prevTab.id)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-1 bg-[#fbf7f0]/85 text-camel-950 font-bold text-[11px] py-1 pl-2.5 pr-3 rounded-r-full border-y border-r border-camel-400/60 shadow-xs backdrop-blur-md transition-all hover:bg-camel-100/90 active:scale-95 cursor-pointer touch-manipulation select-none"
                  title={`Перейти: ${prevTab.label}`}
                  aria-label={`Перейти: ${prevTab.label}`}
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-camel-800 shrink-0" aria-hidden />
                  <span className="tracking-tight">{prevTab.label}</span>
                  {prevTab.count !== undefined && prevTab.count > 0 && (
                    <span className="text-[9px] tabular-nums font-bold px-1 py-0 rounded-full bg-camel-200/70 text-camel-900 shrink-0">
                      {prevTab.count}
                    </span>
                  )}
                </button>
              )}

              {/* Название в середине заголовка: 2 строки (дисциплина + количество стартов), гарантированный отступ от язычков */}
              <div
                className={`flex min-w-0 flex-1 flex-col items-center justify-center text-center leading-tight ${
                  availableTabs.length > 1 ? 'px-24 sm:px-28' : 'px-4'
                }`}
              >
                <div className="inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-camel-900 truncate max-w-full">
                  {activeTabObj?.icon && (
                    <activeTabObj.icon className="h-3.5 w-3.5 text-camel-800 shrink-0" aria-hidden />
                  )}
                  <span className="truncate">{activeTabObj?.label}</span>
                </div>
                {activeTabObj && activeTabObj.count !== undefined && activeTabObj.count > 0 && (
                  <div className="text-[10px] font-semibold text-old-money-500 inline-flex items-center justify-center gap-1 leading-none mt-0.5">
                    <span>{formatDisciplineCount(activeTabObj.id, activeTabObj.count)}</span>
                  </div>
                )}
              </div>

              {/* Правый язычок (прикреплён к правому краю, rounded-l-full) */}
              {nextTab && (
                <button
                  type="button"
                  onClick={() => setActiveDiscipline(nextTab.id)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-1 bg-[#fbf7f0]/85 text-camel-950 font-bold text-[11px] py-1 pl-3 pr-2.5 rounded-l-full border-y border-l border-camel-400/60 shadow-xs backdrop-blur-md transition-all hover:bg-camel-100/90 active:scale-95 cursor-pointer touch-manipulation select-none"
                  title={`Перейти: ${nextTab.label}`}
                  aria-label={`Перейти: ${nextTab.label}`}
                >
                  <span className="tracking-tight">{nextTab.label}</span>
                  {nextTab.count !== undefined && nextTab.count > 0 && (
                    <span className="text-[9px] tabular-nums font-bold px-1 py-0 rounded-full bg-camel-200/70 text-camel-900 shrink-0">
                      {nextTab.count}
                    </span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-camel-800 shrink-0" aria-hidden />
                </button>
              )}
            </div>
          )}

          {/* Горизонтальный свайп-трек между дисциплинами */}
          <div
            className="w-full relative overflow-hidden touch-pan-y select-none"
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
              className="flex flex-nowrap w-full min-w-0 items-start gap-0 [transform:translateZ(0)] [backface-visibility:hidden]"
              style={{
                transform:
                  availableTabs.length <= 1
                    ? 'none'
                    : `translate3d(${getSlideOffset(activeIndex)}, 0, 0)`,
                willChange: availableTabs.length > 1 ? 'transform' : 'auto',
              }}
            >
              {availableTabs.map((tab) => (
                <div
                  key={tab.id}
                  id={`tabpanel-${tab.id}`}
                  role="tabpanel"
                  aria-labelledby={`tab-${tab.id}`}
                  className="w-full max-w-full min-w-0 shrink-0 basis-full flex flex-col [contain:content]"
                >
                  <div id={tab.id} className="scroll-mt-20" />
                  {renderTabContent(tab.id)}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
