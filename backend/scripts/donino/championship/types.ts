export interface StageWinner {
  dog_name: string;
  breed: string;
  breed_class: string;
  league: string;
  placement: number;
  time: number | null;
}

export interface StageResult {
  id: number;
  catalog_no?: number | null;
  dog_id?: number | null;
  dog_name: string;
  name_ru?: string;
  name_lat?: string;
  breed: string;
  sex: string;
  breed_class: string;
  league: 'Абсолют' | 'Чемпионов' | 'Прогресс' | 'Юниоры';
  placement: number;
  total_score: number | null;
  status: string;
  status_reason?: string | null;
  heats: Array<{
    heat_no: number;
    time: number | null;
    rank?: number | null;
    disqualified?: boolean;
  }>;
}

export interface StageInfo {
  id: number;
  stage_num: number;
  date_start: string;
  date_end?: string | null;
  title: string;
  discipline: string;
  location: string;
  judge?: string | null;
  series_director?: string;
  participants_count: number;
  has_results: boolean;
  status: 'completed' | 'upcoming';
  catalog_url?: string | null;
  rules_url?: string | null;
  results_pdf_url?: string | null;
  protocol_url?: string | null;
  classes_count?: number;
  winners?: StageWinner[];
  results?: StageResult[];
}

export interface PointBreakdown {
  place_points: number;
  best_final_points: number;
  best_class_points: number;
  best_breed_points: number;
  track_record_points: number;
}

export interface DogStanding {
  dog_key: string;
  dog_id?: number | null;
  name: string;
  name_ru: string;
  name_lat: string;
  breed: string;
  sex: string;
  current_league: 'Абсолют' | 'Чемпионов' | 'Прогресс' | 'Юниоры';
  wins_count: number;
  consecutive_losses: number;
  best_time: number | null;
  stages_count: number;
  total_points: number;
  stage_points: Record<number, number>;
  status_badge: string; // 'stable' | 'promoted_up' | 'relegated_down'
  promotion_label?: string | null;
  history: {
    stage_num: number;
    date: string;
    placement: number;
    total_score: number | null;
    league: string;
    breed_class: string;
    status: string;
    status_reason?: string | null;
    points?: number | null;
    points_breakdown?: PointBreakdown;
  }[];
}

export interface PromotionRecord {
  stage_from: number;
  stage_to: number;
  dog_name: string;
  breed: string;
  from_league: string;
  to_league: string;
  reason: string;
}
