import { useMemo, useState } from 'react'
import { Compass } from 'lucide-react'
import { useTopSpeed } from '../../../hooks/useStaticData'
import { CoursingRadarSvg } from './CoursingRadarSvg'
import { CriteriaMetricRow } from './CriteriaMetricRow'
import { CriteriaSpeedBar } from './CriteriaSpeedBar'
import {
  computeDogSpeedBreedComparison,
  extractDogRacingSpeed,
  formatSpeedInsight,
  hasLastRoundSpeedBenchmark,
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
  const hasRoundsComparison = Boolean(criteria.run2_avg && criteria.breed_last_avg)
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

  const isRoundsMode = effectiveMode === 'rounds' && Boolean(criteria.run2_avg && criteria.breed_last_avg)
  const primaryTuple = isRoundsMode ? criteria.run2_avg! : criteria.dog_avg
  const secondaryTuple = isRoundsMode ? criteria.breed_last_avg! : criteria.breed_avg
  const isGlobalBaseline = isRoundsMode
    ? Boolean(criteria.is_last_global_baseline)
    : Boolean(criteria.is_global_baseline)

  const secondaryLabel = isRoundsMode
    ? isGlobalBaseline
      ? 'Посл. раунд (все породы)'
      : 'Посл. раунд породы'
    : isGlobalBaseline
      ? 'Среднее по всем породам'
      : 'Среднее по породе'
  const radarPrimaryLabel = 'Собака'
  const radarSecondaryLabel = isGlobalBaseline ? 'Все породы' : 'Порода'

  const insight = useMemo(() => buildCriteriaInsights(criteria, effectiveMode), [criteria, effectiveMode])

  const sectionTitle = speedComparison
    ? 'Критерии курсинга и скорость'
    : 'Критерии курсинга'
  const showSpeedInsight =
    speedComparison !== null &&
    (!isRoundsMode || hasLastRoundSpeedBenchmark(speedComparison))

  return (
    <section
      aria-labelledby="coursing-criteria-heading"
      className="overflow-hidden rounded-xl border border-forest-200 bg-white"
    >
      {/* Фирменная кремовая шапка-плашка с кнопками в стиле cs-glass-pill */}
      <div className="donino-column-plaque relative flex min-h-10 flex-wrap items-center justify-between gap-2 border-b border-[rgba(195,168,128,0.55)] bg-cream-100/90 px-3.5 py-1.5">
        <div className="inline-flex min-w-0 items-center gap-1.5">
          <Compass className="h-3.5 w-3.5 shrink-0 text-camel-700" strokeWidth={1.9} aria-hidden />
          <h2
            id="coursing-criteria-heading"
            className="text-xs font-bold text-camel-800 truncate"
          >
            {sectionTitle}
          </h2>
        </div>

        {hasRoundsComparison && (
          <div
            role="tablist"
            aria-label="Режим сравнения критериев"
            className="inline-flex items-center gap-1 shrink-0"
          >
            <button
              type="button"
              role="tab"
              aria-selected={effectiveMode === 'breed'}
              onClick={() => setMode('breed')}
              className={`inline-flex items-center justify-center h-7 px-2.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap touch-manipulation active:scale-95 ${
                effectiveMode === 'breed'
                  ? 'cs-glass-pill-active text-camel-950'
                  : 'cs-glass-pill text-charcoal-700 hover:text-camel-900'
              }`}
            >
              Общий зачёт
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={effectiveMode === 'rounds'}
              onClick={() => setMode('rounds')}
              className={`inline-flex items-center justify-center h-7 px-2.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap touch-manipulation active:scale-95 ${
                effectiveMode === 'rounds'
                  ? 'cs-glass-pill-active text-camel-950'
                  : 'cs-glass-pill text-charcoal-700 hover:text-camel-900'
              }`}
            >
              Последний раунд
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

        <div className="flex flex-col justify-between min-w-0 gap-3">
          <div className="space-y-2.5 sm:space-y-3 my-auto min-w-0">
            {COURSING_CRITERIA_ITEMS.map((item, idx) => {
              const val = primaryTuple[idx]
              const refVal = secondaryTuple[idx]
              const delta = val - refVal
              const fillPct = Math.max(0, Math.min(100, (val / 20) * 100))
              const refPct = Math.max(0, Math.min(100, (refVal / 20) * 100))

              return (
                <CriteriaMetricRow
                  key={item.key}
                  badgeKey={item.key}
                  label={item.label}
                  title={item.summary}
                  fillPct={fillPct}
                  tickPct={refPct}
                  tickTooltip={`${secondaryLabel}: ${refVal.toFixed(1)} / 20`}
                  valueText={val.toFixed(1)}
                  unitText="/ 20"
                  deltaText={formatDelta(delta)}
                  deltaToneClass={deltaToneClass(delta)}
                />
              )
            })}

            {speedComparison && (
              <CriteriaSpeedBar comparison={speedComparison} mode={effectiveMode} />
            )}
          </div>

          {/* Компактная строка выводов: курсинг слева, скорость в бегах справа */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border border-old-money-200/80 bg-cream-50/60 px-3 py-1.5 text-xs text-charcoal-700">
            <span>
              Сильная сторона:{' '}
              <strong className="font-semibold text-charcoal-900">
                {insight.strongestLabel} ({insight.strongestScore.toFixed(1)}
                {insight.strongestDelta >= 0.1
                  ? `, +${insight.strongestDelta.toFixed(1)} ${isGlobalBaseline ? 'к среднему' : 'к породе'}`
                  : ''}
                )
              </strong>
            </span>
            {showSpeedInsight && speedComparison && (
              <span className="sm:text-right">
                {!isRoundsMode && speedComparison.kind === 'best' ? 'Лучшая скорость:' : 'Скорость в бегах:'}{' '}
                <strong className="font-semibold text-charcoal-900">
                  {formatSpeedInsight(speedComparison, effectiveMode)}
                </strong>
              </span>
            )}
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}
