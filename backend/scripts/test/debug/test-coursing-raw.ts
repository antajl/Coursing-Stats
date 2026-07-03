import { parseCoursingResultsPage } from '../../parsers/coursing/index';

async function testCoursing() {
  const url = 'http://procoursing.ru/2026/2026-04-04_Complete_Results_Coursing.html';
  
  try {
    const result = await parseCoursingResultsPage(url);
    
    console.log('Результаты:');
    console.log(`Всего записей: ${result.results.length}`);
    
    if (result.results.length > 0) {
      console.log('\nПервая запись:');
      const first = result.results[0];
      console.log(`Имя: ${first.name}`);
      console.log(`Total score: ${first.total_score}`);
      console.log(`Judge count: ${first.judge_count}`);
      console.log(`Raw scores JSON: ${first.raw_scores_json}`);
      
      const parsed = JSON.parse(first.raw_scores_json);
      console.log('\nParsed raw_scores_json:');
      console.log(JSON.stringify(parsed, null, 2));
    }
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

testCoursing();
