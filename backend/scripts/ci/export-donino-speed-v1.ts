/**
 * Export speed_records from D1 → data/v1/donino/speed_records.json
 * Used after sync-speed-records cron (remote D1 is source of truth for ids).
 *
 * Usage:
 *   npx tsx backend/scripts/ci/export-donino-speed-v1.ts          # remote D1
 *   npx tsx backend/scripts/ci/export-donino-speed-v1.ts --local  # local D1
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, type Row, queryD1, writeJson } from '../export/d1-export-utils';

const V1 = path.join(ROOT, 'data/v1');

function enrichDoninoRow(row: Row): Row {
  const copy = { ...row };
  if (typeof copy.history === 'string') {
    try {
      copy.history = JSON.parse(copy.history);
    } catch {
      /* keep string */
    }
  }
  return copy;
}

function main(): void {
  const local = process.argv.includes('--local');
  const speed = queryD1('SELECT * FROM speed_records ORDER BY date DESC, name', local).map(
    enrichDoninoRow,
  );

  writeJson(path.join(V1, 'donino/speed_records.json'), {
    schema: 'coursing-stats/donino-speed-v1',
    source: local ? 'd1-speed_records-local' : 'd1-speed_records',
    count: speed.length,
    records: speed,
  });

  console.log(`Exported ${speed.length} speed records → data/v1/donino/speed_records.json`);
}

main();
