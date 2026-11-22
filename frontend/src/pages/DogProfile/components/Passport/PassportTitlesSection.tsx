import React from 'react'
import type { DogPassportTitle } from './passportTypes'
import { titleBadgeClass } from '../../../../lib/qualificationTitles'

interface PassportTitlesSectionProps {
  titles: DogPassportTitle[]
}

export const PassportTitlesSection: React.FC<PassportTitlesSectionProps> = ({ titles }) => {
  if (!titles || titles.length === 0) return null

  const sections = [
    {
      key: 'supreme',
      label: 'ВЫСШИЕ',
      labelClass: 'text-amber-700 font-bold',
      items: titles.filter((t) => t.category === 'supreme'),
    },
    {
      key: 'coursing',
      label: 'КУРСИНГ',
      labelClass: 'text-[#78716C] font-bold',
      items: titles.filter((t) => t.category === 'coursing'),
    },
    {
      key: 'racing',
      label: 'РЕЙСИНГ',
      labelClass: 'text-[#78716C] font-bold',
      items: titles.filter((t) => t.category === 'racing'),
    },
    {
      key: 'shows',
      label: 'ВЫСТАВКИ',
      labelClass: 'text-[#78716C] font-bold',
      items: titles.filter((t) => t.category === 'shows'),
    },
  ].filter((s) => s.items.length > 0)

  if (sections.length === 0) return null

  return (
    <div className="mt-2.5 pt-2 border-t border-[#EAE3D6] space-y-1.5">
      {sections.map((sec) => (
        <div key={sec.key} className="grid grid-cols-[4.75rem_1fr] items-center gap-2">
          <span
            className={`text-[10px] uppercase tracking-wider select-none whitespace-nowrap ${sec.labelClass}`}
          >
            {sec.label}
          </span>
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {sec.items.map((item, i) => {
              const chipClass = titleBadgeClass(item.badge)
              const countSuffix = item.count && item.count > 1 ? ` ×${item.count}` : ''
              return (
                <div
                  key={i}
                  className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[11px] tabular-nums whitespace-nowrap shadow-2xs ${chipClass}`}
                  title={item.label}
                >
                  <span className="font-bold">
                    {item.badge}
                    {countSuffix}
                  </span>
                  {item.display && item.display !== item.badge && (
                    <span className="text-[9.5px] opacity-75 font-normal ml-0.5">
                      · {item.display}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
