import { Hono } from 'hono';
import { parseJudgeNames } from '../lib/judge-names';
import { tryStaticJudgesSummary } from '../lib/static-api';
import {
  aggregateJudgeStats,
  formatJudgesData,
  aggregateBreedStats,
  formatBreedData,
  aggregateCriteriaStats,
  formatCriteriaData,
  aggregateAllScoresAndDogTotals
} from '../lib/judge-stats';

type Env = {
  DB: any;
  ADMIN_API_TOKEN: string;
};

export function handleJudges(app: Hono<{ Bindings: Env }>) {
  // GET /api/judges
  app.get('/api/judges', async (c) => {
    const db = c.env.DB;
    const breed = c.req.query('breed') || '';
    const discipline = c.req.query('discipline') || '';

    if (!breed && !discipline) {
      const staticSummary = await tryStaticJudgesSummary();
      if (staticSummary) {
        return c.json({
          success: true,
          data: {
            judges: staticSummary.judges,
            availableBreeds: staticSummary.availableBreeds,
          },
        });
      }
    }
    
    // Извлекаем статистику судей из raw_scores_json и связываем с фамилиями из events.judges
    let query = `
      SELECT
        json_extract(r.raw_scores_json, '$.heats') as heats_json,
        e.judges as event_judges,
        e.event_type,
        d.breed,
        r.total_score,
        e.id as event_id
      FROM results r
      JOIN dogs d ON r.dog_id = d.id
      JOIN events e ON r.event_id = e.id
      WHERE r.status = 'finished' 
        AND r.raw_scores_json IS NOT NULL 
        AND r.raw_scores_json != '{}'
        AND e.judges IS NOT NULL
        AND e.judges != ''
    `;
    
    const params = [];
    
    if (breed) {
      query += ' AND d.breed = ?';
      params.push(breed);
    }
    
    if (discipline) {
      query += ' AND e.event_type = ?';
      params.push(discipline);
    }
    
    const { results } = await db.prepare(query).bind(...params).all();
    
    // Получаем список пород для фильтра
    const breedsQuery = `
      SELECT DISTINCT d.breed
      FROM results r
      JOIN dogs d ON r.dog_id = d.id
      JOIN events e ON r.event_id = e.id
      WHERE r.status = 'finished' 
        AND r.raw_scores_json IS NOT NULL 
        AND r.raw_scores_json != '{}'
        AND e.judges IS NOT NULL
        AND e.judges != ''
      ORDER BY d.breed
    `;
    const { results: breedResults } = await db.prepare(breedsQuery).all();
    const availableBreeds = breedResults.map(row => row.breed);
    
    // Агрегируем статистику судей
    const judgeStatsMap = aggregateJudgeStats(results);
    const judgesData = formatJudgesData(judgeStatsMap);
    
    return c.json({
      success: true,
      data: {
        judges: judgesData,
        available_breeds: availableBreeds
      }
    });
  });

  // GET /api/judges/:id/details
  app.get('/api/judges/:id/details', async (c) => {
    const db = c.env.DB;
    const judgeName = decodeURIComponent(c.req.param('id'));
    const breed = c.req.query('breed') || '';
    const discipline = c.req.query('discipline') || '';
    
    let query = `
      SELECT
        json_extract(r.raw_scores_json, '$.heats') as heats_json,
        e.judges as event_judges,
        e.event_type,
        d.breed,
        d.name_lat,
        d.name_ru,
        r.total_score,
        e.title as event_title,
        e.date_start,
        e.id as event_id
      FROM results r
      JOIN dogs d ON r.dog_id = d.id
      JOIN events e ON r.event_id = e.id
      WHERE r.status = 'finished' 
        AND r.raw_scores_json IS NOT NULL 
        AND r.raw_scores_json != '{}'
        AND e.judges IS NOT NULL
        AND e.judges != ''
    `;
    
    const params = [];
    
    if (breed) {
      query += ' AND d.breed = ?';
      params.push(breed);
    }
    
    if (discipline) {
      query += ' AND e.event_type = ?';
      params.push(discipline);
    }
    
    const { results } = await db.prepare(query).bind(...params).all();

    // Агрегируем статистику с помощью вынесенных функций
    const breedStatsMap = aggregateBreedStats(results, judgeName);
    const breedData = formatBreedData(breedStatsMap, results, judgeName);
    const criteriaStatsMap = aggregateCriteriaStats(results, judgeName);
    const criteriaData = formatCriteriaData(criteriaStatsMap);
    const { allScores, dogTotalScores, recentEvaluations } = aggregateAllScoresAndDogTotals(results, judgeName);

    const overallAvg = allScores.length > 0
      ? allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length
      : null;

    recentEvaluations.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const dogScoresData = Object.values(Object.fromEntries(dogTotalScores)).map((dog: any) => ({
      dog_name: dog.dog_name,
      breed: dog.breed,
      event_title: dog.event_title,
      event_date: dog.event_date,
      total_score: dog.total_score,
      avg_score_per_criteria: dog.score_count > 0 ? dog.total_score / dog.score_count : null
    }));

    dogScoresData.sort((a: any, b: any) => b.total_score - a.total_score);
    
    return c.json({
      success: true,
      data: {
        judge_name: judgeName,
        total_evaluations: allScores.length,
        avg_score: overallAvg,
        breed_stats: breedData,
        criteria_stats: criteriaData
      }
    });
  });
}
