import { useState } from 'react'
import { Info, FileText, ChevronDown, X } from 'lucide-react'
import { toolbarPillTriggerClass } from '../../lib/toolbar'
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
      Раздел сохраняет спортивную историю забегов на основе официальных протоколов организаторов, полевых секретариатов и материалов ProCoursing.ru.
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
  availableMonthsByYear?: Record<string, string[] | Set<string>>
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
  filterWithProtocol,
  onFilterWithProtocolChange: _onFilterWithProtocolChange,
  sortedYears,
  onResetFilters,
  availableMonthsByYear,
  stats,
}: EventsToolbarProps) {
  const [disciplineDropdownOpen, setDisciplineDropdownOpen] = useState(false)
  const disciplineLabel =
    DISCIPLINE_OPTIONS.find((d) => d.value === filterDiscipline)?.label || 'Дисциплина'

  const isYearNonDefault = filterYear !== '' && filterYear !== CURRENT_SEASON
  const hasActiveFilters = Boolean(
    isYearNonDefault || filterMonth || filterDiscipline || searchQuery || filterWithProtocol,
  )

  const handleDisciplineToggle = (d: string) => {
    onFilterDisciplineChange(filterDiscipline === d ? '' : d)
  }

  const trailing = (
    <ModernDropdown
      closeOnScroll
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

  const trailingMobile = (
    <ModernDropdown
      closeOnScroll
      trigger={
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-old-money-300/80 bg-cream-50 text-xs font-semibold text-charcoal-800 hover:border-camel-500 hover:bg-cream-100 transition-all cursor-pointer shadow-2xs"
          aria-label="Об архиве и источниках"
          title="Об архиве"
        >
          <Info className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
        </button>
      }
      width="320px"
      portal
    >
      {ARCHIVE_MODAL_CONTENT}
    </ModernDropdown>
  )

  const filters = (
    <div className="w-full min-w-0">
      {/* Мобильная строка (32px): Поиск + Год/Месяц + Дисциплина + (i) */}
      <div className="flex sm:hidden items-center gap-1.5 w-full min-w-0">
        <ToolbarSearch
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Поиск…"
        />

        <MonthYearDropdown
          selectedYear={filterYear}
          onSelectYear={onFilterYearChange}
          selectedMonth={filterMonth}
          onSelectMonth={onFilterMonthChange}
          sortedYears={sortedYears}
          currentSeason={CURRENT_SEASON}
          availableMonthsByYear={availableMonthsByYear}
        />

        <div className="shrink-0">
          <ModernDropdown
            trigger={
              <button
                type="button"
                className={`shrink-0 ${toolbarPillTriggerClass(Boolean(filterDiscipline))}`}
              >
                <span>{filterDiscipline ? disciplineLabel : 'Дисциплина'}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              </button>
            }
            isOpen={disciplineDropdownOpen}
            onOpenChange={setDisciplineDropdownOpen}
            width="160px"
          >
            <div className="p-1 max-h-60 overflow-y-auto" role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onFilterDisciplineChange('')
                  setDisciplineDropdownOpen(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  !filterDiscipline
                    ? 'bg-camel-500 text-charcoal-900 font-semibold'
                    : 'text-charcoal-700 hover:bg-camel-100'
                }`}
              >
                Все дисциплины
              </button>
              {DISCIPLINE_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    handleDisciplineToggle(d.value)
                    setDisciplineDropdownOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    filterDiscipline === d.value
                      ? 'bg-camel-500 text-charcoal-900 font-semibold'
                      : 'text-charcoal-700 hover:bg-camel-100'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </ModernDropdown>
        </div>

        <div className="ml-auto shrink-0 flex items-center gap-1.5">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full border border-old-money-200 bg-cream-50 text-charcoal-500 hover:text-charcoal-800 transition-colors cursor-pointer"
              title="Сбросить фильтры"
              aria-label="Сбросить фильтры"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <div className="shrink-0">{trailingMobile}</div>
        </div>
      </div>

      {/* Десктопная строка: поиск слева + фильтры */}
      <div className="hidden sm:flex sm:items-center gap-2 w-full min-w-0">
        <ToolbarSearch
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Название, клуб, регион…"
        />

        <div className="flex max-w-full flex-wrap items-center gap-1.5 sm:gap-2">
          <MonthYearDropdown
            selectedYear={filterYear}
            onSelectYear={onFilterYearChange}
            selectedMonth={filterMonth}
            onSelectMonth={onFilterMonthChange}
            sortedYears={sortedYears}
            currentSeason={CURRENT_SEASON}
            availableMonthsByYear={availableMonthsByYear}
          />

          <div className="flex items-center gap-1 bg-cream-50 p-0.5 rounded-full border border-old-money-200 h-8">
            {DISCIPLINE_OPTIONS.map((d) => {
              const active = filterDiscipline === d.value
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => handleDisciplineToggle(d.value)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-camel-500 text-charcoal-900 shadow-2xs'
                      : 'text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-100'
                  }`}
                >
                  {d.label}
                </button>
              )
            })}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="relative shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full border border-old-money-200 bg-cream-50 text-charcoal-500 hover:text-charcoal-800 transition-colors cursor-pointer before:absolute before:-inset-1.5 before:content-['']"
              title="Сбросить фильтры"
              aria-label="Сбросить фильтры"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  const legend = (
    <div className="flex items-center justify-end gap-x-1.5 sm:gap-x-3.5 gap-y-1">
      {LEGEND.map(({ key, label, tip }) => (
        <ToolbarTip key={key} label={tip}>
          <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-charcoal-500 whitespace-nowrap">
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
      topRowClassName="flex-nowrap"
      filters={filters}
      trailing={<div className="hidden sm:block">{trailing}</div>}
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
