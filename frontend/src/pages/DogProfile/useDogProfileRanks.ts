import { useState, useMemo, useEffect } from 'react'
import type { ProfileHeaderRank } from './DogProfileHeader'
import type { ShowDogCardData } from '../Shows/ShowDogCard'
import {
  getDogAllTimePlacementRank,
  getDogAllTimeSpeedRank,
  getDogPlacementRank,
  getDogSpeedRank,
  getDogBreedPlacementRank,
  getDogBreedSpeedRank,
  getShowDogAllTimeRank,
  getShowDogBreedRank,
  getShowDogYearRank,
} from '../../lib/staticData'
import { isShowOnlyProfileId } from '../../lib/showDogProfilePath'

interface UseDogProfileRanksOptions {
  dog: any
  showDog: ShowDogCardData | null
  events: any[]
  loading: boolean
  showsLoading: boolean
  profileId: string
}

function areRanksEqual(a: ProfileHeaderRank[], b: ProfileHeaderRank[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    const ra = a[i]
    const rb = b[i]
    if (
      ra.key !== rb.key ||
      ra.label !== rb.label ||
      ra.rank !== rb.rank ||
      ra.yearRank !== rb.yearRank ||
      ra.breedRank !== rb.breedRank ||
      ra.yearBreedRank !== rb.yearBreedRank ||
      ra.href !== rb.href
    ) {
      return false
    }
  }
  return true
}

