import wasmModule from '../../assets/sql-wasm.wasm';
import type { LocalDataStats } from './stats';
import { applyWorkerPolyfills } from './worker-polyfills';
import { createSqlJsShim } from './sqljs-shim';
import { STATIC_DATA_BASE } from './static-data';
import type { DataDb } from './types';

export type WorkerDataStore = {
  db: DataDb;
  stats: LocalDataStats;
  sqlJsDb: import('sql.js').Database;
  snapshotHash?: string;
};

export type WorkerDataEnv = {
  DATA_SNAPSHOT_URL?: string;
};

/** Stable URL — CI always publishes pc-db.sqlite.gz + snapshot-latest.json */
export const DEFAULT_SNAPSHOT_GZ_URL = `${STATIC_DATA_BASE}/pc-db.sqlite.gz`;

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

async function resolveSnapshotUrl(env: WorkerDataEnv): Promise<string> {
  if (env.DATA_SNAPSHOT_URL) return env.DATA_SNAPSHOT_URL;
  return DEFAULT_SNAPSHOT_GZ_URL;
}

async function loadSnapshotMeta(): Promise<{ hash?: string; counts?: LocalDataStats } | null> {
  try {
    const res = await fetch(`${STATIC_DATA_BASE}/snapshot-latest.json`, {
      cf: { cacheTtl: 300 },
    } as RequestInit);
    if (!res.ok) return null;
    return (await res.json()) as { hash?: string; counts?: LocalDataStats };
  } catch {
    return null;
  }
}

async function loadSnapshotBytes(url: string): Promise<ArrayBuffer> {
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
  const snapshotUrl = await resolveSnapshotUrl(env);

  if (cached && cachedSnapshotUrl === snapshotUrl) return cached;
  if (cachedSnapshotUrl !== snapshotUrl) resetWorkerDataStore();

  if (loading) return loading;

  loading = (async () => {
    const meta = await loadSnapshotMeta();
    const SQL = await initSqlJs();
    const bytes = await loadSnapshotBytes(snapshotUrl);
    const sqlDb = new SQL.Database(new Uint8Array(bytes));
    const stats = readStats(sqlDb);
    cachedSnapshotUrl = snapshotUrl;
    cached = {
      db: createSqlJsShim(sqlDb),
      stats,
      sqlJsDb: sqlDb,
      snapshotHash: meta?.hash,
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
