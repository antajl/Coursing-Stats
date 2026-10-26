import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Image } from 'lucide-react'
import DogSexIcon from '../../components/DogSexIcon'
import OwnerCrownName from '../../components/OwnerCrownName'
import SpeedHistorySparkline from '../../components/SpeedHistorySparkline'
import SpeedStatusBadge from '../../components/SpeedStatusBadge'
import { formatRecordDate, isRecentDoninoDate, parseRecordHistory } from '../../lib/recordDates'
import { toDogTitleCase } from '../../lib/dogName'
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
  const historyItems = useMemo(() => parseRecordHistory(record.history), [record.history])
  const hasHistoryChart = historyItems.length > 0
  const isRecent = isRecentDoninoDate(record.date)

  const isNewDog = record.status === 'new' || (!hasHistoryChart && record.status !== 'improved')
  const isImprovedDog = record.status === 'improved' || (hasHistoryChart && !isNewDog)

  const showNew = isRecent && isNewDog
  const showUpd = isRecent && !showNew && isImprovedDog

  const prevSpeed = useMemo(() => {
    if (!hasHistoryChart) return null
    const speeds = historyItems
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((h: any) => Number(h.speed_km_h ?? h.speed ?? 0))
      .filter((s) => s > 0)
    return speeds.length > 0 ? Math.max(...speeds).toFixed(1) : null
  }, [hasHistoryChart, historyItems])

  const speedBlock = (
    <div className="relative shrink-0">
      <span className="inline-block rounded-full bg-camel-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
        {record.speed_km_h} км/ч
      </span>
      {showNew && <SpeedStatusBadge variant="new" date={record.date} />}
      {showUpd && (
        <SpeedStatusBadge
          variant="upd"
          date={record.date}
          currentValue={record.speed_km_h}
          prevValue={prevSpeed}
          unit="км/ч"
        />
      )}
    </div>
  )

  return (
    <div className="group flex overflow-hidden rounded-xl border border-old-money-200 bg-white transition-colors duration-200 hover:border-camel-300 hover:bg-cream-50">
      <Link
        to={`/donino-dog/${encodeURIComponent(record.name)}/${encodeURIComponent(record.breed)}`}
        state={{ from: 'speed-records' }}
        className="flex min-w-0 flex-1 flex-col gap-3 p-3 transition-colors group-hover:bg-cream-50 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-4"
      >
        <div className="flex min-w-0 flex-col gap-3 sm:contents">
          <div className="min-w-0 sm:col-start-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <OwnerCrownName name={record.name} breed={record.breed} kind="donino">
                <h3 className="break-words text-sm font-bold leading-snug text-charcoal-900 line-clamp-2">
                  {toDogTitleCase(record.name)}
                </h3>
              </OwnerCrownName>
              <DogSexIcon sex={record.sex} />
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-old-money-600">
              <span className="rounded-md bg-cream-100 px-2 py-0.5 text-xs font-medium text-charcoal-700">
                {record.breed}
              </span>
              <span className="text-old-money-400">·</span>
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

        <div className="hidden shrink-0 items-center gap-2 sm:col-start-3 sm:flex">
          {speedBlock}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg text-charcoal-400 transition-colors group-hover:bg-cream-200 group-hover:text-charcoal-600">
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </Link>

      {record.screenshot_url && (
        <a
          href={record.screenshot_url}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center justify-center border-l border-old-money-200 bg-cream-50/50 px-3 text-old-money-600 transition-colors hover:bg-cream-100 hover:text-charcoal-900 sm:flex"
          aria-label="Скриншот радара"
          title="Скриншот радара"
          onClick={(e) => e.stopPropagation()}
        >
          <Image className="h-4 w-4" />
        </a>
      )}
    </div>
  )
}
