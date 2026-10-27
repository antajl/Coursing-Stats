import type { ReactNode } from 'react'

export interface SegmentedTabItem<T extends string = string> {
  id: T
  label: ReactNode
  count?: number
  hint?: ReactNode
}

interface SegmentedTabsProps<T extends string = string> {
  tabs: readonly SegmentedTabItem<T>[]
  activeTab: T
  onChange: (tabId: T) => void
  className?: string
  ariaLabel?: string
  breakpoint?: 'md' | 'lg' | 'all'
  size?: 'sm' | 'md'
}

export function SegmentedTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
  ariaLabel = 'Переключение режима',
  breakpoint = 'md',
  size = 'md',
}: SegmentedTabsProps<T>) {
  const hideClass =
    breakpoint === 'lg' ? 'lg:hidden' : breakpoint === 'all' ? '' : 'md:hidden'

  const isSm = size === 'sm'

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex items-center justify-center ${
        isSm ? 'p-0.5 rounded-lg bg-cream-100/80 border border-old-money-200/50' : 'p-1 rounded-xl bg-cream-100 border border-old-money-200/60'
      } shadow-2xs ${hideClass} ${className}`.trim()}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap min-w-0 ${
              isSm ? 'py-1 px-1.5 sm:px-2.5 rounded-md text-[11px]' : 'py-2 px-1.5 sm:px-3 rounded-lg text-[11.5px] sm:text-xs'
            } transition-all ${
              isActive
                ? `bg-white text-charcoal-900 shadow-2xs border border-old-money-200/80 font-semibold`
                : `text-charcoal-600 hover:text-charcoal-900 font-medium border border-transparent`
            }`}
          >
            <span>{tab.label}</span>
            {tab.hint}
            {tab.count !== undefined && (
              <span
                className={`h-4 min-w-[1.25rem] px-1 rounded-full text-[10px] font-bold flex items-center justify-center leading-none ${
                  isActive
                    ? 'bg-camel-100 text-camel-800'
                    : 'bg-charcoal-200/60 text-charcoal-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
