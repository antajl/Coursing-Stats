const fs = require('fs');
const path = require('path');

const cal = JSON.parse(fs.readFileSync('data/v1/calendar/2026.json', 'utf-8'));
let orphanDogs = [];
let invalidDates = [];

function findJson(dir) {
  let files = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, item.name);
    if (item.isDirectory()) files.push(...findJson(p));
    else if (item.name.endsWith('.json')) files.push(p);
  }
  return files;
}

const compFiles = findJson('data/v1/competitions/2026');

for (const f of compFiles) {
  const json = JSON.parse(fs.readFileSync(f, 'utf-8'));
  const ev = json.event || {};
  if (ev.date_end === 'null') {
    invalidDates.push({ id: ev.id, date_end: ev.date_end });
  }

  for (const r of json.results || []) {
    if (r.dog_id) {
      const dogPath = path.join('data/v1/dogs/by-id', `${r.dog_id}.json`);
      if (!fs.existsSync(dogPath)) {
        orphanDogs.push({ id: ev.id, dog_id: r.dog_id, dog: r.dog?.name_ru });
      }
    }
  }
}

console.log('Orphan dogs:', orphanDogs.length);
console.log('Invalid dates:', invalidDates.length);
