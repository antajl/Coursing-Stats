import { Star } from 'lucide-react'
import { parseDogName } from '../../lib/dogName'
import type { FavoriteDogMeta } from '../../hooks/useFavorites'

export interface FavoriteCardStarProps {
  dogId: string
  nameLat: string
  nameRu?: string
  breed: string
  isFav: boolean
  onToggle: (dogId: string, meta: FavoriteDogMeta) => void
  className?: string
}

/**
 * Единая кнопка «Избранного» в правом нижнем углу карточки рейтинга с тач-зоной >= 44px.
 */
export function FavoriteCardStar({
  dogId,
  nameLat,
  nameRu,
  breed,
  isFav,
  onToggle,
  className = '',
}: FavoriteCardStarProps) {
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
      className={`absolute right-2 bottom-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm transition-all duration-150 hover:bg-cream-100 active:scale-90 touch-manipulation before:absolute before:-inset-2 before:content-[''] ${
        isFav ? 'opacity-100' : 'opacity-40 sm:opacity-0 sm:group-hover:opacity-100'
      } ${className}`.trim()}
      title={isFav ? 'Удалить из избранного' : 'Добавить в избранное'}
      aria-label={isFav ? 'Удалить из избранного' : 'Добавить в избранное'}
    >
      <Star
        key={isFav ? `${dogId}-fav` : `${dogId}-plain`}
        className={`h-4 w-4 ${
          isFav ? 'fill-amber-400 text-amber-400 animate-favorite-star-pop' : 'text-charcoal-400'
        }`}
        aria-hidden
      />
    </button>
  )
}
