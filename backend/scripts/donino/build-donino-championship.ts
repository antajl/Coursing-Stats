import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { DogStanding, StageInfo, PromotionRecord } from './championship/types.js';
import { parseStageResults, buildStageInfo } from './championship/scoring.js';
import { recordStagePromotions, processStageResults } from './championship/promotions.js';

export * from './championship/types.js';
export { parseLeague, cleanDogNameFields } from './championship/matchers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../..');

export function buildDoninoChampionshipData() {
  const pointsPath = path.join(ROOT, 'data/v1/donino/championship-points.json');
  let pointsData: { stage_1?: any[]; stage_2?: any[]; stage_3?: any[]; overall?: any[] } = {};
  if (fs.existsSync(pointsPath)) {
    try {
      pointsData = JSON.parse(fs.readFileSync(pointsPath, 'utf8'));
    } catch (e) {
      console.warn('Failed to parse championship-points.json:', e);
    }
  }

  const stage1Path = path.join(
    ROOT,
    'data/v1/competitions/2026/08-август/2026004-i-клубныи-чемпионат-по-бегам-борзых.json'
  );
  const stage2Path = path.join(
    ROOT,
    'data/v1/competitions/2026/09-сентябрь/2022001-клубный-чемпионат-по-рейсингу.json'
  );
  const stage3Path = path.join(
    ROOT,
    'data/v1/competitions/2026/10-октябрь/2026005-iii-клубныи-чемпионат-донино-по-бегам-борзых.json'
  );

  const s1Data = JSON.parse(fs.readFileSync(stage1Path, 'utf8'));
  const s2Data = JSON.parse(fs.readFileSync(stage2Path, 'utf8'));
  const s3Data = fs.existsSync(stage3Path) ? JSON.parse(fs.readFileSync(stage3Path, 'utf8')) : null;

  const stage1Results = parseStageResults(s1Data);
  const stage2Results = parseStageResults(s2Data);
  const stage3Results = parseStageResults(s3Data);

  const stage1: StageInfo = buildStageInfo(
    2026004,
    1,
    '2026-08-09',
    null,
    'I Клубный чемпионат Донино',
    s1Data,
    stage1Results
  );

  const stage2: StageInfo = buildStageInfo(
    2022001,
    2,
    '2026-09-20',
    null,
    'II Клубный чемпионат Донино',
    s2Data,
    stage2Results
  );

  const stage3: StageInfo = buildStageInfo(
    2026005,
    3,
    '2026-10-31',
    '2026-11-01',
    'III Клубный чемпионат Донино (Финал сезона)',
    s3Data,
    stage3Results,
    '/protocols/2026005.pdf'
  );

  const dogsMap = new Map<string, DogStanding>();

  // Process stages uniformly
  processStageResults(stage1, stage1Results, pointsData.stage_1, dogsMap);
  const promotionsAfterStage1: PromotionRecord[] = recordStagePromotions(1, stage1Results);

  processStageResults(stage2, stage2Results, pointsData.stage_2, dogsMap);
  const promotionsAfterStage2: PromotionRecord[] = recordStagePromotions(2, stage2Results);

  processStageResults(stage3, stage3Results, pointsData.stage_3, dogsMap);
  const promotionsAfterStage3: PromotionRecord[] = recordStagePromotions(3, stage3Results);

  // Sort standings: League priority (Абсолют > Чемпионов > Прогресс > Юниоры), then best_time asc
  const leagueOrder: Record<string, number> = {
    'Абсолют': 1,
    'Чемпионов': 2,
    'Прогресс': 3,
    'Юниоры': 4,
  };

  const standingsList = Array.from(dogsMap.values()).sort((a, b) => {
    const lA = leagueOrder[a.current_league] || 99;
    const lB = leagueOrder[b.current_league] || 99;
    if (lA !== lB) return lA - lB;
    if (a.best_time && b.best_time) return a.best_time - b.best_time;
    if (a.best_time && !b.best_time) return -1;
    if (!a.best_time && b.best_time) return 1;
    return a.name.localeCompare(b.name, 'ru');
  });

  const output = {
    schema_version: '1.0',
    generated_at: new Date().toISOString(),
    series_title: 'Серия клубных чемпионатов Донино по рейсингу (бегам борзых)',
    season: 2026,
    organizer: 'Курсинг в Донино',
    series_director: 'Манухин Михаил Андреевич',
    track_length_meters: 350,
    reglament_pdf_url: s2Data.event?.rules_url || null,
    spreadsheet_url:
      'https://docs.google.com/spreadsheets/d/1OKA9-I7oiY3xOisuxiDUOpn6C6bGxSQMkZDcuwtXiJg/edit?gid=22361699#gid=22361699',
    results_spreadsheet_url:
      'https://docs.google.com/spreadsheets/d/1OKA9-I7oiY3xOisuxiDUOpn6C6bGxSQMkZDcuwtXiJg/edit?gid=22361699#gid=22361699',
    points_spreadsheet_url:
      'https://docs.google.com/spreadsheets/d/1PGrVO98HfxwzoOxHmd8eRaygvl3iJryIXYfPd7vmyNQ/edit?gid=0#gid=0',
    stages: [stage1, stage2, stage3],
    standings: standingsList,
    promotions: {
      after_stage_1: promotionsAfterStage1,
      after_stage_2: promotionsAfterStage2,
      after_stage_3: promotionsAfterStage3,
    },
    stats: {
      total_dogs_participated: standingsList.length,
      dogs_in_absolut: standingsList.filter((d) => d.current_league === 'Абсолют').length,
      dogs_in_champions: standingsList.filter((d) => d.current_league === 'Чемпионов').length,
      dogs_in_progress: standingsList.filter((d) => d.current_league === 'Прогресс').length,
      dogs_in_juniors: standingsList.filter((d) => d.current_league === 'Юниоры').length,
      promotions_count:
        promotionsAfterStage1.length + promotionsAfterStage2.length + promotionsAfterStage3.length,
    },
  };

  const outDir = path.join(ROOT, 'data/v1/donino');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'championship.json');
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2), 'utf8');
  console.log(`✓ Donino championship data generated: ${outFile}`);
  console.log(`  - Total dogs: ${standingsList.length}`);
  console.log(
    `  - Absolut: ${output.stats.dogs_in_absolut}, Champions: ${output.stats.dogs_in_champions}, Progress: ${output.stats.dogs_in_progress}, Juniors: ${output.stats.dogs_in_juniors}`
  );
  return output;
}

if (process.argv[1] && process.argv[1].includes('build-donino-championship')) {
  buildDoninoChampionshipData();
}
