import type { ReactNode } from 'react'
import PodiumRankMark, { type PodiumPlace } from '../../components/PodiumRankMark'
import HoverTooltip from '../../components/ui/HoverTooltip'

function toPlace(value: number | string | null | undefined): number | null {
  if (value == null || value === '') return null
  const n = typeof value === 'number' ? value : Number(String(value).replace(/^#/, ''))
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.trunc(n)
}

/** Место в истории: все места 1–10 как круглый бейдж, иначе тихий #N. */
export function HistoryPlacement({
  placement,
  status,
}: {
  placement: number | string | null | undefined
  status?: string | null
}) {
  // Показываем красный крестик для дисквалификации
  if (status === 'disqualified') {
    return (
      <HoverTooltip label="Отстранение" placement="top" variant="site" delayMs={0} portal>
        <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 border-2 border-red-500 dark:border-red-600 flex items-center justify-center cursor-help">
          <svg className="w-3 h-3 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </HoverTooltip>
    )
  }

  const place = toPlace(placement)
  if (place == null) return null

  if (place <= 10) {
    return (
      <PodiumRankMark
        place={place as PodiumPlace}
        size="sm"
        className="block"
      />
    )
  }

  return (
    <span
      className="text-sm font-semibold tabular-nums text-old-money-500 dark:text-old-money-400"
      aria-label={`${place}-е место`}
    >
      #{place}
    </span>
  )
}

/**
 * Дата | сосед (баллы / оценка) | место.
 * Место всегда в фиксированной правой колонке — не ездит от ширины соседа.
 */
export function HistoryMetaRow({
  date,
  placement,
  status,
  trailing,
}: {
  date: ReactNode
  placement: number | string | null | undefined
  status?: string | null
  trailing?: ReactNode
}) {
  return (
    <div className="mt-1 grid grid-cols-[minmax(0,1fr)_auto_1.75rem] items-center gap-x-2">
      <div className="min-w-0 font-semibold text-charcoal-800 dark:text-charcoal-100">{date}</div>
      <div className="justify-self-end">{trailing ?? null}</div>
      <div className="flex h-[26px] w-7 items-center justify-center justify-self-end">
        <HistoryPlacement placement={placement} status={status} />
      </div>
    </div>
  )
}
