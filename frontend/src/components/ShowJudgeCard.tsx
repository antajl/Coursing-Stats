import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import {
  formatJudgeDisplayName,
  getStrictnessBadge,
  getPuppyStrictnessBadge,
} from '../lib/judgeUiUtils'
import { resolveShowJudgeNumericId } from '../lib/judgeIdMap.generated'

export type GradeScope = 'adult' | 'puppy' | 'all'

export interface ShowJudgeCardData {
  id: string
  numeric_id?: number
  name: string
  display_name?: string
  exhibitionsCount: number
  breedsCount: number
  /** 0–100, null если мало/нет данных */
  excellentPct: number | null
  graded?: number
  puppyPct?: number | null
  puppyGraded?: number
  totalDogs?: number
  city?: string
  ranks?: string
  photo_url?: string | null
}

export interface ShowJudgeCardProps {
  judge: ShowJudgeCardData
  filterYear?: string
  gradeScope?: GradeScope
  variant?: 'embedded' | 'card'
}

function formatExhibitionsCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return `${count.toLocaleString('ru-RU')} выставок`
  if (mod10 === 1) return `${count.toLocaleString('ru-RU')} выставка`
  if (mod10 >= 2 && mod10 <= 4) return `${count.toLocaleString('ru-RU')} выставки`
  return `${count.toLocaleString('ru-RU')} выставок`
}

function formatBreedsCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return 'пород'
  if (mod10 === 1) return 'порода'
  if (mod10 >= 2 && mod10 <= 4) return 'породы'
  return 'пород'
}

function formatDogsCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return `${count.toLocaleString('ru-RU')} собак`
  if (mod10 === 1) return `${count.toLocaleString('ru-RU')} собака`
  if (mod10 >= 2 && mod10 <= 4) return `${count.toLocaleString('ru-RU')} собаки`
  return `${count.toLocaleString('ru-RU')} собак`
}

function formatEvaluationsCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return `${count.toLocaleString('ru-RU')} оценок`
  if (mod10 === 1) return `${count.toLocaleString('ru-RU')} оценка`
  if (mod10 >= 2 && mod10 <= 4) return `${count.toLocaleString('ru-RU')} оценки`
  return `${count.toLocaleString('ru-RU')} оценок`
}

function formatPuppiesCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return `${count.toLocaleString('ru-RU')} щенков`
  if (mod10 === 1) return `${count.toLocaleString('ru-RU')} щенок`
  if (mod10 >= 2 && mod10 <= 4) return `${count.toLocaleString('ru-RU')} щенка`
  return `${count.toLocaleString('ru-RU')} щенков`
}

