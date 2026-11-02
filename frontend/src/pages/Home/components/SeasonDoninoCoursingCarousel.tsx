import { Link } from 'react-router-dom'
import DoninoHomeRecordRow from '../../../components/DoninoHomeRecordRow'
import type { HomeBreedCarouselApi } from '../hooks/useHomeBreedCarousel'
import { HomeBreedCarouselPager } from './HomeBreedCarouselPager'
import { HomeSubSectionTab } from './SeasonTopSection'
import type { BreedSlide } from '../utils/breedSeasonSlides'
import type { CoursingRecord } from '../types'

interface SeasonDoninoCoursingCarouselProps {
  slides: BreedSlide<CoursingRecord>[]
  carousel: HomeBreedCarouselApi
  syncDots: { key: string; label: string }[]
  driveAutoplay?: boolean
  isNudging?: boolean
  onToggleSubTab?: () => void
}

export default function SeasonDoninoCoursingCarousel({
  slides,
  carousel,
  syncDots,
  driveAutoplay = false,
  isNudging = false,
  onToggleSubTab,
}: SeasonDoninoCoursingCarouselProps) {
  const { index, trackStyle, getAdjacent, touchHandlers } = carousel
  const { prev: prevSlide, current: slide, next: nextSlide } = getAdjacent(slides)

  if (!slide) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="home-v2-col-head">Бега 350 м</div>
        <p className="donino-home-empty" role="status">
          Нет данных
        </p>
      </div>
    )
  }

  const renderHeaderItem = (s: BreedSlide<CoursingRecord>) => {
    const rankingHref = `/coursing-records?breed=${encodeURIComponent(s.breedKey)}`
    return (
      <div className="w-full shrink-0 flex items-center justify-center gap-1.5 px-2">
        <Link
          to={rankingHref}
          className="truncate text-[12px] font-semibold text-camel-800 hover:underline"
          title={`Рекорды спринта: ${s.breedLabel}`}
        >
          {s.breedLabel}
        </Link>
        <span className="shrink-0 text-[10px] text-charcoal-400">
          · {s.dogCount} соб.
        </span>
      </div>
    )
  }

  const renderSlideDogs = (s: BreedSlide<CoursingRecord>) => (
    <div
      className="w-full shrink-0 donino-home-list"
      role="list"
      aria-label={`Рекорды спринта 350 м Донино: ${s.breedLabel}`}
      aria-live="polite"
    >
      {s.dogs.map((record) => (
        <div key={`donino-run-${s.breedKey}-${record.name}`} role="listitem">
          <DoninoHomeRecordRow
            mode="coursing"
            name={record.name}
            breed={record.breed}
            sex={record.sex || undefined}
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
  )

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="home-v2-col-head home-v2-col-head--tabs !flex-nowrap gap-1.5 sm:gap-2 relative">
        <span className="hidden md:inline shrink-0">Бега 350 м</span>
        <div className="flex min-w-0 flex-1 items-center justify-center px-20 md:px-0">
          {renderHeaderItem(slide)}
        </div>
        <div className="shrink-0 flex items-center gap-1.5 ml-auto hidden md:flex">
          <span className="shrink-0 text-[11px] font-normal text-old-money-600">
            Спринт сек
          </span>
        </div>
        {onToggleSubTab && (
          <HomeSubSectionTab
            targetLabel="Замер"
            direction="left"
            isNudging={isNudging}
            onToggle={onToggleSubTab}
          />
        )}
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
