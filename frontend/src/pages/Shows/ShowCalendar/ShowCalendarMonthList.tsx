import { useMemo, type RefObject } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
  prevMonthLabel?: string | null
  nextMonthLabel?: string | null
  onGoPrev?: () => void
  onGoNext?: () => void
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
  prevMonthLabel,
  nextMonthLabel,
  onGoPrev,
  onGoNext,
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
            {/* Шапка месяца в стиле рейтинга (DoninoColumnPlaque asHeader) с кнопками навигации */}
            <div className="relative flex min-h-11 items-center justify-between gap-1.5 border-b border-[rgba(195,168,128,0.55)] bg-cream-100/90 px-3 sm:px-4 py-1.5">
              <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink">
                <h2 className="relative z-[1] text-xs sm:text-sm font-bold uppercase tracking-wider text-camel-800 truncate">
                  {chunk.label}
                </h2>
                <span className="relative z-[1] hidden sm:inline text-xs font-semibold text-old-money-600 shrink-0">
                  {formatShowCount(chunk.count)}
                </span>
                <span className="relative z-[1] sm:hidden text-[11px] font-semibold text-old-money-500 shrink-0">
                  ({chunk.count})
                </span>
              </div>

              {(onGoPrev || onGoNext) && (
                <div className="relative z-[1] flex items-center gap-1 sm:gap-2 shrink-0">
                  {onGoPrev && prevMonthLabel && (
                    <button
                      type="button"
                      onClick={onGoPrev}
                      className="cs-glass-pill inline-flex h-8 items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3 text-xs font-semibold !text-charcoal-700 hover:!text-charcoal-950 transition-all cursor-pointer select-none shadow-2xs active:scale-95"
                      title={`Показать ${prevMonthLabel}`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5 text-camel-600 shrink-0" />
                      <span>{prevMonthLabel}</span>
                    </button>
                  )}
                  {onGoNext && nextMonthLabel && (
                    <button
                      type="button"
                      onClick={onGoNext}
                      className="cs-glass-pill inline-flex h-8 items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3 text-xs font-semibold !text-charcoal-700 hover:!text-charcoal-950 transition-all cursor-pointer select-none shadow-2xs active:scale-95"
                      title={`Показать ${nextMonthLabel}`}
                    >
                      <span>{nextMonthLabel}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-camel-600 shrink-0" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Карточки выставок без промежутков с разделителями */}
            {chunk.groups.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <p className="text-sm font-semibold text-charcoal-700 mb-1">
                  В этом месяце протоколов пока нет
                </p>
                <p className="text-xs text-old-money-500 mb-4">
                  Протоколы выставок за {chunk.label.toLowerCase()} ещё не загружены
                </p>
                {onGoPrev && prevMonthLabel && (
                  <button
                    type="button"
                    onClick={onGoPrev}
                    className="cs-glass-pill inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-semibold !text-charcoal-700 hover:!text-charcoal-950 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4 text-camel-600" />
                    <span>Вернуться к {prevMonthLabel}</span>
                  </button>
                )}
              </div>
            ) : (
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
            )}
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
