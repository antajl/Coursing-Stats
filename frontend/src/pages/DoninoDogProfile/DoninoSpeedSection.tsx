import AnimatedMeterBar from '../../components/AnimatedMeterBar'
import { formatRecordDate } from '../../lib/recordDates'

interface DoninoSpeedSectionProps {
  hasSpeedRecords: boolean
  hasCoursingRecords: boolean
  mobileTab: 'speed' | 'coursing'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  speedStats: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uniqueSpeedRecords: any[]
}

export default function DoninoSpeedSection({
  hasSpeedRecords,
  hasCoursingRecords,
  mobileTab,
  speedStats,
  uniqueSpeedRecords,
}: DoninoSpeedSectionProps) {
  if (!hasSpeedRecords) {
    return (
      <div
        className={`min-h-[22rem] md:h-[25rem] shrink-0 flex-col rounded-xl border border-dashed border-warm-blue-200 bg-white p-4 sm:p-5 md:p-6 ${
          mobileTab === 'speed' || !hasCoursingRecords ? 'flex' : 'hidden md:flex'
        }`}
      >
        <h2 className="mb-4 shrink-0 text-lg font-bold tracking-tight text-charcoal-800 md:text-xl">
          Замер скорости
        </h2>
        <div className="mb-4 flex h-[6.5rem] sm:h-[7.25rem] shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-warm-blue-200 bg-warm-blue-50/50 opacity-50">
          <p className="text-sm font-medium text-old-money-500">данных нет</p>
        </div>
        <div className="grid flex-1 grid-cols-2 content-start gap-2.5 sm:gap-3">
          <div className="min-h-[5rem] rounded-xl border border-dashed border-warm-blue-200 bg-warm-blue-50/50 opacity-50" />
          <div className="min-h-[5rem] rounded-xl border border-dashed border-warm-blue-200 bg-warm-blue-50/50 opacity-50" />
          <div className="min-h-[5rem] rounded-xl border border-dashed border-warm-blue-200 bg-warm-blue-50/50 opacity-50" />
          <div className="min-h-[5rem] rounded-xl border border-dashed border-warm-blue-200 bg-warm-blue-50/50 opacity-50" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-w-0 flex-col gap-4 ${
        mobileTab === 'speed' || !hasCoursingRecords ? 'flex' : 'hidden md:flex'
      }`}
    >
      <div className="flex min-h-[22rem] md:h-[25rem] shrink-0 flex-col rounded-xl border border-warm-blue-200 bg-white p-4 sm:p-5 md:p-6">
        <h2 className="mb-3 sm:mb-4 shrink-0 text-lg font-bold tracking-tight text-charcoal-800 md:text-xl">
          Замер скорости
        </h2>

        <div className="mb-3 sm:mb-4 flex h-[6.5rem] sm:h-[7.25rem] shrink-0 flex-col items-center justify-center rounded-xl border border-warm-blue-200 bg-warm-blue-50 p-3 sm:p-4 text-center">
          <div className="mb-1 sm:mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal-500">
            Лучшая скорость
          </div>
          <div className="whitespace-nowrap text-3xl sm:text-4xl font-bold tracking-tight text-warm-blue-800">
            {speedStats?.bestSpeed?.toFixed(1) || '—'}
            <span className="ml-1.5 sm:ml-2 text-sm sm:text-base font-normal text-charcoal-400">
              км/ч
            </span>
          </div>
        </div>

        <div className="mb-2 sm:mb-4 grid min-h-0 flex-1 grid-cols-2 gap-2 sm:gap-3 content-start">
          <div className="rounded-xl border border-warm-blue-200 bg-warm-blue-50 p-2.5 sm:p-4 text-center">
            <div className="mb-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-old-money-500">
              Средняя
            </div>
            <div className="whitespace-nowrap text-xl sm:text-2xl font-bold text-warm-blue-900">
              {speedStats?.avgSpeed?.toFixed(1) || '—'}
              <span className="ml-1 text-xs sm:text-sm font-normal text-charcoal-400">
                км/ч
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-warm-blue-200 bg-warm-blue-50 p-2.5 sm:p-4 text-center">
            <div className="mb-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-old-money-500">
              Замеров
            </div>
            <div className="text-xl sm:text-2xl font-bold text-warm-blue-900">
              {uniqueSpeedRecords.length}
            </div>
          </div>
          <div className="rounded-xl border border-warm-blue-200 bg-warm-blue-50 p-2.5 sm:p-4 text-center">
            <div className="mb-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-old-money-500">
              Рейтинг в породе
            </div>
            <div className="text-xl sm:text-2xl font-bold text-charcoal-800">
              {speedStats?.breedRank > 0 ? (
                <>
                  #{speedStats.breedRank}
                  <span className="ml-1 text-xs sm:text-sm font-normal text-charcoal-400">
                    из {speedStats.breedTotal}
                  </span>
                </>
              ) : (
                '—'
              )}
            </div>
          </div>
          <div
            className="rounded-xl border border-dashed border-warm-blue-200 bg-warm-blue-50/50 opacity-50"
            aria-hidden
          />
        </div>
      </div>

      {uniqueSpeedRecords.length > 0 && (
        <div className="rounded-xl border border-warm-blue-200 bg-white p-4 sm:p-5 md:p-6">
          <h3 className="mb-3 sm:mb-4 text-base font-bold tracking-tight text-charcoal-800 md:text-lg">
            История
          </h3>
          <div className="space-y-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {uniqueSpeedRecords.map((record: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2.5 sm:gap-4">
                <div className="w-20 sm:w-24 shrink-0 text-right text-xs sm:text-sm text-charcoal-700">
                  {formatRecordDate(record.date)}
                </div>
                <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-cream-200">
                  <AnimatedMeterBar
                    percent={(Number(record.speed_km_h) / 80) * 100}
                    className="h-full rounded-full bg-gradient-to-r from-warm-blue-400 to-warm-blue-600 transition-[width] duration-500 ease-out"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-bold text-charcoal-900">
                    {Number(record.speed_km_h).toFixed(1)} км/ч
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
