import type { createSqlJsShim } from './sqljs-shim';

export type DataDb = ReturnType<typeof createSqlJsShim>;

export type DataStoreEnv = {
  ADMIN_API_TOKEN: string;
  DATA_SNAPSHOT_URL?: string;
  DATA_STORE?: {
    nodeDb?: unknown;
    sqlJsDb?: import('sql.js').Database;
    stats?: import('./stats').LocalDataStats;
    snapshotHash?: string;
  };
};
