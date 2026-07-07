import { parseJudgeNames } from './judge-names';

export interface JudgeStats {
  name: string;
  total_evaluations: number;
  scores: number[];
  breeds: Set<string>;
  disciplines: Set<string>;
  events: Set<number>;
}

export interface BreedStats {
  count: number;
  scores: number[];
}

export interface DogStats {
  name: string;
  name_ru: string | null;
  scores: number[];
  events: Array<{
    title: string;
    date: string;
    total: number;
  }>;
}

export type CriteriaStats = Record<number, number[]>;

export interface DogTotalScore {
  dog_id: number;
  dog_name: string;
  breed: string;
  event_id: number;
  event_title: string;
  event_date: string;
  total_score: number;
  score_count: number;
}

/**
 * Агрегирует статистику судей из результатов
 */
export function aggregateJudgeStats(results: any[]): Map<string, JudgeStats> {
  const judgeStats = new Map<string, JudgeStats>();

  for (const row of results) {
    try {
      const heats = JSON.parse(row.heats_json || '[]');
      const judgeNames = parseJudgeNames(row.event_judges);

      for (const heat of heats) {
        if (heat.judges && Array.isArray(heat.judges)) {
          for (const judge of heat.judges) {
            const judgeNum = judge.judge_number;
            const judgeName = judgeNames[judgeNum - 1] || `Судья ${judgeNum}`;

            if (!judgeStats.has(judgeName)) {
              judgeStats.set(judgeName, {
                name: judgeName,
                total_evaluations: 0,
                scores: [],
                breeds: new Set(),
                disciplines: new Set(),
                events: new Set()
              });
            }

            const stats = judgeStats.get(judgeName)!;
            if (judge.scores && Array.isArray(judge.scores)) {
              stats.total_evaluations += judge.scores.length;
              stats.scores.push(...judge.scores);
              stats.breeds.add(row.breed);
              stats.disciplines.add(row.event_type);
              stats.events.add(row.event_id);
            }
          }
        }
      }
    } catch (e) {
      console.error('Error parsing heats JSON:', e);
    }
  }

  return judgeStats;
}

/**
 * Формирует итоговый массив данных судей
 */
export function formatJudgesData(judgeStats: Map<string, JudgeStats>): any[] {
  const judgesData = [];

  for (const [name, stats] of judgeStats.entries()) {
    const validScores = stats.scores.filter((s: any) => s !== null && !isNaN(s));
    const avgScore = validScores.length > 0
      ? validScores.reduce((a: number, b: number) => a + b, 0) / validScores.length
      : null;

    judgesData.push({
      id: name,
      name: stats.name,
      total_evaluations: stats.total_evaluations,
      total_evaluations_count: Math.round(stats.total_evaluations / 5),
      avg_score: avgScore,
      unique_breeds: stats.breeds.size,
      unique_disciplines: stats.disciplines.size,
      unique_events: stats.events.size
    });
  }

  judgesData.sort((a, b) => b.total_evaluations - a.total_evaluations);
  return judgesData;
}

/**
 * Агрегирует детальную статистику по породам для конкретного судьи
 */
export function aggregateBreedStats(
  results: any[],
  judgeName: string
): Map<string, BreedStats> {
  const breedStats = new Map<string, BreedStats>();

  for (const row of results) {
    try {
      const heats = JSON.parse(row.heats_json || '[]');
      const judgeNames = parseJudgeNames(row.event_judges);
      const judgeNum = judgeNames.indexOf(judgeName) + 1;

      if (judgeNum > 0) {
        for (const heat of heats) {
          if (heat.judges && Array.isArray(heat.judges)) {
            const judge = heat.judges.find((j: any) => j.judge_number === judgeNum);
            if (judge && judge.scores && Array.isArray(judge.scores)) {
              const validScores = judge.scores.filter((s: any) => s !== null && !isNaN(s));

              if (!breedStats.has(row.breed)) {
                breedStats.set(row.breed, { count: 0, scores: [] });
              }

              const stats = breedStats.get(row.breed)!;
              stats.count += validScores.length;
              stats.scores.push(...validScores);
            }
          }
        }
      }
    } catch (e) {
      console.error('Error parsing heats JSON:', e);
    }
  }

  return breedStats;
}

/**
 * Агрегирует статистику по собакам для конкретной породы и судьи
 */
