import { Link } from 'react-router-dom'
import { dogYearBadge } from '../lib/season'
import { parseDogName } from '../lib/dogName'
import { MedalIcon, type MedalVariant } from './MedalTally'
import OwnerCrownName from './OwnerCrownName'

/** Единая высота карточки в двухколоночном рейтинге (строки выравниваются попарно). */
export const DOG_CARD_HEIGHT_CLASS = 'h-[9rem]'

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

const STAT_ROW_CLASS = 'grid h-14 shrink-0 gap-2'

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex min-w-0 flex-col justify-center rounded-lg bg-cream-100 px-2 py-1.5 text-center dark:bg-charcoal-700">
      <p className="mb-0.5 truncate text-[9px] uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
        {label}
      </p>
      <p className="truncate text-sm font-bold tabular-nums text-camel-700 dark:text-camel-400">{value}</p>
    </div>
  )
}

function MedalStatBox({ variant, value }: { variant: MedalVariant; value?: number }) {
  return (
    <div className="flex min-w-0 flex-col justify-center rounded-lg bg-cream-100 px-2 py-1.5 text-center dark:bg-charcoal-700">
      <div className="mb-0.5 flex justify-center">
        <MedalIcon variant={variant} size="sm" />
      </div>
      <p className="text-sm font-bold tabular-nums text-charcoal-800 dark:text-charcoal-100">{value ?? 0}</p>
    </div>
  )
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
              label: 'Средняя',
              value: dog.avg_judge_score
                ? Number.isInteger(dog.avg_judge_score)
                  ? String(dog.avg_judge_score)
                  : dog.avg_judge_score.toFixed(1)
                : '-',
            },
            {
              label: 'Лучш. оценка',
              value: dog.best_judge_score
                ? Number.isInteger(dog.best_judge_score)
                  ? String(dog.best_judge_score)
                  : dog.best_judge_score.toFixed(1)
                : '-',
            },
            {
              label: 'Сумма (протокол)',
              value: dog.best_score
                ? Number.isInteger(dog.best_score)
                  ? String(dog.best_score)
                  : dog.best_score.toFixed(1)
                : '-',
            },
          ],
          starts: dog.total_starts || 0,
        }
      case 'speed':
        return {
          scoreStats: [
            {
              label: 'Макс., км/ч',
              value: dog.best_speed ? dog.best_speed.toFixed(1) : '-',
            },
            {
              label: 'Сред., км/ч',
              value: dog.avg_speed ? dog.avg_speed.toFixed(1) : '-',
            },
          ],
          starts: dog.total_starts || 0,
        }
    }
  }

  const stats = getStats()
  const yearBadge = dogYearBadge(dog, filterYear)

  const statsGridClass =
    type === 'speed' ? `${STAT_ROW_CLASS} grid-cols-3` : `${STAT_ROW_CLASS} grid-cols-4`

  return (
    <Link
      to={`/dog/${dog.dog_id}`}
      className={`grid ${DOG_CARD_HEIGHT_CLASS} grid-rows-[minmax(0,1fr)_3.5rem] gap-2 overflow-hidden rounded-xl border border-old-money-200 bg-white p-3 shadow-sm transition-all duration-200 hover:border-camel-300 hover:shadow-md dark:border-charcoal-600 dark:bg-charcoal-800 dark:hover:border-camel-700`}
    >
      <div className="flex min-h-0 flex-col justify-end gap-1 overflow-hidden">
        <OwnerCrownName name={primary} dogId={dog.dog_id} kind="competition">
          <h3
            className="line-clamp-2 text-sm font-bold leading-snug text-charcoal-800 dark:text-charcoal-100"
            title={secondary ? `${primary} / ${secondary}` : primary}
          >
            {primary}
          </h3>
        </OwnerCrownName>
        <div className="flex shrink-0 items-center gap-1.5 overflow-hidden">
          <span className="max-w-full truncate rounded-md bg-cream-100 px-1.5 py-0.5 text-[10px] font-medium text-charcoal-600 dark:bg-charcoal-700 dark:text-charcoal-300">
            {dog.breed}
          </span>
          {yearBadge && (
            <span
              title={yearBadge.title}
              className="shrink-0 whitespace-nowrap rounded-md bg-camel-100 px-1.5 py-0.5 text-[11px] font-semibold text-camel-700 dark:bg-charcoal-700 dark:text-camel-400"
            >
              {yearBadge.label}
            </span>
          )}
        </div>
      </div>

      <div className={`${statsGridClass} relative z-[1]`}>
        {type === 'placement' && (
          <>
            <MedalStatBox variant="gold" value={dog.gold} />
            <MedalStatBox variant="silver" value={dog.silver} />
            <MedalStatBox variant="bronze" value={dog.bronze} />
            <StatBox label="Старты" value={stats.starts} />
          </>
        )}
        {type !== 'placement' &&
          stats.scoreStats.map((stat, idx) => (
            <StatBox key={idx} label={stat.label} value={stat.value} />
          ))}
        {type !== 'placement' && <StatBox label="Старты" value={stats.starts} />}
      </div>
    </Link>
  )
}
