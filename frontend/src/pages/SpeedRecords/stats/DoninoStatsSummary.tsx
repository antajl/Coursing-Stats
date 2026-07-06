import DoninoDogNameLink from '../../../components/DoninoDogNameLink'
import { formatDoninoSpeedKmh } from '../../../lib/recordDates'

function formatDogCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return `${count} собак`
  if (mod10 === 1) return `${count} собака`
  if (mod10 >= 2 && mod10 <= 4) return `${count} собаки`
  return `${count} собак`
}

interface DoninoStatsSummaryProps {
  title: string
  dogCount: number
  mode: 'speed' | 'coursing'
  runCount: number
  avgValue: number
  bestValue: number | null
  bestDogName: string | null
  bestDogBreed?: string
  hasData: boolean
}

function runLabel(mode: 'speed' | 'coursing', count: number): string {
  if (mode === 'speed') {
    const mod10 = count % 10
    const mod100 = count % 100
    if (mod100 >= 11 && mod100 <= 14) return `${count} замеров`
    if (mod10 === 1) return `${count} замер`
    if (mod10 >= 2 && mod10 <= 4) return `${count} замера`
    return `${count} замеров`
  }
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return `${count} зачётов`
  if (mod10 === 1) return `${count} зачёт`
  if (mod10 >= 2 && mod10 <= 4) return `${count} зачёта`
  return `${count} зачётов`
}

export default function DoninoStatsSummary({
  title,
  dogCount,
  mode,
  runCount,
  avgValue,
  bestValue,
  bestDogName,
  bestDogBreed,
  hasData,
}: DoninoStatsSummaryProps) {
  const avgText =
    mode === 'speed'
      ? `ср. ${formatDoninoSpeedKmh(avgValue)} км/ч`
      : `ср. ${avgValue.toFixed(2)} сек`

  const bestText =
    bestValue == null
      ? '—'
      : mode === 'speed'
        ? `${formatDoninoSpeedKmh(bestValue)} км/ч`
        : `${bestValue.toFixed(2)} сек`

  return (
    <div className="donino-stats-column-header mb-4">
      <div className="donino-stats-column-header__top">
        <h2 className="donino-stats-column-header__title">{title}</h2>
        <span className="donino-stats-column-header__dogs">{formatDogCount(dogCount)}</span>
      </div>
      {!hasData ? (
        <p className="donino-stats-column-header__stats donino-stats-column-header__stats--empty">Нет данных</p>
      ) : (
        <p className="donino-stats-column-header__stats">
          <span>{runLabel(mode, runCount)}</span>
          <span className="donino-stats-summary__sep" aria-hidden>
            ·
          </span>
          <span>{avgText}</span>
          <span className="donino-stats-summary__sep" aria-hidden>
            ·
          </span>
          <span>
            {mode === 'speed' ? 'лучшая' : 'лучшее'}{' '}
            <strong className="font-semibold text-camel-700 dark:text-camel-400">{bestText}</strong>
            {bestDogName && (
              <>
                {' '}
                —{' '}
                <DoninoDogNameLink
                  name={bestDogName}
                  breed={bestDogBreed ?? ''}
                  className="font-medium text-charcoal-800 dark:text-charcoal-100"
                />
              </>
            )}
          </span>
        </p>
      )}
    </div>
  )
}
