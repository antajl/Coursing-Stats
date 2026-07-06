import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import DogSexIcon from '../../../components/DogSexIcon'
import MultiFilterDropdown from '../../../components/toolbar/MultiFilterDropdown'
import PageToolbar from '../../../components/toolbar/PageToolbar'
import ToolbarOptionBar from '../../../components/toolbar/ToolbarOptionBar'
import ToolbarSearch from '../../../components/toolbar/ToolbarSearch'
import ViewToggle from '../../../components/toolbar/ViewToggle'
import { TOOLBAR_NUMBER_INPUT } from '../../../lib/toolbar'
import { api } from '../../../services/api'
import { dedupeSpeedRecords, getRecordYear } from '../../../lib/recordDates'
import DogSearchCard from './DogSearchCard'
import GroupedStatsTable from './GroupedStatsTable'
import type { GroupBy } from './constants'
import { GROUP_BY_OPTIONS } from './constants'
import {
  buildSpeedGroupedStats,
  filterSpeedRecords,
  findExactDogName,
  summarizeCoursingDogs,
  summarizeSpeedDogs,
  uniqueSpeedDogCount,
  dedupeCoursingRecords,
  type CoursingRecordRow,
  type SpeedRecordRow,
} from './doninoStatsUtils'
import { StatCard, DistributionChart } from './statsUi'
import { buildSpeedStatsActiveFilterChips } from '../toolbarFilters'

interface SpeedStatsViewProps {
  view: 'table' | 'stats'
  onViewChange: (view: 'table' | 'stats') => void
}

