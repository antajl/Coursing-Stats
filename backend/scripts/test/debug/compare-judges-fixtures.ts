import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseCoursingHTML as v1Coursing } from '../../../parsers/parse-results-coursing';
import { parseCoursingHTML as v2Coursing } from '../../../parsers/coursing/index';
import { parseBzmpHTML as v2Bzmp } from '../../../parsers/bzmp/index';
import { parseBZMPHTML as v1Bzmp } from '../../../parsers/parse-results-bzmp';
import { parseRacingHTML as v2Racing } from '../../../parsers/racing/index';
import { parseRacingHTML as v1Racing } from '../../../parsers/parse-results-racing';

const FIXTURES = join(import.meta.dirname, '../../../tests/fixtures');

const cases = [
  ['coursing', 'Complete_Results_2025-04-06_C.html', v1Coursing, v2Coursing],
  ['coursing', 'Complete_Results_2025-03-08.html', v1Coursing, v2Coursing],
  ['bzmp', 'Complete_Results_2025-04-06_B.html', v1Bzmp, v2Bzmp],
  ['racing', '2026-05-16_Complete_Results_Racing.html', v1Racing, v2Racing],
] as const;

for (const [type, file, v1, v2] of cases) {
  const html = readFileSync(join(FIXTURES, type, file), 'utf-8');
  const r1 = await v1(html);
  const r2 = await v2(html);
  console.log(`${type}/${file}`);
  console.log(`  v1: ${r1.judges ?? '(null)'}`);
  console.log(`  v2: ${r2.judges ?? '(null)'}`);
}
