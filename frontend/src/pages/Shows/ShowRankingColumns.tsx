import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import EmptyState from '../../components/EmptyState'
import ShowDogCard, { type ShowDogCardData } from './ShowDogCard'

interface ShowRankingColumnsProps {
  dogs: ShowDogCardData[]
  filterYear: string
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
      <div className="flex flex-col gap-2">
        {visibleDogs.map((dog, index) => (
          <ShowDogCard key={`${dog.id}-${dog.breed}`} dog={dog} rank={index + 1} />
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
