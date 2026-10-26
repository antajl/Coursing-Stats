import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import CoursingHistorySparkline from '../../components/CoursingHistorySparkline'
import DogSexIcon from '../../components/DogSexIcon'
import OwnerCrownName from '../../components/OwnerCrownName'
import SpeedStatusBadge from '../../components/SpeedStatusBadge'
import { formatRecordDate, isRecentDoninoDate, parseRecordHistory } from '../../lib/recordDates'
import { toDogTitleCase } from '../../lib/dogName'
import { Icons } from '../../lib/icons'

interface CoursingRecordCardProps {
  record: {
    id: string | number
    name: string
    breed: string
    sex?: string
    time_seconds: number
    date: string
    status?: string
    history?: unknown[]
  }
}

export default function CoursingRecordCard({ record }: CoursingRecordCardProps) {
  const ChevronRight = Icons.chevronRight
  const historyItems = useMemo(() => parseRecordHistory(record.history), [record.history])
  const hasHistoryChart = historyItems.length > 0
  const isRecent = isRecentDoninoDate(record.date)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recStatus = (record as any).status
  const isNewDog = recStatus === 'new' || (!hasHistoryChart && recStatus !== 'improved')
  const isImprovedDog = recStatus === 'improved' || (hasHistoryChart && !isNewDog)

  const showNew = isRecent && isNewDog
  const showUpd = isRecent && !showNew && isImprovedDog

  const prevTime = useMemo(() => {
    if (!hasHistoryChart) return null
    const times = historyItems
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((h: any) => Number(h.time_seconds ?? h.time ?? 0))
      .filter((t) => t > 0)
    return times.length > 0 ? Math.min(...times).toFixed(2) : null
  }, [hasHistoryChart, historyItems])

  const timeBlock = (
    <div className="relative shrink-0">
      <span className="inline-block rounded-full bg-camel-600 px-3 py-1.5 text-sm font-bold text-white shadow-sm">
        {record.time_seconds} сек
      </span>
      {showNew && <SpeedStatusBadge variant="new" date={record.date} />}
      {showUpd && (
        <SpeedStatusBadge
          variant="upd"
          date={record.date}
          currentValue={record.time_seconds}
          prevValue={prevTime}
          unit="сек"
        />
      )}
    </div>
  )

  return (
    <div className="group flex overflow-hidden rounded-xl border border-old-money-200 bg-white transition-colors duration-200 hover:border-camel-300 hover:bg-cream-50">
      <Link
        to={`/donino-dog/${encodeURIComponent(record.name)}/${encodeURIComponent(record.breed)}`}
        state={{ from: 'coursing-records' }}
        className="flex min-w-0 flex-1 flex-col gap-3 p-4 transition-colors group-hover:bg-cream-50 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-4"
      >
        <div className="flex min-w-0 flex-col gap-3 sm:contents">
          <div className="min-w-0 sm:col-start-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <OwnerCrownName name={record.name} breed={record.breed} kind="donino">
                <h3 className="break-words text-base font-bold leading-snug text-charcoal-900 line-clamp-2">
                  {toDogTitleCase(record.name)}
                </h3>
              </OwnerCrownName>
              {record.sex && <DogSexIcon sex={record.sex} />}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-old-money-600">
              <span className="rounded-md bg-cream-100 px-2 py-0.5 text-xs font-medium text-charcoal-700">
                {record.breed}
              </span>
              <span className="text-old-money-400">·</span>
              <span>{formatRecordDate(record.date)}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:col-start-3 sm:row-start-1 sm:hidden">{timeBlock}</div>
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

        <div className="hidden shrink-0 items-center gap-2 sm:col-start-3 sm:flex">
          {timeBlock}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg text-charcoal-400 transition-colors group-hover:bg-cream-200 group-hover:text-charcoal-600">
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </Link>
    </div>
  )
}
