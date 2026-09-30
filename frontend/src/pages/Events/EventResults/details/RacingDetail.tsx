import type { RawScores } from '../types'
import PoponaCell from '../components/PoponaCell'

interface RacingDetailProps {
  rawScores: RawScores
}

export default function RacingDetail({ rawScores }: RacingDetailProps) {
  const heats = rawScores.heats || []

  return (
    <>
      <div className="md:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {heats.map((heat, heatIdx) => {
            const isHeatDisqualified = !heat.time && !heat.speed_kmh
            const speedMs = heat.speed_kmh ? (heat.speed_kmh / 3.6).toFixed(1) : null

            return (
              <div key={heatIdx} className="flex-shrink-0 bg-white rounded-xl p-3 border border-old-money-200 min-w-[140px]">
                <div className="text-center mb-2">
                  <div className={`font-bold ${isHeatDisqualified ? 'text-red-600' : 'text-camel-700'}`}>
                    <span className="text-old-money-400 text-xs">№</span>{heat.heat_number || '—'}
                  </div>
                </div>
                <div className="space-y-1 text-center">
                  <div>
                    <PoponaCell number={heat.bib_number} color={heat.bib_color} />
                  </div>
                  <div className="font-bold text-charcoal-900">
                    {heat.time ? `${heat.time} с` : '—'}
                  </div>
                  <div className="font-bold text-charcoal-900">
                    {speedMs ? `${speedMs} м/с` : '—'}
                  </div>
                  {isHeatDisqualified ? (
                    <div className="text-red-600 italic text-xs py-1">
                      Отстранение
                    </div>
                  ) : (
                    <div className="text-xs">
                      <span className="text-old-money-500">Скорость: </span>
                      <span className="font-bold text-camel-700">
                        {heat.speed_kmh ? `${heat.speed_kmh.toFixed(1)} км/ч` : '—'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {rawScores.grand_total && (
          <div className="mt-3 rounded-xl border border-camel-200 bg-camel-50 p-3 text-center">
            <span className="text-sm text-gray-600">Лучшее время: </span>
            <span className="text-lg font-bold text-camel-700">{rawScores.grand_total} сек</span>
            <span className="mx-2 text-gray-400">|</span>
            <span className="text-sm text-gray-600">Скорость: </span>
            <span className="text-lg font-bold text-camel-700">
              {(() => {
                const bestHeat = heats.find(h => {
                  const heatTime = typeof h.time === 'number' ? h.time : parseFloat(h.time || '0')
                  const grandTotal = typeof rawScores.grand_total === 'number' ? rawScores.grand_total : parseFloat(rawScores.grand_total || '0')
                  return Math.abs(heatTime - grandTotal) < 0.01
                })
                const speedMs = bestHeat?.speed_kmh ? (bestHeat.speed_kmh / 3.6).toFixed(1) : null
                const speedKmh = bestHeat?.speed_kmh ? bestHeat.speed_kmh.toFixed(1) : null
                return speedMs ? `${speedMs} м/с (${speedKmh} км/ч)` : '—'
              })()}
            </span>
          </div>
        )}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs min-w-[520px]">
          <colgroup>
            <col className="w-16" />
            <col className="w-12" />
            <col className="w-20" />
            <col className="w-20" />
            <col className="w-24" />
          </colgroup>
          <tbody>
            {heats.map((heat, heatIdx) => {
              const isHeatDisqualified = !heat.time && !heat.speed_kmh
              const isBest = rawScores.grand_total && heat.time === rawScores.grand_total
              const speedMs = heat.speed_kmh ? (heat.speed_kmh / 3.6).toFixed(1) : null

              return (
                <tr key={heatIdx} className={heatIdx > 0 ? 'border-t border-old-money-200' : ''}>
                  <td className={`py-0.5 pr-2 font-semibold text-charcoal-900 align-middle ${isBest ? 'font-bold text-camel-700' : ''} ${isHeatDisqualified ? 'text-red-600' : ''}`}>
                    <span className="text-old-money-400 mr-0.5">№</span>
                    {heat.heat_number || '—'}
                  </td>
                  <td className="py-0.5 pr-2 text-center align-middle">
                    <PoponaCell number={heat.bib_number} color={heat.bib_color} />
                  </td>
                  <td className={`py-0.5 pr-2 text-center align-middle ${isHeatDisqualified ? 'text-red-600 italic' : 'text-charcoal-900'} ${isBest ? 'font-bold' : ''}`}>
                    {heat.time ? `${heat.time} сек` : '-'}
                  </td>
                  <td className={`py-0.5 pr-2 text-center align-middle ${isHeatDisqualified ? 'text-red-600 italic' : 'text-charcoal-900'}`}>
                    {speedMs ? `${speedMs} м/с` : '-'}
                  </td>
                  <td className={`py-0.5 pr-2 text-center align-middle ${isHeatDisqualified ? 'text-red-600 italic' : 'text-camel-700 font-bold'}`}>
                    {heat.speed_kmh ? `${heat.speed_kmh.toFixed(1)} км/ч` : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
