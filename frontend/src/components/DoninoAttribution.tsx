interface DoninoAttributionProps {
  className?: string
}

/** Указание источника данных полигона Курсинг Донино. */
export default function DoninoAttribution({ className = '' }: DoninoAttributionProps) {
  return (
    <p
      className={`text-xs text-center text-charcoal-500 dark:text-charcoal-400 ${className}`.trim()}
    >
      Расчёты на основе данных{' '}
      <a
        href="https://runningdog.ru/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-camel-700 underline-offset-2 hover:text-camel-800 hover:underline dark:text-camel-400 dark:hover:text-camel-300"
      >
        Курсинг Донино
      </a>
    </p>
  )
}
