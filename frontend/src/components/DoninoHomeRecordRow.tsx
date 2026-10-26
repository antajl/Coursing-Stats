import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Circle, Minus } from 'lucide-react'
import CoursingHistorySparkline from './CoursingHistorySparkline'
import DogSexIcon from './DogSexIcon'
import OwnerCrownName from './OwnerCrownName'
import SpeedHistorySparkline from './SpeedHistorySparkline'
import SpeedStatusBadge from './SpeedStatusBadge'
import RankBadge from './RankBadge'
import {
  formatRecordDate,
  formatDoninoSpeedKmh,
  parseRecordHistory,
  isRecentDoninoDate,
  time350ToSpeedKmh,
} from '../lib/recordDates'
import { toDogTitleCase } from '../lib/dogName'
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
  latestDateInDataset?: string | null
  rank?: number
}

function getTrackTypeIcon(trackType: string | null | undefined) {
  if (!trackType) return null
  const lower = trackType.toLowerCase()
  if (lower.includes('круг') || lower.includes('circle')) {
    return <Circle size={12} className="text-camel-600" />
  }
  if (lower.includes('прямая') || lower.includes('straight') || lower.includes('line')) {
    return <Minus size={12} className="text-camel-600" />
  }
  return null
}

function TrackTypeBadge({ trackType }: { trackType: string | null | undefined }) {
  if (!trackType) return null
  const icon = getTrackTypeIcon(trackType)
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-camel-100 text-camel-700 text-xs font-medium">
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
  latestDateInDataset,
  rank,
}: DoninoHomeRecordRowProps) {
  const historyItems = useMemo(() => parseRecordHistory(history), [history])
  const isRecent = useMemo(
    () => isRecentDoninoDate(date, latestDateInDataset),
    [date, latestDateInDataset]
  )

  const hasHistory = historyItems.length > 0
  const isNewDog = status === 'new' || (!hasHistory && status !== 'improved')
  const isImprovedDog = status === 'improved' || (hasHistory && !isNewDog)

  const showNew = isRecent && isNewDog
  const showUpd = isRecent && !showNew && isImprovedDog

  const prevValue = useMemo(() => {
    if (!hasHistory) return null
    if (mode === 'speed') {
      const speeds = historyItems
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((h: any) => Number(h.speed_km_h ?? h.speed ?? 0))
        .filter((s) => s > 0)
      return speeds.length > 0 ? Math.max(...speeds).toFixed(1) : null
    } else {
      const times = historyItems
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((h: any) => Number(h.time_seconds ?? h.time ?? 0))
        .filter((t) => t > 0)
      return times.length > 0 ? Math.min(...times).toFixed(2) : null
    }
  }, [hasHistory, historyItems, mode])

  const coursingSpeedKmh = useMemo(() => {
    if (mode !== 'coursing' || timeSeconds == null || timeSeconds <= 0) return null
    return time350ToSpeedKmh(timeSeconds).toFixed(1)
  }, [mode, timeSeconds])

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
      className="donino-home-row group items-center hover:bg-camel-100/60 transition-colors duration-150"
      {...(rise ? { 'data-rise': true } : {})}
    >
      {rank != null && (
        <div className="shrink-0 flex items-center justify-center w-8 sm:w-9">
          <RankBadge rank={rank} hideDelta />
        </div>
      )}
      <div className="donino-home-row-main min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <OwnerCrownName name={name} breed={breed} kind="donino">
            <span className="break-words font-serif text-sm font-bold leading-snug text-charcoal-900 line-clamp-2">
              {toDogTitleCase(name)}
            </span>
          </OwnerCrownName>
          {sex && <DogSexIcon sex={sex} />}
        </div>
        {(date || breed) && (
          <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-old-money-500">
            {date && <span>{formatRecordDate(date)}</span>}
            {date && breed && <span className="text-old-money-300">·</span>}
            {breed && <span className="donino-home-row-breed">{breed}</span>}
          </div>
        )}
      </div>

      {hasSparkline && (
        <div className="hidden sm:flex sm:flex-1 sm:min-h-0 sm:min-h-[48px] sm:items-center sm:justify-center sm:px-2">
          {sparkline}
        </div>
      )}

      <div className="relative shrink-0 flex flex-col items-end gap-0.5 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {showNew && (
            <SpeedStatusBadge
              variant="new"
              date={date}
            />
          )}
          {showUpd && !showNew && (
            <SpeedStatusBadge
              variant="upd"
              date={date}
              currentValue={mode === 'speed' ? formatDoninoSpeedKmh(speedKmh) : formatTime(timeSeconds ?? 0)}
              prevValue={prevValue}
              unit={mode === 'speed' ? 'км/ч' : 'сек'}
            />
          )}
          <span className="donino-home-metric">
            {mode === 'speed' ? `${formatDoninoSpeedKmh(speedKmh)} км/ч` : `${formatTime(timeSeconds ?? 0)} сек`}
          </span>
        </div>
        {coursingSpeedKmh && (
          <span className="text-[11px] font-medium tracking-tight text-old-money-500 tabular-nums">
            {coursingSpeedKmh} км/ч
          </span>
        )}
        {trackType && <TrackTypeBadge trackType={trackType} />}
      </div>
    </Link>
  )
}
