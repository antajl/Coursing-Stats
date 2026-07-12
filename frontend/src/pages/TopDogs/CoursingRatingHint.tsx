import { Link } from 'react-router-dom'
import HoverTooltip from '../../components/ui/HoverTooltip'
import {
  COURSING_RATING_PEAK_BONUS_MAX,
  COURSING_RATING_STARTS_CAP,
} from '../../../../backend/lib/rating/coursing-rating-score'

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

const peakBonus = `+${COURSING_RATING_PEAK_BONUS_MAX.toFixed(1).replace('.', ',')}`
const startsBonus = `+${COURSING_RATING_STARTS_CAP.toFixed(0)}`

const TOOLTIP_CONTENT = (
  <div className="space-y-2.5">
    <p className="text-[12px] font-semibold leading-tight text-charcoal-900 dark:text-charcoal-50">
      Как считается рейтинг «по очкам»
    </p>

    <div className="flex flex-wrap items-center gap-1 rounded-md border border-old-money-200/80 bg-white/70 px-2 py-1.5 text-[10px] dark:border-charcoal-600 dark:bg-charcoal-900/40">
      <span className="font-medium text-charcoal-700 dark:text-charcoal-200">средняя оценка судей</span>
      <span className="text-camel-600 dark:text-camel-400">+</span>
      <span className="font-medium text-charcoal-700 dark:text-charcoal-200">лучший результат</span>
      <span className="text-camel-600 dark:text-camel-400">+</span>
      <span className="font-medium text-charcoal-700 dark:text-charcoal-200">опыт (старты)</span>
    </div>

    <p className="text-[11px] leading-snug text-charcoal-600 dark:text-charcoal-300">
      Курсинг и БЗМП считаются вместе. При малом числе выездов средняя слегка снижается — один удачный день не
      обгоняет стабильную карьеру.
    </p>

    <ul className="space-y-1 text-[11px] text-charcoal-700 dark:text-charcoal-200">
      <li className="flex items-baseline gap-2">
        <span className="w-7 shrink-0 font-mono text-[11px] font-bold tabular-nums text-camel-700 dark:text-camel-400">
          {peakBonus}
        </span>
        <span>за лучший результат выше средней</span>
      </li>
      <li className="flex items-baseline gap-2">
        <span className="w-7 shrink-0 font-mono text-[11px] font-bold tabular-nums text-camel-700 dark:text-camel-400">
          {startsBonus}
        </span>
        <span>за опыт (число стартов)</span>
      </li>
    </ul>

    <p className="border-t border-old-money-200/80 pt-2 text-[10px] leading-snug text-charcoal-500 dark:border-charcoal-600 dark:text-charcoal-400">
      Сумма из протокола на место в списке не влияет.{' '}
      <Link
        to="/guide?tab=rating"
        className="font-medium text-camel-700 underline decoration-camel-400/60 underline-offset-2 hover:text-camel-800 dark:text-camel-400 dark:hover:text-camel-300"
      >
        Формула в Справочнике →
      </Link>
    </p>
  </div>
)

/** Иконка ⓘ внутри переключателя «очки». */
export default function CoursingRatingHint({ embedded = false }: { embedded?: boolean }) {
  return (
    <HoverTooltip label={TOOLTIP_CONTENT} placement="bottom" variant="site" interactive>
      <button
        type="button"
        aria-label="Как считается рейтинг по очкам"
        onClick={(e) => e.stopPropagation()}
        className={
          embedded
            ? 'inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-sm text-camel-600/80 transition-colors hover:bg-old-money-300/35 hover:text-camel-700 dark:text-camel-400/80 dark:hover:bg-charcoal-500/50 dark:hover:text-camel-300'
            : 'inline-flex h-5 w-5 shrink-0 cursor-help items-center justify-center rounded hover:bg-old-money-200/60 dark:hover:bg-charcoal-600/80'
        }
      >
        <RatingFormulaIcon size={embedded ? 11 : 13} />
      </button>
    </HoverTooltip>
  )
}
