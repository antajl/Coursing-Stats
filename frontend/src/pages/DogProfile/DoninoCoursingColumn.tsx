import { formatRecordDate } from '../../lib/recordDates'
import AnimatedMeterBar from '../../components/AnimatedMeterBar'
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
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex h-[24rem] shrink-0 flex-col overflow-hidden rounded-xl border border-forest-200 bg-white p-5 dark:border-forest-700 dark:bg-charcoal-800 md:h-[25rem] md:p-6">
        <h2 className="mb-4 shrink-0 text-lg font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 md:text-xl">
          Бега борзых (350 м)
        </h2>

        <div className="mb-4 flex h-[7.25rem] shrink-0 flex-col items-center justify-center rounded-lg border border-forest-200 bg-forest-50/80 p-4 text-center dark:border-forest-600 dark:bg-charcoal-700/80">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
            Лучшее время
          </div>
          <div className="whitespace-nowrap text-4xl font-bold tracking-tight text-forest-700 dark:text-forest-300">
            {coursingStats.bestTime}
            <span className="ml-2 text-base font-normal text-charcoal-400 dark:text-charcoal-500">сек</span>
          </div>
        </div>

        <div className="mb-4 grid min-h-0 flex-1 grid-cols-2 content-start gap-3">
          <div className="rounded-xl border border-forest-200 bg-forest-50 p-4 text-center dark:border-forest-600 dark:bg-charcoal-700">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
              Среднее
            </div>
            <div className="whitespace-nowrap text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">
              {coursingStats.avgTime.toFixed(2)}
              <span className="ml-1 text-sm font-normal text-charcoal-400 dark:text-charcoal-500">сек</span>
            </div>
          </div>
          <div className="rounded-xl border border-forest-200 bg-forest-50 p-4 text-center dark:border-forest-600 dark:bg-charcoal-700">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
              Забегов
            </div>
            <div className="text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">
              {coursingStats.history.length}
            </div>
          </div>
          <div className="rounded-xl border border-forest-200 bg-forest-50 p-4 text-center dark:border-forest-600 dark:bg-charcoal-700">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
              Рейтинг в породе
            </div>
            <div className="text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">
              {coursingStats.breedRank > 0 ? (
                <>
                  #{coursingStats.breedRank}
                  <span className="ml-1 text-sm font-normal text-charcoal-400 dark:text-charcoal-500">
                    из {coursingStats.breedTotal}
                  </span>
                </>
              ) : (
                '—'
              )}
            </div>
          </div>
          <div
            className="rounded-xl border border-dashed border-forest-200 bg-forest-50/50 opacity-50 dark:border-forest-600 dark:bg-charcoal-700/50"
            aria-hidden
          />
        </div>
      </div>

      {coursingStats.history.length > 0 && (
        <div className="rounded-xl border border-forest-200 bg-white p-5 dark:border-forest-700 dark:bg-charcoal-800 md:p-6">
          <h3 className="mb-4 text-base font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 md:text-lg">
            История
          </h3>
          <div className="space-y-2">
            {visibleCoursingDoninoHistory.map((record, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-24 shrink-0 text-right text-sm text-charcoal-700 dark:text-charcoal-300">
                  {formatRecordDate(record.date)}
                </div>
                <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-cream-200 dark:bg-charcoal-600">
                  <AnimatedMeterBar
                    percent={(30 / Number(record.time_seconds)) * 100}
                    className="h-full rounded-full bg-gradient-to-r from-forest-400 to-forest-600 transition-[width] duration-500 ease-out"
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
