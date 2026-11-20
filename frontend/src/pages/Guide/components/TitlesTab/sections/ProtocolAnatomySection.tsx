import { useState } from 'react'
import { Info } from 'lucide-react'
import { SectionCard } from '../../GuideUi'
import { COL_EXPLANATIONS, type ProtocolColKey } from '../types'

export function ProtocolAnatomySection() {
  const [activeCol, setActiveCol] = useState<ProtocolColKey>('sum')

  return (
    <SectionCard id="anatomy" title="Анатомия строки протокола соревнований">
      <p className="text-xs text-charcoal-600 sm:text-sm">
        Нажмите на любую ячейку образца протокола, чтобы увидеть подробное объяснение колонки:
      </p>

      <div className="rounded-xl border border-camel-200 bg-white p-3.5 sm:p-4 shadow-2xs">
        <div className="overflow-x-auto pb-1">
          <div className="min-w-[640px] font-sans text-xs">
            {/* Шапка примера */}
            <div className="grid grid-cols-12 pb-2 text-[10px] font-bold uppercase tracking-wider text-charcoal-500 border-b border-old-money-100">
              <span className="col-span-1">№</span>
              <span className="col-span-4">Кличка собаки</span>
              <span className="col-span-2 text-center">1 круг</span>
              <span className="col-span-2 text-center">2 круг</span>
              <span className="col-span-2 text-center">Итог Σ</span>
              <span className="col-span-1 text-right">Место</span>
            </div>

            {/* Строка примера с интерактивными кнопками */}
            <div className="grid grid-cols-12 items-center py-2.5 font-medium text-charcoal-900 gap-1">
              <button
                type="button"
                onClick={() => setActiveCol('catalog')}
                className={`col-span-1 text-left font-mono font-bold p-1 rounded-md transition-all cursor-pointer ${
                  activeCol === 'catalog'
                    ? 'bg-camel-100 text-camel-950 ring-1 ring-camel-400'
                    : 'text-charcoal-500 hover:bg-old-money-50'
                }`}
              >
                12
              </button>

              <button
                type="button"
                onClick={() => setActiveCol('dog')}
                className={`col-span-4 min-w-0 pr-2 text-left p-1 rounded-md transition-all cursor-pointer ${
                  activeCol === 'dog'
                    ? 'bg-camel-100 text-camel-950 ring-1 ring-camel-400'
                    : 'hover:bg-old-money-50'
                }`}
              >
                <div className="font-bold text-charcoal-900 truncate">ДИОНИС ДЕЛАНЖЕЛ</div>
                <div className="text-[10px] text-charcoal-500 font-normal truncate">РКФ 5829104 · вл. Иванова А.</div>
              </button>

              <button
                type="button"
                onClick={() => setActiveCol('heat1')}
                className={`col-span-2 flex items-center justify-center gap-1.5 font-mono text-[11px] p-1 rounded-md transition-all cursor-pointer ${
                  activeCol === 'heat1'
                    ? 'bg-camel-100 ring-1 ring-camel-400'
                    : 'hover:bg-old-money-50'
                }`}
              >
                <span className="rounded bg-rose-100 px-1.5 py-0.5 font-bold text-rose-900 text-[10px]">Красн.</span>
                <span>89 б.</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCol('heat2')}
                className={`col-span-2 flex items-center justify-center gap-1.5 font-mono text-[11px] p-1 rounded-md transition-all cursor-pointer ${
                  activeCol === 'heat2'
                    ? 'bg-camel-100 ring-1 ring-camel-400'
                    : 'hover:bg-old-money-50'
                }`}
              >
                <span className="rounded border border-old-money-300 bg-white px-1.5 py-0.5 font-bold text-charcoal-800 text-[10px]">Бел.</span>
                <span>90 б.</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCol('sum')}
                className={`col-span-2 flex items-center justify-center gap-1 font-mono p-1 rounded-md transition-all cursor-pointer ${
                  activeCol === 'sum'
                    ? 'bg-camel-100 ring-1 ring-camel-400'
                    : 'hover:bg-old-money-50'
                }`}
              >
                <span className="font-bold text-sm text-charcoal-900">179</span>
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-950 shadow-2xs">ВС</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCol('placement')}
                className={`col-span-1 text-right p-1 rounded-md transition-all cursor-pointer ${
                  activeCol === 'placement'
                    ? 'bg-camel-100 ring-1 ring-camel-400'
                    : 'hover:bg-old-money-50'
                }`}
              >
                <span className="inline-flex items-center rounded-md bg-camel-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-camel-950 whitespace-nowrap">
                  1 [CACL]
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Интерактивная плашка-подсказка выбранной ячейки */}
        <div className="mt-3 rounded-lg border border-camel-200 bg-camel-50/70 p-3 transition-all">
          <div className="flex items-center gap-1.5 text-xs font-bold text-camel-950">
            <Info className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
            <span>{COL_EXPLANATIONS[activeCol].title}</span>
          </div>
          <p className="mt-1 text-xs text-charcoal-700 leading-relaxed">
            {COL_EXPLANATIONS[activeCol].desc}
          </p>
        </div>
      </div>
    </SectionCard>
  )
}
