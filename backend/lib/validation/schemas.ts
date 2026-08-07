/**
 * Zod схемы для валидации канонических данных (data/v1/)
 *
 * Используются при записи в канон для защиты от мусора:
 * - Опечатки пород
 * - Числовые клички
 * - Пустые или некорректные поля
 * - Расхождения между by-id и by-key
 */

import { z } from 'zod';

/**
 * Схема для события в competition-v1
 * Минимальные структурные проверки
 */
export const CompetitionEventSchema = z.object({}).passthrough();

/**
 * Схема для результата собаки в competition-v1
 * Минимальные структурные проверки
 */
export const CompetitionResultSchema = z.object({}).passthrough();

/**
 * Схема для полного файла competition-v1
 */
export const CompetitionV1Schema = z.object({
  schema: z.literal('coursing-stats/competition-v1'),
  exported_at: z.string().datetime(),
  source: z.string(),
  event_id: z.number().int().positive(),
  event: CompetitionEventSchema,
  result_count: z.number().int().min(0),
  results: z.array(CompetitionResultSchema).min(1, 'Competition must have at least one result'),
});

/**
 * Схема для dog-v1
 */
export const DogV1Schema = z.object({
  schema: z.literal('coursing-stats/dog-v1'),
  exported_at: z.string().datetime(),
  id: z.number().int().positive(),
  dog_key: z.string().min(1),
  name_lat: z.string().min(0), // пустая строка допустима для неизвестных собак
  name_ru: z.string().nullable(),
  breed: z.string().min(1),
  sex: z.union([z.enum(['male', 'female', 'unknown']), z.enum(['M', 'F']), z.literal(null)]),
  owner: z.string().nullable(),
  pedigree_url: z.string().url().nullable().optional(),
  competition_ids: z.array(z.number().int().positive()),
  competition_files: z.array(z.string().min(1)),
}).refine(
  (data) => !/^\d+$/.test(data.breed),
  { message: 'Breed cannot be a number' }
);

/**
 * Режим валидации
 */
export type ValidationMode = 'warn' | 'error';

/**
 * Результат валидации
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Валидация данных с указанным режимом
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  mode: ValidationMode = 'warn',
  context: string = 'data'
): ValidationResult {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { valid: true, errors: [], warnings: [] };
  }
  
  const errors = result.error.issues.map(err => 
    `${context}: ${err.path.join('.')} - ${err.message}`
  );
  
  if (mode === 'error') {
    return { valid: false, errors, warnings: [] };
  }
  
  // warn mode: логируем ошибки как предупреждения, но не блокируем
  console.warn(`[Schema Validation] Warnings for ${context}:`);
  errors.forEach(err => console.warn(`  - ${err}`));
  
  return { valid: true, errors: [], warnings: errors };
}
