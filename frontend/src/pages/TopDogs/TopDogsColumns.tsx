import { Star } from 'lucide-react'
import DogCard, { DOG_CARD_HEIGHT_CLASS } from '../../components/DogCard'
import EmptyState from '../../components/EmptyState'
import DoninoColumnPlaque, { DoninoColumnShell } from '../SpeedRecords/DoninoColumnPlaque'
import CoursingRatingHint from './CoursingRatingHint'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { useListReveal } from '../../hooks/useListReveal'
import type { CombinedRankingDog } from './mergeCombinedRanking'

function DogCardPlaceholder({ slotKey }: { slotKey: string }) {
  return <div key={slotKey} className={`${DOG_CARD_HEIGHT_CLASS} bg-transparent`} aria-hidden />
}

interface TopDogsColumnsProps {
  filteredCombined: CombinedRankingDog[]
  filteredSpeed: unknown[]
  filterYear: string
  favorites: Set<string>
  onToggleFavorite: (dogId: string) => void
}

export default function TopDogsColumns({
  filteredCombined,
  filteredSpeed,
  filterYear,
  favorites,
  onToggleFavorite,
}: TopDogsColumnsProps) {
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
      title="Курсинг/БЗМП"
      count={filteredCombined.length}
      action={
        <span className="inline-flex items-center gap-1 text-[11px] text-old-money-600 dark:text-charcoal-400">
          Elo → CS → медали
          <CoursingRatingHint embedded />
        </span>
      }
    />
  )

  const racingPlaque = <DoninoColumnPlaque asHeader title="Рейсинг" count={filteredSpeed.length} />

  const renderCoursingCard = (dog: CombinedRankingDog, slotKey: string) =>
    dog ? (
      <div key={dog.dog_id} data-list-item className="relative group">
        <button
          onClick={(e) => {
            e.preventDefault()
            onToggleFavorite(String(dog.dog_id))
          }}
          className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1.5 shadow-sm transition-colors hover:bg-cream-100 dark:bg-charcoal-800/90 dark:hover:bg-charcoal-700 opacity-0 group-hover:opacity-100"
          title={favorites.has(String(dog.dog_id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
        >
          <Star
            className={`h-4 w-4 ${
              favorites.has(String(dog.dog_id))
                ? 'fill-amber-400 text-amber-400'
                : 'text-charcoal-400'
            }`}
          />
        </button>
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
        <button
          onClick={(e) => {
            e.preventDefault()
            onToggleFavorite(String(dog.dog_id))
          }}
          className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1.5 shadow-sm transition-colors hover:bg-cream-100 dark:bg-charcoal-800/90 dark:hover:bg-charcoal-700 opacity-0 group-hover:opacity-100"
          title={favorites.has(String(dog.dog_id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
        >
          <Star
            className={`h-4 w-4 ${
              favorites.has(String(dog.dog_id))
                ? 'fill-amber-400 text-amber-400'
                : 'text-charcoal-400'
            }`}
          />
        </button>
        <DogCard dog={dog} type="speed" filterYear={filterYear} rank={dog.rank} variant="embedded" />
      </div>
    ) : (
      <DogCardPlaceholder slotKey={slotKey} />
    )

  const coursingList =
    visibleCoursing.length > 0 ? (
      visibleCoursing.map((dog) => renderCoursingCard(dog, `coursing-${dog.dog_id}`))
    ) : (
      <p className="py-6 text-center text-sm text-charcoal-500 dark:text-charcoal-400">Нет данных</p>
    )

  const speedList =
    visibleSpeed.length > 0 ? (
      visibleSpeed.map((dog: any) => renderSpeedCard(dog, `speed-${dog.dog_id}`))
    ) : (
      <p className="py-6 text-center text-sm text-charcoal-500 dark:text-charcoal-400">Нет данных</p>
    )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
        <DoninoColumnShell plaque={coursingPlaque} listRef={coursingRevealRef}>
          {coursingList}
        </DoninoColumnShell>
        <DoninoColumnShell plaque={racingPlaque} listRef={speedRevealRef}>
          {speedList}
        </DoninoColumnShell>
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
