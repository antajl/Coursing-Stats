import DoninoListRecordRow from './DoninoListRecordRow'
import DoninoColumnPlaque from './DoninoColumnPlaque'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import RecordSortBar from './RecordSortBar'

const SPEED_SORT_OPTIONS = [
  { field: 'speed_km_h', label: 'Скорость' },
  { field: 'date', label: 'Дата' },
  { field: 'name', label: 'Кличка' },
]

const COURSING_SORT_OPTIONS = [
  { field: 'time_seconds', label: 'Время' },
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
}

interface DoninoRecordsColumnsProps {
  speedRecords: SpeedRecord[]
  coursingRecords: CoursingRecord[]
  speedSortField: string
  speedSortDirection: string
  coursingSortField: string
  coursingSortDirection: string
  onSpeedSort: (field: string) => void
  onCoursingSort: (field: string) => void
  resetScrollKey: string
}

export default function DoninoRecordsColumns({
  speedRecords,
  coursingRecords,
  speedSortField,
  speedSortDirection,
  coursingSortField,
  coursingSortDirection,
  onSpeedSort,
  onCoursingSort,
  resetScrollKey,
}: DoninoRecordsColumnsProps) {
  const listLength = Math.max(speedRecords.length, coursingRecords.length)
  const { visibleCount, loadMoreRef, hasMore } = useInfiniteScroll(listLength, [resetScrollKey])

  const visibleSpeed = speedRecords.slice(0, visibleCount)
  const visibleCoursing = coursingRecords.slice(0, visibleCount)

  const emptyBoth = speedRecords.length === 0 && coursingRecords.length === 0

  if (emptyBoth) {
    return <div className="py-12 text-center text-old-money-600 dark:text-old-money-400">Нет данных</div>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
        <section className="min-w-0">
          {speedRecords.length > 0 && (
            <div className="mb-3">
              <RecordSortBar
                options={SPEED_SORT_OPTIONS}
                sortField={speedSortField}
                sortDirection={speedSortDirection}
                onSort={onSpeedSort}
              />
            </div>
          )}
          <DoninoColumnPlaque title="Замер" count={speedRecords.length} />
          <div className="flex flex-col gap-2.5">
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
                />
              ))
            ) : (
              <p className="donino-home-empty">Нет данных</p>
            )}
          </div>
        </section>

        <section className="min-w-0">
          {coursingRecords.length > 0 && (
            <div className="mb-3">
              <RecordSortBar
                options={COURSING_SORT_OPTIONS}
                sortField={coursingSortField}
                sortDirection={coursingSortDirection}
                onSort={onCoursingSort}
              />
            </div>
          )}
          <DoninoColumnPlaque title="Бега 350 м" count={coursingRecords.length} />
          <div className="flex flex-col gap-2.5">
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
                />
              ))
            ) : (
              <p className="donino-home-empty">Нет данных</p>
            )}
          </div>
        </section>
      </div>

      {hasMore && (
        <div
          ref={loadMoreRef}
          className="py-4 text-center text-sm text-charcoal-500 dark:text-charcoal-400"
        >
          Загрузка…
        </div>
      )}
    </div>
  )
}
