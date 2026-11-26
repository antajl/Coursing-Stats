import React from 'react'
import { Trophy } from 'lucide-react'
import type { CompetitionHeader, CategoryGroup, CompetitionKind } from './types'
import { formatCategoryTitle } from './types'
import { ProtocolPrintTable } from './components/ProtocolPrintTable'

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
  categories,
}) => {
  return (
    <div className="space-y-3 pt-6 border-t-2 border-om-300/80">
      <div className="flex items-center justify-between print:hidden">
        <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-camel-700" />
          Итоговые результаты по категориям
        </h2>
        <span className="text-xs text-charcoal-600">(Печатная форма и экспорт PDF)</span>
      </div>

      <div
        ref={printableRef}
        className="bg-white p-4 md:p-6 rounded-2xl border border-om-200 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 space-y-5"
      >
        <div
          data-pdf-block
          className="border-b-2 border-charcoal-900 pb-3 mb-4 flex items-center justify-between gap-4"
        >
          <div className="shrink-0 flex items-center">
            <img
              src="/assets/brand/logo.webp"
              alt="Курсинг Статс"
              className="h-11 sm:h-12 w-auto object-contain"
            />
          </div>

          <div className="text-right min-w-0 space-y-0.5">
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-charcoal-900 leading-tight">
              {header.title || 'Протокол соревнований'}
            </h2>
            <p className="text-xs font-semibold text-charcoal-800">
              {[
                header.rank && `Ранг: ${header.rank}`,
                header.date && `Дата: ${header.date}`,
                header.location && `Место: ${header.location}`,
              ]
                .filter(Boolean)
                .join(' | ')}
            </p>
            {(header.club || header.judges) && (
              <p className="text-xs text-charcoal-700">
                {[
                  header.club && `Организатор: ${header.club}`,
                  header.judges && `Судьи: ${header.judges}`,
                ]
                  .filter(Boolean)
                  .join(' | ')}
              </p>
            )}
          </div>
        </div>

        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-cream-50 rounded-xl border border-om-200 p-3.5 shadow-xs space-y-2.5 print:bg-white print:border-b-2 print:border-charcoal-800 print:rounded-none print:shadow-none print:p-0 print:mb-6"
          >
            <div data-pdf-block className="flex items-center justify-between border-b border-om-200/80 pb-2">
              <h3 className="text-xs font-serif font-bold text-charcoal-900">
                {formatCategoryTitle(cat)}
              </h3>
              <span className="text-[11px] text-charcoal-700">
                Забегов: {cat.runsCount} | Участников: {cat.dogs?.length || 0}
              </span>
            </div>

            <ProtocolPrintTable category={cat} kind={kind} />
          </div>
        ))}
      </div>
    </div>
  )
}
