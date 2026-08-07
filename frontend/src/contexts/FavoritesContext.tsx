import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi } from '../lib/authApi'
import {
  addLocalStorageFavorite,
  getLocalStorageFavorites,
  removeLocalStorageFavorite,
  useAuth,
} from './AuthContext'

const ACTIVE_FAVORITE_KEY = 'coursing_active_favorite'

export type FavoriteDogMeta = { name: string; breed: string }

export function getActiveFavoriteId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_FAVORITE_KEY)
  } catch {
    return null
  }
}

export function setActiveFavoriteId(dogId: string | null): void {
  try {
    if (dogId) localStorage.setItem(ACTIVE_FAVORITE_KEY, dogId)
    else localStorage.removeItem(ACTIVE_FAVORITE_KEY)
  } catch {
    /* ignore */
  }
}

type FavoritesContextValue = {
  favorites: Set<string>
  favoriteIds: string[]
  activeId: string | null
  ready: boolean
  isFavorite: (dogId: string | number) => boolean
  toggleFavorite: (dogId: string | number, meta?: FavoriteDogMeta) => Promise<void>
  setActive: (dogId: string) => void
  getMeta: (dogId: string) => FavoriteDogMeta | undefined
  setMeta: (dogId: string, meta: FavoriteDogMeta) => void
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set(getLocalStorageFavorites()))
  const [activeId, setActiveId] = useState<string | null>(() => getActiveFavoriteId())
  const [metaById, setMetaById] = useState<Record<string, FavoriteDogMeta>>({})
  const [ready, setReady] = useState(!isAuthenticated)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!isAuthenticated) {
        const local = getLocalStorageFavorites()
        if (!cancelled) {
          setFavorites(new Set(local))
          const active = getActiveFavoriteId()
          setActiveId(active && local.includes(active) ? active : local[0] ?? null)
          setReady(true)
        }
        return
      }
      try {
        const { favorites: ids } = await authApi.getFavorites()
        if (cancelled) return
        setFavorites(new Set(ids))
        const active = getActiveFavoriteId()
        setActiveId(active && ids.includes(active) ? active : ids[0] ?? null)
      } catch {
        if (!cancelled) {
          const local = getLocalStorageFavorites()
          setFavorites(new Set(local))
        }
      } finally {
        if (!cancelled) setReady(true)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  const setMeta = useCallback((dogId: string, meta: FavoriteDogMeta) => {
    setMetaById((prev) => (prev[dogId] ? prev : { ...prev, [dogId]: meta }))
  }, [])

  const getMeta = useCallback((dogId: string) => metaById[dogId], [metaById])

  const isFavorite = useCallback((dogId: string | number) => favorites.has(String(dogId)), [favorites])

  const toggleFavorite = useCallback(
    async (dogId: string | number, meta?: FavoriteDogMeta) => {
      const id = String(dogId)
      const previous = new Set(favorites)
      const next = new Set(favorites)
      const removing = next.has(id)
      if (removing) next.delete(id)
      else next.add(id)
      setFavorites(next)

      if (meta) {
        setMetaById((prev) => ({ ...prev, [id]: meta }))
      }

      if (removing) {
        if (activeId === id) {
          const fallback = [...next][0] ?? null
          setActiveId(fallback)
          setActiveFavoriteId(fallback)
        }
      } else {
        setActiveId(id)
        setActiveFavoriteId(id)
      }

      try {
        if (isAuthenticated) {
          if (removing) await authApi.removeFavorite(id)
          else await authApi.addFavorite(id)
        } else if (removing) {
          removeLocalStorageFavorite(id)
        } else {
          addLocalStorageFavorite(id)
        }
      } catch (error) {
        setFavorites(previous)
        throw error
      }
    },
    [favorites, isAuthenticated, activeId],
  )

  const setActive = useCallback(
    (dogId: string) => {
      if (!favorites.has(dogId)) return
      setActiveId(dogId)
      setActiveFavoriteId(dogId)
    },
    [favorites],
  )

  const value = useMemo(
    () => ({
      favorites,
      favoriteIds: [...favorites],
      activeId,
      ready,
      isFavorite,
      toggleFavorite,
      setActive,
      getMeta,
      setMeta,
    }),
    [favorites, activeId, ready, isFavorite, toggleFavorite, setActive, getMeta, setMeta],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
