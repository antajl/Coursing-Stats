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
  total_evaluations?: number
  avg_score?: number | null
  breed_stats?: unknown[]
  criteria_stats?: unknown[]
}

export async function getJudgeDetails(
  judgeId: string,
  breed = '',
  discipline = '',
): Promise<ApiResult<Record<string, unknown>>> {
  const judgeName = decodeURIComponent(judgeId)

  if (!breed && !discipline) {
    const detail = await fetchJson<JudgeDetailFile>(
      `indexes/judge-details/${judgeDetailKey(judgeName)}.json`,
    )
    if (detail) return { success: true, data: detail as Record<string, unknown> }
  }

  const rows = await loadJudgesRawRows()
  const filtered = filterJudgeRawRows(rows, { breed, discipline })

  const breedStatsMap = aggregateBreedStats(filtered, judgeName)
  const breedData = formatBreedData(breedStatsMap, filtered, judgeName)
  const criteriaStatsMap = aggregateCriteriaStats(filtered, judgeName)
  const criteriaData = formatCriteriaData(criteriaStatsMap)
  const allScores = aggregateAllScores(filtered, judgeName)
  const overallAvg =
    allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : null

  return {
    success: true,
    data: {
      judge_name: judgeName,
      total_evaluations: allScores.length,
      avg_score: overallAvg,
      breed_stats: breedData,
      criteria_stats: criteriaData,
    },
  }
}
