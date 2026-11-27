import { useMemo, useState } from 'react'
import { Compass } from 'lucide-react'
import { useTopSpeed } from '../../../hooks/useStaticData'
import { CoursingRadarSvg } from './CoursingRadarSvg'
import { CriteriaBenchmarkTick } from './CriteriaBenchmarkTick'
import { CriteriaSpeedBar } from './CriteriaSpeedBar'
import {
  computeDogSpeedBreedComparison,
  extractDogRacingSpeed,
} from './coursingSpeedBenchmark'
import {
  COURSING_CRITERIA_ITEMS,
  buildCriteriaInsights,
  type CriteriaCompareMode,
  type DogCoursingCriteriaSummary,
} from './coursingCriteriaTypes'

interface DogCoursingCriteriaSectionProps {
  criteria: DogCoursingCriteriaSummary
  breed: string
  dogName?: string
  dogId?: string | number
  racingStats?: Record<string, unknown> | null
}

function formatDelta(delta: number): string {
  const rounded = Math.round(delta * 10) / 10
  if (rounded > 0) return `+${rounded.toFixed(1)}`
  if (rounded < 0) return rounded.toFixed(1)
  return '0.0'
}

function deltaToneClass(delta: number): string {
  if (delta >= 0.2) return 'text-forest-700'
  if (delta <= -0.2) return 'text-rose-700'
  return 'text-charcoal-500'
}

