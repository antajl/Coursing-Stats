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

export interface PointBreakdown {
  place_points: number;
  best_final_points: number;
  best_class_points: number;
  best_breed_points: number;
  track_record_points: number;
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
  total_points: number;
  stage_points: Record<number, number>;
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
    points?: number | null;
    points_breakdown?: PointBreakdown;
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

export function cleanDogNameFields(
  rawRu?: string | null,
  rawLat?: string | null,
  dogId?: number | null
): { name: string; name_ru: string; name_lat: string } {
  let ru = (rawRu || '').trim();
  let lat = (rawLat || '').trim();

  // Проверяем официальный профиль собаки по dog_id
  if (dogId) {
    const profilePath = path.join(ROOT, 'data/v1/dogs/by-id', `${dogId}.json`);
    if (fs.existsSync(profilePath)) {
      try {
        const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
        if (profile.name_ru && /[а-яё]/i.test(profile.name_ru)) {
          let pRu = profile.name_ru.trim();
          if (pRu.includes('/')) {
            const parts = pRu.split('/').map((s: string) => s.trim());
            pRu = parts.find((p: string) => /[а-яё]/i.test(p)) || pRu;
          }
          ru = pRu;
        }
        if (profile.name_lat && /[a-z]/i.test(profile.name_lat)) {
          let pLat = profile.name_lat.trim();
          if (pLat.includes('/')) {
            const parts = pLat.split('/').map((s: string) => s.trim());
            pLat = parts.find((p: string) => /[a-z]/i.test(p)) || pLat;
          }
          lat = pLat;
        }
      } catch {
        // ignore
      }
    }
  }

  // Обрабатываем слеши в строках
  for (const candidate of [ru, lat]) {
    if (candidate && candidate.includes('/')) {
      const parts = candidate.split('/').map((s) => s.trim()).filter(Boolean);
      const ruPart = parts.find((p) => /[а-яё]/i.test(p));
      const latPart = parts.find((p) => /[a-z]/i.test(p));
      if (ruPart) ru = ruPart;
      if (latPart) lat = latPart;
    }
  }

  // Приоритет русской клички: если есть кириллическая кличка, она всегда name и name_ru!
  const hasCyr = /[а-яё]/i.test(ru);
  const name = hasCyr ? ru : (ru || lat || 'Неизвестная собака');
  return {
    name,
    name_ru: ru || name,
    name_lat: lat || name,
  };
}


const BREED_SYNONYMS: Record<string, string> = {
  'ЛЕВРЕТКА': 'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ',
  'РПБ': 'РУССКАЯ ПСОВАЯ БОРЗАЯ',
  'АПБТ': 'БЕЗ ПОРОДЫ',
  'АСТ': 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
};

function normalizeNameForMatch(s?: string | null): string {
  return (s || '')
    .toUpperCase()
    .replace(/['’`"«»]/g, '')
    .replace(/Ё/g, 'Е')
    .replace(/[-–—/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeBreedForMatch(b?: string | null): string {
  const nb = normalizeNameForMatch(b);
  return BREED_SYNONYMS[nb] || nb;
}

function findStagePointEntry(
  dogName: string,
  breed: string,
  nameRu?: string,
  nameLat?: string,
  stageList?: any[]
): any {
  if (!stageList || !stageList.length) return null;
  const n = normalizeNameForMatch(dogName);
  const nRu = normalizeNameForMatch(nameRu);
  const nLat = normalizeNameForMatch(nameLat);
  const b = normalizeBreedForMatch(breed);

  const candidates = stageList.filter((item: any) => {
    const iname = normalizeNameForMatch(item.dog_name);
    return (
      iname === n || iname === nRu || iname === nLat ||
      iname.includes(n) || n.includes(iname) ||
      (nRu && (iname.includes(nRu) || nRu.includes(iname))) ||
      (nLat && (iname.includes(nLat) || nLat.includes(iname)))
    );
  });

  if (candidates.length === 1) return candidates[0];
  if (candidates.length > 1) {
    const bm = candidates.find((item: any) => {
      const ib = normalizeBreedForMatch(item.breed);
      return ib === b || ib.includes(b) || b.includes(ib);
    });
    if (bm) return bm;
  }

  if (n.includes('УРАЛ СПИРИТ САЛАМАНДР') || (nLat && nLat.includes('URAL SPIRIT SALAMANDER'))) {
    return stageList.find((item: any) =>
      normalizeNameForMatch(item.dog_name).includes('УРАЛ СПИРИТ САЛАМАНДР') ||
      normalizeNameForMatch(item.dog_name).includes('URAL SPIRIT')
    );
  }

  return null;
}

export function buildDoninoChampionshipData() {
  const pointsPath = path.join(ROOT, 'data/v1/donino/championship-points.json');
  let pointsData: { stage_1?: any[]; stage_2?: any[]; overall?: any[] } = {};
  if (fs.existsSync(pointsPath)) {
    try {
      pointsData = JSON.parse(fs.readFileSync(pointsPath, 'utf8'));
    } catch (e) {
      console.warn('Failed to parse championship-points.json:', e);
    }
  }

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

    const names = cleanDogNameFields(r.dog?.name_ru || r.name_ru, r.dog?.name_lat || r.name_lat, r.dog_id || r.dog?.id);
    const league = parseLeague(r.breed_class);

    return {
      id: r.id,
      catalog_no: r.catalog_no,
      dog_id: r.dog_id || r.dog?.id || null,
      dog_name: names.name,
      name_ru: names.name_ru,
      name_lat: names.name_lat,
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

    const names = cleanDogNameFields(r.dog?.name_ru || r.name_ru, r.dog?.name_lat || r.name_lat, r.dog_id || r.dog?.id);
    const league = parseLeague(r.breed_class);

    return {
      id: r.id,
      catalog_no: r.catalog_no,
      dog_id: r.dog_id || r.dog?.id || null,
      dog_name: names.name,
      name_ru: names.name_ru,
      name_lat: names.name_lat,
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

  function getDogKey(dog_id: number | null | undefined, name: string, breed: string): string {
    if (dog_id) return `dog::${dog_id}`;
    return `${breed.trim().toLowerCase()}::${name.trim().toLowerCase()}`;
  }

  // Process Stage 1
  for (const r of stage1Results) {
    const key = getDogKey(r.dog_id, r.dog_name, r.breed);
    const isWin = r.placement === 1;
    let current_league = r.league;
    if (isWin) {
      if (r.league === 'Чемпионов') current_league = 'Абсолют';
      else if (r.league === 'Прогресс') current_league = 'Чемпионов';
    }

    const pts1 = findStagePointEntry(r.dog_name, r.breed, r.name_ru, r.name_lat, pointsData.stage_1);
    const s1Points = pts1 ? pts1.total_points : 0;
    const s1Breakdown = pts1 ? {
      place_points: pts1.place_points || 0,
      best_final_points: pts1.best_final_points || 0,
      best_class_points: pts1.best_class_points || 0,
      best_breed_points: pts1.best_breed_points || 0,
      track_record_points: pts1.track_record_points || 0,
    } : undefined;

    dogsMap.set(key, {
      dog_key: key,
      dog_id: r.dog_id,
      name: r.dog_name,
      name_ru: r.name_ru,
      name_lat: r.name_lat,
      breed: r.breed,
      sex: r.sex,
      current_league,
      wins_count: isWin ? 1 : 0,
      consecutive_losses: isWin ? 0 : 1,
      best_time: r.total_score,
      stages_count: 1,
      total_points: s1Points,
      stage_points: s1Points ? { 1: s1Points } : {},
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
          points: s1Points,
          points_breakdown: s1Breakdown,
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
    const key = getDogKey(r.dog_id, r.dog_name, r.breed);
    const isWin = r.placement === 1;
    let standing = dogsMap.get(key);

    if (!standing) {
      // New dog joining at Stage 2
      let targetLeague = r.league;
      if (isWin) {
        if (r.league === 'Чемпионов') targetLeague = 'Абсолют';
        else if (r.league === 'Прогресс') targetLeague = 'Чемпионов';
        else if (r.league === 'Юниоры') targetLeague = 'Юниоры';
        else if (r.league === 'Абсолют') targetLeague = 'Абсолют';
      }

      const pts2 = findStagePointEntry(r.dog_name, r.breed, r.name_ru, r.name_lat, pointsData.stage_2);
      const s2Points = pts2 ? pts2.total_points : 0;
      const s2Breakdown = pts2 ? {
        place_points: pts2.place_points || 0,
        best_final_points: pts2.best_final_points || 0,
        best_class_points: pts2.best_class_points || 0,
        best_breed_points: pts2.best_breed_points || 0,
        track_record_points: pts2.track_record_points || 0,
      } : undefined;

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
        total_points: s2Points,
        stage_points: s2Points ? { 2: s2Points } : {},
        status_badge: isWin ? (r.league === 'Юниоры' ? 'stable' : 'promoted_up') : 'stable',
        promotion_label: isWin
          ? (r.league === 'Чемпионов'
              ? 'Выход в Абсолют (победа II этапа)'
              : r.league === 'Прогресс'
              ? 'Выход в Чемпионы (победа II этапа)'
              : r.league === 'Юниоры'
              ? 'Победитель Лиги Юниоров II этапа'
              : 'Победа в Лиге Абсолют')
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
            points: s2Points,
            points_breakdown: s2Breakdown,
          },
        ],
      };
      dogsMap.set(key, standing);
    } else {
      // Existing dog
      standing.stages_count += 1;
      if (!standing.name_ru && r.name_ru) standing.name_ru = r.name_ru;
      if (!standing.name_lat && r.name_lat) standing.name_lat = r.name_lat;
      if (r.name_ru && (!standing.name || /[a-z]/i.test(standing.name))) {
        standing.name = r.name_ru;
      }
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
        } else if (r.league === 'Юниоры') {
          standing.current_league = 'Юниоры';
          standing.status_badge = 'stable';
          standing.promotion_label = 'Победитель Лиги Юниоров';
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

      const pts2Existing = findStagePointEntry(r.dog_name, r.breed, r.name_ru, r.name_lat, pointsData.stage_2);
      const s2PointsEx = pts2Existing ? pts2Existing.total_points : 0;
      const s2BreakdownEx = pts2Existing ? {
        place_points: pts2Existing.place_points || 0,
        best_final_points: pts2Existing.best_final_points || 0,
        best_class_points: pts2Existing.best_class_points || 0,
        best_breed_points: pts2Existing.best_breed_points || 0,
        track_record_points: pts2Existing.track_record_points || 0,
      } : undefined;

      if (s2PointsEx) {
        standing.stage_points[2] = s2PointsEx;
      }
      standing.total_points = (standing.stage_points[1] || 0) + (standing.stage_points[2] || 0);

      standing.history.push({
        stage_num: 2,
        date: stage2.date_start,
        placement: r.placement,
        total_score: r.total_score,
        league: r.league,
        breed_class: r.breed_class,
        status: r.status,
        points: s2PointsEx,
        points_breakdown: s2BreakdownEx,
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
    spreadsheet_url: 'https://docs.google.com/spreadsheets/d/1OKA9-I7oiY3xOisuxiDUOpn6C6bGxSQMkZDcuwtXiJg/edit?gid=22361699#gid=22361699',
    results_spreadsheet_url: 'https://docs.google.com/spreadsheets/d/1OKA9-I7oiY3xOisuxiDUOpn6C6bGxSQMkZDcuwtXiJg/edit?gid=22361699#gid=22361699',
    points_spreadsheet_url: 'https://docs.google.com/spreadsheets/d/1PGrVO98HfxwzoOxHmd8eRaygvl3iJryIXYfPd7vmyNQ/edit?gid=0#gid=0',
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
