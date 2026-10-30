import React from 'react'
import type { DisciplineTabId, DisciplineTabItem } from './types'
import { useMobileSwipeCarousel } from './useMobileSwipeCarousel'
import { EmptyDisciplineColumn } from './EmptyDisciplineColumn'

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

  const { isDragging, isAnimating, mobileTransform, hadMovedRef, touchHandlers } =
    useMobileSwipeCarousel({
      tabsCount: availableTabs.length,
      activeIndex,
      onIndexChange: (newIndex) => {
        if (newIndex >= 0 && newIndex < availableTabs.length) {
          setActiveDiscipline(availableTabs[newIndex].id)
        }
      },
    })

  return (
    <>
      {/* Мобильный сегмент-контрол дисциплин */}
      {availableTabs.length > 1 && (
        <div
          className={`mb-4 w-full p-1 rounded-2xl bg-cream-100/80 border border-old-money-200/90 shadow-2xs lg:hidden ${
            availableTabs.length <= 3
              ? 'grid gap-1.5'
              : 'flex items-center gap-1.5 overflow-x-auto no-scrollbar'
          }`}
          style={
            availableTabs.length <= 3
              ? { gridTemplateColumns: `repeat(${availableTabs.length}, minmax(0, 1fr))` }
              : undefined
          }
          role="tablist"
          aria-label="Дисциплины собаки"
        >
          {availableTabs.map((tab) => {
            const isActive = activeDiscipline === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-controls={`tabpanel-${tab.id}`}
                aria-selected={isActive}
                onClick={() => setActiveDiscipline(tab.id)}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-1.5 min-h-[44px] text-xs font-semibold transition-all min-w-0 ${
                  availableTabs.length > 3 ? 'shrink-0 px-3' : 'w-full'
                } ${
                  isActive
                    ? tab.theme === 'forest'
                      ? 'bg-forest-600 text-white shadow-xs'
                      : tab.theme === 'warm-blue'
                        ? 'bg-warm-blue-700 text-white shadow-xs'
                        : 'bg-camel-600 text-white shadow-xs'
                    : 'text-charcoal-700 hover:text-charcoal-900 hover:bg-white/50'
                }`}
              >
                <tab.icon
                  className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : 'text-charcoal-400'}`}
                  aria-hidden
                />
                <span className="truncate">{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`inline-flex items-center justify-center h-4.5 min-w-[1.25rem] px-1.5 rounded-full text-[10px] font-bold tabular-nums leading-none shrink-0 ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-old-money-200/70 text-charcoal-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Мобильный вид: горизонтальный свайп-трек между дисциплинами */}
      <div className="mb-6 block lg:hidden">
        {availableTabs.length === 0 ? (
          <EmptyDisciplineColumn title="Курсинг / БЗМП" theme="forest" />
        ) : (
          <div
            className="w-full relative overflow-hidden touch-pan-y"
            {...touchHandlers}
            onClickCapture={(e) => {
              if (hadMovedRef.current) {
                e.preventDefault()
                e.stopPropagation()
              }
            }}
          >
            <div
              className={`flex w-full items-start ${
                isDragging ? '' : 'transition-transform duration-300 ease-out'
              }`}
              style={{
                transform: mobileTransform,
              }}
            >
              {availableTabs.map((tab, idx) => {
                const isCurrent = idx === activeIndex
                const shouldCollapse = !isAnimating && !isCurrent
                return (
                  <div
                    key={tab.id}
                    id={`tabpanel-${tab.id}`}
                    role="tabpanel"
                    aria-labelledby={`tab-${tab.id}`}
                    className={`w-full shrink-0 transition-opacity duration-200 ${
                      shouldCollapse ? 'h-0 overflow-hidden opacity-0' : 'h-auto opacity-100'
                    }`}
                  >
                    {renderTabContent(tab.id)}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
