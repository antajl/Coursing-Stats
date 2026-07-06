import { useMemo, useRef } from 'react'
import FilterSelect from '../../components/FilterSelect'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarOptionBar from '../../components/toolbar/ToolbarOptionBar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ToolbarSegmentControl from '../../components/toolbar/ToolbarSegmentControl'
import { TOOLBAR_NUMBER_INPUT } from '../../lib/toolbar'
import { buildTopDogsActiveFilterChips } from '../SpeedRecords/toolbarFilters'

const RANKING_SEGMENTS = [
  { id: 'placement', label: 'По местам' },
  { id: 'score', label: 'По очкам' },
  { id: 'speed', label: 'По скорости' },
]

interface TopDogsFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterYear: string
  onYearChange: (value: string) => void
  yearValues: (string | number)[]
  filterBreed: string
  onBreedChange: (value: string) => void
  breedValues: string[]
  filterMinStarts: string
  onMinStartsChange: (value: string) => void
  filterScoreFrom: string
  onScoreFromChange: (value: string) => void
  filterSpeedFrom: string
  onSpeedFromChange: (value: string) => void
  onResetFilters: () => void
  activeTab: string
  onTabChange: (tab: string) => void
  scoreSortBy: 'best_score' | 'best_judge_score' | 'avg_judge_score'
  onScoreSortByChange: (value: 'best_score' | 'best_judge_score' | 'avg_judge_score') => void
  placementSortBy: 'gold' | 'silver' | 'bronze' | 'total'
  onPlacementSortByChange: (value: 'gold' | 'silver' | 'bronze' | 'total') => void
  speedSortBy: 'best_speed' | 'avg_speed'
  onSpeedSortByChange: (value: 'best_speed' | 'avg_speed') => void
  dropdownRef?: React.RefObject<HTMLDivElement>
}

export default function TopDogsFilters({
  searchQuery,
  onSearchChange,
  filterYear,
  onYearChange,
  yearValues,
  filterBreed,
  onBreedChange,
  breedValues,
  filterMinStarts,
  onMinStartsChange,
  filterScoreFrom,
  onScoreFromChange,
  filterSpeedFrom,
  onSpeedFromChange,
  onResetFilters,
  activeTab,
  onTabChange,
  scoreSortBy,
  onScoreSortByChange,
  placementSortBy,
  onPlacementSortByChange,
  speedSortBy,
  onSpeedSortByChange,
  dropdownRef,
}: TopDogsFiltersProps) {
  const hasActiveFilters =
    (filterYear && filterYear !== '2026') ||
    filterBreed ||
    searchQuery ||
    filterMinStarts ||
    (activeTab === 'score' && filterScoreFrom) ||
    (activeTab === 'speed' && filterSpeedFrom)

  const activeFilterChips = useMemo(
    () =>
      buildTopDogsActiveFilterChips(
        searchQuery,
        filterYear,
        filterBreed,
        filterMinStarts,
        filterScoreFrom,
        filterSpeedFrom,
        activeTab,
        onSearchChange,
        onYearChange,
        onBreedChange,
        onMinStartsChange,
        onScoreFromChange,
        onSpeedFromChange
      ),
    [
      searchQuery,
      filterYear,
      filterBreed,
      filterMinStarts,
      filterScoreFrom,
      filterSpeedFrom,
      activeTab,
      onSearchChange,
      onYearChange,
      onBreedChange,
      onMinStartsChange,
      onScoreFromChange,
      onSpeedFromChange,
    ]
  )

  const sortBar =
    activeTab === 'placement' ? (
      <ToolbarOptionBar
        label="Сортировка"
        value={placementSortBy}
        onChange={(v) => onPlacementSortByChange(v as typeof placementSortBy)}
        options={[
          { value: 'gold', label: 'Золото' },
          { value: 'silver', label: 'Серебро' },
          { value: 'bronze', label: 'Бронза' },
          { value: 'total', label: 'Всего' },
        ]}
      />
    ) : activeTab === 'score' ? (
      <ToolbarOptionBar
        label="Сортировка"
        value={scoreSortBy}
        onChange={(v) => onScoreSortByChange(v as typeof scoreSortBy)}
        options={[
          { value: 'best_score', label: 'Лучший результат' },
          { value: 'best_judge_score', label: 'Лучшая оценка' },
          { value: 'avg_judge_score', label: 'Средняя оценка' },
        ]}
      />
    ) : (
      <ToolbarOptionBar
        label="Сортировка"
        value={speedSortBy}
        onChange={(v) => onSpeedSortByChange(v as typeof speedSortBy)}
        options={[
          { value: 'best_speed', label: 'Лучшая скорость' },
          { value: 'avg_speed', label: 'Средняя скорость' },
        ]}
      />
    )

  return (
    <div className="mb-4" ref={dropdownRef}>
      <PageToolbar
        activeFilterChips={activeFilterChips}
        onClearAllFilters={hasActiveFilters ? onResetFilters : undefined}
        bottomLeft={
          <ToolbarSegmentControl
            segments={RANKING_SEGMENTS}
            value={activeTab}
            onChange={onTabChange}
            ariaLabel="Тип рейтинга"
          />
        }
        bottomRight={sortBar}
        filters={
          <>
            <ToolbarSearch value={searchQuery} onChange={onSearchChange} placeholder="Кличка, порода…" />
            <FilterSelect
              ariaLabel="Год"
              value={filterYear}
              onChange={onYearChange}
              allLabel="Все года"
              options={yearValues
                .sort((a, b) => Number(b) - Number(a))
                .map((y) => ({ value: String(y), label: String(y) }))}
              className="min-w-[96px]"
            />
            <FilterSelect
              ariaLabel="Порода"
              value={filterBreed}
              onChange={onBreedChange}
              allLabel="Все породы"
              options={breedValues.map((b) => ({ value: b, label: b }))}
              className="hidden min-w-[120px] sm:block"
            />
            <input
              type="number"
              placeholder="Мин. старты"
              value={filterMinStarts}
              onChange={(e) => onMinStartsChange(e.target.value.replace(/[^0-9]/g, ''))}
              className={`${TOOLBAR_NUMBER_INPUT} w-28`}
            />
            {activeTab === 'score' && (
              <input
                type="number"
                step="0.1"
                placeholder="Мин. очки"
                value={filterScoreFrom}
                onChange={(e) => onScoreFromChange(e.target.value.replace(/[^0-9.]/g, ''))}
                className={`${TOOLBAR_NUMBER_INPUT} w-28`}
              />
            )}
            {activeTab === 'speed' && (
              <input
                type="number"
                step="0.1"
                placeholder="Мин. скорость"
                value={filterSpeedFrom}
                onChange={(e) => onSpeedFromChange(e.target.value.replace(/[^0-9.]/g, ''))}
                className={`${TOOLBAR_NUMBER_INPUT} w-32`}
              />
            )}
          </>
        }
      />
    </div>
  )
}
