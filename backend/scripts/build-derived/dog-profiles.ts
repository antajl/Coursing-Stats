import fs from 'node:fs';
import path from 'node:path';
import type Database from 'better-sqlite3';
import { dataV1Path, listJsonFiles } from '../../lib/local-data/paths';
import { aggregateQualificationTitles } from '../../src/lib/qualification-titles';
import { parseJudgeNames } from '../../src/lib/judge-names';
import { judgeDetailKey } from '../../src/lib/static-api';
import { PARTICIPATION_STATUSES_SQL, RACING_EXCLUDED_STATUSES_SQL } from '../../src/lib/racing-status';
import { cdnPackShardKey, type DogProfilePackFile } from '../../lib/cdn-packs';
import { INDEXES_DIR } from './shared';

type CoursingRow = { dog_id: number; event_id: number; total_score: number | null; placement: number | null; raw_scores_json: string | null };
type RacingMedalRow = { dog_id: number; placement: number | null };
type RacingSpeedRow = { dog_id: number; event_id: number; raw_scores_json: string | null };
type QualificationRow = { dog_id: number; qualification: string | null };
type CompetitionHistoryRow = {
  event_id: number;
  date_start: string | null;
  date_end: string | null;
  title: string | null;
  event_type: string | null;
  competition_kind: string | null;
  results_url: string | null;
  location: string | null;
  event_judges: string | null;
  dog_id: number;
  placement: number | null;
  total_score: number | null;
  qualification: string | null;
  status: string | null;
  raw_scores_json: string | null;
};

function extractJudgeSums(rawScoresJson: string | null): number[] {
  if (!rawScoresJson) return [];
  try {
    const parsed = JSON.parse(rawScoresJson);
    const sums: number[] = [];
    for (const heat of parsed.heats ?? []) {
      for (const judge of heat.judges ?? []) {
        if (typeof judge.sum === 'number' && !Number.isNaN(judge.sum)) sums.push(judge.sum);
      }
    }
    return sums;
  } catch {
    return [];
  }
}

function extractHeatSpeeds(rawScoresJson: string | null): number[] {
  if (!rawScoresJson) return [];
  try {
    const parsed = JSON.parse(rawScoresJson);
    const speeds: number[] = [];
    for (const heat of parsed.heats ?? []) {
      const speed = parseFloat(heat.speed_kmh);
      if (!Number.isNaN(speed) && speed > 0 && speed <= 80) speeds.push(speed);
    }
    return speeds;
  } catch {
    return [];
  }
}

function extractRacingEventData(rawScoresJson: string | null): { best_speed: string | null; distance: number | null } {
  if (!rawScoresJson) return { best_speed: null, distance: null };
  try {
    const parsed = JSON.parse(rawScoresJson);
    const speeds: number[] = [];
    for (const heat of parsed.heats ?? []) {
      const speed = parseFloat(heat.speed_kmh);
      if (!Number.isNaN(speed) && speed > 0 && speed <= 80) speeds.push(speed);
    }
    const bestSpeed = speeds.length > 0 ? Math.max(...speeds).toFixed(2) : null;
    
    // Distance can be calculated from time and speed: distance = speed (m/s) * time (s)
    // speed_kmh to m/s: divide by 3.6
    let distance: number | null = null;
    for (const heat of parsed.heats ?? []) {
      const time = parseFloat(heat.time);
      const speedKmh = parseFloat(heat.speed_kmh);
      if (!Number.isNaN(time) && !Number.isNaN(speedKmh) && time > 0) {
        const speedMs = speedKmh / 3.6;
        const calculatedDistance = Math.round(speedMs * time);
        if (distance === null || calculatedDistance > distance) {
          distance = calculatedDistance;
        }
      }
    }
    
    return { best_speed: bestSpeed, distance };
  } catch {
    return { best_speed: null, distance: null };
  }
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function slugifyDog(text: string, maxLen = 48): string {
  const base = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLen);
  return base || 'item';
}

