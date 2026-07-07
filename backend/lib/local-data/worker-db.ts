import wasmModule from '../../assets/sql-wasm.wasm';
import type { LocalDataStats } from './stats';
import { applyWorkerPolyfills } from './worker-polyfills';
import { createSqlJsShim } from './sqljs-shim';
import type { DataDb } from './types';

export type WorkerDataStore = {
  db: DataDb;
  stats: LocalDataStats;
  sqlJsDb: import('sql.js').Database;
};

export type WorkerDataEnv = {
  DATA_SNAPSHOT_URL?: string;
};

export const DEFAULT_SNAPSHOT_URL = 'https://coursing-stats.ru/data/v1/pc-db.sqlite';

let cached: WorkerDataStore | null = null;
let loading: Promise<WorkerDataStore> | null = null;
let sqlJsStatic: import('sql.js').SqlJsStatic | null = null;

async function initSqlJs(): Promise<import('sql.js').SqlJsStatic> {
  if (sqlJsStatic) return sqlJsStatic;

  applyWorkerPolyfills();

  const initSqlJsModule = await import('sql.js/dist/sql-wasm.js');
  const initSqlJs = initSqlJsModule.default as (config?: {
    instantiateWasm?: (
      imports: WebAssembly.Imports,
      successCallback: (instance: WebAssembly.Instance) => void,
    ) => WebAssembly.Exports | Record<string, never>;
  }) => Promise<import('sql.js').SqlJsStatic>;

  sqlJsStatic = await initSqlJs({
    instantiateWasm(imports, successCallback) {
      const instance = new WebAssembly.Instance(wasmModule, imports);
      successCallback(instance);
      return instance.exports;
    },
  });

  return sqlJsStatic;
}

async function loadSnapshotBytes(env: WorkerDataEnv): Promise<ArrayBuffer> {
  const url = env.DATA_SNAPSHOT_URL || DEFAULT_SNAPSHOT_URL;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Data snapshot not found at ${url} (${res.status})`);
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
