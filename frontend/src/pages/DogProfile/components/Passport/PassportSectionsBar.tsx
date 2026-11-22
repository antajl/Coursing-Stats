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
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE3D6] px-4 sm:px-6 py-2 bg-[#F7F4EE]/70 text-xs text-[#78716C] shrink-0">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="font-serif font-bold text-[#8C6D37] text-[10px] uppercase tracking-wider">
          Разделы:
        </span>
        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={sections.coursing}
            onChange={(e) => setSections((prev) => ({ ...prev, coursing: e.target.checked }))}
            className="rounded border-[#D5C9B8] text-[#8C6D37] focus:ring-0"
          />
          <span className={sections.coursing ? 'font-semibold text-[#1C1917]' : 'text-[#8C7E6A]'}>
            Курсинг
          </span>
        </label>
        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={sections.racing}
            onChange={(e) => setSections((prev) => ({ ...prev, racing: e.target.checked }))}
            className="rounded border-[#D5C9B8] text-[#8C6D37] focus:ring-0"
          />
          <span className={sections.racing ? 'font-semibold text-[#1C1917]' : 'text-[#8C7E6A]'}>
            Рейсинг
          </span>
        </label>
        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={sections.shows}
            onChange={(e) => setSections((prev) => ({ ...prev, shows: e.target.checked }))}
            className="rounded border-[#D5C9B8] text-[#8C6D37] focus:ring-0"
          />
          <span className={sections.shows ? 'font-semibold text-[#1C1917]' : 'text-[#8C7E6A]'}>
            Выставки
          </span>
        </label>
        {hasTitles && (
          <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sections.titles}
              onChange={(e) => setSections((prev) => ({ ...prev, titles: e.target.checked }))}
              className="rounded border-[#D5C9B8] text-[#8C6D37] focus:ring-0"
            />
            <span className={sections.titles ? 'font-semibold text-[#1C1917]' : 'text-[#8C7E6A]'}>
              Звания
            </span>
          </label>
        )}
      </div>
      <span className="hidden md:inline text-[11px] text-[#A89F91] italic">
        Снимите галочку, чтобы скрыть дисциплину
      </span>
    </div>
  )
}
