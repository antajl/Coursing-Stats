import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { HeroStats, HeroShowStats } from './Hero'

interface HomeStatsPillsProps {
  stats: HeroStats | null
  showStats: HeroShowStats | null
  loading?: boolean
}

function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)} млн.`
  }
  if (value >= 10000) {
    return `${(value / 1000).toFixed(0)} тыс.`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} тыс.`
  }
  return value.toLocaleString('ru-RU')
}

export default function HomeStatsPills({ stats, showStats, loading }: HomeStatsPillsProps) {
  if (loading || (!stats && !showStats)) {
    return (
      <div className="flex flex-col gap-1.5 3xl:gap-2 w-full max-w-full pointer-events-auto select-none" aria-busy="true" aria-label="Загрузка статистики">
        {/* Спорт скелетон */}
        <div className="bg-gradient-to-br from-white/95 to-cream-50/95 backdrop-blur-md rounded-xl border border-camel-200/70 shadow-md p-2.5 3xl:p-3 animate-pulse">
          <div className="flex items-center justify-between pb-1 mb-1 3xl:pb-1.5 3xl:mb-1.5 border-b border-camel-200/50">
            <div className="h-3 w-16 bg-camel-200/60 rounded" />
            <div className="h-2.5 w-20 bg-charcoal-200/50 rounded" />
          </div>
          <div className="grid grid-cols-3 text-center divide-x divide-camel-200/50">
            <div className="px-1 flex flex-col items-center gap-1 py-0.5">
              <div className="h-4 w-8 bg-charcoal-300/40 rounded" />
              <div className="h-2 w-12 bg-charcoal-200/40 rounded" />
            </div>
            <div className="px-1 flex flex-col items-center gap-1 py-0.5">
              <div className="h-4 w-10 bg-charcoal-300/40 rounded" />
              <div className="h-2 w-14 bg-charcoal-200/40 rounded" />
            </div>
            <div className="px-1 flex flex-col items-center gap-1 py-0.5">
              <div className="h-4 w-8 bg-charcoal-300/40 rounded" />
              <div className="h-2 w-10 bg-charcoal-200/40 rounded" />
            </div>
          </div>
        </div>

        {/* Выставки скелетон */}
        <div className="bg-gradient-to-br from-white/95 to-cream-50/95 backdrop-blur-md rounded-xl border border-camel-200/70 shadow-md p-2.5 3xl:p-3 animate-pulse">
          <div className="flex items-center justify-between pb-1 mb-1 3xl:pb-1.5 3xl:mb-1.5 border-b border-camel-200/50">
            <div className="h-3 w-24 bg-camel-200/60 rounded" />
            <div className="h-2.5 w-20 bg-charcoal-200/50 rounded" />
          </div>
          <div className="grid grid-cols-3 text-center divide-x divide-camel-200/50">
            <div className="px-1 flex flex-col items-center gap-1 py-0.5">
              <div className="h-4 w-10 bg-charcoal-300/40 rounded" />
              <div className="h-2 w-12 bg-charcoal-200/40 rounded" />
            </div>
            <div className="px-1 flex flex-col items-center gap-1 py-0.5">
              <div className="h-4 w-12 bg-charcoal-300/40 rounded" />
              <div className="h-2 w-12 bg-charcoal-200/40 rounded" />
            </div>
            <div className="px-1 flex flex-col items-center gap-1 py-0.5">
              <div className="h-4 w-10 bg-charcoal-300/40 rounded" />
              <div className="h-2 w-10 bg-charcoal-200/40 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5 3xl:gap-2 w-full max-w-full pointer-events-auto select-none">
      {/* Спорт */}
      {stats && (
        <Link
          to="/competitions"
          className="group block bg-gradient-to-br from-white/95 to-cream-50/95 backdrop-blur-md rounded-xl border border-camel-200/70 shadow-xs hover:shadow-md active:scale-[0.99] p-2.5 3xl:p-3 transition-all text-inherit no-underline"
          aria-label="Перейти в раздел Спорт: турниры, результаты, собаки"
        >
          <div className="flex items-center justify-between pb-1 mb-1 3xl:pb-1.5 3xl:mb-1.5 border-b border-camel-200/50">
            <span className="text-xs sm:text-[12.5px] 3xl:text-[13px] font-bold uppercase tracking-wider text-camel-800">Спорт</span>
            <span className="text-[10px] 3xl:text-[11px] text-charcoal-600 font-medium flex items-center gap-0.5">
              <span>курсинг & бега</span>
              <ChevronRight className="w-3.5 h-3.5 text-camel-600/70 group-hover:text-camel-800 group-hover:translate-x-0.5 transition-all" aria-hidden />
            </span>
          </div>
          <div className="grid grid-cols-3 text-center divide-x divide-camel-200/50">
            <div className="px-1">
              <div className="text-[13px] sm:text-sm 3xl:text-base font-bold text-charcoal-900 tabular-nums">
                {formatNumber(stats.events)}
              </div>
              <div className="text-[9.5px] 3xl:text-[10.5px] text-charcoal-500 font-medium uppercase tracking-tight">турниров</div>
            </div>
            <div className="px-1">
              <div className="text-[13px] sm:text-sm 3xl:text-base font-bold text-charcoal-900 tabular-nums">
                {formatNumber(stats.results)}
              </div>
              <div className="text-[9.5px] 3xl:text-[10.5px] text-charcoal-500 font-medium uppercase tracking-tight">результатов</div>
            </div>
            <div className="px-1">
              <div className="text-[13px] sm:text-sm 3xl:text-base font-bold text-charcoal-900 tabular-nums">
                {formatNumber(stats.dogs)}
              </div>
              <div className="text-[9.5px] 3xl:text-[10.5px] text-charcoal-500 font-medium uppercase tracking-tight">собак</div>
            </div>
          </div>
        </Link>
      )}

      {/* Выставки */}
      {showStats && (
        <Link
          to="/shows"
          className="group block bg-gradient-to-br from-white/95 to-cream-50/95 backdrop-blur-md rounded-xl border border-camel-200/70 shadow-xs hover:shadow-md active:scale-[0.99] p-2.5 3xl:p-3 transition-all text-inherit no-underline"
          aria-label="Перейти в раздел Выставки: каталоги, ринги, собаки"
        >
          <div className="flex items-center justify-between pb-1 mb-1 3xl:pb-1.5 3xl:mb-1.5 border-b border-camel-200/50">
            <span className="text-xs sm:text-[12.5px] 3xl:text-[13px] font-bold uppercase tracking-wider text-camel-800">Выставки</span>
            <span className="text-[10px] 3xl:text-[11px] text-charcoal-600 font-medium flex items-center gap-0.5">
              <span>каталоги & ринги</span>
              <ChevronRight className="w-3.5 h-3.5 text-camel-600/70 group-hover:text-camel-800 group-hover:translate-x-0.5 transition-all" aria-hidden />
            </span>
          </div>
          <div className="grid grid-cols-3 text-center divide-x divide-camel-200/50">
            <div className="px-1">
              <div className="text-[13px] sm:text-sm 3xl:text-base font-bold text-charcoal-900 tabular-nums">
                {formatNumber(showStats.exhibitions)}
              </div>
              <div className="text-[9.5px] 3xl:text-[10.5px] text-charcoal-500 font-medium uppercase tracking-tight">выставок</div>
            </div>
            <div className="px-1">
              <div className="text-[13px] sm:text-sm 3xl:text-base font-bold text-charcoal-900 tabular-nums">
                {formatNumber(showStats.appearances)}
              </div>
              <div className="text-[9.5px] 3xl:text-[10.5px] text-charcoal-500 font-medium uppercase tracking-tight">записей</div>
            </div>
            <div className="px-1">
              <div className="text-[13px] sm:text-sm 3xl:text-base font-bold text-charcoal-900 tabular-nums">
                {formatNumber(showStats.dogs)}
              </div>
              <div className="text-[9.5px] 3xl:text-[10.5px] text-charcoal-500 font-medium uppercase tracking-tight">собак</div>
            </div>
          </div>
        </Link>
      )}
    </div>
  )
}
