import { useState, useRef, useEffect, useCallback } from 'react'
import DogCard from '../../components/DogCard'
import EmptyState from '../../components/EmptyState'

interface TopDogsTabsProps {
  activeTab: string
  filteredPlacement: unknown[]
  filteredScore: unknown[]
  filteredSpeed: unknown[]
  filterYear: string
  filterBreed: string
}

const ITEMS_PER_PAGE = 30

export default function TopDogsTabs({
  activeTab,
  filteredPlacement,
  filteredScore,
  filteredSpeed,
  filterYear,
  filterBreed,
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
