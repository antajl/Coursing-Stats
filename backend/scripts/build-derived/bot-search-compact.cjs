const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../../');
const DOGS_INDEX_PATH = path.join(ROOT, 'data/v1/indexes/dogs-index.json');
const COMPETITIONS_2026_DIR = path.join(ROOT, 'data/v1/competitions/2026');
const INDEXES_DIR = path.join(ROOT, 'data/v1/indexes');

console.log('Building compact search index for bot with 2026 participants...');

// Load existing dogs index
const dogsIndex = JSON.parse(fs.readFileSync(DOGS_INDEX_PATH, 'utf-8'));
console.log(`Loaded ${dogsIndex.length} dogs from index`);

// Find all competition files in 2026
const competitionFiles = [];
function findCompetitionFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findCompetitionFiles(fullPath);
    } else if (entry.name.endsWith('.json')) {
      competitionFiles.push(fullPath);
    }
  }
}

findCompetitionFiles(COMPETITIONS_2026_DIR);
console.log(`Found ${competitionFiles.length} competition files in 2026`);

// Collect all dog IDs from 2026 competitions
const dogIds2026 = new Set();
for (const file of competitionFiles) {
  try {
    const competition = JSON.parse(fs.readFileSync(file, 'utf-8'));
    if (competition.results) {
      for (const result of competition.results) {
        if (result.dog_id) {
          dogIds2026.add(result.dog_id);
        }
      }
    }
  } catch (error) {
    console.warn(`Error reading ${file}:`, error.message);
  }
}

console.log(`Found ${dogIds2026.size} unique dogs participating in 2026`);

// Sort by competition_count (activity) and take top popular dogs
const sortedByActivity = [...dogsIndex].sort((a, b) => b.competition_count - a.competition_count);
const topPopular = sortedByActivity.slice(0, Math.min(5000, dogsIndex.length));
console.log(`Selected top ${topPopular.length} popular dogs by activity`);

// Add all 2026 participants
const popularDogsSet = new Set(topPopular.map(d => d.id));
for (const dog of dogsIndex) {
  if (dogIds2026.has(dog.id) && !popularDogsSet.has(dog.id)) {
    topPopular.push(dog);
    popularDogsSet.add(dog.id);
  }
}

console.log(`Total dogs in compact index: ${topPopular.length} (popular + 2026 participants)`);

// Create compact entries with activity score
const popular = topPopular.map((dog, index) => ({
  id: dog.id,
  name_lat: dog.name_lat || '',
  name_ru: dog.name_ru || '',
  breed: dog.breed || '',
  activity_score: topPopular.length - index, // Higher score = more popular
  participated_2026: dogIds2026.has(dog.id) // Flag for 2026 participants
}));

// Build name prefix index (first 3 letters of name)
const name_prefix = {};
for (const dog of topPopular) {
  const nameLat = (dog.name_lat || '').toLowerCase();
  const nameRu = (dog.name_ru || '').toLowerCase();
  
  // Add prefixes for both names
  for (const name of [nameLat, nameRu]) {
    if (!name) continue;
    for (let i = 0; i < Math.min(3, name.length); i++) {
      const prefix = name.substring(0, i + 1);
      if (!name_prefix[prefix]) {
        name_prefix[prefix] = [];
      }
      if (!name_prefix[prefix].includes(dog.id)) {
        name_prefix[prefix].push(dog.id);
      }
    }
  }
}
console.log(`Built name prefix index with ${Object.keys(name_prefix).length} prefixes`);

// Build breed index
const breed_index = {};
for (const dog of topPopular) {
  const breed = dog.breed;
  if (!breed_index[breed]) {
    breed_index[breed] = [];
  }
  breed_index[breed].push(dog.id);
}
console.log(`Built breed index with ${Object.keys(breed_index).length} breeds`);

// Create the compact index
const compactIndex = {
  schema: 'coursing-stats/bot-search-compact-v1',
  popular,
  name_prefix,
  breed_index,
  metadata: {
    total_dogs: dogsIndex.length,
    popular_count: topPopular.length,
    dogs_2026: dogIds2026.size,
    last_updated: new Date().toISOString(),
    version: '1.1.0'
  }
};

// Write the index
fs.mkdirSync(INDEXES_DIR, { recursive: true });
const filePath = path.join(INDEXES_DIR, 'bot-search-compact.json');
fs.writeFileSync(filePath, JSON.stringify(compactIndex, null, 2), 'utf-8');
console.log('✓ Compact search index written to data/v1/indexes/bot-search-compact.json');

console.log('\n=== Statistics ===');
console.log(`Total dogs in full index: ${dogsIndex.length}`);
console.log(`Dogs in compact index: ${topPopular.length}`);
console.log(`  - Popular dogs (by activity): ${topPopular.length}`);
console.log(`  - 2026 participants: ${topPopular.filter(d => dogIds2026.has(d.id)).length}`);
console.log(`Name prefixes: ${Object.keys(name_prefix).length}`);
console.log(`Breeds indexed: ${Object.keys(breed_index).length}`);
console.log(`File size: ${(fs.statSync(filePath).size / 1024).toFixed(2)} KB`);