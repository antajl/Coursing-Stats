import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загрузка соревнования
const competitionPath = path.join(__dirname, '../../data/v1/competitions/2026/08-август/1550-чркф-бега-борзых.json');
const competition = JSON.parse(fs.readFileSync(competitionPath, 'utf8'));

// Добавление иконок пола
let updated = 0;
for (const result of competition.results) {
  const sex = result.dog.sex;
  if (sex === 'Кобель') {
    result.dog.sex_icon = '♂';
    updated++;
  } else if (sex === 'Сука') {
    result.dog.sex_icon = '♀';
    updated++;
  }
}

console.log(`Добавлено иконок пола для ${updated} собак`);

// Сохранение обновлённого файла
fs.writeFileSync(competitionPath, JSON.stringify(competition, null, 2), 'utf8');
console.log(`Файл обновлён: ${competitionPath}`);