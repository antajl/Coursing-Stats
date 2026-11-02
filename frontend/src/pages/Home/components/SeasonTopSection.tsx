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
  const isLeft = direction === 'left'
  const alignClass = isLeft
    ? 'left-0 rounded-r-full border-y border-r border-camel-400/60 pr-3 pl-2.5'
    : 'right-0 rounded-l-full border-y border-l border-camel-400/60 pl-3 pr-2.5'

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`md:hidden absolute top-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-1 bg-[#fbf7f0]/75 text-camel-950 font-bold text-[11px] py-1 shadow-xs backdrop-blur-md transition-all hover:bg-camel-100/90 active:scale-95 cursor-pointer touch-manipulation select-none ${alignClass} ${
        isNudging
          ? isLeft
            ? 'animate-tab-nudge-right'
            : 'animate-tab-nudge-left'
          : ''
      }`}
      title={`Перейти: ${targetLabel}`}
      aria-label={`Перейти: ${targetLabel}`}
    >
      {isLeft && (
        <ChevronLeft className="w-3.5 h-3.5 text-camel-800 shrink-0" />
      )}
      <span className="tracking-tight">{targetLabel}</span>
      {!isLeft && (
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

  const sportTrackRef = useRef<HTMLDivElement>(null)
  const showsTrackRef = useRef<HTMLDivElement>(null)
  const doninoTrackRef = useRef<HTMLDivElement>(null)

  const getCurrentTrack = useCallback(() => {
    if (activeTab === 'sport') return sportTrackRef.current
    if (activeTab === 'shows') return showsTrackRef.current
    return doninoTrackRef.current
  }, [activeTab])

  const getCurrentSlide = useCallback(() => {
    if (activeTab === 'sport') return activeSportSubTab === 'coursing' ? 0 : 1
    if (activeTab === 'shows') return activeShowsSubTab === 'by-breed' ? 0 : 1
    return activeDoninoSubTab === 'speed' ? 0 : 1
  }, [activeTab, activeSportSubTab, activeShowsSubTab, activeDoninoSubTab])

  const [isNudging, setIsNudging] = useState(false)

  const triggerNudge = useCallback(() => {
    setIsNudging(true)
    setTimeout(() => {
      setIsNudging(false)
    }, 750)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      triggerNudge()
    }, 600)
    return () => clearTimeout(timer)
  }, [activeTab, triggerNudge])

  const handleToggleSport = useCallback((target: SportSubTab) => {
    if (sportTrackRef.current) {
      sportTrackRef.current.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      sportTrackRef.current.style.transform = `translate3d(${target === 'coursing' ? '0%' : '-100%'}, 0, 0)`
    }
    setActiveSportSubTab(target)
    window.setTimeout(() => {
      triggerNudge()
    }, 400)
  }, [triggerNudge])

  const handleToggleShows = useCallback((target: ShowsSubTab) => {
    if (showsTrackRef.current) {
      showsTrackRef.current.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      showsTrackRef.current.style.transform = `translate3d(${target === 'by-breed' ? '0%' : '-100%'}, 0, 0)`
    }
    setActiveShowsSubTab(target)
    window.setTimeout(() => {
      triggerNudge()
    }, 400)
  }, [triggerNudge])

  const handleToggleDonino = useCallback((target: DoninoSubTab) => {
    if (doninoTrackRef.current) {
      doninoTrackRef.current.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      doninoTrackRef.current.style.transform = `translate3d(${target === 'speed' ? '0%' : '-100%'}, 0, 0)`
    }
    setActiveDoninoSubTab(target)
    window.setTimeout(() => {
      triggerNudge()
    }, 400)
  }, [triggerNudge])

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const gestureLockRef = useRef<'horizontal' | 'vertical' | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) return
    setIsNudging(false)
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
    gestureLockRef.current = null
    const track = getCurrentTrack()
    if (track) {
      track.style.transition = 'none'
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || (typeof window !== 'undefined' && window.innerWidth >= 768)) return
    const touch = e.touches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y

    if (!gestureLockRef.current) {
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      if (absDx < 7 && absDy < 7) return
      if (absDy >= absDx) {
        gestureLockRef.current = 'vertical'
        return
      }
      gestureLockRef.current = 'horizontal'
    }

    if (gestureLockRef.current === 'horizontal') {
      const track = getCurrentTrack()
      if (track) {
        const currentSlide = getCurrentSlide()
        const isAtLeftEdge = currentSlide === 0 && dx > 0
        const isAtRightEdge = currentSlide === 1 && dx < 0
        const appliedDx = isAtLeftEdge || isAtRightEdge ? dx * 0.22 : dx
        track.style.transform = `translate3d(calc(${-currentSlide * 100}% + ${appliedDx}px), 0, 0)`
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const isHorizontal = gestureLockRef.current === 'horizontal'
    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dt = Date.now() - touchStartRef.current.time
    const velocity = Math.abs(dx) / (dt || 1)
    touchStartRef.current = null
    gestureLockRef.current = null

    const track = getCurrentTrack()
    const currentSlide = getCurrentSlide()

    if (isHorizontal && track) {
      const isSwipeLeft = dx < -35 || (dx < -15 && velocity > 0.2)
      const isSwipeRight = dx > 35 || (dx > 15 && velocity > 0.2)
      let targetSlide: 0 | 1 = currentSlide

      if (isSwipeLeft && currentSlide === 0) {
        targetSlide = 1
      } else if (isSwipeRight && currentSlide === 1) {
        targetSlide = 0
      }

      track.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      track.style.transform = `translate3d(${-targetSlide * 100}%, 0, 0)`

      if (targetSlide !== currentSlide) {
        if (activeTab === 'sport') {
          setActiveSportSubTab(targetSlide === 0 ? 'coursing' : 'racing')
        } else if (activeTab === 'shows') {
          setActiveShowsSubTab(targetSlide === 0 ? 'by-breed' : 'all-breeds')
        } else {
          setActiveDoninoSubTab(targetSlide === 0 ? 'speed' : 'coursing')
        }
        window.setTimeout(() => {
          triggerNudge()
        }, 400)
      }
    } else if (track) {
      track.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      track.style.transform = `translate3d(${-currentSlide * 100}%, 0, 0)`
    }
  }

  const handleTouchCancel = () => {
    touchStartRef.current = null
    gestureLockRef.current = null
    const track = getCurrentTrack()
    if (track) {
      const currentSlide = getCurrentSlide()
      track.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      track.style.transform = `translate3d(${-currentSlide * 100}%, 0, 0)`
    }
  }

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
      className={`home-v2-block scroll-mt-20 w-full min-w-0 max-w-full overflow-hidden ${
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
          className="w-full min-w-0 max-w-full overflow-hidden touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          {...carousel.pauseHandlers}
        >
          <div
            ref={sportTrackRef}
            className={`flex w-full min-w-0 items-start gap-0 md:grid md:grid-cols-2 md:gap-6 home-v2-columns md:!transform-none ${
              isNudging
                ? activeSportSubTab === 'coursing'
                  ? 'animate-silk-nudge-left'
                  : 'animate-silk-nudge-right'
                : ''
            }`}
            style={{
              transform:
                typeof window !== 'undefined' && window.innerWidth >= 768
                  ? 'none'
                  : isNudging
                  ? undefined
                  : `translate3d(${activeSportSubTab === 'coursing' ? '0%' : '-100%'}, 0, 0)`,
              willChange: 'transform',
            }}
          >
            {/* Column 1: Coursing */}
            <div className="w-full min-w-full max-w-full shrink-0 md:w-auto md:min-w-0 md:shrink">
              <div className="home-v2-col w-full min-w-0 max-w-full">
                <SeasonCompetitionsCarousel
                  slides={competitionSlides}
                  carousel={carousel}
                  syncDots={syncDots}
                  driveAutoplay
                  isNudging={isNudging && activeSportSubTab === 'coursing'}
                  onToggleDiscipline={() => handleToggleSport('racing')}
                />
              </div>
            </div>

            {/* Column 2: Racing */}
            <div className="w-full min-w-full max-w-full shrink-0 md:w-auto md:min-w-0 md:shrink">
              <div className="home-v2-col w-full min-w-0 max-w-full">
                <SeasonRacingCarousel
                  slides={racingSlides}
                  carousel={carousel}
                  syncDots={syncDots}
                  driveAutoplay={false}
                  isNudging={isNudging && activeSportSubTab === 'racing'}
                  onToggleDiscipline={() => handleToggleSport('coursing')}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ТАБ 2: ВЫСТАВКИ (ПО ПОРОДАМ И АБСОЛЮТНЫЕ ЛИДЕРЫ)
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'shows' && (
        <div
          className="w-full min-w-0 max-w-full overflow-hidden touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          {...carousel.pauseHandlers}
        >
          <div
            ref={showsTrackRef}
            className={`flex w-full min-w-0 items-start gap-0 md:grid md:grid-cols-2 md:gap-6 home-v2-columns md:!transform-none ${
              isNudging
                ? activeShowsSubTab === 'by-breed'
                  ? 'animate-silk-nudge-left'
                  : 'animate-silk-nudge-right'
                : ''
            }`}
            style={{
              transform:
                typeof window !== 'undefined' && window.innerWidth >= 768
                  ? 'none'
                  : isNudging
                  ? undefined
                  : `translate3d(${activeShowsSubTab === 'by-breed' ? '0%' : '-100%'}, 0, 0)`,
              willChange: 'transform',
            }}
          >
            {/* Left Column: Breed Carousel */}
            <div className="w-full min-w-full max-w-full shrink-0 md:w-auto md:min-w-0 md:shrink">
              <div className="home-v2-col w-full min-w-0 max-w-full">
                <SeasonShowsCarousel
                  slides={showSlides}
                  carousel={carousel}
                  syncDots={syncDots}
                  driveAutoplay
                  isNudging={isNudging && activeShowsSubTab === 'by-breed'}
                  onToggleSubTab={() => handleToggleShows('all-breeds')}
                />
              </div>
            </div>

            {/* Right Column: Absolute Top Season Dogs across all breeds */}
            <div className="w-full min-w-full max-w-full shrink-0 md:w-auto md:min-w-0 md:shrink">
              <div className="home-v2-col w-full min-w-0 max-w-full">
                <div className="home-v2-col-head home-v2-col-head--tabs !flex-nowrap gap-1.5 sm:gap-2 relative">
                  <span className="hidden md:inline shrink-0">Абсолютные лидеры сезона</span>
                  <span className="md:hidden truncate text-[12.5px] font-bold text-camel-800 text-center w-full px-20 md:px-0">
                    Абсолютный топ · все породы
                  </span>
                  <div className="shrink-0 flex items-center gap-1.5 ml-auto hidden md:flex">
                    <span className="shrink-0 text-[11px] font-normal text-old-money-600">
                      Все породы · {CURRENT_SEASON}
                    </span>
                  </div>
                  <HomeSubSectionTab
                    targetLabel="По породам"
                    direction="left"
                    isNudging={isNudging && activeShowsSubTab === 'all-breeds'}
                    onToggle={() => handleToggleShows('by-breed')}
                  />
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
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ТАБ 3: ДОНИНО (ЗАМЕР СКОРОСТИ И БЕГА 350 М)
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'donino' && (
        <div
          className="w-full min-w-0 max-w-full overflow-hidden touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          {...carousel.pauseHandlers}
        >
          <div
            ref={doninoTrackRef}
            className={`flex w-full min-w-0 items-start gap-0 md:grid md:grid-cols-2 md:gap-6 home-v2-columns md:!transform-none ${
              isNudging
                ? activeDoninoSubTab === 'speed'
                  ? 'animate-silk-nudge-left'
                  : 'animate-silk-nudge-right'
                : ''
            }`}
            style={{
              transform:
                typeof window !== 'undefined' && window.innerWidth >= 768
                  ? 'none'
                  : isNudging
                  ? undefined
                  : `translate3d(${activeDoninoSubTab === 'speed' ? '0%' : '-100%'}, 0, 0)`,
              willChange: 'transform',
            }}
          >
            {/* Column 1: Speed Radar Carousel */}
            <div className="w-full min-w-full max-w-full shrink-0 md:w-auto md:min-w-0 md:shrink">
              <div className="home-v2-col w-full min-w-0 max-w-full">
                {doninoSpeedSlides && doninoSpeedSlides.length > 0 ? (
                  <SeasonDoninoSpeedCarousel
                    slides={doninoSpeedSlides}
                    carousel={carousel}
                    syncDots={syncDots}
                    driveAutoplay
                    isNudging={isNudging && activeDoninoSubTab === 'speed'}
                    onToggleSubTab={() => handleToggleDonino('coursing')}
                  />
                ) : (
                  <>
                    <div className="home-v2-col-head home-v2-col-head--tabs !flex-nowrap gap-1.5 sm:gap-2 relative">
                      <span className="truncate text-center w-full px-20 md:px-0">Замер скорости (радар)</span>
                      <HomeSubSectionTab
                        targetLabel="Бега 350 м"
                        direction="right"
                        isNudging={isNudging && activeDoninoSubTab === 'speed'}
                        onToggle={() => handleToggleDonino('coursing')}
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
            <div className="w-full min-w-full max-w-full shrink-0 md:w-auto md:min-w-0 md:shrink">
              <div className="home-v2-col w-full min-w-0 max-w-full">
                {doninoCoursingSlides && doninoCoursingSlides.length > 0 ? (
                  <SeasonDoninoCoursingCarousel
                    slides={doninoCoursingSlides}
                    carousel={carousel}
                    syncDots={syncDots}
                    driveAutoplay={false}
                    isNudging={isNudging && activeDoninoSubTab === 'coursing'}
                    onToggleSubTab={() => handleToggleDonino('speed')}
                  />
                ) : (
                  <>
                    <div className="home-v2-col-head home-v2-col-head--tabs !flex-nowrap gap-1.5 sm:gap-2 relative">
                      <span className="truncate text-center w-full px-20 md:px-0">Бега 350 м (спринт)</span>
                      <HomeSubSectionTab
                        targetLabel="Замер"
                        direction="left"
                        isNudging={isNudging && activeDoninoSubTab === 'coursing'}
                        onToggle={() => handleToggleDonino('speed')}
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
      )}
    </section>
  )
}

export const SeasonTopSection = memo(SeasonTopSectionInner)
