import { ChevronDown } from 'lucide-react'
import DoninoDogNameLink from '../../../components/DoninoDogNameLink'
import { formatDoninoSpeedKmh } from '../../../lib/recordDates'
import { MIN_SAMPLES_FOR_AVG } from './constants'
import type { GroupBy } from './constants'
import type { DogCoursingSummary, DogSpeedSummary, GroupedRow } from './doninoStatsUtils'

interface DoninoGroupCardProps {
  row: GroupedRow
  mode: 'speed' | 'coursing'
  groupBy: GroupBy
  expanded: boolean
  onToggle: () => void
}

function isSpeedDog(dog: DogSpeedSummary | DogCoursingSummary): dog is DogSpeedSummary {
  return 'bestSpeed' in dog
}

export default function DoninoGroupCard({
  row,
  mode,
  groupBy,
  expanded,
  onToggle,
}: DoninoGroupCardProps) {
  const isSpeed = mode === 'speed'

  const avgText =
    row.avgPrimary == null
      ? '—'
      : isSpeed
        ? `${formatDoninoSpeedKmh(row.avgPrimary)} км/ч`
        : `${row.avgPrimary.toFixed(2)} сек`

  const bestText =
    row.bestPrimary == null
      ? '—'
      : isSpeed
        ? `${formatDoninoSpeedKmh(row.bestPrimary)} км/ч`
        : `${row.bestPrimary.toFixed(2)} сек`

  const runWord = isSpeed ? 'замеров' : 'зачётов'

  return (
    <article className={`donino-group-card${expanded ? ' donino-group-card--open' : ''}`}>
      <button
        type="button"
        className="donino-group-card__head"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="donino-group-card__title-row">
          <ChevronDown
            className={`donino-group-card__chevron${expanded ? ' donino-group-card__chevron--open' : ''}`}
            strokeWidth={2}
            aria-hidden
          />
          <span className="donino-group-card__label">{row.label}</span>
          {row.lowSample && (
            <span
              className="donino-group-card__badge"
              title={`Менее ${MIN_SAMPLES_FOR_AVG} записей для надёжного среднего`}
            >
              мало данных
            </span>
          )}
        </span>
        <span className="donino-group-card__metrics">
          {row.runCount} {runWord} · {row.dogCount} собак · ср. {avgText}
        </span>
        <span className="donino-group-card__best">
          {isSpeed ? 'Лучшая' : 'Лучшее'}{' '}
          <strong className="text-camel-700 dark:text-camel-400">{bestText}</strong>
          {row.recordHolder && (
            <>
              {' '}
              —{' '}
              <DoninoDogNameLink
                name={row.recordHolder}
                breed={groupBy === 'breed' ? row.label : row.dogs[0]?.breed ?? ''}
                className="font-medium"
                onClick={(e) => e.stopPropagation()}
              />
            </>
          )}
        </span>
      </button>

      {expanded && (
        <div className="donino-group-card__body">
          <table className="donino-group-card__table">
            <thead>
              <tr>
                <th>Кличка</th>
                <th className="text-center">{isSpeed ? 'Замеров' : 'Зачётов'}</th>
                <th className="text-center">Лучшее</th>
                <th className="text-center">Среднее</th>
              </tr>
            </thead>
            <tbody>
              {row.dogs.slice(0, 15).map((dog) => (
                <tr key={`${dog.name}_${dog.breed}`}>
                  <td>
                    <DoninoDogNameLink name={dog.name} breed={dog.breed} />
                  </td>
                  <td className="text-center">{dog.runCount}</td>
                  <td className="text-center font-semibold text-camel-700 dark:text-camel-400">
                    {isSpeedDog(dog)
                      ? `${formatDoninoSpeedKmh(dog.bestSpeed)} км/ч`
                      : `${dog.bestTime.toFixed(2)} сек`}
                  </td>
                  <td className="text-center">
                    {isSpeedDog(dog)
                      ? `${formatDoninoSpeedKmh(dog.avgSpeed)} км/ч`
                      : `${dog.avgTime.toFixed(2)} сек`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {row.dogs.length > 15 && (
            <p className="donino-group-card__more">и ещё {row.dogs.length - 15}…</p>
          )}
        </div>
      )}
    </article>
  )
}
