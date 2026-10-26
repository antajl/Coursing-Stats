import { Link } from 'react-router-dom'
import DogCard from '../../../components/DogCard'
import CoursingRatingHint from '../../TopDogs/CoursingRatingHint'
import {
  carouselSlideIndex,
  type HomeBreedCarouselApi,
} from '../hooks/useHomeBreedCarousel'
import { HomeBreedCarouselPager } from './HomeBreedCarouselPager'
import type { BreedSlide } from '../utils/breedSeasonSlides'
import type { CombinedRankingDog } from '../../TopDogs/mergeCombinedRanking'

const CURRENT_SEASON = new Date().getFullYear()

interface SeasonCompetitionsCarouselProps {
  slides: BreedSlide<CombinedRankingDog>[]
  carousel: HomeBreedCarouselApi
  syncDots: { key: string; label: string }[]
  driveAutoplay?: boolean
}

export default function SeasonCompetitionsCarousel({
  slides,
  carousel,
  syncDots,
  driveAutoplay = false,
}: SeasonCompetitionsCarouselProps) {
  const { contentIndex, fadeStyle, index } = carousel
  const localContent = carouselSlideIndex(contentIndex, slides.length)
  const slide = slides[localContent] ?? slides[0]

  if (!slide) {
    return <p className="donino-home-empty" role="status">Нет данных</p>
  }

  const rankingHref = `/competitions?tab=ranking&year=${CURRENT_SEASON}&breed=${encodeURIComponent(slide.breedKey)}`

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="home-v2-col-head home-v2-col-head--tabs">
        <span className="hidden md:inline shrink-0">Курсинг</span>
        <div
          className="flex min-w-0 flex-1 items-center justify-start md:justify-center gap-1.5 pr-2 md:px-2"
          style={fadeStyle}
        >
          <Link
            to={rankingHref}
            className="truncate text-[12.5px] font-bold text-camel-800 hover:underline"
            title={`Рейтинг курсинга: ${slide.breedLabel}`}
          >
            {slide.breedLabel}
          </Link>
          <span className="shrink-0 text-[11px] font-semibold text-charcoal-600">
            · {slide.dogCount} соб.
          </span>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-normal text-old-money-600">
          Зачёт сезона
          <CoursingRatingHint embedded />
        </span>
      </div>

      <div
        className="donino-home-list"
        style={fadeStyle}
        role="list"
        aria-label={`Топ ${slide.breedLabel} в соревнованиях, сезон ${CURRENT_SEASON}`}
        aria-live="polite"
      >
        {slide.dogs.map((dog) => (
          <div key={`${slide.breedKey}-${dog.dog_id}`} className="relative group" role="listitem">
            <DogCard
              dog={dog}
              type="combined"
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
