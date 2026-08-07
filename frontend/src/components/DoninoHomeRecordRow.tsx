import { Link } from 'react-router-dom'
import { Minus, Circle } from 'lucide-react'
import DogSexIcon from './DogSexIcon'
import OwnerCrownName from './OwnerCrownName'
import SpeedStatusBadge from './SpeedStatusBadge'
import SpeedHistorySparkline from './SpeedHistorySparkline'
import CoursingHistorySparkline from './CoursingHistorySparkline'
import { formatRecordDate, formatDoninoSpeedKmh, parseRecordHistory } from '../lib/recordDates'
import { buildCoursingTimeline } from './CoursingHistorySparkline'
import { buildSpeedTimeline } from './SpeedHistorySparkline'

interface DoninoHomeRecordRowProps {
  mode: 'speed' | 'coursing'
  name: string
  breed: string
  sex?: string
  date?: string
  status?: string
  history?: unknown
  speedKmh?: number
  timeSeconds?: number
  rise?: boolean
  trackType?: string | null
}

function getTrackTypeIcon(trackType: string | null | undefined) {
  if (!trackType) return null
  const lower = trackType.toLowerCase()
  if (lower.includes('круг') || lower.includes('circle')) {
    return <Circle size={12} className="text-camel-600 dark:text-camel-400" />
  }
  if (lower.includes('прямая') || lower.includes('straight') || lower.includes('line')) {
    return <Minus size={12} className="text-camel-600 dark:text-camel-400" />
  }
  return null
}

function TrackTypeBadge({ trackType }: { trackType: string | null | undefined }) {
  if (!trackType) return null
  const icon = getTrackTypeIcon(trackType)
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-camel-100 dark:bg-camel-900 text-camel-700 dark:text-camel-200 text-xs font-medium">
      {icon}
      {trackType}
    </span>
  )
}

function formatTime(value: number): string {
  return Number(value).toFixed(2)
}

export default function DoninoHomeRecordRow({
  mode,
  name,
  breed,
  sex,
  date,
  status,
  history,
  speedKmh,
  timeSeconds,
  rise = false,
  trackType,
}: DoninoHomeRecordRowProps) {
  const showNew = status === 'new'
  const historyItems = parseRecordHistory(history)
  const showUpd = historyItems.length > 0 || status === 'improved'

  const hasSparkline =
    mode === 'speed'
      ? buildSpeedTimeline({ speed_km_h: speedKmh ?? 0, date: date ?? '' }, history).length >= 2
      : buildCoursingTimeline({ time_seconds: timeSeconds ?? 0, date: date ?? '' }, history).length >= 2

  const sparkline =
    mode === 'speed' ? (
      <SpeedHistorySparkline
        current={{ speed_km_h: speedKmh ?? 0, date: date ?? '' }}
        history={history}
        className="h-12 w-full max-w-[180px]"
      />
    ) : (
      <CoursingHistorySparkline
        current={{ time_seconds: timeSeconds ?? 0, date: date ?? '' }}
        history={history}
        className="h-12 w-full max-w-[180px]"
      />
    )

  return (
    <Link
      to={`/donino-dog/${encodeURIComponent(name)}/${encodeURIComponent(breed)}`}
      state={{ from: mode === 'speed' ? 'speed-records' : 'coursing-records' }}
      className="donino-home-row group items-center hover:bg-camel-100/60 dark:hover:bg-camel-900/30 transition-colors duration-150"
      {...(rise ? { 'data-rise': true } : {})}
    >
      <div className="donino-home-row-main min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <OwnerCrownName name={name} breed={breed} kind="donino">
            <span className="break-words font-serif text-sm font-bold leading-snug text-charcoal-900 line-clamp-2 dark:text-charcoal-100">
              {name}
            </span>
          </OwnerCrownName>
          {sex && <DogSexIcon sex={sex} />}
        </div>
        {(date || breed) && (
          <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-old-money-500 dark:text-old-money-400">
            {date && <span>{formatRecordDate(date)}</span>}
            {date && breed && <span className="text-old-money-300 dark:text-charcoal-500">·</span>}
            {breed && <span className="donino-home-row-breed">{breed}</span>}
          </div>
        )}
      </div>

      {hasSparkline && (
        <div className="hidden sm:flex sm:flex-1 sm:min-h-0 sm:min-h-[48px] sm:items-center sm:justify-center sm:px-2">
          {sparkline}
        </div>
      )}

      <div className="relative shrink-0">
        <div className="flex flex-col items-center gap-1">
          <span className="donino-home-metric">
            {mode === 'speed' ? `${formatDoninoSpeedKmh(speedKmh)} км/ч` : `${formatTime(timeSeconds ?? 0)} сек`}
          </span>
          {trackType && <TrackTypeBadge trackType={trackType} />}
        </div>
        {showNew && <SpeedStatusBadge variant="new" />}
        {showUpd && !showNew && <SpeedStatusBadge variant="upd" />}
      </div>
    </Link>
  )
}
