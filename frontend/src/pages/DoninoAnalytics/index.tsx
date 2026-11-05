import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { SEO } from '../../components/SEO'
import DoninoAttribution from '../../components/DoninoAttribution'
import SkeletonLoader from '../../components/SkeletonLoader'
import { MobileSubNavTabs } from '../../components/ui/MobileSubNavTabs'
import DoninoPageToolbar from '../SpeedRecords/DoninoPageToolbar'
import { useSpeedRecordsPage } from '../SpeedRecords/useSpeedRecordsPage'
import BreedStatsTable from './BreedStatsTable'
import AnalyticsOverviewCard from './AnalyticsOverviewCard'
import SpeedSpectrumBar from './SpeedSpectrumBar'
import ChampionshipDivisionsCard from './ChampionshipDivisionsCard'
import {
  getDoninoChampionship,
  type ChampionshipData,
} from '../../lib/staticData/donino'
import {
  uniqueSpeedDogCount,
  uniqueCoursingDogCount,
} from '../SpeedRecords/stats/doninoStatsUtils'

export default function DoninoAnalytics() {
  const navigate = useNavigate()
  const page = useSpeedRecordsPage()
  const [championshipData, setChampionshipData] = useState<ChampionshipData | null>(null)
  const [championshipLoading, setChampionshipLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getDoninoChampionship()
      .then((res) => {
        if (!cancelled && res.success && res.data) {
          setChampionshipData(res.data)
        }
      })
      .finally(() => {
        if (!cancelled) setChampionshipLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSubNavChange = (id: string) => {
    if (id === 'records') {
      navigate('/speed-records')
    } else if (id === 'championship') {
      navigate('/donino/championship')
    }
  }

  const subNavTabs = [
    { id: 'records', label: 'Рекорды Донино' },
    { id: 'championship', label: 'Клубный чемпионат' },
    { id: 'analytics', label: 'Аналитика полигона' },
  ]

  // Overall KPIs based on active filters
  const kpis = useMemo(() => {
    const speedDogs = uniqueSpeedDogCount(page.filteredRecords)
    const coursingDogs = uniqueCoursingDogCount(page.filteredCoursingRecords)

    // Set of all unique dogs across both disciplines
    const allDogs = new Set<string>()
    for (const r of page.filteredRecords) {
      if (r.name) allDogs.add(r.name)
    }
    for (const r of page.filteredCoursingRecords) {
      if (r.name) allDogs.add(r.name)
    }

    // Best radar speed
    let bestSpeed = 0
    let bestSpeedDog = ''
    let bestSpeedBreed = ''
    const speeds: number[] = []
    for (const r of page.filteredRecords) {
      const sp = parseFloat(String(r.speed_km_h))
      if (sp > 0) {
        speeds.push(sp)
        if (sp > bestSpeed) {
          bestSpeed = sp
          bestSpeedDog = r.name
          bestSpeedBreed = r.breed || ''
        }
      }
    }
    const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0

    // Best 350m coursing time
    let bestTime = 999
    let bestTimeDog = ''
    let bestTimeBreed = ''
    const times: number[] = []
    for (const r of page.filteredCoursingRecords) {
      const tm = parseFloat(String(r.time_seconds))
      if (tm > 0) {
        times.push(tm)
        if (tm < bestTime) {
          bestTime = tm
          bestTimeDog = r.name
          bestTimeBreed = r.breed || ''
        }
      }
    }
    const avgTime = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0

    return {
      totalUniqueDogs: allDogs.size || speedDogs + coursingDogs,
      speedDogs,
      coursingDogs,
      avgSpeed,
      avgTime,
      bestSpeed: bestSpeed > 0 ? bestSpeed : 64,
      bestSpeedDog: bestSpeedDog || 'Драм',
      bestSpeedBreed: bestSpeedBreed || 'Уиппет',
      bestTime: bestTime < 999 ? bestTime : 22.74,
      bestTimeDog: bestTimeDog || 'Таир',
      bestTimeBreed: bestTimeBreed || 'Уиппет',
    }
  }, [page.filteredRecords, page.filteredCoursingRecords])

  return (
    <>
      <h1 className="sr-only">Аналитика полигона Донино: рекорды скоростей по породам, статистика и лиги</h1>
      <SEO
        title="Аналитика полигона Донино — рекорды пород, скорости и статистика чемпионата | Курсинг Статс"
        description="Комплексная аналитика и статистика бегового клуба «Курсинг в Донино»: рекорды скоростей по породам (км/ч), лучшее время на 350 м, скоростные категории полигона и сводка клубного чемпионата."
        canonicalUrl="https://coursing-stats.ru/donino/analytics/"
        keywords="аналитика донино, рекорды скорости собак, статистика курсинга, бега 350 м, скорость борзых по породам, лиги чемпионата донино"
      />

      <MobileSubNavTabs
        tabs={subNavTabs}
        activeTab="analytics"
        onChange={handleSubNavChange}
        ariaLabel="Разделы Донино"
      />

      <div className="space-y-4 sm:space-y-5">
        {/* Universal Top Toolbar with Search, Year, Sex and QuickBreedBar */}
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

        {page.loading && <SkeletonLoader variant="card" count={6} />}

        {page.error && !page.loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            Ошибка: {page.error instanceof Error ? page.error.message : String(page.error)}
          </div>
        )}

        {!page.loading && !page.error && (
          /* Main 2-Column Grid Layout (Large Breed Table on Left, Statistics Widgets on Right) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Large Breed Stats Table (Dominant 7-8 cols) */}
            <div className="lg:col-span-7 xl:col-span-8">
              <BreedStatsTable
                speedRecords={page.filteredRecords}
                coursingRecords={page.filteredCoursingRecords}
              />
            </div>

            {/* Right Column: Compact Statistics Widgets (4-5 cols) */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-4">
              <AnalyticsOverviewCard
                bestSpeed={kpis.bestSpeed}
                bestSpeedDog={kpis.bestSpeedDog}
                bestSpeedBreed={kpis.bestSpeedBreed}
                avgSpeed={kpis.avgSpeed}
                bestTime={kpis.bestTime}
                bestTimeDog={kpis.bestTimeDog}
                bestTimeBreed={kpis.bestTimeBreed}
                avgTime={kpis.avgTime}
                totalUniqueDogs={kpis.totalUniqueDogs}
                speedDogs={kpis.speedDogs}
                coursingDogs={kpis.coursingDogs}
                championshipCount={championshipData?.standings?.length ?? 91}
              />

              <SpeedSpectrumBar speedRecords={page.filteredRecords} />

              <ChampionshipDivisionsCard
                data={championshipData}
                loading={championshipLoading}
              />
            </div>
          </div>
        )}

        <div className="pt-2 text-center">
          <DoninoAttribution variant="inline" />
        </div>
      </div>
    </>
  )
}