function buildCoursingStats(rows: CoursingRow[]) {
  let total_starts = 0;
  let best_score: number | null = null;
  let best_score_event_id: number | null = null;
  let gold = 0;
  let silver = 0;
  let bronze = 0;
  let best_judge_score: number | null = null;
  let best_judge_score_event_id: number | null = null;
  const allJudgeSums: number[] = [];
  const rowAvgJudges: { event_id: number; avg: number }[] = [];

  for (const row of rows) {
    total_starts += 1;
    if (row.placement === 1) gold += 1;
    else if (row.placement === 2) silver += 1;
    else if (row.placement === 3) bronze += 1;

    if (row.total_score !== null && (best_score === null || row.total_score > best_score)) {
      best_score = row.total_score;
      best_score_event_id = row.event_id;
    }

    const judgeSums = extractJudgeSums(row.raw_scores_json);
    if (judgeSums.length > 0) {
      allJudgeSums.push(...judgeSums);
      const rowBest = Math.max(...judgeSums);
      if (best_judge_score === null || rowBest > best_judge_score) {
        best_judge_score = rowBest;
        best_judge_score_event_id = row.event_id;
      }
      rowAvgJudges.push({ event_id: row.event_id, avg: Math.round(mean(judgeSums) * 100) / 100 });
    }
  }

  // avg_judge_score — честное среднее по всем оценкам судей (в отличие от
  // v_top_by_score в schema.sql, где из-за особенности SQLite это значение
  // одной произвольной строки, а не настоящее среднее).
  const avg_judge_score = allJudgeSums.length > 0 ? Math.round(mean(allJudgeSums) * 100) / 100 : null;
  let avg_judge_score_event_id: number | null = null;
  if (avg_judge_score !== null && rowAvgJudges.length > 0) {
    let closest = rowAvgJudges[0];
    for (const candidate of rowAvgJudges) {
      if (Math.abs(candidate.avg - avg_judge_score) < Math.abs(closest.avg - avg_judge_score)) closest = candidate;
    }
    avg_judge_score_event_id = closest.event_id;
  }

  return {
    total_starts,
    best_score,
    best_judge_score,
    avg_judge_score,
    gold,
    silver,
    bronze,
    best_score_event_id,
    best_judge_score_event_id,
    avg_judge_score_event_id,
  };
}

function buildRacingStats(medalRows: RacingMedalRow[], speedRows: RacingSpeedRow[]) {
  let gold = 0;
  let silver = 0;
  let bronze = 0;
  for (const row of medalRows) {
    if (row.placement === 1) gold += 1;
    else if (row.placement === 2) silver += 1;
    else if (row.placement === 3) bronze += 1;
  }

  const allSpeeds: number[] = [];
  let bestRowMax: number | null = null;
  let best_speed_event_id: number | null = null;
  let bestRowAvg: number | null = null;
  let avg_speed_event_id: number | null = null;

  for (const row of speedRows) {
    const speeds = extractHeatSpeeds(row.raw_scores_json);
    if (speeds.length === 0) continue;
    allSpeeds.push(...speeds);

    const rowMax = Math.max(...speeds);
    if (bestRowMax === null || rowMax > bestRowMax) {
      bestRowMax = rowMax;
      best_speed_event_id = row.event_id;
    }

    const rowAvg = Math.round(mean(speeds) * 100) / 100;
    if (bestRowAvg === null || rowAvg > bestRowAvg) {
      bestRowAvg = rowAvg;
      avg_speed_event_id = row.event_id;
    }
  }

  return {
    total_starts: medalRows.length,
    gold,
    silver,
    bronze,
    best_speed: allSpeeds.length > 0 ? Math.max(...allSpeeds).toFixed(2) : null,
    avg_speed: allSpeeds.length > 0 ? mean(allSpeeds).toFixed(2) : null,
    best_speed_event_id,
    avg_speed_event_id,
  };
}

function extractSingleJudgeHeatScore(j: { scores?: (number | null)[]; sum?: number | null }): number | null {
  if (Array.isArray(j.scores) && j.scores.length > 0) {
    const valid = j.scores.filter((s): s is number => typeof s === 'number' && !Number.isNaN(s) && s > 0);
    if (valid.length > 0) {
      return valid.reduce((a, b) => a + b, 0);
    }
  }
  if (typeof j.sum === 'number' && !Number.isNaN(j.sum) && j.sum > 0) {
    return j.sum > 100 ? Math.round((j.sum / 2) * 100) / 100 : j.sum;
  }
  return null;
}

