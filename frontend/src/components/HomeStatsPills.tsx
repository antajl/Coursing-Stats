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
    <div className="flex flex-col gap-2 w-full max-w-[320px] pointer-events-auto select-none">
      {/* Спорт */}
      {stats && (
        <div className="bg-gradient-to-br from-white/92 to-cream-50/92 backdrop-blur-md rounded-xl border border-camel-200/60 shadow-md p-2 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-camel-200/50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-camel-800">Спорт</span>
            <span className="text-[10px] text-charcoal-400">курсинг & бега</span>
          </div>
          <div className="grid grid-cols-3 text-center divide-x divide-camel-200/40">
            <div className="px-1">
              <div className="text-xs sm:text-sm font-bold text-charcoal-800 tabular-nums">
                {formatNumber(stats.events)}
              </div>
              <div className="text-[9px] text-charcoal-500 uppercase tracking-tight">турниров</div>
            </div>
            <div className="px-1">
              <div className="text-xs sm:text-sm font-bold text-charcoal-800 tabular-nums">
                {formatNumber(stats.results)}
              </div>
              <div className="text-[9px] text-charcoal-500 uppercase tracking-tight">результатов</div>
            </div>
            <div className="px-1">
              <div className="text-xs sm:text-sm font-bold text-charcoal-800 tabular-nums">
                {formatNumber(stats.dogs)}
              </div>
              <div className="text-[9px] text-charcoal-500 uppercase tracking-tight">собак</div>
            </div>
          </div>
        </div>
      )}

      {/* Выставки РКФ */}
      {showStats && (
        <div className="bg-gradient-to-br from-white/92 to-cream-50/92 backdrop-blur-md rounded-xl border border-camel-200/60 shadow-md p-2 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-camel-200/50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-camel-800">Выставки РКФ</span>
            <span className="text-[10px] text-charcoal-400">каталоги & ринги</span>
          </div>
          <div className="grid grid-cols-3 text-center divide-x divide-camel-200/40">
            <div className="px-1">
              <div className="text-xs sm:text-sm font-bold text-charcoal-800 tabular-nums">
                {formatNumber(showStats.exhibitions)}
              </div>
              <div className="text-[9px] text-charcoal-500 uppercase tracking-tight">выставок</div>
            </div>
            <div className="px-1">
              <div className="text-xs sm:text-sm font-bold text-charcoal-800 tabular-nums">
                {formatNumber(showStats.appearances)}
              </div>
              <div className="text-[9px] text-charcoal-500 uppercase tracking-tight">записей</div>
            </div>
            <div className="px-1">
              <div className="text-xs sm:text-sm font-bold text-charcoal-800 tabular-nums">
                {formatNumber(showStats.dogs)}
              </div>
              <div className="text-[9px] text-charcoal-500 uppercase tracking-tight">собак</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
