import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { useListReveal } from '../../hooks/useListReveal'
import EmptyState from '../../components/EmptyState'
import DoninoColumnPlaque, { DoninoColumnShell } from '../SpeedRecords/DoninoColumnPlaque'
import ShowDogCard, { type ShowDogCardData } from './ShowDogCard'
import { displayBreed } from '../../lib/breedMapping'
import type { FavoriteDogMeta } from '../../hooks/useFavorites'

export type RankedShowDog = ShowDogCardData & { rank: number }

interface ShowRankingColumnsProps {
  dogs: RankedShowDog[]
  filterYear: string
  filterBreed?: string
  favorites?: Set<string>
  onToggleFavorite?: (dogId: string, meta: FavoriteDogMeta) => void
}

function dogListKey(dog: ShowDogCardData): string {
  const name = (dog.name_lat || dog.name_ru || '').toUpperCase().replace(/\s+/g, ' ').trim()
  return `${name}|${dog.breed}|${dog.id}`
}

export default function ShowRankingColumns({
  dogs,
  filterYear,
  filterBreed,
  favorites,
  onToggleFavorite,
}: ShowRankingColumnsProps) {
  const { visibleCount, loadMoreRef, hasMore } = useInfiniteScroll(dogs.length, [
    filterYear,
    filterBreed,
    dogs.length,
  ])

  const visibleDogs = dogs.slice(0, visibleCount)
  const revealRef = useListReveal(visibleDogs.length > 0)

  if (dogs.length === 0) {
    return (
      <EmptyState
        title="Нет данных для выбранных фильтров"
        description="Попробуйте изменить год или убрать фильтры"
      />
    )
  }

  const plaque = (
    <DoninoColumnPlaque
      asHeader
      title={filterBreed ? `Рейтинг выставок РКФ · ${displayBreed(filterBreed).primary || filterBreed}` : 'Рейтинг выставок РКФ'}
      count={dogs.length}
    />
  )

  return (
    <div className="space-y-4">
      <DoninoColumnShell plaque={plaque} listRef={revealRef}>
        {visibleDogs.map((dog) => (
          <ShowDogCard
            key={dogListKey(dog)}
            dog={dog}
            rank={dog.rank}
            filterYear={filterYear}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </DoninoColumnShell>

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
