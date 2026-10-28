import { Info, Award, Zap, BarChart2, FileText } from 'lucide-react'
import ModernDropdown from '../../components/ui/ModernDropdown'
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

/** Содержимое модального окна «О рейтинге» */
export const RATING_MODAL_CONTENT = (
  <div className="p-3.5 space-y-3 text-charcoal-800">
    <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900 border-b border-old-money-200/80 pb-2">
      <Info className="h-4 w-4 text-camel-700 shrink-0" aria-hidden />
      <span>Как устроен рейтинг сезона</span>
    </div>

    <div className="space-y-2.5 text-xs">
      <div className="flex items-start gap-2.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-300/80 shadow-2xs">
          1
        </span>
        <div className="leading-tight">
          <div className="flex items-center gap-1 font-semibold text-charcoal-900">
            <Award className="h-3.5 w-3.5 text-amber-600 shrink-0" aria-hidden />
            <span>Медали (главный критерий)</span>
          </div>
          <p className="text-[11px] text-charcoal-600 mt-0.5 leading-snug">
            Золото ценнее серебра и бронзы. При равенстве наград выше собака с <strong>меньшим</strong> числом забегов.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-camel-100 text-camel-900 text-[11px] font-bold border border-camel-300/80 shadow-2xs">
          2
        </span>
        <div className="leading-tight">
          <div className="flex items-center gap-1 font-semibold text-charcoal-900">
            <Zap className="h-3.5 w-3.5 text-camel-600 shrink-0" aria-hidden />
            <span>Индекс CS (тай-брейкер)</span>
          </div>
          <p className="text-[11px] text-charcoal-600 mt-0.5 leading-snug">
            Средняя судейская оценка за технику забегов. Разрешает ничьи при одинаковых медалях.
          </p>
        </div>
      </div>
    </div>

    <div className="border-t border-old-money-200/80 pt-2.5 mt-2.5 text-[10px] sm:text-[10.5px] leading-relaxed text-charcoal-500 flex items-start gap-1.5">
      <FileText className="h-3.5 w-3.5 text-camel-700/80 shrink-0 mt-0.5" aria-hidden />
      <p>
        <strong className="text-charcoal-700 font-medium">Примечание:</strong> спортивная статистика и результаты состязаний систематизированы на основе официальных протоколов организаторов, полевых секретариатов и материалов ProCoursing.ru. Сведения могут содержать ошибки или быть неполными из-за фрагментарности открытых источников и ручного ведения ранних баз организаторами.
      </p>
    </div>
  </div>
)

const TOOLTIP_CONTENT = (
  <div className="max-w-[20rem] space-y-2.5">
    <p className="text-[12px] font-semibold leading-tight text-charcoal-900">
      Как рассчитывается зачёт сезона
    </p>

    <ol className="list-decimal space-y-1.5 pl-4 text-[11px] leading-snug text-charcoal-700">
      <li>
        <strong>Медали</strong> — первичный критерий (золото ценнее серебра и бронзы). При одинаковом наборе
        наград выше тот, кто собрал его за <strong>меньшее</strong> число забегов (выше эффективность).
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
      <ModernDropdown
        closeOnScroll
        trigger={
          <button
            type="button"
            className="relative inline-flex h-8 w-8 sm:w-auto shrink-0 items-center justify-center gap-1.5 rounded-full border border-old-money-300/80 bg-cream-50 sm:px-2.5 text-xs font-semibold text-charcoal-800 hover:border-camel-500 hover:bg-cream-100 hover:text-charcoal-900 transition-all cursor-pointer shadow-2xs before:absolute before:-inset-1.5 before:content-[''] sm:before:hidden"
            aria-label="О рейтинге и источниках данных"
            title="О рейтинге и источниках данных"
          >
            <Info className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-camel-700 shrink-0" aria-hidden />
            <span className="hidden sm:inline">О рейтинге</span>
          </button>
        }
        width="340px"
        portal
      >
        {RATING_MODAL_CONTENT}
      </ModernDropdown>
    )
  }

  return (
    <HoverTooltip label={TOOLTIP_CONTENT} placement="bottom" variant="site" interactive portal>
      <Tag
        {...(as === 'button' ? { type: 'button' as const } : {})}
        className={
          embedded
            ? 'cursor-help text-charcoal-500 hover:text-charcoal-800 transition-colors p-0.5 -m-0.5 rounded inline-flex items-center align-middle'
            : 'text-xs text-charcoal-500 hover:text-charcoal-800 transition-colors p-1 rounded inline-flex items-center'
        }
        aria-label="Как рассчитывается зачёт сезона"
      >
        <RatingFormulaIcon size={embedded ? 13 : 15} />
      </Tag>
    </HoverTooltip>
  )
}
