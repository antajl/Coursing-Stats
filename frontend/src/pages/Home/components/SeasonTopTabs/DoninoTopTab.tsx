import { memo } from 'react'
import SeasonDoninoSpeedCarousel from '../SeasonDoninoSpeedCarousel'
import SeasonDoninoCoursingCarousel from '../SeasonDoninoCoursingCarousel'
import { HomeSubSectionTab } from './HomeSubSectionTab'
import DoninoHomeRecordRow from '../../../../components/DoninoHomeRecordRow'
import { useSubTabSwipe } from './useSubTabSwipe'
import type { BreedSlide } from '../../utils/breedSeasonSlides'
import type { SpeedRecord, CoursingRecord } from '../../types'
import type { useHomeBreedCarousel } from '../../hooks/useHomeBreedCarousel'

export type DoninoSubTab = 'speed' | 'coursing'

interface DoninoTopTabProps {
  doninoSpeedRecords: SpeedRecord[]
  doninoCoursingRecords: CoursingRecord[]
  doninoSpeedSlides?: BreedSlide<SpeedRecord>[]
  doninoCoursingSlides?: BreedSlide<CoursingRecord>[]
  carousel: ReturnType<typeof useHomeBreedCarousel>
  syncDots: { key: string; label: string }[]
}

export const DoninoTopTab = memo(function DoninoTopTab({
  doninoSpeedRecords,
  doninoCoursingRecords,
  doninoSpeedSlides,
  doninoCoursingSlides,
  carousel,
  syncDots,
}: DoninoTopTabProps) {
  const { activeSubTab, trackRef, isNudging, handleToggle, touchHandlers, trackStyle } =
    useSubTabSwipe<DoninoSubTab>({
      subTabs: ['speed', 'coursing'],
    })

  return (
    <div
      className="w-full min-w-0 max-w-full overflow-x-hidden md:overflow-visible touch-pan-y pb-2 -mb-2"
      style={{ width: '100%', maxWidth: '100%' }}
      {...touchHandlers}
      {...carousel.pauseHandlers}
    >
      <div
        ref={trackRef}
        className={`flex flex-nowrap w-full min-w-0 items-start gap-0 md:grid md:grid-cols-2 md:gap-6 md:!transform-none ${
          isNudging
            ? activeSubTab === 'speed'
              ? 'animate-silk-nudge-left'
              : 'animate-silk-nudge-right'
            : ''
        }`}
        style={trackStyle}
      >
        {/* Column 1: Speed Radar Carousel */}
        <div className="w-full max-w-full min-w-0 shrink-0 basis-full md:w-auto md:min-w-0 md:shrink md:basis-auto">
          <div className="home-v2-col w-full min-w-0 max-w-full">
            {doninoSpeedSlides && doninoSpeedSlides.length > 0 ? (
              <SeasonDoninoSpeedCarousel
                slides={doninoSpeedSlides}
                carousel={carousel}
                syncDots={syncDots}
                driveAutoplay
                isNudging={isNudging && activeSubTab === 'speed'}
                onToggleSubTab={() => handleToggle('coursing')}
              />
            ) : (
              <>
                <div className="home-v2-col-head home-v2-col-head--tabs !flex-nowrap gap-1.5 sm:gap-2 relative">
                  <span className="truncate text-center w-full px-14 sm:px-16 md:px-0">
                    Замер скорости (радар)
                  </span>
                  <HomeSubSectionTab
                    targetLabel="Бега 350 м"
                    direction="right"
                    isNudging={isNudging && activeSubTab === 'speed'}
                    onToggle={() => handleToggle('coursing')}
                  />
                </div>
                <div className="donino-home-list" role="list">
                  {doninoSpeedRecords.slice(0, 5).map((record) => (
                    <div key={`donino-speed-${record.breed}-${record.name}`} role="listitem">
                      <DoninoHomeRecordRow
                        mode="speed"
                        name={record.name}
                        breed={record.breed}
                        sex={record.sex}
                        date={record.date}
                        status={record.status}
                        history={record.history}
                        speedKmh={record.speed_km_h}
                        trackType={record.track_type}
                        latestDateInDataset={null}
                        rank={record.rank}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Column 2: 350m Track Carousel */}
        <div className="w-full max-w-full min-w-0 shrink-0 basis-full md:w-auto md:min-w-0 md:shrink md:basis-auto">
          <div className="home-v2-col w-full min-w-0 max-w-full">
            {doninoCoursingSlides && doninoCoursingSlides.length > 0 ? (
              <SeasonDoninoCoursingCarousel
                slides={doninoCoursingSlides}
                carousel={carousel}
                syncDots={syncDots}
                driveAutoplay={false}
                isNudging={isNudging && activeSubTab === 'coursing'}
                onToggleSubTab={() => handleToggle('speed')}
              />
            ) : (
              <>
                <div className="home-v2-col-head home-v2-col-head--tabs !flex-nowrap gap-1.5 sm:gap-2 relative">
                  <span className="truncate text-center w-full px-14 sm:px-16 md:px-0">
                    Бега 350 м (спринт)
                  </span>
                  <HomeSubSectionTab
                    targetLabel="Замер"
                    direction="left"
                    isNudging={isNudging && activeSubTab === 'coursing'}
                    onToggle={() => handleToggle('speed')}
                  />
                </div>
                <div className="donino-home-list" role="list">
                  {doninoCoursingRecords.slice(0, 5).map((record) => (
                    <div key={`donino-run-${record.breed}-${record.name}`} role="listitem">
                      <DoninoHomeRecordRow
                        mode="coursing"
                        name={record.name}
                        breed={record.breed}
                        sex={record.sex}
                        date={record.date}
                        status={record.status}
                        history={record.history}
                        timeSeconds={record.time_seconds}
                        trackLength={record.track_length}
                        latestDateInDataset={null}
                        rank={record.rank}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
