import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import EmptyState from '../../components/EmptyState'
import ShowDogCard, { type ShowDogCardData } from './ShowDogCard'

export type RankedShowDog = ShowDogCardData & { rank: number }

interface ShowRankingColumnsProps {
  dogs: RankedShowDog[]
  filterYear: string
}

function dogListKey(dog: ShowDogCardData): string {
  // RKF ring id не уникален — ключ по кличке + породе + id
  const name = (dog.name_lat || dog.name_ru || '').toUpperCase().replace(/\s+/g, ' ').trim()
  return `${name}|${dog.breed}|${dog.id}`
}

export default function ShowRankingColumns({ dogs, filterYear }: ShowRankingColumnsProps) {
  const { visibleCount, loadMoreRef, hasMore } = useInfiniteScroll(dogs.length, [
    filterYear,
    dogs.length,
  ])

  const visibleDogs = dogs.slice(0, visibleCount)

  if (dogs.length === 0) {
    return (
      <EmptyState
        title="Нет данных для выбранных фильтров"
        description="Попробуйте изменить год или убрать фильтры"
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid min-w-0 grid-cols-1 gap-2">
        {visibleDogs.map((dog) => (
          <ShowDogCard key={dogListKey(dog)} dog={dog} rank={dog.rank} filterYear={filterYear} />
        ))}
      </div>

      {hasMore && (
        <div
          ref={loadMoreRef}
          className="py-4 text-center text-sm text-charcoal-500 dark:text-charcoal-400"
        >
          Загрузка…
        </div>
      )}
    </div>
  )
}
