import { useMemo } from 'react'
import type { DogPassportData, DogPassportHighlight, DogPassportTitle } from './passportTypes'
import { toDogTitleCase } from '../../../../lib/dogName'
import { displayBreed } from '../../../../lib/breedMapping'
import { presentShowAwards } from '../../../../../../backend/lib/show-award-ranking'
import { competitionTitleDisplayName } from '../../../../../../backend/lib/competition-titles'
import { getFullTitleLabel } from '../../../../lib/awardTooltip'
import type { DogTitle } from '../../../../lib/qualificationTitles'
import type { ProfileHeaderRank } from '../../DogProfileHeader'

export interface UseDogPassportDataParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dog: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  showDog?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  events?: any[]
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
  ranks?: ProfileHeaderRank[]
}

function extractTitleString(t: string | DogTitle): string {
  if (typeof t === 'string') return t.trim()
  return (t?.title || '').trim()
}

export function buildDogPassportData({
  dog,
  showDog,
  events = [],
  supremeTitles = [],
  competitionTitles = [],
  coursingTitles = [],
  racingTitles = [],
  showTitles = [],
  coursing,
  racing,
  speedStats,
  coursingStats,
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

  // Официальные звания с человекочитаемыми расшифровками
  const rawTitles = [
    ...supremeTitles.map(extractTitleString),
    ...competitionTitles.map(extractTitleString),
    ...coursingTitles.map(extractTitleString),
    ...racingTitles.map(extractTitleString),
    ...showTitles.map(extractTitleString),
  ].filter(Boolean)

  const seenBadges = new Set<string>()
  const titles: DogPassportTitle[] = []
  for (const t of rawTitles) {
    const badge = competitionTitleDisplayName(t)
    if (seenBadges.has(badge)) continue
    seenBadges.add(badge)
    const full = getFullTitleLabel(t) || getFullTitleLabel(badge)
    titles.push({ badge, label: full || badge })
    if (titles.length >= 8) break
  }

  // 1. Курсинг (отдельно от рейсинга)
  const cStats = dog?.coursing_stats || coursing || {}
  const coursingStarts = Number(cStats.total_starts || 0)
  const coursingGold = Number(cStats.gold || 0)
  const coursingSilver = Number(cStats.silver || 0)
  const coursingBronze = Number(cStats.bronze || 0)
  const coursingBestScore = cStats.best_score != null ? Number(cStats.best_score) : null
  const coursingAvgJudgeScore = cStats.avg_judge_score != null ? Number(cStats.avg_judge_score) : null
  const coursingBestJudgeScore = cStats.best_judge_score != null ? Number(cStats.best_judge_score) : null
  const coursingBreedRank = dog?.ranks?.coursing?.breedRank || null
  const coursingYearBreedRank = dog?.ranks?.coursing?.yearBreedRank || null

  // 2. Рейсинг (бега борзых)
  const rStats = dog?.racing_stats || racing || {}
  const racingStarts = Number(rStats.total_starts || 0)
  const racingGold = Number(rStats.gold || 0)
  const racingSilver = Number(rStats.silver || 0)
  const racingBronze = Number(rStats.bronze || 0)
  const racingBestSpeed = rStats.best_speed != null ? Number(rStats.best_speed) : null
  const racingAvgSpeed = rStats.avg_speed != null ? Number(rStats.avg_speed) : null
  const racingBreedRank = dog?.ranks?.racing?.breedRank || null
  const racingYearBreedRank = dog?.ranks?.racing?.yearBreedRank || null

  // 3. Скоростные испытания (Донино)
  const doninoBestSpeed = speedStats?.bestSpeed != null && Number.isFinite(speedStats.bestSpeed)
    ? Number(speedStats.bestSpeed)
    : null
  const doninoAvgSpeed = speedStats?.avgSpeed != null && Number.isFinite(speedStats.avgSpeed)
    ? Number(speedStats.avgSpeed)
    : null
  const doninoBestTime = coursingStats?.bestTime != null && Number.isFinite(coursingStats.bestTime)
    ? Number(coursingStats.bestTime)
    : null

  // 4. Выставки РКФ
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

  // 5. Главные турнирные победы (Highlights)
  const highlights: DogPassportHighlight[] = (Array.isArray(events) ? events : [])
    .filter((e) => e.placement != null && Number(e.placement) > 0 && Number(e.placement) <= 3)
    .sort((a, b) => {
      if (a.placement !== b.placement) return Number(a.placement) - Number(b.placement)
      return (Number(b.total_score) || 0) - (Number(a.total_score) || 0)
    })
    .slice(0, 4)
    .map((e) => {
      const cleanTitle = String(e.title || 'Соревнование')
        .replace(/^\d{4,}\s*[-–]\s*/, '')
        .trim()
      let scoreStr: string | number | undefined = undefined
      if (e.total_score != null) {
        scoreStr = Number(e.total_score) < 40 ? `${e.total_score} с` : `${e.total_score} б.`
      } else if (e.speed_kmh) {
        scoreStr = `${e.speed_kmh} км/ч`
      }
      return {
        placement: Number(e.placement),
        title: cleanTitle,
        year: e.event_date ? new Date(e.event_date).getFullYear() : (e.year || undefined),
        score: scoreStr,
        qualification: e.qualification || undefined,
        discipline: e.event_type || 'coursing',
      }
    })

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
    pedigreeUrl: dog?.pedigree_url || showDog?.pedigree_url || null,
    titles,
    coursing: {
      hasData: coursingStarts > 0,
      totalStarts: coursingStarts,
      gold: coursingGold,
      silver: coursingSilver,
      bronze: coursingBronze,
      bestScore: coursingBestScore,
      avgJudgeScore: coursingAvgJudgeScore,
      bestJudgeScore: coursingBestJudgeScore,
      breedRank: coursingBreedRank,
      yearBreedRank: coursingYearBreedRank,
    },
    racing: {
      hasData: racingStarts > 0,
      totalStarts: racingStarts,
      gold: racingGold,
      silver: racingSilver,
      bronze: racingBronze,
      bestSpeed: racingBestSpeed,
      avgSpeed: racingAvgSpeed,
      breedRank: racingBreedRank,
      yearBreedRank: racingYearBreedRank,
    },
    donino: {
      hasData: doninoBestSpeed != null || doninoBestTime != null,
      bestSpeed: doninoBestSpeed,
      avgSpeed: doninoAvgSpeed,
      speedRank: speedStats?.breedRank || null,
      speedTotal: speedStats?.breedTotal || null,
      bestTime: doninoBestTime,
      timeRank: coursingStats?.breedRank || null,
      timeTotal: coursingStats?.breedTotal || null,
    },
    shows: {
      hasData: totalShows > 0 || Boolean(showDog?.best_award),
      totalShows,
      bestAward: showDog?.best_award || null,
      bestGrade: showDog?.best_grade || null,
      bisCount,
      bigCount,
      bobCount,
      rankScore: showDog?.rank_score || null,
    },
    highlights,
    dogUrl,
    issueDate,
  }
}

export function useDogPassportData(params: UseDogPassportDataParams): DogPassportData {
  return useMemo(() => buildDogPassportData(params), [params])
}
