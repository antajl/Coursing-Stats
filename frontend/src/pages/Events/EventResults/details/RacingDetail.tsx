import type { RawScores } from '../types'
import { bibColorStyle, bibTextClass, normalizeBibColorName } from '../utils'

interface RacingDetailProps {
  rawScores: RawScores
}

const BIB_LABELS: Record<string, string> = {
  red: 'красная',
  white: 'белая',
  blue: 'голубая',
  black: 'чёрная',
}

/** Ячейка попоны как в протоколе: цветной фон + цифра */
function PoponaCell({ number, color }: { number?: number | string | null; color?: string | null }) {
  if (number == null && !color) {
    return <span className="text-old-money-400">—</span>
  }

  const normalized = normalizeBibColorName(color ?? undefined)
  const title = normalized ? (BIB_LABELS[normalized] || normalized) : undefined

  return (
    <span
      className={`inline-flex min-h-[2rem] min-w-[2.25rem] items-center justify-center rounded text-sm font-bold shadow-sm ${normalized ? bibTextClass(normalized) : 'text-charcoal-900 dark:text-charcoal-100 border border-old-money-300'}`}
      style={normalized ? bibColorStyle(normalized) : undefined}
      title={title}
    >
      {number ?? '—'}
    </span>
  )
}

export default function RacingDetail({ rawScores }: RacingDetailProps) {
  const heats = rawScores.heats || []

  return (
    <>
      <div className="md:hidden space-y-3">
        {heats.map((heat, heatIdx) => {
          const isHeatDisqualified = !heat.time && !heat.speed_kmh

          return (
            <div key={heatIdx} className="bg-white dark:bg-charcoal-800 rounded-xl p-3 border border-old-money-200 dark:border-charcoal-600">
              <div className="grid grid-cols-3 gap-2 mb-3 pb-2 border-b border-old-money-100 dark:border-charcoal-600 text-center">
                <div>
                  <div className="text-[10px] text-old-money-500 mb-1">Забег</div>
                  <div className={`font-bold ${isHeatDisqualified ? 'text-red-600' : 'text-camel-700 dark:text-camel-400'}`}>
                    {heat.heat_number || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-old-money-500 mb-1">Попона</div>
                  <PoponaCell number={heat.bib_number} color={heat.bib_color} />
                </div>
                <div>
                  <div className="text-[10px] text-old-money-500 mb-1">Время</div>
                  <div className="font-bold text-charcoal-900 dark:text-charcoal-100">
                    {heat.time ? `${heat.time} с` : '—'}
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
          </div>
        )}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs min-w-[440px]">
          <thead>
            <tr className="text-left text-old-money-600 dark:text-old-money-400">
              <th className="pb-2 pr-2">Забег</th>
              <th className="pb-2 pr-2 text-center">Попона</th>
              <th className="pb-2 pr-2 text-center">Время</th>
              <th className="pb-2 pr-2 text-center">Скорость</th>
            </tr>
          </thead>
          <tbody>
            {heats.map((heat, heatIdx) => {
              const isHeatDisqualified = !heat.time && !heat.speed_kmh

              return (
                <tr key={heatIdx} className={heatIdx > 0 ? 'border-t border-old-money-200 dark:border-charcoal-600' : ''}>
                  <td className="py-2 pr-2 font-semibold text-charcoal-900 dark:text-charcoal-100 align-middle">
                    {heat.heat_number || '—'}
                    {isHeatDisqualified && ' (отстранение)'}
                  </td>
                  <td className="py-2 pr-2 text-center align-middle">
                    <PoponaCell number={heat.bib_number} color={heat.bib_color} />
                  </td>
                  <td className={`py-2 pr-2 text-center align-middle ${isHeatDisqualified ? 'text-red-600 dark:text-red-400 italic' : 'text-charcoal-900 dark:text-charcoal-100'}`}>
                    {heat.time ? `${heat.time} сек` : '-'}
                  </td>
                  <td className={`py-2 pr-2 text-center align-middle ${isHeatDisqualified ? 'text-red-600 dark:text-red-400 italic' : 'text-camel-700 dark:text-camel-400 font-bold'}`}>
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
