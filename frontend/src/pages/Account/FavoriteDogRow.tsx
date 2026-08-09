import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, MoreHorizontal, Pin } from 'lucide-react'
import { formatStarts } from '../Home/utils/formatters'
import type { FavoriteDog } from './accountFavorites'

type FavoriteDogRowProps = {
  dog: FavoriteDog
  selected: boolean
  isActive: boolean
  removing: boolean
  manageMode: boolean
  onToggleSelect: (id: string) => void
  onRemove: (id: string) => void
  onSetActive: (id: string) => void
}

function formatSex(sex: string | null): string | null {
  if (!sex) return null
  const s = sex.trim().toUpperCase()
  if (s === 'M' || s === 'MALE' || s === 'К') return '♂'
  if (s === 'F' || s === 'FEMALE' || s === 'С' || s === 'S') return '♀'
  return null
}

function formatRuDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function FavoriteDogRow({
  dog,
  selected,
  isActive,
  removing,
  manageMode,
  onToggleSelect,
  onRemove,
  onSetActive,
}: FavoriteDogRowProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const c = dog.coursing
  const sex = formatSex(dog.sex)
  const meta = [dog.breedDisplay, sex].filter(Boolean).join(' · ')

  useEffect(() => {
    if (!menuOpen) return
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  return (
    <div
      className={`group relative flex flex-col gap-3 rounded-xl border p-4 transition-colors ${
        isActive
          ? 'border-camel-500 bg-camel-50/50 dark:bg-camel-900/25 dark:border-camel-600'
          : 'border-charcoal-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800/80 hover:border-camel-400 dark:hover:border-camel-600'
      }`}
    >
      <div className="flex items-start gap-3">
        {manageMode && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(dog.id)}
            disabled={removing}
            className="mt-1 h-4 w-4 shrink-0 accent-camel-600"
            aria-label={`Выбрать ${dog.name_lat}`}
          />
        )}
        <Link
          to={`/dog/${dog.id}`}
          className="flex flex-1 min-w-0 items-start gap-2 rounded-md -m-1 p-1 hover:bg-camel-50/60 dark:hover:bg-charcoal-700/40 transition-colors"
        >
          <span className="min-w-0 flex-1">
            <h3 className="font-semibold text-charcoal-900 dark:text-cream-100 truncate text-lg leading-snug group-hover:text-camel-800 dark:group-hover:text-camel-300 transition-colors">
              {isActive && (
                <span className="mr-1.5 inline-flex align-middle text-camel-700 dark:text-camel-300" title="Главная">
                  ★
                </span>
              )}
              {dog.name_lat}
            </h3>
            {dog.name_ru && dog.name_ru !== dog.name_lat ? (
              <p className="text-sm text-charcoal-600 dark:text-cream-300 truncate">{dog.name_ru}</p>
            ) : null}
            {meta ? (
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400 truncate mt-0.5">{meta}</p>
            ) : null}
          </span>
          <ChevronRight
            className="mt-1 h-5 w-5 shrink-0 text-charcoal-300 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:text-camel-600 dark:text-charcoal-600 dark:group-hover:text-camel-400"
            aria-hidden
          />
        </Link>

        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            disabled={removing}
            className="p-2 text-charcoal-400 hover:text-charcoal-700 dark:hover:text-cream-100 transition-colors disabled:opacity-50"
            aria-label={`Действия: ${dog.name_lat}`}
            aria-expanded={menuOpen}
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-20 mt-1 min-w-[12rem] rounded-lg border border-charcoal-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 shadow-lg py-1 text-sm">
              {isActive ? (
                <p className="px-3 py-2 text-camel-800 dark:text-camel-300 inline-flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5" />
                  Главная собака
                </p>
              ) : (
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-cream-100 dark:hover:bg-charcoal-700 text-charcoal-800 dark:text-cream-100"
                  onClick={() => {
                    onSetActive(dog.id)
                    setMenuOpen(false)
                  }}
                >
                  ★ Сделать главной
                </button>
              )}
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-cream-100 dark:hover:bg-charcoal-700 text-terracotta-700 dark:text-terracotta-400"
                onClick={() => {
                  onRemove(dog.id)
                  setMenuOpen(false)
                }}
              >
                Убрать из избранного
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`space-y-1.5 text-sm ${manageMode ? 'pl-7' : ''}`}>
        {c && c.total_starts > 0 && (
          <p className="tabular-nums text-charcoal-700 dark:text-cream-200">
            {formatStarts(c.total_starts)}
            <span className="text-charcoal-400 mx-2">·</span>
            🥇 {c.gold}
            <span className="text-charcoal-400 mx-1.5">·</span>
            🥈 {c.silver}
            <span className="text-charcoal-400 mx-1.5">·</span>
            🥉 {c.bronze}
          </p>
        )}
        {dog.lastEvent && (
          <p className="text-charcoal-500 dark:text-charcoal-400">
            Последнее участие · {formatRuDate(dog.lastEvent.date_start)}
            {dog.lastEvent.placement != null ? ` · ${dog.lastEvent.placement} место` : ''}
          </p>
        )}
      </div>
    </div>
  )
}
