import { describe, expect, it } from 'vitest';
import { sortPlacementItems, sortScoreItems, compareScoreItems } from '../lib/data-logic/sort-top';

// ── Вспомогательные конструкторы ─────────────────────────────────────────────

function placementDog(
  name: string,
  gold: number,
  silver: number,
  bronze: number,
): Record<string, unknown> {
  return { name_lat: name, gold, silver, bronze, total_starts: gold + silver + bronze };
}

/**
 * Собака с предрасcчитанными полями rating_score / avg_judge_score.
 * Передаём rating_score явно, чтобы тесты не зависели от констант CS-формулы.
 */
function scoreDog(
  name: string,
  opts: {
    rating_score?: number;
    avg_judge_score?: number;
    best_judge_score?: number;
    best_score?: number;
    total_starts?: number;
    judge_eval_count?: number;
  },
): Record<string, unknown> {
  return {
    name_lat: name,
    rating_score: opts.rating_score ?? null,
    avg_judge_score: opts.avg_judge_score ?? null,
    best_judge_score: opts.best_judge_score ?? null,
    best_score: opts.best_score ?? null,
    total_starts: opts.total_starts ?? 1,
    judge_eval_count: opts.judge_eval_count ?? 4,
  };
}

// ── sortPlacementItems ────────────────────────────────────────────────────────

describe('sortPlacementItems', () => {
  describe('sortBy=gold (default)', () => {
    it('sorts by gold descending', () => {
      const input = [
        placementDog('B', 2, 0, 0),
        placementDog('A', 3, 0, 0),
        placementDog('C', 1, 0, 0),
      ];
      const result = sortPlacementItems(input, 'gold');
      expect(result.map((d) => d.name_lat)).toEqual(['A', 'B', 'C']);
    });

    it('breaks gold tie by silver', () => {
      const input = [
        placementDog('B', 2, 1, 0),
        placementDog('A', 2, 3, 0),
      ];
      const result = sortPlacementItems(input, 'gold');
      expect(result.map((d) => d.name_lat)).toEqual(['A', 'B']);
    });

    it('breaks gold+silver tie by bronze', () => {
      const input = [
        placementDog('A', 2, 2, 0),
        placementDog('B', 2, 2, 4),
      ];
      const result = sortPlacementItems(input, 'gold');
      expect(result.map((d) => d.name_lat)).toEqual(['B', 'A']);
    });

    it('does not mutate the original array', () => {
      const original = [placementDog('B', 1, 0, 0), placementDog('A', 3, 0, 0)];
      const copy = [...original];
      sortPlacementItems(original, 'gold');
      expect(original).toEqual(copy);
    });
  });

  describe('sortBy=silver', () => {
    it('primary key is silver, gold is secondary', () => {
      // B имеет больше золота, но A — больше серебра
      const input = [
        placementDog('B', 5, 1, 0),
        placementDog('A', 1, 4, 0),
      ];
      const result = sortPlacementItems(input, 'silver');
      expect(result.map((d) => d.name_lat)).toEqual(['A', 'B']);
    });

    it('breaks silver tie by gold', () => {
      const input = [
        placementDog('A', 1, 3, 0),
        placementDog('B', 5, 3, 0),
      ];
      const result = sortPlacementItems(input, 'silver');
      expect(result.map((d) => d.name_lat)).toEqual(['B', 'A']);
    });
  });

  describe('sortBy=bronze', () => {
    it('primary key is bronze', () => {
      const input = [
        placementDog('A', 0, 0, 1),
        placementDog('B', 0, 0, 5),
      ];
      const result = sortPlacementItems(input, 'bronze');
      expect(result.map((d) => d.name_lat)).toEqual(['B', 'A']);
    });
  });

  describe('sortBy=total', () => {
    it('sorts by total medals (gold+silver+bronze) descending', () => {
      const input = [
        placementDog('A', 1, 1, 0), // total=2
        placementDog('B', 0, 1, 2), // total=3
        placementDog('C', 3, 0, 0), // total=3, но больше золота
      ];
      const result = sortPlacementItems(input, 'total');
      // B и C оба с total=3; золото как тайбрейк → C первый
      expect(result[0].name_lat).toBe('C');
      expect(result[1].name_lat).toBe('B');
      expect(result[2].name_lat).toBe('A');
    });

    it('total tie resolved by gold', () => {
      const input = [
        placementDog('A', 1, 2, 0), // total=3, gold=1
        placementDog('B', 2, 1, 0), // total=3, gold=2
      ];
      const result = sortPlacementItems(input, 'total');
      expect(result.map((d) => d.name_lat)).toEqual(['B', 'A']);
    });
  });

  it('handles entries with undefined/null medal counts as zero', () => {
    const items = [
      { name_lat: 'A' }, // все медали undefined
      placementDog('B', 1, 0, 0),
    ];
    const result = sortPlacementItems(items, 'gold');
    expect(result[0].name_lat).toBe('B');
  });

  it('returns empty array unchanged', () => {
    expect(sortPlacementItems([], 'gold')).toEqual([]);
  });

  it('single element array is a no-op', () => {
    const single = [placementDog('X', 1, 2, 3)];
    expect(sortPlacementItems(single, 'gold')).toEqual(single);
  });
});

