interface ProcoursingAttributionProps {
  className?: string
}

/** Указание источника данных procoursing.ru на страницах расчётов. */
export default function ProcoursingAttribution({ className = '' }: ProcoursingAttributionProps) {
  return (
    <p
      className={`text-xs text-center text-charcoal-500 dark:text-charcoal-400 ${className}`.trim()}
    >
      Расчёты на основе данных{' '}
      <a
        href="http://procoursing.ru/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-camel-700 underline-offset-2 hover:text-camel-800 hover:underline dark:text-camel-400 dark:hover:text-camel-300"
      >
        procoursing.ru
      </a>
    </p>
  )
}