export default function ShowJudgeCard({
  judge,
  filterYear,
  gradeScope = 'adult',
  variant = 'embedded',
}: ShowJudgeCardProps) {
  const rawName = judge.display_name || judge.name
  const displayName = formatJudgeDisplayName(rawName)

  const isPuppy = gradeScope === 'puppy'
  const isAll = gradeScope === 'all'

  const adultRateFraction = judge.excellentPct != null ? judge.excellentPct / 100 : null
  const puppyRateFraction = judge.puppyPct != null ? judge.puppyPct / 100 : null

  const strictness = isPuppy
    ? getPuppyStrictnessBadge(puppyRateFraction, judge.puppyGraded)
    : getStrictnessBadge(adultRateFraction, judge.graded)

  const evaluatedCount = isPuppy
    ? (judge.puppyGraded ?? 0)
    : isAll
      ? (judge.totalDogs ?? ((judge.graded || 0) + (judge.puppyGraded || 0)))
      : (judge.graded ?? 0)

  const formattedEvaluations = isPuppy
    ? formatPuppiesCount(evaluatedCount)
    : isAll
      ? formatDogsCount(evaluatedCount)
      : formatEvaluationsCount(evaluatedCount)

  const rateValue = isPuppy ? judge.puppyPct : judge.excellentPct
  const rateLabel = isPuppy ? 'Оч. персп.' : 'Отлично'
  const dogsLabel = isPuppy ? 'Щенков' : isAll ? 'Всех собак' : 'Взрослых'

  const targetId = judge.numeric_id ?? resolveShowJudgeNumericId(judge.id) ?? encodeURIComponent(judge.id)
  const linkTo = `/shows/judges/${targetId}/${filterYear ? '?year=' + filterYear : ''}`

  const isEmbedded = variant === 'embedded'
  const shellClass = isEmbedded
    ? 'group relative flex items-center w-full min-w-0 border-0 bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 transition-colors duration-150 hover:bg-camel-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camel-500/60 min-h-[44px]'
    : 'group relative flex items-center w-full min-w-0 rounded-xl sm:rounded-2xl border border-old-money-200/80 bg-white px-3 sm:px-3.5 py-2.5 sm:py-3 transition-all duration-150 hover:border-camel-400 hover:bg-cream-50/70 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camel-500/60 min-h-[44px]'

  return (
    <Link to={linkTo} className={shellClass}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] items-center gap-3 sm:gap-5 w-full py-0.5">
        {/* Колонка 1: Судья (Имя + Город/Породы) */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {judge.photo_url && (
            <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 overflow-hidden rounded-xl border border-cream-200/90 bg-cream-50/60 shadow-2xs">
              <img
                src={judge.photo_url}
                alt={displayName}
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-[center_20%]"
                onError={(e) => {
                  const target = e.currentTarget
                  if (target.parentElement) target.parentElement.style.display = 'none'
                }}
              />
            </div>
          )}
          <div className="flex flex-col justify-center min-w-0 flex-1">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold leading-snug text-charcoal-900 group-hover:text-camel-800 transition-colors truncate">
                {displayName}
              </h3>
            </div>

            <div className="text-[11.5px] sm:text-xs text-charcoal-500 font-medium truncate mt-0.5">
              <span>{judge.breedsCount.toLocaleString('ru-RU')} {formatBreedsCount(judge.breedsCount)}</span>
            </div>

            {/* На мобильных (< md) год, число оценок и стиль судейства */}
            <div className="flex md:hidden items-center flex-wrap gap-1.5 text-[10.5px] text-charcoal-600 font-medium mt-1">
              <span>{filterYear && filterYear !== 'all' ? `${filterYear} г.` : 'Все года'}</span>
              {evaluatedCount > 0 && (
                <>
                  <span className="text-old-money-400">·</span>
                  <span>{formattedEvaluations}</span>
                </>
              )}
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.25 text-[9.5px] font-medium tracking-tight shrink-0 ml-0.5 ${strictness.badgeClass}`}
                title={strictness.detail}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${strictness.dotClass}`} />
                <span>{strictness.label}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Колонка 2 (Десктоп): Стиль и опыт (Бейдж строгости + Год + Объем оценок) */}
        <div className="hidden md:flex flex-col justify-center min-w-0 pl-4 lg:pl-5 border-l border-old-money-200/60 text-left">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={`inline-flex items-center justify-center gap-1 rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium tracking-tight shrink-0 ${strictness.badgeClass}`}
              title={strictness.detail}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${strictness.dotClass}`} />
              <span>{strictness.label}</span>
            </span>
            <span className="text-xs font-semibold text-charcoal-800 truncate">
              {filterYear && filterYear !== 'all' ? `${filterYear} г.` : 'Все года'}
            </span>
          </div>

          {evaluatedCount > 0 && (
            <div className="text-xs text-charcoal-600 font-medium mt-1 truncate">
              {formattedEvaluations}
            </div>
          )}
        </div>

        {/* Колонка 3: Метрики (Выставок, Собак, Отлично/Оч. персп.) */}
        <div className="shrink-0 flex items-center gap-2 sm:gap-3 pl-3 sm:pl-4 border-l border-old-money-200/60 ml-auto">
          {/* Десктопные плашки метрик (>= sm) */}
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
            {/* Выставок */}
            <div
              className="flex flex-col items-center justify-center w-[4.5rem] shrink-0 rounded-lg bg-cream-100/70 border border-old-money-200/50 px-1 py-1 text-center group-hover:bg-white group-hover:border-camel-300 transition-colors"
              title={`${judge.exhibitionsCount} выставок в каталогах РКФ`}
            >
              <span className="text-[9px] uppercase tracking-wider text-charcoal-500 font-medium">Выставок</span>
              <span className="text-sm font-bold tabular-nums text-charcoal-900">
                {judge.exhibitionsCount}
              </span>
            </div>

            {/* Собак / Щенков */}
            <div
              className="flex flex-col items-center justify-center w-[4.5rem] shrink-0 rounded-lg bg-cream-100/70 border border-old-money-200/50 px-1 py-1 text-center group-hover:bg-white group-hover:border-camel-300 transition-colors"
              title={`${evaluatedCount.toLocaleString('ru-RU')} в каталогах`}
            >
              <span className="text-[9px] uppercase tracking-wider text-charcoal-500 font-medium">{dogsLabel}</span>
              <span className="text-sm font-bold tabular-nums text-camel-800">
                {evaluatedCount.toLocaleString('ru-RU')}
              </span>
            </div>

            {/* Отлично / Оч. персп. */}
            <div
              className="flex flex-col items-center justify-center w-[4.5rem] shrink-0 rounded-lg bg-cream-100/70 border border-old-money-200/50 px-1 py-1 text-center group-hover:bg-white group-hover:border-camel-300 transition-colors"
              title={strictness.detail}
            >
              <span className="text-[9px] uppercase tracking-wider text-charcoal-500 font-medium">{rateLabel}</span>
              <span className={`text-sm font-bold tabular-nums ${strictness.textClass}`}>
                {rateValue != null ? `${rateValue.toFixed(0)}%` : '—'}
              </span>
            </div>
          </div>

          {/* Мобильный вертикальный стек (< sm) */}
          <div className="flex sm:hidden flex-col items-end justify-center gap-0.5 min-w-[4.5rem]">
            <div className="flex items-center gap-1 text-[11px] leading-tight">
              <span className="text-[9.5px] text-charcoal-500 font-normal">Выставок:</span>
              <strong className="font-bold tabular-nums text-charcoal-900 text-xs">
                {judge.exhibitionsCount}
              </strong>
            </div>
            <div className="flex items-center gap-1 text-[11px] leading-tight">
              <span className="text-[9.5px] text-charcoal-500 font-normal">{dogsLabel}:</span>
              <strong className="font-bold tabular-nums text-camel-800 text-xs">
                {evaluatedCount.toLocaleString('ru-RU')}
              </strong>
            </div>
            <div className="flex items-center gap-1 text-[11px] leading-tight">
              <span className="text-[9.5px] text-charcoal-500 font-normal">{rateLabel}:</span>
              <strong className={`font-bold tabular-nums text-xs ${strictness.textClass}`}>
                {rateValue != null ? `${rateValue.toFixed(0)}%` : '—'}
              </strong>
            </div>
          </div>

          {/* Шеврон-индикатор кликабельности */}
          <ChevronRight
            className="w-4 h-4 text-charcoal-300 group-hover:text-camel-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-0.5 sm:ml-1"
            aria-hidden="true"
          />
        </div>
      </div>
    </Link>
  )
}
