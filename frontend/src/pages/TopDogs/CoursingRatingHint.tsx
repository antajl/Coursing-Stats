import { Info } from 'lucide-react'
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
    <p className="text-[12px] font-semibold leading-tight text-charcoal-900">
      Как рассчитывается зачёт сезона
    </p>

    <ol className="list-decimal space-y-1.5 pl-4 text-[11px] leading-snug text-charcoal-700">
      <li>
        <strong>Медали</strong> — первичный критерий (золото ценнее серебра и бронзы). При одинаковом наборе
        наград выше тот, кто собрал его за <strong>меньшее</strong> число участий (выше эффективность).
      </li>
      <li>
        Индекс <strong>CS</strong> используется при равных результатах по медалям. Учитывает стабильность и
        максимальные оценки судей за технику бега (курсинг / БЗМП).
      </li>
    </ol>

    <div className="space-y-1.5 border-t border-old-money-200/80 pt-2 text-[11px] leading-snug text-charcoal-700">
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

const UNIFIED_TOOLTIP_CONTENT = (
  <div className="max-w-[22rem] space-y-3 p-1">
    <div>
      <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900 border-b border-old-money-200 pb-1.5 mb-2">
        <Info className="h-4 w-4 text-camel-700 shrink-0" aria-hidden />
        <span>Зачёт сезона и статус данных</span>
      </div>

      <p className="text-[11px] font-semibold text-camel-800 uppercase tracking-wider mb-1">
        Как рассчитывается зачёт
      </p>
      <ol className="list-decimal space-y-1 pl-4 text-[11px] leading-snug text-charcoal-700">
        <li>
          <strong>Медали</strong> — первичный критерий (золото ценнее серебра и бронзы). При равенстве наград выше собака с <strong>меньшим</strong> числом стартов.
        </li>
        <li>
          <strong>Индекс CS</strong> — средняя судейская оценка за технику бега (разрешает ничьи по медалям).
        </li>
        <li>
          <strong>Elo</strong> — сила соперников в забегах (на место в зачёте не влияет).
        </li>
      </ol>
    </div>

    <div className="rounded-lg bg-old-money-100/70 p-2.5 border border-old-money-200/90 text-[11px] leading-relaxed text-charcoal-700 space-y-1">
      <div className="font-semibold text-charcoal-900 flex items-center gap-1 text-[11px]">
        <span>Общественный независимый архив</span>
      </div>
      <p>
        Статистика формируется на основе опубликованных протоколов соревнований и архивов ProCoursing.ru.
      </p>
      <p className="text-[10px] text-charcoal-500 leading-normal">
        Сведения могут содержать ошибки или быть неполными из-за фрагментарности открытых источников и ручного ведения ранних баз организаторами. Проект не является официальным сайтом РКФ.
      </p>
    </div>
  </div>
)

interface CoursingRatingHintProps {
  embedded?: boolean
  as?: 'button' | 'span'
  variant?: 'default' | 'unified'
}

/** Иконка или бейдж ⓘ у заголовка зачёта сезона. */
export default function CoursingRatingHint({
  embedded = false,
  as = 'button',
  variant = 'default',
}: CoursingRatingHintProps) {
  const Tag = as

  if (variant === 'unified') {
    return (
      <HoverTooltip label={UNIFIED_TOOLTIP_CONTENT} placement="bottom" variant="site" interactive portal>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-old-money-300/90 bg-cream-50/90 px-2.5 py-0.5 text-xs font-semibold text-charcoal-800 shadow-2xs hover:border-camel-500 hover:bg-cream-100 hover:text-charcoal-900 transition-all cursor-pointer"
          aria-label="О зачёте и открытых данных"
        >
          <Info className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
          <span className="hidden sm:inline">О зачёте и источниках</span>
          <span className="sm:hidden">О зачёте</span>
        </button>
      </HoverTooltip>
    )
  }

  return (
    <HoverTooltip label={TOOLTIP_CONTENT} placement="bottom" variant="site" interactive portal>
      <Tag
        {...(as === 'button' ? { type: 'button' as const } : {})}
        className={
          embedded
            ? 'inline-flex h-5 w-5 items-center justify-center rounded text-old-money-600 hover:text-charcoal-800'
            : 'inline-flex items-center justify-center rounded p-1 text-charcoal-500 hover:text-charcoal-800'
        }
        aria-label="Как считается рейтинг"
      >
        <RatingFormulaIcon />
      </Tag>
    </HoverTooltip>
  )
}
