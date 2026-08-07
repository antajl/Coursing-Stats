import { ratingScoreFromRow } from '../rating/coursing-rating-score';

export function sortPlacementItems(
  items: Record<string, unknown>[],
  sortBy: string,
): Record<string, unknown>[] {
  const copy = [...items];
  const cmp = (a: Record<string, unknown>, b: Record<string, unknown>) => {
    const gold = Number(b.gold ?? 0) - Number(a.gold ?? 0);
    const silver = Number(b.silver ?? 0) - Number(a.silver ?? 0);
    const bronze = Number(b.bronze ?? 0) - Number(a.bronze ?? 0);
    if (sortBy === 'silver') return silver || gold || bronze;
    if (sortBy === 'bronze') return bronze || gold || silver;
    if (sortBy === 'total') {
      const ta = Number(a.gold ?? 0) + Number(a.silver ?? 0) + Number(a.bronze ?? 0);
      const tb = Number(b.gold ?? 0) + Number(b.silver ?? 0) + Number(b.bronze ?? 0);
      return tb - ta || gold || silver || bronze;
    }
    return gold || silver || bronze;
  };
  copy.sort(cmp);
  return copy;
}

export function compareScoreItems(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
  sortBy = 'rating_score',
): number {
  if (sortBy === 'rating_score') {
    const rating = ratingScoreFromRow(b) - ratingScoreFromRow(a);
    if (rating !== 0) return rating;
    const avg = Number(b.avg_judge_score ?? 0) - Number(a.avg_judge_score ?? 0);
    if (avg !== 0) return avg;
    const starts = Number(b.total_starts ?? 0) - Number(a.total_starts ?? 0);
    if (starts !== 0) return starts;
    const bj = Number(b.best_judge_score ?? 0) - Number(a.best_judge_score ?? 0);
    if (bj !== 0) return bj;
    return Number(b.best_score ?? 0) - Number(a.best_score ?? 0);
  }

  const primaryKey =
    sortBy === 'best_judge_score'
      ? 'best_judge_score'
      : sortBy === 'best_score'
        ? 'best_score'
        : 'avg_judge_score';
  const primary = Number(b[primaryKey] ?? 0) - Number(a[primaryKey] ?? 0);
  if (primary !== 0) return primary;

  if (sortBy === 'best_judge_score') {
    const avg = Number(b.avg_judge_score ?? 0) - Number(a.avg_judge_score ?? 0);
    if (avg !== 0) return avg;
    const starts = Number(b.total_starts ?? 0) - Number(a.total_starts ?? 0);
    if (starts !== 0) return starts;
    return Number(b.best_score ?? 0) - Number(a.best_score ?? 0);
  }

  if (sortBy === 'best_score') {
    const bj = Number(b.best_judge_score ?? 0) - Number(a.best_judge_score ?? 0);
    if (bj !== 0) return bj;
    const avg = Number(b.avg_judge_score ?? 0) - Number(a.avg_judge_score ?? 0);
    if (avg !== 0) return avg;
    return Number(b.total_starts ?? 0) - Number(a.total_starts ?? 0);
  }

  const starts = Number(b.total_starts ?? 0) - Number(a.total_starts ?? 0);
  if (starts !== 0) return starts;
  const bj = Number(b.best_judge_score ?? 0) - Number(a.best_judge_score ?? 0);
  if (bj !== 0) return bj;
  return Number(b.best_score ?? 0) - Number(a.best_score ?? 0);
}

export function sortScoreItems(
  items: Record<string, unknown>[],
  sortBy = 'rating_score',
): Record<string, unknown>[] {
  const copy = [...items];
  copy.sort((a, b) => compareScoreItems(a, b, sortBy));
  return copy;
}
