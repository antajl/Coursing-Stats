import { z } from 'zod';

// Базовые схемы
const DogSchema = z.object({
  id: z.number(),
  name_lat: z.string(),
  breed: z.string(),
  name_ru: z.string().optional(),
  pedigree_url: z.string().nullable(),
});

const EventSchema = z.object({
  id: z.number(),
  year: z.number(),
  dates: z.string(),
  rank: z.string().optional(),
  event_type: z.string(),
  title: z.string(),
  host_club: z.string(),
  location: z.string(),
  catalog_url: z.string().nullable(),
  results_url: z.string().nullable(),
  track_schemes: z.array(z.any()).optional(),
  judges: z.string().nullable(),
});

const ResultSchema = z.object({
  id: z.number(),
  dog_id: z.number(),
  event_id: z.number(),
  placement: z.number().nullable(),
  total_score: z.number().nullable(),
  judge_count: z.number(),
  raw_scores_json: z.string(),
  qualification: z.string(),
  vc: z.string(),
  status: z.string(),
  raw_text: z.string(),
  breed_class: z.string(),
  status_reason: z.string().nullable(),
  judges: z.string().nullable(),
});

// API схемы ответов
export const TopPlacementResponseSchema = z.array(z.object({
  id: z.number(),
  name_lat: z.string(),
  breed: z.string(),
  total_starts: z.number(),
  total_wins: z.number(),
  win_rate: z.number(),
  year: z.number(),
}));

export const TopScoreResponseSchema = z.array(z.object({
  id: z.number(),
  name_lat: z.string(),
  breed: z.string(),
  total_starts: z.number(),
  avg_score: z.number(),
  max_score: z.number(),
  year: z.number(),
}));

export const BreedsResponseSchema = z.array(z.string());

export const YearsResponseSchema = z.array(z.number());

export const EventsResponseSchema = z.array(EventSchema);

export const DogProfileResponseSchema = z.object({
  id: z.number(),
  name_lat: z.string(),
  breed: z.string(),
  name_ru: z.string().nullable(),
  pedigree_url: z.string().nullable(),
  total_starts: z.number(),
  total_wins: z.number(),
  avg_score: z.number().nullable(),
  max_score: z.number().nullable(),
  best_placement: z.number().nullable(),
  qualification: z.string().optional(),
  vc: z.string().optional(),
});

export const DogEventsResponseSchema = z.array(z.object({
  event: EventSchema,
  result: ResultSchema,
}));

export const EventResponseSchema = EventSchema;

export const EventResultsResponseSchema = z.array(ResultSchema);

export const SpeedRecordSchema = z.object({
  id: z.number(),
  breed: z.string(),
  sex: z.string(),
  name: z.string(),
  speed_km_h: z.number(),
  date: z.string(),
  screenshot_url: z.string().nullable(),
});

export const SpeedRecordsResponseSchema = z.array(SpeedRecordSchema);

export const JudgeSchema = z.object({
  id: z.string(),
  name: z.string(),
  total_evaluations: z.number(),
  avg_score: z.number(),
  unique_breeds: z.number(),
  unique_disciplines: z.number(),
  unique_events: z.number(),
});

export const JudgesResponseSchema = z.array(JudgeSchema);

export const JudgeDetailResponseSchema = z.object({
  judge: JudgeSchema,
  breeds: z.array(z.object({
    breed: z.string(),
    count: z.number(),
    avg_score: z.number(),
    min_score: z.number(),
    max_score: z.number(),
    dogs: z.array(z.object({
      name: z.string(),
      score: z.number(),
    })),
  })),
  criteria: z.array(z.object({
    name: z.string(),
    count: z.number(),
    avg_score: z.number(),
    min_score: z.number(),
    max_score: z.number(),
  })),
});

// Типы для TypeScript
export type Dog = z.infer<typeof DogSchema>;
export type Event = z.infer<typeof EventSchema>;
export type Result = z.infer<typeof ResultSchema>;
export type TopPlacementResponse = z.infer<typeof TopPlacementResponseSchema>;
export type TopScoreResponse = z.infer<typeof TopScoreResponseSchema>;
export type BreedsResponse = z.infer<typeof BreedsResponseSchema>;
export type YearsResponse = z.infer<typeof YearsResponseSchema>;
export type EventsResponse = z.infer<typeof EventsResponseSchema>;
export type DogProfileResponse = z.infer<typeof DogProfileResponseSchema>;
export type DogEventsResponse = z.infer<typeof DogEventsResponseSchema>;
export type EventResponse = z.infer<typeof EventResponseSchema>;
export type EventResultsResponse = z.infer<typeof EventResultsResponseSchema>;
export type SpeedRecord = z.infer<typeof SpeedRecordSchema>;
export type SpeedRecordsResponse = z.infer<typeof SpeedRecordsResponseSchema>;
export type Judge = z.infer<typeof JudgeSchema>;
export type JudgesResponse = z.infer<typeof JudgesResponseSchema>;
export type JudgeDetailResponse = z.infer<typeof JudgeDetailResponseSchema>;
