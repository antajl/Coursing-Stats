import React from 'react'
import { Award, Calendar, Layers, FileText } from 'lucide-react'
import type { CriteriaStat } from './types'
import { CRITERIA_META, DISCIPLINES } from './constants'
import type { getSportJudgeStrictnessBadge } from '../../../lib/judgeUiUtils'

interface JudgeProfileHeroProps {
  displayName: string
  initials: string
  strictnessBadge: ReturnType<typeof getSportJudgeStrictnessBadge>
  yearParam: string
  setYear: (year: string) => void
  availableYears: string[]
  avgScore: number | null | undefined
  totalEvals: number
  eventCount: number
  breedCount: number
  sortedCriteria: CriteriaStat[]
  disciplineParam: string
  setDiscipline: (discipline: string) => void
  onSelectTab: (tab: 'breeds' | 'events' | 'criteria') => void
}

export const JudgeProfileHero: React.FC<JudgeProfileHeroProps> = ({
  displayName,
  initials,
  strictnessBadge,
  yearParam,
  setYear,
  availableYears,
  avgScore,
  totalEvals,
  eventCount,
  breedCount,
  sortedCriteria,
  disciplineParam,
  setDiscipline,
  onSelectTab
}) => {
  return (
    <div className="min-w-0 rounded-2xl border border-old-money-200/80 bg-white p-4 sm:p-6 md:p-8 shadow-xs">
      {/* Top Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          {/* Monogram Badge */}
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl border border-old-money-200/80 bg-gradient-to-br from-cream-100 via-cream-50 to-amber-50/50 text-xl font-bold tracking-tight text-camel-800 shadow-xs">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 rounded-md border border-camel-200/90 bg-cream-100/90 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-camel-800">
                <Award className="h-3 w-3 text-camel-600" />
                Судья соревнований РКФ
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight ${strictnessBadge.badgeClass}`}
                title={strictnessBadge.detail}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${strictnessBadge.dotClass}`} />
                {strictnessBadge.label}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-charcoal-900 sm:text-3xl line-clamp-2">
              {displayName}
            </h1>
          </div>
        </div>

        {/* Year Filter */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto pt-2 border-t border-old-money-100/70 sm:border-0 sm:pt-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 sm:hidden">
            Период:
          </span>
          <select
            id="judge-year"
            aria-label="Период"
            value={yearParam}
            onChange={(e) => setYear(e.target.value)}
            className="h-9 sm:h-10 rounded-xl border border-old-money-200 bg-white px-3 sm:px-3.5 text-xs sm:text-sm font-medium text-charcoal-800 shadow-2xs hover:border-camel-400 focus:border-camel-500 focus:outline-none focus:ring-2 focus:ring-camel-100 transition-colors"
          >
            <option value="">Все года</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary 4 Key Statistics Cards */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="flex items-center justify-between rounded-xl border border-old-money-200/80 bg-cream-50/50 p-3.5 sm:p-4 text-left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
              Средний балл
            </p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <p className={`text-2xl sm:text-3xl font-bold tabular-nums ${strictnessBadge.textClass}`}>
                {avgScore != null ? (avgScore * 5).toFixed(1) : '—'}
              </p>
              <span className="text-[11px] font-medium text-charcoal-400">/ 100 б.</span>
            </div>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream-200/60 text-camel-700">
            <Award className="h-5 w-5" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-old-money-200/80 bg-cream-50/50 p-3.5 sm:p-4 text-left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
              Листов оценок
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-bold tabular-nums text-charcoal-900">
              {totalEvals || '—'}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream-200/60 text-camel-700">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelectTab('events')}
          className="group flex items-center justify-between rounded-xl border border-old-money-200/80 bg-cream-50/50 p-3.5 sm:p-4 text-left transition-all hover:border-camel-300 hover:bg-cream-100/70 hover:shadow-2xs"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
              Соревнований
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-bold tabular-nums text-charcoal-900 group-hover:text-camel-800 transition-colors">
              {eventCount}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream-200/60 text-camel-700 group-hover:bg-camel-200/60 transition-colors">
            <Calendar className="h-5 w-5" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('breeds')}
          className="group flex items-center justify-between rounded-xl border border-old-money-200/80 bg-cream-50/50 p-3.5 sm:p-4 text-left transition-all hover:border-camel-300 hover:bg-cream-100/70 hover:shadow-2xs"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
              Пород
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-bold tabular-nums text-charcoal-900 group-hover:text-camel-800 transition-colors">
              {breedCount}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream-200/60 text-camel-700 group-hover:bg-camel-200/60 transition-colors">
            <Layers className="h-5 w-5" />
          </div>
        </button>
      </div>

      {/* Criteria Mini-Gauge Strip */}
      {sortedCriteria.length > 0 && (
        <div className="mt-6 border-t border-old-money-100 pt-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
              <span className="sm:hidden">Критерии FCI (0–20):</span>
              <span className="hidden sm:inline">Средние оценки по 5 критериям FCI (шкала 0–20):</span>
            </p>
            <button
              type="button"
              onClick={() => onSelectTab('criteria')}
              className="text-xs font-medium text-camel-700 hover:text-camel-800 hover:underline shrink-0"
            >
              Подробнее о шкале →
            </button>
          </div>

          {/* Mobile view */}
          <div className="sm:hidden rounded-xl border border-old-money-200/80 bg-cream-50/40 p-3 divide-y divide-old-money-100/70">
            {CRITERIA_META.map((meta) => {
              const match = sortedCriteria.find(
                (c) => c.name?.toLowerCase() === meta.name.toLowerCase(),
              )
              const score = match?.avg_score != null ? Number(match.avg_score) : null
              const scorePct = score != null ? Math.min(100, Math.max(0, (score / 20) * 100)) : 0
              const Icon = meta.icon

              return (
                <div
                  key={meta.id}
                  className="flex items-center justify-between gap-2.5 py-2 first:pt-0 last:pb-0"
                >
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-700 w-32 shrink-0">
                    <Icon className="h-3.5 w-3.5 text-camel-600 shrink-0" />
                    {meta.name}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-old-money-100">
                    <div
                      className={`h-full rounded-full ${meta.color} transition-all duration-500`}
                      style={{ width: `${scorePct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-bold tabular-nums text-charcoal-900 shrink-0">
                    {score != null ? score.toFixed(1) : '—'}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Desktop/Tablet view */}
          <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {CRITERIA_META.map((meta) => {
              const match = sortedCriteria.find(
                (c) => c.name?.toLowerCase() === meta.name.toLowerCase(),
              )
              const score = match?.avg_score != null ? Number(match.avg_score) : null
              const scorePct = score != null ? Math.min(100, Math.max(0, (score / 20) * 100)) : 0
              const Icon = meta.icon

              return (
                <div
                  key={meta.id}
                  className="rounded-xl border border-old-money-200/70 bg-cream-50/40 p-2.5 transition-colors hover:border-camel-300 hover:bg-cream-50"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="inline-flex items-center gap-1 font-medium text-charcoal-700">
                      <Icon className="h-3.5 w-3.5 text-camel-600" />
                      {meta.name}
                    </span>
                    <span className="font-bold tabular-nums text-charcoal-900">
                      {score != null ? score.toFixed(1) : '—'}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-old-money-100">
                    <div
                      className={`h-full rounded-full ${meta.color} transition-all duration-500`}
                      style={{ width: `${scorePct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Disciplines filter pills */}
      <div className="mt-5 border-t border-old-money-100 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 shrink-0">
            Дисциплина:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {DISCIPLINES.map(({ value, label }) => {
              const active = disciplineParam === value
              return (
                <button
                  key={value || 'all'}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setDiscipline(value)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? 'border border-camel-500 bg-camel-600 text-white shadow-2xs'
                      : 'border border-old-money-200 bg-white text-charcoal-700 hover:border-camel-300 hover:bg-cream-50'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
