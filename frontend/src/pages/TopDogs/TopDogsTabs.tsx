import DogStatsTable from '../../components/DogStatsTable'
import EmptyState from '../../components/EmptyState'

interface TopDogsTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  filteredPlacement: unknown[]
  filteredScore: unknown[]
  filteredSpeed: unknown[]
  filterYear: string
  filterBreed: string
}

export default function TopDogsTabs({
  activeTab,
  onTabChange,
  filteredPlacement,
  filteredScore,
  filteredSpeed,
  filterYear,
  filterBreed,
}: TopDogsTabsProps) {
  const tabClass = (tab: string) =>
    `flex-1 min-w-[120px] px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
      activeTab === tab
        ? 'bg-camel-600 text-white shadow-md'
        : 'bg-cream-100 dark:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-200 dark:hover:bg-charcoal-600 hover:text-charcoal-900 dark:hover:text-charcoal-100'
    }`

  return (
    <>
      <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-gray-300 mb-4">
        <button onClick={() => onTabChange('placement')} className={tabClass('placement')}>
          По местам
        </button>
        <button onClick={() => onTabChange('score')} className={tabClass('score')}>
          По очкам
        </button>
        <button onClick={() => onTabChange('speed')} className={tabClass('speed')}>
          По скорости
        </button>
      </div>

      {filteredPlacement.length === 0 && filteredScore.length === 0 && filteredSpeed.length === 0 ? (
        <EmptyState
          title="Нет данных для выбранных фильтров"
          description="Попробуйте изменить год или убрать фильтры"
        />
      ) : activeTab === 'placement' ? (
        <DogStatsTable
          key={`placement-${filterYear}-${filterBreed}`}
          data={filteredPlacement}
          type="placement"
          filterYear={filterYear}
        />
      ) : activeTab === 'score' ? (
        <DogStatsTable
          key={`score-${filterYear}-${filterBreed}`}
          data={filteredScore}
          type="score"
          filterYear={filterYear}
        />
      ) : (
        <DogStatsTable
          key={`speed-${filterYear}-${filterBreed}`}
          data={filteredSpeed}
          type="speed"
          filterYear={filterYear}
        />
      )}
    </>
  )
}
