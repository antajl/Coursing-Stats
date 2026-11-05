import { memo } from 'react'
import SeasonCompetitionsCarousel from '../SeasonCompetitionsCarousel'
import SeasonRacingCarousel from '../SeasonRacingCarousel'
import { useSubTabSwipe } from './useSubTabSwipe'
import type { BreedSlide } from '../../utils/breedSeasonSlides'
import type { CombinedRankingDog } from '../../../TopDogs/mergeCombinedRanking'
import type { useHomeBreedCarousel } from '../../hooks/useHomeBreedCarousel'

export type SportSubTab = 'coursing' | 'racing'

interface SportTopTabProps {
  competitionSlides: BreedSlide<CombinedRankingDog>[]
  racingSlides: BreedSlide<any>[]
  carousel: ReturnType<typeof useHomeBreedCarousel>
  syncDots: { key: string; label: string }[]
}

export const SportTopTab = memo(function SportTopTab({
  competitionSlides,
  racingSlides,
  carousel,
  syncDots,
}: SportTopTabProps) {
  const { activeSubTab, trackRef, isNudging, handleToggle, touchHandlers, trackStyle } =
    useSubTabSwipe<SportSubTab>({
      subTabs: ['coursing', 'racing'],
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
        className={`flex flex-nowrap w-full min-w-0 items-start gap-4 md:grid md:grid-cols-2 md:gap-6 md:!transform-none ${
          isNudging
            ? activeSubTab === 'coursing'
              ? 'animate-silk-nudge-left'
              : 'animate-silk-nudge-right'
            : ''
        }`}
        style={trackStyle}
      >
        {/* Column 1: Coursing */}
        <div className="w-full max-w-full min-w-0 shrink-0 basis-full md:w-auto md:min-w-0 md:shrink md:basis-auto">
          <div className="home-v2-col w-full min-w-0 max-w-full">
            <SeasonCompetitionsCarousel
              slides={competitionSlides}
              carousel={carousel}
              syncDots={syncDots}
              driveAutoplay
              isNudging={isNudging && activeSubTab === 'coursing'}
              onToggleDiscipline={() => handleToggle('racing')}
            />
          </div>
        </div>

        {/* Column 2: Racing */}
        <div className="w-full max-w-full min-w-0 shrink-0 basis-full md:w-auto md:min-w-0 md:shrink md:basis-auto">
          <div className="home-v2-col w-full min-w-0 max-w-full">
            <SeasonRacingCarousel
              slides={racingSlides}
              carousel={carousel}
              syncDots={syncDots}
              driveAutoplay={false}
              isNudging={isNudging && activeSubTab === 'racing'}
              onToggleDiscipline={() => handleToggle('coursing')}
            />
          </div>
        </div>
      </div>
    </div>
  )
})
