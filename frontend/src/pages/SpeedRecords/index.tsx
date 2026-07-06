import { lazy, Suspense } from 'react'
import PageLoader from '../../components/PageLoader'
import ToolbarSegmentControl from '../../components/toolbar/ToolbarSegmentControl'
import { useSpeedRecordsPage } from './useSpeedRecordsPage'
import SpeedTableTab from './SpeedTableTab'
import CoursingTableTab from './CoursingTableTab'

const SpeedStatsView = lazy(() => import('./stats/SpeedStatsView'))
const CoursingStatsView = lazy(() => import('./stats/CoursingStatsView'))

const DONINO_SEGMENTS = [
  { id: 'table', label: 'Замер' },
  { id: 'coursing', label: 'Бега 350 м' },
]

function SpeedRecords() {
  const page = useSpeedRecordsPage()

  return (
    <div className="space-y-6">
      <div className="bg-cream-50/90 dark:bg-charcoal-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-cream-300 dark:border-charcoal-700 p-4 md:p-8">
        <div className="mb-4 overflow-x-auto scrollbar-hide">
          <ToolbarSegmentControl
            segments={DONINO_SEGMENTS}
            value={page.activeTab}
            onChange={page.handleTabChange}
            ariaLabel="Разделы рекордов Донино"
          />
        </div>

        {page.activeTab === 'table' && page.view === 'table' && (
          <SpeedTableTab
            view={page.view}
            onViewChange={page.handleViewChange}
            searchQuery={page.searchQuery}
            onSearchChange={page.setSearchQuery}
            filterYears={page.filterYears}
            filterBreeds={page.filterBreeds}
            filterSexes={page.filterSexes}
            openDropdown={page.openDropdown}
            onOpenDropdownChange={page.setOpenDropdown}
            dropdownRef={page.dropdownRef}
            years={page.years}
            breeds={page.breeds}
            sexes={page.sexes}
            onToggleFilter={page.toggleFilter}
            onClearFilters={page.clearAllFilters}
            hasActiveFilters={page.hasActiveFilters}
            loading={page.loading}
            error={page.error}
            filteredRecords={page.filteredRecords}
            sortField={page.sortField}
            sortDirection={page.sortDirection}
            onSort={page.handleSort}
          />
        )}

        {page.activeTab === 'table' && page.view === 'stats' && (
          <Suspense fallback={<PageLoader />}>
            <SpeedStatsView view={page.view} onViewChange={page.handleViewChange} />
          </Suspense>
        )}

        {page.activeTab === 'coursing' && page.view === 'table' && (
          <CoursingTableTab
            view={page.view}
            onViewChange={page.handleViewChange}
            coursingLoading={page.coursingLoading}
            searchQuery={page.searchQuery}
            onSearchChange={page.setSearchQuery}
            filterYears={page.filterYears}
            filterBreeds={page.filterBreeds}
            openDropdown={page.openDropdown}
            onOpenDropdownChange={page.setOpenDropdown}
            dropdownRef={page.dropdownRef}
            coursingYears={page.coursingYears}
            coursingBreeds={page.coursingBreeds}
            onToggleFilter={page.toggleFilter}
            onClearFilters={page.clearCoursingFilters}
            filteredCoursingRecords={page.filteredCoursingRecords}
            sortField={page.coursingSortField}
            sortDirection={page.coursingSortDirection}
            onSort={page.handleCoursingSort}
          />
        )}

        {page.activeTab === 'coursing' && page.view === 'stats' && (
          <Suspense fallback={<PageLoader />}>
            <CoursingStatsView view={page.view} onViewChange={page.handleViewChange} />
          </Suspense>
        )}
      </div>
    </div>
  )
}

export default SpeedRecords
