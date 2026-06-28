import { Hono } from 'hono';

type Env = {
  DB: any;
  ADMIN_API_TOKEN: string;
};

// Функция для парсинга фамилий судей из строки
function parseJudgeNames(judgesString: string) {
  if (!judgesString) return [];
  
  // Форматы:
  // "Лукина Д.М., Гродинская Т.Л."
  // "Главный судья - Лукина Д.М., судья - Гродинская Т.Л."
  // "Карелина Н"
  
  // Удаляем префиксы "Главный судья - ", "судья - "
  let cleaned = judgesString
    .replace(/Главный\s+судья\s*[:\s-]+\s*/gi, '')
    .replace(/судья\s*[:\s-]+\s*/gi, '')
    .trim();
  
  // Разделяем по запятым
  const names = cleaned.split(',').map(n => n.trim()).filter(n => n);
  
  // Если не получилось разделить, пробуем другие разделители
  if (names.length === 1 && cleaned.includes(' и ')) {
    return cleaned.split(' и ').map(n => n.trim()).filter(n => n);
  }
  
  return names;
}

export function handleJudges(app: Hono<{ Bindings: Env }>) {
  // GET /api/judges
  app.get('/api/judges', async (c) => {
    const db = c.env.DB;
    const breed = c.req.query('breed') || '';
    const discipline = c.req.query('discipline') || '';
    
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
    
    // Парсим фамилии судей из events.judges и связываем с оценками
    const judgeStats: any = {}; // Ключ: фамилия судья
    
    for (const row of results) {
      try {
        const heats = JSON.parse(row.heats_json || '[]');
        
        // Парсим фамилии судей из строки "Лукина Д.М., Гродинская Т.Л."
        const judgeNames = parseJudgeNames(row.event_judges);
        
        for (const heat of heats) {
          if (heat.judges && Array.isArray(heat.judges)) {
            for (const judge of heat.judges) {
              const judgeNum = judge.judge_number;
              // Получаем фамилию по номеру судья (1-based index)
              const judgeName = judgeNames[judgeNum - 1] || `Судья ${judgeNum}`;
              
              if (!judgeStats[judgeName]) {
                judgeStats[judgeName] = { 
                  name: judgeName, 
                  total_evaluations: 0, 
                  scores: [], 
                  breeds: new Set(), 
                  disciplines: new Set(),
                  events: new Set()
                };
              }
              
              if (judge.scores && Array.isArray(judge.scores)) {
                judgeStats[judgeName].total_evaluations += judge.scores.length;
                judgeStats[judgeName].scores.push(...judge.scores);
                judgeStats[judgeName].breeds.add(row.breed);
                judgeStats[judgeName].disciplines.add(row.event_type);
                judgeStats[judgeName].events.add(row.event_id);
              }
            }
          }
        }
      } catch (e) {
        console.error('Error parsing heats JSON:', e);
      }
    }
    
    // Формируем итоговый массив
    const judgesData = [];
    for (const [name, stats] of Object.entries(judgeStats)) {
      const validScores = stats.scores.filter((s: any) => s !== null && !isNaN(s));
      const avgScore = validScores.length > 0 
        ? validScores.reduce((a: number, b: number) => a + b, 0) / validScores.length 
        : null;
      
      judgesData.push({
        id: name, // Используем имя как ID
        name: stats.name,
        total_evaluations: stats.total_evaluations,
        total_evaluations_count: Math.round(stats.total_evaluations / 5), // Количество оцениваний
        avg_score: avgScore,
        unique_breeds: stats.breeds.size,
        unique_disciplines: stats.disciplines.size,
        unique_events: stats.events.size
      });
    }
    
    judgesData.sort((a, b) => b.total_evaluations - a.total_evaluations);
    
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
    
    // Агрегируем детальную статистику по породам для конкретного судьи
    const breedStats: any = {};
    const allScores: number[] = [];
    const recentEvaluations: any[] = [];
    const criteriaStats: any = { 0: [], 1: [], 2: [], 3: [], 4: [] }; // 5 категорий оценок
    const dogTotalScores: any = {}; // Суммарные оценки для каждой собаки
    
    for (const row of results) {
      try {
        const heats = JSON.parse(row.heats_json || '[]');
        const judgeNames = parseJudgeNames(row.event_judges);
        
        // Находим номер судьи по имени
        const judgeNum = judgeNames.indexOf(judgeName) + 1;
        
        if (judgeNum > 0) {
          for (const heat of heats) {
            if (heat.judges && Array.isArray(heat.judges)) {
              const judge = heat.judges.find((j: any) => j.judge_number === judgeNum);
              if (judge && judge.scores && Array.isArray(judge.scores)) {
                const validScores = judge.scores.filter((s: any) => s !== null && !isNaN(s));
                
                // Статистика по породам
                if (!breedStats[row.breed]) {
                  breedStats[row.breed] = { count: 0, scores: [] };
                }
                breedStats[row.breed].count += validScores.length;
                breedStats[row.breed].scores.push(...validScores);
                
                // Все оценки
                allScores.push(...validScores);
                
                // Статистика по критериям (5 категорий)
                validScores.forEach((score: number, idx: number) => {
                  if (idx < 5 && criteriaStats[idx] !== undefined) {
                    criteriaStats[idx].push(score);
                  }
                });
                
                // Суммарная оценка для собаки
                const dogKey = `${row.dog_id}_${row.event_id}`;
                if (!dogTotalScores[dogKey]) {
                  dogTotalScores[dogKey] = {
                    dog_id: row.dog_id,
                    dog_name: `${row.name_lat} ${row.name_ru ? `(${row.name_ru})` : ''}`,
                    breed: row.breed,
                    event_id: row.event_id,
                    event_title: row.event_title,
                    event_date: row.date_start,
                    total_score: 0,
                    score_count: 0
                  };
                }
                const sum = validScores.reduce((a: number, b: number) => a + b, 0);
                dogTotalScores[dogKey].total_score += sum;
                dogTotalScores[dogKey].score_count += validScores.length;
                
                // Последние оценки (для отображения)
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
    
    // Формируем статистику по породам с детальной информацией о собаках
    const breedData = [];
    for (const [breed, stats] of Object.entries(breedStats)) {
      const validScores = stats.scores.filter((s: any) => s !== null && !isNaN(s));
      const avgScore = validScores.length > 0 
        ? validScores.reduce((a: number, b: number) => a + b, 0) / validScores.length 
        : null;
      const minScore = validScores.length > 0 ? Math.min(...validScores) : null;
      const maxScore = validScores.length > 0 ? Math.max(...validScores) : null;
      
      // Агрегируем статистику по собакам для этой породы
      const dogStats: any = {};
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
                    
                    if (!dogStats[dogKey]) {
                      dogStats[dogKey] = {
                        name: row.name_lat,
                        name_ru: row.name_ru,
                        scores: [],
                        events: []
                      };
                    }
                    
                    dogStats[dogKey].scores.push(...validScores);
                    dogStats[dogKey].events.push({
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
      
      // Формируем массив собак для этой породы
      const dogsArray = Object.values(dogStats).map((dog: any) => ({
        name: dog.name,
        name_ru: dog.name_ru,
        avg_score: dog.scores.length > 0 ? dog.scores.reduce((a: number, b: number) => a + b, 0) / dog.scores.length : null,
        total_evaluations: dog.scores.length / 5, // Делим на 5, так как одно оценивание = 5 категорий
        scores_by_criteria: {
          0: [],
          1: [],
          2: [],
          3: [],
          4: []
        },
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
                          dogData.scores_by_criteria[idx].push(score);
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
      
      breedData.push({
        breed,
        count: stats.count,
        evaluations_count: Math.round(stats.count / 5), // Количество оцениваний
        avg_score: avgScore,
        min_score: minScore,
        max_score: maxScore,
        dogs: dogsArray
      });
    }
    
    breedData.sort((a: any, b: any) => b.count - a.count);
    
    const overallAvg = allScores.length > 0 
      ? allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length 
      : null;
    
    recentEvaluations.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Формируем статистику по критериям
    const criteriaData = [];
    const criteriaNames = ['Манёвренность', 'Резвость', 'Выносливость', 'Преследование', 'Энтузиазм'];
    for (let i = 0; i < 5; i++) {
      const scores = criteriaStats[i].filter((s: any) => s !== null && !isNaN(s));
      if (scores.length > 0) {
        criteriaData.push({
          name: criteriaNames[i],
          count: scores.length, // Количество оценок
          evaluations_count: Math.round(scores.length / 5), // Количество оцениваний
          avg_score: scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
          min_score: Math.min(...scores),
          max_score: Math.max(...scores)
        });
      }
    }
    
    // Формируем суммарные оценки по собакам
    const dogScoresData = Object.values(dogTotalScores).map((dog: any) => ({
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
