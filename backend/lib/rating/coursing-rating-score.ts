/**
 * Индекс CS (Coursing Stats) — составной рейтинг для сортировки «по очкам».
 *
 * μ = avg_judge_score, n = judge_eval_count, B = best_judge_score, S = total_starts.
 *
 *   μ̃ = (μ×n + prior×k) / (n + k)
 *   P = B > μ̃ ? 0.15 × min(B − μ̃, 4) : 0
 *   E = min(2, 0.5 × log₂(S + 1))
 *   CS = round(μ̃ + P + E, 2)
 *
 * prior=85 — округлённый ориентир верхней части типичных средних (≈68-й перцентиль поля на
 * момент CS v1; фактический p75 ≈ 85,7); k=12 — эвристика shrinkage.
 * Константы CS v1 фиксированы в коде и не пересчитываются при build-all-data.
 * total_score (сумма протокола) в формулу не входит.
 */

/** Версия формулы (меняется только с явным анонсом; канон: docs/03-DATA.md → top-score). */
export const COURSING_RATING_VERSION = 'v1';

/** Ориентир сглаживания (круглое 85; между медианой и p75 карьерных avg_judge_score). */
export const COURSING_RATING_PRIOR = 85;
/** Псевдо-число оценок для Bayesian shrinkage при малом n. */
export const COURSING_RATING_SHRINK_K = 12;
export const COURSING_RATING_PEAK_WEIGHT = 0.15;
export const COURSING_RATING_PEAK_CAP = 4;
export const COURSING_RATING_STARTS_WEIGHT = 0.5;
/** Жёсткий потолок бонуса стартов. */
export const COURSING_RATING_STARTS_CAP = 2;

/** Максимальный бонус пика: 0,15 × 4 = 0,6. */
export const COURSING_RATING_PEAK_BONUS_MAX =
  COURSING_RATING_PEAK_WEIGHT * COURSING_RATING_PEAK_CAP;

export const COURSING_RATING_FORMULA_HINT =
  'Индекс CS v1: средняя оценка одного судьи (курсинг + БЗМП) с сглаживанием к prior=85 при малом n + до +0,6 за пик + до +2 за старты. Сумма протокола не учитывается.';

export interface CoursingRatingInput {
  avg_judge_score: number | null | undefined;
  best_judge_score: number | null | undefined;
  total_starts: number | null | undefined;
  judge_eval_count: number;
}

export function computeCoursingRatingScore(input: CoursingRatingInput): number | null {
  const avg = input.avg_judge_score;
  const n = input.judge_eval_count;
  if (avg == null || Number.isNaN(avg) || n <= 0) return null;

  const shrunk =
    (avg * n + COURSING_RATING_PRIOR * COURSING_RATING_SHRINK_K) / (n + COURSING_RATING_SHRINK_K);

  let peakBonus = 0;
  const best = input.best_judge_score;
  if (best != null && !Number.isNaN(best) && best > shrunk) {
    peakBonus =
      COURSING_RATING_PEAK_WEIGHT *
      Math.min(best - shrunk, COURSING_RATING_PEAK_CAP);
  }

  const starts = Math.max(0, input.total_starts ?? 0);
  const startsBonus = Math.min(
    COURSING_RATING_STARTS_CAP,
    COURSING_RATING_STARTS_WEIGHT * Math.log2(starts + 1),
  );

  return Math.round((shrunk + peakBonus + startsBonus) * 100) / 100;
}

export function ratingScoreFromRow(row: Record<string, unknown>): number {
  if (row.rating_score != null && !Number.isNaN(Number(row.rating_score))) {
    return Number(row.rating_score);
  }
  const computed = computeCoursingRatingScore({
    avg_judge_score: row.avg_judge_score as number | null | undefined,
    best_judge_score: row.best_judge_score as number | null | undefined,
    total_starts: row.total_starts as number | null | undefined,
    judge_eval_count: Number(row.judge_eval_count ?? 0),
  });
  return computed ?? 0;
}
