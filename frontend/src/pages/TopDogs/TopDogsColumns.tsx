import { useState, useRef, useEffect } from 'react'
import { Star } from 'lucide-react'
import DogCard, { DOG_CARD_HEIGHT_CLASS } from '../../components/DogCard'
import EmptyState from '../../components/EmptyState'
import DoninoColumnPlaque, { DoninoColumnShell } from '../SpeedRecords/DoninoColumnPlaque'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { useListReveal } from '../../hooks/useListReveal'
import { parseDogName } from '../../lib/dogName'
import type { FavoriteDogMeta } from '../../hooks/useFavorites'
import type { CombinedRankingDog } from './mergeCombinedRanking'

function FavoriteCardStar({
  dogId,
  nameLat,
  nameRu,
  breed,
  isFav,
  onToggle,
}: {
  dogId: string
  nameLat: string
  nameRu?: string
  breed: string
  isFav: boolean
  onToggle: (dogId: string, meta: FavoriteDogMeta) => void
}) {
  const { primary } = parseDogName(nameLat, nameRu)
  const meta: FavoriteDogMeta = { name: primary, breed }
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onToggle(dogId, meta)
      }}
      className={`absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm transition-all duration-150 hover:bg-cream-100 active:scale-90 touch-manipulation before:absolute before:-inset-2 before:content-[''] ${
        isFav ? 'opacity-100' : 'opacity-40 sm:opacity-0 sm:group-hover:opacity-100'
      }`}
      title={isFav ? 'Удалить из избранного' : 'Добавить в избранное'}
      aria-label={isFav ? 'Удалить из избранного' : 'Добавить в избранное'}
    >
      <Star
        key={isFav ? `${dogId}-fav` : `${dogId}-plain`}
        className={`h-4 w-4 ${
          isFav ? 'fill-amber-400 text-amber-400 animate-favorite-star-pop' : 'text-charcoal-400'
        }`}
      />
    </button>
  )
}

function DogCardPlaceholder({ slotKey }: { slotKey: string }) {
  return <div key={slotKey} className={`${DOG_CARD_HEIGHT_CLASS} bg-transparent`} aria-hidden />
}

interface TopDogsColumnsProps {
  filteredCombined: CombinedRankingDog[]
  filteredSpeed: unknown[]
  filterYear: string
  favorites: Set<string>
  onToggleFavorite: (dogId: string, meta?: FavoriteDogMeta) => void
  disclaimerMode?: string
  activeMobileColumn?: 'coursing' | 'racing'
  onMobileColumnChange?: (col: 'coursing' | 'racing') => void
}

