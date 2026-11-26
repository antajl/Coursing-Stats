import { useState } from 'react'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { useListReveal } from '../../hooks/useListReveal'
import { useHorizontalSwipe } from '../../hooks/useHorizontalSwipe'
import EmptyState from '../../components/EmptyState'
import DoninoColumnPlaque, { DoninoColumnShell } from '../SpeedRecords/DoninoColumnPlaque'
import { ColumnSwipeEdgeTab } from '../../components/ui/ColumnSwipeEdgeTab'
import ShowDogCard, { type ShowDogCardData } from './ShowDogCard'
import { displayBreed } from '../../lib/breedMapping'
import type { FavoriteDogMeta } from '../../hooks/useFavorites'
import type { ShowMonoAgeCategory } from '../../../../backend/lib/show-award-ranking'

export type RankedShowDog = ShowDogCardData & { rank: number }

interface ShowRankingColumnsProps {
  generalDogs: RankedShowDog[]
  monoDogs: RankedShowDog[]
  filterYear: string
  filterBreed?: string
  monoAgeCategory?: ShowMonoAgeCategory
  onMonoAgeCategoryChange?: (category: ShowMonoAgeCategory) => void
  favorites?: Set<string>
  onToggleFavorite?: (dogId: string, meta: FavoriteDogMeta) => void
  activeMobileColumn?: 'general' | 'mono'
  onMobileColumnChange?: (col: 'general' | 'mono') => void
}

function dogListKey(dog: ShowDogCardData, prefix: string): string {
  const name = (dog.name_lat || dog.name_ru || '').toUpperCase().replace(/\s+/g, ' ').trim()
  return `${prefix}|${name}|${dog.breed}|${dog.id}`
}

export default function ShowRankingColumns({
  generalDogs,
  monoDogs,
  filterYear,
  filterBreed,
  monoAgeCategory = 'all',
  onMonoAgeCategoryChange: _onMonoAgeCategoryChange,
  favorites,
  onToggleFavorite,
  activeMobileColumn: activeMobileColumnProp,
  onMobileColumnChange: onMobileColumnChangeProp,
}: ShowRankingColumnsProps) {
  const [selectedMobileColumn, setSelectedMobileColumn] = useState<'general' | 'mono' | null>(null)
  const activeMobileColumn =
    activeMobileColumnProp ??
    selectedMobileColumn ??
    (generalDogs.length === 0 && monoDogs.length > 0 ? 'mono' : 'general')
  const handleMobileColumnChange = onMobileColumnChangeProp ?? setSelectedMobileColumn

  const activeSlideIndex = activeMobileColumn === 'general' ? 0 : 1

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
      handleMobileColumnChange(targetIndex === 0 ? 'general' : 'mono')
    },
  })

  const listLength = Math.max(generalDogs.length, monoDogs.length)

  const { visibleCount, loadMoreRef, hasMore } = useInfiniteScroll(listLength, [
    filterYear,
    filterBreed,
    generalDogs.length,
    monoDogs.length,
  ])

  const visibleGeneral = generalDogs.slice(0, visibleCount)
  const visibleMono = monoDogs.slice(0, visibleCount)

  const generalRevealRef = useListReveal(visibleGeneral.length > 0)
  const monoRevealRef = useListReveal(visibleMono.length > 0)

  if (generalDogs.length === 0 && monoDogs.length === 0) {
    return (
      <EmptyState
        title="Нет данных для выбранных фильтров"
        description="Попробуйте изменить год или убрать фильтры"
      />
    )
  }

  const breedSuffix = filterBreed
    ? ` · ${displayBreed(filterBreed).primary || filterBreed}`
    : ''
  const generalTitle = `Общий зачёт РКФ${breedSuffix}`
  const monoTitle = `Монопородный зачёт (НКП)${breedSuffix}`

  const generalList =
    visibleGeneral.length > 0 ? (
      visibleGeneral.map((dog) => (
        <ShowDogCard
          key={dogListKey(dog, 'gen')}
          dog={dog}
          rank={dog.rank}
          filterYear={filterYear}
          filterScope="all"
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
        />
      ))
    ) : (
      <p className="py-6 text-center text-sm text-charcoal-500">Нет данных в общем зачёте</p>
    )

  const monoList =
    visibleMono.length > 0 ? (
      visibleMono.map((dog) => (
        <ShowDogCard
          key={dogListKey(dog, 'mono')}
          dog={dog}
          rank={dog.rank}
          filterYear={filterYear}
          filterScope="mono"
          monoAgeCategory={monoAgeCategory}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
        />
      ))
    ) : (
      <p className="py-6 text-center text-sm text-charcoal-500">Нет данных в монопородном зачёте</p>
    )

  const generalPlaque = (
    <div className="relative">
      <DoninoColumnPlaque
        asHeader
        title={generalTitle}
        count={generalDogs.length}
        countClassName="pr-28 lg:pr-0"
      />
      <ColumnSwipeEdgeTab
        direction="right"
        label="Моно (НКП)"
        isNudging={isNudging && activeSlideIndex === 0}
        onClick={() => {
          markInteracted()
          handleMobileColumnChange('mono')
        }}
      />
    </div>
  )

  const monoPlaque = (
    <div className="relative">
      <DoninoColumnPlaque
        asHeader
        title={monoTitle}
        count={monoDogs.length}
        titleClassName="pl-20 lg:pl-0"
      />
      <ColumnSwipeEdgeTab
        direction="left"
        label="Общий"
        isNudging={isNudging && activeSlideIndex === 1}
        onClick={() => {
          markInteracted()
          handleMobileColumnChange('general')
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
            <DoninoColumnShell plaque={generalPlaque} listRef={generalRevealRef}>
              {generalList}
            </DoninoColumnShell>
          </div>

          <div className="w-full max-w-full min-w-0 shrink-0 basis-full lg:w-auto lg:shrink lg:basis-auto">
            <DoninoColumnShell plaque={monoPlaque} listRef={monoRevealRef}>
              {monoList}
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
