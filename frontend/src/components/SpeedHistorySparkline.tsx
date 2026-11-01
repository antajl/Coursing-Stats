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

  const width = 200
  const height = 40
  const padding = { top: 12, right: 16, bottom: 4, left: 14 }
  const speeds = points.map((point) => point.speed)
  const minSpeed = Math.min(...speeds)
  const maxSpeed = Math.max(...speeds)
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

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`h-10 w-full max-w-[200px] ${className}`}
      role="img"
      aria-label={`История скорости: от ${minSpeed} до ${maxSpeed} км/ч`}
      title={points.map((point) => `${point.speed} км/ч`).join(' → ')}
    >
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
        className="stroke-old-money-200"
        strokeWidth="1"
      />

      <path d={areaPath} fill={`url(#${gradientId})`} />

      <path
        d={linePath}
        fill="none"
        className="stroke-camel-600"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {coords.map((point, index) => {
        const isFirst = index === 0
        const isLast = index === coords.length - 1
        const anchor = isLast ? 'end' : isFirst ? 'start' : 'middle'
        const textX = isLast ? point.x + 2 : isFirst ? point.x - 2 : point.x

        return (
          <g key={`${point.date}-${point.speed}-${index}`}>
            <text
              x={textX}
              y={Math.max(point.y - 6, 9)}
              textAnchor={anchor}
              className={
                point.isCurrent
                  ? 'fill-camel-800 text-[9.5px] font-bold'
                  : 'fill-old-money-600 text-[8.5px] font-semibold'
              }
            >
              {point.speed}
            </text>
            <circle
              cx={point.x}
              cy={point.y}
              r={point.isCurrent ? 3.5 : 2.5}
              className={
                point.isCurrent
                  ? 'fill-camel-600 stroke-white'
                  : 'fill-old-money-400 stroke-white'
              }
              strokeWidth="1.5"
            />
          </g>
        )
      })}
    </svg>
  )
}
