const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const INDEXES_DIR = path.join(ROOT, 'data/v1/indexes');

console.log('Checking critical indexes for bot functionality...');

const criticalIndexes = [
  'top-score-2022.json',
  'top-score-2023.json', 
  'top-score-2024.json',
  'top-score-2025.json',
  'top-score-2026.json',
  'top-score-all.json',
  'top-placement-2022.json',
  'top-placement-2023.json',
  'top-placement-2024.json',
  'top-placement-2025.json',
  'top-placement-2026.json',
  'top-placement-all.json',
  'top-speed-2023.json',
  'top-speed-2024.json',
  'top-speed-2025.json',
  'top-speed-2026.json',
  'top-speed-all.json',
  'judges-summary.json'
];

let allCriticalOK = true;

criticalIndexes.forEach(filename => {
  const filePath = path.join(INDEXES_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${filename}: File not found`);
    allCriticalOK = false;
    return;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const count = data.count || 0;
    const items = data.items || [];
    const judges = data.judges || [];
    const actualCount = items.length || judges.length;
    
    if (actualCount === 0) {
      console.log(`❌ ${filename}: Empty (${actualCount} items)`);
      allCriticalOK = false;
    } else {
      console.log(`✅ ${filename}: ${actualCount} items`);
    }
  } catch (e) {
    console.log(`❌ ${filename}: Parse error`);
    allCriticalOK = false;
  }
});

if (allCriticalOK) {
  console.log(`\n✅ All critical indexes are populated and valid!`);
  console.log(`Bot and site should work correctly.`);
} else {
  console.log(`\n❌ Some critical indexes are empty or invalid.`);
  console.log(`Bot and site may have issues.`);
}