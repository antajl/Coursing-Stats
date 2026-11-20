import { useState } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import DogCard, { DOG_CARD_HEIGHT_CLASS } from '../../components/DogCard'
import EmptyState from '../../components/EmptyState'
import DoninoColumnPlaque, { DoninoColumnShell } from '../SpeedRecords/DoninoColumnPlaque'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { useListReveal } from '../../hooks/useListReveal'
import { useHorizontalSwipe } from '../../hooks/useHorizontalSwipe'
import { parseDogName } from '../../lib/dogName'
import type { FavoriteDogMeta } from '../../hooks/useFavorites'
import type { CombinedRankingDog } from './mergeCombinedRanking'

function FavoriteCardStar({
  dogId,
  nameLat,
  nameRu,
  breed,
  isFav,
  onToggle,
}: {
  dogId: string
  nameLat: string
  nameRu?: string
  breed: string
  isFav: boolean
  onToggle: (dogId: string, meta: FavoriteDogMeta) => void
}) {
  const { primary } = parseDogName(nameLat, nameRu)
  const meta: FavoriteDogMeta = { name: primary, breed }
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onToggle(dogId, meta)
      }}
      className={`absolute right-2 bottom-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm transition-all duration-150 hover:bg-cream-100 active:scale-90 touch-manipulation before:absolute before:-inset-2 before:content-[''] ${
        isFav ? 'opacity-100' : 'opacity-40 sm:opacity-0 sm:group-hover:opacity-100'
      }`}
      title={isFav ? 'Удалить из избранного' : 'Добавить в избранное'}
      aria-label={isFav ? 'Удалить из избранного' : 'Добавить в избранное'}
    >
      <Star
        key={isFav ? `${dogId}-fav` : `${dogId}-plain`}
        className={`h-4 w-4 ${
          isFav ? 'fill-amber-400 text-amber-400 animate-favorite-star-pop' : 'text-charcoal-400'
        }`}
      />
    </button>
  )
}

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

  // Мобильный свайп внутри блока
  const {
    trackRef,
    getSlideOffset,
    startDrag,
    moveDrag,
    endDrag,
    cancelDrag,
    handleClickCapture,
  } = useHorizontalSwipe({
    activeTabsCount: 2,
    activeTabIndex: activeSlideIndex,
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
  const coursingMobileRevealRef = useListReveal(visibleCoursing.length > 0)
  const speedMobileRevealRef = useListReveal(visibleSpeed.length > 0)

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

  return (
    <div className="space-y-4">
      {/* ================= ДЕСКТОПНЫЙ ВИД (>= 1024px): 2 независимые колонки ================= */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8">
        <DoninoColumnShell
          plaque={
            <DoninoColumnPlaque
              asHeader
              title="Курсинг / БЗМП"
              count={filteredCombined.length}
            />
          }
          listRef={coursingRevealRef}
        >
          {coursingList}
        </DoninoColumnShell>

        <DoninoColumnShell
          plaque={
            <DoninoColumnPlaque
              asHeader
              title="Рейсинг"
              count={filteredSpeed.length}
            />
          }
          listRef={speedRevealRef}
        >
          {speedList}
        </DoninoColumnShell>
      </div>

      {/* ================= МОБИЛЬНЫЙ ВИД (< 1024px): свайп внутри монолитного блока ================= */}
      <div className="block lg:hidden w-full">
        <div className="cs-glass-card min-w-0 overflow-hidden rounded-2xl bg-white border border-[rgba(195,168,128,0.70)] shadow-2xs">
          {/* Фиксированная шапка таблицы внутри блока */}
          <div className="donino-column-plaque relative flex h-11 min-h-[44px] items-center justify-between border-b border-[rgba(195,168,128,0.55)] bg-cream-100/90 px-3.5 select-none overflow-hidden">
            {/* Левый язычок при активном Рейсинге: переход на Курсинг */}
            {activeMobileColumn === 'racing' && (
              <button
                type="button"
                onClick={() => handleMobileColumnChange('coursing')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-1 bg-[#fbf7f0]/85 text-camel-950 font-bold text-[11px] py-1 pl-2.5 pr-3 rounded-r-full border-y border-r border-camel-400/60 shadow-xs backdrop-blur-md transition-all hover:bg-camel-100/90 active:scale-95 cursor-pointer touch-manipulation select-none"
                title="Перейти: Курсинг"
                aria-label="Перейти: Курсинг"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-camel-800 shrink-0" aria-hidden />
                <span className="tracking-tight">Курсинг</span>
              </button>
            )}

            {/* Название активной дисциплины */}
            <div className={`flex items-center gap-2 min-w-0 flex-1 ${activeMobileColumn === 'racing' ? 'pl-24' : 'pr-24'}`}>
              <h2 className="text-xs font-bold uppercase tracking-wider text-camel-800 truncate">
                {activeMobileColumn === 'coursing' ? 'Курсинг / БЗМП' : 'Рейсинг'}
              </h2>
            </div>

            {/* Правый язычок при активном Курсинге: переход на Рейсинг */}
            {activeMobileColumn === 'coursing' && (
              <button
                type="button"
                onClick={() => handleMobileColumnChange('racing')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-1 bg-[#fbf7f0]/85 text-camel-950 font-bold text-[11px] py-1 pl-3 pr-2.5 rounded-l-full border-y border-l border-camel-400/60 shadow-xs backdrop-blur-md transition-all hover:bg-camel-100/90 active:scale-95 cursor-pointer touch-manipulation select-none"
                title="Перейти: Рейсинг"
                aria-label="Перейти: Рейсинг"
              >
                <span className="tracking-tight">Рейсинг</span>
                <ChevronRight className="w-3.5 h-3.5 text-camel-800 shrink-0" aria-hidden />
              </button>
            )}
          </div>

          {/* Горизонтальный свайп списков собак внутри блока */}
          <div
            className="w-full relative overflow-hidden touch-pan-y select-none"
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
              className="flex flex-nowrap w-full min-w-0 items-start gap-0 [transform:translateZ(0)] [backface-visibility:hidden]"
              style={{
                transform: `translate3d(${getSlideOffset(activeSlideIndex)}, 0, 0)`,
                willChange: 'transform',
              }}
            >
              {/* Слайд 1: Курсинг */}
              <div
                ref={coursingMobileRevealRef}
                className="w-full max-w-full min-w-0 shrink-0 basis-full flex flex-col bg-white divide-y divide-old-money-100 [contain:content]"
              >
                {coursingList}
              </div>

              {/* Слайд 2: Рейсинг */}
              <div
                ref={speedMobileRevealRef}
                className="w-full max-w-full min-w-0 shrink-0 basis-full flex flex-col bg-white divide-y divide-old-money-100 [contain:content]"
              >
                {speedList}
              </div>
            </div>
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
