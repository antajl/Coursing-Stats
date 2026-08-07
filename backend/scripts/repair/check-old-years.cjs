const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const COMPETITIONS_DIR = path.join(ROOT, 'data/v1/competitions');

console.log('Checking competition data for years 2015-2021...');

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

const yearStats = {};

for (let year = 2015; year <= 2021; year++) {
  const yearDir = path.join(COMPETITIONS_DIR, year.toString());
  if (!fs.existsSync(yearDir)) {
    yearStats[year] = { exists: false, files: 0, results: 0 };
    continue;
  }
  
  const files = findFilesInDir(yearDir);
  let totalResults = 0;
  
  for (const filePath of files) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (data.results) {
        totalResults += data.results.length;
      }
    } catch (e) {
      // Skip JSON errors
    }
  }
  
  yearStats[year] = { exists: true, files: files.length, results: totalResults };
}

console.log('\n=== Competition Data by Year (2015-2021) ===');
for (let year = 2015; year <= 2021; year++) {
  const stats = yearStats[year];
  if (stats.exists) {
    console.log(`${year}: ${stats.files} files, ${stats.results} results`);
  } else {
    console.log(`${year}: No data directory`);
  }
}