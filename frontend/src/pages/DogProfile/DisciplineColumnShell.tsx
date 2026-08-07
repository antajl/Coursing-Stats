import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

export type DisciplineTheme = 'forest' | 'warm-blue' | 'camel'

const THEME: Record<
  DisciplineTheme,
  {
    cardBorder: string
    heroBorder: string
    heroBg: string
    heroValue: string
    cellBorder: string
    cellBg: string
  }
> = {
  forest: {
    cardBorder: 'border-forest-200 dark:border-forest-700',
    heroBorder: 'border-forest-200 dark:border-forest-600',
    heroBg: 'bg-forest-50/80 dark:bg-charcoal-700/80',
    heroValue: 'text-forest-700 dark:text-forest-300',
    cellBorder: 'border-forest-200 dark:border-forest-600',
    cellBg: 'bg-forest-50/80 dark:bg-charcoal-700/80',
  },
  'warm-blue': {
    cardBorder: 'border-warm-blue-200 dark:border-warm-blue-700',
    heroBorder: 'border-warm-blue-200 dark:border-warm-blue-600',
    heroBg: 'bg-warm-blue-50/80 dark:bg-charcoal-700/80',
    heroValue: 'text-warm-blue-800 dark:text-warm-blue-400',
    cellBorder: 'border-warm-blue-200 dark:border-warm-blue-600',
    cellBg: 'bg-warm-blue-50/80 dark:bg-charcoal-700/80',
  },
  camel: {
    cardBorder: 'border-camel-200 dark:border-camel-700',
    heroBorder: 'border-camel-200 dark:border-camel-600',
    // camel palette starts at 100 (no 50) — use 100/80 to match soft empty-panel tint
    heroBg: 'bg-camel-100/80 dark:bg-charcoal-700/80',
    heroValue: 'text-camel-700 dark:text-camel-300',
    cellBorder: 'border-camel-200 dark:border-camel-600',
    cellBg: 'bg-camel-100/80 dark:bg-charcoal-700/80',
  },
}

export function disciplineTheme(theme: DisciplineTheme) {
  return THEME[theme]
}

const LINK_HINT_THEME: Record<DisciplineTheme, string> = {
  forest:
    'border-forest-200/80 bg-white/90 text-forest-700 shadow-sm hover:border-forest-300 hover:bg-forest-50 dark:border-forest-700/80 dark:bg-charcoal-800/90 dark:text-forest-300 dark:hover:border-forest-600 dark:hover:bg-charcoal-700',
  'warm-blue':
    'border-warm-blue-200/80 bg-white/90 text-warm-blue-700 shadow-sm hover:border-warm-blue-300 hover:bg-warm-blue-50 dark:border-warm-blue-700/80 dark:bg-charcoal-800/90 dark:text-warm-blue-300 dark:hover:border-warm-blue-600 dark:hover:bg-charcoal-700',
  camel:
    'border-camel-200/80 bg-white/90 text-camel-700 shadow-sm hover:border-camel-300 hover:bg-camel-50 dark:border-camel-700/80 dark:bg-charcoal-800/90 dark:text-camel-300 dark:hover:border-camel-600 dark:hover:bg-charcoal-700',
}

/** Подсказка «открыть результаты» в hero-блоке колонки (появляется при hover на карточку-ссылку). */
export function DisciplineHeroLinkHint({ theme }: { theme: DisciplineTheme }) {
  return (
    <div className="mt-1.5 flex min-h-[1.25rem] translate-y-0.5 justify-center opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
      <span
        className={`inline-flex items-center gap-0.5 rounded border px-2 py-0.5 text-[11px] font-semibold leading-none transition-colors ${LINK_HINT_THEME[theme]}`}
      >
        Открыть результаты
        <ChevronRight
          className="h-3 w-3 shrink-0 opacity-70 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </div>
  )
}

/** Общая оболочка колонки: равная ширина/высота каркаса. */
export function DisciplineColumnShell({ children }: { children: ReactNode }) {
  return <div className="flex h-full min-w-0 flex-col gap-4">{children}</div>
}

