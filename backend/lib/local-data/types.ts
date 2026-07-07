import type { createD1Shim } from './d1-shim';
import type { createSqlJsShim } from './sqljs-shim';

export type DataDb = ReturnType<typeof createD1Shim> | ReturnType<typeof createSqlJsShim>;

export type DataStoreEnv = {
  DB: DataDb;
  ADMIN_API_TOKEN: string;
  DATA_SNAPSHOT_URL?: string;
  DATA_STORE?: {
    nodeDb?: unknown;
    sqlJsDb?: import('sql.js').Database;
    stats?: import('./stats').LocalDataStats;
    snapshotHash?: string;
  };
};
