import { Link } from 'react-router-dom'
import SpeedStatusBadge from '../../components/SpeedStatusBadge'
import { formatRecordDate } from '../../lib/recordDates'
import { Icons } from '../../lib/icons'

interface CoursingRecordCardProps {
  record: {
    id: string | number
    name: string
    breed: string
    time_seconds: number
    date: string
    history?: unknown[]
  }
}

export default function CoursingRecordCard({ record }: CoursingRecordCardProps) {
  const ChevronRight = Icons.chevronRight

  return (
    <Link
      to={`/donino-dog/${encodeURIComponent(record.name)}/${encodeURIComponent(record.breed)}`}
      state={{ from: 'coursing-records' }}
      className="group flex flex-col gap-3 rounded-xl border border-old-money-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-camel-300 hover:bg-cream-50 hover:shadow-md sm:flex-row sm:items-center sm:gap-4 dark:border-charcoal-600 dark:bg-charcoal-800 dark:hover:border-camel-700 dark:hover:bg-charcoal-700/40"
    >
      <div className="min-w-0 flex-1">
        <h3 className="mb-1.5 truncate text-base font-bold text-charcoal-900 dark:text-charcoal-100">{record.name}</h3>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-old-money-600 dark:text-old-money-400">
          <span className="rounded-md bg-cream-100 px-2 py-0.5 text-xs font-medium text-charcoal-700 dark:bg-charcoal-700 dark:text-charcoal-300">
            {record.breed}
          </span>
          <span className="text-old-money-400 dark:text-old-money-500">·</span>
          <span>{formatRecordDate(record.date)}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-3 sm:justify-start">
        <div className="relative">
          <span className="inline-block rounded-full bg-camel-600 px-3 py-1.5 text-sm font-bold text-white shadow-sm">
            {record.time_seconds} сек
          </span>
          {record.history && record.history.length > 0 && <SpeedStatusBadge variant="upd" />}
        </div>
        <ChevronRight
          className="h-5 w-5 text-old-money-300 transition-all group-hover:translate-x-0.5 group-hover:text-camel-600 dark:text-charcoal-500 dark:group-hover:text-camel-400"
          strokeWidth={2}
        />
      </div>
    </Link>
  )
}
