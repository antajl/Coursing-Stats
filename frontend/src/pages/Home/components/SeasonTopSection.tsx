import { memo, useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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

export interface HomeSubSectionTabProps {
  targetLabel: string
  direction?: 'left' | 'right'
  isNudging?: boolean
  onToggle: () => void
}

export function HomeSubSectionTab({
  targetLabel,
  direction = 'right',
  isNudging = false,
  onToggle,
}: HomeSubSectionTabProps) {
  const alignClass =
    direction === 'left'
      ? 'left-0 rounded-r-full border-y border-r border-camel-400/90 pr-3 pl-2'
      : 'right-0 rounded-l-full border-y border-l border-camel-400/90 pl-3 pr-2'

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`md:hidden absolute top-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-1 bg-camel-100/80 py-1 text-[11px] font-bold text-camel-950 shadow-md backdrop-blur-md transition-all hover:bg-camel-200 active:scale-95 cursor-pointer touch-manipulation ${alignClass} ${
        isNudging
          ? direction === 'right'
            ? 'animate-silk-nudge-left'
            : 'animate-silk-nudge-right'
          : ''
      }`}
      title={`Перейти к: ${targetLabel}`}
      aria-label={`Перейти к: ${targetLabel}`}
    >
      {direction === 'left' && (
        <ChevronLeft className="w-3.5 h-3.5 text-camel-800 shrink-0" />
      )}
      <span>{targetLabel}</span>
      {direction === 'right' && (
        <ChevronRight className="w-3.5 h-3.5 text-camel-800 shrink-0" />
      )}
    </button>
  )
}

