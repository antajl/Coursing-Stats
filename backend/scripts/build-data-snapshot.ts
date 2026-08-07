/**
 * Собрать data/v1/pc-db.sqlite из JSON (без D1).
 * Usage: npm run build-data-snapshot
 */
import { loadLocalDataSqlite } from '../lib/local-data/load-sqlite';
import { saveBetterSqliteSnapshot, SNAPSHOT_PATH } from '../lib/local-data/snapshot';

const { db, stats } = loadLocalDataSqlite();
saveBetterSqliteSnapshot(db, SNAPSHOT_PATH);
db.close();
console.log('Snapshot:', SNAPSHOT_PATH, stats);
