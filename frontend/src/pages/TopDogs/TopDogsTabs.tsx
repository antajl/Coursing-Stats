import { useState, useRef, useEffect, useCallback } from 'react'
import DogCard from '../../components/DogCard'
import EmptyState from '../../components/EmptyState'
import FilterSelect from '../../components/FilterSelect'

interface TopDogsTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  filteredPlacement: unknown[]
  filteredScore: unknown[]
  filteredSpeed: unknown[]
  filterYear: string
  filterBreed: string
  scoreSortBy?: 'best_score' | 'best_judge_score' | 'avg_judge_score'
  onScoreSortByChange?: (value: 'best_score' | 'best_judge_score' | 'avg_judge_score') => void
  placementSortBy?: 'gold' | 'silver' | 'bronze' | 'total'
  onPlacementSortByChange?: (value: 'gold' | 'silver' | 'bronze' | 'total') => void
  speedSortBy?: 'best_speed' | 'avg_speed'
  onSpeedSortByChange?: (value: 'best_speed' | 'avg_speed') => void
}

const TAB_CHIP =
  'h-9 items-center rounded-full border-[1.5px] px-3.5 text-xs font-semibold whitespace-nowrap transition-colors'
const TAB_CHIP_IDLE =
  'border-old-money-200 dark:border-charcoal-600 bg-cream-50 dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-700'
const TAB_CHIP_ACTIVE = 'border-camel-500 bg-camel-500 text-charcoal-900'

const ITEMS_PER_PAGE = 30

export default function TopDogsTabs({
  activeTab,
  onTabChange,
  filteredPlacement,
  filteredScore,
  filteredSpeed,
  filterYear,
  filterBreed,
  scoreSortBy,
  onScoreSortByChange,
  placementSortBy,
  onPlacementSortByChange,
  speedSortBy,
  onSpeedSortByChange,
}: TopDogsTabsProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const getCurrentData = () => {
    switch (activeTab) {
      case 'placement':
        return filteredPlacement
      case 'score':
        return filteredScore
      case 'speed':
        return filteredSpeed
      default:
        return []
    }
  }

  const currentData = getCurrentData()

  // Reset visible count when tab or filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE)
  }, [activeTab, filteredPlacement, filteredScore, filteredSpeed])

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, currentData.length))
  }, [currentData.length])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loadMore])

  const visibleData = currentData.slice(0, visibleCount)
  const hasMore = visibleCount < currentData.length

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-gray-300">
          <button
            onClick={() => onTabChange('placement')}
            className={`inline-flex ${TAB_CHIP} ${
              activeTab === 'placement' ? TAB_CHIP_ACTIVE : TAB_CHIP_IDLE
            }`}
          >
            По местам
          </button>
          <button
            onClick={() => onTabChange('score')}
            className={`inline-flex ${TAB_CHIP} ${
              activeTab === 'score' ? TAB_CHIP_ACTIVE : TAB_CHIP_IDLE
            }`}
          >
            По очкам
          </button>
          <button
            onClick={() => onTabChange('speed')}
            className={`inline-flex ${TAB_CHIP} ${
              activeTab === 'speed' ? TAB_CHIP_ACTIVE : TAB_CHIP_IDLE
            }`}
          >
            По скорости
          </button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {(activeTab === 'placement' && onPlacementSortByChange) ||
           (activeTab === 'score' && onScoreSortByChange) ||
           (activeTab === 'speed' && onSpeedSortByChange) ? (
            <>
              <span className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400">Сортировка:</span>
              {activeTab === 'placement' && onPlacementSortByChange && (
                <FilterSelect
                  ariaLabel="Сортировка по местам"
                  value={placementSortBy || 'gold'}
                  onChange={onPlacementSortByChange}
                  options={[
                    { value: 'gold', label: 'Золото' },
                    { value: 'silver', label: 'Серебро' },
                    { value: 'bronze', label: 'Бронза' },
                    { value: 'total', label: 'Всего' }
                  ]}
                  className="min-w-[120px]"
                />
              )}
              {activeTab === 'score' && onScoreSortByChange && (
                <FilterSelect
                  ariaLabel="Сортировка по очкам"
                  value={scoreSortBy || 'best_score'}
                  onChange={onScoreSortByChange}
                  options={[
                    { value: 'best_score', label: 'Лучший результат' },
                    { value: 'best_judge_score', label: 'Лучшая оценка' },
                    { value: 'avg_judge_score', label: 'Средняя оценка' }
                  ]}
                  className="min-w-[120px]"
                />
              )}
              {activeTab === 'speed' && onSpeedSortByChange && (
                <FilterSelect
                  ariaLabel="Сортировка по скорости"
                  value={speedSortBy || 'best_speed'}
                  onChange={onSpeedSortByChange}
                  options={[
                    { value: 'best_speed', label: 'Лучшая' },
                    { value: 'avg_speed', label: 'Средняя' }
                  ]}
                  className="min-w-[120px]"
                />
              )}
            </>
          ) : null}
        </div>
      </div>

      {currentData.length === 0 ? (
        <EmptyState
          title="Нет данных для выбранных фильтров"
          description="Попробуйте изменить год или убрать фильтры"
        />
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {visibleData.map((dog: any) => (
            <DogCard
              key={dog.dog_id}
              dog={dog}
              type={activeTab as 'placement' | 'score' | 'speed'}
              filterYear={filterYear}
            />
          ))}
          {hasMore && (
            <div ref={loadMoreRef} className="py-4 text-center text-sm text-charcoal-500 dark:text-charcoal-400">
              Загрузка...
            </div>
          )}
        </div>
      )}
    </>
  )
}
