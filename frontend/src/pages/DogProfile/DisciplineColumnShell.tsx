import { createContext, useContext, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Trophy, Zap, Award, ArrowUpRight } from 'lucide-react'
import type { DisciplineTabId } from './types'
import {
  formatCompetitionsCount,
  formatRunsCount,
} from './historyFormatters'
import { formatShowsCount } from './showsColumnUtils'

export interface DisciplineMobileNav {
  prevTab?: { id: DisciplineTabId; label: string; count?: number } | null
  nextTab?: { id: DisciplineTabId; label: string; count?: number } | null
  onNavigateTab?: (id: DisciplineTabId) => void
}

export const DisciplineMobileNavContext = createContext<DisciplineMobileNav | null>(null)

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
    cardBorder: 'border-forest-200',
    heroBorder: 'border-forest-200',
    heroBg: 'bg-forest-50/80',
    heroValue: 'text-forest-700',
    cellBorder: 'border-forest-200',
    cellBg: 'bg-forest-50/80',
  },
  'warm-blue': {
    cardBorder: 'border-warm-blue-200',
    heroBorder: 'border-warm-blue-200',
    heroBg: 'bg-warm-blue-50/80',
    heroValue: 'text-warm-blue-800',
    cellBorder: 'border-warm-blue-200',
    cellBg: 'bg-warm-blue-50/80',
  },
  camel: {
    cardBorder: 'border-camel-200',
    heroBorder: 'border-camel-200',
    heroBg: 'bg-camel-100/80',
    heroValue: 'text-camel-700',
    cellBorder: 'border-camel-200',
    cellBg: 'bg-camel-100/80',
  },
}

const THEME_ICON: Record<DisciplineTheme, typeof Trophy> = {
  forest: Trophy,
  'warm-blue': Zap,
  camel: Award,
}

export function disciplineTheme(theme: DisciplineTheme) {
  return THEME[theme]
}

/** Общая оболочка колонки: равная ширина и корректное выравнивание по высоте. */
export function DisciplineColumnShell({ children }: { children: ReactNode }) {
  return <div className="flex h-full min-w-0 flex-col gap-3.5">{children}</div>
}

