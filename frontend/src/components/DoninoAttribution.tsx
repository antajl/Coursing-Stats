interface DoninoAttributionProps {
  className?: string
}

/** Указание источника данных полигона Курсинг Донино. */
export default function DoninoAttribution({ className = '' }: DoninoAttributionProps) {
  return (
    <p
      className={`shrink-0 text-[11px] text-charcoal-500 dark:text-charcoal-400 ${className}`.trim()}
    >
      Источник:{' '}
      <a
        href="https://runningdog.ru/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-camel-700 underline-offset-2 hover:text-camel-800 hover:underline dark:text-camel-400 dark:hover:text-camel-300"
      >
        Курсинг Донино
      </a>
    </p>
  )
}
