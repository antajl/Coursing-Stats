import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ChevronRight, Star } from 'lucide-react'
import { useFavorites } from '../../hooks/useFavorites'
import { fetchJson } from '../../lib/staticData/core'
import { parseDogName } from '../../lib/dogName'
import { displayBreed } from '../../lib/breedMapping'

/** Короткая подпись в шапке: первое слово или обрезка. */
function shortCapsuleLabel(name: string, max = 11): string {
  const trimmed = name.trim()
  if (!trimmed) return '…'
  const first = trimmed.split(/\s+/)[0] ?? trimmed
  const candidate = first.length <= max ? first : trimmed
  return candidate.length > max ? `${candidate.slice(0, max - 1)}…` : candidate
}

/**
 * Капсула «моя собака» в шапке: активное избранное → ссылка на профиль.
 * Гости и аккаунт через useFavorites.
 */
export default function FavoritesCapsule() {
  const { activeId, favoriteIds, ready, setActive, getMeta, setMeta } = useFavorites()
  const [open, setOpen] = useState(false)
  const [listMeta, setListMeta] = useState<Record<string, { name: string; breed: string }>>({})

  const cachedMeta = activeId ? getMeta(activeId) : null

  useEffect(() => {
    if (!activeId || cachedMeta) return
    let cancelled = false
    const load = async () => {
      const file = await fetchJson<{ dog?: { name_lat?: string; name_ru?: string; breed?: string } }>(
        `indexes/dog-profiles/${activeId}.json`,
      )
      if (cancelled) return
      if (file?.dog) {
        const d = file.dog
        const { primary } = parseDogName(d.name_lat || '', d.name_ru)
        setMeta(activeId, { name: primary, breed: d.breed || '' })
      } else {
        setMeta(activeId, { name: `Собака #${activeId}`, breed: '' })
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [activeId, cachedMeta, setMeta])

  useEffect(() => {
    if (!open || favoriteIds.length === 0) return
    let cancelled = false
    const loadAll = async () => {
      const next: Record<string, { name: string; breed: string }> = { ...listMeta }
      await Promise.all(
        favoriteIds.slice(0, 12).map(async (id) => {
          if (next[id]) return
          const cached = getMeta(id)
          if (cached) {
            next[id] = cached
            return
          }
          const file = await fetchJson<{ dog?: { name_lat?: string; name_ru?: string; breed?: string } }>(
            `indexes/dog-profiles/${id}.json`,
          )
          if (file?.dog) {
            const d = file.dog
            const { primary } = parseDogName(d.name_lat || '', d.name_ru)
            next[id] = { name: primary, breed: d.breed || '' }
            setMeta(id, next[id])
          } else {
            next[id] = { name: `#${id}`, breed: '' }
          }
        }),
      )
      if (!cancelled) setListMeta(next)
    }
    void loadAll()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh when dropdown opens / ids change
  }, [open, favoriteIds.join(',')])

  if (!ready || !activeId) return null

  const meta = cachedMeta ?? { name: '…', breed: '' }
  const breedShort = meta.breed ? displayBreed(meta.breed).primary : ''
  const fullTitle = meta.name !== '…' ? `${meta.name}${breedShort ? ` · ${breedShort}` : ''}` : 'Избранная собака'
  const shortLabel = shortCapsuleLabel(meta.name)
  const multi = favoriteIds.length > 1

  return (
    <div className="relative shrink-0 animate-fade-in-scale" key={activeId}>
      <div className="flex items-center overflow-hidden rounded-full border border-amber-300/80 bg-amber-50/90 text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100">
        <Link
          to={`/dog/${activeId}`}
          className="flex shrink-0 items-center gap-1 px-2 py-1.5 hover:bg-amber-100/80 md:gap-1.5 md:px-2.5 dark:hover:bg-amber-900/40"
          title={fullTitle}
          aria-label={`Избранная собака: ${fullTitle}`}
        >
          <Star className="h-3.5 w-3.5 shrink-0 fill-current text-amber-500 animate-favorite-star-pop" aria-hidden />
          <span className="hidden max-w-[5.5rem] truncate text-[11px] font-semibold leading-none md:inline lg:max-w-[6.5rem] lg:text-xs">
            {shortLabel}
          </span>
        </Link>
        {multi ? (
          <button
            type="button"
            className="shrink-0 border-l border-amber-300/60 px-1.5 py-1.5 text-[10px] font-bold leading-none text-amber-700 hover:bg-amber-100 dark:border-amber-700/50 dark:text-amber-200 dark:hover:bg-amber-900/50"
            aria-expanded={open}
            aria-label="Выбрать другую избранную собаку"
            title={fullTitle}
            onClick={() => setOpen((v) => !v)}
          >
            ▾
          </button>
        ) : null}
      </div>
      {open && favoriteIds.length > 1 ? (
        <div className="absolute right-0 z-[100] mt-1 flex max-h-64 w-56 flex-col overflow-hidden rounded-xl border-2 border-old-money-200 bg-white shadow-xl dark:border-charcoal-600 dark:bg-charcoal-800">
          <div className="overflow-auto">
            {favoriteIds.map((id) => {
              const m = listMeta[id] || getMeta(id) || (id === activeId ? meta : null)
              const label = m?.name && m.name !== '…' ? m.name : `…`
              const b = m?.breed ? displayBreed(m.breed).primary : ''
              return (
                <button
                  key={id}
                  type="button"
                  className={`block w-full border-b border-old-money-100 px-3 py-2 text-left text-xs last:border-0 hover:bg-old-money-50 dark:border-charcoal-700 dark:hover:bg-charcoal-700 ${
                    id === activeId ? 'bg-amber-50 font-semibold dark:bg-amber-950/30' : 'text-charcoal-700 dark:text-charcoal-200'
                  }`}
                  onClick={() => {
                    setActive(id)
                    setOpen(false)
                  }}
                >
                  {label}
                  {b ? <span className="block text-[10px] font-normal text-charcoal-500">{b}</span> : null}
                </button>
              )
            })}
          </div>
          <div className="shrink-0 border-t border-old-money-100 bg-cream-50/90 p-2 dark:border-charcoal-700 dark:bg-charcoal-900/50">
            <Link
              to="/account"
              className="group flex w-full items-center justify-between gap-2 rounded-lg border border-old-money-200/70 bg-white px-3 py-2 text-xs font-semibold text-charcoal-700 shadow-sm transition-all hover:border-camel-300 hover:bg-camel-50 hover:text-camel-800 hover:shadow dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-200 dark:hover:border-camel-700 dark:hover:bg-charcoal-700 dark:hover:text-camel-300"
              onClick={() => setOpen(false)}
            >
              <span className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                Все избранные
              </span>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-charcoal-400 transition-transform group-hover:translate-x-0.5 group-hover:text-camel-600 dark:text-charcoal-500 dark:group-hover:text-camel-400"
                aria-hidden
              />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
