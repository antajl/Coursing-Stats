import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../..');

export interface StageInfo {
  id: number;
  stage_num: number;
  date_start: string;
  date_end?: string | null;
  title: string;
  discipline: string;
  location: string;
  judge?: string | null;
  series_director?: string;
  participants_count: number;
  has_results: boolean;
  status: 'completed' | 'upcoming';
  catalog_url?: string | null;
  rules_url?: string | null;
  results_pdf_url?: string | null;
  protocol_url?: string | null;
  classes_count?: number;
  winners?: {
    dog_name: string;
    breed: string;
    breed_class: string;
    league: string;
    placement: number;
    time: number | null;
  }[];
  results?: {
    id: number;
    catalog_no?: number | null;
    dog_id?: number | null;
    dog_name: string;
    breed: string;
    sex: string;
    breed_class: string;
    league: 'Абсолют' | 'Чемпионов' | 'Прогресс' | 'Юниоры';
    placement: number;
    total_score: number | null;
    status: string;
    status_reason?: string | null;
    heats: Array<{
      heat_no: number;
      time: number | null;
      rank?: number | null;
      disqualified?: boolean;
    }>;
  }[];
}

export interface DogStanding {
  dog_key: string;
  dog_id?: number | null;
  name: string;
  name_ru: string;
  name_lat: string;
  breed: string;
  sex: string;
  current_league: 'Абсолют' | 'Чемпионов' | 'Прогресс' | 'Юниоры';
  wins_count: number;
  consecutive_losses: number;
  best_time: number | null;
  stages_count: number;
  status_badge: string; // 'stable' | 'promoted_up' | 'relegated_down'
  promotion_label?: string | null;
  history: {
    stage_num: number;
    date: string;
    placement: number;
    total_score: number | null;
    league: string;
    breed_class: string;
    status: string;
  }[];
}

export interface PromotionRecord {
  stage_from: number;
  stage_to: number;
  dog_name: string;
  breed: string;
  from_league: string;
  to_league: string;
  reason: string; // "1 место в финале класса ..."
}

export function parseLeague(breedClass?: string | null): 'Абсолют' | 'Чемпионов' | 'Прогресс' | 'Юниоры' {
  if (!breedClass) return 'Прогресс';
  const lower = breedClass.toLowerCase();
  if (lower.includes('юниор')) return 'Юниоры';
  if (lower.includes('абсолют')) return 'Абсолют';
  if (lower.includes('чемпион')) return 'Чемпионов';
  return 'Прогресс';
}

