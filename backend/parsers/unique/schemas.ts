/**
 * Zod схемы для валидации результатов уникальных турниров
 */

import { z } from 'zod';

// Схема для результата собаки (уникальные турниры используют гибкую структуру)
export const UniqueDogResultSchema = z.object({
  breed_class: z.string(),
  placement: z.number().nullable(),
  catalog_no: z.number().nullable(),
  breed: z.string(),
  class: z.string(),
  sex: z.string(),
  name: z.string(),
  name_lat: z.string().nullable(),
  total_score: z.number().nullable(),
  judge_count: z.number().int().positive(),
  qualification: z.string().nullable(),
  vc: z.string().nullable(),
  status: z.enum(['finished', 'dns', 'disqualified', 'unknown_status', 'unknown_status_check_raw_text', 'withdrawn', 'dnf']),
  status_reason: z.string().nullable(),
  raw_scores_json: z.string(),
  raw_text: z.string(),
  judges: z.string().nullable(),
});

// Схема для полного ответа парсера уникальных турниров
export const UniqueParseResultSchema = z.object({
  results: z.array(UniqueDogResultSchema),
  telegram_url: z.string().url().nullable(),
  full_title: z.string().nullable(),
  event_date: z.string().nullable(),
  protocol_location: z.string().nullable(),
  judges: z.string().nullable(),
  track_schemes: z.array(z.any()),
});
