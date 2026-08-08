import { bibColorStyle, bibTextClass, normalizeBibColorName } from '../utils'
import HoverTooltip from '../../../../components/ui/HoverTooltip'

const BIB_LABELS: Record<string, string> = {
  red: 'Красная попона',
  white: 'Белая попона',
  blue: 'Голубая попона',
  black: 'Чёрная попона',
}

interface PoponaCellProps {
  number?: number | string | null
  color?: string | null
  /** Slightly smaller for dense coursing heat headers */
  compact?: boolean
}

/** Ячейка попоны как в протоколе: цветной фон + цифра */
export default function PoponaCell({ number, color, compact = false }: PoponaCellProps) {
  if (number == null && !color) {
    return <span className="text-old-money-400">—</span>
  }

  const normalized = normalizeBibColorName(color ?? undefined)
  const colorTitle = normalized ? (BIB_LABELS[normalized] || normalized) : undefined
  const title =
    number != null && colorTitle
      ? `Номер забега ${number} · ${colorTitle}`
      : number != null
        ? `Номер забега ${number}`
        : colorTitle
  const sizeClass = compact
    ? 'min-h-[1.5rem] min-w-[1.75rem] text-xs'
    : 'min-h-[2rem] min-w-[2.25rem] text-sm'

  return (
    <HoverTooltip label={title} placement="top" variant="site" delayMs={0} portal>
      <span
        className={`inline-flex items-center justify-center rounded font-bold shadow-sm cursor-help ${sizeClass} ${normalized ? bibTextClass(normalized) : 'text-charcoal-900 dark:text-charcoal-100 border border-old-money-300'}`}
        style={normalized ? bibColorStyle(normalized) : undefined}
      >
        {number ?? '—'}
      </span>
    </HoverTooltip>
  )
}
