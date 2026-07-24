import DogCard, { DOG_CARD_HEIGHT_CLASS } from '../../components/DogCard'
import EmptyState from '../../components/EmptyState'
import DoninoColumnPlaque, { DoninoColumnShell } from '../SpeedRecords/DoninoColumnPlaque'
import CoursingRatingHint from './CoursingRatingHint'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'

function CoursingRankingToggle({
  value,
  onChange,
}: {
  value: 'placement' | 'score'
  onChange: (tab: 'placement' | 'score') => void
}) {
  const scoreActive = value === 'score'
  const placementActive = value === 'placement'

  return (
    <div
      role="group"
      aria-label="Рейтинг курсинга"
      className="inline-flex rounded-md bg-old-money-200/45 p-0.5 dark:bg-charcoal-700/70"
    >
      <button
        type="button"
        aria-pressed={placementActive}
        onClick={() => onChange('placement')}
        className={
          placementActive
            ? 'rounded px-2.5 py-0.5 text-[11px] font-semibold lowercase text-charcoal-800 bg-cream-50/90 dark:bg-charcoal-600 dark:text-charcoal-100'
            : 'rounded px-2.5 py-0.5 text-[11px] font-medium lowercase text-old-money-600 transition-colors hover:text-charcoal-700 dark:text-charcoal-400 dark:hover:text-charcoal-200'
        }
      >
        медали
      </button>
      <span
        className={
          scoreActive
            ? 'inline-flex items-center gap-0.5 rounded bg-cream-50/90 pl-2.5 pr-0.5 py-0.5 dark:bg-charcoal-600'
            : 'inline-flex items-center gap-0.5 rounded pl-2.5 pr-0.5 py-0.5'
        }
      >
        <button
          type="button"
          aria-pressed={scoreActive}
          onClick={() => onChange('score')}
          className={
            scoreActive
              ? 'text-[11px] font-semibold lowercase text-charcoal-800 dark:text-charcoal-100'
              : 'text-[11px] font-medium lowercase text-old-money-600 transition-colors hover:text-charcoal-700 dark:text-charcoal-400 dark:hover:text-charcoal-200'
          }
        >
          очки
        </button>
        <span
          className="mx-0.5 h-3 w-px shrink-0 bg-old-money-300/70 dark:bg-charcoal-500"
          aria-hidden
        />
        <CoursingRatingHint embedded />
      </span>
    </div>
  )
}

function DogCardPlaceholder({ slotKey }: { slotKey: string }) {
  return (
    <div
      key={slotKey}
      className={`${DOG_CARD_HEIGHT_CLASS} bg-transparent`}
      aria-hidden
    />
  )
}

interface TopDogsColumnsProps {
  coursingTab: 'placement' | 'score'
  onCoursingTabChange: (tab: 'placement' | 'score') => void
  filteredPlacement: unknown[]
  filteredScore: unknown[]
  filteredSpeed: unknown[]
  filterYear: string
}

export default function TopDogsColumns({
  coursingTab,
  onCoursingTabChange,
  filteredPlacement,
  filteredScore,
  filteredSpeed,
  filterYear,
}: TopDogsColumnsProps) {
  const coursingData = coursingTab === 'placement' ? filteredPlacement : filteredScore
  const coursingType = coursingTab === 'placement' ? 'placement' : 'score'
  const listLength = Math.max(coursingData.length, filteredSpeed.length)

  const { visibleCount, loadMoreRef, hasMore } = useInfiniteScroll(listLength, [
    coursingTab,
    filterYear,
    coursingData.length,
    filteredSpeed.length,
  ])

  const visibleCoursing = coursingData.slice(0, visibleCount)
  const visibleSpeed = filteredSpeed.slice(0, visibleCount)

  const emptyBoth = coursingData.length === 0 && filteredSpeed.length === 0

  if (emptyBoth) {
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
      count={coursingData.length}
      action={<CoursingRankingToggle value={coursingTab} onChange={onCoursingTabChange} />}
    />
  )

  const racingPlaque = <DoninoColumnPlaque asHeader title="Рейсинг" count={filteredSpeed.length} />

  const renderCoursingCard = (
    dog: { dog_id: number; rank?: number } | undefined,
    slotKey: string,
  ) =>
    dog ? (
      <DogCard
        key={dog.dog_id}
        dog={dog}
        type={coursingType}
        filterYear={filterYear}
        rank={dog.rank}
        variant="embedded"
      />
    ) : (
      <DogCardPlaceholder slotKey={slotKey} />
    )

  const renderSpeedCard = (dog: { dog_id: number; rank?: number } | undefined, slotKey: string) =>
    dog ? (
      <DogCard
        key={dog.dog_id}
        dog={dog}
        type="speed"
        filterYear={filterYear}
        rank={dog.rank}
        variant="embedded"
      />
    ) : (
      <DogCardPlaceholder slotKey={slotKey} />
    )

  const coursingList =
    visibleCoursing.length > 0 ? (
      visibleCoursing.map((dog: { dog_id: number; rank?: number }) =>
        renderCoursingCard(dog, `coursing-${dog.dog_id}`),
      )
    ) : (
      <p className="py-6 text-center text-sm text-charcoal-500 dark:text-charcoal-400">Нет данных</p>
    )

  const speedList =
    visibleSpeed.length > 0 ? (
      visibleSpeed.map((dog: { dog_id: number; rank?: number }) =>
        renderSpeedCard(dog, `speed-${dog.dog_id}`),
      )
    ) : (
      <p className="py-6 text-center text-sm text-charcoal-500 dark:text-charcoal-400">Нет данных</p>
    )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
        <DoninoColumnShell plaque={coursingPlaque}>{coursingList}</DoninoColumnShell>
        <DoninoColumnShell plaque={racingPlaque}>{speedList}</DoninoColumnShell>
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
