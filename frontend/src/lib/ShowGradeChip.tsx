import HoverTooltip from '../components/ui/HoverTooltip'
import { formatShowGradeBadge } from '../../../backend/lib/show-grades'

/** Общий каркас чипа протокола выставки (оценки и награды в одной таблице). */
export const SHOW_CHIP_BASE =
  'inline-flex shrink-0 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold tracking-wide'

export const SHOW_GRADE_CHIP_CLASS = `${SHOW_CHIP_BASE} border-old-money-300 bg-cream-50 text-charcoal-800 dark:border-charcoal-500 dark:bg-charcoal-800/80 dark:text-charcoal-100`

export const SHOW_ABSENCE_CHIP_CLASS = `${SHOW_CHIP_BASE} border-charcoal-300 bg-charcoal-50 text-charcoal-600 dark:border-charcoal-500 dark:bg-charcoal-800 dark:text-charcoal-300`

/** Награды в каталоге — тот же силуэт, что у оценок (без разнобоя категорий). */
export const SHOW_AWARD_CHIP_CLASS = SHOW_GRADE_CHIP_CLASS

type ShowGradeChipProps = {
  grade: string | null | undefined
  /** Larger chip for profile hero stats */
  size?: 'sm' | 'md'
  className?: string
}

/**
 * Единый бейдж оценки РКФ: ОТЛ / ОЧ.ХОР / ХОР / УД / ОП / П / НЯ / Б/О / ДСК.
 * Полная подпись — только в tooltip. Без оценки — пусто (не «—»).
 */
export function ShowGradeChip({ grade, size = 'sm', className = '' }: ShowGradeChipProps) {
  const parsed = formatShowGradeBadge(grade)
  if (!parsed) return null
  const absence = parsed.badge === 'НЯ' || parsed.badge === 'Б/О' || parsed.badge === 'ДСК'
  const sizeClass = size === 'md' ? 'px-2 py-1 text-sm' : ''
  return (
    <HoverTooltip label={parsed.label} placement="top" variant="site" delayMs={0} portal>
      <span
        className={`${absence ? SHOW_ABSENCE_CHIP_CLASS : SHOW_GRADE_CHIP_CLASS} ${sizeClass} ${className}`}
        tabIndex={0}
      >
        {parsed.badge}
      </span>
    </HoverTooltip>
  )
}

export default ShowGradeChip
