export type ListTab = 'breeds' | 'events' | 'criteria'

export interface DogEventStat {
  event_id?: number
  title?: string
  date?: string
  total?: number
  avg_score?: number | null
  heats?: Array<{
    heat_number: number
    total: number
    scores?: number[]
  }>
}

export interface DogStat {
  name: string
  name_ru?: string
  avg_score?: number | null
  total_evaluations?: number
  scores_by_criteria?: Record<string, number[]>
  events?: DogEventStat[]
}

export interface BreedStat {
  breed: string
  count?: number
  evaluations_count?: number
  events_count?: number
  avg_score?: number | null
  min_score?: number | null
  max_score?: number | null
  dogs?: DogStat[]
}

export interface CriteriaStat {
  name?: string
  evaluations_count?: number
  avg_score?: number | null
  min_score?: number | null
  max_score?: number | null
}

export interface JudgeEvent {
  key: string
  title: string
  date: string
  breed: string
}
