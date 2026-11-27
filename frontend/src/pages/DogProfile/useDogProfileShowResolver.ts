import { useState, useEffect } from 'react'
import { resolveShowDogDetail, fetchJson } from '../../lib/staticData'
import { transliterateCyrillicToLatin } from '../../lib/dogName'
import { canonicalBreed } from '../../lib/breedMapping'
import type { ShowDogCardData } from '../Shows/ShowDogCard'

export interface UseDogProfileShowResolverProps {
  profileId: string
  competitionId?: string
  effectiveSportDogId?: string
  dog: any | null
  loading: boolean
  isLegacyShowRoute: boolean
  showRouteDogId?: string
  showRouteBreed?: string
  queryName: string | null
  queryBreed: string | null
  isShowOnly: boolean
}

export function useDogProfileShowResolver({
  profileId,
  competitionId,
  effectiveSportDogId,
  dog,
  loading,
  isLegacyShowRoute,
  showRouteDogId,
  showRouteBreed,
  queryName,
  queryBreed,
  isShowOnly,
}: UseDogProfileShowResolverProps) {
  const currentTargetKey = profileId || (isLegacyShowRoute ? `legacy:${showRouteDogId}` : '')
  const [resolvedState, setResolvedState] = useState<{
    key: string
    dog: ShowDogCardData | null
  }>({ key: '', dog: null })
  const [showsLoading, setShowsLoading] = useState(true)
  const [fallbackState, setFallbackState] = useState<{ key: string; id: string | null }>({
    key: '',
    id: null,
  })

  const showDog = resolvedState.key === currentTargetKey ? resolvedState.dog : null
  const effectiveShowsLoading = showsLoading || resolvedState.key !== currentTargetKey
  const fallbackSportDogId = fallbackState.key === currentTargetKey ? fallbackState.id : null

  const resolvedCompId = dog?.id ? String(dog.id) : (effectiveSportDogId || competitionId)
  const resolvedNameLat = dog?.name_lat || queryName || ''
  const resolvedNameRu = dog?.name_ru || queryName || ''
  const resolvedBreed = dog?.breed || showRouteBreed || queryBreed || ''

  // Выставки: запускаем сразу параллельно со спортом по id / competitionId, не дожидаясь окончания loading
  useEffect(() => {
    let cancelled = false
    const hasIdLookup = Boolean(profileId || (isLegacyShowRoute && showRouteDogId) || resolvedCompId)
    const hasNameLookup = Boolean(resolvedBreed && (resolvedNameLat || resolvedNameRu))
    if (!hasIdLookup && !( !loading && hasNameLookup )) {
      if (!loading) {
        setResolvedState({ key: currentTargetKey, dog: null })
        setShowsLoading(false)
      }
      return
    }

    const loadShows = async () => {
      setShowsLoading(true)
      try {
        const result = await resolveShowDogDetail({
          profileId: profileId || (isLegacyShowRoute ? showRouteDogId : null),
          competitionId: resolvedCompId,
          nameLat: resolvedNameLat,
          nameRu: resolvedNameRu,
          breed: resolvedBreed || undefined,
        })
        if (!cancelled) {
          setResolvedState({
            key: currentTargetKey,
            dog: result.success && result.data ? result.data : null,
          })
        }
      } catch {
        if (!cancelled) setResolvedState({ key: currentTargetKey, dog: null })
      } finally {
        if (!cancelled) {
          // Если спорт ещё грузится и собака не найдена по ID, оставляем индикатор до прихода кличка+порода
          if (!loading || hasNameLookup || hasIdLookup) {
            setShowsLoading(false)
          }
        }
      }
    }
    loadShows()
    return () => {
      cancelled = true
    }
  }, [resolvedCompId, resolvedNameLat, resolvedNameRu, resolvedBreed, loading, showRouteDogId, isLegacyShowRoute, profileId, currentTargetKey])

  // Fallback: If show-only profile ID didn't resolve to showDog or sportDog, but queryName exists,
  // search in dogs-index.json to avoid 404 if the dog exists in the sport database.
  useEffect(() => {
    if (!isShowOnly || dog || showDog || loading || effectiveShowsLoading || !queryName || fallbackSportDogId) {
      return
    }
    let cancelled = false
    const matchSportDog = async () => {
      try {
        const dogs = await fetchJson<Array<{ id: number; name_lat: string; name_ru?: string; breed: string }>>('indexes/dogs-index.json')
        if (cancelled || !Array.isArray(dogs)) return
        const qName = queryName.toUpperCase().replace(/\s+/g, ' ').trim()
        const qTranslit = transliterateCyrillicToLatin(qName).toUpperCase().replace(/\s+/g, ' ').trim()
        const qBreed = (queryBreed || '').toUpperCase().replace(/\s+/g, ' ').trim()
        const qCanBreed = canonicalBreed(qBreed).toUpperCase().replace(/\s+/g, ' ').trim()

        const nameVariants = new Set<string>([qName, qTranslit].filter(Boolean))
        for (const base of Array.from(nameVariants)) {
          nameVariants.add(base.replace(/([A-ZА-ЯЁ])\1+/g, '$1'))
          if (base.endsWith('EE')) nameVariants.add(base.slice(0, -1))
          if (base.endsWith('E') && !base.endsWith('EE')) nameVariants.add(base + 'E')
        }

        for (const d of dogs) {
          const dBreed = (d.breed || '').toUpperCase().replace(/\s+/g, ' ').trim()
          const dCanBreed = canonicalBreed(dBreed).toUpperCase().replace(/\s+/g, ' ').trim()
          const breedMatches = !qBreed || dBreed === qBreed || dCanBreed === qCanBreed || dBreed === qCanBreed || dCanBreed === qBreed
          if (!breedMatches) continue

          const dNames = [d.name_lat, d.name_ru]
            .filter(Boolean)
            .flatMap((n) => (n as string).split('/'))
            .map((chunk) => chunk.trim().toUpperCase().replace(/\s+/g, ' '))
            .filter(Boolean)

          const matched = dNames.some((dn) => {
            if (nameVariants.has(dn)) return true
            const dnTranslit = transliterateCyrillicToLatin(dn).toUpperCase().replace(/\s+/g, ' ').trim()
            if (nameVariants.has(dnTranslit)) return true
            return false
          })

          if (matched) {
            setFallbackState({ key: currentTargetKey, id: String(d.id) })
            break
          }
        }
      } catch {
        // Ignore fallback errors
      }
    }
    matchSportDog()
    return () => {
      cancelled = true
    }
  }, [isShowOnly, dog, showDog, loading, effectiveShowsLoading, queryName, queryBreed, fallbackSportDogId, currentTargetKey])

  return {
    showDog,
    showsLoading: effectiveShowsLoading,
    fallbackSportDogId,
  }
}
