import {
  aggregateAllScores,
  aggregateBreedStats,
  aggregateCriteriaStats,
  aggregateJudgeStats,
  formatBreedData,
  formatCriteriaData,
  formatJudgesData,
  filterJudgeRawRows,
  type JudgeRawRow,
} from '../judgeStats'
import { type ApiResult, fetchJson, judgeDetailKey } from './core'
import { getSportJudgeInfo } from '../sportJudgesRegistry'

interface JudgesSummaryFile {
  judges?: Record<string, unknown>[]
  availableBreeds?: string[]
}

async function loadAvailableBreeds(): Promise<string[]> {
  const summary = await fetchJson<JudgesSummaryFile>('indexes/judges-summary.json')
  return summary?.availableBreeds ?? []
}

async function loadJudgesRawRows(): Promise<JudgeRawRow[]> {
  const rows = await fetchJson<JudgeRawRow[]>('indexes/judges-raw-rows.json')
  return rows ?? []
}

export async function getJudges(
  breed = '',
  discipline = '',
  year = '',
): Promise<ApiResult<Record<string, unknown>>> {
  const availableBreeds = await loadAvailableBreeds()

  if (!breed && !discipline && !year) {
    const summary = await fetchJson<JudgesSummaryFile>('indexes/judges-summary.json')
    if (summary?.judges) {
      return { success: true, data: { judges: summary.judges, available_breeds: availableBreeds } }
    }
  }

  const rows = await loadJudgesRawRows()
  const filtered = filterJudgeRawRows(rows, { breed, discipline, year })
  const judgesData = formatJudgesData(aggregateJudgeStats(filtered))

  return { success: true, data: { judges: judgesData, available_breeds: availableBreeds } }
}

interface JudgeDetailFile {
  judge_name?: string
  full_name?: string
  city?: string
  role?: string
  categories?: string[]
  verified?: boolean
  notes?: string
  total_evaluations?: number
  avg_score?: number | null
  breed_stats?: unknown[]
  criteria_stats?: unknown[]
}

export async function getJudgeDetails(
  judgeId: string,
  breed = '',
  discipline = '',
  year = '',
): Promise<ApiResult<Record<string, unknown>>> {
  const judgeName = decodeURIComponent(judgeId)

  if (!breed && !discipline && !year) {
    const detail = await fetchJson<JudgeDetailFile>(
      `indexes/judge-details/${judgeDetailKey(judgeName)}.json`,
    )
    if (detail) return { success: true, data: detail as Record<string, unknown> }
  }

  const rows = await loadJudgesRawRows()
  const filtered = filterJudgeRawRows(rows, { breed, discipline, year })

  const breedStatsMap = aggregateBreedStats(filtered, judgeName)
  const breedData = formatBreedData(breedStatsMap, filtered, judgeName)
  const criteriaStatsMap = aggregateCriteriaStats(filtered, judgeName)
  const criteriaData = formatCriteriaData(criteriaStatsMap)
  const allScores = aggregateAllScores(filtered, judgeName)
  const overallAvg =
    allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : null
  const info = getSportJudgeInfo(judgeName)

  return {
    success: true,
    data: {
      judge_name: judgeName,
      full_name: info?.fullName,
      city: info?.city,
      role: info?.role,
      categories: info?.categories,
      verified: info?.verified,
      notes: info?.notes,
      total_evaluations: allScores.length,
      avg_score: overallAvg,
      breed_stats: breedData,
      criteria_stats: criteriaData,
    },
  }
}
