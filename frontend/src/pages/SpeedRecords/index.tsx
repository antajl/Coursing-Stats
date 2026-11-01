import { useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Table, BarChart2 } from 'lucide-react'
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
  const navigate = useNavigate()
  const rawTab = searchParams.get('tab')
  const rawView = searchParams.get('view')
  const view = rawTab === 'stats' || rawView === 'stats' ? 'stats' : 'table'
  const page = useSpeedRecordsPage()
  const { reachGoal } = useYandexGoal()

  const handleSubNavChange = (id: string) => {
    if (id === 'championship') {
      navigate('/donino/championship')
    }
  }

  const handleViewChange = (newView: 'table' | 'stats') => {
    const next = new URLSearchParams(searchParams)
    if (newView === 'stats') {
      next.set('tab', 'stats')
      next.delete('view')
    } else {
      next.delete('tab')
      next.delete('view')
    }
    setSearchParams(next)
  }

  const subNavTabs = [
    { id: 'records', label: 'Рекорды Донино' },
    { id: 'championship', label: 'Клубный чемпионат' },
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
      ].join('|'),
    [
      page.searchQuery,
      page.filterYears,
      page.filterBreeds,
      page.filterSexes,
      page.sortField,
      page.sortDirection,
    ]
  )

  return (
    <>
      <h1 className="sr-only">Курсинг Донино: замеры скорости радаром и рекорды забегов на 350 м</h1>
      <SEO
        title="Курсинг Донино — результаты забегов, замеры скорости (км/ч) и рекорды борзых"
        description="База бегового клуба «Курсинг в Донино»: результаты забегов, радарные замеры скорости (км/ч) и рекорды борзых на 350 м. Салюки, уиппеты, РПБ, басенджи на полигоне в Раменском районе."
        canonicalUrl="https://coursing-stats.ru/speed-records/"
        keywords="курсинг донино, курсинг в донино, замеры скорости собак, рекорды скорости донино, бега 350 м, беговой клуб донино, скорость борзых"
      />
      <MobileSubNavTabs
        tabs={subNavTabs}
        activeTab="records"
        onChange={handleSubNavChange}
        ariaLabel="Разделы Донино"
      />

      <div className="space-y-4">
        {/* Внутренний переключатель видов: Таблица замеров / Статистика и аналитика */}
        <div className="flex items-center justify-between gap-3 pt-0.5">
          <div className="inline-flex items-center p-0.5 rounded-lg bg-cream-100 border border-old-money-200 shadow-2xs">
            <button
              type="button"
              onClick={() => handleViewChange('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                view === 'table'
                  ? 'border border-camel-400 bg-camel-100 text-camel-950 font-bold shadow-2xs'
                  : 'text-charcoal-600 hover:text-charcoal-900 font-medium'
              }`}
            >
              <Table className="h-3.5 w-3.5" />
              <span>Таблица замеров</span>
            </button>
            <button
              type="button"
              onClick={() => handleViewChange('stats')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                view === 'stats'
                  ? 'border border-camel-400 bg-camel-100 text-camel-950 font-bold shadow-2xs'
                  : 'text-charcoal-600 hover:text-charcoal-900 font-medium'
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5" />
              <span>Статистика и аналитика</span>
            </button>
          </div>
        </div>
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
              sortField={page.sortField}
              sortDirection={page.sortDirection}
              onSort={page.handleSort}
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
