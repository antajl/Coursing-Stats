/**
 * Типы и контракты для расчёта накопительных (кумулятивных) и собирательных званий РКФ/FCI.
 */

export interface CumulativeRequirement {
  text: string
  completed: boolean
  currentCount?: number
  targetCount?: number
  details?: string
}

export interface CumulativeTitle {
  id: string
  title: string
  badge: string
  domain: 'show' | 'sport' | 'supreme'
  status: 'completed' | 'in_progress' | 'locked'
  progressPercent: number
  fulfilledBasis?: string
  fulfilledDate?: string
  rulesSummary: string
  requirements: CumulativeRequirement[]
  nextStepAdvice?: string
}

export type InProgressTitle = CumulativeTitle

export interface DogCompetitionEntry {
  event_id?: number | string
  title?: string | null
  date_start?: string | null
  date_end?: string | null
  event_type?: string | null
  competition_kind?: string | null
  placement?: number | null
  qualification?: string | null
  judges?: string | null
  location?: string | null
  status?: string | null
}

export interface DogShowHistoryEntry {
  date?: string
  exhibition_id?: number | string
  exhibition_title?: string
  placement?: number
  title?: string
  grade?: string
  judge?: string
}

export interface DogCareerData {
  dogId?: string | number
  breed?: string
  competitions?: DogCompetitionEntry[] | null
  competitionTitles?: Array<{ title: string; count: number }> | null
  showTitles?: Record<string, number> | null
  showHistory?: DogShowHistoryEntry[] | null
}

export interface CertificateEventItem {
  eventId?: number | string
  exhibitionId?: number | string
  title: string
  date?: string
  judge?: string
}

export interface DogCertificatesSummary {
  caclEventsCoursing: Array<{ eventId?: number | string; title: string; date?: string; judge?: string }>
  caclEventsRacing: Array<{ eventId?: number | string; title: string; date?: string; judge?: string }>
  caclBrEventsCoursing?: Array<{ eventId?: number | string; title: string; date?: string; judge?: string }>
  caclBrEventsRacing?: Array<{ eventId?: number | string; title: string; date?: string; judge?: string }>
  cacilEvents: Array<{ eventId?: number | string; title: string; date?: string; judge?: string; discipline: string }>
  cacShowEvents: Array<{ exhibitionId?: number | string; title: string; date?: string; judge?: string }>
  jcacShowEvents?: Array<{ exhibitionId?: number | string; title: string; date?: string; judge?: string }>
  vcacShowEvents?: Array<{ exhibitionId?: number | string; title: string; date?: string; judge?: string }>
  uniqueCacJudgesCount: number
  uniqueJcacJudgesCount?: number
  uniqueVcacJudgesCount?: number
  hasRunningClearanceCoursing: boolean
  hasRunningClearanceRacing: boolean
}

export interface CumulativeEvaluationResult {
  completed: CumulativeTitle[]
  inProgress: CumulativeTitle[]
  all: CumulativeTitle[]
  officialSupremeTitles: Array<{ title: string; count: number }>
  officialCoursingTitles: Array<{ title: string; count: number }>
  officialRacingTitles: Array<{ title: string; count: number }>
  officialSportTitles: Array<{ title: string; count: number }>
  officialShowTitles: Array<{ title: string; count: number }>
  titleExplanations: Record<string, string>
  certificates: DogCertificatesSummary
}
