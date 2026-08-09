import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import {
  filterFavoriteDogs,
  sortFavoriteDogs,
  type FavoriteDog,
  type FavoriteSortMode,
} from './accountFavorites'
import { FavoriteDogRow } from './FavoriteDogRow'

/** Search / sort / bulk — from 2 dogs. Hero shows from 1 dog. */
export const TOOLBAR_MIN_DOGS = 2
/** @deprecated hero shows whenever there is an active dog */
export const HERO_MIN_DOGS = 1

/** @deprecated use TOOLBAR_MIN_DOGS */
export const MANAGE_UI_MIN_DOGS = TOOLBAR_MIN_DOGS

type FavoritesSectionProps = {
  dogs: FavoriteDog[]
  idOrder: string[]
  activeId: string | null
  loading: boolean
  missingCount: number
  onRemoveOne: (id: string) => Promise<void>
  onRemoveMany: (ids: string[]) => Promise<void>
  onSetActive: (id: string) => void
}

export function FavoritesSection({
  dogs,
  idOrder,
  activeId,
  loading,
  missingCount,
  onRemoveOne,
  onRemoveMany,
  onSetActive,
}: FavoritesSectionProps) {
  const [query, setQuery] = useState('')
  const [sortMode, setSortMode] = useState<FavoriteSortMode>('recent')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())
  const [bulkBusy, setBulkBusy] = useState(false)

  const manageMode = dogs.length >= TOOLBAR_MIN_DOGS

  const visible = useMemo(() => {
    if (!manageMode) return sortFavoriteDogs(dogs, 'recent', idOrder)
    const filtered = filterFavoriteDogs(dogs, query)
    return sortFavoriteDogs(filtered, sortMode, idOrder)
  }, [dogs, query, sortMode, idOrder, manageMode])

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllVisible = () => {
    setSelected(new Set(visible.map((d) => d.id)))
  }

  const clearSelection = () => setSelected(new Set())

  const runRemoveOne = async (id: string) => {
    setBusyIds((prev) => new Set(prev).add(id))
    try {
      await onRemoveOne(id)
      setSelected((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const runBulkRemove = async () => {
    const ids = [...selected]
    if (ids.length === 0) return
    setBulkBusy(true)
    try {
      await onRemoveMany(ids)
      clearSelection()
    } finally {
      setBulkBusy(false)
    }
  }

  return (
    <section className="mb-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <h2 className="text-2xl font-bold text-charcoal-900 dark:text-cream-100">
          Мои собаки
          {!loading && dogs.length > 0 ? (
            <span className="ml-2 text-lg font-normal text-charcoal-500 dark:text-charcoal-400">
              · {dogs.length}
            </span>
          ) : null}
        </h2>
        {manageMode && !loading && visible.length !== dogs.length ? (
          <span className="text-sm text-charcoal-500 dark:text-charcoal-400">
            {visible.length} из {dogs.length}
          </span>
        ) : null}
      </div>

      {missingCount > 0 && !loading && (
        <p className="mb-3 text-sm text-charcoal-500 dark:text-charcoal-400">
          Не удалось загрузить профили: {missingCount}
        </p>
      )}

      {loading ? (
        <div className="text-charcoal-600 dark:text-cream-300">Загрузка избранного…</div>
      ) : dogs.length === 0 ? (
        <div className="relative overflow-hidden rounded-xl border border-dashed border-charcoal-300 dark:border-charcoal-600 px-6 py-12 text-center">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{ backgroundImage: "url('/assets/hero/background.webp')" }}
            aria-hidden
          />
          <Star className="relative w-10 h-10 text-camel-600 dark:text-camel-400 mx-auto mb-4" />
          <p className="relative text-charcoal-800 dark:text-cream-100 text-lg font-medium mb-2">
            В избранном пока пусто
          </p>
          <p className="relative text-charcoal-600 dark:text-cream-300 mb-6 max-w-md mx-auto">
            Добавляйте собак звёздочкой на профиле или в рейтинге — они появятся здесь со статистикой и
            последними участиями.
          </p>
          <Link
            to="/competitions"
            className="relative inline-block bg-camel-700 hover:bg-camel-800 text-cream-50 font-medium py-2.5 px-6 rounded-lg transition-colors"
          >
            Найти собак
          </Link>
        </div>
      ) : (
        <>
          {manageMode && (
            <>
              <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Поиск по кличке или породе"
                  className="flex-1 px-3 py-2 border border-charcoal-300 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-700 text-charcoal-900 dark:text-cream-100"
                />
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as FavoriteSortMode)}
                  className="px-3 py-2 border border-charcoal-300 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-700 text-charcoal-900 dark:text-cream-100"
                  aria-label="Сортировка"
                >
                  <option value="recent">По порядку в списке</option>
                  <option value="name">По кличке</option>
                  <option value="breed">По породе</option>
                </select>
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
                <button
                  type="button"
                  onClick={selectAllVisible}
                  className="text-charcoal-600 dark:text-cream-300 hover:text-charcoal-900 dark:hover:text-cream-100"
                >
                  Выбрать все
                </button>
                {selected.size > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="text-charcoal-600 dark:text-cream-300 hover:text-charcoal-900 dark:hover:text-cream-100"
                    >
                      Снять выбор
                    </button>
                    <button
                      type="button"
                      onClick={() => void runBulkRemove()}
                      disabled={bulkBusy}
                      className="text-terracotta-600 dark:text-terracotta-400 hover:text-terracotta-800 disabled:opacity-50"
                    >
                      {bulkBusy ? 'Удаление…' : `Убрать выбранные (${selected.size})`}
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {visible.length === 0 ? (
            <p className="text-charcoal-600 dark:text-cream-300">Ничего не найдено</p>
          ) : (
            <div className={`grid gap-4 ${dogs.length > 1 ? 'md:grid-cols-2' : ''}`}>
              {visible.map((dog) => (
                <FavoriteDogRow
                  key={dog.id}
                  dog={dog}
                  selected={selected.has(dog.id)}
                  isActive={activeId === dog.id}
                  removing={bulkBusy || busyIds.has(dog.id)}
                  manageMode={manageMode}
                  onToggleSelect={toggleSelect}
                  onRemove={(id) => void runRemoveOne(id)}
                  onSetActive={onSetActive}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}
