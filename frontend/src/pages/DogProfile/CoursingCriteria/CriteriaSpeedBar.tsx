import {
  clampSpeedPct,
  hasLastRoundSpeedBenchmark,
  type DogSpeedBreedComparison,
} from './coursingSpeedBenchmark'
import { CriteriaMetricRow } from './CriteriaMetricRow'

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
 * — «Общий зачёт»: средняя (или лучшая) скорость собаки vs среднее по породе (шкала 0..макс. той же метрики)
 * — «Последний раунд»: средняя скорость собаки в её последних забегах (2-й или 3-й) vs среднее породы в их последних забегах.
 */
export function CriteriaSpeedBar({ comparison, mode = 'breed' }: CriteriaSpeedBarProps) {
  const canCompareLastRound = mode === 'rounds' && hasLastRoundSpeedBenchmark(comparison)
  if (mode === 'rounds' && !canCompareLastRound) {
    return null
  }

  const primarySpeed = canCompareLastRound ? comparison.lastRunSpeed! : comparison.dogSpeed
  const referenceSpeed = canCompareLastRound ? comparison.breedLastAvg! : comparison.breedAvg
  const delta = primarySpeed - referenceSpeed
  const scaleMax = canCompareLastRound
    ? Math.max(comparison.breedLastMax!, primarySpeed)
    : comparison.breedMaxSpeed
  const fillPct = canCompareLastRound
    ? clampSpeedPct(primarySpeed, scaleMax)
    : comparison.fillPct
  const tickPct = canCompareLastRound
    ? clampSpeedPct(referenceSpeed, scaleMax)
    : comparison.breedMarkerPct

  const label = canCompareLastRound
    ? 'Скорость в бегах'
    : comparison.kind === 'best'
      ? 'Лучшая скорость'
      : 'Скорость в бегах'

  const peerCount = canCompareLastRound
    ? (comparison.breedLastPeerCount ?? comparison.peerCount)
    : comparison.peerCount
  const ceilingLabel =
    !canCompareLastRound && comparison.kind === 'best'
      ? 'Рекорд породы'
      : 'Макс. средняя в породе'

  const tickTooltip = (
    <span className="block space-y-0.5">
      <span className="block whitespace-nowrap">
        {canCompareLastRound ? 'Посл. раунд породы:' : 'Среднее по породе:'}{' '}
        <strong className="font-semibold text-charcoal-900">
          {referenceSpeed.toFixed(1)} км/ч
        </strong>
      </span>
      <span className="block text-charcoal-500 whitespace-nowrap">
        {ceilingLabel}: {scaleMax.toFixed(1)} км/ч · {peerCount} соб.
      </span>
    </span>
  )

  const scaleTitle = canCompareLastRound
    ? `Шкала последнего раунда от 0 до макс. средней по породе (${scaleMax.toFixed(1)} км/ч)`
    : comparison.kind === 'best'
      ? `Шкала от 0 до рекорда породы (${scaleMax.toFixed(1)} км/ч)`
      : `Шкала от 0 до макс. средней по породе (${scaleMax.toFixed(1)} км/ч)`

  return (
    <CriteriaMetricRow
      badgeKey="С"
      label={label}
      title={scaleTitle}
      fillPct={fillPct}
      tickPct={tickPct}
      tickTooltip={tickTooltip}
      valueText={primarySpeed.toFixed(1)}
      unitText="км/ч"
      deltaText={formatSignedSpeedDelta(delta)}
      deltaToneClass={speedDeltaTone(delta)}
    />
  )
}
