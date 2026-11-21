import React from 'react'
import type { DisciplineTabId, DisciplineTabItem } from './types'
import { useHorizontalSwipe } from '../../hooks/useHorizontalSwipe'
import { EmptyDisciplineColumn } from './EmptyDisciplineColumn'
import { DisciplineMobileNavContext } from './DisciplineColumnShell'

interface DogDisciplinesMobileViewProps {
  availableTabs: DisciplineTabItem[]
  activeDiscipline: DisciplineTabId
  setActiveDiscipline: (id: DisciplineTabId) => void
  renderTabContent: (tabId: DisciplineTabId) => React.ReactNode
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

  // Мобильный свайп-жест между дисциплинами (аппаратное ускорение 120 FPS с отступом между карточками)
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
    gapPx: 16,
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
            className="flex flex-nowrap w-full min-w-0 items-start gap-4 [transform:translateZ(0)] [backface-visibility:hidden]"
            style={{
              transform:
                availableTabs.length <= 1
                  ? 'none'
                  : `translate3d(${getSlideOffset(activeIndex)}, 0, 0)`,
              willChange: availableTabs.length > 1 ? 'transform' : 'auto',
            }}
          >
            {availableTabs.map((tab, idx) => {
              const prevTab =
                availableTabs.length > 1 && idx > 0 ? availableTabs[idx - 1] : null
              const nextTab =
                availableTabs.length > 1 && idx < availableTabs.length - 1
                  ? availableTabs[idx + 1]
                  : null

              return (
                <div
                  key={tab.id}
                  id={`tabpanel-${tab.id}`}
                  role="tabpanel"
                  aria-labelledby={`tab-${tab.id}`}
                  className="w-full max-w-full min-w-0 shrink-0 basis-full flex flex-col [contain:content]"
                >
                  <div id={tab.id} className="scroll-mt-20" />
                  <DisciplineMobileNavContext.Provider
                    value={{
                      prevTab,
                      nextTab,
                      onNavigateTab: setActiveDiscipline,
                    }}
                  >
                    {renderTabContent(tab.id)}
                  </DisciplineMobileNavContext.Provider>
                </div>
              )
            })}
          </div>

          {/* Стационарный индикатор пагинации свайпа (остаётся на месте при горизонтальном свайпе карточек) */}
          {availableTabs.length > 1 && (
            <div
              className="pointer-events-auto absolute top-[21rem] md:top-[21.5rem] left-0 right-0 z-30 flex items-center justify-center gap-2 py-1 select-none"
              role="tablist"
              aria-label="Индикатор выбранной дисциплины"
            >
              {availableTabs.map((t, idx) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveDiscipline(t.id)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer touch-manipulation ${
                    idx === activeIndex
                      ? 'w-6 bg-camel-600 shadow-2xs'
                      : 'w-2 bg-camel-300 hover:bg-camel-400'
                  }`}
                  title={`Перейти: ${t.label}`}
                  aria-label={`Перейти: ${t.label}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
