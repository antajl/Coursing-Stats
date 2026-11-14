import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import RankBadge from './RankBadge'
import { TOP3_WASH } from './DogCard/DogCardHelpers'
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
}

export interface JudgeCardProps {
  judge: JudgeCardData
  rank?: number
  filterYear?: string
  filterDiscipline?: string
  variant?: 'embedded' | 'card'
}

export default function JudgeCard({
  judge,
  rank,
  filterYear,
  filterDiscipline,
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
  const queryStr = queryParams.toString()
  const linkTo = `/judges/${encodeURIComponent(judge.id)}${queryStr ? '?' + queryStr : ''}`

  const isTop3 = rank != null && rank > 0 && rank <= 3
  const top3Wash = isTop3 ? TOP3_WASH[rank as 1 | 2 | 3] : ''

  const isEmbedded = variant === 'embedded'
  const shellClass = isEmbedded
    ? `group relative flex items-center w-full min-w-0 border-0 bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 transition-colors duration-150 hover:bg-camel-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camel-500/60 min-h-[44px] ${top3Wash}`.trim()
    : `group relative flex items-center w-full min-w-0 rounded-2xl border border-old-money-200/90 bg-white px-3 sm:px-4 py-2.5 sm:py-3 transition-colors duration-150 hover:border-camel-300 hover:bg-cream-50/70 hover:shadow-xs min-h-[44px] ${top3Wash}`.trim()

  return (
    <Link to={linkTo} className={shellClass}>
      {/* 1. Позиция в рейтинге (Rank badge) */}
      {rank != null && rank > 0 && (
        <div className="flex min-h-0 min-w-[2.25rem] sm:min-w-[2.75rem] pr-1.5 sm:pr-2.5 mr-1.5 sm:mr-2.5 shrink-0 flex-col items-center justify-center border-r border-old-money-200/40 self-stretch">
          <RankBadge rank={rank} />
        </div>
      )}

      {/* 2. Монограмма-аватар */}
      <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-old-money-200/80 bg-gradient-to-br from-cream-100 via-cream-50 to-amber-50/40 text-xs sm:text-sm font-bold tracking-tight text-camel-800 shadow-2xs group-hover:border-camel-400 group-hover:scale-105 transition-all mr-2.5 sm:mr-3.5">
        {initials}
      </div>

      {/* 3. Центральный блок: ФИО, строгость и контекстная сводка */}
      <div className="min-w-0 flex-1 flex flex-col justify-center gap-0.5 sm:gap-1">
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
        </div>

        {/* Контекстные метрики: турниры, породы, собаки, дисциплины */}
        <div className="flex items-center gap-1.5 text-[11px] sm:text-[11.5px] text-charcoal-600 font-medium truncate">
          <span className="truncate">
            <span className="text-charcoal-500 font-normal">Турниров: </span>
            <strong className="font-semibold text-charcoal-900 tabular-nums">{judge.unique_events || 0}</strong>
          </span>
          <span className="text-charcoal-300 shrink-0" aria-hidden>·</span>
          <span className="truncate">
            <span className="text-charcoal-500 font-normal">Пород: </span>
            <strong className="font-semibold text-charcoal-900 tabular-nums">{judge.unique_breeds || 0}</strong>
          </span>
          {typeof judge.unique_dogs === 'number' && judge.unique_dogs > 0 && (
            <>
              <span className="text-charcoal-300 shrink-0 hidden sm:inline" aria-hidden>·</span>
              <span className="truncate hidden sm:inline">
                <span className="text-charcoal-500 font-normal">Собак: </span>
                <strong className="font-semibold text-charcoal-900 tabular-nums">{judge.unique_dogs}</strong>
              </span>
            </>
          )}
          {judge.unique_disciplines && judge.unique_disciplines > 1 ? (
            <>
              <span className="text-charcoal-300 shrink-0 hidden md:inline" aria-hidden>·</span>
              <span className="hidden md:inline-flex items-center px-1.5 py-0.25 rounded text-[9.5px] font-semibold bg-camel-100/80 text-camel-950 border border-camel-300/60">
                {judge.unique_disciplines} дисц.
              </span>
            </>
          ) : null}
        </div>
      </div>

      {/* 4. Правый блок статистики (Забегов, Ср. балл + стрелка перехода) */}
      <div className="shrink-0 flex items-center gap-2 sm:gap-3 border-l border-old-money-200/40 pl-2.5 sm:pl-3.5 ml-2 sm:ml-3">
        {/* Десктопные плашки метрик (>= sm) */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Забегов */}
          <div className="flex flex-col items-center justify-center min-w-[4.25rem] rounded-xl bg-cream-100/90 border border-old-money-200/60 px-2.5 py-1 text-center group-hover:bg-white group-hover:border-camel-300 transition-colors">
            <span className="text-[9px] uppercase tracking-wider text-charcoal-500 font-medium">Забегов</span>
            <span className="text-sm font-bold tabular-nums text-camel-800">
              {(judge.total_evaluations_count || 0).toLocaleString('ru-RU')}
            </span>
          </div>

          {/* Средний балл */}
          <div className="flex flex-col items-center justify-center min-w-[4.25rem] rounded-xl bg-cream-100/90 border border-old-money-200/60 px-2.5 py-1 text-center group-hover:bg-white group-hover:border-camel-300 transition-colors">
            <span className="text-[9px] uppercase tracking-wider text-charcoal-500 font-medium">Ср. балл</span>
            <span className={`text-sm font-bold tabular-nums ${strictness.textClass}`}>
              {score100}
            </span>
          </div>
        </div>

        {/* Мобильный вертикальный стек (< sm) */}
        <div className="flex sm:hidden flex-col items-end justify-center gap-0.5 min-w-[4.5rem]">
          <div className="flex items-center gap-1 text-[11px] leading-tight">
            <span className="text-[9.5px] text-charcoal-500 font-normal">Забегов:</span>
            <strong className="font-bold tabular-nums text-camel-800 text-xs">
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
