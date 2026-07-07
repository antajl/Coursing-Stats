import Database from 'better-sqlite3';
import { createD1Shim } from './d1-shim';
import { loadLocalDataSqlite } from './load-sqlite';
import type { LocalDataStats } from './stats';
import { loadBetterSqliteFromSnapshot, saveBetterSqliteSnapshot, SNAPSHOT_PATH } from './snapshot';
import { isSnapshotStale } from './snapshot-freshness';
import { assertDataV1Exists } from './paths';
import type { DataDb } from './types';

export type NodeDataStore = {
  db: DataDb;
  stats: LocalDataStats;
  nodeDb: Database.Database;
};

let nodeStore: NodeDataStore | null = null;

export function createNodeDataStore(): NodeDataStore {
  if (nodeStore) return nodeStore;

  assertDataV1Exists();

  const forceRebuild = process.env.FORCE_REBUILD_DATA === '1';
  const snapshot = !forceRebuild && !isSnapshotStale() ? loadBetterSqliteFromSnapshot() : null;
  if (snapshot) {
    const db = new Database(snapshot);
    const stats = readStats(db);
    nodeStore = { db: createD1Shim(db), stats, nodeDb: db };
    return nodeStore;
  }

  const { db, stats } = loadLocalDataSqlite();
  saveBetterSqliteSnapshot(db);
  nodeStore = { db: createD1Shim(db), stats, nodeDb: db };
  return nodeStore;
}

function readStats(db: Database.Database): LocalDataStats {
  const count = (table: string) =>
    (db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get() as { c: number }).c;
  return {
    events: count('events'),
    dogs: count('dogs'),
    results: count('results'),
    speed_records: count('speed_records'),
    coursing_records: count('coursing_records'),
  };
}

export function resetNodeDataStore() {
  nodeStore?.nodeDb?.close();
  nodeStore = null;
}

export function persistNodeDataStore(): void {
  if (!nodeStore?.nodeDb) return;
  saveBetterSqliteSnapshot(nodeStore.nodeDb, SNAPSHOT_PATH);
}

export function getNodeDataStats(): LocalDataStats | null {
  return nodeStore?.stats ?? null;
}

// Backward-compatible aliases
export function createLocalDataDb() {
  return createNodeDataStore().db;
}

export function getLocalDataStats() {
  return getNodeDataStats();
}

export function resetLocalDataCache() {
  resetNodeDataStore();
}
