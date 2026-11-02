import ToolbarFiltersDropdown from '../../components/toolbar/ToolbarFiltersDropdown'
import { TOOLBAR_NUMBER_INPUT } from '../../lib/toolbar'
import {
  SHOW_AWARD_BADGE,
  SHOW_FILTER_AWARD_KEYS,
  type ShowAwardKey,
} from '../../../../backend/lib/show-award-ranking'
import type { ShowAwardMinFilters } from './ShowRankingFilters'

export const FCI_GROUPS = [
  'Борзые',
  'Шпицы и примитивные типы собак',
  'Гончие, гончие по кровяному следу и родственные породы',
  'Терьеры',
  'Таксы',
  'Комнатно-декоративные собаки',
  'Пастушьи и скотогонные собаки, кроме швейцарских скотогонных собак',
  'Пинчеры и шнауцеры - догообразные и швейцарские горные скотогонные собаки',
  'Легавые',
  'Ретриверы спаниели, водяные собаки',
]

export interface ShowAwardsFilterPanelProps {
  hasPanelFilters: boolean
  panelFilterCount: number
  onResetPanelFilters: () => void
  filterGroup?: string
  onGroupChange?: (value: string) => void
  awardMins: ShowAwardMinFilters
  onAwardMinChange: (key: ShowAwardKey, value: string) => void
  hasAwardMins: boolean
  awardMinCount: number
}

export function ShowAwardsFilterPanel({
  hasPanelFilters,
  panelFilterCount,
  onResetPanelFilters,
  filterGroup = '',
  onGroupChange,
  awardMins,
  onAwardMinChange,
  hasAwardMins,
  awardMinCount,
}: ShowAwardsFilterPanelProps) {
  return (
    <ToolbarFiltersDropdown
      active={hasPanelFilters}
      activeCount={panelFilterCount}
      fillContent
      panelClassName="md:w-[min(320px,calc(100vw-2rem))]"
      onReset={onResetPanelFilters}
      label="Награды"
    >
      <div className="flex flex-col gap-3 p-3">
        {onGroupChange && (
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-600">
              Группа пород
            </label>
            <select
              value={filterGroup}
              onChange={(e) => onGroupChange(e.target.value)}
              className="w-full h-8 text-xs rounded-lg border border-old-money-200 bg-white px-2.5 text-charcoal-800 focus:border-camel-500 focus:outline-none focus:ring-1 focus:ring-camel-500"
            >
              <option value="">Все группы FCI</option>
              {FCI_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-600">
              Минимум наград
            </span>
            {hasAwardMins && (
              <span className="text-[10px] text-camel-700 font-medium">
                активно: {awardMinCount}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-0.5">
            {SHOW_FILTER_AWARD_KEYS.map((key) => (
              <label key={key} className="block space-y-0.5">
                <span className="text-[11px] font-medium text-charcoal-600">
                  {SHOW_AWARD_BADGE[key]}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="мин."
                  value={awardMins[key] || ''}
                  onChange={(e) =>
                    onAwardMinChange(key, e.target.value.replace(/[^0-9]/g, ''))
                  }
                  className={`${TOOLBAR_NUMBER_INPUT} !h-8`}
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </ToolbarFiltersDropdown>
  )
}
