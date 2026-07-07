import wasmModule from '../../assets/sql-wasm.wasm';
import type { LocalDataStats } from './stats';
import { applyWorkerPolyfills } from './worker-polyfills';
import { createSqlJsShim } from './sqljs-shim';
import type { DataDb } from './types';

export type WorkerDataStore = {
  db: DataDb;
  stats: LocalDataStats;
  sqlJsDb: import('sql.js').Database;
  snapshotHash?: string;
};

export type WorkerDataEnv = {
  DATA_SNAPSHOT_URL?: string;
  DATA_SNAPSHOT_HASH?: string;
};

export const DEFAULT_SNAPSHOT_URL = 'https://coursing-stats.ru/data/v1/pc-db.sqlite';

let cached: WorkerDataStore | null = null;
let loading: Promise<WorkerDataStore> | null = null;
let cachedSnapshotUrl: string | null = null;
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

function buildSnapshotUrl(hash: string, gzip = true): string {
  const base = `https://coursing-stats.ru/data/v1/pc-db-${hash}.sqlite`;
  return gzip ? `${base}.gz` : base;
}

async function resolveSnapshotUrl(env: WorkerDataEnv): Promise<string> {
  if (env.DATA_SNAPSHOT_HASH) return buildSnapshotUrl(env.DATA_SNAPSHOT_HASH);
  if (env.DATA_SNAPSHOT_URL) return env.DATA_SNAPSHOT_URL;

  try {
    const res = await fetch('https://coursing-stats.ru/data/v1/snapshot-latest.json');
    if (res.ok) {
      const latest = (await res.json()) as { hash?: string };
      if (latest.hash) return buildSnapshotUrl(latest.hash);
    }
  } catch {
    /* optional */
  }

  return `${DEFAULT_SNAPSHOT_URL}.gz`;
}

async function loadSnapshotBytes(env: WorkerDataEnv): Promise<ArrayBuffer> {
  const url = await resolveSnapshotUrl(env);
  const res = await fetch(url, { cf: { cacheTtl: 3600 } } as RequestInit);
  if (!res.ok) {
    throw new Error(`Data snapshot not found at ${url} (${res.status})`);
  }

  if (url.endsWith('.gz')) {
    if (!res.body) throw new Error(`Empty snapshot body at ${url}`);
    const stream = res.body.pipeThrough(new DecompressionStream('gzip'));
    return new Response(stream).arrayBuffer();
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
  const snapshotUrl = env.DATA_SNAPSHOT_HASH
    ? buildSnapshotUrl(env.DATA_SNAPSHOT_HASH)
    : env.DATA_SNAPSHOT_URL ?? (await resolveSnapshotUrl(env));

  if (cached && cachedSnapshotUrl === snapshotUrl) return cached;
  if (cachedSnapshotUrl !== snapshotUrl) resetWorkerDataStore();

  if (loading) return loading;

  loading = (async () => {
    const SQL = await initSqlJs();
    const bytes = await loadSnapshotBytes({ ...env, DATA_SNAPSHOT_URL: snapshotUrl });
    const sqlDb = new SQL.Database(new Uint8Array(bytes));
    const stats = readStats(sqlDb);
    cachedSnapshotUrl = snapshotUrl;
    cached = {
      db: createSqlJsShim(sqlDb),
      stats,
      sqlJsDb: sqlDb,
      snapshotHash: env.DATA_SNAPSHOT_HASH,
    };
    return cached;
  })();

  return loading;
}

export function resetWorkerDataStore() {
  cached?.sqlJsDb?.close();
  cached = null;
  loading = null;
  cachedSnapshotUrl = null;
}