export default function SpeedStatsView({ view, onViewChange }: SpeedStatsViewProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [records, setRecords] = useState<SpeedRecordRow[]>([])
  const [coursingRecords, setCoursingRecords] = useState<CoursingRecordRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [filterYears, setFilterYears] = useState<string[]>([])
  const [filterBreeds, setFilterBreeds] = useState<string[]>([])
  const [filterSexes, setFilterSexes] = useState<string[]>([])
  const [filterMinSpeed, setFilterMinSpeed] = useState('')
  const [filterMaxSpeed, setFilterMaxSpeed] = useState('')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const groupBy = (searchParams.get('groupBy') as GroupBy) || 'breed'
  const setGroupBy = (value: GroupBy) => {
    const params = new URLSearchParams(searchParams)
    if (value === 'breed') params.delete('groupBy')
    else params.set('groupBy', value)
    setSearchParams(params)
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const [speedRes, coursingRes] = await Promise.all([
        api.getSpeedRecords('', '', 10000, '', ''),
        api.getCoursingRecords('', 10000, '', '', ''),
      ])
      if (cancelled) return
      if (speedRes.success) setRecords(Array.isArray(speedRes.data) ? speedRes.data : [])
      else setError(speedRes.error ?? 'Ошибка загрузки')
      if (coursingRes.success) setCoursingRecords(Array.isArray(coursingRes.data) ? coursingRes.data : [])
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const filtered = useMemo(
    () =>
      dedupeSpeedRecords(
        filterSpeedRecords(records, {
          search: searchQuery,
          years: filterYears,
          breeds: filterBreeds,
          sexes: filterSexes,
          minSpeed: filterMinSpeed,
          maxSpeed: filterMaxSpeed,
        })
      ),
    [records, searchQuery, filterYears, filterBreeds, filterSexes, filterMinSpeed, filterMaxSpeed]
  )

  const grouped = useMemo(() => buildSpeedGroupedStats(filtered, groupBy), [filtered, groupBy])
  const bestDog = useMemo(() => summarizeSpeedDogs(filtered)[0], [filtered])
  const speeds = filtered.map((r) => parseFloat(String(r.speed_km_h))).filter((s) => s > 0)
  const avgSpeed = speeds.length ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0

  const exactName = findExactDogName(records, searchQuery)
  const dogSpeed = exactName ? summarizeSpeedDogs(filtered.filter((r) => r.name === exactName))[0] : null
  const dogCoursing = exactName
    ? summarizeCoursingDogs(dedupeCoursingRecords(coursingRecords).filter((r) => r.name === exactName))[0]
    : null

  const speedRank =
    dogSpeed && exactName
      ? (() => {
          const inBreed = summarizeSpeedDogs(filtered.filter((r) => r.breed === dogSpeed.breed))
          const idx = inBreed.findIndex((d) => d.name === exactName && d.sex === dogSpeed.sex)
          return idx >= 0 ? { rank: idx + 1, total: inBreed.length } : null
        })()
      : null

  const allYears = [...new Set(records.map((r) => String(getRecordYear(r.date))).filter(Boolean))].sort().reverse()
  const allBreeds = [...new Set(records.map((r) => r.breed))].sort()
  const allSexes = [...new Set(records.map((r) => r.sex))].sort()

  const toggleYear = (year: string) =>
    setFilterYears((prev) => (prev.includes(year) ? prev.filter((x) => x !== year) : [...prev, year]))
  const toggleBreed = (breed: string) =>
    setFilterBreeds((prev) => (prev.includes(breed) ? prev.filter((x) => x !== breed) : [...prev, breed]))
  const toggleSex = (sex: string) =>
    setFilterSexes((prev) => (prev.includes(sex) ? prev.filter((x) => x !== sex) : [...prev, sex]))

  const clearFilters = () => {
    setSearchQuery('')
    setFilterYears([])
    setFilterBreeds([])
    setFilterSexes([])
    setFilterMinSpeed('')
    setFilterMaxSpeed('')
  }

  const hasActiveFilters = Boolean(
    searchQuery || filterYears.length || filterBreeds.length || filterSexes.length || filterMinSpeed || filterMaxSpeed
  )

  const activeFilterChips = useMemo(
    () =>
      buildSpeedStatsActiveFilterChips(
        searchQuery,
        filterYears,
        filterBreeds,
        filterSexes,
        filterMinSpeed,
        filterMaxSpeed,
        setSearchQuery,
        toggleYear,
        toggleBreed,
        toggleSex,
        setFilterMinSpeed,
        setFilterMaxSpeed
      ),
    [searchQuery, filterYears, filterBreeds, filterSexes, filterMinSpeed, filterMaxSpeed]
  )

  const checkboxRowClass =
    'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-charcoal-700 hover:bg-cream-50 dark:text-charcoal-200 dark:hover:bg-charcoal-700'

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-camel-600 border-t-transparent" />
      </div>
    )
  }

  if (error) return <div className="text-red-600 p-4">Ошибка: {error}</div>

  return (
    <div className="space-y-4">
      <div ref={dropdownRef}>
        <PageToolbar
          activeFilterChips={activeFilterChips}
          onClearAllFilters={hasActiveFilters ? clearFilters : undefined}
          bottomLeft={<ViewToggle view={view} onViewChange={onViewChange} />}
          bottomRight={
            <ToolbarOptionBar
              label="Группировка"
              options={GROUP_BY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              value={groupBy}
              onChange={(value) => setGroupBy(value as GroupBy)}
            />
          }
          filters={
            <>
              <ToolbarSearch value={searchQuery} onChange={setSearchQuery} placeholder="Кличка, порода…" />
              <MultiFilterDropdown
                label="Год"
                selectedCount={filterYears.length}
                open={openDropdown === 'year'}
                onToggle={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}
              >
                {allYears.map((year) => (
                  <label key={year} className={checkboxRowClass}>
                    <input type="checkbox" checked={filterYears.includes(year)} onChange={() => toggleYear(year)} />
                    {year}
                  </label>
                ))}
              </MultiFilterDropdown>
              <MultiFilterDropdown
                label="Порода"
                selectedCount={filterBreeds.length}
                open={openDropdown === 'breed'}
                onToggle={() => setOpenDropdown(openDropdown === 'breed' ? null : 'breed')}
                className="min-w-[120px]"
              >
                {allBreeds.map((breed) => (
                  <label key={breed} className={checkboxRowClass}>
                    <input type="checkbox" checked={filterBreeds.includes(breed)} onChange={() => toggleBreed(breed)} />
                    <span className="truncate">{breed}</span>
                  </label>
                ))}
              </MultiFilterDropdown>
              <MultiFilterDropdown
                label="Пол"
                selectedCount={filterSexes.length}
                open={openDropdown === 'sex'}
                onToggle={() => setOpenDropdown(openDropdown === 'sex' ? null : 'sex')}
              >
                {allSexes.map((sex) => (
                  <label key={sex} className={checkboxRowClass}>
                    <input type="checkbox" checked={filterSexes.includes(sex)} onChange={() => toggleSex(sex)} />
                    <DogSexIcon sex={sex} />
                    <span>{sex === 'С' ? 'Сука' : sex === 'К' ? 'Кабель' : sex}</span>
                  </label>
                ))}
              </MultiFilterDropdown>
              <input
                type="number"
                value={filterMinSpeed}
                onChange={(e) => setFilterMinSpeed(e.target.value)}
                placeholder="Мин. км/ч"
                className={TOOLBAR_NUMBER_INPUT}
              />
              <input
                type="number"
                value={filterMaxSpeed}
                onChange={(e) => setFilterMaxSpeed(e.target.value)}
                placeholder="Макс. км/ч"
                className={TOOLBAR_NUMBER_INPUT}
              />
            </>
          }
        />
      </div>

      {exactName && (
        <DogSearchCard
          name={exactName}
          breed={dogSpeed?.breed ?? dogCoursing?.breed ?? ''}
          speed={dogSpeed}
          coursing={dogCoursing}
          speedRank={speedRank}
        />
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Замеров" value={String(filtered.length)} />
        <StatCard label="Собак" value={String(uniqueSpeedDogCount(filtered))} />
        <StatCard label="Средняя скорость" value={`${avgSpeed.toFixed(1)} км/ч`} highlight />
        <StatCard
          label="Лучшая скорость"
          value={bestDog ? `${bestDog.bestSpeed.toFixed(1)} км/ч` : '—'}
          sub={bestDog?.name}
          highlight
        />
      </div>

      <DistributionChart
        title="Распределение скоростей"
        ranges={[
          { min: 0, max: 40, label: '0–40 км/ч' },
          { min: 40, max: 45, label: '40–45' },
          { min: 45, max: 50, label: '45–50' },
          { min: 50, max: 55, label: '50–55' },
          { min: 55, max: 60, label: '55–60' },
          { min: 60, max: 65, label: '60–65' },
          { min: 65, max: 100, label: '65+' },
        ]}
        values={speeds}
      />

      <GroupedStatsTable mode="speed" rows={grouped} groupBy={groupBy} />
    </div>
  )
}
