import AnimatedMeterBar from '../../components/AnimatedMeterBar'
import { formatRecordDate } from '../../lib/recordDates'

interface DoninoCoursingSectionProps {
  hasSpeedRecords: boolean
  hasCoursingRecords: boolean
  mobileTab: 'speed' | 'coursing'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coursingStats: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coursingHistory: any[]
}

export default function DoninoCoursingSection({
  hasSpeedRecords,
  hasCoursingRecords,
  mobileTab,
  coursingStats,
  coursingHistory,
}: DoninoCoursingSectionProps) {
  if (!hasCoursingRecords) {
    return (
      <div
        className={`min-w-0 flex-col rounded-2xl border border-old-money-200 bg-white overflow-hidden shadow-xs ${
          mobileTab === 'coursing' || !hasSpeedRecords ? 'flex' : 'hidden md:flex'
        }`}
      >
        <div className="h-10 px-4 bg-cream-100/90 border-b border-old-money-200/80 flex items-center gap-2 shrink-0">
          <span className="h-2 w-2 rounded-full bg-forest-600 shrink-0" aria-hidden />
          <h2 className="text-[13px] font-bold tracking-tight text-charcoal-900">
            Бега борзых (350 м)
          </h2>
        </div>
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm font-medium text-charcoal-500">
          Данных о забегах на 350 м пока нет
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-w-0 flex-col gap-4 ${
        mobileTab === 'coursing' || !hasSpeedRecords ? 'flex' : 'hidden md:flex'
      }`}
    >
      <div className="flex shrink-0 flex-col rounded-2xl border border-old-money-200 bg-white overflow-hidden shadow-xs">
        <div className="h-10 px-4 bg-cream-100/90 border-b border-old-money-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-forest-600 shrink-0" aria-hidden />
            <h2 className="text-[13px] font-bold tracking-tight text-charcoal-900">
              Бега борзых (350 м)
            </h2>
          </div>
          <span className="text-[11px] font-medium text-charcoal-600 tabular-nums">
            {coursingHistory.length} {coursingHistory.length === 1 ? 'забег' : coursingHistory.length < 5 ? 'забега' : 'забегов'}
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <div className="mb-3 sm:mb-4 flex h-[6.5rem] sm:h-[7.25rem] flex-col items-center justify-center rounded-xl border border-forest-200/80 bg-forest-50/70 p-3 sm:p-4 text-center">
            <div className="mb-1 sm:mb-1.5 text-xs font-semibold text-charcoal-600">
              Лучшее время
            </div>
            <div className="whitespace-nowrap text-3xl sm:text-4xl font-bold tracking-tight tabular-nums text-forest-800">
              {coursingStats?.bestTime?.toFixed(2) || '—'}
              <span className="ml-1.5 sm:ml-2 text-sm sm:text-base font-normal text-charcoal-500">
                сек
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-old-money-200/80 rounded-xl border border-old-money-200/80 bg-cream-50/60">
            <div className="p-2.5 sm:p-3.5 text-center">
              <div className="mb-1 text-[11px] font-medium text-charcoal-600">
                Среднее
              </div>
              <div className="whitespace-nowrap text-lg sm:text-xl font-bold tabular-nums text-charcoal-900">
                {coursingStats?.avgTime?.toFixed(2) || '—'}
                <span className="ml-1 text-xs font-normal text-charcoal-500">
                  сек
                </span>
              </div>
            </div>
            <div className="p-2.5 sm:p-3.5 text-center">
              <div className="mb-1 text-[11px] font-medium text-charcoal-600">
                Забегов
              </div>
              <div className="text-lg sm:text-xl font-bold tabular-nums text-charcoal-900">
                {coursingHistory.length}
              </div>
            </div>
            <div className="p-2.5 sm:p-3.5 text-center">
              <div className="mb-1 text-[11px] font-medium text-charcoal-600">
                В породе
              </div>
              <div className="text-lg sm:text-xl font-bold tabular-nums text-charcoal-900">
                {coursingStats?.breedRank > 0 ? (
                  <>
                    #{coursingStats.breedRank}
                    <span className="ml-1 text-xs font-normal text-charcoal-500">
                      из {coursingStats.breedTotal}
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

      {coursingHistory.length > 0 && (
        <div className="rounded-2xl border border-old-money-200 bg-white overflow-hidden shadow-xs">
          <div className="h-10 px-4 bg-cream-100/90 border-b border-old-money-200/80 flex items-center">
            <h3 className="text-[13px] font-bold tracking-tight text-charcoal-900">
              История забегов
            </h3>
          </div>
          <div className="p-4 sm:p-5 space-y-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {coursingHistory.map((record: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2.5 sm:gap-4">
                <div className="w-20 sm:w-24 shrink-0 text-right text-xs sm:text-sm tabular-nums text-charcoal-700">
                  {formatRecordDate(record.date)}
                </div>
                <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-cream-100 border border-old-money-200/60">
                  <AnimatedMeterBar
                    percent={(30 / Number(record.time_seconds)) * 100}
                    className="h-full rounded-full bg-forest-200/90 transition-[width] duration-500 ease-out"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-bold tabular-nums text-charcoal-900">
                    {Number(record.time_seconds).toFixed(2)} сек
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
