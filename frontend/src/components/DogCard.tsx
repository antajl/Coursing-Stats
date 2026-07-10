import { Link } from 'react-router-dom'
import { dogYearBadge } from '../lib/season'
import { parseDogName } from '../lib/dogName'
import MedalTally from './MedalTally'
import OwnerCrownName from './OwnerCrownName'

interface DogCardProps {
  dog: {
    dog_id: number
    name_lat: string
    name_ru?: string
    breed: string
    year?: number
    year_from?: number
    year_to?: number
    gold?: number
    silver?: number
    bronze?: number
    total_starts?: number
    best_score?: number
    avg_judge_score?: number
    best_judge_score?: number
    best_speed?: number
    avg_speed?: number
  }
  type: 'placement' | 'score' | 'speed'
  filterYear: string
}

export default function DogCard({ dog, type, filterYear }: DogCardProps) {
  const { primary, secondary } = parseDogName(dog.name_lat, dog.name_ru)

  const getStats = () => {
    switch (type) {
      case 'placement':
        return {
          scoreStats: [] as { label: string; value: string }[],
          starts: dog.total_starts || 0,
        }
      case 'score':
        return {
          scoreStats: [
            {
              label: 'Лучший результат',
              value: dog.best_score
                ? Number.isInteger(dog.best_score)
                  ? String(dog.best_score)
                  : dog.best_score.toFixed(1)
                : '-',
            },
            {
              label: 'Лучшая оценка',
              value: dog.best_judge_score
                ? Number.isInteger(dog.best_judge_score)
                  ? String(dog.best_judge_score)
                  : dog.best_judge_score.toFixed(1)
                : '-',
            },
            {
              label: 'Средняя оценка',
              value: dog.avg_judge_score
                ? Number.isInteger(dog.avg_judge_score)
                  ? String(dog.avg_judge_score)
                  : dog.avg_judge_score.toFixed(1)
                : '-',
            },
          ],
          starts: dog.total_starts || 0,
        }
      case 'speed':
        return {
          scoreStats: [
            {
              label: 'Скорость',
              value: dog.best_speed ? `${dog.best_speed.toFixed(1)} км/ч` : '-',
            },
            {
              label: 'Средняя',
              value: dog.avg_speed ? `${dog.avg_speed.toFixed(1)} км/ч` : '-',
            },
          ],
          starts: dog.total_starts || 0,
        }
    }
  }

  const stats = getStats()
  const yearBadge = dogYearBadge(dog, filterYear)

  return (
    <Link
      to={`/dog/${dog.dog_id}`}
      className="flex flex-col gap-2 rounded-xl border border-old-money-200 bg-white p-3 shadow-sm transition-all duration-200 hover:border-camel-300 hover:shadow-md dark:border-charcoal-600 dark:bg-charcoal-800 dark:hover:border-camel-700 sm:flex-row sm:items-center sm:gap-3"
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <OwnerCrownName name={primary} dogId={dog.dog_id} kind="competition">
            <h3 className="break-words text-sm font-bold leading-snug text-charcoal-800 line-clamp-2 dark:text-charcoal-100">
              {primary}
            </h3>
          </OwnerCrownName>
          {secondary && (
            <span className="break-words text-xs text-charcoal-400 dark:text-charcoal-500">
              {secondary}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="whitespace-nowrap rounded-md bg-cream-100 px-1.5 py-0.5 text-[10px] font-medium text-charcoal-600 dark:bg-charcoal-700 dark:text-charcoal-300">
            {dog.breed}
          </span>
          {yearBadge && (
            <span
              title={yearBadge.title}
              className="whitespace-nowrap rounded-md bg-camel-100 px-1.5 py-0.5 text-[11px] font-semibold text-camel-700 dark:bg-charcoal-700 dark:text-camel-400"
            >
              {yearBadge.label}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-4">
        {type === 'placement' && (
          <MedalTally gold={dog.gold} silver={dog.silver} bronze={dog.bronze} size="md" />
        )}
        {stats.scoreStats.map((stat, idx) => (
          <div
            key={idx}
            className="rounded-lg bg-cream-100 px-3 py-2 text-center dark:bg-charcoal-700"
          >
            <p className="mb-0.5 text-[9px] uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
              {stat.label}
            </p>
            <p className="text-sm font-bold text-camel-700 dark:text-camel-400">{stat.value}</p>
          </div>
        ))}
        {stats.starts > 0 && (
          <>
            {(type === 'placement' || stats.scoreStats.length > 0) && (
              <div className="hidden h-8 w-px bg-gray-300 dark:bg-charcoal-600 sm:block" />
            )}
            <div className="rounded-lg bg-old-money-100 px-3 py-2 text-center dark:bg-charcoal-600">
              <p className="mb-0.5 text-[9px] uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
                Старты
              </p>
              <p className="text-sm font-bold text-charcoal-700 dark:text-charcoal-200">{stats.starts}</p>
            </div>
          </>
        )}
      </div>
    </Link>
  )
}
