import { fetchWin1251 } from '../../lib/fetch-win1251';
import * as cheerio from 'cheerio';

async function testBZMPJudges() {
  const url = 'http://procoursing.ru/2026/2026-05-02_Complete_Results_BZMP.html';
  
  try {
    const html = await fetchWin1251(url);
    const $ = cheerio.load(html);
    
    const bodyText = $('body').text();
    console.log('Полный текст body (первые 500 символов):');
    console.log(bodyText.substring(0, 500));
    console.log('\n---\n');
    
    // Ищем все упоминания судей
    const judgeMatches = bodyText.match(/(?:Главный\s+судья|Судья|Судьи)[^:\n]*/gi);
    console.log('Найденные упоминания судей:');
    if (judgeMatches) {
      judgeMatches.forEach((match, i) => {
        console.log(`${i + 1}: "${match}"`);
      });
    } else {
      console.log('Не найдено упоминаний судей по паттерну');
    }
    
    console.log('\n---\n');
    
    // Ищем конкретный формат "Судьи:"
    const judgesSection = bodyText.match(/Судьи[:\s][^\n]+/i);
    console.log('Секция "Судьи":');
    console.log(judgesSection ? judgesSection[0] : 'Не найдена');
    
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

testBZMPJudges();
