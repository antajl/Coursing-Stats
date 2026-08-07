export interface Event {
  results_url?: string | null
  full_title?: string | null
  rank_label?: string | null
  competition_kind?: string | null
  competition_type?: string | null
  event_date?: string | null
  date_start?: string | null
  protocol_location?: string | null
  location?: string | null
  host_club?: string | null
  title?: string | null
  telegram_url?: string | null
  judges?: string | null
  track_schemes?: string | null
}

export interface Result {
  dog_id: number | string
  breed?: string | null
  breed_class?: string | null
  name_ru?: string | null
  name_lat?: string | null
  placement?: number | null
  status?: string | null
  status_reason?: string | null
  qualification?: string | null
  total_score?: number | string | null
  vc?: string | null
  raw_scores_json?: string | null
}

export interface Judge {
  scores?: (number | null)[]
  sum?: number | string | null
}

export interface Heat {
  heat_number?: number
  bib_number?: number | string
  bib_color?: string
  time?: number | string
  speed_kmh?: number
  disqualified?: boolean
  disqualification_reason?: string
  judges?: Judge[]
  total?: number | string | null
}

export interface RawScores {
  format?: string
  heats?: Heat[]
  grand_total?: number | string | null
}

export interface TrackScheme {
  name: string
  length?: string
  url?: string
}
