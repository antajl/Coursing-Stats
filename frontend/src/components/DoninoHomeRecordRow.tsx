import { Link } from 'react-router-dom'
import DogSexIcon from './DogSexIcon'
import OwnerCrownName from './OwnerCrownName'
import SpeedStatusBadge from './SpeedStatusBadge'
import { formatRecordDate, formatDoninoSpeedKmh, parseRecordHistory } from '../lib/recordDates'

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
}: DoninoHomeRecordRowProps) {
  const historyItems = parseRecordHistory(history)
  const showUpd = historyItems.length > 0 || status === 'improved'
  const showNew = status === 'new'

  return (
    <Link
      to={`/donino-dog/${encodeURIComponent(name)}/${encodeURIComponent(breed)}`}
      state={{ from: mode === 'speed' ? 'speed-records' : 'coursing-records' }}
      className="donino-home-row group"
      {...(rise ? { 'data-rise': true } : {})}
    >
      <div className="donino-home-row-main min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <OwnerCrownName name={name} breed={breed} kind="donino">
            <span className="break-words font-serif text-base font-bold leading-snug text-charcoal-900 line-clamp-2 dark:text-charcoal-100">
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
      <div className="relative shrink-0">
        <span className="donino-home-metric">
          {mode === 'speed' ? `${formatDoninoSpeedKmh(speedKmh)} км/ч` : `${formatTime(timeSeconds ?? 0)} сек`}
        </span>
        {showNew && <SpeedStatusBadge variant="new" />}
        {showUpd && !showNew && <SpeedStatusBadge variant="upd" />}
      </div>
    </Link>
  )
}
