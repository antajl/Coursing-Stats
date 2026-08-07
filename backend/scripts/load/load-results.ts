import fs from "node:fs/promises";
import { parseCoursingResultsPage } from "../../parsers/coursing/index";
import { parseBzmpResultsPage } from "../../parsers/bzmp/index";
import { parseRacingResultsPage } from "../../parsers/racing/index";
import { normalizeDogName, normalizeBreed } from "../../lib/dog-lookup";
import { sleep } from "../../lib/fetch-win1251";

/**
 * Загрузка результатов через API.
 * 
 * Использование:
 * node scripts/load-results.mjs <events-file> <api-url> <admin-token>
 * 
 * Пример:
 * node scripts/load-results.mjs data/events/events.json http://127.0.0.1:8787/api/admin/import-results secret-token
 */

const EVENTS_FILE = process.argv[2] || "data/events/events.json";
const API_URL = process.argv[3] || "http://127.0.0.1:8787/api/admin/import-results";
const ADMIN_TOKEN = process.argv[4] || process.env.ADMIN_TOKEN;

async function loadResults() {
  console.log(`Загрузка результатов из ${EVENTS_FILE}...`);
  
  if (!ADMIN_TOKEN) {
    console.error('ADMIN_TOKEN не задан. Укажите его как аргумент или переменную окружения.');
    process.exit(1);
  }
  
  // Читаем events файл
  const eventsData = await fs.readFile(EVENTS_FILE, "utf8");
  const events = JSON.parse(eventsData);
  
  // Фильтруем события с results_url
  const eventsWithResults = events.filter(e => e.results_url);
  console.log(`Найдено ${eventsWithResults.length} событий с результатами`);
  
  const dogsMap = new Map(); // Для отслеживания уникальных собак
  const dogs = [];
  const results = [];
  const eventsUpdates = []; // Для обновления событий (judges, track_schemes)
  
  for (const event of eventsWithResults) {
    console.log(`Обработка: ${event.date_start} - ${event.results_url}`);
    
    await sleep(1000); // Пауза между запросами
    
    let parsedResults = [];
    
    // Определяем тип события и используем соответствующий парсер
    const eventType = event.event_type || 
                      (event.results_url?.includes('Coursing') ? 'coursing' : null) ||
                      (event.results_url?.includes('BZMP') ? 'bzmp' : null) ||
                      (event.results_url?.includes('Racing') ? 'racing' : null);
    
    if (eventType === 'coursing') {
      const parsed = await parseCoursingResultsPage(event.results_url);
      parsedResults = parsed.results;
      // Сохраняем judges и track_schemes для обновления события
      if (parsed.judges || parsed.track_schemes) {
        eventsUpdates.push({
          results_url: event.results_url,
          judges: parsed.judges || null,
          track_schemes: parsed.track_schemes || null
        });
      }
    } else if (eventType === 'bzmp') {
      const parsed = await parseBzmpResultsPage(event.results_url);
      parsedResults = parsed.results;
      // Сохраняем judges и track_schemes для обновления события
      if (parsed.judges || parsed.track_schemes) {
        eventsUpdates.push({
          results_url: event.results_url,
          judges: parsed.judges || null,
          track_schemes: parsed.track_schemes || null
        });
      }
    } else if (eventType === 'racing') {
      const parsed = await parseRacingResultsPage(event.results_url);
      parsedResults = parsed.results;
      // Сохраняем judges и track_schemes для обновления события
      if (parsed.judges || parsed.track_schemes) {
        eventsUpdates.push({
          results_url: event.results_url,
          judges: parsed.judges || null,
          track_schemes: parsed.track_schemes || null
        });
      }
    } else {
      console.log(`  Пропуск: неизвестный тип события (${eventType})`);
      continue;
    }

    if (!parsedResults || !Array.isArray(parsedResults)) {
      console.log(`  Пропуск: парсер вернул некорректные результаты (${eventType})`);
      continue;
    }

    console.log(`  Найдено ${parsedResults.length} записей`);
    
    // Сначала собираем собак
    for (const result of parsedResults) {
      const nameLat = normalizeDogName(result.name_lat || result.name);
      const nameRu = normalizeDogName(result.name_ru || '');
      const breed = normalizeBreed(result.breed);
      const dogKey = `${nameLat}|${breed}`;

      if (!dogsMap.has(dogKey)) {
        dogs.push({
          name_lat: nameLat,
          breed: breed,
          name_ru: nameRu || null,
          pedigree_url: null
        });
        dogsMap.set(dogKey, true);
      }
    }
    
    // Затем собираем результаты
    for (const result of parsedResults) {
      const nameLat = normalizeDogName(result.name_lat || result.name);
      const breed = normalizeBreed(result.breed);

      results.push({
        name_lat: nameLat,
        breed: breed,
        event_id: null, // будет заполнено на сервере
        results_url: event.results_url,
        breed_class: result.breed_class || null,
        placement: result.placement || null,
        total_score: result.total_score || null,
        judge_count: result.judge_count || 3,
        qualification: result.qualification || null,
        vc: result.vc || null,
        status: result.status || 'finished',
        raw_scores_json: result.raw_scores_json || '{}',
        raw_text: (result.raw_text || "").replace(/\n/g, " "),
        judges: result.judges || null,
        status_reason: result.status_reason || null
      });
    }
  }
  
  console.log(`Всего собак: ${dogs.length}`);
  console.log(`Всего результатов: ${results.length}`);
  
  // Отправляем данные на API
  console.log(`Отправка данных на ${API_URL}...`);
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': ADMIN_TOKEN
      },
      body: JSON.stringify({ dogs, results, events: eventsUpdates })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    console.log('Загрузка завершена:', data);
  } catch (error) {
    console.error('Ошибка при загрузке:', error.message);
    process.exit(1);
  }
}

loadResults().catch(console.error);
