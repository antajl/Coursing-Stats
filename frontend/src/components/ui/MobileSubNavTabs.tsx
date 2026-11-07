import { type ReactNode, useEffect, useRef } from 'react'

export interface SubNavTabItem<T extends string = string> {
  id: T
  label: ReactNode
}

interface MobileSubNavTabsProps<T extends string = string> {
  tabs: readonly SubNavTabItem<T>[]
  activeTab: T
  onChange: (tabId: T) => void
  onHoverTab?: (tabId: T) => void
  isLoading?: boolean
  className?: string
  ariaLabel?: string
  layout?: 'auto' | 'fill' | 'scroll'
  breakpoint?: 'md' | 'lg' | 'none'
}

export function MobileSubNavTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  onHoverTab,
  isLoading = false,
  className = '',
  ariaLabel = 'Вкладки раздела',
  layout = 'auto',
  breakpoint = 'none',
}: MobileSubNavTabsProps<T>) {
  const activeTabRef = useRef<HTMLButtonElement | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const isFill = layout === 'fill' || (layout === 'auto' && tabs.length <= 4)
  const hideClass =
    breakpoint === 'none'
      ? ''
      : breakpoint === 'lg'
        ? 'lg:hidden'
        : 'md:hidden'

  useEffect(() => {
    if (!isFill && scrollContainerRef.current && activeTabRef.current) {
      const container = scrollContainerRef.current
      const el = activeTabRef.current
      const cRect = container.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      const relLeft = elRect.left - cRect.left + container.scrollLeft
      const target = relLeft - (container.clientWidth - elRect.width) / 2
      container.scrollTo({
        left: Math.max(0, target),
        behavior: 'smooth',
      })
    }
  }, [activeTab, isFill])

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`relative mb-3.5 sm:mb-5 overflow-visible py-1 -my-1 select-none w-full ${hideClass} ${className}`.trim()}
    >
      <div
        ref={scrollContainerRef}
        className={`w-full flex items-center p-1 sm:p-1.5 rounded-full border border-old-money-200/90 bg-cream-100/70 backdrop-blur-md shadow-2xs gap-1 sm:gap-1.5 relative ${
          isFill ? 'overflow-visible' : 'overflow-x-auto no-scrollbar scroll-smooth'
        }`}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              ref={isActive && !isFill ? activeTabRef : undefined}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              onMouseEnter={() => onHoverTab?.(tab.id)}
              onTouchStart={() => onHoverTab?.(tab.id)}
              className={`h-9 px-3.5 sm:px-4 rounded-full text-xs sm:text-sm font-semibold transition-all duration-150 ease-out flex items-center justify-center cursor-pointer whitespace-nowrap select-none active:scale-[0.97] touch-manipulation ${
                isFill ? 'flex-1' : 'shrink-0 sm:flex-1'
              } ${
                isActive
                  ? 'cs-glass-pill-active !font-semibold !text-camel-950 shadow-sm'
                  : 'text-charcoal-700 hover:text-charcoal-950 hover:bg-cream-200/60'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {isLoading && (
        <div className="cs-tab-loading-bar" aria-hidden="true">
          <div className="cs-tab-loading-bar-inner" />
        </div>
      )}
    </div>
  )
}
