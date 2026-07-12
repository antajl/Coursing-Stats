interface RKFAttributionProps {
  className?: string
}

/** Указание источника данных lc.rkfshow.ru на страницах выставок. */
export default function RKFAttribution({ className = '' }: RKFAttributionProps) {
  return (
    <p
      className={`text-xs text-center text-charcoal-500 dark:text-charcoal-400 ${className}`.trim()}
    >
      Данные с сайта{' '}
      <a
        href="https://lc.rkfshow.ru/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-camel-700 underline-offset-2 hover:text-camel-800 hover:underline dark:text-camel-400 dark:hover:text-camel-300"
      >
        lc.rkfshow.ru
      </a>
    </p>
  )
}
