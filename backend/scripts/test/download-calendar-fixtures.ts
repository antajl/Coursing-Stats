import { fetchWin1251 } from '../../lib/fetch-win1251';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const dir = path.resolve('backend/tests/fixtures/calendar');

async function main() {
  await fs.mkdir(dir, { recursive: true });
  for (const year of [2025, 2026]) {
    const html = await fetchWin1251(`http://procoursing.ru/s_${year}.html`);
    const file = path.join(dir, `s_${year}.html`);
    await fs.writeFile(file, html, 'utf-8');
    console.log(`saved ${file} (${html.length} chars)`);
  }
}

main().catch(console.error);
