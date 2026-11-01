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
    return <Circle size={10} className="text-camel-600 inline shrink-0" />
  }
  if (lower.includes('прямая') || lower.includes('straight') || lower.includes('line')) {
    return <Minus size={10} className="text-camel-600 inline shrink-0" />
  }
  return null
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
        className="h-10 w-full max-w-[170px]"
      />
    ) : (
      <CoursingHistorySparkline
        current={{ time_seconds: timeSeconds ?? 0, date: date ?? '' }}
        history={history}
        className="h-10 w-full max-w-[170px]"
      />
    )

  return (
    <Link
      to={`/donino-dog/${encodeURIComponent(name)}/${encodeURIComponent(breed)}/`}
      state={{ from: mode === 'speed' ? 'speed-records' : 'coursing-records' }}
      className="donino-home-row group items-center py-1.5 sm:py-2 px-3 sm:px-4 hover:bg-camel-100/60 transition-colors duration-150"
      {...(rise ? { 'data-rise': true } : {})}
    >
      {rank != null && (
        <div className="shrink-0 flex items-center justify-center w-7 sm:w-8 mr-1">
          <RankBadge rank={rank} hideDelta />
        </div>
      )}
      <div className="donino-home-row-main min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <OwnerCrownName name={name} breed={breed} kind="donino">
            <span className="break-words font-serif text-sm sm:text-base font-bold leading-snug text-charcoal-900 line-clamp-1">
              {toDogTitleCase(name)}
            </span>
          </OwnerCrownName>
          {sex && <DogSexIcon sex={sex} />}
        </div>
        {(date || breed) && (
          <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-old-money-500 whitespace-nowrap">
            {date && <span className="shrink-0">{formatRecordDate(date)}</span>}
            {date && breed && <span className="text-old-money-300">·</span>}
            {breed && <span className="truncate donino-home-row-breed">{breed}</span>}
          </div>
        )}
        {trackType && (
          <div className="mt-0.5 flex min-w-0 items-center text-[11px] text-old-money-500">
            <span className="inline-flex items-center gap-0.5 font-medium text-old-money-600">
              {getTrackTypeIcon(trackType)}
              <span>{trackType}</span>
            </span>
          </div>
        )}
      </div>

      {hasSparkline && (
        <div className="hidden sm:flex sm:flex-1 sm:min-h-0 sm:items-center sm:justify-center sm:px-2">
          {sparkline}
        </div>
      )}

      <div className="relative shrink-0 flex flex-col items-end justify-center text-right min-w-[70px] sm:min-w-[85px]">
        {mode === 'speed' ? (
          <>
            <div className="flex items-center gap-1 leading-none whitespace-nowrap">
              <span className="text-base sm:text-lg font-bold tabular-nums text-camel-700 leading-none">
                {formatDoninoSpeedKmh(speedKmh)}
              </span>
              <span className="flex flex-col text-[7.5px] sm:text-[8px] font-semibold uppercase tracking-wide text-charcoal-500 leading-[1.1] text-left">
                <span>макс.</span>
                <span>км/ч</span>
              </span>
            </div>
            <span className="text-[10px] sm:text-[10.5px] font-medium text-old-money-500 tabular-nums mt-0.5">
              {historyItems.length > 0 ? `${historyItems.length + 1} зам.` : '1 зам.'}
            </span>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1 leading-none whitespace-nowrap">
              <span className="text-base sm:text-lg font-bold tabular-nums text-camel-700 leading-none">
                {formatTime(timeSeconds ?? 0)}
              </span>
              <span className="text-[8px] sm:text-[8.5px] font-semibold uppercase tracking-wide text-charcoal-500 leading-none">
                сек
              </span>
            </div>
            {coursingSpeedKmh && (
              <span className="text-[10px] sm:text-[10.5px] font-medium text-old-money-500 tabular-nums mt-0.5">
                {coursingSpeedKmh} км/ч
              </span>
            )}
          </>
        )}
      </div>
    </Link>
  )
}
