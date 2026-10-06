import { type ReactNode, useEffect, useRef } from 'react'

export interface SubNavTabItem<T extends string = string> {
  id: T
  label: ReactNode
}

interface MobileSubNavTabsProps<T extends string = string> {
  tabs: readonly SubNavTabItem<T>[]
  activeTab: T
  onChange: (tabId: T) => void
  className?: string
  ariaLabel?: string
  layout?: 'auto' | 'fill' | 'scroll'
  breakpoint?: 'md' | 'lg'
}

export function MobileSubNavTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
  ariaLabel = 'Вкладки раздела',
  layout = 'auto',
  breakpoint = 'md',
}: MobileSubNavTabsProps<T>) {
  const activeTabRef = useRef<HTMLButtonElement | null>(null)
  const isFill = layout === 'fill' || (layout === 'auto' && tabs.length <= 4)
  const hideClass = breakpoint === 'lg' ? 'lg:hidden' : 'md:hidden'

  useEffect(() => {
    if (!isFill) {
      activeTabRef.current?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      })
    }
  }, [activeTab, isFill])

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`relative mb-5 ${hideClass} border-b border-old-money-200/90 ${className}`.trim()}
    >
      <div
        className={
          isFill
            ? 'flex w-full items-center'
            : 'flex items-center gap-5 overflow-x-auto no-scrollbar scroll-smooth pr-8 pl-0.5'
        }
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
              className={`pt-2 pb-2.5 text-xs whitespace-nowrap transition-all border-b-2 -mb-[1px] ${
                isFill ? 'flex-1 text-center justify-center' : 'shrink-0'
              } ${
                isActive
                  ? 'border-camel-600 font-bold text-charcoal-900'
                  : 'border-transparent font-medium text-charcoal-500 hover:text-charcoal-800 active:text-charcoal-900'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Мягкий градиент затухания справа только в режиме прокрутки */}
      {!isFill && (
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-om-50 via-om-50/80 to-transparent" />
      )}
    </div>
  )
}
