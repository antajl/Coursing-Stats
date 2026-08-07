import { Link } from 'react-router-dom'
import { formatRecordDate } from '../../../lib/recordDates'
import type { DogCoursingSummary, DogSpeedSummary } from './doninoStatsUtils'

interface DogSearchCardProps {
  name: string
  breed: string
  speed?: DogSpeedSummary | null
  coursing?: DogCoursingSummary | null
  coursingRank?: { rank: number; total: number } | null
  speedRank?: { rank: number; total: number } | null
}

export default function DogSearchCard({
  name,
  breed,
  speed,
  coursing,
  coursingRank,
  speedRank,
}: DogSearchCardProps) {
  return (
    <div className="bg-white dark:bg-charcoal-800 rounded-xl border border-cream-300 dark:border-charcoal-600 p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-charcoal-900 dark:text-charcoal-100">
          {name} <span className="text-charcoal-500 dark:text-charcoal-400 font-normal">({breed})</span>
        </h2>
        <Link
          to={`/donino-dog/${encodeURIComponent(name)}/${encodeURIComponent(breed)}`}
          className="text-sm font-semibold text-camel-700 dark:text-camel-400 hover:underline"
        >
          Профиль Донино →
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-camel-200 dark:border-charcoal-500 p-4 bg-camel-50/50 dark:bg-charcoal-700/40">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-old-money-600 dark:text-old-money-400 mb-3">
            Бега 350 м
          </h3>
          {coursing ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-charcoal-500 dark:text-charcoal-400">Лучшее</div>
                <div className="text-2xl font-bold text-camel-700 dark:text-camel-400">
                  {coursing.bestTime.toFixed(2)} <span className="text-sm font-normal">сек</span>
                </div>
              </div>
              <div>
                <div className="text-charcoal-500 dark:text-charcoal-400">Среднее</div>
                <div className="text-xl font-semibold text-charcoal-800 dark:text-charcoal-100">{coursing.avgTime.toFixed(2)} сек</div>
              </div>
              <div>
                <div className="text-charcoal-500 dark:text-charcoal-400">Зачётов</div>
                <div className="font-semibold text-charcoal-800 dark:text-charcoal-100">{coursing.runCount}</div>
              </div>
              {coursingRank && (
                <div>
                  <div className="text-charcoal-500 dark:text-charcoal-400">В породе</div>
                  <div className="font-semibold text-charcoal-800 dark:text-charcoal-100">
                    #{coursingRank.rank} из {coursingRank.total}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-charcoal-500 dark:text-charcoal-400 text-sm">Нет зачётов на 350 м</p>
          )}
        </div>

        <div className="rounded-xl border border-old-money-200 dark:border-charcoal-500 p-4 bg-old-money-50/40 dark:bg-charcoal-700/40">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-old-money-600 dark:text-old-money-400 mb-3">
            Замер скорости
          </h3>
          {speed ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-charcoal-500 dark:text-charcoal-400">Лучшая</div>
                <div className="text-2xl font-bold text-camel-700 dark:text-camel-400">
                  {speed.bestSpeed.toFixed(1)} <span className="text-sm font-normal">км/ч</span>
                </div>
              </div>
              <div>
                <div className="text-charcoal-500 dark:text-charcoal-400">Средняя</div>
                <div className="text-xl font-semibold text-charcoal-800 dark:text-charcoal-100">{speed.avgSpeed.toFixed(1)} км/ч</div>
              </div>
              <div>
                <div className="text-charcoal-500 dark:text-charcoal-400">Замеров</div>
                <div className="font-semibold text-charcoal-800 dark:text-charcoal-100">{speed.runCount}</div>
              </div>
              {speedRank && (
                <div>
                  <div className="text-charcoal-500 dark:text-charcoal-400">В породе</div>
                  <div className="font-semibold text-charcoal-800 dark:text-charcoal-100">
                    #{speedRank.rank} из {speedRank.total}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-charcoal-500 dark:text-charcoal-400 text-sm">Нет замеров скорости</p>
          )}
        </div>
      </div>
    </div>
  )
}

export function formatDogDate(date?: string | number) {
  if (!date) return ''
  return formatRecordDate(date)
}
