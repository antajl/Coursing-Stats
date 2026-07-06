import { Link } from 'react-router-dom'
import CoursingHistorySparkline from '../../components/CoursingHistorySparkline'
import DogSexIcon from '../../components/DogSexIcon'
import SpeedStatusBadge from '../../components/SpeedStatusBadge'
import { formatRecordDate } from '../../lib/recordDates'
import { Icons } from '../../lib/icons'

interface CoursingRecordCardProps {
  record: {
    id: string | number
    name: string
    breed: string
    sex?: string
    time_seconds: number
    date: string
    history?: unknown[]
  }
}

export default function CoursingRecordCard({ record }: CoursingRecordCardProps) {
  const ChevronRight = Icons.chevronRight
  const hasHistoryChart = Array.isArray(record.history) && record.history.length > 0

  const timeBlock = (
    <div className="relative shrink-0">
      <span className="inline-block rounded-full bg-camel-600 px-3 py-1.5 text-sm font-bold text-white shadow-sm">
        {record.time_seconds} сек
      </span>
      {hasHistoryChart && <SpeedStatusBadge variant="upd" />}
    </div>
  )

  return (
    <div className="group flex overflow-hidden rounded-xl border border-old-money-200 bg-white shadow-sm transition-all duration-200 hover:border-camel-300 hover:shadow-md dark:border-charcoal-600 dark:bg-charcoal-800 dark:hover:border-camel-700">
      <Link
        to={`/donino-dog/${encodeURIComponent(record.name)}/${encodeURIComponent(record.breed)}`}
        state={{ from: 'coursing-records' }}
        className="flex min-w-0 flex-1 flex-col gap-3 p-4 transition-colors group-hover:bg-cream-50 sm:grid sm:grid-cols-[minmax(180px,220px)_1fr_auto] sm:items-center sm:gap-4 dark:group-hover:bg-charcoal-700/40"
      >
        <div className="flex min-w-0 items-start justify-between gap-3 sm:contents">
          <div className="min-w-0 sm:col-start-1">
            <div className="mb-1.5 flex items-center gap-2">
              <h3 className="truncate text-base font-bold text-charcoal-900 dark:text-charcoal-100">
                {record.name}
              </h3>
              {record.sex && <DogSexIcon sex={record.sex} />}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-old-money-600 dark:text-old-money-400">
              <span className="rounded-md bg-cream-100 px-2 py-0.5 text-xs font-medium text-charcoal-700 dark:bg-charcoal-700 dark:text-charcoal-300">
                {record.breed}
              </span>
              <span className="text-old-money-400 dark:text-old-money-500">·</span>
              <span>{formatRecordDate(record.date)}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:hidden">{timeBlock}</div>
        </div>

        {hasHistoryChart && (
          <div className="flex items-center justify-center sm:hidden">
            <CoursingHistorySparkline
              current={{ time_seconds: record.time_seconds, date: record.date }}
              history={record.history}
            />
          </div>
        )}

        <div className="hidden min-h-[64px] items-center justify-center sm:col-start-2 sm:flex sm:px-2">
          {hasHistoryChart && (
            <CoursingHistorySparkline
              current={{ time_seconds: record.time_seconds, date: record.date }}
              history={record.history}
            />
          )}
        </div>

        <div className="hidden shrink-0 items-center gap-3 sm:col-start-3 sm:flex">
          {timeBlock}
          <ChevronRight
            className="h-5 w-5 text-old-money-300 transition-all group-hover:translate-x-0.5 group-hover:text-camel-600 dark:text-charcoal-500 dark:group-hover:text-camel-400"
            strokeWidth={2}
          />
        </div>
      </Link>
    </div>
  )
}
