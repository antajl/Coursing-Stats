import fs from 'node:fs';
import path from 'node:path';
import type Database from 'better-sqlite3';
import { dataV1Path, listJsonFiles } from '../../lib/local-data/paths';
import { aggregateQualificationTitles } from '../../src/lib/qualification-titles';
import { RACING_EXCLUDED_STATUSES_SQL } from '../../src/lib/racing-status';
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
  dog_id: number;
  placement: number | null;
  total_score: number | null;
  qualification: string | null;
  status: string | null;
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
      if (!Number.isNaN(speed)) speeds.push(speed);
    }
    return speeds;
  } catch {
    return [];
  }
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
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
       WHERE r.status = 'finished' AND e.event_type IN ('coursing', 'bzmp')`,
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
        e.results_url, e.location, r.dog_id, r.placement, r.total_score, r.qualification, r.status
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
      pedigree_url: fromFile?.pedigree_url ?? fromDb?.pedigree_url ?? null,
    };

    const coursing_stats = buildCoursingStats(coursingByDog.get(dogId) ?? []);
    const racing_stats = buildRacingStats(racingMedalsByDog.get(dogId) ?? [], racingSpeedByDog.get(dogId) ?? []);
    const titles = aggregateQualificationTitles(qualificationsByDog.get(dogId) ?? []);

    const competitions = (competitionsByDog.get(dogId) ?? []).map((row) => ({
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
    }));

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
        titles,
      },
      competitions,
    };

    fs.writeFileSync(path.join(outDir, `${dogId}.json`), JSON.stringify(payload), 'utf-8');
  }

  const keepIds = new Set(sortedDogIds.map(String));
  for (const entry of fs.readdirSync(outDir)) {
    if (!entry.endsWith('.json')) continue;
    const id = entry.slice(0, -'.json'.length);
    if (!keepIds.has(id)) fs.unlinkSync(path.join(outDir, entry));
  }

  console.log(`  → dog-profiles/ (${sortedDogIds.length} files)`);
}
