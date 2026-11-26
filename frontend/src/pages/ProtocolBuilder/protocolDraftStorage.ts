import type { CompetitionHeader, CategoryGroup, CompetitionKind, RunData, DogParticipant } from './types'
import { createRunData, createEmptyScores } from './types'
import { STORAGE_KEY, DEFAULT_HEADER } from './constants'

export interface LoadedProtocolDraft {
  header?: CompetitionHeader
  kind?: CompetitionKind
  categories?: CategoryGroup[]
}

function normalizeRun(r: Record<string, any>, rIdx: number): RunData {
  const scores = r?.scores
    ? {
        speed: typeof r.scores.speed === 'number' ? r.scores.speed : ('' as const),
        enthusiasm: typeof r.scores.enthusiasm === 'number' ? r.scores.enthusiasm : ('' as const),
        intelligence: typeof r.scores.intelligence === 'number' ? r.scores.intelligence : ('' as const),
        agility: typeof r.scores.agility === 'number' ? r.scores.agility : ('' as const),
        endurance: typeof r.scores.endurance === 'number' ? r.scores.endurance : ('' as const),
      }
    : createEmptyScores()

  const fallbackBlanket = rIdx === 0 ? 'red' : rIdx === 1 ? 'white' : 'blue'
  return {
    heat:
      String(r?.heat || String(rIdx + 1))
        .replace(/\D/g, '')
        .slice(0, 3) || String(rIdx + 1),
    blanket: r?.blanket || fallbackBlanket,
    scores,
    status: r?.status === 'withdrawn' || r?.status === 'absent' ? r.status : 'normal',
    reason: typeof r?.reason === 'string' ? r.reason : '',
  }
}

function normalizeDog(d: Record<string, any>, dIdx: number): DogParticipant {
  const rawRuns =
    Array.isArray(d.runs) && d.runs.length > 0
      ? d.runs
      : [
          d.run1_scores
            ? { heat: d.run1_heat || '1', blanket: d.run1_blanket || 'red', scores: d.run1_scores }
            : createRunData('1', 'red'),
          d.run2_scores
            ? { heat: d.run2_heat || '1', blanket: d.run2_blanket || 'white', scores: d.run2_scores }
            : createRunData('1', 'white'),
        ]

  const racingObj = (d.racing && typeof d.racing === 'object' ? d.racing : {}) as Record<string, unknown>

  return {
    id: typeof d.id === 'string' && d.id ? d.id : 'dog_' + Math.random().toString(36).substring(2, 9),
    catalogNumber: String(d.catalogNumber ?? d.catalog_number ?? dIdx + 1),
    dogName: typeof (d.dogName ?? d.dog_name) === 'string' ? (d.dogName ?? d.dog_name) : '',
    sex: d.sex === 'female' ? 'female' : 'male',
    runs: rawRuns.map((r: Record<string, any>, rIdx: number) => normalizeRun(r, rIdx)),
    racing_box: String(d.racing_box ?? racingObj.box ?? '1'),
    racing_time1: String(d.racing_time1 ?? racingObj.time1 ?? ''),
    racing_time2: String(d.racing_time2 ?? racingObj.time2 ?? ''),
    racing_final_time: String(d.racing_final_time ?? racingObj.final_time ?? ''),
    disqualified: Boolean(d.disqualified),
    comment: typeof d.comment === 'string' ? d.comment : '',
    awards: Array.isArray(d.awards) ? d.awards.filter((a): a is string => typeof a === 'string') : [],
  }
}

export function normalizeLoadedProtocolPayload(parsed: unknown): LoadedProtocolDraft | null {
  if (!parsed || typeof parsed !== 'object') return null
  const obj = parsed as Record<string, any>
  const rawHeader = (obj.header || obj.competition) as Record<string, any> | undefined

  let header: CompetitionHeader | undefined
  if (rawHeader && typeof rawHeader === 'object') {
    header = {
      ...DEFAULT_HEADER,
      title: typeof rawHeader.title === 'string' ? rawHeader.title : DEFAULT_HEADER.title,
      rank: typeof rawHeader.rank === 'string' ? rawHeader.rank : DEFAULT_HEADER.rank,
      date: typeof rawHeader.date === 'string' ? rawHeader.date : DEFAULT_HEADER.date,
      location: typeof rawHeader.location === 'string' ? rawHeader.location : '',
      club: typeof rawHeader.club === 'string' ? rawHeader.club : '',
      judges: typeof rawHeader.judges === 'string' ? rawHeader.judges : '',
    }
  }

  const kind: CompetitionKind | undefined =
    obj.kind === 'coursing' || obj.kind === 'racing' || obj.kind === 'bzmp' ? obj.kind : undefined

  let categories: CategoryGroup[] | undefined
  if (Array.isArray(obj.categories) && obj.categories.length > 0) {
    categories = obj.categories.map((c: Record<string, any>) => {
      const runsRaw = c.runsCount ?? c.runs_count
      const runsCount: 1 | 2 | 3 = runsRaw === 1 || runsRaw === 2 || runsRaw === 3 ? runsRaw : 2
      return {
        id:
          typeof (c.id || c.category_id) === 'string' && (c.id || c.category_id)
            ? c.id || c.category_id
            : 'cat_' + Math.random().toString(36).substring(2, 9),
        breed: typeof c.breed === 'string' && c.breed ? c.breed : 'Уиппет',
        className: typeof (c.className ?? c.class) === 'string' && (c.className ?? c.class) ? (c.className ?? c.class) : 'Стандартный',
        sex: c.sex === 'female' || c.sex === 'mixed' ? c.sex : 'male',
        runsCount,
        dogs: Array.isArray(c.dogs) ? c.dogs.map((d: Record<string, any>, dIdx: number) => normalizeDog(d, dIdx)) : [],
      }
    })
  }

  if (!header && !categories && !kind) return null
  return { header, kind, categories }
}

export function parseImportedProtocolJson(jsonText: string): LoadedProtocolDraft | null {
  try {
    return normalizeLoadedProtocolPayload(JSON.parse(jsonText))
  } catch {
    return null
  }
}

export function loadProtocolDraft(): LoadedProtocolDraft | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return null
    return normalizeLoadedProtocolPayload(JSON.parse(saved))
  } catch {
    return null
  }
}

export function saveProtocolDraft(data: {
  header: CompetitionHeader
  kind: CompetitionKind
  categories: CategoryGroup[]
}): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export function clearProtocolDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