export type DogJudgeEvent = {
  event_id: number;
  title: string;
  date: string;
  avg_score: number;
  scores: number[];
  role?: string;
};

export type DogJudgeItem = {
  judge_name: string;
  judge_key: string;
  starts_count: number;
  starts_percent: number;
  evaluations_count: number;
  avg_score: number;
  min_score: number;
  max_score: number;
  delta_vs_dog_avg: number;
  events: DogJudgeEvent[];
};

export type DogJudgesStats = {
  total_starts: number;
  total_judges: number;
  global_avg_score: number;
  highest_concentration: {
    judge_name: string;
    starts_count: number;
    starts_percent: number;
  } | null;
  judges: DogJudgeItem[];
};

function buildDogJudgesStats(rows: CompetitionHistoryRow[]): DogJudgesStats | null {
  const allHeatScores: number[] = [];

  type JudgeEntry = {
    judge_name: string;
    events: Map<number, { event_id: number; title: string; date: string; scores: number[]; role: string }>;
    all_scores: number[];
  };

  const judgeMap = new Map<string, JudgeEntry>();
  let coursingEventsCount = 0;

  for (const row of rows) {
    if (!row.raw_scores_json || !row.event_judges) continue;
    if (row.event_type !== 'coursing' && row.event_type !== 'bzmp') continue;

    let raw: any;
    try {
      raw = JSON.parse(row.raw_scores_json);
    } catch {
      continue;
    }

    const judgeNames = parseJudgeNames(row.event_judges);
    if (judgeNames.length === 0 || !Array.isArray(raw.heats) || raw.heats.length === 0) continue;

    coursingEventsCount += 1;

    for (const heat of raw.heats) {
      if (!Array.isArray(heat.judges)) continue;
      for (const j of heat.judges) {
        const score = extractSingleJudgeHeatScore(j);
        if (score === null) continue;

        const judgeNum = j.judge_number;
        const judgeRole = judgeNum === 1 ? 'Главный судья' : 'Судья';
        const judgeName = j.judge_name || judgeNames[judgeNum - 1] || (judgeNames.length === 1 ? judgeNames[0] : `Судья ${judgeNum}`);

        allHeatScores.push(score);

        let entry = judgeMap.get(judgeName);
        if (!entry) {
          entry = {
            judge_name: judgeName,
            events: new Map(),
            all_scores: [],
          };
          judgeMap.set(judgeName, entry);
        }
        entry.all_scores.push(score);

        let ev = entry.events.get(row.event_id);
        if (!ev) {
          ev = {
            event_id: row.event_id,
            title: row.title || 'Соревнование',
            date: row.date_start || '',
            role: judgeRole,
            scores: [],
          };
          entry.events.set(row.event_id, ev);
        }
        ev.scores.push(score);
      }
    }
  }

  if (allHeatScores.length === 0) {
    return null;
  }

  const globalAvg = Math.round((allHeatScores.reduce((a, b) => a + b, 0) / allHeatScores.length) * 100) / 100;

  const judges: DogJudgeItem[] = Array.from(judgeMap.values()).map((entry) => {
    const judgeAvg = Math.round((entry.all_scores.reduce((a, b) => a + b, 0) / entry.all_scores.length) * 100) / 100;
    const startsCount = entry.events.size;
    const startsPercent = coursingEventsCount > 0 ? Math.round((startsCount / coursingEventsCount) * 100) : 0;
    const delta = Math.round((judgeAvg - globalAvg) * 100) / 100;

    return {
      judge_name: entry.judge_name,
      judge_key: judgeDetailKey(entry.judge_name),
      starts_count: startsCount,
      starts_percent: startsPercent,
      evaluations_count: entry.all_scores.length,
      avg_score: judgeAvg,
      min_score: Math.min(...entry.all_scores),
      max_score: Math.max(...entry.all_scores),
      delta_vs_dog_avg: delta,
      events: Array.from(entry.events.values()).map((ev) => ({
        event_id: ev.event_id,
        title: ev.title,
        date: ev.date,
        role: ev.role,
        avg_score: Math.round((ev.scores.reduce((a, b) => a + b, 0) / ev.scores.length) * 100) / 100,
        scores: ev.scores,
      })),
    };
  });

  judges.sort((a, b) => b.starts_count - a.starts_count || b.evaluations_count - a.evaluations_count);

  const topConcentration = judges.length > 0 && coursingEventsCount >= 3 && judges[0].starts_percent >= 33
    ? {
        judge_name: judges[0].judge_name,
        starts_count: judges[0].starts_count,
        starts_percent: judges[0].starts_percent,
      }
    : null;

  return {
    total_starts: coursingEventsCount,
    total_judges: judges.length,
    global_avg_score: globalAvg,
    highest_concentration: topConcentration,
    judges,
  };
}

