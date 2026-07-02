import { parseBzmpResultsPage } from '../../parsers/bzmp/index';

async function testBZMP() {
  const url = 'http://procoursing.ru/2026/2026-05-02_Complete_Results_BZMP.html';
  
  try {
    const result = await parseBzmpResultsPage(url);
    
    console.log('Результаты:');
    console.log(`Всего записей: ${result.results.length}`);
    
    if (result.results.length > 0) {
      console.log('\nВторая запись (с оценками):');
      const second = result.results[1];
      console.log(`Имя: ${second.name}`);
      console.log(`Total score: ${second.total_score}`);
      console.log(`Judge count: ${second.judge_count}`);
      console.log(`Raw scores JSON: ${second.raw_scores_json}`);
      
      const parsed = JSON.parse(second.raw_scores_json);
      console.log('\nParsed raw_scores_json:');
      console.log(JSON.stringify(parsed, null, 2));
    }
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

testBZMP();
