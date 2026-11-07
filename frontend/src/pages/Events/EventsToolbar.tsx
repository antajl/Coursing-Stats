import { useState } from 'react'
import { Info, FileText, ChevronDown, X } from 'lucide-react'
import { toolbarPillTriggerClass } from '../../lib/toolbar'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ToolbarTip from '../../components/toolbar/ToolbarTip'
import ModernDropdown from '../../components/ui/ModernDropdown'
import MonthYearDropdown from '../../components/toolbar/MonthYearDropdown'
import { resolveActiveSeason } from '../../lib/season'

export const CURRENT_SEASON = resolveActiveSeason()

export const DISCIPLINE_OPTIONS = [
  { value: 'coursing', label: 'Курсинг', tip: 'Курсинг борзых' },
  { value: 'bzmp', label: 'БЗМП', tip: 'Бега за механическим зайцем (БЗМП)' },
  { value: 'racing', label: 'Рейсинг', tip: 'Бега борзых (рейсинг)' },
  { value: 'other', label: 'Другие', tip: 'Прочие дисциплины' },
] as const

const DISCIPLINE_DOT: Record<string, string> = {
  coursing: 'bg-forest-500',
  bzmp: 'bg-blue-500',
  racing: 'bg-rose-400',
  other: 'bg-amber-400',
}

export const ARCHIVE_MODAL_CONTENT = (
  <div className="p-3.5 space-y-2.5 text-charcoal-800">
    <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900 border-b border-old-money-200/80 pb-2">
      <Info className="h-4 w-4 text-camel-700 shrink-0" aria-hidden />
      <span>Общественный архив соревнований</span>
    </div>
    <p className="text-[11px] leading-relaxed text-charcoal-700">
      Раздел сохраняет спортивную историю забегов на основе официальных протоколов организаторов, полевых секретариатов и материалов ProCoursing.ru.
    </p>

    {/* Цветовые обозначения дисциплин */}
    <div className="border-t border-old-money-200/80 pt-2 space-y-1.5">
      <div className="text-[10px] uppercase font-bold tracking-wider text-charcoal-500">
        Цветовые обозначения дисциплин:
      </div>
      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
        {DISCIPLINE_OPTIONS.map((d) => (
          <div key={d.value} className="flex items-center gap-1.5 text-charcoal-700">
            <span className={`h-2 w-2 rounded-full shrink-0 ${DISCIPLINE_DOT[d.value]}`} />
            <span>{d.label}</span>
          </div>
        ))}
      </div>
    </div>

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
          className="cs-glass-pill inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold !text-charcoal-700 transition-all cursor-pointer whitespace-nowrap select-none"
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
          className="cs-glass-pill inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold !text-charcoal-700 transition-all cursor-pointer select-none"
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
                className={`shrink-0 inline-flex items-center gap-1.5 ${toolbarPillTriggerClass(Boolean(filterDiscipline))}`}
              >
                {filterDiscipline && DISCIPLINE_DOT[filterDiscipline] && (
                  <span className={`h-2 w-2 rounded-full shrink-0 ${DISCIPLINE_DOT[filterDiscipline]}`} />
                )}
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
                    ? 'bg-camel-100 text-camel-950 font-semibold'
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
                  className={`w-full flex items-center gap-2 text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    filterDiscipline === d.value
                      ? 'bg-camel-100 text-camel-950 font-semibold'
                      : 'text-charcoal-700 hover:bg-camel-100'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full shrink-0 ${DISCIPLINE_DOT[d.value]}`} />
                  <span>{d.label}</span>
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
              className="cs-glass-pill shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full !text-charcoal-500 hover:!text-charcoal-800 transition-colors cursor-pointer select-none"
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
        <div className="flex items-center gap-1.5 shrink-0">
          <ToolbarSearch
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Название, клуб, регион…"
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

          {/* Кнопка «Об архиве» — слева, сразу после выбора года и месяца */}
          <div className="shrink-0">{trailing}</div>

          {/* Сброс фильтров */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="cs-glass-pill shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full !text-charcoal-500 hover:!text-charcoal-800 transition-colors cursor-pointer select-none"
              title="Сбросить фильтры"
              aria-label="Сбросить фильтры"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Разделитель перед выбором типа соревнования */}
        <div className="h-5 w-px bg-old-money-300 shrink-0 mx-0.5" aria-hidden="true" />

        {/* Выбор типа соревнования (дисциплины) с цветными индикаторами */}
        <div className="flex items-center gap-1.5 overflow-visible py-1 -my-1">
          {DISCIPLINE_OPTIONS.map((d) => {
            const active = filterDiscipline === d.value
            return (
              <ToolbarTip key={d.value} label={d.tip}>
                <button
                  type="button"
                  onClick={() => handleDisciplineToggle(d.value)}
                  className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap select-none ${
                    active
                      ? 'cs-glass-pill-active !font-semibold !text-camel-950'
                      : 'cs-glass-pill !font-semibold !text-charcoal-700'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full shrink-0 ${DISCIPLINE_DOT[d.value]}`} />
                  <span>{d.label}</span>
                </button>
              </ToolbarTip>
            )
          })}
        </div>
      </div>
    </div>
  )

  return (
    <PageToolbar
      bare
      topRowClassName="flex-nowrap"
      filters={filters}
    />
  )
}
