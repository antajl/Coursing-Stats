import { fetchWin1251 } from '../../lib/fetch-win1251';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Абсолютный путь к папке fixtures (от корня проекта)
const FIXTURES_DIR = path.resolve(__dirname, '..', '..', 'tests', 'fixtures');

// Реальные URL для скачивания (из базы данных)
const FIXTURES = {
  coursing: [
    'http://procoursing.ru/2025/Complete_Results_2025-03-08.html', // 2025
    'http://procoursing.ru/2025/Complete_Results_2025-04-05_C.html', // 2025
    'http://procoursing.ru/2025/Complete_Results_2025-04-06_C.html', // 2025
  ],
  bzmp: [
    'http://procoursing.ru/2025/Complete_Results_2025-03-08.html', // 2025 (BZMP в том же файле)
    'http://procoursing.ru/2025/Complete_Results_2025-04-05_B.html', // 2025
    'http://procoursing.ru/2025/Complete_Results_2025-04-06_B.html', // 2025
  ],
  racing: [
    'http://procoursing.ru/2026/2026-05-16_Complete_Results_Racing.html', // 2026, 21 колонка (ВС)
  ],
};

async function downloadFixtures() {
  console.log('=== Скачивание фикстур для парсеров ===\n');

  for (const [type, urls] of Object.entries(FIXTURES)) {
    console.log(`--- ${type.toUpperCase()} ---`);
    
    for (const url of urls) {
      try {
        console.log(`Скачивание: ${url}`);
        const html = await fetchWin1251(url);
        
        // Извлекаем имя файла из URL
        const filename = url.split('/').pop();
        const filepath = path.join(FIXTURES_DIR, type, filename);
        
        fs.writeFileSync(filepath, html, 'utf-8');
        console.log(`  ✓ Сохранено: ${filename}`);
      } catch (error) {
        console.error(`  ✗ Ошибка: ${error.message}`);
      }
    }
    
    console.log('');
  }

  console.log('=== Готово ===');
}

downloadFixtures().catch(console.error);