export function buildDoninoChampionshipData() {
  const stage1Path = path.join(ROOT, 'data/v1/competitions/2026/08-август/2026004-i-клубныи-чемпионат-по-бегам-борзых.json');
  const stage2Path = path.join(ROOT, 'data/v1/competitions/2026/09-сентябрь/2022001-клубный-чемпионат-по-рейсингу.json');

  const s1Data = JSON.parse(fs.readFileSync(stage1Path, 'utf8'));
  const s2Data = JSON.parse(fs.readFileSync(stage2Path, 'utf8'));

  // Stage 1 parse
  const stage1Results = (s1Data.results || []).map((r: any) => {
    const rawScores = r.raw_scores_json || {};
    const heats = Array.isArray(rawScores.heats)
      ? rawScores.heats.map((h: any, idx: number) => ({
          heat_no: idx + 1,
          time: typeof h.time === 'number' ? h.time : null,
          rank: typeof h.rank === 'number' ? h.rank : null,
          disqualified: Boolean(h.disqualified),
        }))
      : [];

    const dogName = r.dog?.name_ru || r.dog?.name_lat || r.name_ru || r.name_lat || 'Неизвестная собака';
    const league = parseLeague(r.breed_class);

    return {
      id: r.id,
      catalog_no: r.catalog_no,
      dog_id: r.dog_id || r.dog?.id || null,
      dog_name: dogName,
      name_ru: r.dog?.name_ru || r.name_ru || dogName,
      name_lat: r.dog?.name_lat || r.name_lat || dogName,
      breed: (r.dog?.breed || r.breed || '').trim().toUpperCase(),
      sex: r.dog?.sex || r.sex || '',
      breed_class: r.breed_class || '',
      league,
      placement: r.placement || 0,
      total_score: typeof r.total_score === 'number' ? r.total_score : null,
      status: r.status || 'finished',
      status_reason: r.status_reason || null,
      heats,
    };
  });

  // Stage 2 parse
  const stage2Results = (s2Data.results || []).map((r: any) => {
    const rawScores = r.raw_scores_json || {};
    const heats = Array.isArray(rawScores.heats)
      ? rawScores.heats.map((h: any, idx: number) => ({
          heat_no: idx + 1,
          time: typeof h.time === 'number' ? h.time : null,
          rank: typeof h.rank === 'number' ? h.rank : null,
          disqualified: Boolean(h.disqualified),
        }))
      : [];

    const dogName = r.dog?.name_ru || r.dog?.name_lat || r.name_ru || r.name_lat || 'Неизвестная собака';
    const league = parseLeague(r.breed_class);

    return {
      id: r.id,
      catalog_no: r.catalog_no,
      dog_id: r.dog_id || r.dog?.id || null,
      dog_name: dogName,
      name_ru: r.dog?.name_ru || r.name_ru || dogName,
      name_lat: r.dog?.name_lat || r.name_lat || dogName,
      breed: (r.dog?.breed || r.breed || '').trim().toUpperCase(),
      sex: r.dog?.sex || r.sex || '',
      breed_class: r.breed_class || '',
      league,
      placement: r.placement || 0,
      total_score: typeof r.total_score === 'number' ? r.total_score : null,
      status: r.status || 'finished',
      status_reason: r.status_reason || null,
      heats,
    };
  });

  // Stage objects
  const stage1: StageInfo = {
    id: 2026004,
    stage_num: 1,
    date_start: '2026-08-09',
    date_end: null,
    title: 'I Клубный чемпионат Донино',
    discipline: 'Бега борзых (рейсинг 350 м)',
    location: 'Московская область, Раменский р-н, д. Донино',
    judge: null,
    series_director: 'Манухин Михаил Андреевич',
    participants_count: stage1Results.length,
    has_results: true,
    status: 'completed',
    results_pdf_url: s1Data.event?.results_pdf_url || null,
    protocol_url: '/event/2026004',
    classes_count: new Set(stage1Results.map((r: any) => r.breed_class)).size,
    winners: stage1Results
      .filter((r: any) => r.placement === 1)
      .map((r: any) => ({
        dog_name: r.dog_name,
        breed: r.breed,
        breed_class: r.breed_class,
        league: r.league,
        placement: 1,
        time: r.total_score,
      })),
    results: stage1Results,
  };

  const stage2: StageInfo = {
    id: 2022001,
    stage_num: 2,
    date_start: '2026-09-20',
    date_end: null,
    title: 'II Клубный чемпионат Донино',
    discipline: 'Бега борзых (рейсинг 350 м)',
    location: 'Московская область, Раменский р-н, д. Донино',
    judge: null,
    series_director: 'Манухин Михаил Андреевич',
    participants_count: stage2Results.length,
    has_results: true,
    status: 'completed',
    catalog_url: s2Data.event?.catalog_url || null,
    rules_url: s2Data.event?.rules_url || null,
    results_pdf_url: s2Data.event?.results_pdf_url || null,
    protocol_url: '/event/2022001',
    classes_count: new Set(stage2Results.map((r: any) => r.breed_class)).size,
    winners: stage2Results
      .filter((r: any) => r.placement === 1)
      .map((r: any) => ({
        dog_name: r.dog_name,
        breed: r.breed,
        breed_class: r.breed_class,
        league: r.league,
        placement: 1,
        time: r.total_score,
      })),
    results: stage2Results,
  };

  const stage3: StageInfo = {
    id: 2026005,
    stage_num: 3,
    date_start: '2026-10-31',
    date_end: '2026-11-01',
    title: 'III Клубный чемпионат Донино (Финал сезона)',
    discipline: 'Бега борзых (рейсинг 350 м)',
    location: 'Московская область, Раменский р-н, д. Донино',
    judge: null,
    series_director: 'Манухин Михаил Андреевич',
    participants_count: 0,
    has_results: false,
    status: 'upcoming',
    protocol_url: '/event/2026005',
    classes_count: 0,
    winners: [],
    results: [],
  };

  // Tracking dog standings and promotions
  const dogsMap = new Map<string, DogStanding>();

  function getDogKey(name: string, breed: string): string {
    return `${breed.trim().toLowerCase()}::${name.trim().toLowerCase()}`;
  }

  // Process Stage 1
  for (const r of stage1Results) {
    const key = getDogKey(r.dog_name, r.breed);
    const isWin = r.placement === 1;
    dogsMap.set(key, {
      dog_key: key,
      dog_id: r.dog_id,
      name: r.dog_name,
      name_ru: r.name_ru,
      name_lat: r.name_lat,
      breed: r.breed,
      sex: r.sex,
      current_league: isWin ? (r.league === 'Чемпионов' ? 'Абсолют' : 'Чемпионов') : r.league,
      wins_count: isWin ? 1 : 0,
      consecutive_losses: isWin ? 0 : 1,
      best_time: r.total_score,
      stages_count: 1,
      status_badge: isWin ? 'promoted_up' : 'stable',
      promotion_label: isWin
        ? (r.league === 'Чемпионов' ? 'Выход в Абсолют (победа I этапа)' : 'Выход в Чемпионы (победа I этапа)')
        : null,
      history: [
        {
          stage_num: 1,
          date: stage1.date_start,
          placement: r.placement,
          total_score: r.total_score,
          league: r.league,
          breed_class: r.breed_class,
          status: r.status,
        },
      ],
    });
  }

  // Process Stage 2
  const promotionsAfterStage1: PromotionRecord[] = [];
  const promotionsAfterStage2: PromotionRecord[] = [];

  // Record promotions after Stage 1
  for (const r of stage1Results) {
    if (r.placement === 1) {
      if (r.league === 'Чемпионов') {
        promotionsAfterStage1.push({
          stage_from: 1,
          stage_to: 2,
          dog_name: r.dog_name,
          breed: r.breed,
          from_league: 'Лига Чемпионов',
          to_league: 'Лига Абсолют',
          reason: `1 место в классе ${r.breed_class}`,
        });
      } else if (r.league === 'Прогресс') {
        promotionsAfterStage1.push({
          stage_from: 1,
          stage_to: 2,
          dog_name: r.dog_name,
          breed: r.breed,
          from_league: 'Лига Прогресс',
          to_league: 'Лига Чемпионов',
          reason: `1 место в классе ${r.breed_class}`,
        });
      }
    }
  }

  for (const r of stage2Results) {
    const key = getDogKey(r.dog_name, r.breed);
    const isWin = r.placement === 1;
    let standing = dogsMap.get(key);

    if (!standing) {
      // New dog joining at Stage 2
      const targetLeague = isWin
        ? (r.league === 'Чемпионов' ? 'Абсолют' : r.league === 'Прогресс' ? 'Чемпионов' : 'Абсолют')
        : r.league;

      standing = {
        dog_key: key,
        dog_id: r.dog_id,
        name: r.dog_name,
        name_ru: r.name_ru,
        name_lat: r.name_lat,
        breed: r.breed,
        sex: r.sex,
        current_league: targetLeague,
        wins_count: isWin ? 1 : 0,
        consecutive_losses: isWin ? 0 : 1,
        best_time: r.total_score,
        stages_count: 1,
        status_badge: isWin ? 'promoted_up' : 'stable',
        promotion_label: isWin
          ? (r.league === 'Чемпионов' ? 'Выход в Абсолют (победа II этапа)' : r.league === 'Прогресс' ? 'Выход в Чемпионы (победа II этапа)' : 'Победа в Лиге Абсолют')
          : null,
        history: [
          {
            stage_num: 2,
            date: stage2.date_start,
            placement: r.placement,
            total_score: r.total_score,
            league: r.league,
            breed_class: r.breed_class,
            status: r.status,
          },
        ],
      };
      dogsMap.set(key, standing);
    } else {
      // Existing dog
      standing.stages_count += 1;
      if (typeof r.total_score === 'number') {
        if (standing.best_time === null || r.total_score < standing.best_time) {
          standing.best_time = r.total_score;
        }
      }

      if (isWin) {
        standing.wins_count += 1;
        standing.consecutive_losses = 0;
        if (r.league === 'Чемпионов') {
          standing.current_league = 'Абсолют';
          standing.status_badge = 'promoted_up';
          standing.promotion_label = 'Выход в Абсолют на III этап';
        } else if (r.league === 'Прогресс') {
          standing.current_league = 'Чемпионов';
          standing.status_badge = 'promoted_up';
          standing.promotion_label = 'Выход в Чемпионы на III этап';
        } else if (r.league === 'Абсолют') {
          standing.current_league = 'Абсолют';
          standing.status_badge = 'stable';
          standing.promotion_label = 'Победитель Лиги Абсолют II этапа';
        }
      } else {
        standing.consecutive_losses += 1;
        // Check for relegation (3 consecutive losses per reglament)
        if (standing.consecutive_losses >= 3) {
          if (standing.current_league === 'Абсолют') {
            standing.current_league = 'Чемпионов';
            standing.status_badge = 'relegated_down';
            standing.promotion_label = 'Переход в Чемпионы (3 поражения подряд)';
          } else if (standing.current_league === 'Чемпионов') {
            standing.current_league = 'Прогресс';
            standing.status_badge = 'relegated_down';
            standing.promotion_label = 'Переход в Прогресс (3 поражения подряд)';
          }
        } else {
          standing.status_badge = 'stable';
          standing.promotion_label = null;
        }
      }

      standing.history.push({
        stage_num: 2,
        date: stage2.date_start,
        placement: r.placement,
        total_score: r.total_score,
        league: r.league,
        breed_class: r.breed_class,
        status: r.status,
      });
    }

    // Record promotions after Stage 2
    if (isWin) {
      if (r.league === 'Чемпионов') {
        promotionsAfterStage2.push({
          stage_from: 2,
          stage_to: 3,
          dog_name: r.dog_name,
          breed: r.breed,
          from_league: 'Лига Чемпионов',
          to_league: 'Лига Абсолют',
          reason: `1 место в классе ${r.breed_class}`,
        });
      } else if (r.league === 'Прогресс') {
        promotionsAfterStage2.push({
          stage_from: 2,
          stage_to: 3,
          dog_name: r.dog_name,
          breed: r.breed,
          from_league: 'Лига Прогресс',
          to_league: 'Лига Чемпионов',
          reason: `1 место в классе ${r.breed_class}`,
        });
      }
    }
  }

  // Sort standings: League priority (Абсолют > Чемпионов > Прогресс > Юниоры), then wins_count desc, then best_time asc
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
    if (b.wins_count !== a.wins_count) return b.wins_count - a.wins_count;
    if (a.best_time && b.best_time) return a.best_time - b.best_time;
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
    stages: [stage1, stage2, stage3],
    standings: standingsList,
    promotions: {
      after_stage_1: promotionsAfterStage1,
      after_stage_2: promotionsAfterStage2,
    },
    stats: {
      total_dogs_participated: standingsList.length,
      dogs_in_absolut: standingsList.filter(d => d.current_league === 'Абсолют').length,
      dogs_in_champions: standingsList.filter(d => d.current_league === 'Чемпионов').length,
      dogs_in_progress: standingsList.filter(d => d.current_league === 'Прогресс').length,
      dogs_in_juniors: standingsList.filter(d => d.current_league === 'Юниоры').length,
      promotions_count: promotionsAfterStage1.length + promotionsAfterStage2.length,
    },
  };

  const outDir = path.join(ROOT, 'data/v1/donino');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'championship.json');
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2), 'utf8');
  console.log(`✓ Donino championship data generated: ${outFile}`);
  console.log(`  - Total dogs: ${standingsList.length}`);
  console.log(`  - Absolut: ${output.stats.dogs_in_absolut}, Champions: ${output.stats.dogs_in_champions}, Progress: ${output.stats.dogs_in_progress}, Juniors: ${output.stats.dogs_in_juniors}`);
  return output;
}

if (process.argv[1] && process.argv[1].includes('build-donino-championship')) {
  buildDoninoChampionshipData();
}
