import { parseCoursingHTML } from '../../parsers/coursing/index';
import { parseBzmpHTML } from '../../parsers/bzmp/index';
import { parseRacingHTML } from '../../parsers/racing/index';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, '..', '..', 'tests', 'fixtures');

async function testParser(
  type: string,
  parser: (html: string) => Promise<{ results?: unknown[] }>,
  fixtureFiles: string[],
) {
  console.log(`\n=== Тестирование парсера ${type.toUpperCase()} (v2 модульный) ===`);

  for (const filename of fixtureFiles) {
    const filepath = path.join(FIXTURES_DIR, type, filename);

    if (!fs.existsSync(filepath)) {
      console.log(`✗ Файл не найден: ${filename}`);
      continue;
    }

    const html = fs.readFileSync(filepath, 'utf-8');

    try {
      const result = await parser(html);
      const resultsCount = result.results?.length ?? 0;
      console.log(`✓ ${filename}: ${resultsCount} результатов`);

      if (resultsCount > 0) {
        const first = result.results![0] as { name?: string; breed?: string };
        console.log(`  Первый результат: ${first.name} (${first.breed})`);
      }
    } catch (error) {
      console.error(
        `✗ ${filename}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

async function runTests() {
  console.log('=== Тестирование модульных парсеров на фикстурах ===\n');

  await testParser('coursing', parseCoursingHTML, [
    'Complete_Results_2025-03-08.html',
    'Complete_Results_2025-04-05_C.html',
    'Complete_Results_2025-04-06_C.html',
  ]);

  await testParser('bzmp', parseBzmpHTML, [
    'Complete_Results_2025-03-08.html',
    'Complete_Results_2025-04-05_B.html',
    'Complete_Results_2025-04-06_B.html',
  ]);

  await testParser('racing', parseRacingHTML, [
    '2026-05-16_Complete_Results_Racing.html',
    'Complete_Results_2025-cc-sample.html',
  ]);

  console.log('\n=== Тестирование завершено ===');
}

runTests().catch(console.error);
