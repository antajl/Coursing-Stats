import * as cheerio from 'cheerio';
import { fetchWin1251 } from '../../../lib/fetch-win1251';
import { extractJudgesFromPage } from '../../../parsers/shared/extract-judges';

const cases = [
  [2587, 'http://procoursing.ru/Complete_Results_2023-09-03_V_C.html'],
  [2591, 'http://procoursing.ru/Complete_Results_2023-10-07.html'],
  [2612, 'http://procoursing.ru/Complete_Results_2024-09-01_C.html'],
] as const;

for (const [id, url] of cases) {
  const html = await fetchWin1251(url);
  const judges = extractJudgesFromPage(cheerio.load(html));
  console.log(id, judges);
}
