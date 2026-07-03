import { parseResultsCoursing } from '../../parsers/parse-results-coursing';

async function testParser(url: string) {
  console.log(`Testing parser: ${url}`);
  const result = await parseResultsCoursing(url);
  console.log(`Judges found: "${result.judges}"`);
}

const url = process.argv[2] || 'http://procoursing.ru/2026/2026-04-25_Complete_Results_Coursing.html';
testParser(url);
