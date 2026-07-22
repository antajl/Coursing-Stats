import { formatRecordDate } from '../../lib/recordDates'
import { HISTORY_DEFAULT, type SpeedStats } from './dogProfileStats'

type DoninoSpeedColumnProps = {
  speedStats: SpeedStats
  visibleSpeedHistory: SpeedStats['history']
  showAllSpeedHistory: boolean
  onToggleShowAll: () => void
}

export function DoninoSpeedColumn({
  speedStats,
  visibleSpeedHistory,
  showAllSpeedHistory,
  onToggleShowAll,
}: DoninoSpeedColumnProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-warm-blue-200 dark:border-warm-blue-700 bg-white dark:bg-charcoal-800 p-5 md:p-6">
        <h2 className="mb-4 text-lg font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 md:text-xl">Замер скорости</h2>

        <div className="mb-4 rounded-lg border border-warm-blue-200 dark:border-warm-blue-600 bg-warm-blue-50/80 dark:bg-charcoal-700/80 p-4 text-center">
          <div className="text-xs font-semibold text-charcoal-500 dark:text-charcoal-400 mb-2 uppercase tracking-wide">Лучшая скорость</div>
          <div className="whitespace-nowrap text-4xl font-bold tracking-tight text-warm-blue-800 dark:text-warm-blue-400">
            {speedStats.bestSpeed}
            <span className="text-base font-normal text-charcoal-400 dark:text-charcoal-500 ml-2">км/ч</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl bg-warm-blue-50 dark:bg-charcoal-700 p-4 text-center border border-warm-blue-200 dark:border-warm-blue-600">
            <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Средняя</div>
            <div className="whitespace-nowrap text-2xl font-bold text-warm-blue-900 dark:text-warm-blue-400">
              {speedStats.avgSpeed.toFixed(1)}
              <span className="text-sm font-normal text-charcoal-400 dark:text-charcoal-500 ml-1">км/ч</span>
            </div>
          </div>
          <div className="rounded-xl bg-warm-blue-50 dark:bg-charcoal-700 p-4 text-center border border-warm-blue-200 dark:border-warm-blue-600">
            <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Замеров</div>
            <div className="text-2xl font-bold text-warm-blue-900 dark:text-warm-blue-400">{speedStats.history.length}</div>
          </div>
          {speedStats.breedRank > 0 && (
            <div className="col-span-2 rounded-xl bg-warm-blue-50 dark:bg-charcoal-700 p-4 text-center border border-warm-blue-200 dark:border-warm-blue-600">
              <div className="text-xs font-semibold text-old-money-500 dark:text-old-money-400 mb-1 uppercase tracking-wide">Рейтинг в породе</div>
              <div className="text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">
                #{speedStats.breedRank}
                <span className="text-sm font-normal text-charcoal-400 dark:text-charcoal-500 ml-1">из {speedStats.breedTotal}</span>
              </div>
            </div>
          )}
        </div>

        {speedStats.screenshotUrl && (
          <a
            href={speedStats.screenshotUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-warm-blue-700 dark:text-warm-blue-400 hover:text-warm-blue-800 dark:hover:text-warm-blue-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Скриншот лучшего результата
          </a>
        )}
      </div>

      {speedStats.history.length > 0 && (
        <div className="rounded-xl border border-warm-blue-200 dark:border-warm-blue-700 bg-white dark:bg-charcoal-800 p-5 md:p-6">
          <h3 className="text-base md:text-lg font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 mb-4">История</h3>
          <div className="space-y-2">
            {visibleSpeedHistory.map((record, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-24 text-sm text-charcoal-700 dark:text-charcoal-300 text-right shrink-0">{formatRecordDate(record.date)}</div>
                <div className="flex-1 bg-cream-200 dark:bg-charcoal-600 rounded-full h-6 overflow-hidden relative">
                  <div
                    className="bg-gradient-to-r from-warm-blue-400 to-warm-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(Number(record.speed_km_h) / 80) * 100}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-charcoal-900 dark:text-charcoal-100">
                    {Number(record.speed_km_h)} км/ч
                  </div>
                </div>
              </div>
            ))}
          </div>
          {speedStats.history.length > HISTORY_DEFAULT && (
            <button
              type="button"
              onClick={onToggleShowAll}
              className="mt-3 text-sm font-semibold text-camel-700 dark:text-camel-400"
            >
              {showAllSpeedHistory
                ? 'Свернуть'
                : `Показать все ${speedStats.history.length} замеров`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
