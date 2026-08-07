import type { RawScores } from '../types'
import { bibColorStyle, bibTextClass, normalizeBibColorName } from '../utils'
import HoverTooltip from '../../../../components/ui/HoverTooltip'

interface RacingDetailProps {
  rawScores: RawScores
}

const BIB_LABELS: Record<string, string> = {
  red: 'Красная попона',
  white: 'Белая попона',
  blue: 'Голубая попона',
  black: 'Чёрная попона',
}

/** Ячейка попоны как в протоколе: цветной фон + цифра */
function PoponaCell({ number, color }: { number?: number | string | null; color?: string | null }) {
  if (number == null && !color) {
    return <span className="text-old-money-400">—</span>
  }

  const normalized = normalizeBibColorName(color ?? undefined)
  const title = normalized ? (BIB_LABELS[normalized] || normalized) : undefined

  return (
    <HoverTooltip label={title} placement="top" variant="site" delayMs={0} portal>
      <span
        className={`inline-flex min-h-[2rem] min-w-[2.25rem] items-center justify-center rounded text-sm font-bold shadow-sm cursor-help ${normalized ? bibTextClass(normalized) : 'text-charcoal-900 dark:text-charcoal-100 border border-old-money-300'}`}
        style={normalized ? bibColorStyle(normalized) : undefined}
      >
        {number ?? '—'}
      </span>
    </HoverTooltip>
  )
}

export default function RacingDetail({ rawScores }: RacingDetailProps) {
  const heats = rawScores.heats || []

  return (
    <>
      <div className="md:hidden space-y-3">
        {heats.map((heat, heatIdx) => {
          const isHeatDisqualified = !heat.time && !heat.speed_kmh
          const speedMs = heat.speed_kmh ? (heat.speed_kmh / 3.6).toFixed(1) : null

          return (
            <div key={heatIdx} className="bg-white dark:bg-charcoal-800 rounded-xl p-3 border border-old-money-200 dark:border-charcoal-600">
              <div className="grid grid-cols-4 gap-2 mb-3 pb-2 border-b border-old-money-100 dark:border-charcoal-600 text-center">
                <div>
                  <div className={`font-bold ${isHeatDisqualified ? 'text-red-600' : 'text-camel-700 dark:text-camel-400'}`}>
                    <span className="text-old-money-400 text-xs">№</span>{heat.heat_number || '—'}
                  </div>
                </div>
                <div>
                  <PoponaCell number={heat.bib_number} color={heat.bib_color} />
                </div>
                <div>
                  <div className="font-bold text-charcoal-900 dark:text-charcoal-100">
                    {heat.time ? `${heat.time} с` : '—'}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-charcoal-900 dark:text-charcoal-100">
                    {speedMs ? `${speedMs} м/с` : '—'}
                  </div>
                </div>
              </div>

              {isHeatDisqualified ? (
                <div className="text-center text-red-600 dark:text-red-400 italic text-sm py-2">
                  Отстранение
                </div>
              ) : (
                <div className="text-center text-sm">
                  <span className="text-old-money-500">Скорость: </span>
                  <span className="font-bold text-camel-700 dark:text-camel-400">
                    {heat.speed_kmh ? `${heat.speed_kmh.toFixed(1)} км/ч` : '—'}
                  </span>
                </div>
              )}
            </div>
          )
        })}

        {rawScores.grand_total && (
          <div className="rounded-xl border border-camel-200 dark:border-camel-600 bg-camel-50 dark:bg-charcoal-700 p-3 text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Лучшее время: </span>
            <span className="text-lg font-bold text-camel-700 dark:text-camel-400">{rawScores.grand_total} сек</span>
            <span className="mx-2 text-gray-400">|</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Скорость: </span>
            <span className="text-lg font-bold text-camel-700 dark:text-camel-400">
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
                <tr key={heatIdx} className={heatIdx > 0 ? 'border-t border-old-money-200 dark:border-charcoal-600' : ''}>
                  <td className={`py-0.5 pr-2 font-semibold text-charcoal-900 dark:text-charcoal-100 align-middle ${isBest ? 'font-bold text-camel-700 dark:text-camel-400' : ''} ${isHeatDisqualified ? 'text-red-600 dark:text-red-400' : ''}`}>
                    <span className="text-old-money-400 mr-0.5">№</span>
                    {heat.heat_number || '—'}
                  </td>
                  <td className="py-0.5 pr-2 text-center align-middle">
                    <PoponaCell number={heat.bib_number} color={heat.bib_color} />
                  </td>
                  <td className={`py-0.5 pr-2 text-center align-middle ${isHeatDisqualified ? 'text-red-600 dark:text-red-400 italic' : 'text-charcoal-900 dark:text-charcoal-100'} ${isBest ? 'font-bold' : ''}`}>
                    {heat.time ? `${heat.time} сек` : '-'}
                  </td>
                  <td className={`py-0.5 pr-2 text-center align-middle ${isHeatDisqualified ? 'text-red-600 dark:text-red-400 italic' : 'text-charcoal-900 dark:text-charcoal-100'}`}>
                    {speedMs ? `${speedMs} м/с` : '-'}
                  </td>
                  <td className={`py-0.5 pr-2 text-center align-middle ${isHeatDisqualified ? 'text-red-600 dark:text-red-400 italic' : 'text-camel-700 dark:text-camel-400 font-bold'}`}>
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