export function aggregateDogStats(
  results: any[],
  judgeName: string,
  breed: string
): Map<string, DogStats> {
  const dogStats = new Map<string, DogStats>();

  for (const row of results) {
    if (row.breed === breed) {
      try {
        const heats = JSON.parse(row.heats_json || '[]');
        const judgeNames = parseJudgeNames(row.event_judges);
        const judgeNum = judgeNames.indexOf(judgeName) + 1;

        if (judgeNum > 0) {
          for (const heat of heats) {
            if (heat.judges && Array.isArray(heat.judges)) {
              const judge = heat.judges.find((j: any) => j.judge_number === judgeNum);
              if (judge && judge.scores && Array.isArray(judge.scores)) {
                const validScores = judge.scores.filter((s: any) => s !== null && !isNaN(s));
                const dogKey = `${row.name_lat}_${row.name_ru || ''}`;

                if (!dogStats.has(dogKey)) {
                  dogStats.set(dogKey, {
                    name: row.name_lat,
                    name_ru: row.name_ru,
                    scores: [],
                    events: []
                  });
                }

                const stats = dogStats.get(dogKey)!;
                stats.scores.push(...validScores);
                stats.events.push({
                  title: row.event_title,
                  date: row.date_start,
                  total: validScores.reduce((a: number, b: number) => a + b, 0)
                });
              }
            }
          }
        }
      } catch (e) {
        console.error('Error parsing heats JSON:', e);
      }
    }
  }

  return dogStats;
}

/**
 * Формирует массив собак с оценками по категориям
 */
export function formatDogsArray(
  dogStats: Map<string, DogStats>,
  results: any[],
  judgeName: string,
  breed: string
): any[] {
  const dogsArray = Object.values(Object.fromEntries(dogStats)).map((dog: any) => ({
    name: dog.name,
    name_ru: dog.name_ru,
    avg_score: dog.scores.length > 0 ? dog.scores.reduce((a: number, b: number) => a + b, 0) / dog.scores.length : null,
    total_evaluations: dog.scores.length / 5,
    scores_by_criteria: {
      0: [],
      1: [],
      2: [],
      3: [],
      4: []
    } as Record<number, number[]>,
    events: dog.events
  }));

  // Распределяем оценки по категориям для каждой собаки
  for (const row of results) {
    if (row.breed === breed) {
      try {
        const heats = JSON.parse(row.heats_json || '[]');
        const judgeNames = parseJudgeNames(row.event_judges);
        const judgeNum = judgeNames.indexOf(judgeName) + 1;

        if (judgeNum > 0) {
          for (const heat of heats) {
            if (heat.judges && Array.isArray(heat.judges)) {
              const judge = heat.judges.find((j: any) => j.judge_number === judgeNum);
              if (judge && judge.scores && Array.isArray(judge.scores)) {
                const validScores = judge.scores.filter((s: any) => s !== null && !isNaN(s));
                const dogKey = `${row.name_lat}_${row.name_ru || ''}`;

                const dogData = dogsArray.find((d: any) =>
                  d.name === row.name_lat && d.name_ru === row.name_ru
                );

                if (dogData) {
                  validScores.forEach((score: number, idx: number) => {
                    if (idx < 5 && dogData.scores_by_criteria[idx] !== undefined) {
                      (dogData.scores_by_criteria as Record<number, number[]>)[idx].push(score);
                    }
                  });
                }
              }
            }
          }
        }
      } catch (e) {
        console.error('Error parsing heats JSON:', e);
      }
    }
  }

  dogsArray.sort((a: any, b: any) => (b.avg_score || 0) - (a.avg_score || 0));
  return dogsArray;
}

/**
 * Формирует данные по породам с детальной информацией о собаках
 */
export function formatBreedData(
  breedStats: Map<string, BreedStats>,
  results: any[],
  judgeName: string
): any[] {
  const breedData = [];

  for (const [breed, stats] of breedStats.entries()) {
    const validScores = stats.scores.filter((s: any) => s !== null && !isNaN(s));
    const avgScore = validScores.length > 0
      ? validScores.reduce((a: number, b: number) => a + b, 0) / validScores.length
      : null;
    const minScore = validScores.length > 0 ? Math.min(...validScores) : null;
    const maxScore = validScores.length > 0 ? Math.max(...validScores) : null;

    const dogStats = aggregateDogStats(results, judgeName, breed);
    const dogsArray = formatDogsArray(dogStats, results, judgeName, breed);

    breedData.push({
      breed,
      count: stats.count,
      evaluations_count: Math.round(stats.count / 5),
      avg_score: avgScore,
      min_score: minScore,
      max_score: maxScore,
      dogs: dogsArray
    });
  }

  breedData.sort((a: any, b: any) => b.count - a.count);
  return breedData;
}

