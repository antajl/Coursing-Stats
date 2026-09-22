import { useEffect, useMemo, useState } from 'react'
import ToolbarChip from '../../../components/toolbar/ToolbarChip'
import { TOOLTIP } from '../../../lib/constants'
import HoverTooltip from '../../../components/ui/HoverTooltip'
import { awardTooltipForToken } from '../../../lib/awardTooltip'
import { SHOW_AWARD_CHIP_CLASS } from '../../../lib/ShowGradeChip'
import { ExhibitionDogNameLink } from './ExhibitionDogNameLink'
import { groupMainRing } from './exhibitionDetailUtils'
import type { MainRingRow } from './types'

function MainRingResultsTable({ rows }: { rows: MainRingRow[] }) {
  const placementClass = (place: number) => {
    if (place === 1) return 'font-bold text-camel-700'
    if (place === 2 || place === 3) return 'font-semibold text-charcoal-800'
    return 'text-charcoal-600'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed divide-y divide-old-money-200 text-sm">
        <thead>
          <tr className="border-b border-old-money-200">
            <th className="w-16 px-1.5 py-2 text-center text-xs font-bold uppercase tracking-wide text-charcoal-700">
              Место
            </th>
            <th className="px-2.5 py-2 text-left text-xs font-bold uppercase tracking-wide text-charcoal-700">
              Собака
            </th>
            <th className="w-[38%] px-2.5 py-2 text-left text-xs font-bold uppercase tracking-wide text-charcoal-700">
              Порода
            </th>
            <th className="w-[6.5rem] px-2 py-2 text-left text-xs font-bold uppercase tracking-wide text-charcoal-700">
              Награды
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-old-money-100">
          {rows.map((row) => (
            <tr
              key={`${row.place}-${row.catalog_number}-${row.dog_name}`}
              className="transition-colors hover:bg-old-money-50/80"
            >
              <td className={`px-1.5 py-2.5 text-center tabular-nums ${placementClass(row.place)}`}>
                {row.place > 0 ? row.place : ''}
              </td>
              <td className="min-w-0 px-2.5 py-2.5 font-medium text-charcoal-900">
                <ExhibitionDogNameLink
                  dogName={row.dog_name}
                  breed={row.breed}
                  catalogNumber={row.catalog_number}
                />
              </td>
              <td className="px-2.5 py-2.5 text-xs leading-snug text-charcoal-600">
                <span className="block truncate" title={row.breed || undefined}>
                  {row.breed || '—'}
                </span>
              </td>
              <td className="px-2 py-2.5 text-xs font-medium text-camel-800">
                {row.award_badge ? (
                  <HoverTooltip
                    label={awardTooltipForToken(row.award_badge)}
                    placement="top"
                    variant="site"
                    delayMs={TOOLTIP.DELAY_NONE}
                    portal
                  >
                    <span className={SHOW_AWARD_CHIP_CLASS} tabIndex={0}>
                      {row.award_badge}
                    </span>
                  </HoverTooltip>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function MainRingSection({
  rows,
  bisUrl,
}: {
  rows: MainRingRow[]
  bisUrl?: string | null
}) {
  const tabs = useMemo(() => groupMainRing(rows), [rows])
  const [activeId, setActiveId] = useState(() => tabs[0]?.id ?? '')

  useEffect(() => {
    if (tabs.length === 0) {
      setActiveId('')
      return
    }
    if (!tabs.some((t) => t.id === activeId)) {
      setActiveId(tabs[0]!.id)
    }
  }, [tabs, activeId])

  if (rows.length === 0) {
    if (!bisUrl) return null
    return (
      <section className="mb-4 rounded-xl border border-old-money-200 bg-cream-50/80 p-3">
        <h2 className="font-serif text-base font-bold text-charcoal-900">
          Главный ринг
        </h2>
        <p className="mt-1 text-sm text-charcoal-600">
          Ведомость ещё не разобрана.{' '}
          <a
            href={bisUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-camel-700 underline-offset-2 hover:underline"
          >
            PDF на tables.rkf.org.ru
          </a>
        </p>
      </section>
    )
  }

  const active = tabs.find((t) => t.id === activeId) ?? tabs[0]

  return (
    <section className="mb-4 rounded-xl border border-old-money-200 bg-cream-50/80 p-3">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-base font-bold text-charcoal-900 md:text-lg">
          Главный ринг
        </h2>
        {bisUrl ? (
          <a
            href={bisUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-camel-700 underline-offset-2 hover:underline"
          >
            PDF ведомости
          </a>
        ) : null}
      </div>

      <div className="-mx-0.5 mb-3 flex gap-1.5 overflow-x-auto px-0.5 pb-0.5">
        {tabs.map((tab) => (
          <ToolbarChip
            key={tab.id}
            active={tab.id === active?.id}
            onClick={() => setActiveId(tab.id)}
            className="shrink-0"
          >
            <span title={tab.label}>{tab.shortLabel}</span>
          </ToolbarChip>
        ))}
      </div>

      {active ? (
        <>
          <h3 className="mb-2 font-serif text-sm font-bold leading-snug text-charcoal-900 md:text-base">
            {active.label}
          </h3>
          <MainRingResultsTable rows={active.rows} />
        </>
      ) : null}
    </section>
  )
}