/** Compatibility alias */
export const HomeSubSectionCapsule = HomeSubSectionTab

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

  const [dragOffset, setDragOffset] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isNudging, setIsNudging] = useState(false)
  const hadMovedRef = useRef(false)
  const transitionTimeoutRef = useRef<number | null>(null)

  const triggerNudge = useCallback(() => {
    if (dragOffset !== null && dragOffset !== 0) return
    setIsNudging(true)
    setTimeout(() => {
      setIsNudging(false)
    }, 750)
  }, [dragOffset])

  useEffect(() => {
    const timer = setTimeout(() => {
      triggerNudge()
    }, 600)
    return () => clearTimeout(timer)
  }, [activeTab, triggerNudge])

  const getCurrentSlide = useCallback(() => {
    if (activeTab === 'sport') return activeSportSubTab === 'coursing' ? 0 : 1
    if (activeTab === 'shows') return activeShowsSubTab === 'by-breed' ? 0 : 1
    return activeDoninoSubTab === 'speed' ? 0 : 1
  }, [activeTab, activeSportSubTab, activeShowsSubTab, activeDoninoSubTab])

  const setNextSlide = useCallback(
    (nextIdx: 0 | 1) => {
      if (activeTab === 'sport') {
        setActiveSportSubTab(nextIdx === 0 ? 'coursing' : 'racing')
      } else if (activeTab === 'shows') {
        setActiveShowsSubTab(nextIdx === 0 ? 'by-breed' : 'all-breeds')
      } else {
        setActiveDoninoSubTab(nextIdx === 0 ? 'speed' : 'coursing')
      }
    },
    [activeTab],
  )

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const gestureLockRef = useRef<'horizontal' | 'vertical' | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) return
    setIsNudging(false)
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
    gestureLockRef.current = null
    hadMovedRef.current = false
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
      transitionTimeoutRef.current = null
    }
    setIsTransitioning(false)
    setDragOffset(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || (typeof window !== 'undefined' && window.innerWidth >= 768)) return
    const touch = e.touches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y

    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
      hadMovedRef.current = true
    }

    if (!gestureLockRef.current) {
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      if (absDx < 8 && absDy < 8) return
      if (absDy >= absDx) {
        gestureLockRef.current = 'vertical'
        return
      }
      gestureLockRef.current = 'horizontal'
    }

    if (gestureLockRef.current === 'horizontal') {
      const currentSlide = getCurrentSlide()
      const isAtLeftEdge = currentSlide === 0 && dx > 0
      const isAtRightEdge = currentSlide === 1 && dx < 0
      const appliedDx = isAtLeftEdge || isAtRightEdge ? dx * 0.22 : dx
      setDragOffset(appliedDx)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dt = Date.now() - touchStartRef.current.time
    const velocity = Math.abs(dx) / (dt || 1)
    const isHorizontal = gestureLockRef.current === 'horizontal'
    touchStartRef.current = null
    gestureLockRef.current = null

    if (isHorizontal) {
      const isSwipeLeft = dx < -35 || (dx < -15 && velocity > 0.2)
      const isSwipeRight = dx > 35 || (dx > 15 && velocity > 0.2)
      const currentSlide = getCurrentSlide()

      setIsTransitioning(true)
      setDragOffset(null)

      if (isSwipeLeft && currentSlide === 0) {
        setNextSlide(1)
        triggerNudge()
      } else if (isSwipeRight && currentSlide === 1) {
        setNextSlide(0)
        triggerNudge()
      }

      transitionTimeoutRef.current = window.setTimeout(() => {
        setIsTransitioning(false)
        transitionTimeoutRef.current = null
      }, 380)
    } else {
      setDragOffset(null)
    }
  }

  const handleTouchCancel = () => {
    touchStartRef.current = null
    gestureLockRef.current = null
    setDragOffset(null)
    setIsTransitioning(false)
  }

  const currentSlide = getCurrentSlide()
  const isDragging = dragOffset !== null && dragOffset !== 0
  const isAnimating = isDragging || isTransitioning
  const mobileTransform = `translateX(calc(${currentSlide === 0 ? '0%' : '-100%'} + ${dragOffset ?? 0}px))`

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

  if (loading) return <SeasonTopSectionSkeleton compact={compact} />

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
                onToggleDiscipline={() =>
                  setActiveSportSubTab((prev) => (prev === 'coursing' ? 'racing' : 'coursing'))
                }
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
                onToggleDiscipline={() =>
                  setActiveSportSubTab((prev) => (prev === 'coursing' ? 'racing' : 'coursing'))
                }
              />
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ТАБ 2: ВЫСТАВКИ (ПО ПОРОДАМ И АБСОЛЮТНЫЕ ЛИДЕРЫ)
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'shows' && (
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
                onToggleSubTab={() =>
                  setActiveShowsSubTab((prev) => (prev === 'by-breed' ? 'all-breeds' : 'by-breed'))
                }
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
              <div className="home-v2-col-head home-v2-col-head--tabs !flex-nowrap gap-1.5 sm:gap-2">
                <span className="hidden md:inline shrink-0">Абсолютные лидеры сезона</span>
                <span className="md:hidden truncate text-[12px] font-bold text-camel-800">
                  Абсолютный топ
                </span>
                <div className="shrink-0 flex items-center gap-1.5 ml-auto">
                  <span className="hidden md:inline shrink-0 text-[11px] font-normal text-old-money-600">
                    Все породы · {CURRENT_SEASON}
                  </span>
                  <HomeSubSectionTab
                    targetLabel="По породам"
                    direction="left"
                    onToggle={() =>
                      setActiveShowsSubTab((prev) => (prev === 'by-breed' ? 'all-breeds' : 'by-breed'))
                    }
                  />
                </div>
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
        )}

      {/* ─────────────────────────────────────────────────────────────
          ТАБ 3: ДОНИНО (ЗАМЕР СКОРОСТИ И БЕГА 350 М)
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'donino' && (
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
                  onToggleSubTab={() =>
                    setActiveDoninoSubTab((prev) => (prev === 'speed' ? 'coursing' : 'speed'))
                  }
                />
              ) : (
                <>
                  <div className="home-v2-col-head home-v2-col-head--tabs !flex-nowrap gap-1.5 sm:gap-2">
                    <span className="pr-24 md:pr-0 truncate">Замер скорости (радар)</span>
                    <HomeSubSectionTab
                      targetLabel="Бега 350 м"
                      direction="right"
                      onToggle={() =>
                        setActiveDoninoSubTab((prev) => (prev === 'speed' ? 'coursing' : 'speed'))
                      }
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
                  onToggleSubTab={() =>
                    setActiveDoninoSubTab((prev) => (prev === 'speed' ? 'coursing' : 'speed'))
                  }
                />
              ) : (
                <>
                  <div className="home-v2-col-head home-v2-col-head--tabs !flex-nowrap gap-1.5 sm:gap-2">
                    <span className="pr-20 md:pr-0 truncate">Бега 350 м (спринт)</span>
                    <HomeSubSectionTab
                      targetLabel="Замер"
                      direction="left"
                      onToggle={() =>
                        setActiveDoninoSubTab((prev) => (prev === 'speed' ? 'coursing' : 'speed'))
                      }
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
          )}
        </div>
      )}
    </section>
  )
}

export const SeasonTopSection = memo(SeasonTopSectionInner)
