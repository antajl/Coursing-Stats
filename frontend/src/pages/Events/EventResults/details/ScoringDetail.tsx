import React from 'react'
import type { RawScores, Result } from '../types'
import { bibColorStyle } from '../utils'
import { displayStatusReason } from '../../../../lib/statusReason'

interface ScoringDetailProps {
  rawScores: RawScores
  result: Result
}

export default function ScoringDetail({ rawScores, result }: ScoringDetailProps) {
  const heats = rawScores.heats || []
  const statusLabel = displayStatusReason(result.status_reason)

  return (
    <>
      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {heats.map((heat, heatIdx) => {
          const isHeatDisqualified = heat.disqualified

          return (
            <div key={heatIdx} className="bg-white dark:bg-charcoal-800 rounded-xl p-3 border border-old-money-200 dark:border-charcoal-600">
              <div className="flex items-center justify-center gap-2 mb-3 pb-2 border-b border-old-money-100 dark:border-charcoal-600">
                {heat.bib_color && (
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={bibColorStyle(heat.bib_color)}
                  />
                )}
                <span className={`font-bold ${isHeatDisqualified ? 'text-red-600 dark:text-red-400' : 'text-camel-700 dark:text-camel-400'}`}>
                  Забег {heat.bib_number || heatIdx + 1}
                  {isHeatDisqualified && ' (отстранение)'}
                </span>
              </div>

              {isHeatDisqualified ? (
                <div className="text-center text-red-600 dark:text-red-400 italic text-sm py-2">
                  {heat.disqualification_reason || statusLabel || 'Отстранение'}
                </div>
              ) : (
                <div className="space-y-2">
                  {heat.judges && heat.judges.map((judge, judgeIdx) => {
                    const judgeLabel = judgeIdx === 0 ? 'Главный судья' : `Судья ${judgeIdx}`
                    const hasScores = judge.scores && judge.scores.some(s => s !== null)

                    if (!hasScores) return null

                    return (
                      <div key={judgeIdx} className="bg-old-money-50 dark:bg-charcoal-700 rounded-lg p-2">
                        <div className="text-xs font-medium text-old-money-700 dark:text-old-money-300 mb-2">{judgeLabel}</div>
                        <div className="grid grid-cols-5 gap-1 text-xs text-center">
                          <div className="bg-white dark:bg-charcoal-800 rounded p-1">
                            <div className="text-gray-500 dark:text-gray-400 text-[10px]">М</div>
                            <div className="font-bold text-charcoal-900 dark:text-charcoal-100">{judge.scores![0] !== null ? judge.scores![0] : '-'}</div>
                          </div>
                          <div className="bg-white dark:bg-charcoal-800 rounded p-1">
                            <div className="text-gray-500 dark:text-gray-400 text-[10px]">Р</div>
                            <div className="font-bold text-charcoal-900 dark:text-charcoal-100">{judge.scores![1] !== null ? judge.scores![1] : '-'}</div>
                          </div>
                          <div className="bg-white dark:bg-charcoal-800 rounded p-1">
                            <div className="text-gray-500 dark:text-gray-400 text-[10px]">В</div>
                            <div className="font-bold text-charcoal-900 dark:text-charcoal-100">{judge.scores![2] !== null ? judge.scores![2] : '-'}</div>
                          </div>
                          <div className="bg-white dark:bg-charcoal-800 rounded p-1">
                            <div className="text-gray-500 dark:text-gray-400 text-[10px]">П</div>
                            <div className="font-bold text-charcoal-900 dark:text-charcoal-100">{judge.scores![3] !== null ? judge.scores![3] : '-'}</div>
                          </div>
                          <div className="bg-white dark:bg-charcoal-800 rounded p-1">
                            <div className="text-gray-500 dark:text-gray-400 text-[10px]">Э</div>
                            <div className="font-bold text-charcoal-900 dark:text-charcoal-100">{judge.scores![4] !== null ? judge.scores![4] : '-'}</div>
                          </div>
                        </div>
                        <div className="mt-2 text-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Сумма: </span>
                          <span className="text-sm font-bold text-camel-700 dark:text-camel-400">{judge.sum || '-'}</span>
                        </div>
                      </div>
                    )
                  })}
                  {heat.total && (
                    <div className="text-center pt-2 border-t border-old-money-200 dark:border-charcoal-600">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Итого: </span>
                      <span className="text-sm font-bold text-camel-700 dark:text-camel-400">{heat.total}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {rawScores.grand_total && (
          <div className="rounded-xl border border-camel-200 dark:border-camel-600 bg-camel-50 dark:bg-charcoal-700 p-3 text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Общий итог: </span>
            <span className="text-lg font-bold text-camel-700 dark:text-camel-400">{rawScores.grand_total}</span>
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs min-w-[500px] md:min-w-[600px]">
          <thead>
            <tr className="text-left text-old-money-600 dark:text-old-money-400">
              <th className="pb-1 pr-2" title="Судья">Судья</th>
              {heats.map((heat, heatIdx) => (
                <React.Fragment key={heatIdx}>
                  <th className={`pb-1 pr-2 text-center ${heatIdx > 0 ? 'border-l-2 border-old-money-200 dark:border-charcoal-600' : ''}`} colSpan={6}>
                    <div className="flex items-center justify-center gap-1">
                      {heat.bib_color && (
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={bibColorStyle(heat.bib_color)}
                        />
                      )}
                      <span className={heat.disqualified ? 'text-red-600 dark:text-red-400' : ''}>
                        Забег {heat.bib_number || heatIdx + 1}
                        {heat.disqualified && ' (отстранение)'}
                      </span>
                    </div>
                  </th>
                </React.Fragment>
              ))}
            </tr>
            <tr className="text-left text-old-money-600 dark:text-old-money-400">
              <th className="pb-1 pr-2"></th>
              {heats.map((heat, heatIdx) => (
                <React.Fragment key={heatIdx}>
                  <th className={`pb-1 pr-2 text-center ${heatIdx > 0 ? 'border-l-2 border-old-money-200 dark:border-charcoal-600' : ''}`} title="Маневренность">М</th>
                  <th className="pb-1 pr-2 text-center" title="Резвость">Р</th>
                  <th className="pb-1 pr-2 text-center" title="Выносливость">В</th>
                  <th className="pb-1 pr-2 text-center" title="Преследование">П</th>
                  <th className="pb-1 pr-2 text-center" title="Энтузиазм">Э</th>
                  <th className="pb-1 text-center font-bold" title="Сумма">Сум</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {(() => {
              const judgesCount = heats[0]?.judges?.length || 0

              if (judgesCount === 0) return null

              return Array.from({ length: judgesCount }).map((_, judgeIdx) => {
                const judgeLabel = judgeIdx === 0 ? 'Главный судья' : 'Судья'

                return (
                  <tr key={`judge${judgeIdx}`} className={judgeIdx > 0 ? "border-t border-old-money-200 dark:border-charcoal-600" : ""}>
                    <td className="py-1 pr-2 text-charcoal-900 dark:text-charcoal-100">{judgeLabel}</td>
                    {heats.map((heat, heatIdx) => {
                      const heatJudge = heat.judges![judgeIdx]
                      const heatHasScores = heatJudge && heatJudge.scores && heatJudge.scores.some(s => s !== null)
                      const isHeatDisqualified = heat.disqualified

                      return (
                        <React.Fragment key={`heat${heatIdx}`}>
                          {heatHasScores ? (
                            <>
                              <td className={`py-1 pr-2 text-center ${heatIdx > 0 ? 'border-l-2 border-old-money-200 dark:border-charcoal-600' : ''} text-charcoal-900 dark:text-charcoal-100`}>{heatJudge.scores![0] !== null ? heatJudge.scores![0] : '-'}</td>
                              <td className="py-1 pr-2 text-center text-charcoal-900 dark:text-charcoal-100">{heatJudge.scores![1] !== null ? heatJudge.scores![1] : '-'}</td>
                              <td className="py-1 pr-2 text-center text-charcoal-900 dark:text-charcoal-100">{heatJudge.scores![2] !== null ? heatJudge.scores![2] : '-'}</td>
                              <td className="py-1 pr-2 text-center text-charcoal-900 dark:text-charcoal-100">{heatJudge.scores![3] !== null ? heatJudge.scores![3] : '-'}</td>
                              <td className="py-1 pr-2 text-center text-charcoal-900 dark:text-charcoal-100">{heatJudge.scores![4] !== null ? heatJudge.scores![4] : '-'}</td>
                              <td className="py-1 text-center font-bold text-old-money-800 dark:text-old-money-300">{heatJudge.sum || '-'}</td>
                            </>
                          ) : (
                            <td className={`py-1 pr-2 text-center italic text-red-600 dark:text-red-400 ${heatIdx > 0 ? 'border-l-2 border-old-money-200 dark:border-charcoal-600' : ''}`} colSpan={6}>
                              {isHeatDisqualified ? heat.disqualification_reason : (result.status === 'disqualified' ? statusLabel || 'Отстранение' : result.status === 'dns' ? 'Неявка' : '-')}
                            </td>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </tr>
                )
              })
            })()}
            {rawScores.grand_total && (
              <tr className="border-t border-old-money-200 dark:border-charcoal-600">
                <td className="py-1 pr-2 font-bold text-camel-700 dark:text-camel-400">Итого</td>
                {heats.map((heat, heatIdx) => (
                  <React.Fragment key={heatIdx}>
                    <td className={`py-1 pr-2 text-center font-bold text-camel-700 dark:text-camel-400 ${heatIdx > 0 ? 'border-l-2 border-old-money-200 dark:border-charcoal-600' : ''}`} colSpan={6}>{heat.total || '-'}</td>
                  </React.Fragment>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
