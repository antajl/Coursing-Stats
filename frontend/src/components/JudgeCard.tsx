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

  const isEmbedded = variant === 'embedded'
  const shellClass = isEmbedded
    ? 'group relative flex items-center w-full min-w-0 border-0 bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 transition-colors duration-150 hover:bg-camel-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camel-500/60 min-h-[44px]'
    : 'group relative flex items-center w-full min-w-0 rounded-2xl border border-old-money-200/90 bg-white px-3 sm:px-4 py-2.5 sm:py-3 transition-colors duration-150 hover:border-camel-300 hover:bg-cream-50/70 hover:shadow-xs min-h-[44px]'

  return (
    <Link to={linkTo} className={shellClass}>
      {/* 1. Центральный блок: Сокращенное имя, строгость, стаж, дисциплины и охват пород */}
      <div className="min-w-0 flex-1 flex flex-col justify-center gap-1 sm:gap-1.5 py-0.5">
        {/* Строка 1: Сокращенное имя + Строгость + Стаж и забеги */}
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <h3 className="text-xs sm:text-sm 2xl:text-[15px] font-bold leading-snug text-charcoal-900 group-hover:text-camel-800 transition-colors truncate">
            {displayName}
          </h3>

          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9.5px] sm:text-[10px] font-medium tracking-tight shrink-0 ${strictness.badgeClass}`}
            title={strictness.detail}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${strictness.dotClass}`} />
            <span>{strictness.label}</span>
          </span>

          {judge.years_active && (
            <span
              className="hidden sm:inline-flex items-center rounded-md border border-old-money-200/60 bg-cream-100/70 px-1.5 py-0.5 text-[9.5px] font-medium text-charcoal-600 shrink-0"
              title="Период судейской практики и общее количество забегов"
            >
              <span>{judge.years_active} гг.</span>
              {typeof judge.total_evaluations_count === 'number' && judge.total_evaluations_count > 0 && (
                <span className="text-charcoal-400 ml-1">
                  · {judge.total_evaluations_count.toLocaleString('ru-RU')} забегов
                </span>
              )}
            </span>
          )}
        </div>

        {/* Строка 2: Дисциплины судейства и охват пород без шума */}
        <div className="flex flex-wrap items-center gap-2 min-w-0 text-[10px]">
          {/* Плашки дисциплин */}
          <div className="inline-flex items-center gap-1 shrink-0">
            {judgeDisciplines.map((disc) => {
              const tag = DISCIPLINE_TAGS[disc]
              if (!tag) return null
              return (
                <span
                  key={disc}
                  className={`inline-flex items-center px-1.5 py-0.25 rounded text-[9.5px] sm:text-[10px] font-semibold border ${tag.badgeClass} shrink-0`}
                >
                  {tag.label}
                </span>
              )
            })}
          </div>

          {totalBreeds > 0 && (
            <>
              <span className="hidden sm:inline-block h-3 w-px bg-old-money-300/80 shrink-0" aria-hidden="true" />
              <span className="text-[10px] text-charcoal-500 font-medium shrink-0">
                {totalBreeds} {formatBreedsCount(totalBreeds)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* 3. Правый блок ключевой статистики */}
      <div className="shrink-0 flex items-center gap-2 sm:gap-3 border-l border-old-money-200/40 pl-2.5 sm:pl-3.5 ml-2 sm:ml-3">
        {/* Десктопные плашки метрик (>= sm) */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Турниров */}
          <div
            className="flex flex-col items-center justify-center min-w-[4.25rem] rounded-xl bg-cream-100/90 border border-old-money-200/60 px-2.5 py-1 text-center group-hover:bg-white group-hover:border-camel-300 transition-colors"
            title={`${judge.unique_events || 0} турниров в официальных протоколах`}
          >
            <span className="text-[9px] uppercase tracking-wider text-charcoal-500 font-medium">Турниров</span>
            <span className="text-sm font-bold tabular-nums text-charcoal-900">
              {judge.unique_events || 0}
            </span>
          </div>

          {/* Собак */}
          <div
            className="flex flex-col items-center justify-center min-w-[4.25rem] rounded-xl bg-cream-100/90 border border-old-money-200/60 px-2.5 py-1 text-center group-hover:bg-white group-hover:border-camel-300 transition-colors"
            title={`${(judge.unique_dogs || 0).toLocaleString('ru-RU')} уникальных собак`}
          >
            <span className="text-[9px] uppercase tracking-wider text-charcoal-500 font-medium">Собак</span>
            <span className="text-sm font-bold tabular-nums text-camel-800">
              {(judge.unique_dogs || 0).toLocaleString('ru-RU')}
            </span>
          </div>

          {/* Ср. балл */}
          <div
            className="flex flex-col items-center justify-center min-w-[4.25rem] rounded-xl bg-cream-100/90 border border-old-money-200/60 px-2.5 py-1 text-center group-hover:bg-white group-hover:border-camel-300 transition-colors"
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
          className="w-4 h-4 text-charcoal-300 group-hover:text-camel-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1"
          aria-hidden="true"
        />
      </div>
    </Link>
  )
}
