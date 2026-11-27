import {
  clampSpeedPct,
  type DogSpeedBreedComparison,
} from './coursingSpeedBenchmark'
import { CriteriaBenchmarkTick } from './CriteriaBenchmarkTick'

interface CriteriaSpeedBarProps {
  comparison: DogSpeedBreedComparison
  mode?: 'breed' | 'rounds'
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
 * — «К породе»: средняя (или лучшая) скорость vs среднее по породе (шкала 0..рекорд породы)
 * — «1-й vs последний»: последний забег старта (2-й или 3-й при 3 кругах) vs 1-й забег.
 */
export function CriteriaSpeedBar({ comparison, mode = 'breed' }: CriteriaSpeedBarProps) {
  const canCompareRounds =
    mode === 'rounds' && comparison.firstRunSpeed != null && comparison.lastRunSpeed != null

  const primarySpeed = canCompareRounds ? comparison.lastRunSpeed! : comparison.dogSpeed
  const referenceSpeed = canCompareRounds ? comparison.firstRunSpeed! : comparison.breedAvg
  const delta = primarySpeed - referenceSpeed
  const fillPct = canCompareRounds
    ? clampSpeedPct(primarySpeed, comparison.breedMaxSpeed)
    : comparison.fillPct
  const tickPct = canCompareRounds
    ? clampSpeedPct(referenceSpeed, comparison.breedMaxSpeed)
    : comparison.breedMarkerPct

  const label = canCompareRounds
    ? 'Скорость в бегах'
    : comparison.kind === 'best'
      ? 'Лучшая скорость в бегах'
      : 'Скорость в бегах'

  const lastLabel =
    comparison.lastHeatMax && comparison.lastHeatMax >= 3
      ? 'Последний забег (до 3-го)'
      : '2-й забег'

  const tickTooltip = canCompareRounds ? (
    <span className="block space-y-0.5">
      <span className="block whitespace-nowrap">
        1-й забег:{' '}
        <strong className="font-semibold text-charcoal-900">
          {referenceSpeed.toFixed(1)} км/ч
        </strong>
      </span>
      <span className="block text-charcoal-500 whitespace-nowrap">
        {lastLabel}: {primarySpeed.toFixed(1)} км/ч · макс. {comparison.breedMaxSpeed.toFixed(1)} км/ч
      </span>
    </span>
  ) : (
    <span className="block space-y-0.5">
      <span className="block whitespace-nowrap">
        Среднее по породе:{' '}
        <strong className="font-semibold text-charcoal-900">
          {comparison.breedAvg.toFixed(1)} км/ч
        </strong>
      </span>
      <span className="block text-charcoal-500 whitespace-nowrap">
        Максимум породы: {comparison.breedMaxSpeed.toFixed(1)} км/ч · {comparison.peerCount} соб.
      </span>
    </span>
  )

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
        <div
          className="flex min-w-0 items-center gap-2"
          title={`Шкала от 0 до рекорда породы (${comparison.breedMaxSpeed.toFixed(1)} км/ч)`}
        >
          <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-md border border-forest-200/80 bg-forest-50 font-mono text-[11px] font-bold text-forest-800">
            С
          </span>
          <span className="truncate font-medium text-charcoal-800">{label}</span>
        </div>

        <div className="flex shrink-0 items-baseline gap-2 font-mono tabular-nums">
          <span className="text-sm font-bold text-charcoal-900">
            {primarySpeed.toFixed(1)}
            <span className="text-[11px] font-normal text-charcoal-400"> км/ч</span>
          </span>
          <span className={`w-11 text-right text-xs font-semibold ${speedDeltaTone(delta)}`}>
            {formatSignedSpeedDelta(delta)}
          </span>
        </div>
      </div>

      <div className="relative h-2 w-full rounded-full bg-sand-100">
        <div
          className="h-full rounded-full bg-forest-600/80 transition-[width] duration-300"
          style={{ width: `${fillPct.toFixed(1)}%` }}
        />
        <CriteriaBenchmarkTick percent={tickPct} label={tickTooltip} />
      </div>
    </div>
  )
}