export function DisciplineStatsCard({
  theme,
  title,
  children,
}: {
  theme: DisciplineTheme
  title: string
  children: ReactNode
}) {
  const t = THEME[theme]
  return (
    <div
      className={`flex h-[24rem] shrink-0 flex-col overflow-hidden rounded-xl border bg-white p-5 dark:bg-charcoal-800 md:h-[25rem] md:p-6 ${t.cardBorder}`}
    >
      <h2 className="mb-4 shrink-0 text-lg font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 md:text-xl">
        {title}
      </h2>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  )
}

export function DisciplineHero({
  theme,
  label,
  value,
  unit,
  footer,
  footerAlwaysVisible = false,
  as: Comp = 'div',
  ...rest
}: {
  theme: DisciplineTheme
  label: string
  value: ReactNode
  unit?: ReactNode
  footer?: ReactNode
  footerAlwaysVisible?: boolean
  as?: 'div' | 'a'
} & Record<string, unknown>) {
  const t = THEME[theme]
  return (
    <Comp
      className={`group mb-4 block h-[7.25rem] shrink-0 overflow-hidden rounded-lg border p-4 text-center transition-colors ${t.heroBorder} ${t.heroBg} ${
        Comp === 'a' ? 'hover:brightness-[0.98] dark:hover:bg-charcoal-600' : ''
      }`}
      {...rest}
    >
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
        {label}
      </div>
      <div
        className={`flex flex-wrap items-baseline justify-center gap-x-2 text-4xl font-bold tracking-tight tabular-nums ${t.heroValue}`}
      >
        <span className="min-w-0 break-words">{value}</span>
        {unit ? (
          <span className="text-base font-normal text-charcoal-400 dark:text-charcoal-500">{unit}</span>
        ) : null}
      </div>
      <div
        className={`mt-2 min-h-[1.25rem] truncate text-sm font-medium ${
          footerAlwaysVisible
            ? 'text-camel-600 dark:text-camel-500'
            : 'opacity-0 transition-opacity group-hover:opacity-100'
        }`}
      >
        {footer ?? (footerAlwaysVisible ? '\u00a0' : null)}
      </div>
    </Comp>
  )
}

export function DisciplineStatCell({
  theme,
  label,
  value,
  as: Comp = 'div',
  ...rest
}: {
  theme: DisciplineTheme
  label: string
  value: ReactNode
  as?: 'div' | 'a'
} & Record<string, unknown>) {
  const t = THEME[theme]
  return (
    <Comp
      className={`group min-h-[5.5rem] rounded-xl border p-4 text-center transition-colors ${t.cellBorder} ${t.cellBg} ${
        Comp === 'a' ? 'hover:brightness-[0.98] dark:hover:bg-charcoal-600' : ''
      }`}
      {...rest}
    >
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
        {label}
      </div>
      <div className="text-2xl font-bold tabular-nums text-charcoal-800 dark:text-charcoal-100">
        {value}
      </div>
    </Comp>
  )
}

export function DisciplineFooterRow({ children }: { children?: ReactNode }) {
  return (
    <div className="mt-auto flex h-[2.75rem] max-h-[4.5rem] w-full min-w-0 shrink-0 items-center justify-center overflow-hidden py-1">
      {children ?? null}
    </div>
  )
}

export function DisciplineHistoryCard({
  theme,
  participations,
  children,
}: {
  theme: DisciplineTheme
  /** Total starts / shows — shown at top as «Участий N». */
  participations?: number
  children: ReactNode
}) {
  const t = THEME[theme]
  return (
    <div className={`rounded-xl border bg-white p-5 dark:bg-charcoal-800 md:p-6 ${t.cardBorder}`}>
      {participations != null && participations > 0 ? (
        <div className="mb-3 flex items-baseline justify-between gap-2 border-b border-old-money-100 pb-2 dark:border-charcoal-700">
          <span className="text-xs font-semibold uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
            Участий
          </span>
          <span className="text-sm font-bold tabular-nums text-charcoal-800 dark:text-charcoal-100">
            {participations}
          </span>
        </div>
      ) : null}
      {children}
    </div>
  )
}
