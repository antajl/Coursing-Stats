import HoverTooltip from '../../../../components/ui/HoverTooltip'
import { normalizeBibColorName, bibColorStyle } from '../utils'
import type { Heat, RawScores } from '../types'

export const BIB_COLOR_LABELS: Record<string, string> = {
  red: 'Красная попона',
  white: 'Белая попона',
  blue: 'Синяя попона',
  black: 'Чёрная попона',
  yellow: 'Жёлтая попона',
  green: 'Зелёная попона',
}

export function getHeatDistance(heat: Heat, rawScores: RawScores | null): number | null {
  if (heat.time && heat.speed_kmh) {
    const t = typeof heat.time === 'number' ? heat.time : parseFloat(String(heat.time))
    if (!isNaN(t) && t > 0) {
      return Math.round((heat.speed_kmh / 3.6) * t)
    }
  }
  return (heat as any).distance || (rawScores as any)?.distance || null
}

export interface ProtocolHeatBadgeProps {
  heatNumber?: number | string | null
  bibColor?: string | null
  bibNumber?: number | string | null
  distance?: number | null
  isRacing?: boolean
  size?: 'sm' | 'md'
}

/** Компактная плашка забега/заезда (цвет попоны с нанесенным номером забега/заезда) */
export default function ProtocolHeatBadge({
  heatNumber,
  bibColor,
  bibNumber,
  distance,
  isRacing = false,
  size = 'md',
}: ProtocolHeatBadgeProps) {
  const normalized = normalizeBibColorName(bibColor ?? undefined, isRacing)
  const isRed = normalized === 'red'
  const isBlue = normalized === 'blue'
  const isBlack = normalized === 'black'
  const isWhite = normalized === 'white'
  const isYellow = normalized === 'yellow'
  const isGreen = normalized === 'green'

  const colorClass = isRed
    ? 'bg-rose-600 text-white border-rose-700'
    : isBlue
      ? 'bg-sky-600 text-white border-sky-700'
      : isBlack
        ? 'bg-charcoal-900 text-white border-charcoal-950'
        : isWhite
          ? 'bg-white text-charcoal-900 border-old-money-300'
          : isYellow
            ? 'bg-amber-300 text-charcoal-900 border-amber-400'
            : isGreen
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-old-money-100 text-charcoal-800 border-old-money-300'

  const label = heatNumber != null ? String(heatNumber) : '—'
  const colorName = normalized ? (BIB_COLOR_LABELS[normalized] || normalized) : 'Попона'
  const bibInfo =
    bibNumber != null && String(bibNumber) !== String(heatNumber) ? ` (попона №${bibNumber})` : ''
  const tooltipText = `${colorName}${bibInfo} · ${isRacing ? 'Заезд' : 'Забег'} №${label}${distance ? ` (${distance}м)` : ''}`

  const sizeClasses = size === 'sm'
    ? 'min-w-[1.25rem] h-4.5 px-1 text-[10px]'
    : 'min-w-[1.5rem] h-5.5 px-1.5 py-0.5 text-xs'

  return (
    <HoverTooltip label={tooltipText} placement="top" portal delayMs={0}>
      <span className="relative inline-flex items-center justify-center shrink-0">
        <span
          className={`inline-flex items-center justify-center rounded font-mono font-bold cursor-help select-none shrink-0 border shadow-2xs transition-all ${sizeClasses} ${colorClass}`}
          style={!colorClass.includes('bg-') && normalized ? bibColorStyle(normalized) : undefined}
        >
          <span>{label}</span>
        </span>
      </span>
    </HoverTooltip>
  )
}
