import { useMemo, useState } from 'react'
import { ChevronDown, Info } from 'lucide-react'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ToolbarTip from '../../components/toolbar/ToolbarTip'
import ModernDropdown from '../../components/ui/ModernDropdown'
import MonthYearDropdown from '../../components/toolbar/MonthYearDropdown'
import HoverTooltip from '../../components/ui/HoverTooltip'
import { Icons } from '../../lib/icons'
import { LEGEND_DOT_COLOR } from './eventListUtils'
import { resolveActiveSeason } from '../../lib/season'
import {
  TOOLBAR_CHIP,
  TOOLBAR_CHIP_ACTIVE,
  TOOLBAR_CHIP_IDLE,
  toolbarPillTriggerClass,
} from '../../lib/toolbar'

export type EventsQuickPreset = 'championships' | null

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

const ARCHIVE_TOOLTIP_CONTENT = (
  <div className="max-w-[22rem] space-y-2.5 p-1">
    <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900 border-b border-old-money-200 pb-1.5 mb-2">
      <Info className="h-4 w-4 text-camel-700 shrink-0" aria-hidden />
      <span>Общественный архив соревнований</span>
    </div>
    <p className="text-[11px] leading-relaxed text-charcoal-700">
      Раздел сохраняет спортивную историю забегов на основе официальных публикаций организаторов, секретариатов и архивов ProCoursing.ru.
    </p>
    <div className="rounded-lg bg-old-money-100/70 p-2.5 border border-old-money-200/90 text-[10px] leading-normal text-charcoal-600 space-y-1">
      <p>
        Сведения могут содержать ошибки или быть неполными из-за фрагментарности открытых источников и ручного ведения ранних баз организаторами соревнований.
      </p>
      <p className="font-medium text-charcoal-700">
        Проект является независимым общественным архивом и не является официальным сайтом РКФ.
      </p>
    </div>
  </div>
)

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
        className="w-full sm:!w-auto min-w-0 sm:min-w-[200px] max-w-sm"
      />
      <div className="flex max-w-full items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full sm:w-auto sm:flex-wrap">
        <MonthYearDropdown
          selectedYear={filterYear}
          onSelectYear={onFilterYearChange}
          selectedMonth={filterMonth}
          onSelectMonth={onFilterMonthChange}
          sortedYears={sortedYears}
          currentSeason={CURRENT_SEASON}
          onClearPreset={onClearQuickPreset}
        />

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
                  ? 'bg-camel-500 text-charcoal-900'
                  : 'text-charcoal-700 hover:bg-camel-100'
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
                    ? 'bg-camel-500 text-charcoal-900'
                    : 'text-charcoal-700 hover:bg-camel-100'
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
                    ? 'bg-camel-500 text-charcoal-900'
                    : 'text-charcoal-700 hover:bg-camel-100'
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
                      ? 'bg-camel-500 text-charcoal-900'
                      : 'text-charcoal-700 hover:bg-camel-100'
                  }`}
                >
                  {kind}
                </button>
              ))}
            </div>
          </ModernDropdown>
        )}
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
      topRowClassName="pr-0 md:pr-32"
      filters={filters}
      bottomLeft={
        stats ? (
          <div className="flex flex-wrap items-center gap-2">
            <p className="hidden sm:block text-xs text-charcoal-500">
              {`Всего событий: ${stats.total} · отфильтровано: ${stats.filtered} · с результатом: ${stats.withResult}`}
              {filterDiscipline && (
                <span> · {disciplineLabel}</span>
              )}
            </p>
            <p className="sm:hidden text-[11px] text-charcoal-500 whitespace-nowrap">
              {stats.filtered === stats.total
                ? `${stats.total} соб. · рез: ${stats.withResult}`
                : `${stats.filtered}/${stats.total} · рез: ${stats.withResult}`}
            </p>
            <HoverTooltip
              label={ARCHIVE_TOOLTIP_CONTENT}
              placement="bottom"
              variant="site"
              interactive
              portal
            >
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-old-money-300/90 bg-cream-50/90 px-2.5 py-0.5 text-xs font-semibold text-charcoal-800 shadow-2xs hover:border-camel-500 hover:bg-cream-100 hover:text-charcoal-900 transition-all cursor-pointer"
                aria-label="Об открытом архиве и протоколах"
              >
                <Info className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
                <span className="hidden sm:inline">Об архиве и источниках</span>
                <span className="sm:hidden">Об архиве</span>
              </button>
            </HoverTooltip>
          </div>
        ) : undefined
      }
      bottomRight={legend}
    />
  )
}
