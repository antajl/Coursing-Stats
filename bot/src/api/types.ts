export interface CompactDogEntry {
  id: number;
  name_lat: string;
  name_ru: string;
  breed: string;
  activity_score: number;
}

export interface CompactSearchIndex {
  schema: string;
  popular: CompactDogEntry[];
  name_prefix: { [prefix: string]: number[] };
  breed_index: { [breed: string]: number[] };
  metadata: {
    total_dogs: number;
    popular_count: number;
    last_updated: string;
    version: string;
  };
}
