import { Link, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { Star } from 'lucide-react'
import { useFavorites } from '../../hooks/useFavorites'
import { useClickOutside } from '../../hooks/useClickOutside'
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

type FavoritesCapsuleProps = {
  isMobile?: boolean
}

/**
 * Капсула «моя собака» в шапке: активное избранное → ссылка на профиль.
 * На /account приглушена — там уже фокус на избранном.
 * На мобильных (isMobile) — компактная круглая кнопка w-11 h-11 вровень с соседними иконками.
 */
export default function FavoritesCapsule({ isMobile = false }: FavoritesCapsuleProps) {
  const { pathname } = useLocation()
  const onAccount = pathname === '/account' || pathname.startsWith('/account/')
  const { activeId, favoriteIds, ready, setActive, getMeta, setMeta } = useFavorites()
  const [open, setOpen] = useState(false)
  const [listMeta, setListMeta] = useState<Record<string, { name: string; breed: string }>>({})
  const containerRef = useRef<HTMLDivElement>(null)

  useClickOutside(containerRef, {
    onClickOutside: () => setOpen(false),
    enabled: open,
  })

  const cachedMeta = activeId ? getMeta(activeId) : null

  useEffect(() => {
    if (!activeId || cachedMeta) return
    let cancelled = false
    const load = async () => {
      const { getDogProfileFile } = await import('../../lib/staticData/dogs')
      const file = await getDogProfileFile(activeId)
      if (cancelled) return
      if (file?.dog) {
        const d = file.dog as { name_lat?: string; name_ru?: string; breed?: string }
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
      const { getDogProfileFile } = await import('../../lib/staticData/dogs')
      const next: Record<string, { name: string; breed: string }> = { ...listMeta }
      await Promise.all(
        favoriteIds.slice(0, 12).map(async (id) => {
          if (next[id]) return
          const cached = getMeta(id)
          if (cached) {
            next[id] = cached
            return
          }
          const file = await getDogProfileFile(id)
          if (file?.dog) {
            const d = file.dog as { name_lat?: string; name_ru?: string; breed?: string }
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
  const fullTitle =
    meta.name !== '…' ? `${meta.name}${breedShort ? ` · ${breedShort}` : ''}` : 'Избранная собака'
  const shortLabel = shortCapsuleLabel(meta.name)
  const multi = favoriteIds.length > 1

  const shellClass = onAccount
    ? 'cs-glass-pill flex items-center h-9 overflow-hidden rounded-full opacity-60'
    : 'cs-glass-pill flex items-center h-9 overflow-hidden rounded-full group'

  const linkHover = onAccount
    ? 'flex shrink-0 items-center gap-1.5 h-full px-2.5 2xl:px-3 hover:bg-black/5 text-xs font-semibold transition-colors'
    : 'flex shrink-0 items-center gap-1.5 h-full px-2.5 2xl:px-3 hover:bg-white/40 text-xs font-semibold text-charcoal-700 group-hover:text-charcoal-900 transition-colors'

  const starClass = onAccount
    ? 'h-3.5 w-3.5 shrink-0 fill-current text-charcoal-400'
    : 'h-3.5 w-3.5 shrink-0 fill-current text-amber-500 animate-favorite-star-pop'

  const mobileStarClass = onAccount
    ? 'w-5 h-5 shrink-0 fill-current text-charcoal-400'
    : 'w-5 h-5 shrink-0 fill-current text-amber-500 animate-favorite-star-pop'

  return (
    <div ref={containerRef} className="relative shrink-0 animate-fade-in-scale" key={activeId}>
      {isMobile ? (
        multi ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={`Избранное: ${fullTitle}`}
            title={fullTitle}
            className={`cs-glass-pill w-11 h-11 rounded-full flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-all ${
              onAccount ? 'opacity-60' : ''
            }`}
          >
            <Star className={mobileStarClass} aria-hidden />
          </button>
        ) : (
          <Link
            to={`/dog/${activeId}/`}
            aria-label={`Избранная собака: ${fullTitle}`}
            title={fullTitle}
            className={`cs-glass-pill w-11 h-11 rounded-full flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-all no-underline ${
              onAccount ? 'opacity-60' : ''
            }`}
          >
            <Star className={mobileStarClass} aria-hidden />
          </Link>
        )
      ) : (
        <div className={shellClass}>
          <Link
            to={`/dog/${activeId}/`}
            className={linkHover}
            title={fullTitle}
            aria-label={`Избранная собака: ${fullTitle}`}
          >
            <Star className={starClass} aria-hidden />
            <span className="hidden max-w-[6.5rem] truncate text-xs font-semibold leading-none 2xl:inline">
              {shortLabel}
            </span>
          </Link>
          {multi ? (
            <button
              type="button"
              className={
                onAccount
                  ? 'flex items-center justify-center h-full shrink-0 border-l border-charcoal-300/60 px-1.5 text-[10px] font-bold text-charcoal-500 hover:bg-charcoal-200/40 transition-colors'
                  : 'flex items-center justify-center h-full shrink-0 border-l border-white/60 px-1.5 text-[10px] font-bold text-charcoal-500 hover:text-charcoal-800 hover:bg-white/40 transition-colors'
              }
              aria-expanded={open}
              aria-label="Выбрать другую избранную собаку"
              title={fullTitle}
              onClick={() => setOpen((v) => !v)}
            >
              ▾
            </button>
          ) : null}
        </div>
      )}
      {open && favoriteIds.length > 1 ? (
        <div className="absolute right-0 top-full mt-1.5 z-[100] flex max-h-64 w-60 flex-col overflow-hidden rounded-xl border border-old-money-200 bg-cream-50/95 backdrop-blur-md shadow-xl animate-fade-in-scale">
          <div className="overflow-auto divide-y divide-old-money-100">
            {favoriteIds.map((id) => {
              const m = listMeta[id] || getMeta(id) || (id === activeId ? meta : null)
              const label = m?.name && m.name !== '…' ? m.name : `…`
              const b = m?.breed ? displayBreed(m.breed).primary : ''
              const isCurr = id === activeId
              return (
                <Link
                  key={id}
                  to={`/dog/${id}/`}
                  className={`block w-full px-3.5 py-2.5 text-left text-xs transition-colors no-underline ${
                    isCurr
                      ? 'bg-amber-50/80 font-semibold text-charcoal-900 border-l-2 border-amber-500'
                      : 'text-charcoal-700 hover:bg-cream-100 hover:text-charcoal-900'
                  }`}
                  onClick={() => {
                    setActive(id)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center gap-1.5 font-medium text-charcoal-900">
                    {isCurr && <Star className="w-3.5 h-3.5 fill-current text-amber-500 shrink-0" aria-hidden />}
                    <span className="truncate">{label}</span>
                  </div>
                  {b ? <span className="block text-[10px] text-charcoal-500 mt-0.5 truncate">{b}</span> : null}
                </Link>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