type DogProfileMeta = {
  id: number;
  name_lat: string | null;
  name_ru: string | null;
  breed: string | null;
  sex: string | null;
  owner: string | null;
  pedigree_url: string | null;
};

/** Canonical dog fields from data/v1/dogs/by-id (survives sqlite UNIQUE(name_lat, breed) dedup). */
function loadDogMetadataFromById(): Map<number, DogProfileMeta> {
  const map = new Map<number, DogProfileMeta>();
  for (const file of listJsonFiles(dataV1Path('dogs/by-id'))) {
    const data = JSON.parse(fs.readFileSync(file, 'utf-8')) as Record<string, unknown>;
    const id = data.id;
    if (typeof id !== 'number') continue;
    map.set(id, {
      id,
      name_lat: (data.name_lat as string | null | undefined) ?? null,
      name_ru: (data.name_ru as string | null | undefined) ?? null,
      breed: (data.breed as string | null | undefined) ?? null,
      sex: (data.sex as string | null | undefined) ?? null,
      owner: (data.owner as string | null | undefined) ?? null,
      pedigree_url: (data.pedigree_url as string | null | undefined) ?? null,
    });
  }
  return map;
}

export function buildDogProfiles(db: Database.Database) {
  const dogs = db.prepare('SELECT id, name_lat, name_ru, breed, sex, owner, pedigree_url FROM dogs ORDER BY id').all() as DogProfileMeta[];
  const dogsById = new Map(dogs.map((dog) => [dog.id, dog]));
  const metadataById = loadDogMetadataFromById();

  const coursingRows = db
    .prepare(
      `SELECT r.dog_id, r.event_id, r.total_score, r.placement, r.raw_scores_json
       FROM results r JOIN events e ON r.event_id = e.id
       WHERE r.status IN ${PARTICIPATION_STATUSES_SQL} AND e.event_type IN ('coursing', 'bzmp')`,
    )
    .all() as CoursingRow[];

  const racingMedalRows = db
    .prepare(
      `SELECT r.dog_id, r.placement
       FROM results r JOIN events e ON r.event_id = e.id
       WHERE r.status NOT IN ${RACING_EXCLUDED_STATUSES_SQL} AND e.event_type = 'racing'`,
    )
    .all() as RacingMedalRow[];

  const racingSpeedRows = db
    .prepare(
      `SELECT r.dog_id, r.event_id, r.raw_scores_json
       FROM results r JOIN events e ON r.event_id = e.id
       WHERE r.status NOT IN ${RACING_EXCLUDED_STATUSES_SQL} AND e.event_type = 'racing'
         AND r.raw_scores_json IS NOT NULL`,
    )
    .all() as RacingSpeedRow[];

  const qualificationRows = db
    .prepare(
      `SELECT dog_id, qualification FROM results
       WHERE status = 'finished' AND qualification IS NOT NULL AND TRIM(qualification) != ''`,
    )
    .all() as QualificationRow[];

  const competitionRows = db
    .prepare(
      `SELECT
        e.id AS event_id, e.date_start, e.date_end, e.title, e.event_type, e.competition_kind,
        e.results_url, e.location, e.judges AS event_judges, r.dog_id, r.placement, r.total_score, r.qualification, r.status, r.raw_scores_json
       FROM events e
       JOIN results r ON e.id = r.event_id
       WHERE r.status NOT IN ${RACING_EXCLUDED_STATUSES_SQL}
       ORDER BY e.date_start DESC`,
    )
    .all() as CompetitionHistoryRow[];

  const byDog = <T extends { dog_id: number }>(rows: T[]) => {
    const map = new Map<number, T[]>();
    for (const row of rows) {
      const arr = map.get(row.dog_id) ?? [];
      arr.push(row);
      map.set(row.dog_id, arr);
    }
    return map;
  };

  const coursingByDog = byDog(coursingRows);
  const racingMedalsByDog = byDog(racingMedalRows);
  const racingSpeedByDog = byDog(racingSpeedRows);
  const qualificationsByDog = byDog(qualificationRows);
  const competitionsByDog = byDog(competitionRows);

  const outDir = path.join(INDEXES_DIR, 'dog-profiles');
  fs.mkdirSync(outDir, { recursive: true });

  const allDogIds = new Set<number>([
    ...metadataById.keys(),
    ...dogsById.keys(),
    ...coursingByDog.keys(),
    ...racingMedalsByDog.keys(),
    ...competitionsByDog.keys(),
  ]);
  const sortedDogIds = [...allDogIds].sort((a, b) => a - b);

  const packs = new Map<string, Record<string, unknown>>();

  const dogsIndexPath = path.join(INDEXES_DIR, 'dogs-index.json');
  const dogsIndexMap = new Map<number, {
    id: number;
    dog_key: string;
    name_lat: string;
    name_ru: string;
    breed: string;
    file_by_id: string;
    file_by_key: string;
    competition_count: number;
  }>();

  if (fs.existsSync(dogsIndexPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(dogsIndexPath, 'utf-8'));
      if (Array.isArray(existing)) {
        for (const item of existing) {
          if (item && typeof item.id === 'number') {
            dogsIndexMap.set(item.id, item);
          }
        }
      }
    } catch {}
  }

  for (const dogId of sortedDogIds) {
    const fromFile = metadataById.get(dogId);
    const fromDb = dogsById.get(dogId);
    const dog: DogProfileMeta = {
      id: dogId,
      name_lat: fromFile?.name_lat ?? fromDb?.name_lat ?? null,
      name_ru: fromFile?.name_ru ?? fromDb?.name_ru ?? null,
      breed: fromFile?.breed ?? fromDb?.breed ?? null,
      sex: fromFile?.sex ?? fromDb?.sex ?? null,
      owner: fromFile?.owner ?? fromDb?.owner ?? null,
      pedigree_url: fromFile && 'pedigree_url' in fromFile ? fromFile.pedigree_url : (fromDb?.pedigree_url ?? null),
    };

    const dogCompetitions = competitionsByDog.get(dogId) ?? [];
    const coursing_stats = buildCoursingStats(coursingByDog.get(dogId) ?? []);
    const racing_stats = buildRacingStats(racingMedalsByDog.get(dogId) ?? [], racingSpeedByDog.get(dogId) ?? []);
    const judge_stats = buildDogJudgesStats(dogCompetitions);
    const titles = aggregateQualificationTitles(qualificationsByDog.get(dogId) ?? []);

    const competitions = dogCompetitions.map((row) => {
      const base = {
        event_id: row.event_id,
        date_start: row.date_start,
        date_end: row.date_end,
        title: row.title,
        event_type: row.event_type,
        competition_kind: row.competition_kind,
        results_url: row.results_url,
        location: row.location,
        placement: row.placement,
        total_score: row.total_score,
        qualification: row.qualification?.trim() ? row.qualification.trim() : null,
        status: row.status,
      };
      
      // Add racing-specific data for racing events
      if (row.event_type === 'racing' && row.raw_scores_json) {
        const racingData = extractRacingEventData(row.raw_scores_json);
        return {
          ...base,
          best_speed: racingData.best_speed,
          distance: racingData.distance,
        };
      }
      
      return base;
    });

    const payload = {
      schema: 'coursing-stats/index-dog-profile-v1',
      dog: {
        id: dog.id,
        name_lat: dog.name_lat,
        name_ru: dog.name_ru,
        breed: dog.breed,
        sex: dog.sex,
        owner: dog.owner,
        pedigree_url: dog.pedigree_url,
        coursing_stats,
        racing_stats,
        judge_stats,
        titles,
      },
      judge_stats,
      competitions,
    };

    const shard = cdnPackShardKey(dogId);
    const bucket = packs.get(shard) ?? {};
    bucket[String(dogId)] = payload;
    packs.set(shard, bucket);

    const keyName = slugifyDog(dog.name_ru || dog.name_lat || 'dog', 40);
    const keyBreed = slugifyDog(dog.breed || 'unknown', 24);
    const generatedKey = `${keyName}--${keyBreed}`;

    const existingDogIndex = dogsIndexMap.get(dogId) as any;
    const sex = (dog as any).sex || existingDogIndex?.sex || null;
    if (existingDogIndex) {
      existingDogIndex.name_ru = dog.name_ru || existingDogIndex.name_ru || '';
      existingDogIndex.name_lat = dog.name_lat || existingDogIndex.name_lat || '';
      existingDogIndex.breed = dog.breed || existingDogIndex.breed || '';
      existingDogIndex.competition_count = Math.max(existingDogIndex.competition_count || 0, competitions.length);
      if (sex) existingDogIndex.sex = sex;
      if (!existingDogIndex.dog_key) existingDogIndex.dog_key = generatedKey;
      if (!existingDogIndex.file_by_id) existingDogIndex.file_by_id = `dogs/by-id/${dogId}.json`;
      if (!existingDogIndex.file_by_key) existingDogIndex.file_by_key = `dogs/by-key/${existingDogIndex.dog_key}.json`;
    } else {
      dogsIndexMap.set(dogId, {
        id: dogId,
        dog_key: generatedKey,
        name_lat: dog.name_lat || '',
        name_ru: dog.name_ru || '',
        breed: dog.breed || '',
        file_by_id: `dogs/by-id/${dogId}.json`,
        file_by_key: `dogs/by-key/${generatedKey}.json`,
        competition_count: competitions.length,
        sex,
      });
    }
  }

  // Remove legacy per-id files and stale packs, then write fresh packs.
  for (const entry of fs.readdirSync(outDir)) {
    if (!entry.endsWith('.json')) continue;
    fs.unlinkSync(path.join(outDir, entry));
  }

  let packBytes = 0;
  for (const [shard, byId] of [...packs.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const body = JSON.stringify({
      schema: 'coursing-stats/dog-profile-pack-v1',
      shard,
      byId,
    } satisfies DogProfilePackFile);
    packBytes += Buffer.byteLength(body);
    const outPath = path.join(outDir, `pack-${shard}.json`);
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        fs.writeFileSync(outPath, body, 'utf-8');
        break;
      } catch (err) {
        const code = (err as NodeJS.ErrnoException).code;
        if ((code === 'UNKNOWN' || code === 'EBUSY' || code === 'EPERM') && attempt < 4) {
          Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50 * (attempt + 1));
          continue;
        }
        throw err;
      }
    }
  }

  console.log(
    `  → dog-profiles/pack-*.json (${packs.size} packs, ${sortedDogIds.length} dogs, ${(packBytes / (1024 * 1024)).toFixed(1)} MB)`,
  );

  const dogsIndexList = Array.from(dogsIndexMap.values()).sort((a, b) => a.id - b.id);
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      fs.writeFileSync(dogsIndexPath, JSON.stringify(dogsIndexList, null, 2), 'utf-8');
      break;
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if ((code === 'UNKNOWN' || code === 'EBUSY' || code === 'EPERM') && attempt < 4) {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50 * (attempt + 1));
        continue;
      }
      throw err;
    }
  }
  console.log(`  → dogs-index.json (${dogsIndexList.length} dogs)`);
}
