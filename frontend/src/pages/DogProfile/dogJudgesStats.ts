export interface DogJudgeEventDetail {
  event_id: number
  title: string
  date: string
  avg_score: number | null
  scores: number[]
  role?: string
  discipline?: 'coursing' | 'racing'
}

export type DogJudgeVerdict = 'favors' | 'strict' | 'neutral' | 'racing_only'

export interface DogJudgeItem {
  judge_name: string
  judge_key: string
  starts_count: number
  starts_percent: number
  evaluations_count: number
  avg_score: number | null
  min_score: number | null
  max_score: number | null
  delta_vs_dog_avg: number | null
  co_judge_diff?: number | null
  co_judge_heats_count?: number
  avg_placement?: number | null
  best_placement?: number | null
  placements?: number[]
  win_rate?: number | null
  podium_rate?: number | null
  verdict?: DogJudgeVerdict
  disciplines?: ('coursing' | 'racing')[]
  events: DogJudgeEventDetail[]
}

export interface DogJudgesStats {
  total_starts: number
  total_events?: number
  total_coursing_events?: number
  coursing_events_with_judges?: number
  events_without_judges?: number
  racing_events_count?: number
  total_judges: number
  global_avg_score: number
  dog_avg_placement?: number | null
  highest_concentration?: {
    judge_name: string
    starts_count: number
    starts_percent: number
  } | null
  judges: DogJudgeItem[]
}

export interface DogProfileEventItem {
  event_id?: string | number | null
  event_type?: string
  competition_kind?: string | null
  date_start?: string | null
  date_end?: string | null
  title?: string | null
  location?: string | null
  placement?: number | string | null
  total_score?: number | string | null
  qualification?: string | null
  status?: string | null
  status_reason?: string | null
  judges?: string | null
  results_url?: string | null
}

export type RankedJudgeItem = DogJudgeItem & {
  scoreDelta: number
  placeDelta: number
}

/**
 * Склонение слова «эксперт» по правилам русского языка:
 * 1 эксперт, 2 эксперта, 5 экспертов, 21 эксперт, 22 эксперта...
 */
export function formatExpertsCount(count: number): string {
  const mod10 = Math.abs(count) % 10
  const mod100 = Math.abs(count) % 100
  if (mod100 >= 11 && mod100 <= 19) return `${count} экспертов`
  if (mod10 === 1) return `${count} эксперт`
  if (mod10 >= 2 && mod10 <= 4) return `${count} эксперта`
  return `${count} экспертов`
}

/**
 * Склонение для кнопки раскрытия списка:
 * 21 эксперта, 5 экспертов, 22 экспертов...
 */
export function formatAllExpertsButton(count: number): string {
  const mod10 = Math.abs(count) % 10
  const mod100 = Math.abs(count) % 100
  if (mod10 === 1 && mod100 !== 11) {
    return `Показать всех ${count} эксперта`
  }
  return `Показать всех ${count} экспертов`
}

export function formatShowMoreExperts(count: number): string {
  const mod10 = Math.abs(count) % 10
  const mod100 = Math.abs(count) % 100
  if (mod100 >= 11 && mod100 <= 19) return `Показать ещё ${count} экспертов`
  if (mod10 === 1) return `Показать ещё ${count} эксперта`
  if (mod10 >= 2 && mod10 <= 4) return `Показать ещё ${count} эксперта`
  return `Показать ещё ${count} экспертов`
}

export function computeDogJudgesAnalysis(
  judgeStats: DogJudgesStats,
  competitions?: DogProfileEventItem[],
) {
  const eventPlacementMap = new Map<string | number, number>()
  ;(competitions || []).forEach((c) => {
    if (c.event_id != null && c.placement != null) {
      const pl = typeof c.placement === 'number' ? c.placement : parseInt(String(c.placement), 10)
      if (Number.isFinite(pl) && pl > 0) {
        mapPlacement(eventPlacementMap, c.event_id, pl)
      }
    }
  })

  // Оставляем только курсинг (где оценивают баллами)
  const coursingJudges = (judgeStats.judges || []).filter((j) => {
    if (j.verdict === 'racing_only') return false
    if (j.disciplines && j.disciplines.length === 1 && j.disciplines[0] === 'racing') return false
    return true
  })

  const careerAvgPlace = judgeStats.dog_avg_placement ?? 2.0
  const careerAvgScore = judgeStats.global_avg_score || 83.5

  const higherThanCareer: RankedJudgeItem[] = []
  const lowerThanCareer: RankedJudgeItem[] = []

  coursingJudges.forEach((j) => {
    const avgScore = j.avg_score ?? careerAvgScore
    const avgPlace = j.avg_placement ?? careerAvgPlace

    const scoreDelta = avgScore - careerAvgScore
    const placeDelta = careerAvgPlace - avgPlace // положительно, если место лучше (1 < 2)

    const item: RankedJudgeItem = { ...j, scoreDelta, placeDelta }

    if (scoreDelta >= 0 || placeDelta > 0) {
      higherThanCareer.push(item)
    } else {
      lowerThanCareer.push(item)
    }
  })

  higherThanCareer.sort((a, b) => b.scoreDelta - a.scoreDelta || b.placeDelta - a.placeDelta)
  lowerThanCareer.sort((a, b) => a.scoreDelta - b.scoreDelta || a.placeDelta - b.placeDelta)

  return {
    eventPlacementMap,
    coursingJudges,
    careerAvgScore,
    higherThanCareer,
    lowerThanCareer,
  }
}

function mapPlacement(map: Map<string | number, number>, eventId: string | number, pl: number) {
  map.set(String(eventId), pl)
  map.set(Number(eventId), pl)
}
