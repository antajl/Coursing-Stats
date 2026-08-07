/**
 * Базовая информация о собаке для поиска
 */
export interface Dog {
  id: number;
  name_lat: string;
  name_ru: string;
  breed: string;
  competition_count: number;
}

/**
 * Полные данные профиля собаки с агрегатами
 */
export interface DogData {
  schema: string;
  exported_at: string;
  dog: {
    id: number;
    dog_key: string;
    name_lat: string;
    name_ru: string;
    breed: string;
    sex: string | null;
    owner: string | null;
    pedigree_url: string | null;
    coursing_stats: {
      total_starts: number;
      best_score: number;
      avg_score: number;
      avg_judge_score?: number;
      gold: number;
      silver: number;
      bronze: number;
    };
    racing_stats: {
      total_starts: number;
      best_speed: number;
      avg_speed: number;
      gold: number;
      silver: number;
      bronze: number;
    };
    shows_stats?: {
      total_starts: number;
      best_placement: number;
      points: number;
      titles?: string[];
    };
    competitions?: Competition[];
  };
}

export interface Competition {
  id: number;
  name?: string;
  title?: string;
  date?: string;
  date_start?: string;
  location: string;
  type?: string;
  event_type?: string;
  speed?: number;
  max_speed?: number;
  speed_value?: number;
  placement?: number;
  total_score?: number;
}

export interface SpeedRecord {
  name: string;
  breed: string;
  speed_kmh: number;
  date: string;
  speed?: number;
  max_speed?: number;
  speed_value?: number;
  speed_km_h?: number;
  sex?: string;
  status?: string;
  track_type?: string | null;
  screenshot_url?: string;
  history?: Array<{
    speed_km_h?: number;
    speed_kmh?: number;
    date: string;
    track_type?: string | null;
  }>;
}

export interface CoursingRecord {
  name: string;
  breed: string;
  time_seconds: number;
  date: string;
  status?: string;
  track_length?: number;
  history?: Array<{
    time_seconds: number;
    date: string;
  }>;
}

export interface Rating {
  dog_id?: number;
  name_lat?: string;
  name_ru?: string;
  name?: string;
  breed?: string;
  year?: number;
  best_score?: number;
  total_starts?: number;
  best_judge_score?: number;
  avg_judge_score?: number;
  year_from?: number;
  year_to?: number;
  judge_eval_count?: number;
  rating_score?: number;
  score?: number;
  total_score?: number;
  gold?: number;
  silver?: number;
  bronze?: number;
  /** Racing speed ranking (top-speed-*) */
  best_speed?: number;
  avg_speed?: number;
}

// Расширенные интерфейсы для данных из API
export interface RatingItem extends Rating {
  show_count?: number;
  total_shows?: number;
  titles?: Array<{ title: string }>;
  competition_count?: number;
  starts?: number;
  judge_name?: string;
  rings?: number;
  total_rings?: number;
  ring_count?: number;
}

export interface SpeedRecordExtended extends Omit<SpeedRecord, 'speed_kmh'> {
  speed_km_h?: number;
  speed_kmh?: number;
  max_speed?: number;
  speed_value?: number;
}

export interface CompetitionData {
  id: number;
  name?: string;
  date?: string;
  location?: string;
  type?: string;
  discipline?: string;
  [key: string]: unknown;
}
