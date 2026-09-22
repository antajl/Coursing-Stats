interface DoninoAttributionProps {
  className?: string
  /** inline = toolbar trailing; footnote = small corner chip */
  variant?: 'inline' | 'footnote'
}

const FOOTNOTE_CHIP =
  'inline-flex items-center gap-1.5 rounded-tr-2xl rounded-bl-md border border-t-0 border-r-0 border-old-money-200/80 bg-cream-100/95 px-2.5 py-1 text-[10px] leading-tight text-charcoal-500 shadow-sm'

/** Указание источника данных полигона Курсинг Донино. */
export default function DoninoAttribution({
  className = '',
  variant = 'inline',
}: DoninoAttributionProps) {
  const base =
    variant === 'footnote'
      ? FOOTNOTE_CHIP
      : 'shrink-0 text-[11px] text-charcoal-500'

  return (
    <p className={`${base} ${className}`.trim()}>
      {variant === 'footnote' ? <span>Источник:</span> : <>Источник: </>}
      <a
        href="https://runningdog.ru/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-camel-700 underline-offset-2 hover:text-camel-800 hover:underline"
      >
        Курсинг Донино
      </a>
    </p>
  )
}
