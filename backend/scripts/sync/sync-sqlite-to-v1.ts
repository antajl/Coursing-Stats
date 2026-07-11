/**
 * Export sqlite (better-sqlite3) → data/v1/ JSON after admin mutations.
 * Keeps git-tracked JSON in sync with in-memory dev database.
 *
 * Usage: npx tsx backend/scripts/sync/sync-sqlite-to-v1.ts
 *        (or called from local-dev-server after admin persist)
 */
import fs from 'node:fs';
import path from 'node:path';
import type Database from 'better-sqlite3';
import {
  type Row,
  enrichEvent,
  enrichResult,
  dogKey,
  competitionRelPath,
  writeJson,
  groupBy,
} from '../export/d1-export-utils';
import { DATA_V1_ROOT } from '../../lib/local-data/paths';

const V1 = DATA_V1_ROOT;

function queryAll(db: Database.Database, sql: string): Row[] {
  return db.prepare(sql).all() as Row[];
}

export function syncSqliteToV1(db: Database.Database): { competitions: number; dogs: number } {
  const exportedAt = new Date().toISOString();

  const events = queryAll(db, 'SELECT * FROM events ORDER BY date_start');
  const dogs = queryAll(db, 'SELECT * FROM dogs ORDER BY name_lat');
  const results = queryAll(db, 'SELECT * FROM results ORDER BY event_id, placement');

  const dogsById = new Map<number, Row>();
  for (const d of dogs) dogsById.set(Number(d.id), d);

  const resultsByEvent = groupBy(results, 'event_id');
  const eventIdsWithResults = new Set<number>();
  for (const r of results) eventIdsWithResults.add(Number(r.event_id));

  const competitionFiles = new Map<number, string>();
  let competitionCount = 0;

  for (const rawEvent of events) {
    const eventId = Number(rawEvent.id);
    if (!eventIdsWithResults.has(eventId)) continue;

    const event = enrichEvent(rawEvent);
    const rel = competitionRelPath(event, eventId);
    competitionFiles.set(eventId, rel);

    const eventResults = (resultsByEvent.get(String(eventId)) ?? []).map((r) => {
      const dog = dogsById.get(Number(r.dog_id));
      const dk = dog ? dogKey(String(dog.name_lat ?? ''), String(dog.breed ?? '')) : null;
      return {
        ...enrichResult(r),
        dog_key: dk,
        dog: dog
          ? {
              id: dog.id,
              dog_key: dk,
              name_lat: dog.name_lat,
              name_ru: dog.name_ru,
              breed: dog.breed,
              sex: dog.sex,
              owner: dog.owner,
            }
          : null,
      };
    });

    writeJson(path.join(V1, rel), {
      schema: 'coursing-stats/competition-v1',
      exported_at: exportedAt,
      source: 'sqlite-admin-sync',
      event_id: eventId,
      event,
      result_count: eventResults.length,
      results: eventResults,
    });
    competitionCount += 1;
  }

  const dogCompetitionIds = new Map<number, Set<number>>();
  for (const r of results) {
    const did = Number(r.dog_id);
    const eid = Number(r.event_id);
    if (!dogCompetitionIds.has(did)) dogCompetitionIds.set(did, new Set());
    dogCompetitionIds.get(did)!.add(eid);
  }

  for (const d of dogs) {
    const id = Number(d.id);
    const dk = dogKey(String(d.name_lat ?? ''), String(d.breed ?? ''));
    const compIds = [...(dogCompetitionIds.get(id) ?? [])].sort((a, b) => a - b);
    const payload = {
      schema: 'coursing-stats/dog-v1',
      exported_at: exportedAt,
      id,
      dog_key: dk,
      name_lat: d.name_lat,
      name_ru: d.name_ru,
      breed: d.breed,
      sex: d.sex,
      owner: d.owner,
      pedigree_url: d.pedigree_url ?? null,
      competition_ids: compIds,
      competition_files: compIds.map((eid) => competitionFiles.get(eid)).filter(Boolean),
    };
    writeJson(path.join(V1, `dogs/by-id/${id}.json`), payload);
    writeJson(path.join(V1, `dogs/by-key/${dk}.json`), payload);
  }

  const count = (table: string) =>
    (db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get() as { c: number }).c;

  const manifestPath = path.join(V1, 'manifest.json');
  let manifest: Record<string, unknown> = {};
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  }

  const updatedManifest = {
    ...manifest,
    schema: 'coursing-stats/local-data-manifest-v1',
    exported_at: exportedAt,
    source: 'sqlite-admin-sync',
    counts: {
      events: count('events'),
      events_with_results: competitionCount,
      dogs: count('dogs'),
      results: count('results'),
      donino_speed: count('speed_records'),
      donino_coursing: count('coursing_records'),
      breeds: (manifest.counts as Record<string, number> | undefined)?.breeds ?? 86,
    },
  };
  writeJson(manifestPath, updatedManifest);

  return { competitions: competitionCount, dogs: dogs.length };
}
