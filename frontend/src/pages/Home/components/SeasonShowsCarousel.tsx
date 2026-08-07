import { Link } from 'react-router-dom'
import { parseDogName } from '../../../lib/dogName'
import { showDogProfilePath } from '../../../lib/showDogProfilePath'
import HomeSeasonTopRow from '../../../components/HomeSeasonTopRow'
import { showHomeMetric } from '../utils/formatters'
import {
  carouselSlideIndex,
  type HomeBreedCarouselApi,
} from '../hooks/useHomeBreedCarousel'
import { HomeBreedCarouselPager } from './HomeBreedCarouselPager'
import type { BreedSlide } from '../utils/breedSeasonSlides'
import type { ShowHomeTopDog } from '../../../lib/staticData'

const CURRENT_SEASON = new Date().getFullYear()

interface SeasonShowsCarouselProps {
  slides: BreedSlide<ShowHomeTopDog>[]
  carousel: HomeBreedCarouselApi
  syncDots: { key: string; label: string }[]
  driveAutoplay?: boolean
}

export default function SeasonShowsCarousel({
  slides,
  carousel,
  syncDots,
  driveAutoplay = false,
}: SeasonShowsCarouselProps) {
  const { contentIndex, fadeStyle, index } = carousel
  const localContent = carouselSlideIndex(contentIndex, slides.length)
  const slide = slides[localContent] ?? slides[0]

  if (!slide) {
    return (
      <>
        <div className="home-v2-col-head">Выставки</div>
        <p className="donino-home-empty" role="status">
          Нет данных
        </p>
      </>
    )
  }

  const rankingHref = `/shows?tab=ranking&year=${CURRENT_SEASON}&breed=${encodeURIComponent(slide.breedKey)}`

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="home-v2-col-head home-v2-col-head--tabs">
        <span className="shrink-0">Выставки</span>
        <div
          className="flex min-w-0 flex-1 items-center justify-center gap-1.5 px-2"
          style={fadeStyle}
        >
          <Link
            to={rankingHref}
            className="truncate text-[12px] font-medium text-camel-700 hover:underline dark:text-camel-400"
            title={`Рейтинг выставок: ${slide.breedLabel}`}
          >
            {slide.breedLabel}
          </Link>
          <span className="shrink-0 text-[10px] text-charcoal-400 dark:text-charcoal-500">
            · {slide.dogCount} соб.
          </span>
        </div>
        <span className="shrink-0 text-[11px] font-normal text-old-money-600 dark:text-charcoal-400">
          по титулам
        </span>
      </div>

      <div
        className="donino-home-list"
        style={fadeStyle}
        role="list"
        aria-label={`Топ ${slide.breedLabel} на выставках, сезон ${CURRENT_SEASON}`}
        aria-live="polite"
      >
        {slide.dogs.map((dog, i) => {
          const { primary } = parseDogName(dog.name_lat, dog.name_ru)
          return (
            <HomeSeasonTopRow
              key={`${slide.breedKey}-${dog.id}`}
              to={showDogProfilePath(dog)}
              name={primary}
              breed={dog.breed}
              sex={dog.sex}
              dogId={dog.competition_dog_id}
              meta={String(CURRENT_SEASON)}
              metric={showHomeMetric(dog)}
              showTitles={showHomeMetric(dog)}
              rank={dog.rank ?? i + 1}
              totalStarts={dog.total_shows}
            />
          )
        })}
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
