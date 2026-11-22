import { useMemo } from 'react'
import type { DogPassportData } from './passportTypes'
import { toDogTitleCase } from '../../../../lib/dogName'
import { displayBreed } from '../../../../lib/breedMapping'
import { presentShowAwards } from '../../../../../../backend/lib/show-award-ranking'
import type { DogTitle } from '../../../../lib/qualificationTitles'
import type { HeaderRanks } from '../../StandingPlaceExplainer'

export interface UseDogPassportDataParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dog: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  showDog?: any
  supremeTitles?: (string | DogTitle)[]
  competitionTitles?: (string | DogTitle)[]
  coursingTitles?: (string | DogTitle)[]
  racingTitles?: (string | DogTitle)[]
  showTitles?: (string | DogTitle)[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coursing?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  racing?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  speedStats?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coursingStats?: any
  ranks?: HeaderRanks
}

function extractTitleString(t: string | DogTitle): string {
  if (typeof t === 'string') return t.trim()
  return (t?.title || '').trim()
}

export function buildDogPassportData({
  dog,
  showDog,
  supremeTitles = [],
  competitionTitles = [],
  coursingTitles = [],
  racingTitles = [],
  showTitles = [],
  coursing,
  racing,
  speedStats,
  coursingStats,
  ranks,
}: UseDogPassportDataParams): DogPassportData {
  const dogId = dog?.id || showDog?.id || '0'
  const rawPrimary = dog?.name_lat || dog?.name_ru || showDog?.name_lat || showDog?.name_ru || 'Собака'
  const namePrimary = toDogTitleCase(rawPrimary)

  let nameSecondary: string | null = null
  if (dog?.name_ru && dog.name_lat && dog.name_ru !== dog.name_lat) {
    nameSecondary = toDogTitleCase(dog.name_ru)
  } else if (showDog?.name_ru && showDog.name_lat && showDog.name_ru !== showDog.name_lat) {
    nameSecondary = toDogTitleCase(showDog.name_ru)
  }

  const rawBreed = dog?.breed || showDog?.breed || ''
  const breedDisplay = displayBreed(rawBreed)
  const breedPrimary = breedDisplay.primary || rawBreed
  const breedVariety = breedDisplay.variety || null

  // Сбор уникальных официальных титулов
  const rawTitles = [
    ...supremeTitles.map(extractTitleString),
    ...competitionTitles.map(extractTitleString),
    ...coursingTitles.map(extractTitleString),
    ...racingTitles.map(extractTitleString),
    ...showTitles.map(extractTitleString),
  ].filter(Boolean)
  const uniqueTitles = Array.from(new Set(rawTitles)).slice(0, 8)

  // 1. Полевой спорт (Курсинг и Рейсинг)
  const coursingStarts = Number(coursing?.total_starts || 0)
  const racingStarts = Number(racing?.total_starts || 0)
  const totalStarts = coursingStarts + racingStarts
  const gold = Number(coursing?.gold || 0) + Number(racing?.gold || 0)
  const silver = Number(coursing?.silver || 0) + Number(racing?.silver || 0)
  const bronze = Number(coursing?.bronze || 0) + Number(racing?.bronze || 0)
  const bestScore = coursing?.best_judge_score ? Number(coursing.best_judge_score) : null
  const avgScore = coursing?.avg_judge_score ? Number(coursing.avg_judge_score) : null
  const bestSpeed = racing?.best_speed ? Number(racing.best_speed) : null
  const rank = ranks?.coursing?.rank || ranks?.racing?.rank || null

  const hasSportData = totalStarts > 0 || gold > 0 || silver > 0 || bronze > 0

  // 2. Скоростные испытания (Донино)
  const doninoBestSpeed = speedStats?.bestSpeed != null && Number.isFinite(speedStats.bestSpeed)
    ? Number(speedStats.bestSpeed)
    : null
  const doninoAvgSpeed = speedStats?.avgSpeed != null && Number.isFinite(speedStats.avgSpeed)
    ? Number(speedStats.avgSpeed)
    : null
  const doninoBestTime = coursingStats?.bestTime != null && Number.isFinite(coursingStats.bestTime)
    ? Number(coursingStats.bestTime)
    : null

  const hasDoninoData = doninoBestSpeed != null || doninoBestTime != null

  // 3. Выставки РКФ
  const totalShows = Number(showDog?.total_shows || (Array.isArray(showDog?.history) ? showDog.history.length : 0))
  let bisCount = 0
  let bigCount = 0
  let bobCount = 0

  if (showDog) {
    try {
      const awards = presentShowAwards(showDog)
      bisCount = awards.bis || 0
      bigCount = awards.big || 0
      bobCount = awards.bob || 0
    } catch {
      // fallback
    }
  }

  const hasShowData = totalShows > 0 || Boolean(showDog?.best_award)

  // Метаданные верификации
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://coursing-stats.ru'
  const dogUrl = `${origin}/dog/${dogId}`

  const now = new Date()
  const issueDate = now.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })

  return {
    id: dogId,
    namePrimary,
    nameSecondary,
    breedPrimary,
    breedVariety,
    sex: dog?.sex || showDog?.sex || null,
    photoUrl: dog?.photo_url || showDog?.photo_url || null,
    titles: uniqueTitles,
    sport: {
      hasData: hasSportData,
      totalStarts,
      gold,
      silver,
      bronze,
      bestScore,
      avgScore,
      bestSpeed,
      rank,
    },
    donino: {
      hasData: hasDoninoData,
      bestSpeed: doninoBestSpeed,
      avgSpeed: doninoAvgSpeed,
      speedRank: speedStats?.breedRank || null,
      speedTotal: speedStats?.breedTotal || null,
      bestTime: doninoBestTime,
      timeRank: coursingStats?.breedRank || null,
      timeTotal: coursingStats?.breedTotal || null,
    },
    shows: {
      hasData: hasShowData,
      totalShows,
      bestAward: showDog?.best_award || null,
      bestGrade: showDog?.best_grade || null,
      bisCount,
      bigCount,
      bobCount,
      rankScore: showDog?.rank_score || null,
    },
    dogUrl,
    issueDate,
  }
}

export function useDogPassportData(params: UseDogPassportDataParams): DogPassportData {
  return useMemo(() => buildDogPassportData(params), [params])
}
