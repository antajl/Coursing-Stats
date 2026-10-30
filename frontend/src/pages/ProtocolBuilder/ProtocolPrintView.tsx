import React from 'react'
import { Trophy } from 'lucide-react'
import type { CompetitionHeader, CategoryGroup, CompetitionKind } from './types'
import {
  calculateTotalScore,
  formatCategoryTitle,
  getDogOverallStatus
} from './types'
import DogSexIcon from '../../components/DogSexIcon'

export interface ProtocolPrintViewProps {
  printableRef: React.RefObject<HTMLDivElement | null>
  header: CompetitionHeader
  kind: CompetitionKind
  categories: CategoryGroup[]
}

export const ProtocolPrintView: React.FC<ProtocolPrintViewProps> = ({
  printableRef,
  header,
  kind,
  categories
}) => {
  return (
    <div className="space-y-3 pt-6 border-t-2 border-om-300/80">
      <div className="flex items-center justify-between print:hidden">
        <h2 className="text-xs font-bold uppercase tracking-wider text-char-900 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-camel-700" />
          Итоговые результаты по категориям
        </h2>
        <span className="text-xs text-char-500">
          (Отображение чистого официального протокола)
        </span>
      </div>

      {/* Лист официального протокола (для скачивания в PDF и печати) */}
      <div
        ref={printableRef}
        className="bg-white p-4 md:p-6 rounded-xl border border-om-200 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 space-y-5"
      >
        {/* ОФИЦИАЛЬНАЯ ШАПКА РЕЗУЛЬТАТОВ */}
        <div className="border-b-2 border-char-900 pb-3 mb-4 flex items-center justify-between gap-4">
          <div className="shrink-0 flex items-center">
            <img
              src="/assets/brand/logo.webp"
              alt="Coursing Stats"
              className="h-11 sm:h-12 w-auto object-contain"
            />
          </div>

          <div className="text-right min-w-0 space-y-0.5">
            <h1 className="text-base sm:text-lg font-bold uppercase tracking-wide text-char-900 leading-tight">
              {header.title || 'Протокол соревнований'}
            </h1>
            <p className="text-xs font-semibold text-char-800">
              {[
                header.rank && `Ранг: ${header.rank}`,
                header.date && `Дата: ${header.date}`,
                header.location && `Место: ${header.location}`
              ]
                .filter(Boolean)
                .join(' | ')}
            </p>
            {(header.club || header.judges) && (
              <p className="text-xs text-char-600">
                {[
                  header.club && `Организатор: ${header.club}`,
                  header.judges && `Судьи: ${header.judges}`
                ]
                  .filter(Boolean)
                  .join(' | ')}
              </p>
            )}
          </div>
        </div>

        {categories.map((cat) => {
          const sortedDogs = [...(cat.dogs || [])].sort((a, b) => {
            const statusA = getDogOverallStatus(a, cat.runsCount)
            const statusB = getDogOverallStatus(b, cat.runsCount)
            const isFinA = statusA.type === 'normal'
            const isFinB = statusB.type === 'normal'
            if (isFinA && !isFinB) return -1
            if (!isFinA && isFinB) return 1
            if (!isFinA && !isFinB) {
              if (statusA.type === 'withdrawn' && statusB.type === 'absent') return -1
              if (statusA.type === 'absent' && statusB.type === 'withdrawn') return 1
              return 0
            }
            return calculateTotalScore(b, cat.runsCount) - calculateTotalScore(a, cat.runsCount)
          })

          return (
            <div
              key={cat.id}
              className="bg-cream-50 rounded-xl border border-om-200 p-3.5 shadow-xs space-y-2.5 print:bg-white print:border-b-2 print:border-char-800 print:rounded-none print:shadow-none print:p-0 print:mb-6 print:break-inside-avoid"
            >
              <div className="flex items-center justify-between border-b border-om-200/80 pb-2">
                <h3 className="text-xs font-serif font-bold text-char-900">
                  {formatCategoryTitle(cat)}
                </h3>
                <span className="text-[11px] text-char-500">
                  Забегов: {cat.runsCount} | Участников: {cat.dogs?.length || 0}
                </span>
              </div>

              {(() => {
                const previewMinWidth =
                  kind === 'racing'
                    ? 'min-w-[650px]'
                    : cat.runsCount === 3
                    ? 'min-w-[1080px]'
                    : cat.runsCount === 1
                    ? 'min-w-[680px]'
                    : 'min-w-[880px]'

                return (
                  <div className="overflow-x-auto">
                    <div className="text-[10px] text-char-400 font-medium pb-1 md:hidden">
                      Прокручивайте таблицу вправо для просмотра всех результатов &rarr;
                    </div>
                    <table
                      className={`w-full ${previewMinWidth} print:min-w-0 text-xs text-left border-collapse table-fixed`}
                    >
                      {kind === 'racing' ? (
                        <colgroup>
                          <col style={{ width: '5%' }} />
                          <col style={{ width: '4%' }} />
                          <col style={{ width: '36%' }} />
                          <col style={{ width: '6%' }} />
                          <col style={{ width: '12%' }} />
                          <col style={{ width: '12%' }} />
                          <col style={{ width: '12%' }} />
                          <col style={{ width: '13%' }} />
                        </colgroup>
                      ) : cat.runsCount === 3 ? (
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
                      ) : cat.runsCount === 1 ? (
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
                        <tr className="border-b-2 border-char-800 text-[11px] font-bold text-char-800 bg-om-100/60 print:bg-white">
                          <th className="py-1 px-1.5 text-center">№</th>
                          <th className="py-1 px-1.5 text-center">Кат.</th>
                          <th className="py-1 px-1.5">Кличка собаки</th>
                          <th className="py-1 px-1.5 text-center">Пол</th>
                          {kind === 'racing' ? (
                            <>
                              <th className="py-1 px-1.5 text-center">1-й заезд</th>
                              <th className="py-1 px-1.5 text-center">2-й заезд</th>
                              <th className="py-1 px-1.5 text-center font-bold">Итог (сек)</th>
                              <th className="py-1 px-1.5 text-center">Титулы / Примечания</th>
                            </>
                          ) : (
                            <>
                              <th className="py-1 px-1.5 text-center">
                                {cat.runsCount === 1 ? 'Забег (Ск / Эн / Инт / Ман / Вын)' : '1 круг (С/Э/И/М/В)'}
                              </th>
                              {cat.runsCount >= 2 && (
                                <th className="py-1 px-1.5 text-center">2 круг (С/Э/И/М/В)</th>
                              )}
                              {cat.runsCount === 3 && (
                                <th className="py-1 px-1.5 text-center">3 круг (С/Э/И/М/В)</th>
                              )}
                              <th className="py-1 px-1.5 text-center font-bold">Сумма</th>
                              <th className="py-1 px-1.5 text-center">Титулы</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-om-200">
                        {(() => {
                          let runningPlace = 0
                          return sortedDogs.map((d) => {
                            const overall = getDogOverallStatus(d, cat.runsCount)
                            let placeDisplay = '—'
                            if (overall.type === 'normal') {
                              runningPlace++
                              placeDisplay = String(runningPlace)
                            } else if (overall.type === 'disqualified') {
                              placeDisplay = 'Дискв.'
                            } else if (overall.type === 'withdrawn') {
                              placeDisplay = 'Снят'
                            } else if (overall.type === 'absent') {
                              placeDisplay = 'Неявка'
                            }

                            return (
                              <tr
                                key={d.id}
                                className={`hover:bg-om-50/60 print:hover:bg-white text-xs ${
                                  overall.type !== 'normal' ? 'opacity-70 bg-om-100/30' : ''
                                }`}
                              >
                                <td className="py-1.5 px-1.5 text-center font-bold text-char-900">
                                  {placeDisplay}
                                </td>
                                <td className="py-1.5 px-1.5 text-center text-char-600 font-mono">
                                  {d.catalogNumber || '—'}
                                </td>
                                <td className="py-1.5 px-1.5 font-medium text-char-900 truncate" title={d.dogName}>
                                  {d.dogName || <span className="text-char-400 italic">Без клички</span>}
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
                                    <td className="py-1.5 px-1.5 text-center font-bold font-mono text-char-900">
                                      {overall.type !== 'normal'
                                        ? overall.label
                                        : d.racing_final_time
                                        ? `${d.racing_final_time} сек`
                                        : '—'}
                                    </td>
                                    <td className="py-1.5 px-1.5 text-center text-char-600">
                                      {overall.type === 'absent'
                                        ? '—'
                                        : [
                                            (d.awards || []).join(', '),
                                            overall.reason ? `(${overall.reason})` : ''
                                          ]
                                            .filter(Boolean)
                                            .join(' ') || '—'}
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    {Array.from({ length: cat.runsCount }).map((_, rIdx) => {
                                      const run = d.runs[rIdx]
                                      const s = run?.scores
                                      const runStatus = run?.status || 'normal'

                                      if (runStatus !== 'normal') {
                                        return (
                                          <td
                                            key={rIdx}
                                            className="py-1.5 px-1 text-center text-terracotta-700 font-semibold italic text-[11px]"
                                          >
                                            {runStatus === 'disqualified'
                                              ? 'Дисквалифицирован'
                                              : runStatus === 'withdrawn'
                                              ? 'Снят'
                                              : 'Неявка'}
                                            {run?.reason ? ` (${run.reason})` : ''}
                                          </td>
                                        )
                                      }

                                      const vals = s ? [s.speed, s.enthusiasm, s.intelligence, s.agility, s.endurance] : []
                                      const hasAny = vals.some((v) => typeof v === 'number')
                                      const runSum = vals.reduce<number>((acc, v) => acc + (typeof v === 'number' ? v : 0), 0)

                                      return (
                                        <td key={rIdx} className="py-1.5 px-1 text-center font-mono text-[11px]">
                                          {hasAny ? (
                                            <span>
                                              {vals.map((v) => (typeof v === 'number' ? v : '—')).join('/')}
                                              <span className="font-bold text-char-900 ml-1">
                                                (= {runSum})
                                              </span>
                                            </span>
                                          ) : (
                                            <span className="text-char-300">—</span>
                                          )}
                                        </td>
                                      )
                                    })}

                                    <td className="py-1.5 px-1.5 text-center font-bold text-char-900 font-mono">
                                      {overall.type !== 'normal' ? overall.label : calculateTotalScore(d, cat.runsCount)}
                                    </td>
                                    <td className="py-1.5 px-1.5 text-center text-char-600">
                                      {overall.type === 'absent'
                                        ? '—'
                                        : ((d.awards || []).join(', ')) || '—'}
                                    </td>
                                  </>
                                )}
                              </tr>
                            )
                          })
                        })()}
                      </tbody>
                    </table>
                  </div>
                )
              })()}
            </div>
          )
        })}
      </div>
    </div>
  )
}
