import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Award, Layers, Calendar, CheckCircle2, MapPin, Maximize2, X, ExternalLink } from 'lucide-react'
import JudgeYearDropdown from '../../../components/ui/JudgeYearDropdown'
import type { GradeScope } from '../../../components/ShowJudgeCard'
import {
  GRADE_TILES,
  type GradeFilterKey,
  type StrictnessVerdict,
} from './judgeDetailAggregates'
import { formatJudgeDisplayName, getStrictnessBadge, getPuppyStrictnessBadge } from '../../../lib/judgeUiUtils'

type PeriodStrictness = {
  graded: number
  excellent_rate: number | null
}

const DEFAULT_GRADE_ACCENT = {
  dot: 'bg-charcoal-400',
  border: 'border-charcoal-200/80',
  activeBorder: 'border-charcoal-600',
  activeBg: 'bg-cream-100',
}

const GRADE_ACCENTS: Record<
  string,
  { dot: string; border: string; activeBorder: string; activeBg: string }
> = {
  excellent: {
    dot: 'bg-emerald-500',
    border: 'border-emerald-200/80',
    activeBorder: 'border-emerald-600',
    activeBg: 'bg-emerald-50',
  },
  very_good: {
    dot: 'bg-sky-500',
    border: 'border-sky-200/80',
    activeBorder: 'border-sky-600',
    activeBg: 'bg-sky-50',
  },
  good: {
    dot: 'bg-amber-500',
    border: 'border-amber-200/80',
    activeBorder: 'border-amber-600',
    activeBg: 'bg-amber-50',
  },
  satisfactory: {
    dot: 'bg-orange-500',
    border: 'border-orange-200/80',
    activeBorder: 'border-orange-600',
    activeBg: 'bg-orange-50',
  },
  very_promising: {
    dot: 'bg-teal-500',
    border: 'border-teal-200/80',
    activeBorder: 'border-teal-600',
    activeBg: 'bg-teal-50',
  },
  promising: {
    dot: 'bg-cyan-500',
    border: 'border-cyan-200/80',
    activeBorder: 'border-cyan-600',
    activeBg: 'bg-cyan-50',
  },
  dq: {
    dot: 'bg-rose-500',
    border: 'border-rose-200/80',
    activeBorder: 'border-rose-600',
    activeBg: 'bg-rose-50',
  },
  without_evaluation: {
    dot: 'bg-charcoal-400',
    border: 'border-charcoal-200/80',
    activeBorder: 'border-charcoal-600',
    activeBg: 'bg-cream-100',
  },
  absent: {
    dot: 'bg-charcoal-300',
    border: 'border-charcoal-200/60',
    activeBorder: 'border-charcoal-500',
    activeBg: 'bg-cream-100',
  },
}

