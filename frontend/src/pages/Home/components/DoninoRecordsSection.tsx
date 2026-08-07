import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Icons } from '../../../lib/icons'
import DoninoHomeRecordRow from '../../../components/DoninoHomeRecordRow'
import { SectionHead } from './SectionHead'
import { DoninoRecordsSectionSkeleton } from './DoninoRecordsSectionSkeleton'
import { rankCoursingRecords } from '../utils/formatters'
import type { SpeedRecord, CoursingRecord } from '../types'

interface DoninoRecordsSectionProps {
  doninoSpeedRecords: SpeedRecord[]
  doninoCoursingRecords: CoursingRecord[]
  loading: boolean
}

function DoninoRecordsSectionInner({
  doninoSpeedRecords,
  doninoCoursingRecords,
  loading,
}: DoninoRecordsSectionProps) {
  const doninoCoursingRanked = rankCoursingRecords(doninoCoursingRecords)
  const showDoninoSection = loading || doninoSpeedRecords.length > 0 || doninoCoursingRecords.length > 0

  if (loading) return <DoninoRecordsSectionSkeleton />
  if (!showDoninoSection) return null

  return (
    <section className="home-v2-block" data-home-reveal>
      <SectionHead
        icon={Icons.speed}
        title="Рекорды Донино"
        href="/speed-records"
        linkLabel="Все рекорды"
      />
      {doninoSpeedRecords.length > 0 || doninoCoursingRanked.length > 0 ? (
        <div className="home-v2-columns">
          <div className="home-v2-col">
            <div className="home-v2-col-head">Замер</div>
            <div className="donino-home-list" role="list" aria-label="Рекорды скорости на замере">
              {doninoSpeedRecords.length > 0 ? (
                doninoSpeedRecords.map((record) => (
                  <DoninoHomeRecordRow
                    key={`speed-${record.breed}-${record.name}`}
                    mode="speed"
                    name={record.name}
                    breed={record.breed}
                    sex={record.sex}
                    date={record.date}
                    status={record.status}
                    history={record.history}
                    speedKmh={record.speed_km_h}
                    trackType={record.track_type}
                  />
                ))
              ) : (
                <p className="donino-home-empty" role="status">Нет данных</p>
              )}
            </div>
          </div>
          <div className="home-v2-col">
            <div className="home-v2-col-head">Бега 350 м</div>
            <div className="donino-home-list" role="list" aria-label="Рекорды времени на бегах 350 м">
              {doninoCoursingRanked.length > 0 ? (
                doninoCoursingRanked.map((record) => (
                  <DoninoHomeRecordRow
                    key={`coursing-${record.breed}-${record.name}`}
                    mode="coursing"
                    name={record.name}
                    breed={record.breed}
                    sex={record.sex}
                    date={record.date}
                    status={record.status}
                    history={record.history}
                    timeSeconds={record.time_seconds}
                    trackType={record.track_type}
                  />
                ))
              ) : (
                <p className="donino-home-empty" role="status">Нет данных</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="home-v2-empty" aria-live="polite">
          Пока нет данных.{' '}
          <Link to="/speed-records">Открыть рекорды</Link>
        </p>
      )}
    </section>
  )
}

export const DoninoRecordsSection = memo(DoninoRecordsSectionInner)
