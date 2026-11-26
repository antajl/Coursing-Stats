import { useState, useMemo, useEffect, useCallback } from 'react'
import DoninoListRecordRow from './DoninoListRecordRow'
import DoninoColumnPlaque, { DoninoColumnShell } from './DoninoColumnPlaque'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { useHorizontalSwipe } from '../../hooks/useHorizontalSwipe'
import { ColumnSwipeEdgeTab } from '../../components/ui/ColumnSwipeEdgeTab'

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
  delta?: number | 'NEW' | null
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
  delta?: number | 'NEW' | null
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
  sortField: _sortField,
  sortDirection: _sortDirection,
  onSort: _onSort,
  resetScrollKey,
}: DoninoRecordsColumnsProps) {
  const [mobileTab, setMobileTab] = useState<'speed' | 'coursing'>('speed')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash.replace(/^#/, '')
    if (hash === 'racing' || hash === 'racing350' || hash === 'coursing') {
      setMobileTab('coursing')
    } else if (hash === 'speed' || hash === 'speeds') {
      setMobileTab('speed')
    }
  }, [])

  const activeSlideIndex = mobileTab === 'speed' ? 0 : 1

  const {
    trackRef,
    isNudging,
    markInteracted,
    getSlideOffset,
    startDrag,
    moveDrag,
    endDrag,
    cancelDrag,
    handleClickCapture,
  } = useHorizontalSwipe({
    activeTabsCount: 2,
    activeTabIndex: activeSlideIndex,
    gapPx: 16,
    enableNudge: true,
    onTabChange: (targetIndex) => {
      setMobileTab(targetIndex === 0 ? 'speed' : 'coursing')
    },
  })

  const handleTabChange = useCallback(
    (targetTab: 'speed' | 'coursing') => {
      markInteracted()
      setMobileTab(targetTab)
    },
    [markInteracted],
  )

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
    <div className="relative">
      <DoninoColumnPlaque
        asHeader
        title="Замер скорости"
        count={speedRecords.length}
        countClassName="pr-24 lg:pr-0"
      />
      <ColumnSwipeEdgeTab
        direction="right"
        label="Бега 350 м"
        isNudging={isNudging && activeSlideIndex === 0}
        onClick={() => handleTabChange('coursing')}
        title="Смахните экран или нажмите для перехода к бегам 350 м"
      />
    </div>
  )

  const coursingPlaque = (
    <div className="relative">
      <DoninoColumnPlaque
        asHeader
        title="Бега 350 м"
        count={coursingRecords.length}
        titleClassName="pl-20 lg:pl-0"
      />
      <ColumnSwipeEdgeTab
        direction="left"
        label="Замер"
        isNudging={isNudging && activeSlideIndex === 1}
        onClick={() => handleTabChange('speed')}
        title="Смахните экран или нажмите для перехода к замерам"
      />
    </div>
  )

  return (
    <div className="space-y-2.5 sm:space-y-4">
      {/* Мобильный свайп-контейнер (зазор 16px) и десктопная 2-колоночная сетка (>= 1024px) */}
      <div
        className="w-full relative overflow-x-clip lg:overflow-visible touch-pan-y select-none"
        onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={(e) => endDrag(e.changedTouches[0].clientX)}
        onTouchCancel={cancelDrag}
        onMouseDown={(e) => {
          if (e.button === 0) startDrag(e.clientX, e.clientY)
        }}
        onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
        onMouseUp={(e) => endDrag(e.clientX)}
        onMouseLeave={cancelDrag}
        onClickCapture={handleClickCapture}
      >
        <div
          ref={trackRef}
          className="flex flex-nowrap w-full min-w-0 items-start gap-4 lg:grid lg:grid-cols-2 lg:gap-8 lg:!transform-none"
          style={{
            transform:
              typeof window !== 'undefined' && window.innerWidth >= 1024
                ? 'none'
                : `translate3d(${getSlideOffset(activeSlideIndex)}, 0, 0)`,
            willChange: 'transform',
          }}
        >
          {/* Слайд 1: Замер скорости */}
          <div id="speeds" className="scroll-mt-20 w-full max-w-full min-w-0 shrink-0 basis-full lg:w-auto lg:min-w-0 lg:shrink lg:basis-auto">
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
                    delta={record.delta}
                    latestDateInDataset={latestSpeedDate}
                  />
                ))
              ) : (
                <p className="donino-home-empty">Нет данных</p>
              )}
            </DoninoColumnShell>
          </div>

          {/* Слайд 2: Бега 350 м */}
          <div id="racing350" className="scroll-mt-20 w-full max-w-full min-w-0 shrink-0 basis-full lg:w-auto lg:min-w-0 lg:shrink lg:basis-auto">
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
                    delta={record.delta}
                    latestDateInDataset={latestCoursingDate}
                  />
                ))
              ) : (
                <p className="donino-home-empty">Нет данных</p>
              )}
            </DoninoColumnShell>
          </div>
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
