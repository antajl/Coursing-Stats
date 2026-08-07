export interface TopDog {
  dog_id: number
  name_lat: string
  name_ru?: string | null
  breed?: string
  gold?: number
  silver?: number
  bronze?: number
  best_score?: number
  best_judge_score?: number
  rating_score?: number
  avg_judge_score?: number
  best_speed?: number
  avg_speed?: number
  total_starts?: number
}

export interface SpeedRecord {
  name: string
  breed: string
  sex?: 'male' | 'female' | null
  speed_km_h: number
  date?: string
  status?: string
  history?: Record<string, unknown>
  track_type?: string | null
}

export interface CoursingRecord {
  name: string
  breed: string
  sex?: 'male' | 'female' | null
  time_seconds: number
  date?: string
  status?: string
  history?: Record<string, unknown>
  track_type?: string | null
}

export type RankingTab = 'placement' | 'score' | 'speed'
