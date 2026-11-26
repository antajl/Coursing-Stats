import { useState } from 'react'
import DogCard, { DOG_CARD_HEIGHT_CLASS } from '../../components/DogCard'
import EmptyState from '../../components/EmptyState'
import DoninoColumnPlaque, { DoninoColumnShell } from '../SpeedRecords/DoninoColumnPlaque'
import { ColumnSwipeEdgeTab } from '../../components/ui/ColumnSwipeEdgeTab'
import { FavoriteCardStar } from '../../components/ui/FavoriteCardStar'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { useListReveal } from '../../hooks/useListReveal'
import { useHorizontalSwipe } from '../../hooks/useHorizontalSwipe'
import type { FavoriteDogMeta } from '../../hooks/useFavorites'
import type { CombinedRankingDog } from './mergeCombinedRanking'

function DogCardPlaceholder({ slotKey }: { slotKey: string }) {
  return <div key={slotKey} className={`${DOG_CARD_HEIGHT_CLASS} bg-transparent`} aria-hidden />
}

interface TopDogsColumnsProps {
  filteredCombined: CombinedRankingDog[]
  filteredSpeed: unknown[]
  filterYear: string
  favorites: Set<string>
  onToggleFavorite: (dogId: string, meta?: FavoriteDogMeta) => void
  disclaimerMode?: string
  activeMobileColumn?: 'coursing' | 'racing'
  onMobileColumnChange?: (col: 'coursing' | 'racing') => void
}

