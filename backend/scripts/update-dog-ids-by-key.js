import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const profilesDir = path.join(__dirname, '../../data/v1/indexes/dog-profiles');
const nameLatToId = new Map();
const nameRuToId = new Map();

if (fs.existsSync(profilesDir)) {
  const files = fs.readdirSync(profilesDir);
  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(profilesDir, file);
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (content.dog?.id) {
          if (content.dog?.name_lat) {
            const normalizedName = content.dog.name_lat
              .toLowerCase()
              .replace(/\s+/g, ' ')
              .replace(/[\/\\]/g, ' ')
              .replace(/['"]/g, '')
              .trim();
            nameLatToId.set(normalizedName, content.dog.id);
          }
          if (content.dog?.name_ru) {
            const normalizedName = content.dog.name_ru
              .toLowerCase()
              .replace(/\s+/g, ' ')
              .replace(/[\/\\]/g, ' ')
              .trim();
            nameRuToId.set(normalizedName, content.dog.id);
          }
        }
      } catch (e) {
        console.error(`Error reading ${file}:`, e);
      }
    }
  }
}

console.log(`Loaded ${nameLatToId.size} name_lat profiles, ${nameRuToId.size} name_ru profiles`);

const eventFile = path.join(__dirname, '../../data/v1/competitions/2026/08-август/1550-чркф-бега-борзых.json');
const event = JSON.parse(fs.readFileSync(eventFile, 'utf-8'));

let updatedCount = 0;

if (event.results && Array.isArray(event.results)) {
  for (const result of event.results) {
    if (!result.dog_id) {
      let dogId = null;
      
      // Сначала пробуем по name_lat
      if (result.dog?.name_lat) {
        const normalizedName = result.dog.name_lat
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .replace(/[\/\\]/g, ' ')
          .replace(/['"]/g, '')
          .trim();
        dogId = nameLatToId.get(normalizedName);
      }
      
      // Если не нашли, пробуем по name_ru
      if (!dogId && result.dog?.name_ru) {
        const normalizedName = result.dog.name_ru
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .replace(/[\/\\]/g, ' ')
          .trim();
        dogId = nameRuToId.get(normalizedName);
      }
      
      if (dogId) {
        result.dog_id = dogId;
        updatedCount++;
        console.log(`Updated: ${result.dog.name_ru} -> dog_id: ${dogId}`);
      } else {
        console.log(`Not found: ${result.dog.name_lat || result.dog.name_ru} (${result.dog.name_ru})`);
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
