/**
 * Индекс CS (Coursing Stats v2) — составной рейтинг качества полевой работы собаки.
 *
 * Версия v2:
 * 1. Внутрипородный базис (breed baseline) — устраняет межпородный перекос судейских оценок.
 *    Оценка собаки центруется относительно исторического стандарта её породы к единому ядру prior=85.
 * 2. Байесовское сглаживание (shrinkage k=12) — защищает от случайных выбросов при малом числе стартов.
 * 3. Бонус за пиковый результат (до +0.6) — поощряет яркие чемпионские заезды.
 * 4. Бонус за соревновательный опыт (до +2.0) — логарифмический рост до 15 забегов.
 * 5. Фактор стабильности (variance penalty) — мягкая поправка (до -0.5) при высокой дисперсии оценок (σ > 4.0).
 *
 *   μ_norm = μ + (prior − baseline_breed)
 *   B_norm = B + (prior − baseline_breed)
 *   μ̃ = (μ_norm × n + prior × k) / (n + k)
 *   P = B_norm > μ̃ ? 0.15 × min(B_norm − μ̃, 4) : 0
 *   E = min(2, 0.5 × log₂(S + 1))
 *   V = (σ > 4.0 && n >= 4) ? min(0.5, 0.08 × (σ − 4.0)) : 0
 *   CS = round(μ̃ + P + E − V, 2)
 */

/** Версия формулы (канон: docs/03-DATA.md, docs/sheets/03-competitions.md). */
export const COURSING_RATING_VERSION = 'v2';

/** Публичная метка в indexes/top-score-*.json и UI (`rating_score_version`). */
export const COURSING_RATING_SCORE_VERSION = `cs-${COURSING_RATING_VERSION}` as const;

/** Ориентир сглаживания (круглое 85; между медианой и p75 карьерных avg_judge_score). */
export const COURSING_RATING_PRIOR = 85;
/** Псевдо-число оценок для Bayesian shrinkage при малом n. */
export const COURSING_RATING_SHRINK_K = 12;
export const COURSING_RATING_PEAK_WEIGHT = 0.15;
export const COURSING_RATING_PEAK_CAP = 4;
export const COURSING_RATING_STARTS_WEIGHT = 0.5;
/** Жёсткий потолок бонуса за число участий. */
export const COURSING_RATING_STARTS_CAP = 2;

/** Порог стандартного отклонения для вычета за нестабильность. */
export const COURSING_RATING_STABILITY_THRESHOLD = 4.0;
/** Коэффициент штрафа за единицу превышения порога стабильности. */
export const COURSING_RATING_STABILITY_WEIGHT = 0.08;
/** Максимальный штраф за нестабильность оценок. */
export const COURSING_RATING_STABILITY_CAP = 0.5;

/** Максимальный бонус пика: 0,15 × 4 = 0,6. */
export const COURSING_RATING_PEAK_BONUS_MAX =
  COURSING_RATING_PEAK_WEIGHT * COURSING_RATING_PEAK_CAP;

export const COURSING_RATING_FORMULA_HINT =
  'Индекс CS v2: средняя судейская оценка с внутрипородной калибровкой к норме 85, байесовским сглаживанием при малом n, бонусом за пик (до +0,6), бонусом за забеги (до +2) и поправкой на стабильность (до -0,5 при высокой дисперсии).';

/** Исторические базисы судейских оценок по породам (на основе анализа >30 000 забегов). */
export const BREED_BASELINES: Record<string, number> = {
  'УИППЕТ': 86.0,
  'ГРЕЙХАУНД': 86.5,
  'САЛЮКИ': 85.0,
  'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ': 85.0,
  'ЛЕВРЕТКА': 85.0,
  'АФГАНСКАЯ БОРЗАЯ': 85.0,
  'БАСЕНДЖИ': 84.0,
  'ФАРАОНОВА СОБАКА': 84.0,
  'ИРЛАНДСКИЙ ВОЛКОДАВ': 83.5,
  'РУССКАЯ ПСОВАЯ БОРЗАЯ': 83.0,
  'РОДЕЗИЙСКИЙ РИДЖБЕК': 82.5,
  'ЧИРНЕКО ДЕЛЬ’ЭТНА': 82.5,
  'ТАЙСКИЙ РИДЖБЕК': 82.5,
  'БИГЛЬ': 81.5,
  'ПОДЕНКО ИБИЦЕНКО': 82.5,
};

export function getBreedBaseline(breed?: string | null): number {
  if (!breed) return COURSING_RATING_PRIOR;
  const upper = breed.toUpperCase().trim();
  for (const [key, base] of Object.entries(BREED_BASELINES)) {
    if (upper.includes(key)) return base;
  }
  return COURSING_RATING_PRIOR;
}

export interface CoursingRatingInput {
  avg_judge_score: number | null | undefined;
  best_judge_score: number | null | undefined;
  total_starts: number | null | undefined;
  judge_eval_count: number;
  breed?: string | null;
  score_std_dev?: number | null;
}

export function computeCoursingRatingScore(input: CoursingRatingInput): number | null {
  const avg = input.avg_judge_score;
  const n = input.judge_eval_count;
  if (avg == null || Number.isNaN(avg) || n <= 0) return null;

  const baseline = getBreedBaseline(input.breed);
  const shift = COURSING_RATING_PRIOR - baseline;
  const normAvg = avg + shift;

  const shrunk =
    (normAvg * n + COURSING_RATING_PRIOR * COURSING_RATING_SHRINK_K) / (n + COURSING_RATING_SHRINK_K);

  let peakBonus = 0;
  const best = input.best_judge_score;
  if (best != null && !Number.isNaN(best)) {
    const normBest = best + shift;
    if (normBest > shrunk) {
      peakBonus =
        COURSING_RATING_PEAK_WEIGHT *
        Math.min(normBest - shrunk, COURSING_RATING_PEAK_CAP);
    }
  }

  const starts = Math.max(0, input.total_starts ?? 0);
  const startsBonus = Math.min(
    COURSING_RATING_STARTS_CAP,
    COURSING_RATING_STARTS_WEIGHT * Math.log2(starts + 1),
  );

  let stabilityPenalty = 0;
  const std = input.score_std_dev;
  if (std != null && !Number.isNaN(std) && n >= 4 && std > COURSING_RATING_STABILITY_THRESHOLD) {
    stabilityPenalty = Math.min(
      COURSING_RATING_STABILITY_CAP,
      COURSING_RATING_STABILITY_WEIGHT * (std - COURSING_RATING_STABILITY_THRESHOLD),
    );
  }

  return Math.round((shrunk + peakBonus + startsBonus - stabilityPenalty) * 100) / 100;
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
    breed: row.breed as string | null | undefined,
    score_std_dev: row.score_std_dev as number | null | undefined,
  });
  return computed ?? 0;
}
