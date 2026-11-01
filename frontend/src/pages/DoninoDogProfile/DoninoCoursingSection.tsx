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
        className={`min-h-[22rem] md:h-[25rem] shrink-0 flex-col rounded-xl border border-dashed border-forest-200 bg-white p-4 sm:p-5 md:p-6 ${
          mobileTab === 'coursing' || !hasSpeedRecords ? 'flex' : 'hidden md:flex'
        }`}
      >
        <h2 className="mb-4 shrink-0 text-lg font-bold tracking-tight text-charcoal-800 md:text-xl">
          Бега борзых (350 м)
        </h2>
        <div className="mb-4 flex h-[6.5rem] sm:h-[7.25rem] shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-forest-200 bg-forest-50/50 opacity-50">
          <p className="text-sm font-medium text-old-money-500">данных нет</p>
        </div>
        <div className="grid flex-1 grid-cols-2 content-start gap-2.5 sm:gap-3">
          <div className="min-h-[5rem] rounded-xl border border-dashed border-forest-200 bg-forest-50/50 opacity-50" />
          <div className="min-h-[5rem] rounded-xl border border-dashed border-forest-200 bg-forest-50/50 opacity-50" />
          <div className="min-h-[5rem] rounded-xl border border-dashed border-forest-200 bg-forest-50/50 opacity-50" />
          <div className="min-h-[5rem] rounded-xl border border-dashed border-forest-200 bg-forest-50/50 opacity-50" />
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
      <div className="flex min-h-[22rem] md:h-[25rem] shrink-0 flex-col rounded-xl border border-forest-200 bg-white p-4 sm:p-5 md:p-6">
        <h2 className="mb-3 sm:mb-4 shrink-0 text-lg font-bold tracking-tight text-charcoal-800 md:text-xl">
          Бега борзых (350 м)
        </h2>

        <div className="mb-3 sm:mb-4 flex h-[6.5rem] sm:h-[7.25rem] shrink-0 flex-col items-center justify-center rounded-xl border border-forest-200 bg-forest-50 p-3 sm:p-4 text-center">
          <div className="mb-1 sm:mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal-500">
            Лучшее время
          </div>
          <div className="whitespace-nowrap text-3xl sm:text-4xl font-bold tracking-tight text-forest-700">
            {coursingStats?.bestTime?.toFixed(2) || '—'}
            <span className="ml-1.5 sm:ml-2 text-sm sm:text-base font-normal text-charcoal-400">
              сек
            </span>
          </div>
        </div>

        <div className="mb-2 sm:mb-4 grid min-h-0 flex-1 grid-cols-2 gap-2 sm:gap-3 content-start">
          <div className="rounded-xl border border-forest-200 bg-forest-50 p-2.5 sm:p-4 text-center">
            <div className="mb-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-old-money-500">
              Среднее
            </div>
            <div className="whitespace-nowrap text-xl sm:text-2xl font-bold text-charcoal-800">
              {coursingStats?.avgTime?.toFixed(2) || '—'}
              <span className="ml-1 text-xs sm:text-sm font-normal text-charcoal-400">
                сек
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-forest-200 bg-forest-50 p-2.5 sm:p-4 text-center">
            <div className="mb-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-old-money-500">
              Забегов
            </div>
            <div className="text-xl sm:text-2xl font-bold text-charcoal-800">
              {coursingHistory.length}
            </div>
          </div>
          <div className="rounded-xl border border-forest-200 bg-forest-50 p-2.5 sm:p-4 text-center">
            <div className="mb-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-old-money-500">
              Рейтинг в породе
            </div>
            <div className="text-xl sm:text-2xl font-bold text-charcoal-800">
              {coursingStats?.breedRank > 0 ? (
                <>
                  #{coursingStats.breedRank}
                  <span className="ml-1 text-xs sm:text-sm font-normal text-charcoal-400">
                    из {coursingStats.breedTotal}
                  </span>
                </>
              ) : (
                '—'
              )}
            </div>
          </div>
          <div
            className="rounded-xl border border-dashed border-forest-200 bg-forest-50/50 opacity-50"
            aria-hidden
          />
        </div>
      </div>

      {coursingHistory.length > 0 && (
        <div className="rounded-xl border border-forest-200 bg-white p-4 sm:p-5 md:p-6">
          <h3 className="mb-3 sm:mb-4 text-base font-bold tracking-tight text-charcoal-800 md:text-lg">
            История
          </h3>
          <div className="space-y-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {coursingHistory.map((record: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2.5 sm:gap-4">
                <div className="w-20 sm:w-24 shrink-0 text-right text-xs sm:text-sm text-charcoal-700">
                  {formatRecordDate(record.date)}
                </div>
                <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-cream-200">
                  <AnimatedMeterBar
                    percent={(30 / Number(record.time_seconds)) * 100}
                    className="h-full rounded-full bg-gradient-to-r from-forest-400 to-forest-600 transition-[width] duration-500 ease-out"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-bold text-charcoal-900">
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
