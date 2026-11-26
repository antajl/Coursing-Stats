export interface Event {
  id?: number | string
  results_url?: string | null
  catalog_url?: string | null
  results_pdf_url?: string | null
  rules_url?: string | null
  full_title?: string | null
  rank_label?: string | null
  competition_kind?: string | null
  competition_type?: string | null
  event_date?: string | null
  date_start?: string | null
  date_end?: string | null
  protocol_location?: string | null
  location?: string | null
  host_club?: string | null
  organizer?: string | null
  title?: string | null
  telegram_url?: string | null
  judges?: string | null
  track_schemes?: string | null
}

export interface Result {
  id?: number | string
  dog_id: number | string
  catalog_no?: number | string | null
  class_label?: string | null
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
  dog?: {
    name?: string
    breed?: string
    sex_icon?: string
    sex?: string
  }
}

export interface Judge {
  scores?: (number | null)[]
  sum?: number | string | null
}

export interface Heat {
  heat_number?: number
  bib_number?: number | string
  bib_color?: string | number | null
  time?: number | string
  speed_kmh?: number
  distance?: number | string
  disqualified?: boolean
  disqualification_reason?: string
  judges?: Judge[]
  total?: number | string | null
}

export interface RawScores {
  format?: string
  heats?: Heat[]
  runs?: number
  normalized_score?: number | null
  grand_total?: number | string | null
}

export interface TrackScheme {
  name: string
  length?: string
  url?: string
}
