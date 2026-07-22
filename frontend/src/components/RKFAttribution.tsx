interface RKFAttributionProps {
  className?: string
}

/** Указание источника данных lc.rkfshow.ru на страницах выставок. */
export default function RKFAttribution({ className = '' }: RKFAttributionProps) {
  return (
    <p
      className={`shrink-0 text-[11px] text-charcoal-500 dark:text-charcoal-400 ${className}`.trim()}
    >
      Источник:{' '}
      <a
        href="https://lc.rkfshow.ru/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-camel-700 underline-offset-2 hover:text-camel-800 hover:underline dark:text-camel-400 dark:hover:text-camel-300"
      >
        Портал РКФ
      </a>
    </p>
  )
}
