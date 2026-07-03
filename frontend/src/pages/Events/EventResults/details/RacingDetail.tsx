import type { RawScores } from '../types'

interface RacingDetailProps {
  rawScores: RawScores
}

export default function RacingDetail({ rawScores }: RacingDetailProps) {
  const heats = rawScores.heats || []

  return (
    <>
      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {heats.map((heat, heatIdx) => {
          const isHeatDisqualified = !heat.time && !heat.speed_kmh

          return (
            <div key={heatIdx} className="bg-white dark:bg-charcoal-800 rounded-xl p-3 border border-old-money-200 dark:border-charcoal-600">
              <div className="flex items-center justify-center gap-2 mb-3 pb-2 border-b border-old-money-100 dark:border-charcoal-600">
                <span className={`font-bold ${isHeatDisqualified ? 'text-red-600 dark:text-red-400' : 'text-camel-700 dark:text-camel-400'}`}>
                  Забег {heat.heat_number || heatIdx + 1}
                  {isHeatDisqualified && ' (отстранение)'}
                </span>
              </div>

              {isHeatDisqualified ? (
                <div className="text-center text-red-600 dark:text-red-400 italic text-sm py-2">
                  Отстранение
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-old-money-50 dark:bg-charcoal-700 rounded-lg p-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Время</div>
                    <div className="text-lg font-bold text-charcoal-900 dark:text-charcoal-100">
                      {heat.time ? `${heat.time} сек` : '-'}
                    </div>
                  </div>
                  <div className="bg-old-money-50 dark:bg-charcoal-700 rounded-lg p-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Скорость</div>
                    <div className="text-lg font-bold text-camel-700 dark:text-camel-400">
                      {heat.speed_kmh ? `${heat.speed_kmh.toFixed(1)} км/ч` : '-'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {rawScores.grand_total && (
          <div className="rounded-xl border border-camel-200 dark:border-camel-600 bg-camel-50 dark:bg-charcoal-700 p-3 text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Лучшее время: </span>
            <span className="text-lg font-bold text-camel-700 dark:text-camel-400">{rawScores.grand_total} сек</span>
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs min-w-[400px]">
          <thead>
            <tr className="text-left text-old-money-600 dark:text-old-money-400">
              <th className="pb-1 pr-2">Забег</th>
              <th className="pb-1 pr-2 text-center">Время</th>
              <th className="pb-1 pr-2 text-center">Скорость</th>
            </tr>
          </thead>
          <tbody>
            {heats.map((heat, heatIdx) => {
              const isHeatDisqualified = !heat.time && !heat.speed_kmh

              return (
                <tr key={heatIdx} className={heatIdx > 0 ? "border-t border-old-money-200 dark:border-charcoal-600" : ""}>
                  <td className="py-1 pr-2 text-charcoal-900 dark:text-charcoal-100">
                    Забег {heat.heat_number || heatIdx + 1}
                    {isHeatDisqualified && ' (отстранение)'}
                  </td>
                  <td className={`py-1 pr-2 text-center ${isHeatDisqualified ? 'text-red-600 dark:text-red-400 italic' : 'text-charcoal-900 dark:text-charcoal-100'}`}>
                    {heat.time ? `${heat.time} сек` : '-'}
                  </td>
                  <td className={`py-1 pr-2 text-center ${isHeatDisqualified ? 'text-red-600 dark:text-red-400 italic' : 'text-camel-700 dark:text-camel-400 font-bold'}`}>
                    {heat.speed_kmh ? `${heat.speed_kmh.toFixed(1)} км/ч` : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {rawScores.grand_total && (
          <div className="mt-3 text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">Лучшее время: </span>
            <span className="text-sm font-bold text-camel-700 dark:text-camel-400">{rawScores.grand_total} сек</span>
          </div>
        )}
      </div>
    </>
  )
}
