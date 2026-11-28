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
        className={`min-w-0 flex-col rounded-2xl border border-old-money-200 bg-white overflow-hidden shadow-xs ${
          mobileTab === 'speed' || !hasCoursingRecords ? 'flex' : 'hidden md:flex'
        }`}
      >
        <div className="h-10 px-4 bg-cream-100/90 border-b border-old-money-200/80 flex items-center gap-2 shrink-0">
          <span className="h-2 w-2 rounded-full bg-warm-blue-700 shrink-0" aria-hidden />
          <h2 className="text-[13px] font-bold tracking-tight text-charcoal-900">
            Замер скорости
          </h2>
        </div>
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm font-medium text-charcoal-500">
          Данных замера скорости пока нет
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
      <div className="flex shrink-0 flex-col rounded-2xl border border-old-money-200 bg-white overflow-hidden shadow-xs">
        <div className="h-10 px-4 bg-cream-100/90 border-b border-old-money-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-warm-blue-700 shrink-0" aria-hidden />
            <h2 className="text-[13px] font-bold tracking-tight text-charcoal-900">
              Замер скорости
            </h2>
          </div>
          <span className="text-[11px] font-medium text-charcoal-600 tabular-nums">
            {uniqueSpeedRecords.length} {uniqueSpeedRecords.length === 1 ? 'замер' : uniqueSpeedRecords.length < 5 ? 'замера' : 'замеров'}
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <div className="mb-3 sm:mb-4 flex h-[6.5rem] sm:h-[7.25rem] flex-col items-center justify-center rounded-xl border border-warm-blue-200/80 bg-warm-blue-50/70 p-3 sm:p-4 text-center">
            <div className="mb-1 sm:mb-1.5 text-xs font-semibold text-charcoal-600">
              Лучшая скорость
            </div>
            <div className="whitespace-nowrap text-3xl sm:text-4xl font-bold tracking-tight tabular-nums text-warm-blue-800">
              {speedStats?.bestSpeed?.toFixed(1) || '—'}
              <span className="ml-1.5 sm:ml-2 text-sm sm:text-base font-normal text-charcoal-500">
                км/ч
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-old-money-200/80 rounded-xl border border-old-money-200/80 bg-cream-50/60">
            <div className="p-2.5 sm:p-3.5 text-center">
              <div className="mb-1 text-[11px] font-medium text-charcoal-600">
                Средняя
              </div>
              <div className="whitespace-nowrap text-lg sm:text-xl font-bold tabular-nums text-charcoal-900">
                {speedStats?.avgSpeed?.toFixed(1) || '—'}
                <span className="ml-1 text-xs font-normal text-charcoal-500">
                  км/ч
                </span>
              </div>
            </div>
            <div className="p-2.5 sm:p-3.5 text-center">
              <div className="mb-1 text-[11px] font-medium text-charcoal-600">
                Замеров
              </div>
              <div className="text-lg sm:text-xl font-bold tabular-nums text-charcoal-900">
                {uniqueSpeedRecords.length}
              </div>
            </div>
            <div className="p-2.5 sm:p-3.5 text-center">
              <div className="mb-1 text-[11px] font-medium text-charcoal-600">
                В породе
              </div>
              <div className="text-lg sm:text-xl font-bold tabular-nums text-charcoal-900">
                {speedStats?.breedRank > 0 ? (
                  <>
                    #{speedStats.breedRank}
                    <span className="ml-1 text-xs font-normal text-charcoal-500">
                      из {speedStats.breedTotal}
                    </span>
                  </>
                ) : (
                  '—'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {uniqueSpeedRecords.length > 0 && (
        <div className="rounded-2xl border border-old-money-200 bg-white overflow-hidden shadow-xs">
          <div className="h-10 px-4 bg-cream-100/90 border-b border-old-money-200/80 flex items-center">
            <h3 className="text-[13px] font-bold tracking-tight text-charcoal-900">
              История замеров
            </h3>
          </div>
          <div className="p-4 sm:p-5 space-y-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {uniqueSpeedRecords.map((record: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2.5 sm:gap-4">
                <div className="w-20 sm:w-24 shrink-0 text-right text-xs sm:text-sm tabular-nums text-charcoal-700">
                  {formatRecordDate(record.date)}
                </div>
                <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-cream-100 border border-old-money-200/60">
                  <AnimatedMeterBar
                    percent={(Number(record.speed_km_h) / 80) * 100}
                    className="h-full rounded-full bg-warm-blue-200/90 transition-[width] duration-500 ease-out"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-bold tabular-nums text-charcoal-900">
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
