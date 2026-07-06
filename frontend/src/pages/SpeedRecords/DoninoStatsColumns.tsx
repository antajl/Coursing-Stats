import { useMemo, useState } from 'react'
import ToolbarSegmentControl from '../../components/toolbar/ToolbarSegmentControl'
import DogSearchCard from './stats/DogSearchCard'
import DoninoGroupCardList from './stats/DoninoGroupCardList'
import DoninoStatsSummary from './stats/DoninoStatsSummary'
import { GROUP_BY_OPTIONS, type GroupBy } from './stats/constants'
import { CollapsibleDistributionChart } from './stats/statsUi'
import {
  buildCoursingGroupedStats,
  buildSexByDogMap,
  buildSpeedGroupedStats,
  dedupeCoursingRecords,
  dedupeSpeedRecords,
  filterCoursingRecords,
  filterSpeedRecords,
  findExactDogName,
  summarizeCoursingDogs,
  summarizeSpeedDogs,
  uniqueCoursingDogCount,
  uniqueSpeedDogCount,
  type CoursingRecordRow,
  type SpeedRecordRow,
} from './stats/doninoStatsUtils'

interface DoninoStatsColumnsProps {
  speedRecords: SpeedRecordRow[]
  coursingRecords: CoursingRecordRow[]
  searchQuery: string
  filterYears: string[]
  filterBreeds: string[]
  filterSexes: string[]
  filterMinSpeed: string
  filterMaxSpeed: string
  filterMinTime: string
  filterMaxTime: string
  statsGroupBy: GroupBy
  onStatsGroupByChange: (value: GroupBy) => void
}

const SPEED_RANGES = [
  { min: 0, max: 40, label: '0–40' },
  { min: 40, max: 45, label: '40–45' },
  { min: 45, max: 50, label: '45–50' },
  { min: 50, max: 55, label: '50–55' },
  { min: 55, max: 60, label: '55–60' },
  { min: 60, max: 65, label: '60–65' },
  { min: 65, max: 100, label: '65+' },
]

const COURSING_RANGES = [
  { min: 0, max: 22, label: 'до 22' },
  { min: 22, max: 24, label: '22–24' },
  { min: 24, max: 26, label: '24–26' },
  { min: 26, max: 28, label: '26–28' },
  { min: 28, max: 32, label: '28–32' },
  { min: 32, max: 100, label: '32+' },
]

