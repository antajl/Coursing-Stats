import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icons } from '../lib/icons'
import {
  dogNameMatchesQuery,
  dogNameSearchText,
  dogQuerySearchTokens,
  parseDogName,
  transliterateCyrillicToLatin,
} from '../lib/dogName'
import { requestHomeHeroSettle } from './HomeHeroStage'

export interface HomeSearchDog {
  id: number
  name_lat?: string | null
  name_ru?: string | null
  breed?: string | null
  competition_count?: number
}

function normalizeBreed(q: string): string {
  return q
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9\s'-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Канонический ключ для склейки RU/LAT дублей одной собаки. */
function dogDedupeKey(dog: HomeSearchDog): string {
  const { primary } = parseDogName(dog.name_lat, dog.name_ru)
  const base = primary.split('/')[0]?.trim() || ''
  const lat = transliterateCyrillicToLatin(base)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
  const breed = normalizeBreed(dog.breed || '')
  return `${lat}|${breed}`
}

function scoreDog(dog: HomeSearchDog, q: string): number {
  if (!q.trim()) return 0
  const breedQ = normalizeBreed(q)
  const breed = normalizeBreed(dog.breed || '')
  const breedHit = breedQ.length >= 2 && breed.includes(breedQ)

  if (!dogNameMatchesQuery(dog.name_lat, dog.name_ru, q) && !breedHit) return 0

  const hay = dogNameSearchText(dog.name_lat, dog.name_ru)
  const tokens = dogQuerySearchTokens(q)
  let best = breedHit ? 35 : 0
  for (const token of tokens) {
    if (hay === token) best = Math.max(best, 100)
    else if (hay.startsWith(token) || hay.includes(` ${token}`)) best = Math.max(best, 80)
    else if (hay.includes(token)) best = Math.max(best, 55)
  }
  return best
}

async function dogProfileExists(id: number, cache: Map<number, boolean>): Promise<boolean> {
  const cached = cache.get(id)
  if (cached != null) return cached
  try {
    const res = await fetch(`/data/v1/indexes/dog-profiles/${id}.json`, { method: 'GET' })
    const ok = res.ok
    cache.set(id, ok)
    return ok
  } catch {
    cache.set(id, false)
    return false
  }
}

interface HomeDogSearchProps {
  className?: string
}

export default function HomeDogSearch({ className = '' }: HomeDogSearchProps) {
  const navigate = useNavigate()
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const profileCacheRef = useRef(new Map<number, boolean>())
  const [query, setQuery] = useState('')
  const [dogs, setDogs] = useState<HomeSearchDog[] | null>(null)
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const [loadError, setLoadError] = useState(false)
  const [results, setResults] = useState<HomeSearchDog[]>([])

  useEffect(() => {
    let cancelled = false
    fetch('/data/v1/indexes/dogs-index.json')
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.json()
      })
      .then((data: HomeSearchDog[]) => {
        if (!cancelled) setDogs(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const candidates = useMemo(() => {
    const q = query.trim()
    if (q.length < 2 || !dogs) return []

    const bestByKey = new Map<string, { dog: HomeSearchDog; score: number }>()
    for (const dog of dogs) {
      if (!dog.id || /^\d+$/.test(String(dog.breed || ''))) continue
      const s = scoreDog(dog, q)
      if (s <= 0) continue
      const key = dogDedupeKey(dog)
      const prev = bestByKey.get(key)
      if (
        !prev ||
        s > prev.score ||
        (s === prev.score && (dog.competition_count || 0) > (prev.dog.competition_count || 0)) ||
        (s === prev.score &&
          (dog.competition_count || 0) === (prev.dog.competition_count || 0) &&
          dog.id < prev.dog.id)
      ) {
        bestByKey.set(key, { dog, score: s })
      }
    }

    return [...bestByKey.values()]
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return (b.dog.competition_count || 0) - (a.dog.competition_count || 0)
      })
      .slice(0, 12)
      .map((x) => x.dog)
  }, [dogs, query])

  useEffect(() => {
    let cancelled = false
    setActiveIdx(0)

    if (candidates.length === 0) {
      setResults([])
      return
    }

    ;(async () => {
      const cache = profileCacheRef.current
      const checked = await Promise.all(
        candidates.map(async (dog) => ((await dogProfileExists(dog.id, cache)) ? dog : null)),
      )
      if (cancelled) return
      setResults(checked.filter((d): d is HomeSearchDog => Boolean(d)).slice(0, 8))
    })()

    return () => {
      cancelled = true
    }
  }, [candidates])

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const goDog = useCallback(
    async (id: number) => {
      const ok = await dogProfileExists(id, profileCacheRef.current)
      if (!ok) return
      setOpen(false)
      setQuery('')
      navigate(`/dog/${id}`)
    },
    [navigate],
  )

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const target = results[activeIdx] ?? results[0]
    if (target) void goDog(target.id)
  }

  return (
    <div ref={rootRef} className={`home-v2-search ${className}`.trim()}>
      <form onSubmit={onSubmit} role="search">
        <label className="sr-only" htmlFor="home-v2-dog-search">
          Найти собаку
        </label>
        <div className="home-v2-search-field">
          <Icons.search className="home-v2-search-icon" aria-hidden />
          <input
            id="home-v2-dog-search"
            type="search"
            autoComplete="off"
            placeholder="Кличка собаки…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => {
              requestHomeHeroSettle()
              setOpen(true)
            }}
            onPointerDown={() => requestHomeHeroSettle()}
            onKeyDown={(e) => {
              if (!open || results.length === 0) return
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActiveIdx((i) => Math.min(i + 1, results.length - 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActiveIdx((i) => Math.max(i - 1, 0))
              } else if (e.key === 'Escape') {
                setOpen(false)
              }
            }}
            aria-autocomplete="list"
            aria-controls={listId}
            aria-expanded={open && results.length > 0}
          />
        </div>
      </form>
      {loadError && (
        <p className="home-v2-search-hint">
          Поиск временно недоступен.{' '}
          <Link to="/competitions?tab=ranking">Открыть рейтинг</Link>
        </p>
      )}
      {open && query.trim().length >= 2 && results.length > 0 && (
        <ul id={listId} className="home-v2-search-list" role="listbox">
          {results.map((dog, idx) => {
            const { primary } = parseDogName(dog.name_lat, dog.name_ru)
            return (
              <li key={dog.id} role="option" aria-selected={idx === activeIdx}>
                <button
                  type="button"
                  className={idx === activeIdx ? 'is-active' : undefined}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onClick={() => void goDog(dog.id)}
                >
                  <span className="home-v2-search-name">{primary}</span>
                  {dog.breed && <span className="home-v2-search-breed">{dog.breed}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {open && query.trim().length >= 2 && dogs && results.length === 0 && !loadError && (
        <p className="home-v2-search-hint">Ничего не найдено</p>
      )}
    </div>
  )
}
