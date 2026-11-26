import { useEffect, useMemo, useState } from 'react'
import { queryGlobalSearchShards } from '../../../components/nav/searchShardClient'
import { getBreedHubByCanonicalKey } from '../../../lib/breed-hubs-data'
import type { ExistingDog } from '../constants'

export function resolveCanonicalBreedLabel(rawBreed: string): string {
  const trimmed = (rawBreed || '').trim()
  if (!trimmed) return ''
  const hub = getBreedHubByCanonicalKey(trimmed)
  return hub ? hub.nameRu : trimmed
}

export function useProtocolDogSearch(searchQuery: string) {
  const [localDogs, setLocalDogs] = useState<ExistingDog[]>([])
  const [shardHits, setShardHits] = useState<ExistingDog[]>([])

  useEffect(() => {
    let cancelled = false
    fetch('/data/v1/indexes/dogs-index.json')
      .then((res) => (res.ok ? res.json() : []))
      .then(
        (
          data: Array<{
            id?: number | string
            name_ru?: string
            name_lat?: string
            breed?: string
            sex?: 'male' | 'female' | null
          }>
        ) => {
          if (cancelled || !Array.isArray(data)) return
          const list: ExistingDog[] = []
          const seen = new Set<string>()
          for (const d of data) {
            const nameRu = (d.name_ru || '').trim()
            const nameLat = (d.name_lat || '').trim()
            const primaryName = (nameRu || nameLat).trim()
            const breed = resolveCanonicalBreedLabel(d.breed || '')
            const key = `${primaryName.toUpperCase()}::${breed.toUpperCase()}`
            if (primaryName && !seen.has(key)) {
              seen.add(key)
              list.push({
                id: d.id != null ? String(d.id) : undefined,
                name: primaryName,
                name_ru: nameRu,
                name_lat: nameLat,
                breed,
                sex: d.sex || null,
                source: 'sport',
              })
            }
          }
          setLocalDogs(list)
        }
      )
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const trimmed = searchQuery.trim()
    if (trimmed.length < 3) {
      setShardHits([])
      return
    }

    let cancelled = false
    const timer = window.setTimeout(() => {
      void queryGlobalSearchShards(trimmed)
        .then(({ dogs }) => {
          if (cancelled) return
          const mapped: ExistingDog[] = dogs.map((hit) => ({
            id: hit.id,
            name: hit.namePrimary,
            name_ru: hit.namePrimary,
            name_lat: hit.nameSecondary,
            breed: resolveCanonicalBreedLabel(hit.breedOrMeta.split('·')[0] || ''),
            sex: null,
            source: hit.kind === 's' ? 'show' : hit.kind === 'd' ? 'donino' : 'sport',
          }))
          setShardHits(mapped)
        })
        .catch(() => {
          if (!cancelled) setShardHits([])
        })
    }, 120)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [searchQuery])

  const filteredExistingDogs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (q.length < 2) return []

    const localMatches = localDogs
      .filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          Boolean(d.name_ru && d.name_ru.toLowerCase().includes(q)) ||
          Boolean(d.name_lat && d.name_lat.toLowerCase().includes(q))
      )
      .slice(0, 8)

    const merged: ExistingDog[] = []
    const seen = new Set<string>()
    for (const item of [...localMatches, ...shardHits]) {
      const key = `${item.name.toLowerCase()}::${item.breed.toLowerCase()}`
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(item)
      if (merged.length >= 12) break
    }
    return merged
  }, [searchQuery, localDogs, shardHits])

  return {
    filteredExistingDogs,
  }
}
