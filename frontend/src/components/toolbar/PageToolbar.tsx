import type { ReactNode } from 'react'
import { createContext, useContext, useMemo } from 'react'
import { TOOLBAR_PANEL, TOOLBAR_CHIP, TOOLBAR_CHIP_IDLE } from '../../lib/toolbar'

interface PageToolbarContextValue {
  filters: ReactNode
  exportAction?: ReactNode
  trailing?: ReactNode
  onClearAllFilters?: () => void
  bottomLeft?: ReactNode
  bottomRight?: ReactNode
  bare?: boolean
  topRowClassName?: string
}

const PageToolbarContext = createContext<PageToolbarContextValue | null>(null)

function usePageToolbarContext() {
  const context = useContext(PageToolbarContext)
  if (!context) {
    throw new Error('PageToolbar compound components must be used within PageToolbar')
  }
  return context
}

interface PageToolbarProps {
  children?: ReactNode
  filters?: ReactNode
  exportAction?: ReactNode
  /** Справа в первой строке (источник данных и т.п.) */
  trailing?: ReactNode
  onClearAllFilters?: () => void
  bottomLeft?: ReactNode
  bottomRight?: ReactNode
  bare?: boolean
  /** Extra classes on the filters row (e.g. pr-* to clear a corner footnote chip) */
  topRowClassName?: string
}

// Compound components
function PageToolbarFilters() {
  const { filters } = usePageToolbarContext()
  return <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{filters}</div>
}

function PageToolbarActions() {
  const { exportAction, trailing } = usePageToolbarContext()
  const showEnd = Boolean(exportAction || trailing)
  if (!showEnd) return null
  return (
    <div className="flex shrink-0 items-center gap-2">
      {exportAction}
      {trailing}
    </div>
  )
}

function PageToolbarTopRow({ children }: { children?: ReactNode }) {
  const { topRowClassName = '' } = usePageToolbarContext()
  return (
    <div className={`flex flex-wrap items-center justify-between gap-2 ${topRowClassName}`.trim()}>
      {children}
    </div>
  )
}

function PageToolbarBottom() {
  const { bottomLeft, bottomRight } = usePageToolbarContext()
  const showBottom = Boolean(bottomLeft || bottomRight)
  if (!showBottom) return null
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-old-money-200/60 pt-2.5 dark:border-charcoal-600/80">
      {bottomLeft}
      {bottomRight}
    </div>
  )
}

// Attach compound components
PageToolbar.Filters = PageToolbarFilters
PageToolbar.Actions = PageToolbarActions
PageToolbar.TopRow = PageToolbarTopRow
PageToolbar.Bottom = PageToolbarBottom

export default function PageToolbar({
  children,
  filters,
  exportAction,
  trailing,
  onClearAllFilters,
  bottomLeft,
  bottomRight,
  bare = false,
  topRowClassName = '',
}: PageToolbarProps) {
  const showBottom = Boolean(bottomLeft || bottomRight)
  const showEnd = Boolean(exportAction || trailing || onClearAllFilters)

  const contextValue = useMemo<PageToolbarContextValue>(
    () => ({
      filters,
      exportAction,
      trailing,
      onClearAllFilters,
      bottomLeft,
      bottomRight,
      bare,
      topRowClassName,
    }),
    [filters, exportAction, trailing, onClearAllFilters, bottomLeft, bottomRight, bare, topRowClassName]
  )

  return (
    <PageToolbarContext.Provider value={contextValue}>
      <div className={bare ? 'space-y-2.5' : `${TOOLBAR_PANEL} space-y-2.5`}>
        {children || (
          <>
            <div className={`flex flex-wrap items-center justify-between gap-2 ${topRowClassName}`.trim()}>
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{filters}</div>
              {showEnd && (
                <div className="flex shrink-0 items-center gap-2">
                  {exportAction}
                  {trailing}
                  {onClearAllFilters && (
                    <button
                      type="button"
                      onClick={onClearAllFilters}
                      className={`${TOOLBAR_CHIP} ${TOOLBAR_CHIP_IDLE}`}
                    >
                      Сбросить
                    </button>
                  )}
                </div>
              )}
            </div>

            {showBottom && (
              <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-old-money-200/60 pt-2.5 dark:border-charcoal-600/80">
                {bottomLeft}
                {bottomRight}
              </div>
            )}
          </>
        )}
      </div>
    </PageToolbarContext.Provider>
  )
}
