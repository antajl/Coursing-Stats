import { useState } from 'react'
import { Star } from 'lucide-react'
import DogCard, { DOG_CARD_HEIGHT_CLASS } from '../../components/DogCard'
import EmptyState from '../../components/EmptyState'
import DoninoColumnPlaque, { DoninoColumnShell } from '../SpeedRecords/DoninoColumnPlaque'
import CoursingRatingHint from './CoursingRatingHint'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { useListReveal } from '../../hooks/useListReveal'
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
      onClick={(e) => {
        e.preventDefault()
        onToggle(dogId, meta)
      }}
      className={`absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1.5 shadow-sm transition-all duration-150 hover:bg-cream-100 active:scale-90 ${
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
}

export default function TopDogsColumns({
  filteredCombined,
  filteredSpeed,
  filterYear,
  favorites,
  onToggleFavorite,
}: TopDogsColumnsProps) {
  const [selectedMobileColumn, setSelectedMobileColumn] = useState<'coursing' | 'racing' | null>(null)
  const activeMobileColumn =
    selectedMobileColumn ?? (filteredCombined.length === 0 && filteredSpeed.length > 0 ? 'racing' : 'coursing')

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

  const coursingPlaque = (
    <DoninoColumnPlaque
      asHeader
      title="Курсинг / БЗМП"
      count={filteredCombined.length}
      action={
        <span className="inline-flex items-center gap-1.5 text-xs text-old-money-700 font-medium">
          <span className="hidden sm:inline">Ранг по победам и медалям</span>
          <CoursingRatingHint embedded />
        </span>
      }
    />
  )

  const racingPlaque = (
    <DoninoColumnPlaque
      asHeader
      title="Рейсинг"
      count={filteredSpeed.length}
      action={
        <span className="inline-flex items-center gap-1 text-xs text-old-money-700 font-medium">
          <span className="hidden sm:inline">Ранг по максимальной скорости</span>
        </span>
      }
    />
  )

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
        />        <DogCard
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
        />        <DogCard dog={dog} type="speed" filterYear={filterYear} rank={dog.rank} variant="embedded" />
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
      {/* Mobile discipline switcher (< lg) */}
      <div className="lg:hidden flex items-center justify-center p-1 bg-cream-100 rounded-xl border border-old-money-200/60 shadow-sm">
        <button
          type="button"
          onClick={() => setSelectedMobileColumn('coursing')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeMobileColumn === 'coursing'
              ? 'bg-white text-charcoal-900 shadow-sm border border-old-money-200/80'
              : 'text-charcoal-600 hover:text-charcoal-900'
          }`}
        >
          <span>Курсинг / БЗМП</span>
          <CoursingRatingHint embedded />
          <span className={`h-4 min-w-[1.25rem] px-1 rounded-full text-[10px] font-bold flex items-center justify-center leading-none ${
            activeMobileColumn === 'coursing' ? 'bg-camel-100 text-camel-800' : 'bg-charcoal-200/60 text-charcoal-600'
          }`}>
            {filteredCombined.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedMobileColumn('racing')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeMobileColumn === 'racing'
              ? 'bg-white text-charcoal-900 shadow-sm border border-old-money-200/80'
              : 'text-charcoal-600 hover:text-charcoal-900'
          }`}
        >
          <span>Рейсинг</span>
          <span className={`h-4 min-w-[1.25rem] px-1 rounded-full text-[10px] font-bold flex items-center justify-center leading-none ${
            activeMobileColumn === 'racing' ? 'bg-warm-blue-100 text-warm-blue-800' : 'bg-charcoal-200/60 text-charcoal-600'
          }`}>
            {filteredSpeed.length}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
        <div className={activeMobileColumn === 'racing' ? 'hidden lg:block' : 'block'}>
          <DoninoColumnShell
            plaque={<div className="hidden lg:block">{coursingPlaque}</div>}
            listRef={coursingRevealRef}
          >
            {coursingList}
          </DoninoColumnShell>
        </div>
        <div className={activeMobileColumn === 'coursing' ? 'hidden lg:block' : 'block'}>
          <DoninoColumnShell
            plaque={<div className="hidden lg:block">{racingPlaque}</div>}
            listRef={speedRevealRef}
          >
            {speedList}
          </DoninoColumnShell>
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