export function JudgeDetailHeader({
  judgeName,
  yearParam,
  availableYears,
  onYearChange,
  gradeScope,
  onGradeScopeChange,
  periodExhibitionCount,
  periodBreedCount,
  periodGrades,
  periodStrictness,
  periodPuppyStrictness,
  puppyPct,
  gradeFilter,
  hasGrades,
  hasPerExhibitionGrades,
  excellentPct,
  sitePct,
  baselineExcellentRate,
  strictnessVerdict,
  onSelectExhibitions,
  onSelectBreeds,
  onToggleGrade,
  city,
  ranks,
  certNumber,
  photoUrl,
  konuraUrl,
}: {
  judgeName: string
  yearParam: string
  availableYears: string[]
  onYearChange: (year: string) => void
  gradeScope: GradeScope
  onGradeScopeChange: (scope: GradeScope) => void
  city?: string
  ranks?: string
  certNumber?: number
  photoUrl?: string | null
  konuraUrl?: string | null
  periodExhibitionCount: number
  periodBreedCount: number
  periodGrades: Record<GradeFilterKey, number>
  periodStrictness: PeriodStrictness
  periodPuppyStrictness: { puppyGraded: number; puppyRate: number | null }
  puppyPct: string | null
  gradeFilter: GradeFilterKey | null
  hasGrades: boolean
  hasPerExhibitionGrades: boolean
  excellentPct: string | null
  sitePct: string | null
  baselineExcellentRate: number | null
  strictnessVerdict: StrictnessVerdict | null
  onSelectExhibitions: () => void
  onSelectBreeds: () => void
  onToggleGrade: (key: GradeFilterKey) => void
}) {
  const [isPhotoOpen, setIsPhotoOpen] = useState(false)

  useEffect(() => {
    if (!isPhotoOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPhotoOpen(false)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPhotoOpen])

  const displayName = formatJudgeDisplayName(judgeName)
  const strictnessBadge = getStrictnessBadge(
    periodStrictness.excellent_rate,
    periodStrictness.graded,
  )
  const puppyStrictnessBadge = getPuppyStrictnessBadge(
    periodPuppyStrictness.puppyRate,
    periodPuppyStrictness.puppyGraded,
  )

  const judgePctNumber =
    periodStrictness.excellent_rate != null
      ? periodStrictness.excellent_rate * 100
      : null
  const sitePctNumber =
    baselineExcellentRate != null ? baselineExcellentRate * 100 : null

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Карточка профиля судьи: фото, имя, реестровые данные РКФ и стиль экспертизы */}
      <div className="min-w-0 rounded-2xl border border-old-money-200/90 bg-white p-4 sm:p-5 md:p-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-4 sm:gap-6 items-start">
          {/* Left: Avatar + Details */}
          <div className="flex items-start gap-4 sm:gap-5 md:gap-6 min-w-0">
            {photoUrl && (
              <button
                type="button"
                onClick={() => setIsPhotoOpen(true)}
                className="group relative h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 shrink-0 overflow-hidden rounded-2xl border border-cream-200/90 bg-cream-50/60 shadow-xs transition-all hover:border-camel-400 hover:shadow-sm focus-visible:outline-hidden cursor-pointer"
                aria-label={`Увеличить фото ${displayName}`}
                title="Нажмите, чтобы открыть фото в полном размере"
              >
                <img
                  src={photoUrl}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-[center_20%] transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.currentTarget
                    if (target.parentElement) target.parentElement.style.display = 'none'
                  }}
                />
                <span className="pointer-events-none absolute bottom-1.5 right-1.5 rounded-md bg-charcoal-900/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-xs">
                  <Maximize2 className="h-3 w-3" aria-hidden />
                </span>
              </button>
            )}

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-charcoal-900 sm:text-3xl line-clamp-2 leading-tight">
                {displayName}
              </h1>

              {/* Ряд 1: Паспортные реестровые данные судьи (РКФ / FCI) */}
              <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-charcoal-600 font-medium">
                <span className="inline-flex items-center gap-1 font-semibold text-camel-800">
                  <Award className="h-3.5 w-3.5 text-camel-600 shrink-0" aria-hidden />
                  <span>Судья РКФ / FCI</span>
                </span>

                {city && (
                  <>
                    <span className="text-old-money-300 select-none">·</span>
                    <span className="inline-flex items-center gap-1 text-charcoal-700">
                      <MapPin className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
                      <span>{city}</span>
                    </span>
                  </>
                )}

                {certNumber && (
                  <>
                    <span className="text-old-money-300 select-none">·</span>
                    <span className="font-semibold text-charcoal-800">
                      РКФ № {certNumber}
                    </span>
                  </>
                )}

                {ranks && (
                  <>
                    <span className="text-old-money-300 select-none">·</span>
                    <span className="text-charcoal-700">
                      {ranks}
                    </span>
                  </>
                )}
              </div>

              {/* Ряд 2: Аналитические характеристики стиля судейства (строгость) */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight ${strictnessBadge.badgeClass}`}
                  title={`Взрослые классы (CAC): ${strictnessBadge.detail}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${strictnessBadge.dotClass}`} />
                  <span>{strictnessBadge.label} (взрослые)</span>
                </span>
                {periodPuppyStrictness.puppyGraded >= 15 && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight ${puppyStrictnessBadge.badgeClass}`}
                    title={`Щенки и бэби: ${puppyStrictnessBadge.detail}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${puppyStrictnessBadge.dotClass}`} />
                    <span>{puppyStrictnessBadge.label}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Year Filter */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto pt-2 border-t border-old-money-100/70 sm:border-0 sm:pt-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 sm:hidden">
              Период:
            </span>
            <JudgeYearDropdown
              value={yearParam}
              onChange={onYearChange}
              availableYears={availableYears}
            />
          </div>
        </div>
      </div>

      {/* 2. Карточка сводной статистики и аналитики судейства */}
      <div className="min-w-0 rounded-2xl border border-old-money-200/90 bg-white p-4 sm:p-5 md:p-6 shadow-xs">
        {/* Primary Key Statistics Cards (4 cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onSelectExhibitions}
          className="group flex items-center justify-between rounded-xl border border-old-money-200/80 bg-cream-50/50 p-3.5 sm:p-4 text-left transition-all hover:border-camel-300 hover:bg-cream-100/70 hover:shadow-2xs cursor-pointer"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
              Выставок
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-bold tabular-nums text-charcoal-900 group-hover:text-camel-800 transition-colors">
              {periodExhibitionCount}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream-200/60 text-camel-700 group-hover:bg-camel-200/60 transition-colors">
            <Calendar className="h-5 w-5" />
          </div>
        </button>

        <button
          type="button"
          onClick={onSelectBreeds}
          className="group flex items-center justify-between rounded-xl border border-old-money-200/80 bg-cream-50/50 p-3.5 sm:p-4 text-left transition-all hover:border-camel-300 hover:bg-cream-100/70 hover:shadow-2xs cursor-pointer"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
              Пород в экспертизе
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-bold tabular-nums text-charcoal-900 group-hover:text-camel-800 transition-colors">
              {periodBreedCount}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream-200/60 text-camel-700 group-hover:bg-camel-200/60 transition-colors">
            <Layers className="h-5 w-5" />
          </div>
        </button>

        {/* Card 3: Adult classes */}
        <button
          type="button"
          onClick={() => onGradeScopeChange(gradeScope === 'adult' ? 'all' : 'adult')}
          className={`group relative flex items-center justify-between rounded-xl border p-3.5 sm:p-4 text-left transition-all cursor-pointer ${
            gradeScope === 'adult'
              ? 'border-camel-500 bg-camel-50/80 shadow-xs ring-2 ring-camel-400/40 text-camel-950'
              : 'border-old-money-200/80 bg-cream-50/50 hover:border-camel-300 hover:bg-cream-100/70 hover:shadow-2xs'
          }`}
          title="Фильтровать по взрослым классам (CAC)"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-charcoal-600">
                Взрослые классы
              </p>
              {gradeScope === 'adult' && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-camel-600 text-white shadow-3xs leading-none">
                  Выбрано
                </span>
              )}
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <p className={`text-2xl sm:text-3xl font-bold tabular-nums ${strictnessBadge.textClass}`}>
                {excellentPct ? `${excellentPct}` : '—'}
              </p>
              <span className="text-xs text-charcoal-400 font-normal">отлично</span>
            </div>
            <p className="mt-0.5 text-xs text-charcoal-500 font-medium">
              {periodStrictness.graded > 0 ? `${periodStrictness.graded.toLocaleString('ru-RU')} оценок` : 'Нет оценок'}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream-200/60 text-camel-700 group-hover:bg-camel-200/60 transition-colors">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </button>

        {/* Card 4: Puppy & Baby classes */}
        <button
          type="button"
          onClick={() => onGradeScopeChange(gradeScope === 'puppy' ? 'all' : 'puppy')}
          className={`group relative flex items-center justify-between rounded-xl border p-3.5 sm:p-4 text-left transition-all cursor-pointer ${
            gradeScope === 'puppy'
              ? 'border-camel-500 bg-camel-50/80 shadow-xs ring-2 ring-camel-400/40 text-camel-950'
              : 'border-old-money-200/80 bg-cream-50/50 hover:border-camel-300 hover:bg-cream-100/70 hover:shadow-2xs'
          }`}
          title="Фильтровать по щенкам и бэби"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-charcoal-600">
                Щенки и бэби
              </p>
              {gradeScope === 'puppy' && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-camel-600 text-white shadow-3xs leading-none">
                  Выбрано
                </span>
              )}
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <p className={`text-2xl sm:text-3xl font-bold tabular-nums ${puppyStrictnessBadge.textClass}`}>
                {puppyPct ? `${puppyPct}` : '—'}
              </p>
              <span className="text-xs text-charcoal-400 font-normal">оч. персп.</span>
            </div>
            <p className="mt-0.5 text-xs text-charcoal-500 font-medium">
              {periodPuppyStrictness.puppyGraded > 0 ? `${periodPuppyStrictness.puppyGraded.toLocaleString('ru-RU')} щенков` : 'Нет щенков'}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream-200/60 text-camel-700 group-hover:bg-camel-200/60 transition-colors">
            <Award className="h-5 w-5" />
          </div>
        </button>
      </div>

      {/* Interactive Grade Tiles */}
      {hasGrades && (
        <div className="mt-6 border-t border-old-money-100 pt-5">
          <div className="mb-2 flex items-center justify-between text-xs text-charcoal-500">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-charcoal-400">
              Оценки по категориям:
            </span>
            <span className="text-[11px] font-medium">
              {gradeScope === 'puppy'
                ? 'Фокус: щенки и бэби'
                : gradeScope === 'adult'
                  ? 'Фокус: взрослые классы'
                  : 'Все собаки (взрослые + щенки)'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {GRADE_TILES.map(({ key, label }) => {
              const count = periodGrades[key] || 0
              const active = gradeFilter === key
              const disabled = count === 0
              const accent = GRADE_ACCENTS[key] ?? DEFAULT_GRADE_ACCENT

              const isPuppyGrade = key === 'very_promising' || key === 'promising'
              const isDimmed =
                (gradeScope === 'adult' && isPuppyGrade) ||
                (gradeScope === 'puppy' && !isPuppyGrade)

              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  aria-pressed={active}
                  title={disabled ? undefined : `Фильтр выставок: ${label}`}
                  onClick={() => onToggleGrade(key)}
                  className={`flex flex-col rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                    isDimmed ? 'opacity-40 hover:opacity-80' : ''
                  } ${
                    active
                      ? `${accent.activeBorder} ${accent.activeBg} ring-2 ring-camel-300 shadow-2xs`
                      : disabled
                        ? 'cursor-not-allowed border-transparent bg-old-money-50/50 opacity-40'
                        : `border-old-money-200/80 bg-white hover:border-camel-300 hover:bg-cream-50/50`
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
                    <span className="text-[11px] font-semibold uppercase tracking-tight text-charcoal-600">
                      {label}
                    </span>
                  </div>
                  <span className="mt-0.5 text-base font-bold tabular-nums text-charcoal-900">
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Visual Strictness Indicator Bar */}
      {periodStrictness.graded > 0 && (
        <div className="mt-6 border-t border-old-money-100 pt-5">
          {gradeScope === 'puppy' ? (
            /* Puppy strictness calibration */
            periodPuppyStrictness.puppyGraded < 15 ? (
              <p className="text-center text-sm text-charcoal-500 py-2">
                Мало данных по щенкам (нужно от 15 оценок, сейчас {periodPuppyStrictness.puppyGraded})
              </p>
            ) : (
              <div className="w-full">
                <div className="rounded-xl border border-old-money-200/80 bg-cream-50/40 p-3 sm:p-3.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-charcoal-600 mb-2">
                    <span className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${puppyStrictnessBadge.dotClass}`} />
                      Эксперт к щенкам: <strong className="text-charcoal-900">{puppyPct}</strong>
                      <span className="text-charcoal-400 font-normal">({puppyStrictnessBadge.label})</span>
                    </span>
                    <span className="text-charcoal-500">
                      В среднем по щенкам в РКФ: <strong className="text-charcoal-800">94.0%</strong>
                    </span>
                  </div>

                  <div className="relative h-2.5 overflow-hidden rounded-full bg-cream-200 border border-old-money-200/50">
                    <div className="absolute inset-0 flex">
                      <div className="w-[90%] bg-rose-100/50 border-r border-rose-200/50" title="Строгий к щенкам (<90%)" />
                      <div className="w-[5%] bg-amber-100/50 border-r border-amber-200/50" title="Умеренный к щенкам (90-95%)" />
                      <div className="w-[5%] bg-emerald-100/50" title="Лояльный к щенкам (≥95%)" />
                    </div>

                    {periodPuppyStrictness.puppyRate != null && (
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 opacity-80 ${
                          periodPuppyStrictness.puppyRate >= 0.95
                            ? 'bg-emerald-500'
                            : periodPuppyStrictness.puppyRate >= 0.9
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, periodPuppyStrictness.puppyRate * 100))}%` }}
                      />
                    )}

                    <div
                      className="absolute top-0 bottom-0 w-1 rounded-full bg-charcoal-900 shadow-sm"
                      style={{ left: '94%' }}
                      title="Среднее по РКФ для щенков: 94%"
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-[11px] font-medium text-charcoal-500">
                    <span className="text-rose-700">Строгий &lt;90%</span>
                    <span className="text-amber-700">Умеренный 90–95%</span>
                    <span className="text-emerald-700">Лояльный ≥95%</span>
                  </div>

                  <p className="mt-2.5 text-center text-xs text-charcoal-500">
                    Калибровка по щенкам и бэби: эксперт поставил «Очень перспективный» в {puppyPct} случаев ({periodPuppyStrictness.puppyGraded} щенков)
                  </p>
                </div>
              </div>
            )
          ) : (
            /* Adult CAC strictness calibration */
            periodStrictness.graded < 30 ? (
              <p className="text-center text-sm text-charcoal-500 py-2">
                Мало данных для шкалы строгости (нужно от 30 оценок, сейчас {periodStrictness.graded})
              </p>
            ) : (
              <div className="w-full">
                <div className="rounded-xl border border-old-money-200/80 bg-cream-50/40 p-3 sm:p-3.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-charcoal-600 mb-2">
                    <span className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${strictnessBadge.dotClass}`} />
                      Эксперт: <strong className="text-charcoal-900">{excellentPct}</strong>
                    </span>
                    {sitePct && (
                      <span className="text-charcoal-500">
                        В среднем по РКФ: <strong className="text-charcoal-800">{sitePct}</strong>
                      </span>
                    )}
                  </div>

                  {/* Multi-zone progress bar */}
                  <div className="relative h-2.5 overflow-hidden rounded-full bg-cream-200 border border-old-money-200/50">
                    {/* Visual zones background */}
                    <div className="absolute inset-0 flex">
                      <div className="w-[88%] bg-rose-100/50 border-r border-rose-200/50" title="Зона высокой строгости (<88%)" />
                      <div className="w-[8%] bg-amber-100/50 border-r border-amber-200/50" title="Умеренная зона (88-95%)" />
                      <div className="w-[4%] bg-emerald-100/50" title="Лояльная зона (≥96%)" />
                    </div>

                    {/* Judge's filled value */}
                    {judgePctNumber != null && (
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 opacity-80 ${
                          judgePctNumber >= 96
                            ? 'bg-emerald-500'
                            : judgePctNumber >= 88
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, judgePctNumber))}%` }}
                      />
                    )}

                    {/* Site baseline vertical tick */}
                    {sitePctNumber != null && (
                      <div
                        className="absolute top-0 bottom-0 w-1 rounded-full bg-charcoal-900 shadow-sm"
                        style={{ left: `${Math.min(100, Math.max(0, sitePctNumber))}%` }}
                        title={`Среднее по сайту: ${sitePct}`}
                      />
                    )}
                  </div>

                  <div className="mt-2 flex justify-between text-[11px] font-medium text-charcoal-500">
                    <span className="text-rose-700">Строгий &lt;88%</span>
                    <span className="text-amber-700">Умеренный 88–95%</span>
                    <span className="text-emerald-700">Лояльный ≥96%</span>
                  </div>

                  <p className="mt-2.5 text-center text-xs text-charcoal-500">
                    {strictnessVerdict?.hint ??
                      'Полоса — доля «отлично» у судьи; темная черта — среднее по выставкам'}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {yearParam && !hasPerExhibitionGrades && hasGrades && (
        <p className="mt-3 text-xs text-amber-700">
          Для фильтра оценок по году нужна пересборка индексов (`build-show-indexes`).
        </p>
      )}
      </div>

      {/* Full-size Photo Modal (Old Money portal) */}
      {isPhotoOpen && photoUrl && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 select-none animate-in fade-in duration-200"
          style={{ transform: 'translateZ(0)' }}
          onClick={() => setIsPhotoOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Фотография судьи ${displayName}`}
        >
          {/* Полноэкранный кликабельный оверлей для надежного закрытия по тапу в любом месте фона (включая iOS Safari) */}
          <button
            type="button"
            onClick={() => setIsPhotoOpen(false)}
            className="absolute inset-0 h-full w-full cursor-pointer bg-transparent border-none p-0 -z-10 focus:outline-hidden"
            aria-label="Закрыть фото"
            tabIndex={-1}
          />

          {/* Fixed close button */}
          <button
            type="button"
            onClick={() => setIsPhotoOpen(false)}
            className="fixed z-[110] flex items-center justify-center gap-1.5 rounded-full border border-white/25 bg-black/80 px-3 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-sm transition-transform active:scale-95 hover:bg-black/95 cursor-pointer min-h-[44px] min-w-[44px]"
            style={{
              top: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))',
              right: 'max(0.75rem, env(safe-area-inset-right, 0.75rem))',
            }}
            aria-label="Закрыть фото"
          >
            <X className="h-5 w-5 text-white" aria-hidden />
            <span className="hidden sm:inline">Закрыть</span>
          </button>

          <div
            className="relative max-h-[85dvh] max-w-[95vw] sm:max-w-xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Крупное портретное фото судьи */}
            <div className="overflow-hidden rounded-2xl border border-white/20 bg-charcoal-900 shadow-2xl flex items-center justify-center">
              <img
                src={photoUrl}
                alt={displayName}
                referrerPolicy="no-referrer"
                loading="eager"
                decoding="async"
                className="w-[min(88vw,320px)] sm:w-[380px] md:w-[440px] h-auto max-h-[72dvh] sm:max-h-[78dvh] object-contain select-none block"
              />
            </div>

            {/* 2-line caption: Line 1 = Judge Name, Line 2 = Photo Source */}
            <div className="mt-3.5 flex flex-col items-center text-center gap-1 w-full px-2">
              <span className="font-semibold text-base sm:text-lg text-white tracking-tight drop-shadow-sm">
                {displayName}
              </span>
              {konuraUrl && (
                <a
                  href={konuraUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-camel-300 hover:text-white transition-colors underline-offset-2 hover:underline"
                >
                  <span>Источник фото: konura.info</span>
                  <ExternalLink className="h-3.5 w-3.5 text-camel-400" aria-hidden />
                </a>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