export default function TopDogsColumns({
  filteredCombined,
  filteredSpeed,
  filterYear,
  favorites,
  onToggleFavorite,
  activeMobileColumn: activeMobileColumnProp,
  onMobileColumnChange: onMobileColumnChangeProp,
}: TopDogsColumnsProps) {
  const [selectedMobileColumn, setSelectedMobileColumn] = useState<'coursing' | 'racing' | null>(null)
  const activeMobileColumn =
    activeMobileColumnProp ??
    selectedMobileColumn ??
    (filteredCombined.length === 0 && filteredSpeed.length > 0 ? 'racing' : 'coursing')
  const handleMobileColumnChange = onMobileColumnChangeProp ?? setSelectedMobileColumn

  // Жест свайпа влево/вправо на мобильных экранах
  const [dragOffset, setDragOffset] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const gestureLockRef = useRef<'horizontal' | 'vertical' | null>(null)
  const transitionTimeoutRef = useRef<number | null>(null)
  const hadMovedRef = useRef(false)

  // Плавная анимация скольжения колонок при изменении активной дисциплины
  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 320)
    return () => clearTimeout(timer)
  }, [activeMobileColumn])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) return
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
    gestureLockRef.current = null
    hadMovedRef.current = false
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
      transitionTimeoutRef.current = null
    }
    setIsTransitioning(false)
    setDragOffset(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return
    const touch = e.touches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y

    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      hadMovedRef.current = true
    }

    // Если направление еще не заблокировано, определяем вертикальный скролл vs горизонтальный свайп
    if (!gestureLockRef.current) {
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      if (absDx < 8 && absDy < 8) return
      if (absDy >= absDx) {
        // Вертикальный скролл страницы: не перехватываем жест
        gestureLockRef.current = 'vertical'
        return
      }
      gestureLockRef.current = 'horizontal'
    }

    if (gestureLockRef.current === 'horizontal') {
      // Упругое сопротивление (rubber-band) при попытке свайпа за край
      const isAtLeftEdge = activeMobileColumn === 'coursing' && dx > 0
      const isAtRightEdge = activeMobileColumn === 'racing' && dx < 0
      const appliedDx = isAtLeftEdge || isAtRightEdge ? dx * 0.22 : dx
      setDragOffset(appliedDx)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return

    const isHorizontal = gestureLockRef.current === 'horizontal'
    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dt = Date.now() - touchStartRef.current.time
    const velocity = Math.abs(dx) / (dt || 1)

    touchStartRef.current = null
    gestureLockRef.current = null

    if (isHorizontal) {
      const isSwipeLeft = dx < -45 || (dx < -20 && velocity > 0.25)
      const isSwipeRight = dx > 45 || (dx > 20 && velocity > 0.25)

      setIsTransitioning(true)
      setDragOffset(null)

      if (activeMobileColumn === 'coursing' && isSwipeLeft) {
        handleMobileColumnChange('racing')
      } else if (activeMobileColumn === 'racing' && isSwipeRight) {
        handleMobileColumnChange('coursing')
      }

      transitionTimeoutRef.current = window.setTimeout(() => {
        setIsTransitioning(false)
        hadMovedRef.current = false
      }, 320)
    } else {
      setDragOffset(null)
      hadMovedRef.current = false
    }
  }

  const handleTouchCancel = () => {
    touchStartRef.current = null
    gestureLockRef.current = null
    setDragOffset(null)
    hadMovedRef.current = false
  }

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
      title="Курсинг / БЗМП"
      count={filteredCombined.length}
    />
  )

  const racingPlaque = (
    <DoninoColumnPlaque
      asHeader
      title="Рейсинг"
      count={filteredSpeed.length}
    />
  )

  const renderCoursingCard = (dog: CombinedRankingDog, slotKey: string) =>
    dog ? (
      <div key={dog.dog_id} data-list-item className="relative group">
        <FavoriteCardStar
          dogId={String(dog.dog_id)}
          nameLat={dog.name_lat}
          nameRu={dog.name_ru}
          breed={dog.breed}
          isFav={favorites.has(String(dog.dog_id))}
          onToggle={onToggleFavorite}
        />
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
        <FavoriteCardStar
          dogId={String(dog.dog_id)}
          nameLat={dog.name_lat}
          nameRu={dog.name_ru}
          breed={dog.breed}
          isFav={favorites.has(String(dog.dog_id))}
          onToggle={onToggleFavorite}
        />
        <DogCard dog={dog} type="speed" filterYear={filterYear} rank={dog.rank} variant="embedded" />
      </div>
    ) : (
      <DogCardPlaceholder slotKey={slotKey} />
    )

  const coursingList =
    visibleCoursing.length > 0 ? (
      visibleCoursing.map((dog) => renderCoursingCard(dog, `coursing-${dog.dog_id}`))
    ) : (
      <p className="py-6 text-center text-sm text-charcoal-500">Нет данных</p>
    )

  const speedList =
    visibleSpeed.length > 0 ? (
      visibleSpeed.map((dog: any) => renderSpeedCard(dog, `speed-${dog.dog_id}`))
    ) : (
      <p className="py-6 text-center text-sm text-charcoal-500">Нет данных</p>
    )

  const isDragging = dragOffset !== null && dragOffset !== 0
  const isAnimating = isDragging || isTransitioning
  const mobileTransform = `translateX(calc(${activeMobileColumn === 'coursing' ? '0%' : '-100%'} + ${dragOffset ?? 0}px))`

  return (
    <div className="space-y-4">
      {/* Мобильный свайп-контейнер и десктопная двухколоночная сетка */}
      <div
        className="w-full relative overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onClickCapture={(e) => {
          if (hadMovedRef.current) {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
      >
        <div
          className={`flex w-full items-start lg:grid lg:grid-cols-2 lg:gap-8 lg:!transform-none ${
            isDragging ? '' : 'transition-transform duration-300 ease-out'
          }`}
          style={{
            transform: typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'none' : mobileTransform,
          }}
        >
          {/* Слайд 1: Курсинг */}
          <div
            className={`w-full shrink-0 lg:w-auto lg:shrink transition-opacity duration-200 ${
              !isAnimating && activeMobileColumn === 'racing'
                ? 'h-0 overflow-hidden opacity-0 lg:h-auto lg:overflow-visible lg:opacity-100'
                : 'h-auto opacity-100'
            }`}
          >
            <DoninoColumnShell
              plaque={<div className="hidden lg:block">{coursingPlaque}</div>}
              listRef={coursingRevealRef}
            >
              {coursingList}
            </DoninoColumnShell>
          </div>

          {/* Слайд 2: Рейсинг */}
          <div
            className={`w-full shrink-0 lg:w-auto lg:shrink transition-opacity duration-200 ${
              !isAnimating && activeMobileColumn === 'coursing'
                ? 'h-0 overflow-hidden opacity-0 lg:h-auto lg:overflow-visible lg:opacity-100'
                : 'h-auto opacity-100'
            }`}
          >
            <DoninoColumnShell
              plaque={<div className="hidden lg:block">{racingPlaque}</div>}
              listRef={speedRevealRef}
            >
              {speedList}
            </DoninoColumnShell>
          </div>
        </div>
      </div>

      {hasMore && (
        <div
          ref={loadMoreRef}
          className="py-4 text-center text-sm text-charcoal-500"
        >
          Загрузка…
        </div>
      )}
    </div>
  )
}
