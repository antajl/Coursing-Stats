import type { DogSpeedBreedComparison } from './coursingSpeedBenchmark'

interface CriteriaSpeedBarProps {
  comparison: DogSpeedBreedComparison
}

function formatSignedSpeedDelta(delta: number): string {
  const rounded = Math.round(delta * 10) / 10
  if (rounded > 0) return `+${rounded.toFixed(1)}`
  if (rounded < 0) return rounded.toFixed(1)
  return '0.0'
}

function speedDeltaTone(delta: number): string {
  if (delta >= 0.3) return 'text-forest-700'
  if (delta <= -0.3) return 'text-rose-700'
  return 'text-charcoal-500'
}

/**
 * Шестая горизонтальная шкала внутри карточки критериев:
 * средняя (или лучшая) скорость в бегах относительно средней по породе.
 */
export function CriteriaSpeedBar({ comparison }: CriteriaSpeedBarProps) {
  const label = comparison.kind === 'best' ? 'Лучшая скорость в бегах' : 'Скорость в бегах'
  const tooltip = [
    `Средняя по породе: ${comparison.breedAvg.toFixed(1)} км/ч`,
    `Сравнение по ${comparison.peerCount} собакам породы`,
    `Шкала: ${comparison.scaleMin.toFixed(1)}–${comparison.scaleMax.toFixed(1)} км/ч`,
  ].join(' · ')

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex min-w-0 items-center gap-2" title={tooltip}>
          <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-md border border-forest-200/80 bg-forest-50 font-mono text-[11px] font-bold text-forest-800">
            С
          </span>
          <span className="truncate font-medium text-charcoal-800">{label}</span>
        </div>

        <div className="flex shrink-0 items-baseline gap-2 font-mono tabular-nums">
          <span className="text-sm font-bold text-charcoal-900">
            {comparison.dogSpeed.toFixed(1)}
            <span className="text-[11px] font-normal text-charcoal-400"> км/ч</span>
          </span>
          <span
            className={`w-11 text-right text-xs font-semibold ${speedDeltaTone(comparison.delta)}`}
            title={`Отклонение от средней скорости породы (${comparison.breedAvg.toFixed(1)} км/ч)`}
          >
            {formatSignedSpeedDelta(comparison.delta)}
          </span>
        </div>
      </div>

      <div className="relative h-2 w-full rounded-full bg-sand-100" title={tooltip}>
        <div
          className="h-full rounded-full bg-forest-600/80 transition-[width] duration-300"
          style={{ width: `${comparison.fillPct.toFixed(1)}%` }}
        />
        <div
          className="absolute -top-0.5 h-3 w-[3px] -translate-x-1/2 rounded-full bg-camel-800 ring-1 ring-white/90"
          style={{ left: `${comparison.breedMarkerPct.toFixed(1)}%` }}
          title={tooltip}
        />
      </div>
    </div>
  )
}
