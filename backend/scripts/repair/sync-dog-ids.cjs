const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const COMPETITIONS_DIR = path.join(ROOT, 'data/v1/competitions');
const DOGS_DIR = path.join(ROOT, 'data/v1/dogs/by-id');

console.log('Syncing dog_id to competition results...');

// Load all dogs
const dogs = new Map();
const dogEntries = fs.readdirSync(DOGS_DIR, { withFileTypes: true });
for (const entry of dogEntries) {
  if (entry.name.endsWith('.json')) {
    const dogData = JSON.parse(fs.readFileSync(path.join(DOGS_DIR, entry.name), 'utf-8'));
    dogs.set(dogData.id, dogData);
  }
}

console.log(`Loaded ${dogs.size} dogs`);

// Process all competition files
function findFilesInDir(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findFilesInDir(fullPath));
    } else if (entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = findFilesInDir(COMPETITIONS_DIR);
console.log(`Found ${files.length} competition files`);

let filesUpdated = 0;
let resultsUpdated = 0;

for (const filePath of files) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (data.results) {
      let fileModified = false;
      
      for (const result of data.results) {
        // Try to find dog by name and breed
        if (result.dog_id === undefined && result.name_lat && result.breed) {
          for (const [dogId, dog] of dogs) {
            if (dog.name_lat === result.name_lat && dog.breed === result.breed) {
              result.dog_id = dogId;
              result.dog = {
                id: dogId,
                name_lat: dog.name_lat,
                name_ru: dog.name_ru,
                breed: dog.breed
              };
              resultsUpdated++;
              fileModified = true;
              break;
            }
          }
        }
      }
      
      if (fileModified) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        filesUpdated++;
      }
    }
  } catch (e) {
    console.error(`Error processing ${filePath}:`, e.message);
  }
}

console.log(`\n=== Sync Results ===`);
console.log(`Files updated: ${filesUpdated}`);
console.log(`Results updated: ${resultsUpdated}`);