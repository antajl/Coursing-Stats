import { lazy, Suspense } from 'react'
import PageLoader from '../../components/PageLoader'
import { useSpeedRecordsPage } from './useSpeedRecordsPage'
import SpeedTableTab from './SpeedTableTab'
import CoursingTableTab from './CoursingTableTab'

const SpeedStatsView = lazy(() => import('./stats/SpeedStatsView'))
const CoursingStatsView = lazy(() => import('./stats/CoursingStatsView'))

function SpeedRecords() {
  const page = useSpeedRecordsPage()

  const tabClass = (tab: string) =>
    `flex-1 min-w-[100px] px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
      page.activeTab === tab
        ? 'bg-white dark:bg-charcoal-600 text-charcoal-700 dark:text-charcoal-200 shadow-sm'
        : 'text-charcoal-600 dark:text-charcoal-300 hover:text-charcoal-700 dark:hover:text-charcoal-200'
    }`

  return (
    <div className="space-y-6">
      <div className="bg-cream-50/90 dark:bg-charcoal-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-cream-300 dark:border-charcoal-700 p-4 md:p-8">
        <div className="flex gap-2 md:gap-4 mb-4 md:mb-6 bg-old-money-100 dark:bg-charcoal-700 p-1 rounded-xl flex-wrap">
          <button onClick={() => page.handleTabChange('table')} className={tabClass('table')}>
            <span className="md:hidden">Скорость</span>
            <span className="hidden md:inline">Замер скорости</span>
          </button>
          <button onClick={() => page.handleTabChange('coursing')} className={tabClass('coursing')}>
            <span className="md:hidden">Бега</span>
            <span className="hidden md:inline">Бега борзых</span>
          </button>
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
