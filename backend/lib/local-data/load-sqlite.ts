import fs from 'node:fs';
import Database from 'better-sqlite3';
import { createD1Shim } from './d1-shim';
import { assertDataV1Exists, dataV1Path, listJsonFiles, SCHEMA_PATH } from './paths';
import { pickRow, toSqlValue } from './sql-value';
import type { LocalDataStats } from './stats';

const EVENT_COLUMNS = [
  'id',
  'year',
  'date_start',
  'date_end',
  'rank_label',
  'event_type',
  'competition_kind',
  'competition_type',
  'title',
  'host_club',
  'region',
  'location',
  'catalog_url',
  'results_url',
  'confirmed',
  'last_modified',
  'scraped_at',
  'telegram_url',
  'full_title',
  'event_date',
  'protocol_location',
  'judges',
  'track_schemes',
] as const;

const DOG_COLUMNS = [
  'id',
  'name_lat',
  'name_ru',
  'breed',
  'sex',
  'pedigree_no',
  'microchip',
  'owner',
  'pedigree_url',
  'merged_into_dog_id',
] as const;

const RESULT_COLUMNS = [
  'id',
  'event_id',
  'dog_id',
  'breed_class',
  'catalog_no',
  'placement',
  'total_score',
  'judge_count',
  'qualification',
  'vc',
  'status',
  'raw_scores_json',
  'raw_text',
  'judges',
  'status_reason',
] as const;

const SPEED_COLUMNS = [
  'id',
  'dog_id',
  'breed',
  'sex',
  'name',
  'speed_km_h',
  'date',
  'screenshot_url',
  'status',
  'history',
  'updated_at',
] as const;

const COURSING_COLUMNS = [
  'id',
  'dog_id',
  'breed',
  'name',
  'time_seconds',
  'date',
  'track_length',
  'history',
  'updated_at',
] as const;

function insertRow(db: Database.Database, table: string, row: Record<string, unknown>) {
  const keys = Object.keys(row);
  const cols = keys.join(', ');
  const placeholders = keys.map(() => '?').join(', ');
  const values = keys.map((k) => toSqlValue(row[k]));
  db.prepare(`INSERT OR REPLACE INTO ${table} (${cols}) VALUES (${placeholders})`).run(...values);
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

function loadSchema(db: Database.Database) {
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);
}

function loadCalendarEvents(db: Database.Database) {
  const calendarDir = dataV1Path('calendar');
  for (const file of listJsonFiles(calendarDir)) {
    const data = readJson<{ events?: Record<string, unknown>[] }>(file);
    for (const entry of data.events ?? []) {
      insertRow(db, 'events', pickRow(entry, [...EVENT_COLUMNS]));
    }
  }
}

function loadDogs(db: Database.Database) {
  const dogsDir = dataV1Path('dogs/by-id');
  for (const file of listJsonFiles(dogsDir)) {
    const data = readJson<Record<string, unknown>>(file);
    insertRow(db, 'dogs', pickRow(data, [...DOG_COLUMNS]));
  }
}

function loadCompetitions(db: Database.Database) {
  const compDir = dataV1Path('competitions');
  for (const file of listJsonFiles(compDir)) {
    const data = readJson<{
      event?: Record<string, unknown>;
      results?: Record<string, unknown>[];
      event_id?: number;
    }>(file);

    const eventId = data.event_id ?? data.event?.id;

    if (data.event) {
      insertRow(db, 'events', pickRow(data.event, [...EVENT_COLUMNS]));
    }

    for (const result of data.results ?? []) {
      const dog = result.dog as Record<string, unknown> | null | undefined;
      if (dog?.id != null) {
        insertRow(db, 'dogs', pickRow(dog, [...DOG_COLUMNS]));
      }

      const row = pickRow(result, [...RESULT_COLUMNS]);
      if (eventId != null) row.event_id = eventId;
      if (row.dog_id == null && dog?.id != null) row.dog_id = dog.id;
      if (row.event_id == null || row.dog_id == null) continue;
      insertRow(db, 'results', row);
    }
  }
}

function loadDonino(db: Database.Database) {
  const speedPath = dataV1Path('donino/speed_records.json');
  if (fs.existsSync(speedPath)) {
    const data = readJson<{ records?: Record<string, unknown>[] }>(speedPath);
    for (const row of data.records ?? []) {
      insertRow(db, 'speed_records', pickRow(row, [...SPEED_COLUMNS]));
    }
  }

  const coursingPath = dataV1Path('donino/coursing_records.json');
  if (fs.existsSync(coursingPath)) {
    const data = readJson<{ records?: Record<string, unknown>[] }>(coursingPath);
    for (const row of data.records ?? []) {
      insertRow(db, 'coursing_records', pickRow(row, [...COURSING_COLUMNS]));
    }
  }
}

function countTable(db: Database.Database, table: string): number {
  const row = db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get() as { c: number };
  return row.c;
}

export function loadLocalDataSqlite(): { db: Database.Database; stats: LocalDataStats } {
  assertDataV1Exists();

  const db = new Database(':memory:');
  db.pragma('journal_mode = MEMORY');
  db.pragma('foreign_keys = OFF');

  loadSchema(db);
  loadDogs(db);
  loadCalendarEvents(db);
  loadCompetitions(db);
  loadDonino(db);

  const stats: LocalDataStats = {
    events: countTable(db, 'events'),
    dogs: countTable(db, 'dogs'),
    results: countTable(db, 'results'),
    speed_records: countTable(db, 'speed_records'),
    coursing_records: countTable(db, 'coursing_records'),
  };

  return { db, stats };
}

let cached: ReturnType<typeof createD1Shim> | null = null;
let cachedStats: LocalDataStats | null = null;

export function createLocalDataDb() {
  if (cached) return cached;

  const { db, stats } = loadLocalDataSqlite();
  cached = createD1Shim(db);
  cachedStats = stats;
  return cached;
}

export function getLocalDataStats(): LocalDataStats | null {
  return cachedStats;
}

export function resetLocalDataCache() {
  cached = null;
  cachedStats = null;
}
