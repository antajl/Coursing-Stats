import React from 'react'
import type { PassportSectionsConfig } from './passportTypes'

interface PassportSectionsBarProps {
  sections: PassportSectionsConfig
  setSections: React.Dispatch<React.SetStateAction<PassportSectionsConfig>>
  hasTitles: boolean
}

export const PassportSectionsBar: React.FC<PassportSectionsBarProps> = ({
  sections,
  setSections,
  hasTitles,
}) => {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-old-money-200 px-3 sm:px-6 py-2 bg-cream-100/70 text-[11px] sm:text-xs text-charcoal-500 shrink-0 overflow-x-auto no-scrollbar">
      <div className="flex flex-nowrap items-center justify-between sm:justify-start w-full sm:w-auto gap-x-3 sm:gap-x-4 whitespace-nowrap">
        <span className="hidden sm:inline font-serif font-bold text-camel-700 text-[10px] uppercase tracking-wider shrink-0">
          Разделы:
        </span>
        <label className="inline-flex items-center gap-1 sm:gap-1.5 cursor-pointer select-none shrink-0">
          <input
            type="checkbox"
            checked={sections.coursing}
            onChange={(e) => setSections((prev) => ({ ...prev, coursing: e.target.checked }))}
            className="rounded border-old-money-300 text-camel-700 focus:ring-0"
          />
          <span className={sections.coursing ? 'font-semibold text-charcoal-900' : 'text-charcoal-500'}>
            Курсинг
          </span>
        </label>
        <label className="inline-flex items-center gap-1 sm:gap-1.5 cursor-pointer select-none shrink-0">
          <input
            type="checkbox"
            checked={sections.racing}
            onChange={(e) => setSections((prev) => ({ ...prev, racing: e.target.checked }))}
            className="rounded border-old-money-300 text-camel-700 focus:ring-0"
          />
          <span className={sections.racing ? 'font-semibold text-charcoal-900' : 'text-charcoal-500'}>
            Рейсинг
          </span>
        </label>
        <label className="inline-flex items-center gap-1 sm:gap-1.5 cursor-pointer select-none shrink-0">
          <input
            type="checkbox"
            checked={sections.shows}
            onChange={(e) => setSections((prev) => ({ ...prev, shows: e.target.checked }))}
            className="rounded border-old-money-300 text-camel-700 focus:ring-0"
          />
          <span className={sections.shows ? 'font-semibold text-charcoal-900' : 'text-charcoal-500'}>
            Выставки
          </span>
        </label>
        {hasTitles && (
          <label className="inline-flex items-center gap-1 sm:gap-1.5 cursor-pointer select-none shrink-0">
            <input
              type="checkbox"
              checked={sections.titles}
              onChange={(e) => setSections((prev) => ({ ...prev, titles: e.target.checked }))}
              className="rounded border-old-money-300 text-camel-700 focus:ring-0"
            />
            <span className={sections.titles ? 'font-semibold text-charcoal-900' : 'text-charcoal-500'}>
              Звания
            </span>
          </label>
        )}
      </div>
      <span className="hidden md:inline text-[11px] text-charcoal-400 italic shrink-0">
        Снимите галочку, чтобы скрыть дисциплину
      </span>
    </div>
  )
}
