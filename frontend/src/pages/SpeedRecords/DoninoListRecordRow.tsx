import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Circle, Minus } from 'lucide-react'
import CoursingHistorySparkline from '../../components/CoursingHistorySparkline'
import DogSexIcon from '../../components/DogSexIcon'
import OwnerCrownName from '../../components/OwnerCrownName'
import SpeedHistorySparkline from '../../components/SpeedHistorySparkline'
import RankBadge from '../../components/RankBadge'
import {
  formatRecordDate,
  formatDoninoSpeedKmh,
  parseRecordHistory,
  time350ToSpeedKmh,
} from '../../lib/recordDates'
import { toDogTitleCase } from '../../lib/dogName'
import { buildCoursingTimeline } from '../../components/CoursingHistorySparkline'
import { buildSpeedTimeline } from '../../components/SpeedHistorySparkline'

interface DoninoListRecordRowProps {
  mode: 'speed' | 'coursing'
  name: string
  breed: string
  sex?: string
  date?: string
  status?: string
  history?: unknown
  speedKmh?: number
  timeSeconds?: number
  screenshotUrl?: string
  trackType?: string | null
  /** Flat row inside DoninoColumnShell (default true — only used there). */
  embedded?: boolean
  rank?: number
  delta?: number | 'NEW' | null
  latestDateInDataset?: string | null
}

function formatTime(value: number): string {
  return Number(value).toFixed(2)
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

export default function DoninoListRecordRow({
  mode,
  name,
  breed,
  sex,
  date,
  status,
  history,
  speedKmh,
  timeSeconds,
  screenshotUrl,
  trackType,
  embedded = true,
  rank,
  delta,
  latestDateInDataset,
}: DoninoListRecordRowProps) {
  const historyItems = useMemo(() => parseRecordHistory(history), [history])

  const coursingSpeedKmh = useMemo(() => {
    if (mode !== 'coursing' || timeSeconds == null || timeSeconds <= 0) return null
    return time350ToSpeedKmh(timeSeconds).toFixed(1)
  }, [mode, timeSeconds])

  const rowClass = embedded ? 'donino-list-row donino-list-row--embedded' : 'donino-list-row'

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

  const profileLink = (
    <Link
      to={`/donino-dog/${encodeURIComponent(name)}/${encodeURIComponent(breed)}/`}
      state={{ from: mode === 'speed' ? 'speed-records' : 'coursing-records' }}
      className="donino-list-row-link group min-w-0 flex-1 border-b border-old-money-200 bg-white py-1.5 sm:py-2 px-3 sm:px-4 transition-colors duration-150 hover:bg-camel-100/60"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {rank != null && (
          <div className="shrink-0 flex items-center justify-center w-7 sm:w-8 mr-1">
            <RankBadge rank={rank} delta={delta} />
          </div>
        )}
        <div className="donino-home-row-main min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <OwnerCrownName name={name} breed={breed} kind="donino">
              <span className="truncate font-serif text-sm sm:text-base font-bold leading-snug text-charcoal-900">
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
      </div>

      {hasSparkline && (
        <div className="donino-list-row-chart hidden sm:flex sm:flex-1 sm:min-h-0 sm:items-center sm:justify-center sm:px-2">
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

  if (!screenshotUrl) {
    return <div className={rowClass}>{profileLink}</div>
  }

  return (
    <div className={`${rowClass} donino-list-row--with-screen`}>
      {profileLink}
      <a
        href={screenshotUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Смотреть подтверждение (скриншот/протокол)"
        title="Смотреть подтверждение (скриншот/протокол)"
        className="donino-list-row-screen"
        onClick={(e) => e.stopPropagation()}
      >
        <Camera size={15} strokeWidth={2} aria-hidden />
      </a>
    </div>
  )
}
