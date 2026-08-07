const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const COMPETITIONS_DIR = path.join(ROOT, 'data/v1/competitions');
const DOGS_DIR = path.join(ROOT, 'data/v1/dogs/by-id');

console.log('Checking all competition files for missing dog_id...');

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

const allFiles = findFilesInDir(COMPETITIONS_DIR);
console.log(`Found ${allFiles.length} competition files`);

const yearStats = {};
let totalResults = 0;
let missingDogId = 0;
let withDogId = 0;

for (const filePath of allFiles) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (data.event && data.event.year) {
      const year = data.event.year;
      if (!yearStats[year]) {
        yearStats[year] = { total: 0, missing: 0, with: 0 };
      }
      
      if (data.results) {
        for (const result of data.results) {
          totalResults++;
          yearStats[year].total++;
          
          if (result.dog_id === undefined && result.dog === undefined) {
            missingDogId++;
            yearStats[year].missing++;
          } else {
            withDogId++;
            yearStats[year].with++;
          }
        }
      }
    }
  } catch (e) {
    // Skip JSON errors
  }
}

console.log(`\n=== Global Statistics ===`);
console.log(`Total results: ${totalResults}`);
console.log(`With dog_id: ${withDogId}`);
console.log(`Missing dog_id: ${missingDogId}`);

console.log(`\n=== By Year ===`);
const sortedYears = Object.keys(yearStats).sort();
for (const year of sortedYears) {
  const stats = yearStats[year];
  const percentMissing = ((stats.missing / stats.total) * 100).toFixed(1);
  console.log(`${year}: ${stats.total} total, ${stats.missing} missing (${percentMissing}%), ${stats.with} with dog_id`);
}