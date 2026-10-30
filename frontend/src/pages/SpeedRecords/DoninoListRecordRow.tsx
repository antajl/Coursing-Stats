import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Image, Circle, Minus } from 'lucide-react'
import CoursingHistorySparkline from '../../components/CoursingHistorySparkline'
import DogSexIcon from '../../components/DogSexIcon'
import OwnerCrownName from '../../components/OwnerCrownName'
import SpeedHistorySparkline from '../../components/SpeedHistorySparkline'
import SpeedStatusBadge from '../../components/SpeedStatusBadge'
import RankBadge from '../../components/RankBadge'
import {
  formatRecordDate,
  formatDoninoSpeedKmh,
  parseRecordHistory,
  isRecentDoninoDate,
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
  latestDateInDataset?: string | null
}

function formatTime(value: number): string {
  return Number(value).toFixed(2)
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
  latestDateInDataset,
}: DoninoListRecordRowProps) {
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
        className="h-12 w-full max-w-[180px]"
      />
    ) : (
      <CoursingHistorySparkline
        current={{ time_seconds: timeSeconds ?? 0, date: date ?? '' }}
        history={history}
        className="h-12 w-full max-w-[180px]"
      />
    )

  const profileLink = (
    <Link
      to={`/donino-dog/${encodeURIComponent(name)}/${encodeURIComponent(breed)}/`}
      state={{ from: mode === 'speed' ? 'speed-records' : 'coursing-records' }}
      className="donino-list-row-link group min-w-0 flex-1 border-b border-old-money-200 bg-white py-2 px-4 transition-colors duration-200 hover:bg-camel-100/60"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {rank != null && (
          <div className="shrink-0 flex items-center justify-center w-6 sm:w-7">
            <RankBadge rank={rank} />
          </div>
        )}
        <div className="donino-home-row-main min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <OwnerCrownName name={name} breed={breed} kind="donino">
              <span className="break-words font-serif text-base font-bold leading-snug text-charcoal-900 line-clamp-2">
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
      </div>

      <div
        className={`donino-list-row-chart mt-2 flex min-h-0 items-center justify-center sm:mt-0 sm:min-h-[48px] sm:flex-1 sm:px-2 ${
          hasSparkline ? '' : 'hidden sm:flex'
        }`}
      >
        {hasSparkline ? sparkline : null}
      </div>

      <div className="relative mt-2 ml-auto shrink-0 sm:mt-0 flex flex-col items-end gap-0.5 text-right">
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
        aria-label="Открыть скриншот"
        title="Скриншот"
        className="donino-list-row-screen"
        onClick={(e) => e.stopPropagation()}
      >
        <Image size={14} strokeWidth={2} aria-hidden />
        <span>Скрин</span>
      </a>
    </div>
  )
}
