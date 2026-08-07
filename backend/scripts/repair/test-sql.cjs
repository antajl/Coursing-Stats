const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const DOGS_DIR = path.join(ROOT, 'data/v1/dogs/by-id');
const COMPETITIONS_DIR = path.join(ROOT, 'data/v1/competitions/2024');

console.log('Checking how competition results are linked to dogs...');

// Load all dogs first
const dogs = new Map();
const dogEntries = fs.readdirSync(DOGS_DIR, { withFileTypes: true });
for (const entry of dogEntries) {
  if (entry.name.endsWith('.json')) {
    const dogData = JSON.parse(fs.readFileSync(path.join(DOGS_DIR, entry.name), 'utf-8'));
    dogs.set(dogData.id, dogData);
  }
}

console.log(`Loaded ${dogs.size} dogs`);

// Check one competition file
const compFile = path.join(COMPETITIONS_DIR, '04-апрель/20240407--cacl-07042024-.json');
const compData = JSON.parse(fs.readFileSync(compFile, 'utf-8'));

console.log('\nCompetition event_id:', compData.event_id);
console.log('Results:', compData.results.length);

// Check if any dog has this competition in their competition_ids
let foundDogs = 0;
for (const [dogId, dog] of dogs) {
  if (dog.competition_ids && dog.competition_ids.includes(compData.event_id)) {
    foundDogs++;
    if (foundDogs <= 3) {
      console.log(`Dog ${dogId} (${dog.name_lat}) has this competition`);
    }
  }
}

console.log(`\nTotal dogs with this competition: ${foundDogs}`);