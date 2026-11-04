import { memo } from 'react'
import SeasonShowsCarousel from '../SeasonShowsCarousel'
import { HomeSubSectionTab } from './HomeSubSectionTab'
import HomeSeasonTopRow from '../../../../components/HomeSeasonTopRow'
import { showHomeMetric } from '../../utils/formatters'
import { parseDogName } from '../../../../lib/dogName'
import { showDogProfilePath } from '../../../../lib/showDogProfilePath'
import { useSubTabSwipe } from './useSubTabSwipe'
import type { BreedSlide } from '../../utils/breedSeasonSlides'
import type { ShowHomeTopDog } from '../../../../lib/staticData'
import type { useHomeBreedCarousel } from '../../hooks/useHomeBreedCarousel'

const CURRENT_SEASON = new Date().getFullYear()

export type ShowsSubTab = 'by-breed' | 'all-breeds'

interface ShowsTopTabProps {
  showSlides: BreedSlide<ShowHomeTopDog>[]
  topShowDogs: ShowHomeTopDog[]
  carousel: ReturnType<typeof useHomeBreedCarousel>
  syncDots: { key: string; label: string }[]
}

export const ShowsTopTab = memo(function ShowsTopTab({
  showSlides,
  topShowDogs,
  carousel,
  syncDots,
}: ShowsTopTabProps) {
  const { activeSubTab, trackRef, isNudging, handleToggle, touchHandlers, trackStyle } =
    useSubTabSwipe<ShowsSubTab>({
      subTabs: ['by-breed', 'all-breeds'],
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
            ? activeSubTab === 'by-breed'
              ? 'animate-silk-nudge-left'
              : 'animate-silk-nudge-right'
            : ''
        }`}
        style={trackStyle}
      >
        {/* Left Column: Breed Carousel */}
        <div className="w-full max-w-full min-w-0 shrink-0 basis-full md:w-auto md:min-w-0 md:shrink md:basis-auto">
          <div className="home-v2-col w-full min-w-0 max-w-full">
            <SeasonShowsCarousel
              slides={showSlides}
              carousel={carousel}
              syncDots={syncDots}
              driveAutoplay
              isNudging={isNudging && activeSubTab === 'by-breed'}
              onToggleSubTab={() => handleToggle('all-breeds')}
            />
          </div>
        </div>

        {/* Right Column: Absolute Top Season Dogs across all breeds */}
        <div className="w-full max-w-full min-w-0 shrink-0 basis-full md:w-auto md:min-w-0 md:shrink md:basis-auto">
          <div className="home-v2-col w-full min-w-0 max-w-full">
            <div className="home-v2-col-head home-v2-col-head--tabs !flex-nowrap gap-1.5 sm:gap-2 relative">
              <span className="hidden md:inline shrink-0">Абсолютные лидеры сезона</span>
              <span className="md:hidden truncate text-[12.5px] font-bold text-camel-800 text-center w-full px-14 sm:px-16 md:px-0">
                Абсолютный топ · все породы
              </span>
              <div className="shrink-0 items-center gap-1.5 ml-auto hidden md:flex">
                <span className="shrink-0 text-[11px] font-normal text-old-money-600">
                  Все породы · {CURRENT_SEASON}
                </span>
              </div>
              <HomeSubSectionTab
                targetLabel="По породам"
                direction="left"
                isNudging={isNudging && activeSubTab === 'all-breeds'}
                onToggle={() => handleToggle('by-breed')}
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
  )
})
