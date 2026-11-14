import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import {
  formatJudgeDisplayName,
  getSportJudgeStrictnessBadge,
} from '../lib/judgeUiUtils'

export interface JudgeCardData {
  id: string
  name: string
  full_name?: string
  city?: string
  role?: string
  categories?: string[]
  verified?: boolean
  notes?: string
  total_evaluations_count?: number
  unique_events?: number
  unique_dogs?: number
  avg_score?: number | null
  unique_breeds?: number
  unique_disciplines?: number
  disciplines?: string[]
  top_breeds?: string[]
  first_year?: number
  last_year?: number
  years_active?: string
}

export interface JudgeCardProps {
  judge: JudgeCardData
  filterYear?: string
  filterDiscipline?: string
  filterBreed?: string
  variant?: 'embedded' | 'card'
}

const DISCIPLINE_TAGS: Record<string, { label: string; badgeClass: string }> = {
  coursing: {
    label: 'Курсинг',
    badgeClass: 'bg-forest-50/90 text-forest-800 border-forest-200/90',
  },
  bzmp: {
    label: 'БЗМП',
    badgeClass: 'bg-blue-50/90 text-blue-800 border-blue-200/90',
  },
  racing: {
    label: 'Рейсинг',
    badgeClass: 'bg-rose-50/90 text-rose-800 border-rose-200/90',
  },
}

function formatYearsActive(years: string): string {
  if (!years) return ''
  if (years.includes('–') || years.includes('-') || years.includes(',')) {
    return `${years} гг.`
  }
  return `${years} г.`
}

function formatRunsCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return `${count.toLocaleString('ru-RU')} забегов`
  if (mod10 === 1) return `${count.toLocaleString('ru-RU')} забег`
  if (mod10 >= 2 && mod10 <= 4) return `${count.toLocaleString('ru-RU')} забега`
  return `${count.toLocaleString('ru-RU')} забегов`
}

function formatBreedsCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return 'пород'
  if (mod10 === 1) return 'порода'
  if (mod10 >= 2 && mod10 <= 4) return 'породы'
  return 'пород'
}

