import type { DogCoursingCriteriaSummary } from '../../CoursingCriteria/coursingCriteriaTypes'
import {
  COURSING_CRITERIA_ITEMS,
  buildCriteriaInsights,
} from '../../CoursingCriteria/coursingCriteriaTypes'
import { CoursingRadarSvg } from '../../CoursingCriteria/CoursingRadarSvg'
import {
  formatSpeedInsight,
  type DogSpeedBreedComparison,
} from '../../CoursingCriteria/coursingSpeedBenchmark'
import type { PassportFormat } from './passportTypes'

interface PassportCriteriaBlockProps {
  criteria: DogCoursingCriteriaSummary
  breed?: string
  speedComparison?: DogSpeedBreedComparison | null
  format: PassportFormat
}

function formatSignedDelta(delta: number): string {
  const rounded = Math.round(delta * 10) / 10
  if (rounded > 0) return `+${rounded.toFixed(1)}`
  if (rounded < 0) return rounded.toFixed(1)
  return '0.0'
}

function deltaToneHex(delta: number, threshold = 0.2): string {
  if (delta >= threshold) return '#15803d'
  if (delta <= -threshold) return '#be123c'
  return '#78716c'
}

export function PassportCriteriaBlock({
  criteria,
  speedComparison,
  format,
}: PassportCriteriaBlockProps) {
  const insight = buildCriteriaInsights(criteria)
  const isStory = format === 'story'
  const secondaryLabel = criteria.is_global_baseline ? 'Все породы' : 'Порода'

  return (
    <div className="mt-2.5 overflow-hidden rounded-xl border border-[#C2D6C6] bg-white shadow-2xs">
      {/* Фирменная шапка-плашка в стиле сайта */}
      <div className="flex items-center justify-between gap-2 border-b border-[#D8CBB8] bg-[#F5EFE6] px-3 py-1.5">
        <span className="font-serif text-[10px] font-bold uppercase tracking-wider text-[#664619]">
          {speedComparison ? 'Критерии курсинга и скорость' : 'Критерии курсинга'}
        </span>
        <span className="text-[10px] font-medium text-[#78716C] tabular-nums">
          {criteria.events_count} сост. · {criteria.heats_count} кругов
        </span>
      </div>

      <div
        className={
          isStory
            ? 'grid grid-cols-[164px_minmax(0,1fr)] items-center gap-2.5 p-2.5'
            : 'grid grid-cols-[205px_minmax(0,1fr)] items-center gap-4 px-3.5 py-2.5'
        }
      >
        <div className="flex items-center justify-center">
          <CoursingRadarSvg
            primary={criteria.dog_avg}
            secondary={criteria.breed_avg}
            primaryLabel="Собака"
            secondaryLabel={secondaryLabel}
            embedded
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <div className={isStory ? 'space-y-1' : 'space-y-1.5'}>
            {COURSING_CRITERIA_ITEMS.map((item, idx) => {
              const val = criteria.dog_avg[idx]
              const refVal = criteria.breed_avg[idx]
              const delta = val - refVal
              const fillPct = Math.max(0, Math.min(100, (val / 20) * 100))
              const refPct = Math.max(0, Math.min(100, (refVal / 20) * 100))

              return (
                <div key={item.key} className="space-y-0.5">
                  <div className="flex items-center justify-between gap-1.5 text-[11px]">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[#C2D6C6] bg-[#F0F5F2] font-mono text-[9.5px] font-bold text-[#1F432E]">
                        {item.key}
                      </span>
                      <span className="truncate font-medium text-[#292524]">
                        {item.label}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-baseline gap-1.5 font-mono tabular-nums">
                      <span className="font-bold text-[#1C1917]">{val.toFixed(1)}</span>
                      <span
                        className="w-8 text-right text-[10px] font-semibold"
                        style={{ color: deltaToneHex(delta) }}
                      >
                        {formatSignedDelta(delta)}
                      </span>
                    </div>
                  </div>

                  <div className="relative h-1.5 w-full rounded-full bg-[#EFE9DD]">
                    <div
                      className="h-full rounded-full bg-[#38704E]"
                      style={{ width: `${fillPct.toFixed(1)}%` }}
                    />
                    <div
                      className="absolute -top-0.5 h-2.5 w-[2.5px] -translate-x-1/2 rounded-full bg-[#7D5B28]"
                      style={{ left: `${refPct.toFixed(1)}%` }}
                    />
                  </div>
                </div>
              )
            })}

            {speedComparison && (
              <div className="space-y-0.5">
                <div className="flex items-center justify-between gap-1.5 text-[11px]">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[#C2D6C6] bg-[#F0F5F2] font-mono text-[9.5px] font-bold text-[#1F432E]">
                      С
                    </span>
                    <span className="truncate font-medium text-[#292524]">
                      {isStory ? 'Скорость' : 'Скорость в бегах'}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-baseline gap-1.5 font-mono tabular-nums">
                    <span className="font-bold text-[#1C1917]">
                      {speedComparison.dogSpeed.toFixed(1)}
                      <span className="text-[9px] font-normal text-[#78716C]"> км/ч</span>
                    </span>
                    <span
                      className="w-8 text-right text-[10px] font-semibold"
                      style={{ color: deltaToneHex(speedComparison.delta, 0.3) }}
                    >
                      {formatSignedDelta(speedComparison.delta)}
                    </span>
                  </div>
                </div>

                <div className="relative h-1.5 w-full rounded-full bg-[#EFE9DD]">
                  <div
                    className="h-full rounded-full bg-[#38704E]"
                    style={{ width: `${speedComparison.fillPct.toFixed(1)}%` }}
                  />
                  <div
                    className="absolute -top-0.5 h-2.5 w-[2.5px] -translate-x-1/2 rounded-full bg-[#7D5B28]"
                    style={{ left: `${speedComparison.breedMarkerPct.toFixed(1)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 border-t border-[#EFE9DD] pt-1 text-[10px] text-[#57534E] leading-tight">
            <span>
              Сильная сторона:{' '}
              <strong className="font-semibold text-[#1C1917]">
                {insight.strongestLabel} ({insight.strongestScore.toFixed(1)}
                {insight.strongestDelta >= 0.1
                  ? `, +${insight.strongestDelta.toFixed(1)} ${criteria.is_global_baseline ? 'к среднему' : 'к породе'}`
                  : ''}
                )
              </strong>
            </span>
            {speedComparison && (
              <span>
                · {speedComparison.kind === 'best' ? 'Лучшая скорость:' : 'Скорость в бегах:'}{' '}
                <strong className="font-semibold text-[#1C1917]">
                  {formatSpeedInsight(speedComparison)}
                </strong>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
