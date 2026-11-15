import { useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate, useParams, useLocation, Navigate } from 'react-router-dom'
import { SEO } from '../../components/SEO'
import DoninoAttribution from '../../components/DoninoAttribution'
import { useYandexGoal } from '../../components/YandexMetrica'
import { useSpeedRecordsPage } from './useSpeedRecordsPage'
import DoninoPageToolbar from './DoninoPageToolbar'
import DoninoRecordsColumns from './DoninoRecordsColumns'
import SkeletonLoader from '../../components/SkeletonLoader'
import { MobileSubNavTabs } from '../../components/ui/MobileSubNavTabs'
import { setLastDoninoPath } from '../../lib/navState'

function SpeedRecords() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { year: routeYear } = useParams<{ year?: string }>()
  const rawTab = searchParams.get('tab')
  const rawView = searchParams.get('view')
  const page = useSpeedRecordsPage()
  const { reachGoal } = useYandexGoal()

  const isBaseRoute = location.pathname === '/speed-records' || location.pathname === '/speed-records/'
  if (isBaseRoute) {
    const rawYear = searchParams.get('year') ?? searchParams.get('years')
    const targetYear = rawYear || '2026'
    const next = new URLSearchParams(searchParams)
    next.delete('year')
    next.delete('years')
    const qs = next.toString()
    return <Navigate to={`/speed-records/${targetYear}/${qs ? '?' + qs : ''}`} replace />
  }

  useEffect(() => {
    if (rawTab === 'stats' || rawView === 'stats') {
      navigate('/donino/analytics', { replace: true })
    }
  }, [rawTab, rawView, navigate])

  const handleSubNavChange = (id: string) => {
    if (id === 'championship') {
      navigate('/donino/championship')
    } else if (id === 'analytics') {
      navigate('/donino/analytics')
    }
  }

  const prefetchDoninoTab = (id: string) => {
    if (id === 'championship') void import('../DoninoChampionship')
    else if (id === 'analytics') void import('../DoninoAnalytics')
  }

  // Warm other Donino tabs in background after initial paint
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const idle =
        typeof window !== 'undefined' && 'requestIdleCallback' in window
          ? window.requestIdleCallback.bind(window)
          : (cb: () => void) => window.setTimeout(cb, 200)
      idle(() => {
        void import('../DoninoChampionship')
        void import('../DoninoAnalytics')
      })
    }, 2000)
    return () => window.clearTimeout(timer)
  }, [])

  const subNavTabs = [
    { id: 'records', label: 'Рекорды Донино' },
    { id: 'championship', label: 'Клубный чемпионат' },
    { id: 'analytics', label: 'Аналитика полигона' },
  ]

  // Отслеживание просмотра рекордов скорости
  useEffect(() => {
    reachGoal('speed_records_view')
    setLastDoninoPath(`/speed-records/${routeYear || '2026'}/`)
  }, [reachGoal, routeYear])

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

  const displayYear = routeYear && routeYear !== 'all' ? routeYear : ''
  const seoTitle = displayYear
    ? `Замеры скорости и рекорды борзых ${displayYear} года — Курсинг в Донино`
    : 'Курсинг Донино — результаты забегов, замеры скорости (км/ч) и рекорды борзых'
  const canonicalUrl = routeYear
    ? `https://coursing-stats.ru/speed-records/${routeYear}/`
    : 'https://coursing-stats.ru/speed-records/'

  return (
    <>
      <h1 className="sr-only">Курсинг Донино: замеры скорости радаром и рекорды забегов на 350 м</h1>
      <SEO
        title={seoTitle}
        description="База бегового клуба «Курсинг в Донино»: результаты забегов, радарные замеры скорости (км/ч) и рекорды борзых на 350 м. Салюки, уиппеты, РПБ, басенджи на полигоне в Раменском районе."
        canonicalUrl={canonicalUrl}
        keywords="курсинг донино, курсинг в донино, замеры скорости собак, рекорды скорости донино, бега 350 м, беговой клуб донино, скорость борзых"
      />
      <MobileSubNavTabs
        tabs={subNavTabs}
        activeTab="records"
        onChange={handleSubNavChange}
        onHoverTab={prefetchDoninoTab}
        ariaLabel="Разделы Донино"
      />

      <div className="space-y-4">
        <DoninoPageToolbar
          view="table"
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

          {!page.loading && !page.error && (
            <DoninoRecordsColumns
              speedRecords={page.filteredRecords}
              coursingRecords={page.filteredCoursingRecords}
              sortField={page.sortField}
              sortDirection={page.sortDirection}
              onSort={page.handleSort}
              resetScrollKey={scrollResetKey}
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
