import { useMemo } from 'react'
import RKFAttribution from '../../components/RKFAttribution'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarFiltersDropdown from '../../components/toolbar/ToolbarFiltersDropdown'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import {
  TOOLBAR_CHIP,
  TOOLBAR_CHIP_ACTIVE,
  TOOLBAR_CHIP_IDLE,
  TOOLBAR_FILTER_CHECKBOX_ROW,
  TOOLBAR_FILTER_SECTION_LABEL,
  TOOLBAR_NUMBER_INPUT,
} from '../../lib/toolbar'
import {
  SHOW_AWARD_BADGE,
  SHOW_FILTER_AWARD_KEYS,
  type ShowAwardKey,
} from '../../../../backend/lib/show-award-ranking'

export type ShowAwardMinFilters = Partial<Record<ShowAwardKey, string>>

interface ShowRankingFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterYear: string
  onYearChange: (value: string) => void
  currentSeason: string
  yearValues: string[]
  filterBreed: string
  onBreedChange: (value: string) => void
  breedValues: string[]
  filterGroup: string
  onGroupChange: (value: string) => void
  groupValues: string[]
  awardMins: ShowAwardMinFilters
  onAwardMinChange: (key: ShowAwardKey, value: string) => void
  onResetFilters: () => void
  onResetPanelFilters: () => void
  dropdownRef?: React.RefObject<HTMLDivElement>
}

export default function ShowRankingFilters({
  searchQuery,
  onSearchChange,
  filterYear,
  onYearChange,
  currentSeason,
  yearValues,
  filterBreed,
  onBreedChange,
  breedValues,
  filterGroup,
  onGroupChange,
  groupValues,
  awardMins,
  onAwardMinChange,
  onResetFilters,
  onResetPanelFilters,
  dropdownRef,
}: ShowRankingFiltersProps) {
  const sortedYears = useMemo(
    () => [...yearValues].sort((a, b) => Number(b) - Number(a)),
    [yearValues],
  )

  const hasAwardMins = SHOW_FILTER_AWARD_KEYS.some((key) => Boolean(awardMins[key]))
  const hasActiveFilters =
    Boolean(filterYear) || filterBreed || filterGroup || searchQuery || hasAwardMins
  const hasPanelFilters = Boolean(filterYear || filterBreed || filterGroup || hasAwardMins)

  const activeFilterChips = useMemo(() => {
    const chips = []

    if (filterYear) {
      chips.push({
        key: 'year',
        label: filterYear,
        onRemove: () => onYearChange(''),
      })
    }

    if (filterBreed) {
      chips.push({
        key: 'breed',
        label: filterBreed,
        onRemove: () => onBreedChange(''),
      })
    }

    if (filterGroup) {
      chips.push({
        key: 'group',
        label: filterGroup,
        onRemove: () => onGroupChange(''),
      })
    }

    for (const key of SHOW_FILTER_AWARD_KEYS) {
      if (!awardMins[key]) continue
      chips.push({
        key: `min-${key}`,
        label: `${SHOW_AWARD_BADGE[key]} ≥ ${awardMins[key]}`,
        onRemove: () => onAwardMinChange(key, ''),
      })
    }

    return chips
  }, [
    filterYear,
    filterBreed,
    filterGroup,
    awardMins,
    onYearChange,
    onBreedChange,
    onGroupChange,
    onAwardMinChange,
  ])

  const handleYearToggle = (year: string) => {
    onYearChange(filterYear === year ? '' : year)
  }

  const handleBreedToggle = (breed: string) => {
    onBreedChange(filterBreed === breed ? '' : breed)
  }

  const handleGroupToggle = (group: string) => {
    onGroupChange(filterGroup === group ? '' : group)
  }

  return (
    <div className="mb-4" ref={dropdownRef}>
      <PageToolbar
        bare
        trailing={<RKFAttribution />}
        activeFilterChips={activeFilterChips}
        onClearAllFilters={hasActiveFilters ? onResetFilters : undefined}
        filters={
          <>
            <ToolbarSearch
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Кличка, порода…"
              className="!w-auto min-w-[200px] flex-1 max-w-lg"
            />
            <div className="flex shrink-0 items-center gap-1.5">
              <ToolbarFiltersDropdown
                active={hasPanelFilters}
                onReset={onResetPanelFilters}
                label="Фильтры"
              >
                <div>
                  <p className={TOOLBAR_FILTER_SECTION_LABEL}>Год</p>
                  <div className="max-h-36 space-y-0.5 overflow-y-auto">
                    {sortedYears.map((year) => (
                      <label key={year} className={TOOLBAR_FILTER_CHECKBOX_ROW}>
                        <input
                          type="checkbox"
                          checked={filterYear === year}
                          onChange={() => handleYearToggle(year)}
                        />
                        {year}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={TOOLBAR_FILTER_SECTION_LABEL}>Порода</p>
                  <div className="max-h-36 space-y-0.5 overflow-y-auto">
                    {breedValues.map((breed) => (
                      <label key={breed} className={TOOLBAR_FILTER_CHECKBOX_ROW}>
                        <input
                          type="checkbox"
                          checked={filterBreed === breed}
                          onChange={() => handleBreedToggle(breed)}
                        />
                        <span className="truncate">{breed}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={TOOLBAR_FILTER_SECTION_LABEL}>Группа FCI</p>
                  <div className="max-h-36 space-y-0.5 overflow-y-auto">
                    {groupValues.map((group) => (
                      <label key={group} className={TOOLBAR_FILTER_CHECKBOX_ROW}>
                        <input
                          type="checkbox"
                          checked={filterGroup === group}
                          onChange={() => handleGroupToggle(group)}
                        />
                        <span className="truncate">{group}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={TOOLBAR_FILTER_SECTION_LABEL}>Награды (минимум)</p>
                  <div className="space-y-2">
                    {SHOW_FILTER_AWARD_KEYS.map((key) => (
                      <input
                        key={key}
                        type="number"
                        min={0}
                        inputMode="numeric"
                        placeholder={`Мин. ${SHOW_AWARD_BADGE[key]}`}
                        value={awardMins[key] || ''}
                        onChange={(e) =>
                          onAwardMinChange(key, e.target.value.replace(/[^0-9]/g, ''))
                        }
                        className={`${TOOLBAR_NUMBER_INPUT} w-full`}
                      />
                    ))}
                  </div>
                </div>
              </ToolbarFiltersDropdown>
              <button
                type="button"
                onClick={() => onYearChange(filterYear === currentSeason ? '' : currentSeason)}
                aria-pressed={filterYear === currentSeason}
                className={`${TOOLBAR_CHIP} ${filterYear === currentSeason ? TOOLBAR_CHIP_ACTIVE : TOOLBAR_CHIP_IDLE}`}
              >
                Сезон {currentSeason}
              </button>
            </div>
          </>
        }
      />
    </div>
  )
}