export function useDogProfileRanks({
  dog,
  showDog,
  events,
  loading,
  showsLoading,
  profileId,
}: UseDogProfileRanksOptions): ProfileHeaderRank[] {
  const [asyncRanks, setAsyncRanks] = useState<ProfileHeaderRank[]>([])

  // Синхронные ранги курсинга и бегов из кэша пака
  const precomputedSportRanks = useMemo<ProfileHeaderRank[]>(() => {
    if (!dog) return []
    const precomputed = (dog as any)?.ranks || (dog as any)?.dog?.ranks
    if (!precomputed) return []

    const initial: ProfileHeaderRank[] = []
    if (precomputed.coursing && (precomputed.coursing.rank != null || precomputed.coursing.yearRank != null)) {
      initial.push({
        key: 'coursing',
        label: 'Курсинг',
        rank: precomputed.coursing.rank ?? null,
        yearRank: precomputed.coursing.yearRank ?? undefined,
        breedRank: precomputed.coursing.breedRank ?? undefined,
        yearBreedRank: precomputed.coursing.yearBreedRank ?? undefined,
        href: `/competitions?tab=ranking&year=${precomputed.coursing.year || '2026'}`,
      })
    }
    if (precomputed.racing && (precomputed.racing.rank != null || precomputed.racing.yearRank != null)) {
      initial.push({
        key: 'racing',
        label: 'Бега',
        rank: precomputed.racing.rank ?? null,
        yearRank: precomputed.racing.yearRank ?? undefined,
        breedRank: precomputed.racing.breedRank ?? undefined,
        yearBreedRank: precomputed.racing.yearBreedRank ?? undefined,
        href: `/competitions?tab=ranking&year=${precomputed.racing.year || '2026'}`,
      })
    }
    return initial
  }, [dog])

  // Итоговые headerRanks: предрасчитанный спорт + выставочные ранги
  const headerRanks = useMemo<ProfileHeaderRank[]>(() => {
    const map = new Map<string, ProfileHeaderRank>()
    for (const r of precomputedSportRanks) {
      map.set(r.key, r)
    }
    if (showDog) {
      const showAllTimeBreedRank =
        (showDog as any)?.breed_rank ?? (showDog as any)?.breedRank ?? undefined
      const has2026Show = Boolean(
        showDog.history && showDog.history.some((h) => h.date && h.date.includes('2026')),
      )
      map.set('shows', {
        key: 'shows',
        label: 'Выставки',
        rank: showDog.rank ?? null,
        breedRank: showAllTimeBreedRank,
        yearBreedRank: undefined,
        href: `/shows?tab=ranking&year=${has2026Show ? '2026' : ''}`,
      })
    }
    for (const r of asyncRanks) {
      map.set(r.key, r)
    }
    return Array.from(map.values())
  }, [precomputedSportRanks, showDog, asyncRanks])

  // Дозагрузка асинхронных рангов (выставки или фоллбэк спорта)
  useEffect(() => {
    let cancelled = false
    const loadRanks = async () => {
      const competitionDogId = dog?.id ?? (profileId && !isShowOnlyProfileId(profileId) ? profileId : null)
      const breed = dog?.breed || showDog?.breed || ''
      const currentYear = new Date().getFullYear().toString()
      const competitionYear = events.length > 0 && events[events.length - 1].date
        ? events[events.length - 1].date.substring(0, 4)
        : currentYear
      const has2026Show = Boolean(
        showDog?.history &&
          showDog.history.some((h) => h.date && h.date.includes('2026')),
      )
      const showYear = has2026Show
        ? '2026'
        : showDog?.history && showDog.history[0]?.date
          ? showDog.history[0].date.substring(6, 10)
          : '2026'

      const precomputed = (dog as any)?.ranks || (dog as any)?.dog?.ranks
      const hasPrecomputedSport = Boolean(precomputed?.coursing || precomputed?.racing)

      const [
        allTimePlacementRank,
        allTimeSpeedRank,
        yearPlacementRank,
        yearSpeedRank,
        breedPlacementRank,
        breedSpeedRank,
        showAllTimeRank,
        showAllTimeBreedRank,
        showYearRank,
      ] = await Promise.all([
        !hasPrecomputedSport && competitionDogId ? getDogAllTimePlacementRank(competitionDogId) : Promise.resolve(null),
        !hasPrecomputedSport && competitionDogId ? getDogAllTimeSpeedRank(competitionDogId) : Promise.resolve(null),
        !hasPrecomputedSport && competitionDogId ? getDogPlacementRank(competitionDogId, competitionYear) : Promise.resolve(null),
        !hasPrecomputedSport && competitionDogId ? getDogSpeedRank(competitionDogId, competitionYear) : Promise.resolve(null),
        !hasPrecomputedSport && competitionDogId && breed ? getDogBreedPlacementRank(competitionDogId, breed, competitionYear) : Promise.resolve(null),
        !hasPrecomputedSport && competitionDogId && breed ? getDogBreedSpeedRank(competitionDogId, breed, competitionYear) : Promise.resolve(null),
        showDog
          ? getShowDogAllTimeRank({
              showId: showDog.id,
              competitionId: showDog.competition_dog_id,
            })
          : Promise.resolve(null),
        showDog && showDog.breed && !showDog.breed_rank
          ? getShowDogBreedRank({
              showId: showDog.id,
              competitionId: showDog.competition_dog_id,
              breed: showDog.breed,
              year: showYear,
            })
          : Promise.resolve(showDog?.breed_rank ?? null),
        showDog && !showDog.rank
          ? getShowDogYearRank({
              showId: showDog.id,
              competitionId: showDog.competition_dog_id,
              year: showYear,
            })
          : Promise.resolve(showDog?.rank ?? null),
      ])

      if (cancelled) return

      const newRanks: ProfileHeaderRank[] = []
      if (!hasPrecomputedSport && (allTimePlacementRank || yearPlacementRank)) {
        newRanks.push({
          key: 'coursing',
          label: 'Курсинг',
          rank: allTimePlacementRank,
          yearRank: yearPlacementRank || undefined,
          breedRank: breedPlacementRank || undefined,
          href: `/competitions?tab=ranking&year=${competitionYear}`,
        })
      }
      if (!hasPrecomputedSport && (allTimeSpeedRank || yearSpeedRank)) {
        newRanks.push({
          key: 'racing',
          label: 'Бега',
          rank: allTimeSpeedRank,
          yearRank: yearSpeedRank || undefined,
          breedRank: breedSpeedRank || undefined,
          href: `/competitions?tab=ranking&year=${competitionYear}`,
        })
      }
      if (showDog) {
        newRanks.push({
          key: 'shows',
          label: 'Выставки',
          rank: showDog.rank ?? showAllTimeRank,
          yearRank: showYearRank || undefined,
          breedRank: showAllTimeBreedRank || undefined,
          href: `/shows?tab=ranking&year=${has2026Show ? '2026' : ''}`,
        })
      }
      setAsyncRanks((prev) => (areRanksEqual(prev, newRanks) ? prev : newRanks))
    }

    if (!loading && !showsLoading) {
      loadRanks()
    }

    return () => {
      cancelled = true
    }
  }, [
    dog?.id,
    dog?.breed,
    showDog?.id,
    showDog?.breed,
    showDog?.rank,
    (showDog as any)?.breed_rank,
    showDog?.history?.length,
    events.length,
    events.length > 0 ? events[events.length - 1]?.date : '',
    loading,
    showsLoading,
    profileId,
  ])

  return headerRanks
}
