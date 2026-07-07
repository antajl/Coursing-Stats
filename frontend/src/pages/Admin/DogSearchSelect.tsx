import { useEffect, useId, useRef, useState } from 'react'
import { getAdminApiBase } from './adminApi'

export interface DogOption {
  id: number
  name_lat: string
  name_ru: string
  breed: string
}

interface DogSearchSelectProps {
  value: number
  onChange: (dogId: number, dog?: DogOption) => void
  required?: boolean
}

import { parseDogName } from '../../lib/dogName'

function formatDogLabel(dog: DogOption): string {
  const { primary, secondary } = parseDogName(dog.name_lat, dog.name_ru)
  const namePart = secondary ? `${primary} / ${secondary}` : primary
  return `${namePart} — ${dog.breed}`
}

export default function DogSearchSelect({ value, onChange, required }: DogSearchSelectProps) {
  const listId = useId()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<DogOption[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<DogOption | null>(null)

  useEffect(() => {
    if (!value) {
      setSelected(null)
      return
    }
    if (selected?.id === value) return

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${getAdminApiBase()}/api/dogs/${value}`)
        if (!res.ok) return
        const json = await res.json()
        const dog = json.data as DogOption | undefined
        if (!cancelled && dog?.id) {
          setSelected(dog)
          setQuery(formatDogLabel(dog))
        }
      } catch {
        /* ignore */
      }
    })()

    return () => {
      cancelled = true
    }
  }, [value, selected?.id])

  useEffect(() => {
    if (!open) return

    const q = query.trim()
    if (q.length < 2) {
      setOptions([])
      setLoading(false)
      return
    }

    const timer = window.setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ search: q, limit: '40' })
        const res = await fetch(`${getAdminApiBase()}/api/dogs?${params}`)
        const json = await res.json()
        setOptions(Array.isArray(json.data) ? json.data : [])
      } catch {
        setOptions([])
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => window.clearTimeout(timer)
  }, [query, open])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const pick = (dog: DogOption) => {
    setSelected(dog)
    setQuery(formatDogLabel(dog))
    onChange(dog.id, dog)
    setOpen(false)
  }

  const clear = () => {
    setSelected(null)
    setQuery('')
    onChange(0)
    setOptions([])
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            if (selected && e.target.value !== formatDogLabel(selected)) {
              setSelected(null)
              onChange(0)
            }
          }}
          onFocus={() => setOpen(true)}
          placeholder="Введите имя (латиница или кириллица)…"
          className="w-full px-4 py-2 border border-om-200 rounded-lg focus:ring-2 focus:ring-camel-500 dark:bg-charcoal-800 dark:border-charcoal-600 dark:text-charcoal-100"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          required={required && !value}
        />
        {value > 0 && (
          <button
            type="button"
            onClick={clear}
            className="shrink-0 px-3 py-2 text-sm text-charcoal-500 hover:text-charcoal-800 dark:text-charcoal-400 dark:hover:text-charcoal-100"
          >
            ✕
          </button>
        )}
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-om-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 shadow-lg"
        >
          {query.trim().length < 2 && (
            <li className="px-4 py-3 text-sm text-charcoal-500 dark:text-charcoal-400">
              Минимум 2 символа для поиска
            </li>
          )}
          {query.trim().length >= 2 && loading && (
            <li className="px-4 py-3 text-sm text-charcoal-500 dark:text-charcoal-400">Поиск…</li>
          )}
          {query.trim().length >= 2 && !loading && options.length === 0 && (
            <li className="px-4 py-3 text-sm text-charcoal-500 dark:text-charcoal-400">
              Ничего не найдено
            </li>
          )}
          {!loading &&
            options.map((dog) => (
              <li key={dog.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={dog.id === value}
                  onClick={() => pick(dog)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-camel-50 dark:hover:bg-charcoal-700 ${
                    dog.id === value ? 'bg-camel-100 dark:bg-charcoal-700' : ''
                  }`}
                >
                  {formatDogLabel(dog)}
                </button>
              </li>
            ))}
        </ul>
      )}

      <input type="hidden" value={value || ''} required={required} />
    </div>
  )
}
