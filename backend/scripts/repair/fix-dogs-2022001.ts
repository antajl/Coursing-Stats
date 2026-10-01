import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dogKey } from '../export/d1-export-utils.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const compDir = path.join(ROOT, 'data/v1/competitions/2026/09-сентябрь');
const compFiles = fs.readdirSync(compDir);
const compFileName = compFiles.find((f) => f.includes('2022001'));
if (!compFileName) {
  throw new Error('Competition file 2022001 not found');
}

const compPath = path.join(compDir, compFileName);
const compRelPath = `competitions/2026/09-сентябрь/${compFileName}`.replace(/\\/g, '/');
const comp = JSON.parse(fs.readFileSync(compPath, 'utf-8'));
const exportedAt = new Date().toISOString();

const missingIds = [10762, 10763, 10764, 10765];
const missingResults = comp.results.filter((r: { dog_id: number }) => missingIds.includes(r.dog_id));

for (const r of missingResults) {
  const dk = dogKey(r.dog.name_lat, r.dog.breed);
  const payload = {
    schema: 'coursing-stats/dog-v1',
    exported_at: exportedAt,
    id: r.dog_id,
    dog_key: dk,
    name_lat: r.dog.name_lat,
    name_ru: r.dog.name_ru || null,
    breed: r.dog.breed,
    sex: r.dog.sex || null,
    owner: null,
    competition_ids: [2022001],
    competition_files: [compRelPath],
  };

  const byIdPath = path.join(ROOT, `data/v1/dogs/by-id/${r.dog_id}.json`);
  const byKeyPath = path.join(ROOT, `data/v1/dogs/by-key/${dk}.json`);

  fs.writeFileSync(byIdPath, JSON.stringify(payload, null, 2) + '\n', 'utf-8');
  fs.writeFileSync(byKeyPath, JSON.stringify(payload, null, 2) + '\n', 'utf-8');
  console.log(`Created dog ${r.dog_id}: ${dk}`);
}
console.log('Done fixing missing dogs for 2022001');
