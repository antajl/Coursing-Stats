import { Link } from 'react-router-dom'

interface DogCardProps {
  dog: {
    dog_id: number
    name_lat: string
    name_ru?: string
    breed: string
    year?: number
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
  // Split names that contain "/" (e.g., "RUSSIAN /ENGLISH")
  const getDisplayName = (name: string | undefined) => {
    if (!name) return ''
    const parts = name.split('/')
    return parts[0].trim()
  }

  const displayName = getDisplayName(dog.name_lat)
  const displayRuName = dog.name_ru ? getDisplayName(dog.name_ru) : ''

  const getStats = () => {
    switch (type) {
      case 'placement':
        return {
          scoreStats: [
            { label: 'Медали', value: `${dog.gold || 0}🥇 ${dog.silver || 0}🥈 ${dog.bronze || 0}🥉` }
          ],
          starts: dog.total_starts || 0
        }
      case 'score':
        return {
          scoreStats: [
            { label: 'Лучший результат', value: dog.best_score ? Number.isInteger(dog.best_score) ? dog.best_score : dog.best_score.toFixed(1) : '-' },
            { label: 'Лучшая оценка', value: dog.best_judge_score ? Number.isInteger(dog.best_judge_score) ? dog.best_judge_score : dog.best_judge_score.toFixed(1) : '-' },
            { label: 'Средняя оценка', value: dog.avg_judge_score ? Number.isInteger(dog.avg_judge_score) ? dog.avg_judge_score : dog.avg_judge_score.toFixed(1) : '-' }
          ],
          starts: dog.total_starts || 0
        }
      case 'speed':
        return {
          scoreStats: [
            { label: 'Скорость', value: dog.best_speed ? `${dog.best_speed.toFixed(1)} км/ч` : '-' },
            { label: 'Средняя', value: dog.avg_speed ? `${dog.avg_speed.toFixed(1)} км/ч` : '-' }
          ],
          starts: dog.total_starts || 0
        }
    }
  }

  const stats = getStats()

  return (
    <Link
      to={`/dog/${dog.dog_id}`}
      className="flex items-center gap-3 rounded-xl border-2 border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 p-3 shadow-sm hover:shadow-md hover:border-camel-300 dark:hover:border-camel-700 transition-all duration-200"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-bold text-charcoal-800 dark:text-charcoal-100 truncate">
            {displayName}
          </h3>
          {displayRuName && displayRuName !== displayName && (
            <span className="text-xs text-charcoal-500 dark:text-charcoal-400 truncate">
              ({displayRuName})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded-md bg-cream-100 dark:bg-charcoal-700 text-[10px] font-medium text-charcoal-600 dark:text-charcoal-300 whitespace-nowrap">
            {dog.breed}
          </span>
          {dog.year && (
            <span className="text-[10px] text-charcoal-500 dark:text-charcoal-400">
              {dog.year}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2">
          {stats.scoreStats.map((stat, idx) => (
            <div key={idx} className="bg-cream-100 dark:bg-charcoal-700 rounded-lg px-3 py-2 text-center min-w-[70px]">
              <p className="text-[9px] text-charcoal-500 dark:text-charcoal-400 mb-0.5 uppercase tracking-wide">{stat.label}</p>
              <p className="text-sm font-bold text-camel-700 dark:text-camel-400">{stat.value}</p>
            </div>
          ))}
          {stats.starts && (
            <>
              <div className="w-px h-8 bg-gray-300 dark:bg-charcoal-600"></div>
              <div className="bg-old-money-100 dark:bg-charcoal-600 rounded-lg px-3 py-2 text-center min-w-[70px]">
                <p className="text-[9px] text-charcoal-500 dark:text-charcoal-400 mb-0.5 uppercase tracking-wide">Старты</p>
                <p className="text-sm font-bold text-charcoal-700 dark:text-charcoal-200">{stats.starts}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
