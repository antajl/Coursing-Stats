import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загрузка всех профилей собак для построения маппинга dog_key -> dog_id
const profilesDir = path.join(__dirname, '../../data/v1/indexes/dog-profiles');
const dogKeyToId = new Map<string, number>();

if (fs.existsSync(profilesDir)) {
  const files = fs.readdirSync(profilesDir);
  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(profilesDir, file);
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (content.dog?.id && content.dog?.name_lat) {
          // Создаем dog_key из name_lat (преобразуем в lowercase и заменяем пробелы)
          const dogKey = content.dog.name_lat
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[\/\\]/g, '-');
          dogKeyToId.set(dogKey, content.dog.id);
        }
      } catch (e) {
        console.error(`Error reading ${file}:`, e);
      }
    }
  }
}

console.log(`Loaded ${dogKeyToId.size} dog profiles`);

// Обновление файла соревнования
const eventFile = path.join(__dirname, '../../data/v1/competitions/2026/08-август/1550-чркф-бега-борзых.json');
const event = JSON.parse(fs.readFileSync(eventFile, 'utf-8'));

let updatedCount = 0;

if (event.results && Array.isArray(event.results)) {
  for (const result of event.results) {
    if (result.dog?.dog_key && !result.dog_id) {
      const dogId = dogKeyToId.get(result.dog.dog_key);
      if (dogId) {
        result.dog_id = dogId;
        updatedCount++;
        console.log(`Updated: ${result.dog.name_ru} -> dog_id: ${dogId}`);
      } else {
        console.log(`Not found: ${result.dog.dog_key} (${result.dog.name_ru})`);
      }
    }
  }
}

if (updatedCount > 0) {
  fs.writeFileSync(eventFile, JSON.stringify(event, null, 2), 'utf-8');
  console.log(`Updated ${updatedCount} results in ${eventFile}`);
} else {
  console.log('No updates needed');
}
