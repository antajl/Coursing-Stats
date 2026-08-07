import { type ShowGradeKey } from '../../../../../backend/lib/show-grades'
import { type ApiResult, fetchJson, judgeDetailKey } from '../core'

export interface ShowJudge {
  id: string
  name: string
  /** Original name with preserved case for display */
  display_name?: string
  total_judged: number
  unique_breeds?: number
  breeds: string[]
  by_year?: Record<string, number>
  /** Доля «отлично» (0–1). */
  excellent_rate?: number | null
  graded?: number
  by_year_excellent?: Record<string, number>
  by_year_graded?: Record<string, number>
}

export interface ShowJudgeDetail {
  id: string
  name: string
  /** Original name with preserved case for display */
  display_name?: string
  total_judged: number
  unique_breeds: number
  by_year: Record<string, number>
  breeds: Array<{ breed: string; count: number }>
  exhibitions: Array<{
    id: number
    date: string
    title: string
    rkf_url?: string
    /** Оценки на выставке (protocol rows). Нули могут отсутствовать. */
    grade_counts?: Partial<Record<ShowGradeKey | 'dq', number>>
    /** Породы на выставке (protocol rows) — для фильтра периода. */
    breed_counts?: Record<string, number>
  }>
  strictness?: {
    graded: number
    grades: Record<ShowGradeKey | 'dq', number>
    excellent_rate: number | null
    below_excellent_rate: number | null
  }
}

function normalizeShowJudge(raw: ShowJudge | Record<string, unknown>): ShowJudge {
  const name = String(raw.name || '').trim()
  const displayName = (raw as ShowJudge).display_name || name
  const id =
    String((raw as ShowJudge).id || '').trim() ||
    name
      .normalize('NFKC')
      .replace(/[\u00a0\s]+/g, ' ')
      .trim()
      .toLowerCase()
  const breeds = Array.isArray(raw.breeds)
    ? (raw.breeds as unknown[]).map((b) => String(b)).filter(Boolean)
    : []
  return {
    id,
    name: name || id,
    display_name: displayName || name || id,
    total_judged: Number(raw.total_judged) || 0,
    unique_breeds:
      typeof (raw as ShowJudge).unique_breeds === 'number'
        ? (raw as ShowJudge).unique_breeds
        : breeds.length,
    breeds,
    by_year:
      raw.by_year && typeof raw.by_year === 'object'
        ? (raw.by_year as Record<string, number>)
        : {},
    excellent_rate:
      typeof (raw as ShowJudge).excellent_rate === 'number'
        ? (raw as ShowJudge).excellent_rate
        : (raw as ShowJudge).excellent_rate === null
          ? null
          : undefined,
    graded: typeof (raw as ShowJudge).graded === 'number' ? (raw as ShowJudge).graded : undefined,
    by_year_excellent:
      raw.by_year_excellent && typeof raw.by_year_excellent === 'object'
        ? (raw.by_year_excellent as Record<string, number>)
        : undefined,
    by_year_graded:
      raw.by_year_graded && typeof raw.by_year_graded === 'object'
        ? (raw.by_year_graded as Record<string, number>)
        : undefined,
  }
}

export async function getShowJudges(): Promise<ApiResult<ShowJudge[]>> {
  const judges = await fetchJson<ShowJudge[] | string[]>('shows/indexes/judges.json')
  if (!judges || !Array.isArray(judges)) {
    return { success: false, error: 'Show judges unavailable' }
  }
  // Старый формат — только имена
  if (judges.length > 0 && typeof judges[0] === 'string') {
    return {
      success: true,
      data: (judges as string[]).map((name) =>
        normalizeShowJudge({ name, total_judged: 0, breeds: [] }),
      ),
    }
  }
  return {
    success: true,
    data: (judges as ShowJudge[]).map((j) => normalizeShowJudge(j)),
  }
}

/** First-paint lean judges (truncated breeds). Full list via getShowJudges. */
export async function getShowJudgesPage0(): Promise<ApiResult<ShowJudge[]>> {
  const file = await fetchJson<{
    schema?: string
    judges?: ShowJudge[]
    count?: number
  }>('shows/indexes/judges-page0.json')
  if (!file || !Array.isArray(file.judges) || file.judges.length === 0) {
    return { success: false, error: 'Show judges page0 unavailable' }
  }
  return {
    success: true,
    data: file.judges.map((j) => normalizeShowJudge(j)),
  }
}

export async function getShowJudgeDetails(
  judgeId: string | undefined,
): Promise<ApiResult<ShowJudgeDetail>> {
  if (!judgeId) return { success: false, error: 'Judge id required' }
  const id = decodeURIComponent(judgeId)
  const detail = await fetchJson<ShowJudgeDetail>(
    `shows/indexes/judge-details/${judgeDetailKey(id)}.json`,
  )
  if (!detail || !detail.name) {
    return { success: false, error: 'Show judge not found' }
  }
  // Ensure display_name is set if not present (fallback to name)
  if (!detail.display_name) {
    detail.display_name = detail.name
  }
  return { success: true, data: detail }
}

export type ShowJudgesStrictnessBaseline = {
  schema: string
  graded: number
  excellent_rate: number
  below_excellent_rate: number
  grades: Record<ShowGradeKey | 'dq', number>
}

export async function getShowJudgesStrictnessBaseline(): Promise<ApiResult<ShowJudgesStrictnessBaseline>> {
  const file = await fetchJson<ShowJudgesStrictnessBaseline>('shows/indexes/judges-strictness-baseline.json')
  if (!file) return { success: false, error: 'Show judges strictness baseline unavailable' }
  return { success: true, data: file }
}
