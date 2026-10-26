import { Link } from 'react-router-dom'
import DogCard from '../../../components/DogCard'
import {
  carouselSlideIndex,
  type HomeBreedCarouselApi,
} from '../hooks/useHomeBreedCarousel'
import { HomeBreedCarouselPager } from './HomeBreedCarouselPager'
import type { BreedSlide } from '../utils/breedSeasonSlides'

const CURRENT_SEASON = new Date().getFullYear()

interface SeasonRacingCarouselProps {
  slides: BreedSlide<any>[]
  carousel: HomeBreedCarouselApi
  syncDots: { key: string; label: string }[]
  driveAutoplay?: boolean
}

export default function SeasonRacingCarousel({
  slides,
  carousel,
  syncDots,
  driveAutoplay = false,
}: SeasonRacingCarouselProps) {
  const { contentIndex, fadeStyle, index } = carousel
  const localContent = carouselSlideIndex(contentIndex, slides.length)
  const slide = slides[localContent] ?? slides[0]

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

  const rankingHref = `/competitions?tab=ranking&type=speed&year=${CURRENT_SEASON}&breed=${encodeURIComponent(slide.breedKey)}`

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="home-v2-col-head home-v2-col-head--tabs">
        <span className="hidden md:inline shrink-0">Рейсинг</span>
        <div
          className="flex min-w-0 flex-1 items-center justify-start md:justify-center gap-1.5 pr-2 md:px-2"
          style={fadeStyle}
        >
          <Link
            to={rankingHref}
            className="truncate text-[12px] font-semibold text-camel-800 hover:underline"
            title={`Рейтинг скорости: ${slide.breedLabel}`}
          >
            {slide.breedLabel}
          </Link>
          <span className="shrink-0 text-[10px] text-charcoal-400">
            · {slide.dogCount} соб.
          </span>
        </div>
        <span className="shrink-0 text-[11px] font-normal text-old-money-600">
          Скорость км/ч
        </span>
      </div>

      <div
        className="donino-home-list"
        style={fadeStyle}
        role="list"
        aria-label={`Топ ${slide.breedLabel} в рейсинге, сезон ${CURRENT_SEASON}`}
        aria-live="polite"
      >
        {slide.dogs.map((dog) => (
          <div key={`${slide.breedKey}-${dog.dog_id}`} className="relative group" role="listitem">
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
