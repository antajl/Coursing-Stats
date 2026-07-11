import { describe, expect, it } from 'vitest';
import { computeCoursingRatingScore } from '../lib/rating/coursing-rating-score';

describe('computeCoursingRatingScore', () => {
  it('returns null without judge evaluations', () => {
    expect(
      computeCoursingRatingScore({
        avg_judge_score: 90,
        best_judge_score: 95,
        total_starts: 5,
        judge_eval_count: 0,
      }),
    ).toBeNull();
  });

  it('stable career beats one-off peak with higher raw average', () => {
    const oneOff = computeCoursingRatingScore({
      avg_judge_score: 99,
      best_judge_score: 99,
      total_starts: 1,
      judge_eval_count: 4,
    });
    const stable = computeCoursingRatingScore({
      avg_judge_score: 98,
      best_judge_score: 97,
      total_starts: 10,
      judge_eval_count: 32,
    });
    expect(oneOff).not.toBeNull();
    expect(stable).not.toBeNull();
    expect(stable!).toBeGreaterThan(oneOff!);
  });

  it('more starts breaks tie on similar shrunk average', () => {
    const few = computeCoursingRatingScore({
      avg_judge_score: 88,
      best_judge_score: 92,
      total_starts: 3,
      judge_eval_count: 12,
    });
    const many = computeCoursingRatingScore({
      avg_judge_score: 88,
      best_judge_score: 92,
      total_starts: 16,
      judge_eval_count: 64,
    });
    expect(many!).toBeGreaterThan(few!);
  });

  it('peak bonus is zero when best judge score is not above shrunk average', () => {
    const base = {
      avg_judge_score: 90,
      total_starts: 5,
      judge_eval_count: 20,
    };
    const withoutPeak = computeCoursingRatingScore({ ...base, best_judge_score: 85 });
    const withPeak = computeCoursingRatingScore({ ...base, best_judge_score: 98 });
    expect(withoutPeak).not.toBeNull();
    expect(withPeak).not.toBeNull();
    expect(withPeak!).toBeGreaterThan(withoutPeak!);
  });

  it('starts bonus is capped at 2 even for large career', () => {
    const base = {
      avg_judge_score: 86,
      best_judge_score: 90,
      judge_eval_count: 64,
    };
    const s16 = computeCoursingRatingScore({ ...base, total_starts: 16 });
    const s100 = computeCoursingRatingScore({ ...base, total_starts: 100 });
    expect(s16).toBe(s100);
  });
});
