import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSpeedRecordsPage } from './useSpeedRecordsPage'
import DoninoPageToolbar from './DoninoPageToolbar'
import DoninoRecordsColumns from './DoninoRecordsColumns'
import DoninoStatsColumns from './DoninoStatsColumns'

function SpeedRecords() {
  const [searchParams] = useSearchParams()
  const view = searchParams.get('view') === 'stats' ? 'stats' : 'table'
  const page = useSpeedRecordsPage()

  const scrollResetKey = useMemo(
    () =>
      [
        page.searchQuery,
        page.filterYears.join(','),
        page.filterBreeds.join(','),
        page.filterSexes.join(','),
        page.sortField,
        page.sortDirection,
        page.coursingSortField,
        page.coursingSortDirection,
      ].join('|'),
    [
      page.searchQuery,
      page.filterYears,
      page.filterBreeds,
      page.filterSexes,
      page.sortField,
      page.sortDirection,
      page.coursingSortField,
      page.coursingSortDirection,
    ]
  )

  return (
    <div className="space-y-6">
      <div className="bg-cream-50/90 dark:bg-charcoal-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-cream-300 dark:border-charcoal-700 px-4 py-3 md:px-6 md:py-4">
        <DoninoPageToolbar
          view={view}
          onViewChange={page.handleViewChange}
          searchQuery={page.searchQuery}
          onSearchChange={page.setSearchQuery}
          filterYears={page.filterYears}
          filterBreeds={page.filterBreeds}
          filterSexes={page.filterSexes}
          filterMinSpeed={page.filterMinSpeed}
          filterMaxSpeed={page.filterMaxSpeed}
          filterMinTime={page.filterMinTime}
          filterMaxTime={page.filterMaxTime}
          onFilterMinSpeedChange={page.setFilterMinSpeed}
          onFilterMaxSpeedChange={page.setFilterMaxSpeed}
          onFilterMinTimeChange={page.setFilterMinTime}
          onFilterMaxTimeChange={page.setFilterMaxTime}
          statsGroupBy={page.statsGroupBy}
          onStatsGroupByChange={page.setStatsGroupBy}
          dropdownRef={page.dropdownRef}
          years={page.years}
          breeds={page.breeds}
          sexes={page.sexes}
          onToggleFilter={page.toggleFilter}
          onClearFilters={page.clearAllFilters}
          onClearPanelFilters={page.clearPanelFilters}
          hasActiveFilters={page.hasActiveFilters}
          speedRecords={page.filteredRecords}
          coursingRecords={page.filteredCoursingRecords}
        />

        <div className="mt-6">
          {page.loading && (
            <div className="py-12 text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-camel-500 border-t-transparent" />
              <p className="mt-4 text-old-money-600 dark:text-old-money-400">Загрузка...</p>
            </div>
          )}

          {page.error && !page.loading && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300">
              Ошибка: {page.error instanceof Error ? page.error.message : String(page.error)}
            </div>
          )}

          {!page.loading && !page.error && view === 'table' && (
            <DoninoRecordsColumns
              speedRecords={page.filteredRecords}
              coursingRecords={page.filteredCoursingRecords}
              speedSortField={page.sortField}
              speedSortDirection={page.sortDirection}
              coursingSortField={page.coursingSortField}
              coursingSortDirection={page.coursingSortDirection}
              onSpeedSort={page.handleSort}
              onCoursingSort={page.handleCoursingSort}
              resetScrollKey={scrollResetKey}
            />
          )}

          {!page.loading && !page.error && view === 'stats' && (
            <DoninoStatsColumns
              speedRecords={page.speedRecordsWithHistory}
              coursingRecords={page.coursingRecords}
              searchQuery={page.searchQuery}
              filterYears={page.filterYears}
              filterBreeds={page.filterBreeds}
              filterSexes={page.filterSexes}
              filterMinSpeed={page.filterMinSpeed}
              filterMaxSpeed={page.filterMaxSpeed}
              filterMinTime={page.filterMinTime}
              filterMaxTime={page.filterMaxTime}
              statsGroupBy={page.statsGroupBy}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default SpeedRecords