// ── sortScoreItems / compareScoreItems ────────────────────────────────────────

describe('sortScoreItems', () => {
  describe('sortBy=rating_score (default)', () => {
    it('higher rating_score comes first', () => {
      const input = [
        scoreDog('B', { rating_score: 87.5 }),
        scoreDog('A', { rating_score: 89.28 }),
      ];
      const result = sortScoreItems(input);
      expect(result[0].name_lat).toBe('A');
    });

    it('falls back to avg_judge_score when rating_score is equal', () => {
      const input = [
        scoreDog('B', { rating_score: 88.0, avg_judge_score: 85.0 }),
        scoreDog('A', { rating_score: 88.0, avg_judge_score: 87.0 }),
      ];
      const result = sortScoreItems(input);
      expect(result[0].name_lat).toBe('A');
    });

    it('falls back to total_starts on rating+avg tie', () => {
      const input = [
        scoreDog('B', { rating_score: 88.0, avg_judge_score: 86.0, total_starts: 3 }),
        scoreDog('A', { rating_score: 88.0, avg_judge_score: 86.0, total_starts: 10 }),
      ];
      const result = sortScoreItems(input);
      expect(result[0].name_lat).toBe('A');
    });

    it('computes rating_score on-the-fly if field is absent', () => {
      // Не передаём rating_score — compareScoreItems должен вычислить его
      const base = {
        avg_judge_score: 87,
        best_judge_score: 97,
        total_starts: 16,
        judge_eval_count: 64,
      };
      const dogA = { name_lat: 'A', ...base }; // rating_score будет вычислен
      const dogB = { name_lat: 'B', ...base, avg_judge_score: 80 }; // ниже

      // Убеждаемся что у них нет поля rating_score
      expect(dogA.rating_score).toBeUndefined();

      const result = sortScoreItems([dogB, dogA]);
      expect(result[0].name_lat).toBe('A');
    });

    it('dog with null rating_score sorts to the end', () => {
      const input = [
        scoreDog('A', { rating_score: null }),
        scoreDog('B', { rating_score: 87.0 }),
      ];
      const result = sortScoreItems(input);
      expect(result[0].name_lat).toBe('B');
    });

    it('does not mutate the original array', () => {
      const input = [
        scoreDog('B', { rating_score: 90 }),
        scoreDog('A', { rating_score: 95 }),
      ];
      const snapshot = input.map((d) => d.name_lat);
      sortScoreItems(input);
      expect(input.map((d) => d.name_lat)).toEqual(snapshot);
    });
  });

  describe('sortBy=best_judge_score', () => {
    it('primary sort by best_judge_score', () => {
      const input = [
        scoreDog('A', { best_judge_score: 92, avg_judge_score: 88 }),
        scoreDog('B', { best_judge_score: 98, avg_judge_score: 80 }),
      ];
      const result = sortScoreItems(input, 'best_judge_score');
      expect(result[0].name_lat).toBe('B');
    });

    it('breaks best_judge_score tie by avg_judge_score', () => {
      const input = [
        scoreDog('B', { best_judge_score: 95, avg_judge_score: 85 }),
        scoreDog('A', { best_judge_score: 95, avg_judge_score: 90 }),
      ];
      const result = sortScoreItems(input, 'best_judge_score');
      expect(result[0].name_lat).toBe('A');
    });
  });

  describe('sortBy=best_score', () => {
    it('primary sort by best_score (grand_total)', () => {
      const input = [
        scoreDog('A', { best_score: 280, avg_judge_score: 88 }),
        scoreDog('B', { best_score: 320, avg_judge_score: 75 }),
      ];
      const result = sortScoreItems(input, 'best_score');
      expect(result[0].name_lat).toBe('B');
    });

    it('breaks best_score tie by best_judge_score', () => {
      const input = [
        scoreDog('B', { best_score: 300, best_judge_score: 90 }),
        scoreDog('A', { best_score: 300, best_judge_score: 96 }),
      ];
      const result = sortScoreItems(input, 'best_score');
      expect(result[0].name_lat).toBe('A');
    });
  });

  describe('sortBy=avg_judge_score', () => {
    it('primary sort by avg_judge_score', () => {
      const input = [
        scoreDog('A', { avg_judge_score: 82 }),
        scoreDog('B', { avg_judge_score: 90 }),
      ];
      const result = sortScoreItems(input, 'avg_judge_score');
      expect(result[0].name_lat).toBe('B');
    });

    it('breaks avg tie by total_starts', () => {
      const input = [
        scoreDog('B', { avg_judge_score: 88, total_starts: 5 }),
        scoreDog('A', { avg_judge_score: 88, total_starts: 15 }),
      ];
      const result = sortScoreItems(input, 'avg_judge_score');
      expect(result[0].name_lat).toBe('A');
    });
  });

  it('stable career (n=64) beats one-off peak (n=4) despite higher raw average', () => {
    // Проверяет реальный инвариант из docs/03-DATA.md — пример CS v1
    const oneOff = scoreDog('OneOff', {
      // n=4 → сильное смягчение к prior=85
      avg_judge_score: 96,
      best_judge_score: 96,
      total_starts: 1,
      judge_eval_count: 4,
      rating_score: undefined, // нет предрасчёта — пусть compareScoreItems вычислит
    });
    const stable = scoreDog('Stable', {
      avg_judge_score: 87,
      best_judge_score: 97,
      total_starts: 16,
      judge_eval_count: 64,
      rating_score: undefined,
    });
    // Удаляем rating_score чтобы функция вычислила
    delete oneOff.rating_score;
    delete stable.rating_score;

    const result = sortScoreItems([oneOff, stable]);
    expect(result[0].name_lat).toBe('Stable');
  });
});

