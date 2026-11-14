import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { formatBreedSentenceCase } from '../lib/breedMapping'
import {
  formatJudgeDisplayName,
  getJudgeInitials,
  getSportJudgeStrictnessBadge,
} from '../lib/judgeUiUtils'

export interface JudgeCardData {
  id: string
  name: string
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

export default function JudgeCard({
  judge,
  filterYear,
  filterDiscipline,
  filterBreed,
  variant = 'embedded',
}: JudgeCardProps) {
  const displayName = formatJudgeDisplayName(judge.name)
  const initials = getJudgeInitials(displayName)
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

  const chips = (judge.top_breeds || []).slice(0, 3)
  const totalBreeds = judge.unique_breeds || 0
  const extraBreeds = Math.max(0, totalBreeds - chips.length)

  const isEmbedded = variant === 'embedded'
  const shellClass = isEmbedded
    ? 'group relative flex items-center w-full min-w-0 border-0 bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 transition-colors duration-150 hover:bg-camel-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camel-500/60 min-h-[44px]'
    : 'group relative flex items-center w-full min-w-0 rounded-2xl border border-old-money-200/90 bg-white px-3 sm:px-4 py-2.5 sm:py-3 transition-colors duration-150 hover:border-camel-300 hover:bg-cream-50/70 hover:shadow-xs min-h-[44px]'

  return (
    <Link to={linkTo} className={shellClass}>
      {/* 1. Монограмма-аватар судьи */}
      <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl border border-old-money-200/80 bg-gradient-to-br from-cream-100 via-cream-50 to-amber-50/40 text-xs sm:text-sm font-bold tracking-tight text-camel-800 shadow-2xs group-hover:border-camel-400 group-hover:scale-105 transition-all mr-2.5 sm:mr-3.5">
        {initials}
      </div>

      {/* 2. Центральный блок: ФИО, строгость, стаж, дисциплины и топ-породы */}
      <div className="min-w-0 flex-1 flex flex-col justify-center gap-1 sm:gap-1.5 py-0.5">
        {/* Строка 1: Имя + Строгость + Стаж */}
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
              title="Период судейской практики в официальных протоколах"
            >
              {judge.years_active} гг.
            </span>
          )}
        </div>

        {/* Строка 2: Дисциплины судейства + Топ пород */}
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {/* Плашки дисциплин (Курсинг, БЗМП, Рейсинг) */}
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

          {/* Топ судимых пород */}
          {chips.length > 0 && (
            <div className="flex items-center gap-1 min-w-0 overflow-hidden">
              {chips.map((breed) => (
                <span
                  key={breed}
                  className="max-w-[8.5rem] sm:max-w-[11rem] truncate rounded-md border border-old-money-200/70 bg-cream-50/90 px-1.5 py-0.25 text-[9.5px] sm:text-[10px] font-medium text-charcoal-700 shrink-0"
                >
                  {formatBreedSentenceCase(breed)}
                </span>
              ))}
              {extraBreeds > 0 && (
                <span className="text-[9.5px] sm:text-[10px] tabular-nums text-charcoal-400 shrink-0">
                  +{extraBreeds}
                </span>
              )}
            </div>
          )}

          {/* Мобильная сводка турниров/собак */}
          <div className="sm:hidden flex items-center gap-1 text-[10px] text-charcoal-500 shrink-0 ml-auto">
            <span>{judge.unique_events || 0} сост.</span>
            <span>·</span>
            <span>{judge.unique_dogs || 0} соб.</span>
          </div>
        </div>
      </div>

      {/* 3. Правый блок ключевой статистики */}
      <div className="shrink-0 flex items-center gap-2 sm:gap-3 border-l border-old-money-200/40 pl-2.5 sm:pl-3.5 ml-2 sm:ml-3">
        {/* Десктопные плашки метрик (>= sm) */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Забегов */}
          <div className="flex flex-col items-center justify-center min-w-[4.25rem] rounded-xl bg-cream-100/90 border border-old-money-200/60 px-2.5 py-1 text-center group-hover:bg-white group-hover:border-camel-300 transition-colors">
            <span className="text-[9px] uppercase tracking-wider text-charcoal-500 font-medium">Забегов</span>
            <span className="text-sm font-bold tabular-nums text-charcoal-900">
              {(judge.total_evaluations_count || 0).toLocaleString('ru-RU')}
            </span>
          </div>

          {/* Ср. балл */}
          <div className="flex flex-col items-center justify-center min-w-[4.25rem] rounded-xl bg-cream-100/90 border border-old-money-200/60 px-2.5 py-1 text-center group-hover:bg-white group-hover:border-camel-300 transition-colors">
            <span className="text-[9px] uppercase tracking-wider text-charcoal-500 font-medium">Ср. балл</span>
            <span className={`text-sm font-bold tabular-nums ${strictness.textClass}`}>
              {score100}
            </span>
          </div>

          {/* Турниров */}
          <div className="flex flex-col items-center justify-center min-w-[4rem] rounded-xl bg-cream-100/90 border border-old-money-200/60 px-2.5 py-1 text-center group-hover:bg-white group-hover:border-camel-300 transition-colors">
            <span className="text-[9px] uppercase tracking-wider text-charcoal-500 font-medium">Турниров</span>
            <span className="text-sm font-bold tabular-nums text-camel-800">
              {judge.unique_events || 0}
            </span>
          </div>
        </div>

        {/* Мобильный вертикальный стек (< sm) */}
        <div className="flex sm:hidden flex-col items-end justify-center gap-0.5 min-w-[4.5rem]">
          <div className="flex items-center gap-1 text-[11px] leading-tight">
            <span className="text-[9.5px] text-charcoal-500 font-normal">Забегов:</span>
            <strong className="font-bold tabular-nums text-charcoal-900 text-xs">
              {(judge.total_evaluations_count || 0).toLocaleString('ru-RU')}
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
