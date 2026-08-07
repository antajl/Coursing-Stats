const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const COMPETITIONS_DIR = path.join(ROOT, 'data/v1/competitions/2024');

console.log('Debugging 2024 coursing data...');

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
console.log(`Found ${files.length} files`);

let totalResults = 0;
let finishedWithScore = 0;
let finishedNullScore = 0;
let coursingEvents = 0;
let nullScoreExamples = [];

for (const filePath of files) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (data.event && data.event.event_type === 'coursing') {
      coursingEvents++;
      if (data.results) {
        for (const result of data.results) {
          totalResults++;
          if (result.status === 'finished') {
            if (result.total_score !== null) {
              finishedWithScore++;
            } else {
              finishedNullScore++;
              if (nullScoreExamples.length < 5) {
                nullScoreExamples.push({
                  file: path.basename(filePath),
                  name: result.name_lat || result.name,
                  total_score: result.total_score,
                  raw_scores: result.raw_scores_json ? 'exists' : 'missing'
                });
              }
            }
          }
        }
      }
    }
  } catch (e) {
    // Skip JSON errors
  }
}

console.log(`\n=== 2024 Coursing Statistics ===`);
console.log(`Coursing events: ${coursingEvents}`);
console.log(`Total results: ${totalResults}`);
console.log(`Finished with total_score: ${finishedWithScore}`);
console.log(`Finished with null total_score: ${finishedNullScore}`);
console.log(`Eligible for SQL (finished): ${finishedWithScore + finishedNullScore}`);

if (nullScoreExamples.length > 0) {
  console.log(`\n=== Examples of null total_score ===`);
  nullScoreExamples.forEach((ex, i) => {
    console.log(`${i + 1}. ${ex.file}: ${ex.name} (total_score: ${ex.total_score}, raw_scores: ${ex.raw_scores})`);
  });
}