// ── compareScoreItems — симметрия и транзитивность ───────────────────────────

describe('compareScoreItems — ordering properties', () => {
  it('is antisymmetric: compare(a,b) and compare(b,a) have opposite signs', () => {
    const a = scoreDog('A', { rating_score: 91 });
    const b = scoreDog('B', { rating_score: 87 });
    const ab = compareScoreItems(a, b);
    const ba = compareScoreItems(b, a);
    expect(Math.sign(ab)).toBe(-Math.sign(ba));
  });

  it('returns 0 for identical items', () => {
    const dog = scoreDog('X', {
      rating_score: 88,
      avg_judge_score: 86,
      best_judge_score: 93,
      total_starts: 5,
    });
    expect(compareScoreItems(dog, { ...dog })).toBe(0);
  });

  it('is transitive: if a>b and b>c then a>c', () => {
    const a = scoreDog('A', { rating_score: 95 });
    const b = scoreDog('B', { rating_score: 90 });
    const c = scoreDog('C', { rating_score: 85 });
    expect(compareScoreItems(a, b)).toBeLessThan(0); // a перед b
    expect(compareScoreItems(b, c)).toBeLessThan(0); // b перед c
    expect(compareScoreItems(a, c)).toBeLessThan(0); // ⇒ a перед c
  });
});
