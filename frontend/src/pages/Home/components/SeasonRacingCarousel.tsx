import { Link } from 'react-router-dom'
import DogCard from '../../../components/DogCard'
import type { HomeBreedCarouselApi } from '../hooks/useHomeBreedCarousel'
import { HomeBreedCarouselPager } from './HomeBreedCarouselPager'
import { HomeSubSectionCapsule } from './SeasonTopSection'
import type { BreedSlide } from '../utils/breedSeasonSlides'

const CURRENT_SEASON = new Date().getFullYear()

interface SeasonRacingCarouselProps {
  slides: BreedSlide<any>[]
  carousel: HomeBreedCarouselApi
  syncDots: { key: string; label: string }[]
  driveAutoplay?: boolean
  onToggleDiscipline?: () => void
}

export default function SeasonRacingCarousel({
  slides,
  carousel,
  syncDots,
  driveAutoplay = false,
  onToggleDiscipline,
}: SeasonRacingCarouselProps) {
  const { index, trackStyle, getAdjacent, touchHandlers } = carousel
  const { prev: prevSlide, current: slide, next: nextSlide } = getAdjacent(slides)

  if (!slide) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="home-v2-col-head">Рейсинг</div>
        <p className="donino-home-empty" role="status">
          Нет данных
        </p>
      </div>
    )
  }

  const renderHeaderItem = (s: BreedSlide<any>) => {
    const rankingHref = `/competitions?tab=ranking&type=speed&year=${CURRENT_SEASON}&breed=${encodeURIComponent(s.breedKey)}`
    return (
      <div className="w-full shrink-0 flex items-center justify-start md:justify-center gap-1.5 pr-2 md:px-2">
        <Link
          to={rankingHref}
          className="truncate text-[12.5px] font-bold text-camel-800 hover:underline"
          title={`Рейтинг скорости: ${s.breedLabel}`}
        >
          {s.breedLabel}
        </Link>
        <span className="shrink-0 text-[11px] font-semibold text-charcoal-600">
          · {s.dogCount} соб.
        </span>
      </div>
    )
  }

  const renderSlideDogs = (s: BreedSlide<any>) => (
    <div
      className="w-full shrink-0 donino-home-list"
      role="list"
      aria-label={`Топ ${s.breedLabel} в рейсинге, сезон ${CURRENT_SEASON}`}
      aria-live="polite"
    >
      {s.dogs.map((dog) => (
        <div key={`${s.breedKey}-${dog.dog_id}`} className="relative group" role="listitem">
          <DogCard
            dog={dog}
            type="speed"
            filterYear={String(CURRENT_SEASON)}
            rank={dog.rank}
            variant="embedded"
          />
        </div>
      ))}
    </div>
  )

  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 flex-col home-breed-carousel-swipeable"
      {...touchHandlers}
    >
      <div className="home-v2-col-head home-v2-col-head--tabs !flex-nowrap gap-1.5 sm:gap-2">
        <span className="hidden md:inline shrink-0">Рейсинг</span>
        <div className="overflow-hidden flex min-w-0 flex-1">
          <div className="flex w-full will-change-transform" style={trackStyle}>
            {renderHeaderItem(prevSlide)}
            {renderHeaderItem(slide)}
            {renderHeaderItem(nextSlide)}
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 ml-auto">
          <span className="hidden md:inline shrink-0 text-[11px] font-normal text-old-money-600">
            Скорость км/ч
          </span>
          {onToggleDiscipline && (
            <HomeSubSectionCapsule
              currentLabel="Рейсинг"
              isFirst={false}
              onToggle={onToggleDiscipline}
            />
          )}
        </div>
      </div>

      <div className="overflow-hidden flex-1 flex flex-col">
        <div className="flex w-full will-change-transform" style={trackStyle}>
          {renderSlideDogs(prevSlide)}
          {renderSlideDogs(slide)}
          {renderSlideDogs(nextSlide)}
        </div>
      </div>

      <HomeBreedCarouselPager
        carousel={carousel}
        activeDot={index}
        ariaLabel="Породы в ротации"
        driveAutoplay={driveAutoplay}
        dots={syncDots}
      />
    </div>
  )
}
