import { bibColorStyle, bibTextClass, normalizeBibColorName } from '../utils'
import HoverTooltip from '../../../../components/ui/HoverTooltip'

const BIB_LABELS: Record<string, string> = {
  red: 'Красная попона',
  white: 'Белая попона',
  blue: 'Голубая попона',
  black: 'Чёрная попона',
  yellow: 'Жёлтая попона',
  green: 'Зелёная попона',
}

interface PoponaCellProps {
  number?: number | string | null
  color?: string | null
  /** Slightly smaller for dense coursing heat headers */
  compact?: boolean
  /** Победитель очного заезда (лучшее время среди участников заезда) */
  isWinner?: boolean
  isRacing?: boolean
}

/** Ячейка попоны как в протоколе: цветной фон + цифра */
export default function PoponaCell({ number, color, compact = false, isWinner = false, isRacing = false }: PoponaCellProps) {
  if (number == null && !color) {
    return null
  }

  const normalized = normalizeBibColorName(color ?? undefined, isRacing)
  const colorTitle = normalized ? (BIB_LABELS[normalized] || normalized) : undefined
  const winnerTitle = isWinner ? ' · 1-е место в заезде' : ''
  const title =
    number != null && colorTitle
      ? `Номер забега ${number} · ${colorTitle}${winnerTitle}`
      : number != null
        ? `Номер забега ${number}${winnerTitle}`
        : colorTitle ? `${colorTitle}${winnerTitle}` : undefined
  const sizeClass = compact
    ? 'min-h-[1.5rem] min-w-[1.75rem] text-xs'
    : 'min-h-[2rem] min-w-[2.25rem] text-sm'

  return (
    <HoverTooltip label={title} placement="top" variant="site" delayMs={0} portal>
      <span className="relative inline-flex items-center justify-center">
        <span
          className={`inline-flex items-center justify-center rounded font-bold cursor-help transition-all ${sizeClass} ${normalized ? bibTextClass(normalized, isRacing) : 'text-charcoal-900 border border-old-money-300'} ${isWinner ? 'ring-2 ring-camel-500 ring-offset-1 shadow-sm' : 'shadow-xs'}`}
          style={normalized ? bibColorStyle(normalized, isRacing) : undefined}
        >
          {number ?? '—'}
        </span>
        {isWinner && (
          <span
            className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-camel-600 text-white text-[9px] font-bold shadow-xs ring-1 ring-white pointer-events-none"
            aria-label="1-е место в заезде"
          >
            1
          </span>
        )}
      </span>
    </HoverTooltip>
  )
}
