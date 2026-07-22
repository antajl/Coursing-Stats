import { formatRecordDate } from '../../lib/recordDates'
import { HISTORY_DEFAULT, type CoursingDoninoStats } from './dogProfileStats'

type DoninoCoursingColumnProps = {
  coursingStats: CoursingDoninoStats
  visibleCoursingDoninoHistory: CoursingDoninoStats['history']
  showAllCoursingDoninoHistory: boolean
  onToggleShowAll: () => void
}

export function DoninoCoursingColumn({
  coursingStats,
  visibleCoursingDoninoHistory,
  showAllCoursingDoninoHistory,
  onToggleShowAll,
}: DoninoCoursingColumnProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-forest-200 dark:border-forest-700 bg-white dark:bg-charcoal-800 p-5 md:p-6">
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 mb-4">Бега борзых (350 м)</h2>

        <div className="mb-4 rounded-lg border border-forest-200 dark:border-forest-600 bg-forest-50/80 dark:bg-charcoal-700/80 p-4 text-center">
          <div className="text-xs font-semibold text-charcoal-500 dark:text-charcoal-400 mb-2 uppercase tracking-wide">Лучшее время</div>
          <div className="whitespace-nowrap text-4xl font-bold tracking-tight text-forest-700 dark:text-forest-300">
            {coursingStats.bestTime}
            <span className="text-base font-normal text-charcoal-400 dark:text-charcoal-500 ml-2">сек</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-forest-50 dark:bg-charcoal-700 rounded-xl p-4 text-center border border-forest-200 dark:border-forest-600">
            <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Среднее</div>
            <div className="whitespace-nowrap text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">
              {coursingStats.avgTime.toFixed(2)}
              <span className="text-sm font-normal text-charcoal-400 dark:text-charcoal-500 ml-1">сек</span>
            </div>
          </div>
          <div className="bg-forest-50 dark:bg-charcoal-700 rounded-xl p-4 text-center border border-forest-200 dark:border-forest-600">
            <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Забегов</div>
            <div className="text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">{coursingStats.history.length}</div>
          </div>
          {coursingStats.breedRank > 0 && (
            <div className="col-span-2 bg-forest-50 dark:bg-charcoal-700 rounded-xl p-4 text-center border border-forest-200 dark:border-forest-600">
              <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Рейтинг в породе</div>
              <div className="text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">
                #{coursingStats.breedRank}
                <span className="text-sm font-normal text-charcoal-400 dark:text-charcoal-500 ml-1">из {coursingStats.breedTotal}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {coursingStats.history.length > 0 && (
        <div className="rounded-xl border border-forest-200 dark:border-forest-700 bg-white dark:bg-charcoal-800 p-5 md:p-6">
          <h3 className="text-base md:text-lg font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 mb-4">История</h3>
          <div className="space-y-2">
            {visibleCoursingDoninoHistory.map((record, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-24 text-sm text-charcoal-700 dark:text-charcoal-300 text-right shrink-0">{formatRecordDate(record.date)}</div>
                <div className="flex-1 bg-cream-200 dark:bg-charcoal-600 rounded-full h-6 overflow-hidden relative">
                  <div
                    className="bg-gradient-to-r from-forest-400 to-forest-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(30 / Number(record.time_seconds)) * 100}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-charcoal-900 dark:text-charcoal-100">
                    {Number(record.time_seconds)} сек
                  </div>
                </div>
              </div>
            ))}
          </div>
          {coursingStats.history.length > HISTORY_DEFAULT && (
            <button
              type="button"
              onClick={onToggleShowAll}
              className="mt-3 text-sm font-semibold text-camel-700 dark:text-camel-400"
            >
              {showAllCoursingDoninoHistory
                ? 'Свернуть'
                : `Показать все ${coursingStats.history.length} забегов`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
