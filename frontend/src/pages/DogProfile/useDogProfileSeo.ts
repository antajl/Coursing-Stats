import { useMemo } from 'react'
import { parseDogName, toDogTitleCase } from '../../lib/dogName'
import { displayBreed } from '../../lib/breedMapping'
import { showDogProfilePath } from '../../lib/showDogProfilePath'
import type { ShowDogCardData } from '../Shows/ShowDogCard'

interface UseDogProfileSeoOptions {
  headerDog: {
    id: any
    name_lat?: string | null
    name_ru?: string | null
    breed?: string | null
    sex?: string | null
  } | null
  headerBreed: string
  dog: any
  showDog: ShowDogCardData | null
  competitionId?: string
  titles: { title: string }[]
  hasCoursingData: boolean
  hasRacingData: boolean
  coursing: any
  racing: any
  hasSpeedRecords: boolean
  hasCoursingRecords: boolean
  speedStats: any
  coursingStats: any
}

export function useDogProfileSeo({
  headerDog,
  headerBreed,
  dog,
  showDog,
  competitionId,
  titles,
  hasCoursingData,
  hasRacingData,
  coursing,
  racing,
  hasSpeedRecords,
  hasCoursingRecords,
  speedStats,
  coursingStats,
}: UseDogProfileSeoOptions) {
  return useMemo(() => {
    const { primary: primaryDogName, secondary: secondaryDogName } = parseDogName(
      headerDog?.name_lat,
      headerDog?.name_ru,
    )
    const dogName = primaryDogName || toDogTitleCase(headerDog?.name_lat || headerDog?.name_ru || 'Собака')
    const displayName =
      secondaryDogName && secondaryDogName !== dogName
        ? `${dogName} (${secondaryDogName})`
        : dogName
    const dogBreed = displayBreed(headerDog?.breed || headerBreed || '').primary || headerDog?.breed || headerBreed || ''
    const dogTitles = titles.map((t) => t.title).join(', ')

    const rawPath = dog
      ? `/dog/${dog.id}`
      : showDog
        ? showDogProfilePath(showDog)
        : competitionId
          ? `/dog/${competitionId}`
          : '/'
    const profilePath = rawPath.endsWith('/') ? rawPath : `${rawPath}/`
    const canonicalUrl = `https://coursing-stats.ru${profilePath}`

    const seoFacts: string[] = []
    if (hasCoursingData) {
      seoFacts.push(`курсинг ${coursing.total_starts || 0} забегов`)
    }
    if (hasRacingData) {
      seoFacts.push(`бега ${racing.total_starts || 0} забегов`)
    }
    if (showDog && (showDog.total_shows || 0) > 0) {
      seoFacts.push(`выставки: ${showDog.total_shows}`)
    }
    if (hasSpeedRecords && speedStats?.bestSpeed != null) {
      seoFacts.push(`Донино ${speedStats.bestSpeed.toFixed(1)} км/ч`)
    }
    if (hasCoursingRecords && coursingStats?.bestTime != null) {
      seoFacts.push(`350 м ${coursingStats.bestTime.toFixed(2)} с`)
    }
    const totalGold = (coursing?.gold || 0) + (racing?.gold || 0)
    const medalText = totalGold > 0 ? `${totalGold} побед (золото)` : ''
    const description =
      seoFacts.length > 0
        ? `${displayName} (${dogBreed}): ${medalText ? `${medalText}, ` : ''}${seoFacts.join('; ')}. Профиль собаки, спортивная карьера, медали и результаты забегов на Coursing Stats.`
        : `Профиль собаки ${displayName} (${dogBreed}): курсинг, бега борзых, медали и рекорды на Coursing Stats.`
    const keywords = [
      dogName,
      secondaryDogName,
      headerDog?.name_ru,
      headerDog?.name_lat,
      dogBreed,
      'курсинг',
      'бега борзых',
      'рейтинг борзых 2026',
      'выставки',
      'Донино',
      'статистика',
      dogTitles,
      'РКФ',
    ]
      .filter(Boolean)
      .join(', ')
    const seoTitle = dogBreed
      ? `${displayName} (${dogBreed}) — профиль собаки, результаты забегов и медали`
      : `${displayName} — профиль собаки, результаты забегов и медали`

    const alternateNames = Array.from(
      new Set(
        [secondaryDogName, headerDog?.name_ru, headerDog?.name_lat].filter(
          (n): n is string => Boolean(n && n !== dogName),
        ),
      ),
    )

    return {
      dogName,
      displayName,
      dogBreed,
      profilePath,
      canonicalUrl,
      seoTitle,
      description,
      keywords,
      alternateNames,
    }
  }, [
    headerDog,
    headerBreed,
    dog,
    showDog,
    competitionId,
    titles,
    hasCoursingData,
    hasRacingData,
    coursing,
    racing,
    hasSpeedRecords,
    hasCoursingRecords,
    speedStats,
    coursingStats,
  ])
}
