import * as cheerio from 'cheerio';
import { execSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fetchWin1251, sleep } from '../../lib/fetch-win1251';
import { extractJudgesFromPage } from '../../parsers/shared/extract-judges';

const YEAR = process.argv[2];
const USE_LOCAL = process.argv.includes('--local');
const ALL_YEARS = process.argv.includes('--all');

if (!YEAR && !ALL_YEARS) {
  console.error('Укажите год: npx tsx backend/scripts/reparse/backfill-judges.ts 2025 [--remote]');
  console.error('Или: npx tsx backend/scripts/reparse/backfill-judges.ts --all --remote');
  process.exit(1);
}

function sqlEscape(value: string) {
  return (value || '').replace(/'/g, "''");
}

async function loadEventsMissingJudges(year?: string) {
  let query = `SELECT id, results_url, event_type, judges FROM events WHERE results_url IS NOT NULL AND (judges IS NULL OR judges = '')`;
  if (year) {
    query += ` AND date_start LIKE '${year}%'`;
  }
  query += ' ORDER BY id';

  const command = `npx wrangler d1 execute pc-db ${USE_LOCAL ? '--local' : '--remote'} --command="${query}" --json`;
  const output = execSync(command, { cwd: process.cwd(), encoding: 'utf-8' });
  const result = JSON.parse(output);
  return result?.[0]?.results ?? [];
}

async function backfillJudges() {
  const label = ALL_YEARS ? 'все годы' : `${YEAR}`;
  console.log(`Backfill судей (${label}), ${USE_LOCAL ? 'local' : 'remote'} D1...`);

  const events = await loadEventsMissingJudges(ALL_YEARS ? undefined : YEAR);
  console.log(`Событий без судей: ${events.length}`);

  const sqlStatements: string[] = [];
  let updated = 0;
  let skipped = 0;

  for (const event of events) {
    if (!event.results_url || event.event_type === 'other') {
      skipped++;
      continue;
    }

    console.log(`  #${event.id} ${event.results_url}`);
    await sleep(800);

    try {
      const html = await fetchWin1251(event.results_url);
      const $ = cheerio.load(html);
      const colspans = event.event_type === 'racing' ? ['18', '25'] : ['25', '18'];
      const judges = extractJudgesFromPage($, { colspans });

      if (!judges) {
        console.log('    судьи не найдены');
        skipped++;
        continue;
      }

      console.log(`    → ${judges}`);
      sqlStatements.push(
        `UPDATE events SET judges = '${sqlEscape(judges)}' WHERE id = ${event.id};`,
      );
      updated++;
    } catch (error) {
      console.error(`    ошибка: ${error instanceof Error ? error.message : String(error)}`);
      skipped++;
    }
  }

  const suffix = ALL_YEARS ? 'all' : YEAR;
  const outputPath = `data/updates/backfill-judges-${suffix}.sql`;
  await mkdir('data/updates', { recursive: true });
  await writeFile(outputPath, sqlStatements.join('\n'));

  console.log(`\nГотово: ${updated} UPDATE, ${skipped} пропущено`);
  console.log(`SQL: ${outputPath}`);
  console.log(`\nnpx wrangler d1 execute pc-db ${USE_LOCAL ? '--local' : '--remote'} --file=./${outputPath} --yes`);
}

backfillJudges().catch(console.error);
