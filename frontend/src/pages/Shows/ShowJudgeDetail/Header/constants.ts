export type PeriodStrictness = {
  graded: number
  excellent_rate: number | null
}

export const DEFAULT_GRADE_ACCENT = {
  dot: 'bg-charcoal-400',
  border: 'border-charcoal-200/80',
  activeBorder: 'border-charcoal-600',
  activeBg: 'bg-cream-100',
}

export const GRADE_ACCENTS: Record<
  string,
  { dot: string; border: string; activeBorder: string; activeBg: string }
> = {
  excellent: {
    dot: 'bg-emerald-500',
    border: 'border-emerald-200/80',
    activeBorder: 'border-emerald-600',
    activeBg: 'bg-emerald-50',
  },
  very_good: {
    dot: 'bg-sky-500',
    border: 'border-sky-200/80',
    activeBorder: 'border-sky-600',
    activeBg: 'bg-sky-50',
  },
  good: {
    dot: 'bg-amber-500',
    border: 'border-amber-200/80',
    activeBorder: 'border-amber-600',
    activeBg: 'bg-amber-50',
  },
  satisfactory: {
    dot: 'bg-orange-500',
    border: 'border-orange-200/80',
    activeBorder: 'border-orange-600',
    activeBg: 'bg-orange-50',
  },
  very_promising: {
    dot: 'bg-teal-500',
    border: 'border-teal-200/80',
    activeBorder: 'border-teal-600',
    activeBg: 'bg-teal-50',
  },
  promising: {
    dot: 'bg-cyan-500',
    border: 'border-cyan-200/80',
    activeBorder: 'border-cyan-600',
    activeBg: 'bg-cyan-50',
  },
  dq: {
    dot: 'bg-rose-500',
    border: 'border-rose-200/80',
    activeBorder: 'border-rose-600',
    activeBg: 'bg-rose-50',
  },
  without_evaluation: {
    dot: 'bg-charcoal-400',
    border: 'border-charcoal-200/80',
    activeBorder: 'border-charcoal-600',
    activeBg: 'bg-cream-100',
  },
  absent: {
    dot: 'bg-charcoal-300',
    border: 'border-charcoal-200/60',
    activeBorder: 'border-charcoal-500',
    activeBg: 'bg-cream-100',
  },
}
