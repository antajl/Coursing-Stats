import type { ReactNode } from 'react'
import PodiumRankMark, { type PodiumPlace } from '../../components/PodiumRankMark'
import HoverTooltip from '../../components/ui/HoverTooltip'
import { displayStatusReason } from '../../lib/statusReason'
import { ShowGradeChip } from '../../lib/ShowGradeChip'

function toPlace(value: number | string | null | undefined): number | null {
  if (value == null || value === '') return null
  const n = typeof value === 'number' ? value : Number(String(value).replace(/^#/, ''))
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.trunc(n)
}

const DQ_STATUSES = new Set([
  'disqualified',
  'dismissed',
  'eliminated',
  'dnf',
  'withdrawn',
])

const DNS_STATUSES = new Set([
  'dns',
  'absent',
])

export function getStatusCategory(
  status?: string | null,
  statusReason?: string | null,
): 'dq' | 'dns' | null {
  const normStatus = (status || '').trim().toLowerCase()
  if (DQ_STATUSES.has(normStatus)) return 'dq'
  if (DNS_STATUSES.has(normStatus)) return 'dns'

  if (statusReason) {
    if (/(?:дисквал|отстран|сош|снят|травм|выбыв)/i.test(statusReason)) return 'dq'
    if (/(?:не\s*явка|dns)/i.test(statusReason)) return 'dns'
  }

  return null
}

/** Место в истории: все места 1–10 как круглый бейдж, иначе тихий #N. */
export function HistoryPlacement({
  placement,
  status,
  statusReason,
}: {
  placement?: number | string | null
  status?: string | null
  statusReason?: string | null
}) {
  const normStatus = (status || '').trim().toLowerCase()
  const category = getStatusCategory(normStatus, statusReason)

  // Показываем красный крестик для дисквалификации / снятия / DNF / выбывания
  if (category === 'dq') {
    const defaultLabel =
      normStatus === 'dismissed'
        ? 'Отстранение'
        : normStatus === 'dnf'
          ? 'Сошёл'
          : normStatus === 'eliminated'
            ? 'Выбывание'
            : normStatus === 'withdrawn'
              ? 'Снят'
              : 'Дисквалификация'
    const label = displayStatusReason(statusReason) || defaultLabel

    return (
      <HoverTooltip label={label} placement="top" variant="site" delayMs={0} portal>
        <div className="w-6 h-6 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center cursor-help">
          <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </HoverTooltip>
    )
  }

  // Неявка
  if (category === 'dns') {
    return (
      <HoverTooltip label="Неявка" placement="top" variant="site" delayMs={0} portal>
        <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-gray-400 flex items-center justify-center cursor-help">
          <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      className="text-sm font-semibold tabular-nums text-old-money-500"
      aria-label={`${place}-е место`}
    >
      #{place}
    </span>
  )
}

/**
 * Дата | сосед (баллы / оценка / скорость) | место.
 * Место всегда в фиксированной правой колонке — не ездит от ширины соседа.
 */
export function HistoryMetaRow({
  date,
  placement,
  status,
  statusReason,
  trailing,
  speed,
  grade,
}: {
  date: ReactNode
  placement?: number | string | null
  status?: string | null
  statusReason?: string | null
  trailing?: ReactNode
  speed?: number | string | null
  grade?: string | null
}) {
  let effectiveTrailing = trailing ?? null
  if (!effectiveTrailing) {
    if (speed != null) {
      effectiveTrailing = (
        <span className="text-xs font-semibold tabular-nums text-warm-blue-800">
          {typeof speed === 'number' ? speed.toFixed(2) : speed} км/ч
        </span>
      )
    } else if (grade) {
      effectiveTrailing = <ShowGradeChip grade={grade} size="sm" />
    }
  }

  return (
    <div className="mt-1 grid grid-cols-[minmax(0,1fr)_auto_1.75rem] items-center gap-x-2">
      <div className="min-w-0 font-semibold text-charcoal-800">{date}</div>
      <div className="justify-self-end">{effectiveTrailing}</div>
      <div className="flex h-[26px] w-7 items-center justify-center justify-self-end">
        <HistoryPlacement placement={placement} status={status} statusReason={statusReason} />
      </div>
    </div>
  )
}
