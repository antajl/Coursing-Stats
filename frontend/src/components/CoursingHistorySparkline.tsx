import { useId, useMemo } from 'react'
import { parseRecordDate } from '../lib/recordDates'

export interface CoursingTimelinePoint {
  time_seconds: number
  date: string
  isCurrent: boolean
}

function isHistoryEntry(value: unknown): value is { time_seconds: number; date: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'time_seconds' in value &&
    'date' in value &&
    typeof (value as { time_seconds: unknown }).time_seconds === 'number' &&
    typeof (value as { date: unknown }).date === 'string'
  )
}

export function buildCoursingTimeline(
  current: { time_seconds: number; date: string },
  history: unknown[] | undefined
): CoursingTimelinePoint[] {
  const points: Array<CoursingTimelinePoint & { ts: number }> = []

  for (const entry of history ?? []) {
    if (!isHistoryEntry(entry)) continue
    const ts = parseRecordDate(entry.date)?.getTime()
    if (ts == null) continue
    points.push({
      time_seconds: entry.time_seconds,
      date: entry.date,
      isCurrent: false,
      ts,
    })
  }

  const currentTs = parseRecordDate(current.date)?.getTime()
  if (currentTs != null) {
    points.push({
      time_seconds: current.time_seconds,
      date: current.date,
      isCurrent: true,
      ts: currentTs,
    })
  }

  return points
    .sort((a, b) => a.ts - b.ts)
    .map(({ time_seconds, date, isCurrent }) => ({ time_seconds, date, isCurrent }))
}

interface CoursingHistorySparklineProps {
  current: { time_seconds: number; date: string }
  history?: unknown[]
  className?: string
}

export default function CoursingHistorySparkline({
  current,
  history,
  className = '',
}: CoursingHistorySparklineProps) {
  const gradientId = useId()
  const points = useMemo(() => buildCoursingTimeline(current, history), [current, history])

  if (points.length < 2) return null

  const width = 240
  const height = 64
  const padding = { top: 16, right: 14, bottom: 10, left: 14 }
  const times = points.map((point) => point.time_seconds)
  const minTime = Math.min(...times)
  const maxTime = Math.max(...times)
  const delta = times[times.length - 1] - times[0]
  const range = Math.max(maxTime - minTime, 0.5)
  const minY = minTime - range * 0.2
  const maxY = maxTime + range * 0.2
  const spanY = maxY - minY

  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom
  const floorY = padding.top + innerH

  const coords = points.map((point, index) => {
    const x = padding.left + (index / (points.length - 1)) * innerW
    // Меньше секунд — выше на графике (лучше результат)
    const y = padding.top + ((point.time_seconds - minY) / spanY) * innerH
    return { ...point, x, y }
  })

  const linePath = coords.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${floorY} L ${coords[0].x} ${floorY} Z`
  const midX = (coords[0].x + coords[coords.length - 1].x) / 2
  const midY = (coords[0].y + coords[coords.length - 1].y) / 2

  const formatTime = (value: number) => value.toFixed(2).replace('.', ',')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`h-16 w-full max-w-[260px] ${className}`}
      role="img"
      aria-label={`История времени: от ${formatTime(minTime)} до ${formatTime(maxTime)} сек`}
    >
      <title>{points.map((point) => `${formatTime(point.time_seconds)} сек`).join(' → ')}</title>

      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c4956a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#c4956a" stopOpacity="0" />
        </linearGradient>
      </defs>

      <line
        x1={padding.left}
        y1={floorY}
        x2={width - padding.right}
        y2={floorY}
        className="stroke-old-money-200 dark:stroke-charcoal-600"
        strokeWidth="1"
      />

      <path d={areaPath} fill={`url(#${gradientId})`} />

      <path
        d={linePath}
        fill="none"
        className="stroke-camel-600 dark:stroke-camel-400"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.length === 2 && delta !== 0 && (
        <g>
          <rect
            x={midX - 18}
            y={midY - 18}
            width={36}
            height={16}
            rx={8}
            className={
              delta < 0
                ? 'fill-green-600 dark:fill-green-500'
                : 'fill-old-money-400 dark:fill-charcoal-500'
            }
          />
          <text
            x={midX}
            y={midY - 7}
            textAnchor="middle"
            className="fill-white text-[9px] font-bold"
          >
            {delta < 0 ? delta.toFixed(2).replace('.', ',') : `+${delta.toFixed(2).replace('.', ',')}`}
          </text>
        </g>
      )}

      {coords.map((point) => (
        <g key={`${point.date}-${point.time_seconds}`}>
          <text
            x={point.x}
            y={point.y - 8}
            textAnchor="middle"
            className={
              point.isCurrent
                ? 'fill-camel-700 text-[10px] font-bold dark:fill-camel-300'
                : 'fill-old-money-500 text-[9px] font-semibold dark:fill-charcoal-400'
            }
          >
            {formatTime(point.time_seconds)}
          </text>
          <circle
            cx={point.x}
            cy={point.y}
            r={point.isCurrent ? 4.5 : 3.5}
            className={
              point.isCurrent
                ? 'fill-camel-600 stroke-white dark:fill-camel-400 dark:stroke-charcoal-800'
                : 'fill-old-money-300 stroke-white dark:fill-charcoal-500 dark:stroke-charcoal-800'
            }
            strokeWidth="2"
          />
        </g>
      ))}
    </svg>
  )
}
