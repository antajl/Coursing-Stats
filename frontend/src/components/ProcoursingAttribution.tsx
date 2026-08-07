interface ProcoursingAttributionProps {
  className?: string
  /** inline = toolbar trailing; footnote = small corner chip */
  variant?: 'inline' | 'footnote'
}

const FOOTNOTE_CHIP =
  'inline-flex items-center gap-1.5 rounded-tr-2xl rounded-bl-md border border-t-0 border-r-0 border-old-money-200/80 bg-cream-100/95 px-2.5 py-1 text-[10px] leading-tight text-charcoal-500 shadow-sm dark:border-charcoal-600 dark:bg-charcoal-800/80 dark:text-charcoal-400'

/** Указание источника данных procoursing.ru на страницах расчётов. */
export default function ProcoursingAttribution({
  className = '',
  variant = 'inline',
}: ProcoursingAttributionProps) {
  const base =
    variant === 'footnote'
      ? FOOTNOTE_CHIP
      : 'inline-flex items-center gap-1.5 shrink-0 text-[11px] text-charcoal-500 dark:text-charcoal-400'

  return (
    <p className={`${base} ${className}`.trim()}>
      <span>Источник:</span>
      <a
        href="http://procoursing.ru/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-camel-700 underline-offset-2 hover:text-camel-800 hover:underline dark:text-camel-400 dark:hover:text-camel-300"
      >
        Procoursing
      </a>
    </p>
  )
}