export function DogCoursingCriteriaSection({
  criteria,
  breed,
  dogId,
  racingStats,
}: DogCoursingCriteriaSectionProps) {
  const hasRoundsComparison = Boolean(criteria.run1_avg && criteria.run2_avg)
  const [mode, setMode] = useState<CriteriaCompareMode>('breed')
  const effectiveMode: CriteriaCompareMode =
    mode === 'rounds' && hasRoundsComparison ? 'rounds' : 'breed'

  const hasRacingSpeed = useMemo(
    () => extractDogRacingSpeed(racingStats) !== null,
    [racingStats],
  )
  const { data: topSpeedRes } = useTopSpeed('all', { enabled: hasRacingSpeed })
  const speedComparison = useMemo(
    () =>
      computeDogSpeedBreedComparison({
        racingStats,
        breed,
        dogId,
        items: topSpeedRes?.data?.items,
      }),
    [racingStats, breed, dogId, topSpeedRes?.data?.items],
  )

  const primaryTuple =
    effectiveMode === 'rounds' && criteria.run2_avg
      ? criteria.run2_avg
      : criteria.dog_avg

  const secondaryTuple =
    effectiveMode === 'rounds' && criteria.run1_avg
      ? criteria.run1_avg
      : criteria.breed_avg

  const secondaryLabel =
    effectiveMode === 'rounds'
      ? '1-й круг'
      : criteria.is_global_baseline
        ? 'Среднее по всем породам'
        : 'Среднее по породе'
  const radarPrimaryLabel = effectiveMode === 'rounds' ? '2-й круг' : 'Собака'
  const radarSecondaryLabel =
    effectiveMode === 'rounds'
      ? '1-й круг'
      : criteria.is_global_baseline
        ? 'Все породы'
        : 'Порода'

  const insight = useMemo(() => buildCriteriaInsights(criteria, breed), [criteria, breed])

  const sectionTitle = speedComparison
    ? 'Критерии курсинга и скорость'
    : 'Критерии курсинга'

  return (
    <section
      aria-labelledby="coursing-criteria-heading"
      className="overflow-hidden rounded-xl border border-forest-200 bg-white"
    >
      {/* Фирменная кремовая шапка-плашка в едином стиле со всеми блоками профиля */}
      <div className="donino-column-plaque relative flex min-h-10 flex-wrap items-center justify-between gap-2 border-b border-[rgba(195,168,128,0.55)] bg-cream-100/90 px-3.5 py-1">
        <div className="inline-flex min-w-0 items-center gap-1.5">
          <Compass className="h-3.5 w-3.5 shrink-0 text-camel-700" strokeWidth={1.9} aria-hidden />
          <h2
            id="coursing-criteria-heading"
            className="text-xs font-bold uppercase tracking-wider text-camel-800 truncate"
          >
            {sectionTitle}
          </h2>
        </div>

        {hasRoundsComparison && (
          <div
            role="tablist"
            aria-label="Режим сравнения критериев"
            className="inline-flex items-center rounded-full border border-old-money-200/90 bg-white/80 p-0.5 gap-0.5 shadow-2xs"
          >
            <button
              type="button"
              role="tab"
              aria-selected={effectiveMode === 'breed'}
              onClick={() => setMode('breed')}
              className={`min-h-[32px] sm:min-h-[26px] rounded-full px-2.5 text-[11px] font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap touch-manipulation ${
                effectiveMode === 'breed'
                  ? 'cs-glass-pill-active !font-semibold !text-camel-950 shadow-2xs'
                  : 'text-charcoal-600 hover:text-charcoal-950 hover:bg-cream-200/60'
              }`}
            >
              К породе
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={effectiveMode === 'rounds'}
              onClick={() => setMode('rounds')}
              className={`min-h-[32px] sm:min-h-[26px] rounded-full px-2.5 text-[11px] font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap touch-manipulation ${
                effectiveMode === 'rounds'
                  ? 'cs-glass-pill-active !font-semibold !text-camel-950 shadow-2xs'
                  : 'text-charcoal-600 hover:text-charcoal-950 hover:bg-cream-200/60'
              }`}
            >
              1-й vs 2-й круг
            </button>
          </div>
        )}
      </div>

      {/* Сетка: слева крупный радар в едином фрейме, справа 5/6 шкал + компактный итог */}
      <div className="p-3.5 sm:p-4">
        <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-[328px_minmax(0,1fr)] lg:gap-4">
        <CoursingRadarSvg
          primary={primaryTuple}
          secondary={secondaryTuple}
          primaryLabel={radarPrimaryLabel}
          secondaryLabel={radarSecondaryLabel}
        />

        <div className="flex flex-col justify-between min-w-0 gap-2.5">
          <div className="space-y-1.5 min-w-0">
            {COURSING_CRITERIA_ITEMS.map((item, idx) => {
              const val = primaryTuple[idx]
              const refVal = secondaryTuple[idx]
              const delta = val - refVal
              const fillPct = Math.max(0, Math.min(100, (val / 20) * 100))
              const refPct = Math.max(0, Math.min(100, (refVal / 20) * 100))

              return (
                <div key={item.key} className="space-y-0.5">
                  <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                    <div className="flex min-w-0 items-center gap-2" title={item.summary}>
                      <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-md border border-forest-200/80 bg-forest-50 font-mono text-[11px] font-bold text-forest-800">
                        {item.key}
                      </span>
                      <span className="truncate font-medium text-charcoal-800">
                        {item.label}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-baseline gap-2 font-mono tabular-nums">
                      <span className="text-sm font-bold text-charcoal-900">
                        {val.toFixed(1)}
                        <span className="text-[11px] font-normal text-charcoal-400"> / 20</span>
                      </span>
                      <span className={`w-11 text-right text-xs font-semibold ${deltaToneClass(delta)}`}>
                        {formatDelta(delta)}
                      </span>
                    </div>
                  </div>

                  {/* Спокойная шкала прогресса с отметкой уровня сравнения */}
                  <div className="relative h-2 w-full rounded-full bg-sand-100">
                    <div
                      className="h-full rounded-full bg-forest-600/80 transition-[width] duration-300"
                      style={{ width: `${fillPct.toFixed(1)}%` }}
                    />
                    <CriteriaBenchmarkTick
                      percent={refPct}
                      label={`${secondaryLabel}: ${refVal.toFixed(1)} / 20`}
                    />
                  </div>
                </div>
              )
            })}

            {speedComparison && (
              <CriteriaSpeedBar comparison={speedComparison} mode={effectiveMode} />
            )}
          </div>

          {/* Компактная строка выводов прямо под шкалами */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-lg border border-old-money-200/80 bg-cream-50/60 px-3 py-1.5 text-xs text-charcoal-700">
            <span>
              Сильная сторона:{' '}
              <strong className="font-semibold text-charcoal-900">
                {insight.strongestLabel} ({insight.strongestScore.toFixed(1)}
                {insight.strongestDelta >= 0.1
                  ? `, +${insight.strongestDelta.toFixed(1)} ${criteria.is_global_baseline ? 'к среднему' : 'к породе'}`
                  : ''}
                )
              </strong>
            </span>
            {insight.roundNote && (
              <>
                <span className="hidden sm:inline text-old-money-300 select-none">·</span>
                <span className="text-charcoal-600">{insight.roundNote}</span>
              </>
            )}
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}
