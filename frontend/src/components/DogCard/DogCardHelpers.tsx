import { ratingScoreFromRow } from '../../../../backend/lib/rating/coursing-rating-score'
import { MedalIcon, type MedalVariant } from '../MedalTally'
import type { DogCardProps } from './DogCardContext'

/** Единая высота карточки в двухколоночном рейтинге (строки выравниваются попарно). */
export const DOG_CARD_HEIGHT_CLASS = 'h-[4.25rem]'

export const CARD_SHELL =
  `group relative grid min-h-[4.25rem] sm:h-[4.25rem] grid-rows-[auto_auto] gap-0 overflow-hidden rounded-xl border border-old-money-200 bg-white p-2 transition-colors duration-200 hover:border-camel-300 hover:bg-cream-50`

export const EMBEDDED_SHELL =
  `group relative grid min-h-[4.25rem] sm:h-[4.25rem] grid-rows-[auto_auto] gap-0 overflow-hidden border-0 bg-transparent px-3 sm:px-4 py-1 shadow-none transition-colors duration-150 hover:bg-camel-100/60`

/** Soft wash inside the row for ranks 1–3 (bar sits outside — see Top3AccentBar). */
export const TOP3_WASH: Record<1 | 2 | 3, string> = {
  1: 'bg-amber-50/45',
  2: 'bg-slate-100/55',
  3: 'bg-orange-50/45',
}

export const TOP3_BAR: Record<1 | 2 | 3, string> = {
  1: 'bg-[var(--rank-1-color)]',
  2: 'bg-[var(--rank-2-color)]',
  3: 'bg-[var(--rank-3-color)]',
}

/** Vertical accent outside the row (needs parent list gutter, e.g. pl-[3px]). */
export function Top3AccentBar({ rank }: { rank: number }) {
  return null
}

export function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex min-w-0 flex-col justify-center rounded-lg bg-cream-100 px-2 py-1.5 text-center">
      <p className="mb-0.5 truncate text-[9px] uppercase tracking-wide text-charcoal-500">
        {label}
      </p>
      <p className="truncate text-sm font-bold tabular-nums text-camel-700">{value}</p>
    </div>
  )
}

export function formatScore(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return '—'
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function formatIndexScore(dog: DogCardProps['dog']): string {
  const raw = dog.rating_score ?? ratingScoreFromRow(dog as Record<string, unknown>)
  if (raw == null || Number.isNaN(raw) || raw === 0) return '—'
  return Number(raw).toFixed(2)
}

/** CS breakdown: avg / peak judge / protocol Σ (starts shown separately). */
export function CsDetailLine({
  dog,
  align = 'end',
}: {
  dog: DogCardProps['dog']
  align?: 'center' | 'end'
}) {
  return (
    <div
      className={`flex flex-nowrap items-center gap-x-1.5 whitespace-nowrap text-[9px] leading-tight text-charcoal-500 ${
        align === 'center' ? 'justify-center' : 'justify-end'
      }`}
    >
      <span>
        ср.{' '}
        <span className="font-semibold tabular-nums text-charcoal-700">
          {formatScore(dog.avg_judge_score)}
        </span>
      </span>
      <span className="text-old-money-300" aria-hidden>
        ·
      </span>
      <span>
        лучш.{' '}
        <span className="font-semibold tabular-nums text-charcoal-700">
          {formatScore(dog.best_judge_score)}
        </span>
      </span>
      <span className="text-old-money-300" aria-hidden>
        ·
      </span>
      <span>
        Σ{' '}
        <span className="font-semibold tabular-nums text-charcoal-700">
          {formatScore(dog.best_score)}
        </span>
      </span>
    </div>
  )
}

export function StartsLabel({
  starts,
  size = 'sm',
  label,
}: {
  starts: number
  size?: 'sm' | 'md'
  label?: string
}) {
  const isMd = size === 'md'
  return (
    <div
      className={`flex shrink-0 items-center gap-1 sm:gap-1.5 ${
        isMd ? 'h-5 sm:h-7 text-xs sm:text-sm text-charcoal-600' : 'text-[9px] text-charcoal-500'
      }`}
    >
      {label ? (
        <span>{label}</span>
      ) : (
        <>
          <span className="hidden sm:inline">Забегов</span>
          <span className="sm:hidden text-[10px] text-charcoal-500">Заб.</span>
        </>
      )}
      <span
        className={`inline-block text-right font-bold tabular-nums leading-none text-charcoal-900 ${
          isMd ? 'text-xs sm:text-base sm:w-[3ch]' : 'text-[10px] sm:text-xs'
        }`}
      >
        {starts}
      </span>
    </div>
  )
}

export function ScoreStatsRow({ dog }: { dog: DogCardProps['dog'] }) {
  const starts = dog.total_starts || 0
  return (
    <div className="flex h-12 shrink-0 items-center justify-between gap-3 rounded-lg bg-cream-100 px-2 py-1.5">
      <div className="flex min-w-0 flex-col justify-center gap-0.5">
        <div className="flex items-baseline gap-1 leading-none">
          <span className="text-lg font-bold tabular-nums text-camel-700">
            {formatIndexScore(dog)}
          </span>
          <span className="text-[8px] font-semibold uppercase tracking-wide text-charcoal-500">
            индекс
          </span>
        </div>
        <CsDetailLine dog={dog} align="end" />
      </div>
      <StartsLabel starts={starts} />
    </div>
  )
}

export function MedalStatBox({ variant, value }: { variant: MedalVariant; value?: number }) {
  return (
    <div className="flex min-w-0 flex-col justify-center rounded-lg bg-cream-100 px-2 py-1.5 text-center">
      <div className="mb-0.5 flex justify-center">
        <MedalIcon variant={variant} size="sm" />
      </div>
      <p className="text-sm font-bold tabular-nums text-charcoal-800">{value ?? 0}</p>
    </div>
  )
}
