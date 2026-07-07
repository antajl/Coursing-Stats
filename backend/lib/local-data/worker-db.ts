import type { LocalDataStats } from './stats';
import { SNAPSHOT_KEY } from './constants';
import { createSqlJsShim } from './sqljs-shim';
import type { DataDb } from './types';

export type WorkerDataStore = {
  db: DataDb;
  stats: LocalDataStats;
  sqlJsDb: import('sql.js').Database;
};

export type WorkerDataEnv = {
  /** Переопределение URL снимка (по умолчанию — статика Pages) */
  DATA_SNAPSHOT_URL?: string;
};

/** Публичный снимок на Pages (бесплатно, без R2) */
export const DEFAULT_SNAPSHOT_URL = 'https://coursing-stats.ru/data/v1/pc-db.sqlite';

let cached: WorkerDataStore | null = null;
let loading: Promise<WorkerDataStore> | null = null;

async function initSqlJs() {
  const initSqlJsModule = await import('sql.js/dist/sql-wasm.js');
  const initSqlJs = initSqlJsModule.default as (config?: {
    wasmBinary?: ArrayBuffer;
    locateFile?: (file: string) => string;
  }) => Promise<import('sql.js').SqlJsStatic>;

  let wasmBinary: ArrayBuffer | undefined;
  try {
    const wasm = await import('../../assets/sql-wasm.wasm');
    wasmBinary = (wasm as { default: ArrayBuffer }).default;
  } catch {
    /* wrangler dev */
  }

  return initSqlJs(
    wasmBinary
      ? { wasmBinary }
      : { locateFile: (file) => `https://coursing-stats.ru/assets/${file}` },
  );
}

async function loadSnapshotBytes(env: WorkerDataEnv): Promise<ArrayBuffer> {
  const url = env.DATA_SNAPSHOT_URL || DEFAULT_SNAPSHOT_URL;
  const res = await fetch(url, { cf: { cacheTtl: 300 } } as RequestInit);
  if (!res.ok) {
    throw new Error(
      `Data snapshot not found at ${url} (${res.status}). ` +
        `Run: npm run build-data-snapshot, deploy Pages with public/data/v1/${SNAPSHOT_KEY}`,
    );
  }
  return res.arrayBuffer();
}

function readStats(db: import('sql.js').Database): LocalDataStats {
  const count = (table: string) => {
    const r = db.exec(`SELECT COUNT(*) AS c FROM ${table}`);
    return Number(r[0]?.values[0]?.[0] ?? 0);
  };
  return {
    events: count('events'),
    dogs: count('dogs'),
    results: count('results'),
    speed_records: count('speed_records'),
    coursing_records: count('coursing_records'),
  };
}

export async function getWorkerDataStore(env: WorkerDataEnv = {}): Promise<WorkerDataStore> {
  if (cached) return cached;
  if (loading) return loading;

  loading = (async () => {
    const SQL = await initSqlJs();
    const bytes = await loadSnapshotBytes(env);
    const sqlDb = new SQL.Database(new Uint8Array(bytes));
    const stats = readStats(sqlDb);
    cached = { db: createSqlJsShim(sqlDb), stats, sqlJsDb: sqlDb };
    return cached;
  })();

  return loading;
}

export function resetWorkerDataStore() {
  cached?.sqlJsDb?.close();
  cached = null;
  loading = null;
}
