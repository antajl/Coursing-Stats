import type Database from 'better-sqlite3';
import { computeCoursingRatingScore } from '../rating/coursing-rating-score';

/** Метрики очков: avg, judge_eval_count, rating_score (индекс CS). */
export function attachScoreMetrics(
  db: Database.Database,
  scoreRows: Record<string, unknown>[],
  year?: number,
) {
  const dogIds = new Set(scoreRows.map((row) => row.dog_id as number));

  const rows = db
    .prepare(
      `SELECT r.dog_id, r.raw_scores_json
       FROM results r
       JOIN events e ON r.event_id = e.id
       WHERE r.status = 'finished' AND r.total_score IS NOT NULL AND e.event_type IN ('coursing', 'bzmp')
       ${year != null ? 'AND e.year = ?' : ''}`,
    )
    .all(...(year != null ? [year] : [])) as { dog_id: number; raw_scores_json: string | null }[];

  const sumsByDog = new Map<number, number[]>();
  for (const row of rows) {
    if (!dogIds.has(row.dog_id) || !row.raw_scores_json) continue;
    try {
      const parsed = JSON.parse(row.raw_scores_json);
      for (const heat of parsed.heats ?? []) {
        for (const judge of heat.judges ?? []) {
          if (typeof judge.sum === 'number' && !Number.isNaN(judge.sum)) {
            const arr = sumsByDog.get(row.dog_id) ?? [];
            arr.push(judge.sum);
            sumsByDog.set(row.dog_id, arr);
          }
        }
      }
    } catch {
      /* skip malformed row */
    }
  }

  for (const item of scoreRows) {
    const sums = sumsByDog.get(item.dog_id as number);
    const evalCount = sums?.length ?? 0;
    const avg =
      sums && evalCount > 0
        ? Math.round((sums.reduce((a, b) => a + b, 0) / evalCount) * 100) / 100
        : null;
    const row = item as Record<string, unknown>;
    row.avg_judge_score = avg;
    row.judge_eval_count = evalCount;
    row.rating_score = computeCoursingRatingScore({
      avg_judge_score: avg,
      best_judge_score: row.best_judge_score as number | null,
      total_starts: row.total_starts as number,
      judge_eval_count: evalCount,
    });
  }
}
