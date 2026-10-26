import { useState } from 'react'
import DoninoListRecordRow from './DoninoListRecordRow'
import DoninoColumnPlaque, { DoninoColumnShell } from './DoninoColumnPlaque'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import RecordSortBar from './RecordSortBar'
import { SegmentedTabs } from '../../components/ui/SegmentedTabs'

const UNIFIED_SORT_OPTIONS = [
  { field: 'result', label: 'Результат' },
  { field: 'date', label: 'Дата' },
  { field: 'name', label: 'Кличка' },
]

interface SpeedRecord {
  id: string | number
  name: string
  sex: string
  breed: string
  speed_km_h: number
  date: string
  screenshot_url?: string
  status?: string
  history?: unknown[]
  track_type?: string | null
  rank?: number
}

interface CoursingRecord {
  id: string | number
  name: string
  breed: string
  sex?: string
  time_seconds: number
  date: string
  status?: string
  history?: unknown[]
  rank?: number
}

interface DoninoRecordsColumnsProps {
  speedRecords: SpeedRecord[]
  coursingRecords: CoursingRecord[]
  sortField: string
  sortDirection: string
  onSort: (field: string) => void
  resetScrollKey: string
}

export default function DoninoRecordsColumns({
  speedRecords,
  coursingRecords,
  sortField,
  sortDirection,
  onSort,
  resetScrollKey,
}: DoninoRecordsColumnsProps) {
  const [mobileTab, setMobileTab] = useState<'speed' | 'coursing'>('speed')
  const listLength = Math.max(speedRecords.length, coursingRecords.length)
  const { visibleCount, loadMoreRef, hasMore } = useInfiniteScroll(listLength, [resetScrollKey])

  const latestSpeedDate = useMemo(() => {
    let max = ''
    for (const r of speedRecords) {
      if (r.date && r.date > max) max = r.date
    }
    return max || null
  }, [speedRecords])

  const latestCoursingDate = useMemo(() => {
    let max = ''
    for (const r of coursingRecords) {
      if (r.date && r.date > max) max = r.date
    }
    return max || null
  }, [coursingRecords])

  const visibleSpeed = speedRecords.slice(0, visibleCount)
  const visibleCoursing = coursingRecords.slice(0, visibleCount)

  const emptyBoth = speedRecords.length === 0 && coursingRecords.length === 0

  if (emptyBoth) {
    return <div className="py-12 text-center text-old-money-600">Нет данных</div>
  }

  const speedPlaque = (
    <div className="hidden lg:block">
      <DoninoColumnPlaque asHeader title="Замер" count={speedRecords.length} />
    </div>
  )

  const coursingPlaque = (
    <div className="hidden lg:block">
      <DoninoColumnPlaque asHeader title="Бега 350 м" count={coursingRecords.length} />
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Мобильный переключатель дисциплин */}
      <SegmentedTabs
        breakpoint="lg"
        tabs={[
          { id: 'speed', label: 'Замер', count: speedRecords.length },
          { id: 'coursing', label: 'Бега 350 м', count: coursingRecords.length },
        ]}
        activeTab={mobileTab}
        onChange={setMobileTab}
        ariaLabel="Дисциплины полигона Донино"
      />

      {/* Единая сортировка для обеих колонок */}
      <div className="flex items-center justify-between">
        <RecordSortBar
          options={UNIFIED_SORT_OPTIONS}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
        <div className={`min-w-0 space-y-3 ${mobileTab === 'speed' ? 'block' : 'hidden lg:block'}`}>
          <DoninoColumnShell plaque={speedPlaque}>
            {visibleSpeed.length > 0 ? (
              visibleSpeed.map((record) => (
                <DoninoListRecordRow
                  key={`speed-${record.breed}-${record.name}`}
                  mode="speed"
                  name={record.name}
                  breed={record.breed}
                  sex={record.sex}
                  date={record.date}
                  status={record.status}
                  history={record.history}
                  speedKmh={record.speed_km_h}
                  screenshotUrl={record.screenshot_url}
                  trackType={record.track_type}
                  rank={record.rank}
                  latestDateInDataset={latestSpeedDate}
                />
              ))
            ) : (
              <p className="donino-home-empty">Нет данных</p>
            )}
          </DoninoColumnShell>
        </div>

        <div className={`min-w-0 space-y-3 ${mobileTab === 'coursing' ? 'block' : 'hidden lg:block'}`}>
          <DoninoColumnShell plaque={coursingPlaque}>
            {visibleCoursing.length > 0 ? (
              visibleCoursing.map((record) => (
                <DoninoListRecordRow
                  key={`coursing-${record.breed}-${record.name}`}
                  mode="coursing"
                  name={record.name}
                  breed={record.breed}
                  sex={record.sex}
                  date={record.date}
                  status={record.status}
                  history={record.history}
                  timeSeconds={record.time_seconds}
                  rank={record.rank}
                  latestDateInDataset={latestCoursingDate}
                />
              ))
            ) : (
              <p className="donino-home-empty">Нет данных</p>
            )}
          </DoninoColumnShell>
        </div>
      </div>

      {hasMore && (
        <div
          ref={loadMoreRef}
          className="py-4 text-center text-sm text-charcoal-500"
        >
          Загрузка…
        </div>
      )}
    </div>
  )
}
