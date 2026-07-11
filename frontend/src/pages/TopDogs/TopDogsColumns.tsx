import type { ReactNode } from 'react'
import DogCard, { DOG_CARD_HEIGHT_CLASS } from '../../components/DogCard'
import EmptyState from '../../components/EmptyState'
import DoninoColumnPlaque from '../SpeedRecords/DoninoColumnPlaque'
import CoursingRatingHint from './CoursingRatingHint'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'

const COURSING_RANKING_OPTIONS = [
  { value: 'score', label: 'очки' },
  { value: 'placement', label: 'места' },
] as const

function CoursingRankingToggle({
  value,
  onChange,
}: {
  value: 'placement' | 'score'
  onChange: (tab: 'placement' | 'score') => void
}) {
  const scoreActive = value === 'score'

  return (
    <div
      role="group"
      aria-label="Рейтинг курсинга"
      className="inline-flex rounded-md bg-old-money-200/45 p-0.5 dark:bg-charcoal-700/70"
    >
      {COURSING_RANKING_OPTIONS.map((option) =>
        option.value === 'score' ? (
          <span
            key={option.value}
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
              {option.label}
            </button>
            <span
              className="mx-0.5 h-3 w-px shrink-0 bg-old-money-300/70 dark:bg-charcoal-500"
              aria-hidden
            />
            <CoursingRatingHint embedded />
          </span>
        ) : (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={
              value === option.value
                ? 'rounded px-2.5 py-0.5 text-[11px] font-semibold lowercase text-charcoal-800 bg-cream-50/90 dark:bg-charcoal-600 dark:text-charcoal-100'
                : 'rounded px-2.5 py-0.5 text-[11px] font-medium lowercase text-old-money-600 transition-colors hover:text-charcoal-700 dark:text-charcoal-400 dark:hover:text-charcoal-200'
            }
          >
            {option.label}
          </button>
        ),
      )}
    </div>
  )
}

function DogCardPlaceholder({ slotKey }: { slotKey: string }) {
  return (
    <div
      key={slotKey}
      className={`${DOG_CARD_HEIGHT_CLASS} rounded-xl border border-transparent`}
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
  const rowCount = Math.max(visibleCoursing.length, visibleSpeed.length)

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
      title="Курсинг/БЗМП"
      count={coursingData.length}
      action={<CoursingRankingToggle value={coursingTab} onChange={onCoursingTabChange} />}
    />
  )

  const racingPlaque = <DoninoColumnPlaque title="Рейсинг" count={filteredSpeed.length} />

  const renderCoursingCard = (dog: { dog_id: number } | undefined, slotKey: string) =>
    dog ? (
      <DogCard key={dog.dog_id} dog={dog} type={coursingType} filterYear={filterYear} />
    ) : (
      <DogCardPlaceholder slotKey={slotKey} />
    )

  const renderSpeedCard = (dog: { dog_id: number } | undefined, slotKey: string) =>
    dog ? (
      <DogCard key={dog.dog_id} dog={dog} type="speed" filterYear={filterYear} />
    ) : (
      <DogCardPlaceholder slotKey={slotKey} />
    )

  return (
    <div className="space-y-4">
      {/* Мобила: две колонки друг под другом */}
      <div className="space-y-6 lg:hidden">
        <section className="min-w-0">
          {coursingPlaque}
          <div className="flex flex-col gap-2">
            {visibleCoursing.length > 0 ? (
              visibleCoursing.map((dog: { dog_id: number }) =>
                renderCoursingCard(dog, `coursing-${dog.dog_id}`)
              )
            ) : (
              <p className="py-6 text-center text-sm text-charcoal-500 dark:text-charcoal-400">Нет данных</p>
            )}
          </div>
        </section>
        <section className="min-w-0">
          {racingPlaque}
          <div className="flex flex-col gap-2">
            {visibleSpeed.length > 0 ? (
              visibleSpeed.map((dog: { dog_id: number }) => renderSpeedCard(dog, `speed-${dog.dog_id}`))
            ) : (
              <p className="py-6 text-center text-sm text-charcoal-500 dark:text-charcoal-400">Нет данных</p>
            )}
          </div>
        </section>
      </div>

      {/* Десктоп: плашки и строки карточек в одной сетке — одинаковая высота строк */}
      <div className="hidden lg:block">
        <div className="mb-3 grid grid-cols-2 gap-8">
          {coursingPlaque}
          {racingPlaque}
        </div>
        <div className="flex flex-col gap-2">
          {rowCount > 0 ? (
            Array.from({ length: rowCount }, (_, index) => (
              <div key={index} className="grid grid-cols-2 gap-8">
                {renderCoursingCard(
                  visibleCoursing[index] as { dog_id: number } | undefined,
                  `coursing-row-${index}`
                )}
                {renderSpeedCard(
                  visibleSpeed[index] as { dog_id: number } | undefined,
                  `speed-row-${index}`
                )}
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-sm text-charcoal-500 dark:text-charcoal-400">Нет данных</p>
          )}
        </div>
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
