import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../../../services/api'
import { getRecordYear } from '../../../lib/recordDates'
import DogSearchCard from './DogSearchCard'
import GroupedStatsTable from './GroupedStatsTable'
import ViewToggle from './ViewToggle'
import type { GroupBy } from './constants'
import {
  buildCoursingGroupedStats,
  buildSexByDogMap,
  dedupeCoursingRecords,
  filterCoursingRecords,
  findExactDogName,
  summarizeCoursingDogs,
  summarizeSpeedDogs,
  uniqueCoursingDogCount,
  dedupeSpeedRecords,
  type CoursingRecordRow,
  type SpeedRecordRow,
} from './doninoStatsUtils'
import { FilterDropdown, StatCard, DistributionChart } from './statsUi'

interface CoursingStatsViewProps {
  view: 'table' | 'stats'
  onViewChange: (view: 'table' | 'stats') => void
}

export default function CoursingStatsView({ view, onViewChange }: CoursingStatsViewProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [coursingRecords, setCoursingRecords] = useState<CoursingRecordRow[]>([])
  const [speedRecords, setSpeedRecords] = useState<SpeedRecordRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [filterYears, setFilterYears] = useState<string[]>([])
  const [filterBreeds, setFilterBreeds] = useState<string[]>([])
  const [filterMinTime, setFilterMinTime] = useState('')
  const [filterMaxTime, setFilterMaxTime] = useState('')
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
      const [coursingRes, speedRes] = await Promise.all([
        api.getCoursingRecords('', 10000, '', '', ''),
        api.getSpeedRecords('', '', 10000, '', ''),
      ])
      if (cancelled) return
      if (coursingRes.success) setCoursingRecords(Array.isArray(coursingRes.data) ? coursingRes.data : [])
      else setError(coursingRes.error ?? 'Ошибка загрузки')
      if (speedRes.success) setSpeedRecords(Array.isArray(speedRes.data) ? speedRes.data : [])
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

  const sexByDog = useMemo(() => buildSexByDogMap(speedRecords), [speedRecords])

  const filtered = useMemo(
    () =>
      dedupeCoursingRecords(
        filterCoursingRecords(coursingRecords, {
          search: searchQuery,
          years: filterYears,
          breeds: filterBreeds,
          minTime: filterMinTime,
          maxTime: filterMaxTime,
        })
      ),
    [coursingRecords, searchQuery, filterYears, filterBreeds, filterMinTime, filterMaxTime]
  )

  const grouped = useMemo(
    () => buildCoursingGroupedStats(filtered, groupBy, sexByDog),
    [filtered, groupBy, sexByDog]
  )
  const bestDog = useMemo(() => summarizeCoursingDogs(filtered)[0], [filtered])
  const times = filtered.map((r) => parseFloat(String(r.time_seconds))).filter((t) => t > 0)
  const avgTime = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0

  const exactName = findExactDogName(coursingRecords, searchQuery)
  const dogCoursing = exactName ? summarizeCoursingDogs(filtered.filter((r) => r.name === exactName))[0] : null
  const dogSpeed = exactName
    ? summarizeSpeedDogs(dedupeSpeedRecords(speedRecords).filter((r) => r.name === exactName))[0]
    : null

  const coursingRank =
    dogCoursing && exactName
      ? (() => {
          const inBreed = summarizeCoursingDogs(filtered.filter((r) => r.breed === dogCoursing.breed))
          const idx = inBreed.findIndex((d) => d.name === exactName)
          return idx >= 0 ? { rank: idx + 1, total: inBreed.length } : null
        })()
      : null

  const allYears = [...new Set(coursingRecords.map((r) => String(getRecordYear(r.date))).filter(Boolean))]
    .sort()
    .reverse()
  const allBreeds = [...new Set(coursingRecords.map((r) => r.breed))].sort()

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-camel-600 border-t-transparent" />
      </div>
    )
  }

  if (error) return <div className="text-red-600 p-4">Ошибка: {error}</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" ref={dropdownRef}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск по кличке..."
          className="flex-1 min-w-[200px] px-4 py-3 rounded-xl border-2 border-cream-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800"
        />
        <FilterDropdown
          label={filterYears.length ? `Год: ${filterYears.length}` : 'Год'}
          open={openDropdown === 'year'}
          onToggle={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}
          options={allYears}
          selected={filterYears}
          onChange={(v) => setFilterYears((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))}
        />
        <FilterDropdown
          label={filterBreeds.length ? `Порода: ${filterBreeds.length}` : 'Порода'}
          open={openDropdown === 'breed'}
          onToggle={() => setOpenDropdown(openDropdown === 'breed' ? null : 'breed')}
          options={allBreeds}
          selected={filterBreeds}
          onChange={(v) => setFilterBreeds((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))}
        />
        <input
          type="number"
          step="0.01"
          value={filterMinTime}
          onChange={(e) => setFilterMinTime(e.target.value)}
          placeholder="Мин. сек"
          className="w-28 px-3 py-3 rounded-xl border-2 border-cream-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800"
        />
        <input
          type="number"
          step="0.01"
          value={filterMaxTime}
          onChange={(e) => setFilterMaxTime(e.target.value)}
          placeholder="Макс. сек"
          className="w-28 px-3 py-3 rounded-xl border-2 border-cream-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800"
        />
      </div>

      <ViewToggle view={view} onViewChange={onViewChange} />

      {groupBy === 'sex' && (
        <p className="text-sm text-charcoal-500">
          Группировка по полу: пол берётся из таблицы замеров скорости (в листе бегов 350 м пола нет).
        </p>
      )}

      {exactName && (
        <DogSearchCard
          name={exactName}
          breed={dogCoursing?.breed ?? dogSpeed?.breed ?? ''}
          speed={dogSpeed}
          coursing={dogCoursing}
          coursingRank={coursingRank}
        />
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Зачётов" value={String(filtered.length)} />
        <StatCard label="Собак" value={String(uniqueCoursingDogCount(filtered))} />
        <StatCard label="Среднее время" value={times.length ? `${avgTime.toFixed(2)} сек` : '—'} highlight />
        <StatCard
          label="Лучшее время"
          value={bestDog ? `${bestDog.bestTime.toFixed(2)} сек` : '—'}
          sub={bestDog?.name}
          highlight
        />
      </div>

      <DistributionChart
        title="Распределение времён (350 м)"
        ranges={[
          { min: 0, max: 22, label: 'до 22 с' },
          { min: 22, max: 24, label: '22–24 с' },
          { min: 24, max: 26, label: '24–26 с' },
          { min: 26, max: 28, label: '26–28 с' },
          { min: 28, max: 32, label: '28–32 с' },
          { min: 32, max: 100, label: '32+ с' },
        ]}
        values={times}
      />

      <GroupedStatsTable mode="coursing" rows={grouped} groupBy={groupBy} onGroupByChange={setGroupBy} />
    </div>
  )
}
