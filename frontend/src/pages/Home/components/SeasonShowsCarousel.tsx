import { Link } from 'react-router-dom'
import { parseDogName } from '../../../lib/dogName'
import { showDogProfilePath } from '../../../lib/showDogProfilePath'
import HomeSeasonTopRow from '../../../components/HomeSeasonTopRow'
import { showHomeMetric } from '../utils/formatters'
import type { HomeBreedCarouselApi } from '../hooks/useHomeBreedCarousel'
import { HomeBreedCarouselPager } from './HomeBreedCarouselPager'
import { HomeSubSectionCapsule } from './SeasonTopSection'
import type { BreedSlide } from '../utils/breedSeasonSlides'
import type { ShowHomeTopDog } from '../../../lib/staticData'

const CURRENT_SEASON = new Date().getFullYear()

interface SeasonShowsCarouselProps {
  slides: BreedSlide<ShowHomeTopDog>[]
  carousel: HomeBreedCarouselApi
  syncDots: { key: string; label: string }[]
  driveAutoplay?: boolean
  onToggleSubTab?: () => void
}

export default function SeasonShowsCarousel({
  slides,
  carousel,
  syncDots,
  driveAutoplay = false,
  onToggleSubTab,
}: SeasonShowsCarouselProps) {
  const { index, trackStyle, getAdjacent, touchHandlers } = carousel
  const { prev: prevSlide, current: slide, next: nextSlide } = getAdjacent(slides)

  if (!slide) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="home-v2-col-head">Выставки</div>
        <p className="donino-home-empty" role="status">
          Нет данных
        </p>
      </div>
    )
  }

  const renderHeaderItem = (s: BreedSlide<ShowHomeTopDog>) => {
    const rankingHref = `/shows?tab=ranking&year=${CURRENT_SEASON}&breed=${encodeURIComponent(s.breedKey)}`
    return (
      <div className="w-full shrink-0 flex items-center justify-start md:justify-center gap-1.5 pr-2 md:px-2">
        <Link
          to={rankingHref}
          className="truncate text-[12px] font-semibold text-camel-800 hover:underline"
          title={`Рейтинг выставок: ${s.breedLabel}`}
        >
          {s.breedLabel}
        </Link>
        <span className="shrink-0 text-[10px] text-charcoal-400">
          · {s.dogCount} соб.
        </span>
      </div>
    )
  }

  const renderSlideDogs = (s: BreedSlide<ShowHomeTopDog>) => (
    <div
      className="w-full shrink-0 donino-home-list"
      role="list"
      aria-label={`Топ ${s.breedLabel} на выставках, сезон ${CURRENT_SEASON}`}
      aria-live="polite"
    >
      {s.dogs.map((dog, i) => {
        const { primary } = parseDogName(dog.name_lat, dog.name_ru)
        return (
          <div key={`${s.breedKey}-${dog.id}`} className="relative group" role="listitem">
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
  )

  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 flex-col home-breed-carousel-swipeable"
      {...touchHandlers}
    >
      <div className="home-v2-col-head home-v2-col-head--tabs !flex-nowrap gap-1.5 sm:gap-2">
        <span className="hidden md:inline shrink-0">Выставки</span>
        <div className="overflow-hidden flex min-w-0 flex-1">
          <div className="flex w-full will-change-transform" style={trackStyle}>
            {renderHeaderItem(prevSlide)}
            {renderHeaderItem(slide)}
            {renderHeaderItem(nextSlide)}
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 ml-auto">
          <span className="hidden md:inline shrink-0 text-[11px] font-normal text-old-money-600">
            по титулам
          </span>
          {onToggleSubTab && (
            <HomeSubSectionCapsule
              currentLabel="По породам"
              isFirst={true}
              onToggle={onToggleSubTab}
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
