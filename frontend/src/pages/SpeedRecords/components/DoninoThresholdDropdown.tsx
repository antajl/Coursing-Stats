import FilterSelect from '../../../components/FilterSelect'
import ToolbarFiltersDropdown from '../../../components/toolbar/ToolbarFiltersDropdown'
import { TOOLBAR_NUMBER_INPUT } from '../../../lib/toolbar'
import { GROUP_BY_OPTIONS, type GroupBy } from '../stats/constants'

interface DoninoThresholdDropdownProps {
  hasThresholdFilters: boolean
  thresholdCount: number
  onClearPanelFilters: () => void
  statsGroupBy: GroupBy
  onStatsGroupByChange: (value: GroupBy) => void
  filterMinSpeed: string
  filterMaxSpeed: string
  filterMinTime: string
  filterMaxTime: string
  onFilterMinSpeedChange: (value: string) => void
  onFilterMaxSpeedChange: (value: string) => void
  onFilterMinTimeChange: (value: string) => void
  onFilterMaxTimeChange: (value: string) => void
}

export function DoninoThresholdDropdown({
  hasThresholdFilters,
  thresholdCount,
  onClearPanelFilters,
  statsGroupBy,
  onStatsGroupByChange,
  filterMinSpeed,
  filterMaxSpeed,
  filterMinTime,
  filterMaxTime,
  onFilterMinSpeedChange,
  onFilterMaxSpeedChange,
  onFilterMinTimeChange,
  onFilterMaxTimeChange,
}: DoninoThresholdDropdownProps) {
  return (
    <div className="shrink-0">
      <ToolbarFiltersDropdown
        active={hasThresholdFilters}
        activeCount={thresholdCount}
        fillContent
        panelClassName="md:w-[min(300px,calc(100vw-2rem))]"
        onReset={onClearPanelFilters}
        label="Пороги"
      >
        <div className="space-y-3 p-3">
          <FilterSelect
            label="Группировка"
            ariaLabel="Группировка"
            value={statsGroupBy}
            onChange={(value) => onStatsGroupByChange(value as GroupBy)}
            options={GROUP_BY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            className="w-full"
          />
          <div className="grid grid-cols-2 gap-2">
            <label className="block space-y-0.5">
              <span className="text-[11px] font-medium text-charcoal-600">
                Мин. км/ч
              </span>
              <input
                type="number"
                value={filterMinSpeed}
                onChange={(e) => onFilterMinSpeedChange(e.target.value)}
                placeholder="мин."
                className={`${TOOLBAR_NUMBER_INPUT} !h-8`}
              />
            </label>
            <label className="block space-y-0.5">
              <span className="text-[11px] font-medium text-charcoal-600">
                Макс. км/ч
              </span>
              <input
                type="number"
                value={filterMaxSpeed}
                onChange={(e) => onFilterMaxSpeedChange(e.target.value)}
                placeholder="макс."
                className={`${TOOLBAR_NUMBER_INPUT} !h-8`}
              />
            </label>
            <label className="block space-y-0.5">
              <span className="text-[11px] font-medium text-charcoal-600">
                Мин. сек
              </span>
              <input
                type="number"
                step="0.01"
                value={filterMinTime}
                onChange={(e) => onFilterMinTimeChange(e.target.value)}
                placeholder="мин."
                className={`${TOOLBAR_NUMBER_INPUT} !h-8`}
              />
            </label>
            <label className="block space-y-0.5">
              <span className="text-[11px] font-medium text-charcoal-600">
                Макс. сек
              </span>
              <input
                type="number"
                step="0.01"
                value={filterMaxTime}
                onChange={(e) => onFilterMaxTimeChange(e.target.value)}
                placeholder="макс."
                className={`${TOOLBAR_NUMBER_INPUT} !h-8`}
              />
            </label>
          </div>
        </div>
      </ToolbarFiltersDropdown>
    </div>
  )
}
