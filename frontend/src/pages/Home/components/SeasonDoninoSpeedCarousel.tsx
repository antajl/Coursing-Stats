import { Link } from 'react-router-dom'
import DoninoHomeRecordRow from '../../../components/DoninoHomeRecordRow'
import {
  carouselSlideIndex,
  type HomeBreedCarouselApi,
} from '../hooks/useHomeBreedCarousel'
import { HomeBreedCarouselPager } from './HomeBreedCarouselPager'
import type { BreedSlide } from '../utils/breedSeasonSlides'
import type { SpeedRecord } from '../types'

interface SeasonDoninoSpeedCarouselProps {
  slides: BreedSlide<SpeedRecord>[]
  carousel: HomeBreedCarouselApi
  syncDots: { key: string; label: string }[]
  driveAutoplay?: boolean
}

export default function SeasonDoninoSpeedCarousel({
  slides,
  carousel,
  syncDots,
  driveAutoplay = false,
}: SeasonDoninoSpeedCarouselProps) {
  const { contentIndex, fadeStyle, index } = carousel
  const localContent = carouselSlideIndex(contentIndex, slides.length)
  const slide = slides[localContent] ?? slides[0]

  if (!slide) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="home-v2-col-head">Замер скорости</div>
        <p className="donino-home-empty" role="status">
          Нет данных
        </p>
      </div>
    )
  }

  const rankingHref = `/speed-records?breed=${encodeURIComponent(slide.breedKey)}`

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="home-v2-col-head home-v2-col-head--tabs">
        <span className="hidden md:inline shrink-0">Замер скорости</span>
        <div
          className="flex min-w-0 flex-1 items-center justify-start md:justify-center gap-1.5 pr-2 md:px-2"
          style={fadeStyle}
        >
          <Link
            to={rankingHref}
            className="truncate text-[12px] font-semibold text-camel-800 hover:underline"
            title={`Рекорды скорости: ${slide.breedLabel}`}
          >
            {slide.breedLabel}
          </Link>
          <span className="shrink-0 text-[10px] text-charcoal-400">
            · {slide.dogCount} соб.
          </span>
        </div>
        <span className="shrink-0 text-[11px] font-normal text-old-money-600">
          Радар км/ч
        </span>
      </div>

      <div
        className="donino-home-list"
        style={fadeStyle}
        role="list"
        aria-label={`Рекорды скорости Донино: ${slide.breedLabel}`}
        aria-live="polite"
      >
        {slide.dogs.map((record) => (
          <div key={`donino-speed-${slide.breedKey}-${record.name}`} role="listitem">
            <DoninoHomeRecordRow
              mode="speed"
              name={record.name}
              breed={record.breed}
              sex={record.sex || undefined}
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
