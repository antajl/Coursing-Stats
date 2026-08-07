import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загрузка соревнования
const competitionPath = path.join(__dirname, '../../data/v1/competitions/2026/08-август/1550-пчркф-курсинг-борзых.json');
const competition = JSON.parse(fs.readFileSync(competitionPath, 'utf8'));

// Получение всех dog_key из соревнования
const dogKeys = competition.results.map(r => r.dog_key);
console.log(`Всего собак в соревновании: ${dogKeys.length}`);

// Проверка существования собак
const dogsDir = path.join(__dirname, '../../data/v1/dogs/by-id');
const existingDogs = new Map();

if (fs.existsSync(dogsDir)) {
  const files = fs.readdirSync(dogsDir);
  for (const file of files) {
    if (file.endsWith('.json')) {
      const dogPath = path.join(dogsDir, file);
      try {
        const dog = JSON.parse(fs.readFileSync(dogPath, 'utf8'));
        existingDogs.set(dog.dog_key, dog.id);
      } catch (e) {
        // Skip invalid files
      }
    }
  }
}

console.log(`Всего собак в системе: ${existingDogs.size}`);

// Проверка
let found = 0;
let notFound = [];
const dogIds = {};

for (const dogKey of dogKeys) {
  if (existingDogs.has(dogKey)) {
    found++;
    dogIds[dogKey] = existingDogs.get(dogKey);
  } else {
    notFound.push(dogKey);
  }
}

console.log(`\n=== РЕЗУЛЬТАТЫ ПРОВЕРКИ ===`);
console.log(`Найдено существующих собак: ${found}`);
console.log(`Не найдено собак: ${notFound.length}`);

if (notFound.length > 0) {
  console.log(`\nСобаки которых нет в системе (${notFound.length}):`);
  notFound.forEach(key => {
    const result = competition.results.find(r => r.dog_key === key);
    console.log(`  - ${result.dog.name_lat} (${result.dog.breed})`);
  });
}

console.log(`\n=== dog_ids для существующих собак ===`);
for (const [key, id] of Object.entries(dogIds)) {
  console.log(`${key}: ${id}`);
}

// Вывод в JSON для обновления
console.log(`\n=== JSON для обновления dog_ids ===`);
const updateData = competition.results.map(result => {
  const dogId = dogIds[result.dog_key] || null;
  return {
    dog_key: result.dog_key,
    name_lat: result.dog.name_lat,
    dog_id: dogId,
    exists: dogId !== null
  };
});

console.log(JSON.stringify(updateData, null, 2));