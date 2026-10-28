import { memo, useMemo, useState, useRef } from 'react'
import { ArrowLeftRight } from 'lucide-react'
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

function HomeSubSectionSwitcher({
  currentLabel,
  currentCount,
  onToggle,
  isFirst,
  compact = false,
  singleColumn = false,
}: {
  currentLabel: string
  currentCount?: number
  onToggle: () => void
  isFirst: boolean
  compact?: boolean
  singleColumn?: boolean
}) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const isHorizontalRef = useRef<boolean | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    isHorizontalRef.current = null
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const dx = e.touches[0].clientX - touchStartRef.current.x
    const dy = e.touches[0].clientY - touchStartRef.current.y
    if (isHorizontalRef.current === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      if (Math.abs(dy) >= Math.abs(dx)) {
        isHorizontalRef.current = false
        return
      }
      isHorizontalRef.current = true
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !isHorizontalRef.current) {
      touchStartRef.current = null
      isHorizontalRef.current = null
      return
    }
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x
    touchStartRef.current = null
    isHorizontalRef.current = null

    // Свайп влево переключает на второй подраздел, свайп вправо — на первый
    if ((dx < -40 && isFirst) || (dx > 40 && !isFirst)) {
      onToggle()
    }
  }

  return (
    <div
      className={`flex items-center justify-between w-full select-none touch-pan-y ${
        singleColumn ? '' : 'md:hidden'
      } ${compact ? 'mb-1.5' : 'mb-2.5'}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button
        type="button"
        onClick={onToggle}
        className="relative inline-flex h-8 items-center gap-2 rounded-full border border-old-money-300/80 bg-cream-50/90 px-3 hover:border-camel-500 hover:bg-cream-100 hover:text-charcoal-900 active:scale-95 transition-all shadow-2xs touch-manipulation cursor-pointer before:absolute before:-inset-1.5 before:content-['']"
        title="Переключить подраздел (или смахните экран влево/вправо)"
        aria-label="Переключить подраздел"
      >
        <ArrowLeftRight className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
        <span className="font-serif text-xs font-bold text-charcoal-900 tracking-tight whitespace-nowrap">
          {currentLabel}
        </span>
        {currentCount !== undefined && currentCount > 0 && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-camel-100/90 text-camel-800 border border-camel-200/60 leading-none">
            {currentCount}
          </span>
        )}
        <div className="flex items-center gap-0.5 shrink-0 ml-1" aria-hidden>
          <span
            className={`h-1.5 rounded-full transition-all duration-300 ${
              isFirst ? 'w-2.5 bg-camel-600' : 'w-1 bg-old-money-300'
            }`}
          />
          <span
            className={`h-1.5 rounded-full transition-all duration-300 ${
              !isFirst ? 'w-2.5 bg-camel-600' : 'w-1 bg-old-money-300'
            }`}
          />
        </div>
      </button>
    </div>
  )
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

  if (loading) return <SeasonTopSectionSkeleton />

  return (
    <section
      id="season-top"
      className={`home-v2-block scroll-mt-20 ${
        compact ? 'home-v2-season-top--compact' : ''
      }`}
      {...(!compact ? { 'data-home-reveal': true } : {})}
    >
      {/* Главные 3 вкладки: Соревнования, Выставки, Донино */}
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
          ТАБ 1: СОРЕВНОВАНИЯ (КУРСИНГ И РЕЙСИНГ)
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'sport' && (
        <div>
          {/* Подзаголовок и функциональный переключатель дисциплин */}
          <HomeSubSectionSwitcher
            currentLabel={activeSportSubTab === 'coursing' ? 'Курсинг' : 'Рейсинг'}
            currentCount={
              activeSportSubTab === 'coursing'
                ? currentCompSlide?.dogCount
                : currentRacingSlide?.dogCount
            }
            isFirst={activeSportSubTab === 'coursing'}
            onToggle={() =>
              setActiveSportSubTab((prev) => (prev === 'coursing' ? 'racing' : 'coursing'))
            }
            compact={compact}
            singleColumn={singleColumn}
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
          ТАБ 2: ВЫСТАВКИ (ПО ПОРОДАМ И АБСОЛЮТНЫЕ ЛИДЕРЫ)
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'shows' && (
        <div>
          {/* Подзаголовок и функциональный переключатель выставочных разделов */}
          <HomeSubSectionSwitcher
            currentLabel={activeShowsSubTab === 'by-breed' ? 'По породам' : 'Все породы'}
            currentCount={
              activeShowsSubTab === 'by-breed'
                ? currentShowSlide?.dogCount
                : topShowDogs.length
            }
            isFirst={activeShowsSubTab === 'by-breed'}
            onToggle={() =>
              setActiveShowsSubTab((prev) => (prev === 'by-breed' ? 'all-breeds' : 'by-breed'))
            }
            compact={compact}
            singleColumn={singleColumn}
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
          ТАБ 3: ДОНИНО (ЗАМЕР СКОРОСТИ И БЕГА 350 М)
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'donino' && (
        <div>
          {/* Подзаголовок и функциональный переключатель замеров Донино */}
          <HomeSubSectionSwitcher
            currentLabel={activeDoninoSubTab === 'speed' ? 'Замер скорости' : 'Бега 350 м'}
            currentCount={
              activeDoninoSubTab === 'speed'
                ? currentDoninoSpeedSlide?.dogCount
                : currentDoninoCoursingSlide?.dogCount
            }
            isFirst={activeDoninoSubTab === 'speed'}
            onToggle={() =>
              setActiveDoninoSubTab((prev) => (prev === 'speed' ? 'coursing' : 'speed'))
            }
            compact={compact}
            singleColumn={singleColumn}
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
