import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const ACTIVE_FAVORITE_KEY = 'coursing_active_favorite'
const LOCAL_STORAGE_FAVORITES_KEY = 'coursing_favorites'

// LocalStorage favorites utilities
function getLocalStorageFavorites(): string[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_FAVORITES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function addLocalStorageFavorite(dogId: string): void {
  const favorites = getLocalStorageFavorites()
  if (!favorites.includes(dogId)) {
    favorites.push(dogId)
    localStorage.setItem(LOCAL_STORAGE_FAVORITES_KEY, JSON.stringify(favorites))
  }
}

function removeLocalStorageFavorite(dogId: string): void {
  const favorites = getLocalStorageFavorites()
  const filtered = favorites.filter(id => id !== dogId)
  localStorage.setItem(LOCAL_STORAGE_FAVORITES_KEY, JSON.stringify(filtered))
}

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
  removeFavorites: (ids: string[]) => Promise<void>
  setActive: (dogId: string) => void
  getMeta: (dogId: string) => FavoriteDogMeta | undefined
  setMeta: (dogId: string, meta: FavoriteDogMeta) => void
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set(getLocalStorageFavorites()))
  const [activeId, setActiveId] = useState<string | null>(() => getActiveFavoriteId())
  const [metaById, setMetaById] = useState<Record<string, FavoriteDogMeta>>({})
  const [ready, setReady] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const local = getLocalStorageFavorites()
      if (!cancelled) {
        setFavorites(new Set(local))
        const active = getActiveFavoriteId()
        setActiveId(active && local.includes(active) ? active : local[0] ?? null)
        setReady(true)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

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
        removeLocalStorageFavorite(id)
      } else {
        setActiveId(id)
        setActiveFavoriteId(id)
        addLocalStorageFavorite(id)
      }
    },
    [favorites, activeId],
  )

  const setActive = useCallback(
    (dogId: string) => {
      if (!favorites.has(dogId)) return
      setActiveId(dogId)
      setActiveFavoriteId(dogId)
    },
    [favorites],
  )

  const removeFavorites = useCallback(
    async (ids: string[]) => {
      const unique = [...new Set(ids.map(String))].filter((id) => favorites.has(id))
      if (unique.length === 0) return

      const previous = new Set(favorites)
      const previousActive = activeId
      const next = new Set(favorites)
      for (const id of unique) next.delete(id)

      setFavorites(next)
      if (activeId && !next.has(activeId)) {
        const fallback = [...next][0] ?? null
        setActiveId(fallback)
        setActiveFavoriteId(fallback)
      }

      for (const id of unique) {
        removeLocalStorageFavorite(id)
      }
    },
    [favorites, activeId],
  )

  const favoriteIds = useMemo(() => [...favorites], [favorites])

  const value = useMemo(
    () => ({
      favorites,
      favoriteIds,
      activeId,
      ready,
      isFavorite,
      toggleFavorite,
      removeFavorites,
      setActive,
      getMeta,
      setMeta,
    }),
    [
      favorites,
      favoriteIds,
      activeId,
      ready,
      isFavorite,
      toggleFavorite,
      removeFavorites,
      setActive,
      getMeta,
      setMeta,
    ],
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
