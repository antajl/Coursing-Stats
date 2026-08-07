/**
 * Zod схемы для валидации результатов курсинга
 */

import { z } from 'zod';

// Схема для оценок судьи (5 категорий)
export const JudgeScoresSchema = z.object({
  judge_number: z.number().int().positive(),
  scores: z.array(z.number().max(20).nullable()).length(5),
  sum: z.number().nullable(),
});

// Схема для забега
export const HeatSchema = z.object({
  heat_number: z.number().int().positive(),
  bib_number: z.number().nullable(),
  bib_color: z.string().nullable(),
  judges: z.array(JudgeScoresSchema),
  total: z.number().nullable(),
  disqualified: z.boolean(),
  disqualification_reason: z.string().nullable(),
});

// Схема для результата собаки
export const DogResultSchema = z.object({
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

// Схема для полного ответа парсера
export const CoursingParseResultSchema = z.object({
  results: z.array(DogResultSchema),
  telegram_url: z.string().url().nullable(),
  full_title: z.string().nullable(),
  event_date: z.string().nullable(),
  protocol_location: z.string().nullable(),
  judges: z.string().nullable(),
  track_schemes: z.array(z.any()),
});
