import type { HeroStats, HeroShowStats } from './Hero'

interface HomeStatsPillsProps {
  stats: HeroStats | null
  showStats: HeroShowStats | null
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

export default function HomeStatsPills({ stats, showStats }: HomeStatsPillsProps) {
  if (!stats && !showStats) return null

  return (
    <div className="flex flex-col gap-1.5 3xl:gap-2 w-full max-w-full pointer-events-auto select-none">
      {/* Спорт */}
      {stats && (
        <div className="bg-gradient-to-br from-white/95 to-cream-50/95 backdrop-blur-md rounded-xl border border-camel-200/70 shadow-md p-2 3xl:p-3 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between pb-1 mb-1 3xl:pb-1.5 3xl:mb-1.5 border-b border-camel-200/50">
            <span className="text-[11px] sm:text-xs 3xl:text-[13px] font-bold uppercase tracking-wider text-camel-800">Спорт</span>
            <span className="text-[9.5px] 3xl:text-[11px] text-charcoal-600 font-medium">курсинг & бега</span>
          </div>
          <div className="grid grid-cols-3 text-center divide-x divide-camel-200/50">
            <div className="px-1">
              <div className="text-[12.5px] sm:text-[13px] 3xl:text-base font-bold text-charcoal-900 tabular-nums">
                {formatNumber(stats.events)}
              </div>
              <div className="text-[9px] 3xl:text-[10.5px] text-charcoal-500 font-medium uppercase tracking-tight">турниров</div>
            </div>
            <div className="px-1">
              <div className="text-[12.5px] sm:text-[13px] 3xl:text-base font-bold text-charcoal-900 tabular-nums">
                {formatNumber(stats.results)}
              </div>
              <div className="text-[9px] 3xl:text-[10.5px] text-charcoal-500 font-medium uppercase tracking-tight">результатов</div>
            </div>
            <div className="px-1">
              <div className="text-[12.5px] sm:text-[13px] 3xl:text-base font-bold text-charcoal-900 tabular-nums">
                {formatNumber(stats.dogs)}
              </div>
              <div className="text-[9px] 3xl:text-[10.5px] text-charcoal-500 font-medium uppercase tracking-tight">собак</div>
            </div>
          </div>
        </div>
      )}

      {/* Выставки РКФ */}
      {showStats && (
        <div className="bg-gradient-to-br from-white/95 to-cream-50/95 backdrop-blur-md rounded-xl border border-camel-200/70 shadow-md p-2 3xl:p-3 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between pb-1 mb-1 3xl:pb-1.5 3xl:mb-1.5 border-b border-camel-200/50">
            <span className="text-[11px] sm:text-xs 3xl:text-[13px] font-bold uppercase tracking-wider text-camel-800">Выставки РКФ</span>
            <span className="text-[9.5px] 3xl:text-[11px] text-charcoal-600 font-medium">каталоги & ринги</span>
          </div>
          <div className="grid grid-cols-3 text-center divide-x divide-camel-200/50">
            <div className="px-1">
              <div className="text-[12.5px] sm:text-[13px] 3xl:text-base font-bold text-charcoal-900 tabular-nums">
                {formatNumber(showStats.exhibitions)}
              </div>
              <div className="text-[9px] 3xl:text-[10.5px] text-charcoal-500 font-medium uppercase tracking-tight">выставок</div>
            </div>
            <div className="px-1">
              <div className="text-[12.5px] sm:text-[13px] 3xl:text-base font-bold text-charcoal-900 tabular-nums">
                {formatNumber(showStats.appearances)}
              </div>
              <div className="text-[9px] 3xl:text-[10.5px] text-charcoal-500 font-medium uppercase tracking-tight">записей</div>
            </div>
            <div className="px-1">
              <div className="text-[12.5px] sm:text-[13px] 3xl:text-base font-bold text-charcoal-900 tabular-nums">
                {formatNumber(showStats.dogs)}
              </div>
              <div className="text-[9px] 3xl:text-[10.5px] text-charcoal-500 font-medium uppercase tracking-tight">собак</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
