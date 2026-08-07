import { formatRecordDate } from '../../lib/recordDates'
import AnimatedMeterBar from '../../components/AnimatedMeterBar'
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
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex h-[24rem] shrink-0 flex-col overflow-hidden rounded-xl border border-warm-blue-200 bg-white p-5 dark:border-warm-blue-700 dark:bg-charcoal-800 md:h-[25rem] md:p-6">
        <h2 className="mb-4 shrink-0 text-lg font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 md:text-xl">
          Замер скорости
        </h2>

        <div className="mb-4 flex h-[7.25rem] shrink-0 flex-col items-center justify-center rounded-lg border border-warm-blue-200 bg-warm-blue-50/80 p-4 text-center dark:border-warm-blue-600 dark:bg-charcoal-700/80">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
            Лучшая скорость
          </div>
          <div className="whitespace-nowrap text-4xl font-bold tracking-tight text-warm-blue-800 dark:text-warm-blue-400">
            {speedStats.bestSpeed}
            <span className="ml-2 text-base font-normal text-charcoal-400 dark:text-charcoal-500">км/ч</span>
          </div>
        </div>

        <div className="mb-4 grid min-h-0 flex-1 grid-cols-2 content-start gap-3">
          <div className="rounded-xl border border-warm-blue-200 bg-warm-blue-50 p-4 text-center dark:border-warm-blue-600 dark:bg-charcoal-700">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
              Средняя
            </div>
            <div className="whitespace-nowrap text-2xl font-bold text-warm-blue-900 dark:text-warm-blue-400">
              {speedStats.avgSpeed.toFixed(1)}
              <span className="ml-1 text-sm font-normal text-charcoal-400 dark:text-charcoal-500">км/ч</span>
            </div>
          </div>
          <div className="rounded-xl border border-warm-blue-200 bg-warm-blue-50 p-4 text-center dark:border-warm-blue-600 dark:bg-charcoal-700">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
              Замеров
            </div>
            <div className="text-2xl font-bold text-warm-blue-900 dark:text-warm-blue-400">
              {speedStats.history.length}
            </div>
          </div>
          <div className="rounded-xl border border-warm-blue-200 bg-warm-blue-50 p-4 text-center dark:border-warm-blue-600 dark:bg-charcoal-700">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
              Рейтинг в породе
            </div>
            <div className="text-2xl font-bold text-charcoal-800 dark:text-charcoal-100">
              {speedStats.breedRank > 0 ? (
                <>
                  #{speedStats.breedRank}
                  <span className="ml-1 text-sm font-normal text-charcoal-400 dark:text-charcoal-500">
                    из {speedStats.breedTotal}
                  </span>
                </>
              ) : (
                '—'
              )}
            </div>
          </div>
          <div
            className="rounded-xl border border-dashed border-warm-blue-200 bg-warm-blue-50/50 opacity-50 dark:border-warm-blue-600 dark:bg-charcoal-700/50"
            aria-hidden
          />
        </div>

        {speedStats.screenshotUrl && (
          <a
            href={speedStats.screenshotUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex shrink-0 items-center gap-2 text-sm font-medium text-warm-blue-700 transition-colors hover:text-warm-blue-800 dark:text-warm-blue-400 dark:hover:text-warm-blue-300"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Скриншот лучшего результата
          </a>
        )}
      </div>

      {speedStats.history.length > 0 && (
        <div className="rounded-xl border border-warm-blue-200 bg-white p-5 dark:border-warm-blue-700 dark:bg-charcoal-800 md:p-6">
          <h3 className="mb-4 text-base font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 md:text-lg">
            История
          </h3>
          <div className="space-y-2">
            {visibleSpeedHistory.map((record, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-24 shrink-0 text-right text-sm text-charcoal-700 dark:text-charcoal-300">
                  {formatRecordDate(record.date)}
                </div>
                <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-cream-200 dark:bg-charcoal-600">
                  <AnimatedMeterBar
                    percent={(Number(record.speed_km_h) / 80) * 100}
                    className="h-full rounded-full bg-gradient-to-r from-warm-blue-400 to-warm-blue-600 transition-[width] duration-500 ease-out"
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
              {showAllSpeedHistory ? 'Свернуть' : `Показать все ${speedStats.history.length} замеров`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
