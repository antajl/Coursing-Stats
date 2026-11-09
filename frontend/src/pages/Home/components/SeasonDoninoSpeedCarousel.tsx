import { Link } from 'react-router-dom'
import DoninoHomeRecordRow from '../../../components/DoninoHomeRecordRow'
import type { HomeBreedCarouselApi } from '../hooks/useHomeBreedCarousel'
import { HomeBreedCarouselPager } from './HomeBreedCarouselPager'
import { HomeSubSectionTab } from './SeasonTopSection'
import type { BreedSlide } from '../utils/breedSeasonSlides'
import type { SpeedRecord } from '../types'

interface SeasonDoninoSpeedCarouselProps {
  slides: BreedSlide<SpeedRecord>[]
  carousel: HomeBreedCarouselApi
  syncDots: { key: string; label: string }[]
  driveAutoplay?: boolean
  isNudging?: boolean
  onToggleSubTab?: () => void
}

export default function SeasonDoninoSpeedCarousel({
  slides,
  carousel,
  syncDots,
  driveAutoplay = false,
  isNudging = false,
  onToggleSubTab,
}: SeasonDoninoSpeedCarouselProps) {
  const { index, getAdjacent } = carousel
  const { current: slide } = getAdjacent(slides)

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

  const renderHeaderItem = (s: BreedSlide<SpeedRecord>) => {
    const rankingHref = `/speed-records/?breed=${encodeURIComponent(s.breedKey)}`
    return (
      <div className="min-w-0 max-w-full flex items-center justify-center gap-1.5 px-1">
        <Link
          to={rankingHref}
          className="truncate min-w-0 text-[12px] font-semibold text-camel-800 hover:underline"
          title={`Рекорды скорости: ${s.breedLabel}`}
        >
          {s.breedLabel}
        </Link>
        <span className="shrink-0 text-[10px] text-charcoal-400">
          · {s.dogCount} соб.
        </span>
      </div>
    )
  }

  const renderSlideDogs = (s: BreedSlide<SpeedRecord>) => (
    <div
      className="w-full min-w-0 donino-home-list"
      role="list"
      aria-label={`Рекорды скорости Донино: ${s.breedLabel}`}
      aria-live="polite"
    >
      {s.dogs.map((record) => (
        <div key={`donino-speed-${s.breedKey}-${record.name}`} role="listitem">
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
  )

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="home-v2-col-head home-v2-col-head--tabs !flex-nowrap gap-1.5 sm:gap-2 relative">
        <span className="hidden md:inline shrink-0">Замер скорости</span>
        <div className="flex min-w-0 flex-1 items-center justify-center px-14 sm:px-16 md:px-0">
          {renderHeaderItem(slide)}
        </div>
        <div className="shrink-0 flex items-center gap-1.5 ml-auto hidden md:flex">
          <span className="shrink-0 text-[11px] font-normal text-old-money-600">
            Радар км/ч
          </span>
        </div>
        {onToggleSubTab && (
          <HomeSubSectionTab
            targetLabel="Бега 350 м"
            direction="right"
            isNudging={isNudging}
            onToggle={onToggleSubTab}
          />
        )}
      </div>

      <div className="overflow-hidden flex-1 flex flex-col min-w-0 w-full">
        <div key={slide.breedKey} className="w-full flex-1">
          {renderSlideDogs(slide)}
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