export default function TopDogsColumns({
  filteredCombined,
  filteredSpeed,
  filterYear,
  favorites,
  onToggleFavorite,
  activeMobileColumn: activeMobileColumnProp,
  onMobileColumnChange: onMobileColumnChangeProp,
}: TopDogsColumnsProps) {
  const [selectedMobileColumn, setSelectedMobileColumn] = useState<'coursing' | 'racing' | null>(null)
  const activeMobileColumn =
    activeMobileColumnProp ??
    selectedMobileColumn ??
    (filteredCombined.length === 0 && filteredSpeed.length > 0 ? 'racing' : 'coursing')
  const handleMobileColumnChange = onMobileColumnChangeProp ?? setSelectedMobileColumn

  const activeSlideIndex = activeMobileColumn === 'coursing' ? 0 : 1

  // Мобильный свайп с зазором 16px и мягкой подсказкой при первом открытии
  const {
    trackRef,
    isNudging,
    markInteracted,
    getSlideOffset,
    startDrag,
    moveDrag,
    endDrag,
    cancelDrag,
    handleClickCapture,
  } = useHorizontalSwipe({
    activeTabsCount: 2,
    activeTabIndex: activeSlideIndex,
    gapPx: 16,
    enableNudge: true,
    onTabChange: (targetIndex) => {
      handleMobileColumnChange(targetIndex === 0 ? 'coursing' : 'racing')
    },
  })

  const listLength = Math.max(filteredCombined.length, filteredSpeed.length)

  const { visibleCount, loadMoreRef, hasMore } = useInfiniteScroll(listLength, [
    filterYear,
    filteredCombined.length,
    filteredSpeed.length,
  ])

  const visibleCoursing = filteredCombined.slice(0, visibleCount)
  const visibleSpeed = filteredSpeed.slice(0, visibleCount)
  const coursingRevealRef = useListReveal(visibleCoursing.length > 0)
  const speedRevealRef = useListReveal(visibleSpeed.length > 0)

  if (filteredCombined.length === 0 && filteredSpeed.length === 0) {
    return (
      <EmptyState
        title="Нет данных для выбранных фильтров"
        description="Попробуйте изменить год или убрать фильтры"
      />
    )
  }

  const renderCoursingCard = (dog: CombinedRankingDog, slotKey: string) =>
    dog ? (
      <div key={dog.dog_id} data-list-item className="relative group">
        <FavoriteCardStar
          dogId={String(dog.dog_id)}
          nameLat={dog.name_lat}
          nameRu={dog.name_ru}
          breed={dog.breed}
          isFav={favorites.has(String(dog.dog_id))}
          onToggle={onToggleFavorite}
        />
        <DogCard
          dog={dog}
          type="combined"
          filterYear={filterYear}
          rank={dog.rank}
          variant="embedded"
        />
      </div>
    ) : (
      <DogCardPlaceholder slotKey={slotKey} />
    )

  const renderSpeedCard = (dog: any, slotKey: string) =>
    dog ? (
      <div key={dog.dog_id} data-list-item className="relative group">
        <FavoriteCardStar
          dogId={String(dog.dog_id)}
          nameLat={dog.name_lat}
          nameRu={dog.name_ru}
          breed={dog.breed}
          isFav={favorites.has(String(dog.dog_id))}
          onToggle={onToggleFavorite}
        />
        <DogCard dog={dog} type="speed" filterYear={filterYear} rank={dog.rank} variant="embedded" />
      </div>
    ) : (
      <DogCardPlaceholder slotKey={slotKey} />
    )

  const coursingList =
    visibleCoursing.length > 0 ? (
      visibleCoursing.map((dog) => renderCoursingCard(dog, `coursing-${dog.dog_id}`))
    ) : (
      <p className="py-6 text-center text-sm text-charcoal-500">Нет данных</p>
    )

  const speedList =
    visibleSpeed.length > 0 ? (
      visibleSpeed.map((dog: any) => renderSpeedCard(dog, `speed-${dog.dog_id}`))
    ) : (
      <p className="py-6 text-center text-sm text-charcoal-500">Нет данных</p>
    )

  const coursingPlaque = (
    <div className="relative">
      <DoninoColumnPlaque
        asHeader
        title="Курсинг / БЗМП"
        count={filteredCombined.length}
        countClassName="pr-24 lg:pr-0"
      />
      <ColumnSwipeEdgeTab
        direction="right"
        label="Рейсинг"
        isNudging={isNudging && activeSlideIndex === 0}
        onClick={() => {
          markInteracted()
          handleMobileColumnChange('racing')
        }}
      />
    </div>
  )

  const racingPlaque = (
    <div className="relative">
      <DoninoColumnPlaque
        asHeader
        title="Рейсинг"
        count={filteredSpeed.length}
        titleClassName="pl-24 lg:pl-0"
      />
      <ColumnSwipeEdgeTab
        direction="left"
        label="Курсинг"
        isNudging={isNudging && activeSlideIndex === 1}
        onClick={() => {
          markInteracted()
          handleMobileColumnChange('coursing')
        }}
      />
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Мобильный свайп (< 1024px) с зазором 16px и десктопная 2-колоночная сетка (>= 1024px) */}
      <div
        className="w-full relative overflow-x-clip lg:overflow-visible touch-pan-y select-none"
        onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={(e) => endDrag(e.changedTouches[0].clientX)}
        onTouchCancel={cancelDrag}
        onMouseDown={(e) => {
          if (e.button === 0) startDrag(e.clientX, e.clientY)
        }}
        onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
        onMouseUp={(e) => endDrag(e.clientX)}
        onMouseLeave={cancelDrag}
        onClickCapture={handleClickCapture}
      >
        <div
          ref={trackRef}
          className="flex flex-nowrap w-full min-w-0 items-start gap-4 lg:grid lg:grid-cols-2 lg:gap-8 lg:!transform-none"
          style={{
            transform:
              typeof window !== 'undefined' && window.innerWidth >= 1024
                ? 'none'
                : `translate3d(${getSlideOffset(activeSlideIndex)}, 0, 0)`,
            willChange: 'transform',
          }}
        >
          <div className="w-full max-w-full min-w-0 shrink-0 basis-full lg:w-auto lg:shrink lg:basis-auto">
            <DoninoColumnShell plaque={coursingPlaque} listRef={coursingRevealRef}>
              {coursingList}
            </DoninoColumnShell>
          </div>

          <div className="w-full max-w-full min-w-0 shrink-0 basis-full lg:w-auto lg:shrink lg:basis-auto">
            <DoninoColumnShell plaque={racingPlaque} listRef={speedRevealRef}>
              {speedList}
            </DoninoColumnShell>
          </div>
        </div>
      </div>

      {hasMore && (
        <div
          ref={loadMoreRef}
          className="py-4 text-center text-sm text-charcoal-500"
        >
          Загрузка…
        </div>
      )}
    </div>
  )
}
