import { useMemo, type RefObject } from 'react'
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

function formatShowCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return `${count} выставок`
  if (mod10 === 1) return `${count} выставка`
  if (mod10 >= 2 && mod10 <= 4) return `${count} выставки`
  return `${count} выставок`
}

export function ShowCalendarMonthList({
  visibleRows,
  expandedKeys,
  onToggleExpanded,
  hasMore,
  loadMoreRef,
}: ShowCalendarMonthListProps) {
  const monthChunks = useMemo(() => {
    const chunks: Array<{
      key: string
      label: string
      count: number
      groups: RkfCalendarGroup[]
    }> = []

    let currentChunk: {
      key: string
      label: string
      count: number
      groups: RkfCalendarGroup[]
    } | null = null

    for (const row of visibleRows) {
      if (row.kind === 'month') {
        currentChunk = {
          key: row.key,
          label: row.label,
          count: row.count,
          groups: [],
        }
        chunks.push(currentChunk)
      } else if (currentChunk) {
        currentChunk.groups.push(row.group)
      }
    }

    return chunks
  }, [visibleRows])

  return (
    <div className="space-y-4">
      {monthChunks.map((chunk) => (
        <div key={chunk.key} className="min-w-0">
          <div className="cs-glass-card min-w-0 overflow-hidden rounded-2xl bg-white flex flex-col">
            {/* Шапка месяца в стиле рейтинга (DoninoColumnPlaque asHeader) */}
            <div className="relative flex h-10 min-h-10 items-center justify-between border-b border-[rgba(195,168,128,0.55)] bg-cream-100/90 px-3.5">
              <h2 className="relative z-[1] text-xs font-bold uppercase tracking-wider text-camel-800 truncate">
                {chunk.label}
              </h2>
              <span className="relative z-[1] ml-auto shrink-0 pl-2 text-xs font-semibold text-old-money-600">
                {formatShowCount(chunk.count)}
              </span>
            </div>

            {/* Карточки выставок без промежутков с разделителями */}
            <div className="flex flex-col divide-y divide-old-money-100">
              {chunk.groups.map((group) => {
                const isMulti = group.children.length > 1
                return (
                  <ShowCalendarRow
                    key={group.key}
                    group={group}
                    expanded={isMulti && expandedKeys.has(group.key)}
                    onToggleExpanded={onToggleExpanded}
                  />
                )
              })}
            </div>
          </div>
        </div>
      ))}

      {hasMore && (
        <div
          ref={loadMoreRef}
          className="py-4 text-center text-sm text-charcoal-500"
        >
          Загрузка…
        </div>
      )}
    </div>
  )
}
