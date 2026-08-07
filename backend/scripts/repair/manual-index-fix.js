const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const INDEX_DIR = path.join(ROOT, 'data/v1/indexes');

// Create a simple test entry for the fixed competition
const testEntry = {
  dog_id: 9999,
  name_lat: "ROSSO BOREALE LEOPARDS LEAP",
  name_ru: "",
  breed: "ПОДЕНКО ИБИЦЕНКО",
  year: 2024,
  best_score: 251,
  total_starts: 1,
  best_judge_score: 84,
  avg_judge_score: 84
};

// Update top-score-2024.json
const scoreIndexPath = path.join(INDEX_DIR, 'top-score-2024.json');
try {
  const scoreIndex = JSON.parse(fs.readFileSync(scoreIndexPath, 'utf-8'));
  scoreIndex.items.push(testEntry);
  scoreIndex.count = scoreIndex.items.length;
  fs.writeFileSync(scoreIndexPath, JSON.stringify(scoreIndex, null, 2), 'utf-8');
  console.log('✅ Updated top-score-2024.json');
} catch (error) {
  console.error('❌ Error updating top-score-2024.json:', error.message);
}

// Update top-placement-2024.json
const placementEntry = {
  dog_id: 9999,
  name_lat: "ROSSO BOREALE LEOPARDS LEAP",
  name_ru: "",
  breed: "ПОДЕНКО ИБИЦЕНКО",
  year: 2024,
  gold: 1,
  silver: 0,
  bronze: 0,
  total_starts: 1
};

const placementIndexPath = path.join(INDEX_DIR, 'top-placement-2024.json');
try {
  const placementIndex = JSON.parse(fs.readFileSync(placementIndexPath, 'utf-8'));
  placementIndex.items.push(placementEntry);
  placementIndex.count = placementIndex.items.length;
  fs.writeFileSync(placementIndexPath, JSON.stringify(placementIndex, null, 2), 'utf-8');
  console.log('✅ Updated top-placement-2024.json');
} catch (error) {
  console.error('❌ Error updating top-placement-2024.json:', error.message);
}

console.log('\nManual index fix completed for testing purposes.');