export default function DoninoStatsColumns({
  speedRecords,
  coursingRecords,
  searchQuery,
  filterYears,
  filterBreeds,
  filterSexes,
  filterMinSpeed,
  filterMaxSpeed,
  filterMinTime,
  filterMaxTime,
  statsGroupBy,
  onStatsGroupByChange,
}: DoninoStatsColumnsProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  const sexByDog = useMemo(() => buildSexByDogMap(speedRecords), [speedRecords])

  const filteredSpeed = useMemo(
    () =>
      dedupeSpeedRecords(
        filterSpeedRecords(speedRecords, {
          search: searchQuery,
          years: filterYears,
          breeds: filterBreeds,
          sexes: filterSexes,
          minSpeed: filterMinSpeed,
          maxSpeed: filterMaxSpeed,
        })
      ),
    [speedRecords, searchQuery, filterYears, filterBreeds, filterSexes, filterMinSpeed, filterMaxSpeed]
  )

  const filteredCoursing = useMemo(
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

  const speedGrouped = useMemo(
    () => buildSpeedGroupedStats(filteredSpeed, statsGroupBy),
    [filteredSpeed, statsGroupBy]
  )
  const coursingGrouped = useMemo(
    () => buildCoursingGroupedStats(filteredCoursing, statsGroupBy, sexByDog),
    [filteredCoursing, statsGroupBy, sexByDog]
  )

  const bestSpeedDog = useMemo(() => summarizeSpeedDogs(filteredSpeed)[0], [filteredSpeed])
  const bestCoursingDog = useMemo(() => summarizeCoursingDogs(filteredCoursing)[0], [filteredCoursing])

  const speeds = filteredSpeed.map((r) => parseFloat(String(r.speed_km_h))).filter((s) => s > 0)
  const avgSpeed = speeds.length ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0

  const times = filteredCoursing.map((r) => parseFloat(String(r.time_seconds))).filter((t) => t > 0)
  const avgTime = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0

  const exactName = findExactDogName(speedRecords, searchQuery) ?? findExactDogName(coursingRecords, searchQuery)
  const dogSpeed = exactName ? summarizeSpeedDogs(filteredSpeed.filter((r) => r.name === exactName))[0] : null
  const dogCoursing = exactName
    ? summarizeCoursingDogs(filteredCoursing.filter((r) => r.name === exactName))[0]
    : null

  const speedRank =
    dogSpeed && exactName
      ? (() => {
          const inBreed = summarizeSpeedDogs(filteredSpeed.filter((r) => r.breed === dogSpeed.breed))
          const idx = inBreed.findIndex((d) => d.name === exactName && d.sex === dogSpeed.sex)
          return idx >= 0 ? { rank: idx + 1, total: inBreed.length } : null
        })()
      : null

  const coursingRank =
    dogCoursing && exactName
      ? (() => {
          const inBreed = summarizeCoursingDogs(filteredCoursing.filter((r) => r.breed === dogCoursing.breed))
          const idx = inBreed.findIndex((d) => d.name === exactName)
          return idx >= 0 ? { rank: idx + 1, total: inBreed.length } : null
        })()
      : null

  const handleGroupByChange = (value: string) => {
    setExpandedKey(null)
    onStatsGroupByChange(value as GroupBy)
  }

  const handleToggleGroup = (key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key))
  }

  return (
    <div className="space-y-6">
      {exactName && (
        <DogSearchCard
          name={exactName}
          breed={dogSpeed?.breed ?? dogCoursing?.breed ?? ''}
          speed={dogSpeed}
          coursing={dogCoursing}
          speedRank={speedRank}
          coursingRank={coursingRank}
        />
      )}

      <div>
        <ToolbarSegmentControl
          segments={GROUP_BY_OPTIONS.map((o) => ({ id: o.value, label: o.label }))}
          value={statsGroupBy}
          onChange={handleGroupByChange}
          ariaLabel="Группировка статистики"
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
        <section className="min-w-0">
          <DoninoStatsSummary
            title="Замер"
            dogCount={uniqueSpeedDogCount(filteredSpeed)}
            mode="speed"
            runCount={filteredSpeed.length}
            avgValue={avgSpeed}
            bestValue={bestSpeedDog?.bestSpeed ?? null}
            bestDogName={bestSpeedDog?.name ?? null}
            bestDogBreed={bestSpeedDog?.breed}
            hasData={filteredSpeed.length > 0}
          />
          {speeds.length > 0 && (
            <CollapsibleDistributionChart
              title="Распределение скоростей"
              ranges={SPEED_RANGES}
              values={speeds}
            />
          )}
          <DoninoGroupCardList
            mode="speed"
            rows={speedGrouped}
            groupBy={statsGroupBy}
            expandedKey={expandedKey}
            onToggle={handleToggleGroup}
          />
        </section>

        <section className="min-w-0">
          <DoninoStatsSummary
            title="Бега 350 м"
            dogCount={uniqueCoursingDogCount(filteredCoursing)}
            mode="coursing"
            runCount={filteredCoursing.length}
            avgValue={avgTime}
            bestValue={bestCoursingDog?.bestTime ?? null}
            bestDogName={bestCoursingDog?.name ?? null}
            bestDogBreed={bestCoursingDog?.breed}
            hasData={filteredCoursing.length > 0}
          />
          {times.length > 0 && (
            <CollapsibleDistributionChart
              title="Распределение времён"
              ranges={COURSING_RANGES}
              values={times}
            />
          )}
          <DoninoGroupCardList
            mode="coursing"
            rows={coursingGrouped}
            groupBy={statsGroupBy}
            expandedKey={expandedKey}
            onToggle={handleToggleGroup}
          />
        </section>
      </div>
    </div>
  )
}