export default function JudgeCard({
  judge,
  filterYear,
  filterDiscipline,
  filterBreed,
  variant = 'embedded',
}: JudgeCardProps) {
  const displayName = formatJudgeDisplayName(judge.name)
  const strictness = getSportJudgeStrictnessBadge(
    judge.avg_score,
    judge.total_evaluations_count,
  )
  const score100 =
    judge.avg_score != null && !Number.isNaN(judge.avg_score)
      ? `${(judge.avg_score * 5).toFixed(1)} б.`
      : '—'

  const queryParams = new URLSearchParams()
  if (filterYear) queryParams.set('year', filterYear)
  if (filterDiscipline) queryParams.set('discipline', filterDiscipline)
  if (filterBreed) queryParams.set('breed', filterBreed)
  const queryStr = queryParams.toString()
  const linkTo = `/judges/${encodeURIComponent(judge.id)}${queryStr ? '?' + queryStr : ''}`

  const judgeDisciplines =
    Array.isArray(judge.disciplines) && judge.disciplines.length > 0
      ? judge.disciplines
      : ['coursing']

  const totalBreeds = judge.unique_breeds || 0
  const yearsActiveLabel = judge.years_active ? formatYearsActive(judge.years_active) : ''
  const disciplinesText = judgeDisciplines
    .map((d) => DISCIPLINE_TAGS[d]?.label || d)
    .join(', ')

  const isEmbedded = variant === 'embedded'
  const shellClass = isEmbedded
    ? 'group relative flex items-center w-full min-w-0 border-0 bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 transition-colors duration-150 hover:bg-camel-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camel-500/60 min-h-[44px]'
    : 'group relative flex items-center w-full min-w-0 rounded-xl sm:rounded-2xl border border-old-money-200/80 bg-white px-3 sm:px-3.5 py-2.5 sm:py-3 transition-all duration-150 hover:border-camel-400 hover:bg-cream-50/70 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camel-500/60 min-h-[44px]'

  return (
    <Link to={linkTo} className={shellClass}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] items-center gap-3 sm:gap-5 w-full py-0.5">
        {/* Колонка 1: Судья (Имя + Специализация + Породы) */}
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-sm sm:text-base font-bold leading-snug text-charcoal-900 group-hover:text-camel-800 transition-colors truncate">
              {displayName}
            </h3>
            {/* На мобильных бейдж строгости рядом с именем */}
            <span
              className={`inline-flex md:hidden items-center gap-1 rounded-full border px-2 py-0.25 text-[9.5px] font-medium tracking-tight shrink-0 ${strictness.badgeClass}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${strictness.dotClass}`} />
              <span>{strictness.label}</span>
            </span>
          </div>

          <div className="text-[11.5px] sm:text-xs text-charcoal-500 font-medium truncate mt-0.5">
            <span>{disciplinesText}</span>
            {totalBreeds > 0 && (
              <>
                <span className="text-old-money-400 mx-1.5 font-bold" aria-hidden="true">·</span>
                <span>{totalBreeds} {formatBreedsCount(totalBreeds)}</span>
              </>
            )}
          </div>

          {/* На мобильных (< md) стаж и забеги */}
          <div className="flex md:hidden items-center gap-1.5 text-[10.5px] text-charcoal-600 font-medium mt-1">
            {yearsActiveLabel && <span>{yearsActiveLabel}</span>}
            {typeof judge.total_evaluations_count === 'number' && judge.total_evaluations_count > 0 && (
              <>
                <span className="text-old-money-400">·</span>
                <span>{formatRunsCount(judge.total_evaluations_count)}</span>
              </>
            )}
          </div>
        </div>

        {/* Колонка 2 (Десктоп): Стиль и опыт (Бейдж строгости + Стаж + Забеги) */}
        <div className="hidden md:flex flex-col justify-center min-w-0 pl-4 lg:pl-5 border-l border-old-money-200/60 text-left">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={`inline-flex items-center justify-center gap-1 rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium tracking-tight shrink-0 ${strictness.badgeClass}`}
              title={strictness.detail}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${strictness.dotClass}`} />
              <span>{strictness.label}</span>
            </span>
            {yearsActiveLabel && (
              <span className="text-xs font-semibold text-charcoal-800 truncate">
                {yearsActiveLabel}
              </span>
            )}
          </div>

          {typeof judge.total_evaluations_count === 'number' && judge.total_evaluations_count > 0 && (
            <div className="text-xs text-charcoal-600 font-medium mt-1 truncate">
              {formatRunsCount(judge.total_evaluations_count)}
            </div>
          )}
        </div>

        {/* Колонка 3: Метрики (Турниры, Собаки, Ср. балл) */}
        <div className="shrink-0 flex items-center gap-2 sm:gap-3 pl-3 sm:pl-4 border-l border-old-money-200/60 ml-auto">
          {/* Десктопные плашки метрик (>= sm) */}
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
            {/* Турниров */}
            <div
              className="flex flex-col items-center justify-center w-[4.5rem] shrink-0 rounded-lg bg-cream-100/70 border border-old-money-200/50 px-1 py-1 text-center group-hover:bg-white group-hover:border-camel-300 transition-colors"
              title={`${judge.unique_events || 0} турниров в официальных протоколах`}
            >
              <span className="text-[9px] uppercase tracking-wider text-charcoal-500 font-medium">Турниров</span>
              <span className="text-sm font-bold tabular-nums text-charcoal-900">
                {judge.unique_events || 0}
              </span>
            </div>

            {/* Собак */}
            <div
              className="flex flex-col items-center justify-center w-[4.5rem] shrink-0 rounded-lg bg-cream-100/70 border border-old-money-200/50 px-1 py-1 text-center group-hover:bg-white group-hover:border-camel-300 transition-colors"
              title={`${(judge.unique_dogs || 0).toLocaleString('ru-RU')} уникальных собак`}
            >
              <span className="text-[9px] uppercase tracking-wider text-charcoal-500 font-medium">Собак</span>
              <span className="text-sm font-bold tabular-nums text-camel-800">
                {(judge.unique_dogs || 0).toLocaleString('ru-RU')}
              </span>
            </div>

            {/* Ср. балл */}
            <div
              className="flex flex-col items-center justify-center w-[4.5rem] shrink-0 rounded-lg bg-cream-100/70 border border-old-money-200/50 px-1 py-1 text-center group-hover:bg-white group-hover:border-camel-300 transition-colors"
              title={strictness.detail}
            >
              <span className="text-[9px] uppercase tracking-wider text-charcoal-500 font-medium">Ср. балл</span>
              <span className={`text-sm font-bold tabular-nums ${strictness.textClass}`}>
                {score100}
              </span>
            </div>
          </div>

          {/* Мобильный вертикальный стек (< sm) */}
          <div className="flex sm:hidden flex-col items-end justify-center gap-0.5 min-w-[4.5rem]">
            <div className="flex items-center gap-1 text-[11px] leading-tight">
              <span className="text-[9.5px] text-charcoal-500 font-normal">Турниров:</span>
              <strong className="font-bold tabular-nums text-charcoal-900 text-xs">
                {judge.unique_events || 0}
              </strong>
            </div>
            <div className="flex items-center gap-1 text-[11px] leading-tight">
              <span className="text-[9.5px] text-charcoal-500 font-normal">Собак:</span>
              <strong className="font-bold tabular-nums text-camel-800 text-xs">
                {(judge.unique_dogs || 0).toLocaleString('ru-RU')}
              </strong>
            </div>
            <div className="flex items-center gap-1 text-[11px] leading-tight">
              <span className="text-[9.5px] text-charcoal-500 font-normal">Ср. балл:</span>
              <strong className={`font-bold tabular-nums text-xs ${strictness.textClass}`}>
                {score100}
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
