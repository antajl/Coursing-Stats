import type { CriteriaTuple } from './coursingCriteriaTypes'
import { COURSING_CRITERIA_ITEMS } from './coursingCriteriaTypes'

interface CoursingRadarSvgProps {
  primary: CriteriaTuple
  secondary: CriteriaTuple
  primaryLabel: string
  secondaryLabel: string
}

const CX = 150
const CY = 128
const RADIUS = 74
const START_ANGLE = -Math.PI / 2

function pointAt(axisIdx: number, ratio: number): [number, number] {
  const angle = START_ANGLE + (axisIdx * 2 * Math.PI) / 5
  const r = RADIUS * Math.max(0, Math.min(1, ratio))
  return [CX + r * Math.cos(angle), CY + r * Math.sin(angle)]
}

function polygonPoints(values: CriteriaTuple, minFloor: number): string {
  const span = 20 - minFloor
  return values
    .map((val, idx) => {
      const clamped = Math.max(minFloor, Math.min(20, val))
      const ratio = span > 0 ? (clamped - minFloor) / span : 0
      const [x, y] = pointAt(idx, ratio)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

function ringPoints(ratio: number): string {
  return Array.from({ length: 5 }, (_, idx) => {
    const [x, y] = pointAt(idx, ratio)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}

export function CoursingRadarSvg({
  primary,
  secondary,
  primaryLabel,
  secondaryLabel,
}: CoursingRadarSvgProps) {
  const minVal = Math.min(...primary, ...secondary)
  const minFloor = minVal < 10 ? 0 : 10
  const span = 20 - minFloor
  const rings = minFloor === 10 ? [12, 16, 20] : [5, 10, 15, 20]

  const primaryPoly = polygonPoints(primary, minFloor)
  const secondaryPoly = polygonPoints(secondary, minFloor)

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 300 250"
        className="w-full max-w-[268px] h-auto select-none"
        role="img"
        aria-label={`Диаграмма 5 критериев курсинга: ${primaryLabel} и ${secondaryLabel}`}
      >
        {/* Concentric reference pentagons */}
        {rings.map((tick) => {
          const ratio = (tick - minFloor) / span
          const [, labelY] = pointAt(0, ratio)
          return (
            <g key={tick}>
              <polygon
                points={ringPoints(ratio)}
                fill="none"
                stroke="#e5dccb"
                strokeWidth={tick === 20 ? 1.15 : 0.85}
                strokeDasharray={tick === 20 ? undefined : '3 3'}
              />
              <text
                x={CX + 4}
                y={labelY - 2}
                className="fill-charcoal-400 font-mono text-[8.5px]"
              >
                {tick}
              </text>
            </g>
          )
        })}

        {/* Radial axes */}
        {COURSING_CRITERIA_ITEMS.map((item, idx) => {
          const [ax, ay] = pointAt(idx, 1)
          const [lx, ly] = pointAt(idx, 1.24)
          const anchor =
            idx === 0 ? 'middle' : idx === 1 || idx === 2 ? 'start' : 'end'
          const dy = idx === 0 ? -4 : idx === 2 || idx === 3 ? 6 : 3
          return (
            <g key={item.key}>
              <line
                x1={CX}
                y1={CY}
                x2={ax.toFixed(1)}
                y2={ay.toFixed(1)}
                stroke="#e5dccb"
                strokeWidth={0.9}
              />
              <text
                x={lx.toFixed(1)}
                y={(ly + dy).toFixed(1)}
                textAnchor={anchor}
                className="fill-charcoal-700 font-sans text-[10px] font-semibold"
              >
                {item.key} · {primary[idx].toFixed(1)}
              </text>
            </g>
          )
        })}

        {/* Comparison baseline polygon (dashed camel) */}
        <polygon
          points={secondaryPoly}
          fill="rgba(178, 130, 71, 0.10)"
          stroke="#b28247"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          strokeLinejoin="round"
        />

        {/* Primary polygon (solid forest) */}
        <polygon
          points={primaryPoly}
          fill="rgba(21, 128, 61, 0.15)"
          stroke="#15803d"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Vertex dots on primary polygon */}
        {primary.map((val, idx) => {
          const clamped = Math.max(minFloor, Math.min(20, val))
          const ratio = span > 0 ? (clamped - minFloor) / span : 0
          const [vx, vy] = pointAt(idx, ratio)
          return (
            <circle
              key={COURSING_CRITERIA_ITEMS[idx].key}
              cx={vx.toFixed(1)}
              cy={vy.toFixed(1)}
              r={3.2}
              fill="#15803d"
              stroke="#ffffff"
              strokeWidth={1.25}
            />
          )
        })}
      </svg>

      {/* Legend */}
      <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-charcoal-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-3.5 rounded-xs border border-forest-700 bg-forest-700/20" />
          <span className="font-medium text-charcoal-800">{primaryLabel}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0 w-3.5 border-t-2 border-dashed border-camel-600" />
          <span>{secondaryLabel}</span>
        </span>
      </div>
    </div>
  )
}
