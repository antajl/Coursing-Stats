import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DATA_V1_ROOT, writeIndex } from './shared';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DOGS_INDEX_PATH = path.join(DATA_V1_ROOT, 'indexes/dogs-index.json');

interface DogEntry {
  id: number;
  name_lat: string;
  name_ru: string;
  breed: string;
  competition_count: number;
}

interface CompactSearchIndex {
  schema: string;
  popular: CompactDogEntry[];
  name_prefix: { [prefix: string]: number[] };
  breed_index: { [breed: string]: number[] };
  metadata: {
    total_dogs: number;
    popular_count: number;
    last_updated: string;
    version: string;
  };
}

interface CompactDogEntry {
  id: number;
  name_lat: string;
  name_ru: string;
  breed: string;
  activity_score: number;
}

export function buildBotSearchCompact() {
  console.log('Building compact search index for bot...');
  
  // Load existing dogs index
  const dogsIndex = JSON.parse(fs.readFileSync(DOGS_INDEX_PATH, 'utf-8')) as DogEntry[];
  console.log(`Loaded ${dogsIndex.length} dogs from index`);
  
  // Sort by competition_count (activity) and take top 10K
  const sortedByActivity = [...dogsIndex].sort((a, b) => b.competition_count - a.competition_count);
  const top10K = sortedByActivity.slice(0, 10000);
  console.log(`Selected top ${top10K.length} popular dogs`);
  
  // Create compact entries with activity score
  const popular: CompactDogEntry[] = top10K.map((dog, index) => ({
    id: dog.id,
    name_lat: dog.name_lat,
    name_ru: dog.name_ru,
    breed: dog.breed,
    activity_score: top10K.length - index // Higher score = more popular
  }));
  
  // Build name prefix index (first 3 letters of name)
  const name_prefix: { [prefix: string]: number[] } = {};
  for (const dog of top10K) {
    const nameLat = dog.name_lat.toLowerCase();
    const nameRu = dog.name_ru.toLowerCase();
    
    // Add prefixes for both names
    for (const name of [nameLat, nameRu]) {
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
  const breed_index: { [breed: string]: number[] } = {};
  for (const dog of top10K) {
    const breed = dog.breed;
    if (!breed_index[breed]) {
      breed_index[breed] = [];
    }
    breed_index[breed].push(dog.id);
  }
  console.log(`Built breed index with ${Object.keys(breed_index).length} breeds`);
  
  // Create the compact index
  const compactIndex: CompactSearchIndex = {
    schema: 'coursing-stats/bot-search-compact-v1',
    popular,
    name_prefix,
    breed_index,
    metadata: {
      total_dogs: dogsIndex.length,
      popular_count: top10K.length,
      last_updated: new Date().toISOString(),
      version: '1.0.0'
    }
  };
  
  // Write the index
  writeIndex('bot-search-compact.json', compactIndex);
  console.log('✓ Compact search index written to data/v1/indexes/bot-search-compact.json');
  
  return compactIndex;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildBotSearchCompact();
}