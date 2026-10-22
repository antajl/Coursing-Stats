import { useState } from 'react'
import { Info, FileText } from 'lucide-react'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ToolbarTip from '../../components/toolbar/ToolbarTip'
import ModernDropdown from '../../components/ui/ModernDropdown'
import MonthYearDropdown from '../../components/toolbar/MonthYearDropdown'
import { LEGEND_DOT_COLOR } from './eventListUtils'
import { resolveActiveSeason } from '../../lib/season'

export const CURRENT_SEASON = resolveActiveSeason()

export const DISCIPLINE_OPTIONS = [
  { value: 'coursing', label: 'Курсинг' },
  { value: 'bzmp', label: 'БЗМП' },
  { value: 'racing', label: 'Бега' },
] as const

const LEGEND = [
  { key: 'coursing', label: 'Курсинг', tip: 'Курсинг борзых' },
  { key: 'bzmp', label: 'БЗМП', tip: 'Бега за механическим зайцем (БЗМП)' },
  { key: 'racing', label: 'Бега', tip: 'Бега борзых' },
  { key: 'other', label: 'Другие', tip: 'Прочие дисциплины' },
] as const

export const ARCHIVE_MODAL_CONTENT = (
  <div className="p-3.5 space-y-2.5 text-charcoal-800">
    <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900 border-b border-old-money-200/80 pb-2">
      <Info className="h-4 w-4 text-camel-700 shrink-0" aria-hidden />
      <span>Общественный архив соревнований</span>
    </div>
    <p className="text-[11px] leading-relaxed text-charcoal-700">
      Раздел сохраняет спортивную историю забегов на основе официальных протоколов соревнований и архивов ProCoursing.ru.
    </p>
    <div className="border-t border-old-money-200/80 pt-2.5 text-[10.5px] leading-relaxed text-charcoal-600 flex items-start gap-1.5">
      <FileText className="h-3.5 w-3.5 text-camel-700 shrink-0 mt-0.5" aria-hidden />
      <p>
        <strong className="text-charcoal-800 font-semibold">Примечание:</strong> сведения могут содержать ошибки или быть неполными из-за фрагментарности открытых источников и ручного ведения ранних баз организаторами. Проект не является официальным сайтом РКФ.
      </p>
    </div>
  </div>
)

export type EventsToolbarProps = {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterYear: string
  onFilterYearChange: (year: string) => void
  filterMonth: string
  onFilterMonthChange: (month: string) => void
  filterDiscipline: string
  onFilterDisciplineChange: (discipline: string) => void
  filterWithProtocol: boolean
  onFilterWithProtocolChange: (value: boolean) => void
  sortedYears: string[]
  onResetFilters: () => void
  /** When omitted (loading), stats row is hidden. */
  stats?: {
    total: number
    filtered: number
    withResult: number
  }
}

export default function EventsToolbar({
  searchQuery,
  onSearchChange,
  filterYear,
  onFilterYearChange,
  filterMonth,
  onFilterMonthChange,
  filterDiscipline,
  onFilterDisciplineChange,
  sortedYears,
  stats,
}: EventsToolbarProps) {
  const [monthYearDropdownOpen, setMonthYearDropdownOpen] = useState(false)

  const disciplineLabel =
    DISCIPLINE_OPTIONS.find((d) => d.value === filterDiscipline)?.label || 'Дисциплина'

  const handleDisciplineToggle = (d: string) => {
    onFilterDisciplineChange(filterDiscipline === d ? '' : d)
  }

  const filters = (
    <>
      <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
        <ToolbarSearch
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Название, клуб, регион…"
          className="w-full min-w-0 sm:w-auto sm:min-w-[190px]"
        />
      </div>

      <div className="flex max-w-full flex-wrap items-center gap-1.5 sm:gap-2">
        <MonthYearDropdown
          isOpen={monthYearDropdownOpen}
          onOpenChange={setMonthYearDropdownOpen}
          filterYear={filterYear}
          onFilterYearChange={onFilterYearChange}
          filterMonth={filterMonth}
          onFilterMonthChange={onFilterMonthChange}
          sortedYears={sortedYears}
        />

        <div className="flex items-center gap-1 rounded-full border border-old-money-200/80 bg-cream-50 p-0.5">
          {DISCIPLINE_OPTIONS.map((d) => {
            const active = filterDiscipline === d.value
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => handleDisciplineToggle(d.value)}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'bg-camel-500 text-charcoal-900 shadow-2xs'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-200/60'
                }`}
                aria-pressed={active}
              >
                {d.label}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )

  const trailing = (
    <ModernDropdown
      trigger={
        <button
          type="button"
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-old-money-300/80 bg-cream-50 px-3 text-xs font-semibold text-charcoal-800 hover:border-camel-500 hover:bg-cream-100 hover:text-charcoal-900 transition-all cursor-pointer shadow-2xs"
          aria-label="Об открытом архиве и источниках"
        >
          <Info className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
          <span>Об архиве</span>
        </button>
      }
      width="340px"
      portal
    >
      {ARCHIVE_MODAL_CONTENT}
    </ModernDropdown>
  )

  const legend = (
    <div className="flex items-center justify-end gap-x-2 sm:gap-x-3.5 gap-y-1">
      {LEGEND.map(({ key, label, tip }) => (
        <ToolbarTip key={key} label={tip}>
          <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-charcoal-500 whitespace-nowrap">
            <span className={`h-2 w-2 rounded-sm shrink-0 ${LEGEND_DOT_COLOR[key]}`} />
            {label}
          </span>
        </ToolbarTip>
      ))}
    </div>
  )

  return (
    <PageToolbar
      bare
      filters={filters}
      trailing={trailing}
      bottomLeft={
        stats ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="hidden sm:inline text-xs text-charcoal-500">
              {`Всего событий: ${stats.total} · отфильтровано: ${stats.filtered} · с результатом: ${stats.withResult}`}
              {filterDiscipline && <span> · {disciplineLabel}</span>}
            </p>
            <p className="sm:hidden text-[11px] text-charcoal-500 whitespace-nowrap">
              {stats.filtered === stats.total
                ? `${stats.total} соб. · рез: ${stats.withResult}`
                : `${stats.filtered}/${stats.total} · рез: ${stats.withResult}`}
            </p>
          </div>
        ) : undefined
      }
      bottomRight={legend}
    />
  )
}
