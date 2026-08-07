import type { RefObject } from 'react'
import type { RkfCalendarGroup } from '../showCalendarGroup'
import { ShowCalendarRow } from './ShowCalendarRow'

export type ShowCalendarFlatRow =
  | { kind: 'month'; key: string; label: string; count: number }
  | { kind: 'group'; key: string; group: RkfCalendarGroup }

export interface ShowCalendarMonthListProps {
  visibleRows: ShowCalendarFlatRow[]
  expandedKeys: Set<string>
  onToggleExpanded: (key: string) => void
  hasMore: boolean
  loadMoreRef: RefObject<HTMLDivElement>
}

export function ShowCalendarMonthList({
  visibleRows,
  expandedKeys,
  onToggleExpanded,
  hasMore,
  loadMoreRef,
}: ShowCalendarMonthListProps) {
  return (
    <div>
      {visibleRows.map((row) => {
        if (row.kind === 'month') {
          return (
            <div
              key={row.key}
              className="sticky top-2 z-10 mb-1.5 mt-1.5 flex items-baseline justify-between rounded-lg bg-old-money-100 dark:bg-charcoal-800 px-3.5 py-1.5 font-serif text-sm font-bold text-old-money-700 dark:text-old-money-300 first:mt-0"
            >
              <span>{row.label}</span>
              <span className="font-mono text-xs font-normal text-charcoal-500 dark:text-charcoal-300">
                {row.count}{' '}
                {row.count === 1 ? 'выставка' : row.count < 5 ? 'выставки' : 'выставок'}
              </span>
            </div>
          )
        }

        const isMulti = row.group.children.length > 1
        return (
          <ShowCalendarRow
            key={row.key}
            group={row.group}
            expanded={isMulti && expandedKeys.has(row.group.key)}
            onToggleExpanded={onToggleExpanded}
          />
        )
      })}

      {hasMore && (
        <div
          ref={loadMoreRef}
          className="py-4 text-center text-sm text-charcoal-500 dark:text-charcoal-400"
        >
          Загрузка…
        </div>
      )}
    </div>
  )
}
