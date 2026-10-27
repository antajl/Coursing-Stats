import { memo, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SeasonCompetitionsCarousel from './SeasonCompetitionsCarousel'
import SeasonRacingCarousel from './SeasonRacingCarousel'
import SeasonShowsCarousel from './SeasonShowsCarousel'
import SeasonDoninoSpeedCarousel from './SeasonDoninoSpeedCarousel'
import SeasonDoninoCoursingCarousel from './SeasonDoninoCoursingCarousel'
import { SeasonTopSectionSkeleton } from './SeasonTopSectionSkeleton'
import DoninoHomeRecordRow from '../../../components/DoninoHomeRecordRow'
import HomeSeasonTopRow from '../../../components/HomeSeasonTopRow'
import { showHomeMetric } from '../utils/formatters'
import { parseDogName } from '../../../lib/dogName'
import { showDogProfilePath } from '../../../lib/showDogProfilePath'
import { carouselSlideIndex, useHomeBreedCarousel } from '../hooks/useHomeBreedCarousel'
import { SegmentedTabs } from '../../../components/ui/SegmentedTabs'
import type { BreedSlide } from '../utils/breedSeasonSlides'
import type { CombinedRankingDog } from '../../TopDogs/mergeCombinedRanking'
import type { ShowHomeTopDog } from '../../../lib/staticData'
import type { SpeedRecord, CoursingRecord } from '../types'

const CURRENT_SEASON = new Date().getFullYear()

export type HubCategoryTab = 'sport' | 'shows' | 'donino'
export type SportSubTab = 'coursing' | 'racing'
export type ShowsSubTab = 'by-breed' | 'all-breeds'
export type DoninoSubTab = 'speed' | 'coursing'

interface SeasonTopSectionProps {
  competitionSlides: BreedSlide<CombinedRankingDog>[]
  racingSlides: BreedSlide<any>[]
  showSlides: BreedSlide<ShowHomeTopDog>[]
  topShowDogs: ShowHomeTopDog[]
  doninoSpeedRecords: SpeedRecord[]
  doninoCoursingRecords: CoursingRecord[]
  doninoSpeedSlides?: BreedSlide<SpeedRecord>[]
  doninoCoursingSlides?: BreedSlide<CoursingRecord>[]
  loading: boolean
  compact?: boolean
  singleColumn?: boolean
}

function SeasonTopSectionInner({
  competitionSlides,
  racingSlides,
  showSlides,
  topShowDogs,
  doninoSpeedRecords,
  doninoCoursingRecords,
  doninoSpeedSlides,
  doninoCoursingSlides,
  loading,
  compact = false,
  singleColumn = false,
}: SeasonTopSectionProps) {
  const [activeTab, setActiveTab] = useState<HubCategoryTab>('sport')
  const [activeSportSubTab, setActiveSportSubTab] = useState<SportSubTab>('coursing')
  const [activeShowsSubTab, setActiveShowsSubTab] = useState<ShowsSubTab>('by-breed')
  const [activeDoninoSubTab, setActiveDoninoSubTab] = useState<DoninoSubTab>('speed')

  const speedSlideCount = doninoSpeedSlides?.length || 0
  const coursingSlideCount = doninoCoursingSlides?.length || 0
  const syncCount = Math.max(
    competitionSlides.length,
    racingSlides.length,
    showSlides.length,
    speedSlideCount,
    coursingSlideCount,
    0,
  )
  const carousel = useHomeBreedCarousel(syncCount)

  const syncDots = useMemo(
    () =>
      Array.from({ length: syncCount }, (_, i) => {
        const comp = competitionSlides[i]
        const rac = racingSlides[i]
        const show = showSlides[i]
        const donSp = doninoSpeedSlides?.[i]
        const donCo = doninoCoursingSlides?.[i]
        const label =
          [comp?.breedLabel, rac?.breedLabel, show?.breedLabel, donSp?.breedLabel, donCo?.breedLabel].filter(Boolean)[0] || `Слайд ${i + 1}`
        return {
          key: `sync-${i}-${comp?.breedKey ?? donSp?.breedKey ?? ''}`,
          label,
        }
      }),
    [syncCount, competitionSlides, racingSlides, showSlides, doninoSpeedSlides, doninoCoursingSlides],
  )

  const currentCompSlide =
    competitionSlides[carouselSlideIndex(carousel.contentIndex, competitionSlides.length)]
  const currentRacingSlide =
    racingSlides[carouselSlideIndex(carousel.contentIndex, racingSlides.length)]
  const currentShowSlide =
    showSlides[carouselSlideIndex(carousel.contentIndex, showSlides.length)]
  const currentDoninoSpeedSlide =
    doninoSpeedSlides && doninoSpeedSlides.length > 0
      ? doninoSpeedSlides[carouselSlideIndex(carousel.contentIndex, doninoSpeedSlides.length)]
      : undefined
  const currentDoninoCoursingSlide =
    doninoCoursingSlides && doninoCoursingSlides.length > 0
      ? doninoCoursingSlides[carouselSlideIndex(carousel.contentIndex, doninoCoursingSlides.length)]
      : undefined

  // Main 3 Domain Tabs
  const mainTabs = useMemo(
    () => [
      { id: 'sport' as const, label: 'Соревнования' },
      { id: 'shows' as const, label: 'Выставки' },
      {
        id: 'donino' as const,
        label: (
          <>
            <span className="md:hidden">Донино</span>
            <span className="hidden md:inline">Рекорды Донино</span>
          </>
        ),
      },
    ],
    [],
  )

  // Sport Subtabs for Mobile (< md)
  const sportSubTabs = useMemo(
    () => [
      { id: 'coursing' as const, label: 'Курсинг', count: currentCompSlide?.dogCount },
      { id: 'racing' as const, label: 'Рейсинг', count: currentRacingSlide?.dogCount },
    ],
    [currentCompSlide?.dogCount, currentRacingSlide?.dogCount],
  )

  // Shows Subtabs for Mobile (< md)
  const showsSubTabs = useMemo(
    () => [
      { id: 'by-breed' as const, label: 'По породам', count: currentShowSlide?.dogCount },
      { id: 'all-breeds' as const, label: 'Все породы', count: topShowDogs.length },
    ],
    [currentShowSlide?.dogCount, topShowDogs.length],
  )

  // Donino Subtabs for Mobile (< md)
  const doninoSubTabs = useMemo(
    () => [
      { id: 'speed' as const, label: 'Замер скорости', count: currentDoninoSpeedSlide?.dogCount },
      { id: 'coursing' as const, label: 'Бега 350 м', count: currentDoninoCoursingSlide?.dogCount },
    ],
    [currentDoninoSpeedSlide?.dogCount, currentDoninoCoursingSlide?.dogCount],
  )

  if (loading) return <SeasonTopSectionSkeleton />

  return (
    <section
      id="season-top"
      className={`home-v2-block scroll-mt-20 ${
        compact ? 'home-v2-season-top--compact' : ''
      }`}
      {...(!compact ? { 'data-home-reveal': true } : {})}
    >
      {/* Main 3 Category Tabs */}
      <SegmentedTabs
        tabs={mainTabs}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as HubCategoryTab)}
        breakpoint="all"
        size={compact ? 'sm' : 'md'}
        className={compact ? 'mb-2.5' : 'mb-4'}
        ariaLabel="Разделы рейтингов и достижений"
      />

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: SPORT (COURSING & RACING)
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'sport' && (
        <div>
          {/* Subtabs (< md or if singleColumn) */}
          <SegmentedTabs
            tabs={sportSubTabs}
            activeTab={activeSportSubTab}
            onChange={(tab) => setActiveSportSubTab(tab as SportSubTab)}
            breakpoint={singleColumn ? 'all' : 'md'}
            size={compact ? 'sm' : 'md'}
            className={compact ? 'mb-1.5' : 'mb-3.5'}
            ariaLabel="Виды спортивных состязаний"
          />

          <div
            className={singleColumn ? 'flex flex-col' : 'home-v2-columns'}
            {...carousel.pauseHandlers}
          >
            {/* Column 1: Coursing */}
            {(!singleColumn || activeSportSubTab === 'coursing') && (
              <div
                className={`home-v2-col ${
                  !singleColumn && activeSportSubTab === 'racing' ? '!hidden md:!flex' : ''
                }`}
              >
                <SeasonCompetitionsCarousel
                  slides={competitionSlides}
                  carousel={carousel}
                  syncDots={syncDots}
                  driveAutoplay
                />
              </div>
            )}

            {/* Column 2: Racing */}
            {(!singleColumn || activeSportSubTab === 'racing') && (
              <div
                className={`home-v2-col ${
                  !singleColumn && activeSportSubTab === 'coursing' ? '!hidden md:!flex' : ''
                }`}
              >
                <SeasonRacingCarousel
                  slides={racingSlides}
                  carousel={carousel}
                  syncDots={syncDots}
                  driveAutoplay={false}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: SHOWS (BREED CAROUSEL + ALL-BREEDS ABSOLUTE LEADERS)
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'shows' && (
        <div>
          {/* Subtabs (< md or if singleColumn) */}
          <SegmentedTabs
            tabs={showsSubTabs}
            activeTab={activeShowsSubTab}
            onChange={(tab) => setActiveShowsSubTab(tab as ShowsSubTab)}
            breakpoint={singleColumn ? 'all' : 'md'}
            size={compact ? 'sm' : 'md'}
            className={compact ? 'mb-1.5' : 'mb-3.5'}
            ariaLabel="Режим выставочного рейтинга"
          />

          <div
            className={singleColumn ? 'flex flex-col' : 'home-v2-columns'}
            {...carousel.pauseHandlers}
          >
            {/* Left Column: Breed Carousel */}
            {(!singleColumn || activeShowsSubTab === 'by-breed') && (
              <div
                className={`home-v2-col ${
                  !singleColumn && activeShowsSubTab === 'all-breeds' ? '!hidden md:!flex' : ''
                }`}
              >
                <SeasonShowsCarousel
                  slides={showSlides}
                  carousel={carousel}
                  syncDots={syncDots}
                  driveAutoplay
                />
              </div>
            )}

            {/* Right Column: Absolute Top Season Dogs across all breeds */}
            {(!singleColumn || activeShowsSubTab === 'all-breeds') && (
              <div
                className={`home-v2-col ${
                  !singleColumn && activeShowsSubTab === 'by-breed' ? '!hidden md:!flex' : ''
                }`}
              >
                <div className="home-v2-col-head home-v2-col-head--tabs">
                  <span>Абсолютные лидеры сезона</span>
                  <span className="text-[11px] font-normal text-old-money-600">
                    Все породы · {CURRENT_SEASON}
                  </span>
                </div>
                <div className="donino-home-list" role="list">
                  {topShowDogs.slice(0, 3).map((dog, i) => {
                    const { primary } = parseDogName(dog.name_lat, dog.name_ru)
                    return (
                      <div key={`shows-abs-${dog.id}`} className="relative group" role="listitem">
                        <HomeSeasonTopRow
                          to={showDogProfilePath(dog)}
                          name={primary}
                          breed={dog.breed}
                          sex={dog.sex}
                          dogId={dog.competition_dog_id}
                          metric={showHomeMetric(dog)}
                          showTitles={showHomeMetric(dog)}
                          rank={dog.rank ?? i + 1}
                          totalStarts={dog.total_shows}
                          bestAward={dog.best_award}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: DONINO (SPEED RADAR & 350M RUN CAROUSELS)
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'donino' && (
        <div>
          {/* Subtabs (< md or if singleColumn) */}
          <SegmentedTabs
            tabs={doninoSubTabs}
            activeTab={activeDoninoSubTab}
            onChange={(tab) => setActiveDoninoSubTab(tab as DoninoSubTab)}
            breakpoint={singleColumn ? 'all' : 'md'}
            size={compact ? 'sm' : 'md'}
            className={compact ? 'mb-1.5' : 'mb-3.5'}
            ariaLabel="Виды замеров Донино"
          />

          <div
            className={singleColumn ? 'flex flex-col' : 'home-v2-columns'}
            {...carousel.pauseHandlers}
          >
            {/* Column 1: Speed Radar Carousel */}
            {(!singleColumn || activeDoninoSubTab === 'speed') && (
              <div
                className={`home-v2-col ${
                  !singleColumn && activeDoninoSubTab === 'coursing' ? '!hidden md:!flex' : ''
                }`}
              >
                {doninoSpeedSlides && doninoSpeedSlides.length > 0 ? (
                  <SeasonDoninoSpeedCarousel
                    slides={doninoSpeedSlides}
                    carousel={carousel}
                    syncDots={syncDots}
                    driveAutoplay
                  />
                ) : (
                  <>
                    <div className="home-v2-col-head">Замер скорости (радар)</div>
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
            )}

            {/* Column 2: 350m Track Carousel */}
            {(!singleColumn || activeDoninoSubTab === 'coursing') && (
              <div
                className={`home-v2-col ${
                  !singleColumn && activeDoninoSubTab === 'speed' ? '!hidden md:!flex' : ''
                }`}
              >
                {doninoCoursingSlides && doninoCoursingSlides.length > 0 ? (
                  <SeasonDoninoCoursingCarousel
                    slides={doninoCoursingSlides}
                    carousel={carousel}
                    syncDots={syncDots}
                    driveAutoplay={false}
                  />
                ) : (
                  <>
                    <div className="home-v2-col-head">Бега 350 м (спринт)</div>
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
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export const SeasonTopSection = memo(SeasonTopSectionInner)