export function DisciplineStatsCard({
  theme,
  title,
  rankBadge,
  rankingUrl,
  children,
}: {
  theme: DisciplineTheme
  title: string
  rankBadge?: ReactNode
  rankingUrl?: string
  children: ReactNode
}) {
  const t = THEME[theme]
  const Icon = THEME_ICON[theme]
  const nav = useContext(DisciplineMobileNavContext)
  const prevTab = nav?.prevTab
  const nextTab = nav?.nextTab
  const onNavigateTab = nav?.onNavigateTab

  return (
    <div
      className={`relative flex shrink-0 flex-col overflow-hidden rounded-xl border bg-white mb-7 lg:mb-0 ${t.cardBorder}`}
    >
      {/* Фирменная кремовая шапка-плашка Old Money (как в хабе породы и Донино) */}
      <div className="donino-column-plaque relative flex h-10 min-h-10 shrink-0 items-center justify-between gap-1.5 border-b border-[rgba(195,168,128,0.55)] bg-cream-100/90 px-3.5">
        {prevTab && (
          <button
            type="button"
            onClick={() => onNavigateTab?.(prevTab.id)}
            className="lg:hidden absolute left-0 top-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-1 bg-[#fbf7f0]/95 text-camel-950 font-bold text-[11px] py-1 pl-2.5 pr-2.5 rounded-r-full border-y border-r border-camel-400/60 shadow-xs backdrop-blur-md transition-all hover:bg-camel-100/90 active:scale-95 cursor-pointer touch-manipulation select-none"
            title={`Перейти: ${prevTab.label}`}
            aria-label={`Перейти: ${prevTab.label}`}
          >
            <ChevronLeft className="w-3.5 h-3.5 text-camel-800 shrink-0" aria-hidden />
            <span className="tracking-tight">{prevTab.label}</span>
          </button>
        )}

        {/* Мобильный заголовок с безопасным отступом от боковых язычков */}
        <div
          className={`lg:hidden flex min-w-0 flex-1 items-center justify-center text-center leading-tight ${
            prevTab || nextTab ? 'px-16 sm:px-20' : 'px-2'
          }`}
        >
          {rankingUrl ? (
            <Link
              to={rankingUrl}
              className="group inline-flex items-center gap-1.5 max-w-full transition-colors hover:text-camel-950"
              title={`Открыть рейтинг: ${title}`}
            >
              <Icon className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
              <span className="text-xs font-bold uppercase tracking-wider text-camel-800 group-hover:underline truncate">
                {title}
              </span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 max-w-full">
              <Icon className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
              <span className="text-xs font-bold uppercase tracking-wider text-camel-800 truncate">
                {title}
              </span>
            </span>
          )}
        </div>

        {/* Десктопный заголовок плашки: иконка + название слева, ссылка на рейтинг справа */}
        <div className="hidden lg:flex min-w-0 flex-1 items-center justify-between gap-2">
          <h2 className="inline-flex items-center gap-1.5 min-w-0 text-xs font-bold uppercase tracking-wider text-camel-800 truncate">
            <Icon className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
            <span className="truncate">{title}</span>
          </h2>
          {rankBadge ?? (rankingUrl ? (
            <Link
              to={rankingUrl}
              className="inline-flex items-center gap-0.5 text-xs font-semibold text-camel-800 hover:text-camel-950 transition-colors shrink-0"
              title={`Открыть рейтинг: ${title}`}
            >
              <span>Рейтинг</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-camel-700" aria-hidden />
            </Link>
          ) : null)}
        </div>

        {nextTab && (
          <button
            type="button"
            onClick={() => onNavigateTab?.(nextTab.id)}
            className="lg:hidden absolute right-0 top-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-1 bg-[#fbf7f0]/95 text-camel-950 font-bold text-[11px] py-1 pl-2.5 pr-2.5 rounded-l-full border-y border-l border-camel-400/60 shadow-xs backdrop-blur-md transition-all hover:bg-camel-100/90 active:scale-95 cursor-pointer touch-manipulation select-none"
            title={`Перейти: ${nextTab.label}`}
            aria-label={`Перейти: ${nextTab.label}`}
          >
            <span className="tracking-tight">{nextTab.label}</span>
            <ChevronRight className="w-3.5 h-3.5 text-camel-800 shrink-0" aria-hidden />
          </button>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}

function historyCountLabel(theme: DisciplineTheme, count: number): string {
  if (theme === 'forest') return formatCompetitionsCount(count)
  if (theme === 'warm-blue') return formatRunsCount(count)
  return formatShowsCount(count)
}

export function DisciplineHistoryCard({
  theme,
  participations,
  label,
  children,
}: {
  theme: DisciplineTheme
  participations?: number
  label?: string
  children: ReactNode
}) {
  const t = THEME[theme]
  const Icon = THEME_ICON[theme]
  const displayLabel =
    label ?? (theme === 'forest' ? 'Состязания' : theme === 'warm-blue' ? 'Забеги' : 'Выставки')

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border bg-white lg:flex-1 lg:min-h-0 ${t.cardBorder}`}
    >
      {participations != null && participations > 0 ? (
        <div className="donino-column-plaque relative flex h-10 min-h-10 shrink-0 items-center justify-between gap-2 border-b border-[rgba(195,168,128,0.55)] bg-cream-100/90 px-3.5">
          <div className="inline-flex items-center gap-1.5 min-w-0 truncate">
            <Icon className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
            <span className="text-xs font-bold uppercase tracking-wider text-camel-800 truncate">
              {displayLabel}
            </span>
          </div>
          <span className="text-xs font-semibold text-old-money-600 tabular-nums shrink-0">
            {historyCountLabel(theme, participations)}
          </span>
        </div>
      ) : null}
      <div className="flex flex-1 flex-col justify-between px-3.5 pb-2.5 pt-1">{children}</div>
    </div>
  )
}
