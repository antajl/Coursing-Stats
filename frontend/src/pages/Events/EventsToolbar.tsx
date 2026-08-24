import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ToolbarTip from '../../components/toolbar/ToolbarTip'
import ModernDropdown from '../../components/ui/ModernDropdown'
import { Icons } from '../../lib/icons'
import { LEGEND_DOT_COLOR, MONTH_FILTER_OPTIONS } from './eventListUtils'
import {
  TOOLBAR_CHIP,
  TOOLBAR_CHIP_ACTIVE,
  TOOLBAR_CHIP_IDLE,
  toolbarPillTriggerClass,
} from '../../lib/toolbar'

export type EventsQuickPreset = 'championships' | null

export const CURRENT_SEASON = String(new Date().getFullYear())

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

export type EventsToolbarProps = {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterYear: string
  onFilterYearChange: (year: string) => void
  filterMonth: string
  onFilterMonthChange: (month: string) => void
  filterDiscipline: string
  onFilterDisciplineChange: (discipline: string) => void
  filterCompetitionKind: string
  onFilterCompetitionKindChange: (kind: string) => void
  filterChampionshipsOnly: boolean
  onClearChampionships: () => void
  filterWithProtocol: boolean
  onFilterWithProtocolChange: (value: boolean) => void
  quickPreset: EventsQuickPreset
  onClearQuickPreset: () => void
  onChampionshipsPreset: () => void
  sortedYears: string[]
  allCompetitionKinds: string[]
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
  filterCompetitionKind,
  onFilterCompetitionKindChange,
  filterChampionshipsOnly,
  onClearChampionships,
  filterWithProtocol,
  onFilterWithProtocolChange,
  quickPreset,
  onClearQuickPreset,
  onChampionshipsPreset,
  sortedYears,
  allCompetitionKinds,
  onResetFilters,
  stats,
}: EventsToolbarProps) {
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false)
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false)
  const [disciplineDropdownOpen, setDisciplineDropdownOpen] = useState(false)
  const [kindDropdownOpen, setKindDropdownOpen] = useState(false)

  const disciplineLabel =
    DISCIPLINE_OPTIONS.find((d) => d.value === filterDiscipline)?.label || 'Дисциплина'

  const hasActiveFilters = Boolean(
    filterDiscipline ||
      filterCompetitionKind ||
      filterChampionshipsOnly ||
      filterWithProtocol ||
      filterMonth ||
      quickPreset ||
      searchQuery ||
      filterYear !== CURRENT_SEASON,
  )

  const handleDisciplineToggle = (discipline: string) => {
    onFilterDisciplineChange(filterDiscipline === discipline ? '' : discipline)
    onClearQuickPreset()
  }

  const handleKindToggle = (kind: string) => {
    onFilterCompetitionKindChange(filterCompetitionKind === kind ? '' : kind)
    onClearQuickPreset()
  }

  const filters = (
    <>
      <ToolbarSearch
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Название, клуб, регион…"
      />
      <div className="flex max-w-full flex-wrap items-center gap-1.5">
        <ModernDropdown
          trigger={
            <button
              type="button"
              className={toolbarPillTriggerClass(filterYear !== CURRENT_SEASON)}
            >
              {!filterYear ? 'Все года' : filterYear !== CURRENT_SEASON ? filterYear : 'Год'}
              <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
            </button>
          }
          isOpen={yearDropdownOpen}
          onOpenChange={setYearDropdownOpen}
          width="120px"
        >
          <div className="max-h-60 overflow-y-auto p-1" role="menu">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onFilterYearChange('')
                onClearQuickPreset()
                setYearDropdownOpen(false)
              }}
              className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                !filterYear
                  ? 'bg-camel-500 text-charcoal-900 dark:bg-camel-600 dark:text-cream-50'
                  : 'text-charcoal-700 hover:bg-camel-100 dark:text-charcoal-200 dark:hover:bg-camel-900/30'
              }`}
            >
              Все года
            </button>
            {sortedYears.map((year) => (
              <button
                key={year}
                type="button"
                role="menuitem"
                onClick={() => {
                  onFilterYearChange(year)
                  onClearQuickPreset()
                  setYearDropdownOpen(false)
                }}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  filterYear === year
                    ? 'bg-camel-500 text-charcoal-900 dark:bg-camel-600 dark:text-cream-50'
                    : 'text-charcoal-700 hover:bg-camel-100 dark:text-charcoal-200 dark:hover:bg-camel-900/30'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </ModernDropdown>

        <ModernDropdown
          trigger={
            <button
              type="button"
              className={toolbarPillTriggerClass(Boolean(filterMonth))}
            >
              {filterMonth
                ? MONTH_FILTER_OPTIONS.find((m) => m.value === filterMonth)?.label || filterMonth
                : 'Месяц'}
              <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
            </button>
          }
          isOpen={monthDropdownOpen}
          onOpenChange={setMonthDropdownOpen}
          width="160px"
        >
          <div className="max-h-60 overflow-y-auto p-1" role="menu">
            {MONTH_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value || 'all'}
                type="button"
                role="menuitem"
                onClick={() => {
                  onFilterMonthChange(opt.value)
                  onClearQuickPreset()
                  setMonthDropdownOpen(false)
                }}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  filterMonth === opt.value
                    ? 'bg-camel-500 text-charcoal-900 dark:bg-camel-600 dark:text-cream-50'
                    : 'text-charcoal-700 hover:bg-camel-100 dark:text-charcoal-200 dark:hover:bg-camel-900/30'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </ModernDropdown>

        <ModernDropdown
          trigger={
            <button
              type="button"
              className={toolbarPillTriggerClass(Boolean(filterDiscipline))}
            >
              {disciplineLabel}
              <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
            </button>
          }
          isOpen={disciplineDropdownOpen}
          onOpenChange={setDisciplineDropdownOpen}
          width="140px"
        >
          <div className="max-h-60 overflow-y-auto p-1" role="menu">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onFilterDisciplineChange('')
                onClearQuickPreset()
                setDisciplineDropdownOpen(false)
              }}
              className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                !filterDiscipline
                  ? 'bg-camel-500 text-charcoal-900 dark:bg-camel-600 dark:text-cream-50'
                  : 'text-charcoal-700 hover:bg-camel-100 dark:text-charcoal-200 dark:hover:bg-camel-900/30'
              }`}
            >
              Все дисциплины
            </button>
            {DISCIPLINE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="menuitem"
                onClick={() => {
                  handleDisciplineToggle(opt.value)
                  setDisciplineDropdownOpen(false)
                }}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  filterDiscipline === opt.value
                    ? 'bg-camel-500 text-charcoal-900 dark:bg-camel-600 dark:text-cream-50'
                    : 'text-charcoal-700 hover:bg-camel-100 dark:text-charcoal-200 dark:hover:bg-camel-900/30'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </ModernDropdown>

        {allCompetitionKinds.length > 0 && (
          <ModernDropdown
            trigger={
              <button
                type="button"
                className={toolbarPillTriggerClass(Boolean(filterCompetitionKind), 'max-w-[12rem]')}
                title={filterCompetitionKind || undefined}
              >
                <span className="min-w-0 truncate">{filterCompetitionKind || 'Вид'}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
              </button>
            }
            isOpen={kindDropdownOpen}
            onOpenChange={setKindDropdownOpen}
            width="220px"
          >
            <div className="max-h-60 overflow-y-auto p-1" role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onFilterCompetitionKindChange('')
                  onClearQuickPreset()
                  setKindDropdownOpen(false)
                }}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  !filterCompetitionKind
                    ? 'bg-camel-500 text-charcoal-900 dark:bg-camel-600 dark:text-cream-50'
                    : 'text-charcoal-700 hover:bg-camel-100 dark:text-charcoal-200 dark:hover:bg-camel-900/30'
                }`}
              >
                Все виды
              </button>
              {allCompetitionKinds.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    handleKindToggle(kind)
                    setKindDropdownOpen(false)
                  }}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    filterCompetitionKind === kind
                      ? 'bg-camel-500 text-charcoal-900 dark:bg-camel-600 dark:text-cream-50'
                      : 'text-charcoal-700 hover:bg-camel-100 dark:text-charcoal-200 dark:hover:bg-camel-900/30'
                  }`}
                >
                  {kind}
                </button>
              ))}
            </div>
          </ModernDropdown>
        )}
        <button
          type="button"
          onClick={() => {
            onFilterWithProtocolChange(!filterWithProtocol)
            onClearQuickPreset()
          }}
          className={`${TOOLBAR_CHIP} ${
            filterWithProtocol ? TOOLBAR_CHIP_ACTIVE : TOOLBAR_CHIP_IDLE
          }`}
          aria-pressed={filterWithProtocol}
        >
          С протоколом
        </button>
        <ToolbarTip label="Только чемпионаты, кубки и статусы ЧРКФ / ПЧРКФ">
          <button
            type="button"
            onClick={onChampionshipsPreset}
            className={`inline-flex gap-1 ${TOOLBAR_CHIP} ${
              quickPreset === 'championships' ? TOOLBAR_CHIP_ACTIVE : TOOLBAR_CHIP_IDLE
            }`}
            aria-pressed={quickPreset === 'championships'}
          >
            <Icons.championship className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            Чемпионаты и кубки
          </button>
        </ToolbarTip>
      </div>
    </>
  )

  const legend = (
    <div className="flex flex-wrap items-center justify-end gap-x-3.5 gap-y-1">
      {LEGEND.map(({ key, label, tip }) => (
        <ToolbarTip key={key} label={tip}>
          <span className="inline-flex items-center gap-1.5 text-xs text-charcoal-500 dark:text-charcoal-300">
            <span className={`h-2 w-2 rounded-sm ${LEGEND_DOT_COLOR[key]}`} />
            {label}
          </span>
        </ToolbarTip>
      ))}
    </div>
  )

  return (
    <PageToolbar
      bare
      topRowClassName="pr-28 md:pr-32"
      filters={filters}
      bottomLeft={
        stats ? (
          <p className="text-xs text-charcoal-500 dark:text-charcoal-300">
            {`Всего событий: ${stats.total} · отфильтровано: ${stats.filtered} · с результатом: ${stats.withResult}`}
            {filterDiscipline && (
              <span className="hidden sm:inline"> · {disciplineLabel}</span>
            )}
          </p>
        ) : undefined
      }
      bottomRight={legend}
    />
  )
}
