import { useId, useMemo } from 'react'
import { parseRecordDate } from '../lib/recordDates'

export interface SpeedTimelinePoint {
  speed: number
  date: string
  isCurrent: boolean
}

function isHistoryEntry(value: unknown): value is { speed_km_h: number; date: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'speed_km_h' in value &&
    'date' in value &&
    typeof (value as { speed_km_h: unknown }).speed_km_h === 'number' &&
    typeof (value as { date: unknown }).date === 'string'
  )
}

export function buildSpeedTimeline(
  current: { speed_km_h: number; date: string },
  history: unknown[] | undefined
): SpeedTimelinePoint[] {
  const points: Array<SpeedTimelinePoint & { ts: number }> = []

  for (const entry of history ?? []) {
    if (!isHistoryEntry(entry)) continue
    const ts = parseRecordDate(entry.date)?.getTime()
    if (ts == null) continue
    points.push({
      speed: entry.speed_km_h,
      date: entry.date,
      isCurrent: false,
      ts,
    })
  }

  const currentTs = parseRecordDate(current.date)?.getTime()
  if (currentTs != null) {
    points.push({
      speed: current.speed_km_h,
      date: current.date,
      isCurrent: true,
      ts: currentTs,
    })
  }

  return points
    .sort((a, b) => a.ts - b.ts)
    .map(({ speed, date, isCurrent }) => ({ speed, date, isCurrent }))
}

interface SpeedHistorySparklineProps {
  current: { speed_km_h: number; date: string }
  history?: unknown[]
  className?: string
}

export default function SpeedHistorySparkline({ current, history, className = '' }: SpeedHistorySparklineProps) {
  const gradientId = useId()
  const points = useMemo(() => buildSpeedTimeline(current, history), [current, history])

  if (points.length < 2) return null

  const width = 240
  const height = 64
  const padding = { top: 16, right: 14, bottom: 10, left: 14 }
  const speeds = points.map((point) => point.speed)
  const minSpeed = Math.min(...speeds)
  const maxSpeed = Math.max(...speeds)
  const delta = speeds[speeds.length - 1] - speeds[0]
  const range = Math.max(maxSpeed - minSpeed, 2)
  const minY = minSpeed - range * 0.2
  const maxY = maxSpeed + range * 0.2
  const spanY = maxY - minY

  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom
  const floorY = padding.top + innerH

  const coords = points.map((point, index) => {
    const x = padding.left + (index / (points.length - 1)) * innerW
    const y = padding.top + innerH - ((point.speed - minY) / spanY) * innerH
    return { ...point, x, y }
  })

  const linePath = coords.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${floorY} L ${coords[0].x} ${floorY} Z`
  const midX = (coords[0].x + coords[coords.length - 1].x) / 2
  const midY = (coords[0].y + coords[coords.length - 1].y) / 2

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`h-16 w-full max-w-[260px] ${className}`}
      role="img"
      aria-label={`История скорости: от ${minSpeed} до ${maxSpeed} км/ч`}
    >
      <title>{points.map((point) => `${point.speed} км/ч`).join(' → ')}</title>

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
              delta > 0
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
            {delta > 0 ? `+${delta}` : delta}
          </text>
        </g>
      )}

      {coords.map((point) => (
        <g key={`${point.date}-${point.speed}`}>
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
            {point.speed}
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
