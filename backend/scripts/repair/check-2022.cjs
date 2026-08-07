const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const COMPETITIONS_DIR = path.join(ROOT, 'data/v1/competitions/2022');
const DOGS_DIR = path.join(ROOT, 'data/v1/dogs/by-id');

console.log('Checking 2022 unmatched results...');

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

// Process 2022 competition files
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

const unmatchedResults = [];

for (const filePath of files) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (data.results) {
      for (const result of data.results) {
        if (result.dog_id === undefined && result.dog === undefined) {
          // Try to find potential matches
          let potentialMatches = [];
          for (const [dogId, dog] of dogs) {
            const nameMatch = dog.name_lat === result.name_lat || 
                            dog.name_ru === result.name_ru ||
                            dog.name_lat === result.name ||
                            dog.name_ru === result.name;
            const breedMatch = dog.breed === result.breed;
            
            if (nameMatch && breedMatch) {
              potentialMatches.push(dogId);
            }
          }
          
          unmatchedResults.push({
            file: path.basename(filePath),
            name: result.name_lat || result.name_ru || result.name,
            breed: result.breed,
            potentialMatches: potentialMatches.length
          });
        }
      }
    }
  } catch (e) {
    // Skip JSON errors
  }
}

console.log(`\n=== 2022 Unmatched Results ===`);
unmatchedResults.forEach((r, i) => {
  console.log(`${i + 1}. ${r.file}: ${r.name} (${r.breed}) - ${r.potentialMatches} potential matches`);
});

console.log(`\nTotal unmatched: ${unmatchedResults.length}`);