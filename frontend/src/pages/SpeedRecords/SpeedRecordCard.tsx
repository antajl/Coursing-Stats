import { Link } from 'react-router-dom'
import { Image } from 'lucide-react'
import DogSexIcon from '../../components/DogSexIcon'
import OwnerCrownName from '../../components/OwnerCrownName'
import SpeedHistorySparkline from '../../components/SpeedHistorySparkline'
import SpeedStatusBadge from '../../components/SpeedStatusBadge'
import { formatRecordDate } from '../../lib/recordDates'
import { Icons } from '../../lib/icons'

interface SpeedRecordCardProps {
  record: {
    id: string | number
    name: string
    sex: string
    breed: string
    speed_km_h: number
    date: string
    screenshot_url?: string
    status?: string
    history?: unknown[]
  }
}

export default function SpeedRecordCard({ record }: SpeedRecordCardProps) {
  const ChevronRight = Icons.chevronRight
  const hasHistoryChart = Array.isArray(record.history) && record.history.length > 0

  const speedBlock = (
    <div className="relative shrink-0">
      <span className="inline-block rounded-full bg-camel-600 px-3 py-1.5 text-sm font-bold text-white shadow-sm">
        {record.speed_km_h} км/ч
      </span>
      {record.status === 'new' && <SpeedStatusBadge variant="new" />}
      {record.status === 'improved' && <SpeedStatusBadge variant="upd" />}
    </div>
  )

  return (
    <div className="group flex overflow-hidden rounded-xl border border-old-money-200 bg-white shadow-sm transition-all duration-200 hover:border-camel-300 hover:shadow-md dark:border-charcoal-600 dark:bg-charcoal-800 dark:hover:border-camel-700">
      <Link
        to={`/donino-dog/${encodeURIComponent(record.name)}/${encodeURIComponent(record.breed)}`}
        state={{ from: 'speed-records' }}
        className="flex min-w-0 flex-1 flex-col gap-3 p-4 transition-colors group-hover:bg-cream-50 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-4 dark:group-hover:bg-charcoal-700/40"
      >
        <div className="flex min-w-0 flex-col gap-3 sm:contents">
          <div className="min-w-0 sm:col-start-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <OwnerCrownName name={record.name} breed={record.breed} kind="donino">
                <h3 className="break-words text-base font-bold leading-snug text-charcoal-900 line-clamp-2 dark:text-charcoal-100">
                  {record.name}
                </h3>
              </OwnerCrownName>
              <DogSexIcon sex={record.sex} />
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-old-money-600 dark:text-old-money-400">
              <span className="rounded-md bg-cream-100 px-2 py-0.5 text-xs font-medium text-charcoal-700 dark:bg-charcoal-700 dark:text-charcoal-300">
                {record.breed}
              </span>
              <span className="text-old-money-400 dark:text-old-money-500">·</span>
              <span>{formatRecordDate(record.date)}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:col-start-3 sm:row-start-1 sm:hidden">{speedBlock}</div>
        </div>

        {hasHistoryChart && (
          <div className="flex items-center justify-center sm:hidden">
            <SpeedHistorySparkline
              current={{ speed_km_h: record.speed_km_h, date: record.date }}
              history={record.history}
            />
          </div>
        )}

        <div className="hidden min-h-[64px] items-center justify-center sm:col-start-2 sm:flex sm:px-2">
          {hasHistoryChart && (
            <SpeedHistorySparkline
              current={{ speed_km_h: record.speed_km_h, date: record.date }}
              history={record.history}
            />
          )}
        </div>

        <div className="hidden shrink-0 items-center gap-3 sm:col-start-3 sm:flex">
          {speedBlock}
          <ChevronRight
            className="h-5 w-5 text-old-money-300 transition-all group-hover:translate-x-0.5 group-hover:text-camel-600 dark:text-charcoal-500 dark:group-hover:text-camel-400"
            strokeWidth={2}
          />
        </div>
      </Link>

      {record.screenshot_url && (
        <a
          href={record.screenshot_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Открыть скриншот"
          title="Скриншот"
          className="flex shrink-0 items-center justify-center border-l border-old-money-200 px-4 text-old-money-500 transition-colors hover:bg-camel-50 hover:text-camel-700 dark:border-charcoal-600 dark:text-old-money-400 dark:hover:bg-charcoal-700 dark:hover:text-camel-400"
        >
          <Image size={18} strokeWidth={2} />
        </a>
      )}
    </div>
  )
}
