import { useState, useRef, useEffect, useCallback } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
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

  // Жест свайпа влево/вправо на мобильных экранах (Direct GPU, 0 React re-renders)
  const trackRef = useRef<HTMLDivElement>(null)
  const [isNudging, setIsNudging] = useState(false)
  const hasInteractedRef = useRef(false)
  const nudgeTimerRef = useRef<number | null>(null)
  const nudgeEndTimerRef = useRef<number | null>(null)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const gestureLockRef = useRef<'horizontal' | 'vertical' | null>(null)
  const hadMovedRef = useRef(false)
  const gapPx = 16

  const getSlideOffset = useCallback(
    (slideIndex: number) => {
      return slideIndex === 0 ? '0%' : `calc(-100% - ${gapPx}px)`
    },
    [gapPx],
  )

  const cancelNudge = useCallback(() => {
    if (nudgeTimerRef.current !== null) {
      clearTimeout(nudgeTimerRef.current)
      nudgeTimerRef.current = null
    }
    if (nudgeEndTimerRef.current !== null) {
      clearTimeout(nudgeEndTimerRef.current)
      nudgeEndTimerRef.current = null
    }
    setIsNudging(false)
  }, [])

  const triggerNudge = useCallback(() => {
    if (hasInteractedRef.current) return
    cancelNudge()
    setIsNudging(true)
    nudgeEndTimerRef.current = window.setTimeout(() => {
      setIsNudging(false)
      nudgeEndTimerRef.current = null
    }, 750)
  }, [cancelNudge])

  // Auto-play invitation nudge on page load (after 600ms) only if not interacted
  useEffect(() => {
    if (hasInteractedRef.current) return
    nudgeTimerRef.current = window.setTimeout(() => {
      triggerNudge()
    }, 600)
    return () => {
      cancelNudge()
    }
  }, [triggerNudge, cancelNudge])

  // Плавная анимация скольжения колонок при изменении активной дисциплины
  useEffect(() => {
    if (trackRef.current && (typeof window === 'undefined' || window.innerWidth < 1024)) {
      const slideIndex = activeMobileColumn === 'coursing' ? 0 : 1
      trackRef.current.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      trackRef.current.style.transform = `translate3d(${getSlideOffset(slideIndex)}, 0, 0)`
    }
  }, [activeMobileColumn, getSlideOffset])

  const startDrag = (clientX: number, clientY: number) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) return
    hasInteractedRef.current = true
    cancelNudge()
    touchStartRef.current = { x: clientX, y: clientY, time: Date.now() }
    gestureLockRef.current = null
    hadMovedRef.current = false
    if (trackRef.current) {
      trackRef.current.style.transition = 'none'
    }
  }

  const moveDrag = (clientX: number, clientY: number) => {
    if (!touchStartRef.current || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return
    const touch = touchStartRef.current
    const dx = clientX - touch.x
    const dy = clientY - touch.y

    if (Math.abs(dx) > 7 || Math.abs(dy) > 7) {
      hadMovedRef.current = true
    }

    // Если направление еще не заблокировано, определяем вертикальный скролл vs горизонтальный свайп
    if (!gestureLockRef.current) {
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      if (absDx < 7 && absDy < 7) return
      if (absDy >= absDx) {
        gestureLockRef.current = 'vertical'
        return
      }
      gestureLockRef.current = 'horizontal'
    }

    if (gestureLockRef.current === 'horizontal' && trackRef.current) {
      const currentSlide = activeMobileColumn === 'coursing' ? 0 : 1
      const isAtLeftEdge = currentSlide === 0 && dx > 0
      const isAtRightEdge = currentSlide === 1 && dx < 0
      const appliedDx = isAtLeftEdge || isAtRightEdge ? dx * 0.22 : dx
      const base = currentSlide === 0 ? '0%' : `calc(-100% - ${gapPx}px)`
      trackRef.current.style.transform = `translate3d(calc(${base} + ${appliedDx}px), 0, 0)`
    }
  }

  const endDrag = (clientX: number) => {
    if (!touchStartRef.current || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return

    const isHorizontal = gestureLockRef.current === 'horizontal'
    const dx = clientX - touchStartRef.current.x
    const dt = Date.now() - touchStartRef.current.time
    const velocity = Math.abs(dx) / (dt || 1)

    touchStartRef.current = null
    gestureLockRef.current = null

    const track = trackRef.current
    const currentSlide = activeMobileColumn === 'coursing' ? 0 : 1

    if (isHorizontal && track) {
      const isSwipeLeft = dx < -35 || (dx < -15 && velocity > 0.2)
      const isSwipeRight = dx > 35 || (dx > 15 && velocity > 0.2)
      let targetSlide: 0 | 1 = currentSlide

      if (isSwipeLeft && currentSlide === 0) {
        targetSlide = 1
      } else if (isSwipeRight && currentSlide === 1) {
        targetSlide = 0
      }

      track.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      track.style.transform = `translate3d(${getSlideOffset(targetSlide)}, 0, 0)`

      if (targetSlide !== currentSlide) {
        handleMobileColumnChange(targetSlide === 0 ? 'coursing' : 'racing')
      }
    } else if (track) {
      track.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      track.style.transform = `translate3d(${getSlideOffset(currentSlide)}, 0, 0)`
    }
  }

  const cancelDrag = () => {
    hasInteractedRef.current = true
    cancelNudge()
    touchStartRef.current = null
    gestureLockRef.current = null
    if (trackRef.current) {
      const currentSlide = activeMobileColumn === 'coursing' ? 0 : 1
      trackRef.current.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      trackRef.current.style.transform = `translate3d(${getSlideOffset(currentSlide)}, 0, 0)`
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    startDrag(e.touches[0].clientX, e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    moveDrag(e.touches[0].clientX, e.touches[0].clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    endDrag(e.changedTouches[0].clientX)
  }

  const handleTouchCancel = () => {
    cancelDrag()
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    startDrag(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    moveDrag(e.clientX, e.clientY)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    endDrag(e.clientX)
  }

  const handleMouseLeave = () => {
    if (touchStartRef.current) {
      cancelDrag()
    }
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
    <div className="relative">
      <DoninoColumnPlaque
        asHeader
        title="Курсинг / БЗМП"
        count={filteredCombined.length}
        countClassName="pr-20 lg:pr-0"
      />
      <button
        type="button"
        onClick={() => {
          hasInteractedRef.current = true
          cancelNudge()
          handleMobileColumnChange('racing')
        }}
        className={`lg:hidden absolute top-1/2 -translate-y-1/2 right-0 z-20 inline-flex items-center gap-1 rounded-l-full border-y border-l border-camel-400/90 bg-camel-100/80 pl-3 pr-2 py-1 text-[11px] font-bold text-camel-950 shadow-md backdrop-blur-md transition-all hover:bg-camel-200 active:scale-95 cursor-pointer touch-manipulation ${
          isNudging ? 'animate-tab-nudge-left' : ''
        }`}
        title="Смахните экран или нажмите для перехода к рейсингу"
        aria-label="Перейти к рейсингу"
      >
        <span>Рейсинг</span>
        <ChevronRight className="w-3.5 h-3.5 text-camel-800 shrink-0" />
      </button>
    </div>
  )

  const racingPlaque = (
    <div className="relative">
      <DoninoColumnPlaque
        asHeader
        title="Рейсинг"
        count={filteredSpeed.length}
        titleClassName="pl-20 lg:pl-0"
      />
      <button
        type="button"
        onClick={() => {
          hasInteractedRef.current = true
          cancelNudge()
          handleMobileColumnChange('coursing')
        }}
        className={`lg:hidden absolute top-1/2 -translate-y-1/2 left-0 z-20 inline-flex items-center gap-1 rounded-r-full border-y border-r border-camel-400/90 bg-camel-100/80 pr-3 pl-2 py-1 text-[11px] font-bold text-camel-950 shadow-md backdrop-blur-md transition-all hover:bg-camel-200 active:scale-95 cursor-pointer touch-manipulation ${
          isNudging ? 'animate-tab-nudge-right' : ''
        }`}
        title="Смахните экран или нажмите для перехода к курсингу"
        aria-label="Перейти к курсингу"
      >
        <ChevronLeft className="w-3.5 h-3.5 text-camel-800 shrink-0" />
        <span>Курсинг</span>
      </button>
    </div>
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

  return (
    <div className="space-y-4">
      {/* Мобильный свайп-контейнер и десктопная двухколоночная сетка */}
      <div
        className="w-full relative overflow-x-clip lg:overflow-visible touch-pan-y select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClickCapture={(e) => {
          if (hadMovedRef.current) {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
      >
        <div
          ref={trackRef}
          className={`flex flex-nowrap w-full min-w-0 items-start gap-4 lg:grid lg:grid-cols-2 lg:gap-8 lg:!transform-none ${
            isNudging
              ? activeMobileColumn === 'coursing'
                ? 'animate-silk-nudge-left'
                : 'animate-silk-nudge-right'
              : ''
          }`}
          style={{
            transform:
              typeof window !== 'undefined' && window.innerWidth >= 1024
                ? 'none'
                : isNudging
                ? undefined
                : `translate3d(${getSlideOffset(activeMobileColumn === 'coursing' ? 0 : 1)}, 0, 0)`,
            willChange: 'transform',
          }}
        >
          {/* Слайд 1: Курсинг */}
          <div className="w-full max-w-full min-w-0 shrink-0 basis-full lg:w-auto lg:min-w-0 lg:shrink lg:basis-auto">
            <DoninoColumnShell
              plaque={coursingPlaque}
              listRef={coursingRevealRef}
            >
              {coursingList}
            </DoninoColumnShell>
          </div>

          {/* Слайд 2: Рейсинг */}
          <div className="w-full max-w-full min-w-0 shrink-0 basis-full lg:w-auto lg:min-w-0 lg:shrink lg:basis-auto">
            <DoninoColumnShell
              plaque={racingPlaque}
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
