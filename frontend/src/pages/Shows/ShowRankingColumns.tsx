import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { useListReveal } from '../../hooks/useListReveal'
import { useHorizontalSwipe } from '../../hooks/useHorizontalSwipe'
import EmptyState from '../../components/EmptyState'
import DoninoColumnPlaque, { DoninoColumnShell } from '../SpeedRecords/DoninoColumnPlaque'
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
  const generalMobileRevealRef = useListReveal(visibleGeneral.length > 0)
  const monoMobileRevealRef = useListReveal(visibleMono.length > 0)

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

  return (
    <div className="space-y-4">
      {/* ================= ДЕСКТОПНЫЙ ВИД (>= 1024px): 2 независимые колонки ================= */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8">
        <DoninoColumnShell
          plaque={
            <DoninoColumnPlaque
              asHeader
              title={generalTitle}
              count={generalDogs.length}
            />
          }
          listRef={generalRevealRef}
        >
          {generalList}
        </DoninoColumnShell>

        <DoninoColumnShell
          plaque={
            <DoninoColumnPlaque
              asHeader
              title={monoTitle}
              count={monoDogs.length}
            />
          }
          listRef={monoRevealRef}
        >
          {monoList}
        </DoninoColumnShell>
      </div>

      {/* ================= МОБИЛЬНЫЙ ВИД (< 1024px): свайп внутри монолитного блока ================= */}
      <div className="block lg:hidden w-full">
        <div className="cs-glass-card min-w-0 overflow-hidden rounded-2xl bg-white border border-[rgba(195,168,128,0.70)] shadow-2xs">
          {/* Фиксированная шапка таблицы внутри блока */}
          <div className="donino-column-plaque relative flex h-11 min-h-[44px] items-center justify-between border-b border-[rgba(195,168,128,0.55)] bg-cream-100/90 px-3.5 select-none overflow-hidden">
            {/* Левый язычок при активном Монопородном: переход на Общий */}
            {activeMobileColumn === 'mono' && (
              <button
                type="button"
                onClick={() => handleMobileColumnChange('general')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-1 bg-[#fbf7f0]/85 text-camel-950 font-bold text-[11px] py-1 pl-2.5 pr-3 rounded-r-full border-y border-r border-camel-400/60 shadow-xs backdrop-blur-md transition-all hover:bg-camel-100/90 active:scale-95 cursor-pointer touch-manipulation select-none"
                title="Перейти: Общий зачёт"
                aria-label="Перейти: Общий зачёт"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-camel-800 shrink-0" aria-hidden />
                <span className="tracking-tight">Общий</span>
              </button>
            )}

            {/* Название активного зачёта */}
            <div className={`flex items-center gap-2 min-w-0 flex-1 ${activeMobileColumn === 'mono' ? 'pl-24' : 'pr-28'}`}>
              <h2 className="text-xs font-bold uppercase tracking-wider text-camel-800 truncate">
                {activeMobileColumn === 'general' ? 'Общий зачёт РКФ' : 'Монопородный зачёт'}
              </h2>
              <span className="text-[11px] font-medium text-charcoal-500 tabular-nums">
                ({activeMobileColumn === 'general' ? generalDogs.length : monoDogs.length})
              </span>
            </div>

            {/* Правый язычок при активном Общем: переход на Монопородный */}
            {activeMobileColumn === 'general' && (
              <button
                type="button"
                onClick={() => handleMobileColumnChange('mono')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-1 bg-[#fbf7f0]/85 text-camel-950 font-bold text-[11px] py-1 pl-3 pr-2.5 rounded-l-full border-y border-l border-camel-400/60 shadow-xs backdrop-blur-md transition-all hover:bg-camel-100/90 active:scale-95 cursor-pointer touch-manipulation select-none"
                title="Перейти: Монопородный зачёт"
                aria-label="Перейти: Монопородный зачёт"
              >
                <span className="tracking-tight">Моно (НКП)</span>
                <ChevronRight className="w-3.5 h-3.5 text-camel-800 shrink-0" aria-hidden />
              </button>
            )}
          </div>

          {/* Горизонтальный свайп списков собак внутри блока */}

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
              {/* Слайд 1: Общий зачёт */}
              <div
                ref={generalMobileRevealRef}
                className="w-full max-w-full min-w-0 shrink-0 basis-full flex flex-col bg-white divide-y divide-old-money-100 [contain:content]"
              >
                {generalList}
              </div>

              {/* Слайд 2: Монопородный зачёт */}
              <div
                ref={monoMobileRevealRef}
                className="w-full max-w-full min-w-0 shrink-0 basis-full flex flex-col bg-white divide-y divide-old-money-100 [contain:content]"
              >
                {monoList}
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
