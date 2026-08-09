import HoverTooltip from '../../components/ui/HoverTooltip'

function RatingFormulaIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="shrink-0 text-current"
    >
      <circle cx="6.5" cy="6.5" r="5.25" stroke="currentColor" strokeWidth="1.1" opacity="0.85" />
      <circle cx="6.5" cy="4.1" r="0.65" fill="currentColor" />
      <path d="M6.5 5.6v3.1" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
    </svg>
  )
}

const TOOLTIP_CONTENT = (
  <div className="max-w-[20rem] space-y-2.5">
    <p className="text-[12px] font-semibold leading-tight text-charcoal-900 dark:text-charcoal-50">
      Как рассчитывается зачёт сезона
    </p>

    <ol className="list-decimal space-y-1.5 pl-4 text-[11px] leading-snug text-charcoal-700 dark:text-charcoal-200">
      <li>
        <strong>Медали</strong> — первичный критерий (золото ценнее серебра и бронзы). При одинаковом наборе
        наград выше тот, кто собрал его за <strong>меньшее</strong> число участий (выше эффективность).
      </li>
      <li>
        Индекс <strong>CS</strong> используется при равных результатах по медалям. Учитывает стабильность и
        максимальные оценки судей за технику бега (курсинг / БЗМП).
      </li>
    </ol>

    <div className="space-y-1.5 border-t border-old-money-200/80 pt-2 text-[11px] leading-snug text-charcoal-700 dark:border-charcoal-600 dark:text-charcoal-200">
      <p>
        <strong>CS</strong> — средняя оценка судей с учётом пиковых результатов и опыта. Используется для
        разрешения ничьих при равных медалях.
      </p>
      <p>
        <strong>Elo</strong> — рейтинг силы собаки на основе уровня её соперников в забегах. На место в зачёте
        не влияет.
      </p>
    </div>
  </div>
)

/** Иконка ⓘ у заголовка зачёта сезона. */
export default function CoursingRatingHint({ embedded = false }: { embedded?: boolean }) {
  return (
    <HoverTooltip label={TOOLTIP_CONTENT} placement="bottom" variant="site" interactive portal>
      <button
        type="button"
        className={
          embedded
            ? 'inline-flex h-5 w-5 items-center justify-center rounded text-old-money-600 hover:text-charcoal-800 dark:text-charcoal-400 dark:hover:text-charcoal-200'
            : 'inline-flex items-center justify-center rounded p-1 text-charcoal-500 hover:text-charcoal-800 dark:text-charcoal-400'
        }
        aria-label="Как считается рейтинг"
      >
        <RatingFormulaIcon />
      </button>
    </HoverTooltip>
  )
}

