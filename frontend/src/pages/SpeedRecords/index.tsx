import { useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SEO } from '../../components/SEO'
import DoninoAttribution from '../../components/DoninoAttribution'
import { useYandexGoal } from '../../components/YandexMetrica'
import { useSpeedRecordsPage } from './useSpeedRecordsPage'
import DoninoPageToolbar from './DoninoPageToolbar'
import DoninoRecordsColumns from './DoninoRecordsColumns'
import DoninoStatsColumns from './DoninoStatsColumns'
import SkeletonLoader from '../../components/SkeletonLoader'
import { MobileSubNavTabs } from '../../components/ui/MobileSubNavTabs'

function SpeedRecords() {
  const [searchParams, setSearchParams] = useSearchParams()
  const rawTab = searchParams.get('tab')
  const rawView = searchParams.get('view')
  const view = rawTab === 'stats' || rawView === 'stats' ? 'stats' : 'table'
  const page = useSpeedRecordsPage()
  const { reachGoal } = useYandexGoal()

  const handleTabChange = (newTab: 'records' | 'stats') => {
    const next = new URLSearchParams(searchParams)
    if (newTab === 'stats') {
      next.set('tab', 'stats')
      next.delete('view')
    } else {
      next.delete('tab')
      next.delete('view')
    }
    setSearchParams(next)
  }

  const tabs = [
    { id: 'records', label: 'Записи' },
    { id: 'stats', label: 'Статистика' },
  ]

  // Отслеживание просмотра рекордов скорости
  useEffect(() => {
    reachGoal('speed_records_view')
  }, [reachGoal])

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
    <>
      <SEO
        title="Курсинг в Донино: рекорды скорости и бега 350 м"
        description="Рекорды курсинга в Донино: замер скорости (км/ч) и бега борзых на 350 м (сек) на полигоне Курсинг Донино. Таблицы по породам, статистика и история."
        canonicalUrl="https://coursing-stats.ru/speed-records"
        keywords="курсинг в Донино, курсинг Донино, рекорды Донино, замер скорости, бега 350 м, скорость собаки"
      />
      <MobileSubNavTabs
        tabs={tabs}
        activeTab={view === 'stats' ? 'stats' : 'records'}
        onChange={(id) => handleTabChange(id as 'records' | 'stats')}
        ariaLabel="Разделы Донино"
      />

      <div className="space-y-4">
        <DoninoPageToolbar
          view={view}
          searchQuery={page.searchQuery}
          onSearchChange={page.setSearchQuery}
          filterYears={page.filterYears}
          filterBreeds={page.filterBreeds}
          onBreedChange={page.onBreedChange}
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
          onYearChange={page.onYearChange}
          currentSeason={page.currentSeason}
          onClearFilters={page.clearAllFilters}
          onClearPanelFilters={page.clearPanelFilters}
          hasActiveFilters={page.hasActiveFilters}
          dogIndex={page.dogIndex}
          speedRecords={page.filteredRecords}
          coursingRecords={page.filteredCoursingRecords}
        />

        <div>
          {page.loading && <SkeletonLoader variant="card" count={6} />}

          {page.error && !page.loading && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
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

        <div className="pt-2 text-center">
          <DoninoAttribution variant="inline" />
        </div>
      </div>
    </>
  )
}

export default SpeedRecords