/**
 * Агрегирует статистику по критериям оценок
 */
export function aggregateCriteriaStats(
  results: any[],
  judgeName: string
): CriteriaStats {
  const criteriaStats: CriteriaStats = { 0: [], 1: [], 2: [], 3: [], 4: [] } as CriteriaStats;

  for (const row of results) {
    try {
      const heats = JSON.parse(row.heats_json || '[]');
      const judgeNames = parseJudgeNames(row.event_judges);
      const judgeNum = judgeNames.indexOf(judgeName) + 1;

      if (judgeNum > 0) {
        for (const heat of heats) {
          if (heat.judges && Array.isArray(heat.judges)) {
            const judge = heat.judges.find((j: any) => j.judge_number === judgeNum);
            if (judge && judge.scores && Array.isArray(judge.scores)) {
              const validScores = judge.scores.filter((s: any) => s !== null && !isNaN(s));

              validScores.forEach((score: number, idx: number) => {
                if (idx < 5 && criteriaStats[idx] !== undefined) {
                  (criteriaStats[idx] as number[]).push(score);
                }
              });
            }
          }
        }
      }
    } catch (e) {
      console.error('Error parsing heats JSON:', e);
    }
  }

  return criteriaStats;
}

/**
 * Формирует данные по критериям оценок
 */
export function formatCriteriaData(criteriaStats: CriteriaStats): any[] {
  const criteriaData = [];
  const criteriaNames = ['Манёвренность', 'Резвость', 'Выносливость', 'Преследование', 'Энтузиазм'];

  for (let i = 0; i < 5; i++) {
    const scores = criteriaStats[i].filter((s: any) => s !== null && !isNaN(s));
    if (scores.length > 0) {
      criteriaData.push({
        name: criteriaNames[i],
        count: scores.length,
        evaluations_count: Math.round(scores.length / 5),
        avg_score: scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
        min_score: Math.min(...scores),
        max_score: Math.max(...scores)
      });
    }
  }

  return criteriaData;
}

/**
 * Агрегирует все оценки и суммарные оценки собак для конкретного судьи
 */
export function aggregateAllScoresAndDogTotals(
  results: any[],
  judgeName: string
): { allScores: number[]; dogTotalScores: Map<string, DogTotalScore>; recentEvaluations: any[] } {
  const allScores: number[] = [];
  const recentEvaluations: any[] = [];
  const dogTotalScores = new Map<string, DogTotalScore>();

  for (const row of results) {
    try {
      const heats = JSON.parse(row.heats_json || '[]');
      const judgeNames = parseJudgeNames(row.event_judges);
      const judgeNum = judgeNames.indexOf(judgeName) + 1;

      if (judgeNum > 0) {
        for (const heat of heats) {
          if (heat.judges && Array.isArray(heat.judges)) {
            const judge = heat.judges.find((j: any) => j.judge_number === judgeNum);
            if (judge && judge.scores && Array.isArray(judge.scores)) {
              const validScores = judge.scores.filter((s: any) => s !== null && !isNaN(s));

              allScores.push(...validScores);

              const dogKey = `${row.dog_id}_${row.event_id}`;
              if (!dogTotalScores.has(dogKey)) {
                dogTotalScores.set(dogKey, {
                  dog_id: row.dog_id,
                  dog_name: `${row.name_lat} ${row.name_ru ? `(${row.name_ru})` : ''}`,
                  breed: row.breed,
                  event_id: row.event_id,
                  event_title: row.event_title,
                  event_date: row.date_start,
                  total_score: 0,
                  score_count: 0
                });
              }

              const sum = validScores.reduce((a: number, b: number) => a + b, 0);
              dogTotalScores.get(dogKey)!.total_score += sum;
              dogTotalScores.get(dogKey)!.score_count += validScores.length;

              validScores.forEach((score: number) => {
                recentEvaluations.push({
                  score,
                  breed: row.breed,
                  dog: `${row.name_lat} ${row.name_ru ? `(${row.name_ru})` : ''}`,
                  event: row.event_title,
                  date: row.date_start,
                  discipline: row.event_type
                });
              });
            }
          }
        }
      }
    } catch (e) {
      console.error('Error parsing heats JSON:', e);
    }
  }

  return { allScores, dogTotalScores, recentEvaluations };
}
