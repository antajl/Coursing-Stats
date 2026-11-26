import React from 'react'
import DogSexIcon from '../../../components/DogSexIcon'
import type { CategoryGroup, CompetitionKind } from '../types'
import {
  calculateTotalScore,
  getCanonicalScoreValues,
  getDogOverallStatus,
  sortCategoryDogsForReport,
} from '../types'

interface ProtocolPrintTableProps {
  category: CategoryGroup
  kind: CompetitionKind
}

export const ProtocolPrintTable: React.FC<ProtocolPrintTableProps> = ({ category, kind }) => {
  const sortedDogs = sortCategoryDogsForReport(category.dogs, category.runsCount)
  const previewMinWidth =
    kind === 'racing'
      ? 'min-w-[650px]'
      : category.runsCount === 3
      ? 'min-w-[1060px]'
      : category.runsCount === 1
      ? 'min-w-[680px]'
      : 'min-w-[860px]'

  let runningPlace = 0

  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${previewMinWidth} print:min-w-0 text-xs text-left border-collapse table-fixed`}>
        {kind === 'racing' ? (
          <colgroup>
            <col style={{ width: '5%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '35%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '13%' }} />
          </colgroup>
        ) : category.runsCount === 3 ? (
          <colgroup>
            <col style={{ width: '4%' }} />
            <col style={{ width: '4%' }} />
            <col style={{ width: '22%' }} />
            <col style={{ width: '4%' }} />
            <col style={{ width: '17%' }} />
            <col style={{ width: '17%' }} />
            <col style={{ width: '17%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '8%' }} />
          </colgroup>
        ) : category.runsCount === 1 ? (
          <colgroup>
            <col style={{ width: '5%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '34%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '31%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '11%' }} />
          </colgroup>
        ) : (
          <colgroup>
            <col style={{ width: '4%' }} />
            <col style={{ width: '4%' }} />
            <col style={{ width: '26%' }} />
            <col style={{ width: '4%' }} />
            <col style={{ width: '24%' }} />
            <col style={{ width: '24%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '8%' }} />
          </colgroup>
        )}

        <thead>
          <tr
            data-pdf-block
            className="border-b-2 border-charcoal-800 text-[11px] font-bold text-charcoal-800 bg-om-100/70 print:bg-white"
          >
            <th className="py-1.5 px-1.5 text-center">Место</th>
            <th className="py-1.5 px-1.5 text-center">Кат.</th>
            <th className="py-1.5 px-1.5">Кличка собаки</th>
            <th className="py-1.5 px-1.5 text-center">Пол</th>
            {kind === 'racing' ? (
              <>
                <th className="py-1.5 px-1.5 text-center">1-й заезд</th>
                <th className="py-1.5 px-1.5 text-center">2-й заезд</th>
                <th className="py-1.5 px-1.5 text-center font-bold">Итог (сек)</th>
                <th className="py-1.5 px-1.5 text-center">Титулы / Прим.</th>
              </>
            ) : (
              <>
                <th className="py-1.5 px-1.5 text-center">
                  {category.runsCount === 1 ? 'Забег (М / Р / В / П / Э)' : '1 круг (М/Р/В/П/Э)'}
                </th>
                {category.runsCount >= 2 && (
                  <th className="py-1.5 px-1.5 text-center">2 круг (М/Р/В/П/Э)</th>
                )}
                {category.runsCount === 3 && (
                  <th className="py-1.5 px-1.5 text-center">3 круг (М/Р/В/П/Э)</th>
                )}
                <th className="py-1.5 px-1.5 text-center font-bold">Сумма</th>
                <th className="py-1.5 px-1.5 text-center">Титулы</th>
              </>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-om-200">
          {sortedDogs.map((d) => {
            const overall = getDogOverallStatus(d, category.runsCount)
            let placeDisplay = '—'
            if (overall.type === 'normal') {
              runningPlace++
              placeDisplay = String(runningPlace)
            } else if (overall.type === 'disqualified' || overall.type === 'withdrawn') {
              placeDisplay = 'Дискв.'
            } else if (overall.type === 'absent') {
              placeDisplay = 'Неявка'
            }

            return (
              <tr
                key={d.id}
                data-pdf-block
                className={`hover:bg-om-50/70 print:hover:bg-white print:break-inside-avoid text-xs ${
                  overall.type !== 'normal' ? 'opacity-75 bg-om-100/40' : ''
                }`}
              >
                <td className="py-1.5 px-1.5 text-center font-bold text-charcoal-900">{placeDisplay}</td>
                <td className="py-1.5 px-1.5 text-center text-charcoal-700 font-mono">
                  {d.catalogNumber || '—'}
                </td>
                <td className="py-1.5 px-1.5 font-semibold text-charcoal-900 truncate" title={d.dogName}>
                  {d.dogName || <span className="text-charcoal-500 italic font-normal">Без клички</span>}
                </td>
                <td className="py-1.5 px-1.5 text-center">
                  <div className="flex justify-center">
                    <DogSexIcon sex={d.sex} size={14} />
                  </div>
                </td>

                {kind === 'racing' ? (
                  <>
                    <td className="py-1.5 px-1.5 text-center font-mono">
                      {d.racing_time1 ? `${d.racing_time1} сек` : '—'}
                    </td>
                    <td className="py-1.5 px-1.5 text-center font-mono">
                      {d.racing_time2 ? `${d.racing_time2} сек` : '—'}
                    </td>
                    <td className="py-1.5 px-1.5 text-center font-bold font-mono text-charcoal-900">
                      {overall.type !== 'normal'
                        ? overall.label
                        : d.racing_final_time
                        ? `${d.racing_final_time} сек`
                        : '—'}
                    </td>
                    <td className="py-1.5 px-1.5 text-center text-charcoal-700">
                      {overall.type === 'absent'
                        ? '—'
                        : [(d.awards || []).join(', '), overall.reason ? `(${overall.reason})` : '']
                            .filter(Boolean)
                            .join(' ') || '—'}
                    </td>
                  </>
                ) : (
                  <>
                    {Array.from({ length: category.runsCount }).map((_, rIdx) => {
                      const run = d.runs[rIdx]
                      const runStatus = run?.status || 'normal'

                      if (runStatus !== 'normal') {
                        return (
                          <td
                            key={rIdx}
                            className="py-1.5 px-1 text-center text-terracotta-700 font-semibold italic text-[11px]"
                          >
                            {runStatus === 'withdrawn' ? 'Снят' : 'Неявка'}
                            {run?.reason ? ` (${run.reason})` : ''}
                          </td>
                        )
                      }

                      const vals = getCanonicalScoreValues(run?.scores)
                      const hasAny = vals.some((v) => typeof v === 'number')
                      const runSum = vals.reduce<number>((acc, v) => acc + (typeof v === 'number' ? v : 0), 0)

                      return (
                        <td key={rIdx} className="py-1.5 px-1 text-center font-mono text-[11px]">
                          {hasAny ? (
                            <span>
                              {vals.map((v) => (typeof v === 'number' ? v : '—')).join('/')}
                              <span className="font-bold text-charcoal-900 ml-1">(= {runSum})</span>
                            </span>
                          ) : (
                            <span className="text-charcoal-400">—</span>
                          )}
                        </td>
                      )
                    })}

                    <td className="py-1.5 px-1.5 text-center font-bold text-charcoal-900 font-mono">
                      {overall.type !== 'normal' ? overall.label : calculateTotalScore(d, category.runsCount)}
                    </td>
                    <td className="py-1.5 px-1.5 text-center text-charcoal-700">
                      {overall.type === 'absent' ? '—' : (d.awards || []).join(', ') || '—'}
                    </td>
                  </>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
