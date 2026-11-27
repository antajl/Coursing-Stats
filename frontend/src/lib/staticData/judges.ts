import {
  aggregateAllScores,
  aggregateBreedStats,
  aggregateCriteriaStats,
  aggregateJudgeStats,
  formatBreedData,
  formatCriteriaData,
  formatJudgesData,
  filterJudgeRawRows,
  parseJudgeNames,
  type JudgeRawRow,
} from '../judgeStats'
import { type ApiResult, fetchJson, judgeDetailKey } from './core'
import { getSportJudgeInfo } from '../sportJudgesRegistry'
import { resolveSportJudgeLegacyId, resolveSportJudgeNumericId } from '../judgeIdMap.generated'

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

export interface CalendarJudgeEvent {
  event_id: number | string
  title: string
  date: string
  competition_type?: string | null
  event_type?: string | null
  location?: string | null
  result_count?: number | null
}

interface CalendarIndexRow {
  id?: number | string
  title?: string | null
  date_start?: string | null
  competition_type?: string | null
  event_type?: string | null
  location?: string | null
  judges?: string | null
  result_count?: number | null
  participants_count?: number | null
}

async function loadCalendarEventsForJudge(
  judgeName: string,
  discipline = '',
  year = '',
): Promise<CalendarJudgeEvent[]> {
  const calendar = await fetchJson<CalendarIndexRow[]>('indexes/calendar-index.json')
  if (!Array.isArray(calendar)) return []
  const out: CalendarJudgeEvent[] = []
  for (const ev of calendar) {
    if (!ev?.id || !ev.judges) continue
    if (discipline && ev.event_type !== discipline) continue
    if (year && !(ev.date_start ?? '').startsWith(`${year}-`)) continue
    if (!parseJudgeNames(ev.judges).includes(judgeName)) continue
    out.push({
      event_id: ev.id,
      title: ev.title || 'Мероприятие',
      date: ev.date_start || '',
      competition_type: ev.competition_type || null,
      event_type: ev.event_type || null,
      location: ev.location || null,
      result_count: ev.result_count ?? ev.participants_count ?? null,
    })
  }
  return out.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}

export async function getJudgeDetails(
  judgeId: string,
  breed = '',
  discipline = '',
  year = '',
): Promise<ApiResult<Record<string, unknown>>> {
  const judgeName = resolveSportJudgeLegacyId(judgeId) || decodeURIComponent(judgeId)

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
  const calendarEvents =
    breedData.length === 0 ? await loadCalendarEventsForJudge(judgeName, discipline, year) : []

  return {
    success: true,
    data: {
      numeric_id: resolveSportJudgeNumericId(judgeId) ?? resolveSportJudgeNumericId(judgeName) ?? undefined,
      judge_name: judgeName,
      full_name: info?.fullName,
      city: info?.city,
      role: info?.role,
      categories: info?.categories,
      verified: info?.verified,
      notes: info?.notes,
      rkf_id: info?.rkfId,
      total_evaluations: allScores.length,
      avg_score: overallAvg,
      breed_stats: breedData,
      criteria_stats: criteriaData,
      calendar_events: calendarEvents,
    },
  }
}
