import React, { useState } from 'react'
import DoninoDogNameLink from '../../../components/DoninoDogNameLink'
import type { GroupedRow } from './doninoStatsUtils'
import type { DogCoursingSummary, DogSpeedSummary } from './doninoStatsUtils'
import type { GroupBy } from './constants'
import { GROUP_BY_OPTIONS } from './constants'

interface GroupedStatsTableProps {
  mode: 'speed' | 'coursing'
  rows: GroupedRow[]
  groupBy: GroupBy
  onGroupByChange: (value: GroupBy) => void
}

function isSpeedDog(dog: DogSpeedSummary | DogCoursingSummary): dog is DogSpeedSummary {
  return 'bestSpeed' in dog
}

export default function GroupedStatsTable({
  mode,
  rows,
  groupBy,
  onGroupByChange,
}: GroupedStatsTableProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const isSpeed = mode === 'speed'

  return (
    <div className="bg-white dark:bg-charcoal-800 rounded-2xl border-2 border-cream-300 dark:border-charcoal-600 p-6 shadow-md space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-charcoal-900 dark:text-charcoal-100">Срезы</h2>
        <label className="flex items-center gap-2 text-sm text-charcoal-700 dark:text-charcoal-300">
          Группировать по
          <select
            value={groupBy}
            onChange={(e) => onGroupByChange(e.target.value as GroupBy)}
            className="rounded-lg border border-cream-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-3 py-2"
          >
            {GROUP_BY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b-2 border-cream-300 dark:border-charcoal-600">
              <th className="px-3 py-3 text-left font-semibold">
                {GROUP_BY_OPTIONS.find((o) => o.value === groupBy)?.label}
              </th>
              <th className="px-3 py-3 text-center font-semibold whitespace-nowrap">Зачётов</th>
              <th className="px-3 py-3 text-center font-semibold whitespace-nowrap">Собак</th>
              <th className="px-3 py-3 text-center font-semibold whitespace-nowrap">
                {isSpeed ? 'Ср. км/ч' : 'Ср. время'}
              </th>
              <th className="px-3 py-3 text-center font-semibold whitespace-nowrap">
                {isSpeed ? 'Лучшая км/ч' : 'Лучшее время'}
              </th>
              <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">Рекордсмен</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <React.Fragment key={row.key}>
                <tr
                  className="border-b border-cream-200 dark:border-charcoal-600 hover:bg-cream-50 dark:hover:bg-charcoal-700 cursor-pointer"
                  onClick={() => setExpandedKey(expandedKey === row.key ? null : row.key)}
                >
                  <td className="px-3 py-3 font-semibold">
                    <span className="mr-2 text-charcoal-400">{expandedKey === row.key ? '▼' : '▶'}</span>
                    {row.label}
                    {row.lowSample && (
                      <span className="ml-2 text-xs text-charcoal-500 font-normal">мало данных</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">{row.runCount}</td>
                  <td className="px-3 py-3 text-center">{row.dogCount}</td>
                  <td className="px-3 py-3 text-center">
                    {row.avgPrimary == null
                      ? '—'
                      : isSpeed
                        ? `${row.avgPrimary.toFixed(1)} км/ч`
                        : `${row.avgPrimary.toFixed(2)} сек`}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-camel-700 dark:text-camel-400">
                    {row.bestPrimary == null
                      ? '—'
                      : isSpeed
                        ? `${row.bestPrimary.toFixed(1)} км/ч`
                        : `${row.bestPrimary.toFixed(2)} сек`}
                  </td>
                  <td className="px-3 py-3">
                    {row.recordHolder ? (
                      <DoninoDogNameLink
                        name={row.recordHolder}
                        breed={groupBy === 'breed' ? row.label : row.dogs[0]?.breed ?? ''}
                        className="font-medium"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
                {expandedKey === row.key && (
                  <tr className="bg-cream-50 dark:bg-charcoal-700">
                    <td colSpan={6} className="px-3 py-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-charcoal-500">
                            <th className="text-left py-1">Кличка</th>
                            <th className="text-center py-1">Зачётов</th>
                            <th className="text-center py-1">Лучшее</th>
                            <th className="text-center py-1">Среднее</th>
                          </tr>
                        </thead>
                        <tbody>
                          {row.dogs.slice(0, 15).map((dog) => (
                            <tr key={`${dog.name}_${dog.breed}`} className="border-t border-cream-200 dark:border-charcoal-600">
                              <td className="py-1.5">
                                <DoninoDogNameLink name={dog.name} breed={dog.breed} />
                              </td>
                              <td className="text-center py-1.5">{dog.runCount}</td>
                              <td className="text-center py-1.5 font-semibold text-camel-700 dark:text-camel-400">
                                {isSpeedDog(dog)
                                  ? `${dog.bestSpeed.toFixed(1)} км/ч`
                                  : `${dog.bestTime.toFixed(2)} сек`}
                              </td>
                              <td className="text-center py-1.5">
                                {isSpeedDog(dog)
                                  ? `${dog.avgSpeed.toFixed(1)} км/ч`
                                  : `${dog.avgTime.toFixed(2)} сек`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {row.dogs.length > 15 && (
                        <p className="text-xs text-charcoal-500 mt-2">и ещё {row.dogs.length - 15}…</p>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
