const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const SHOWS_INDEXES_DIR = path.join(ROOT, 'data/v1/shows/indexes');

console.log('Checking shows indexes...');

if (!fs.existsSync(SHOWS_INDEXES_DIR)) {
  console.log('Shows indexes directory does not exist');
  process.exit(0);
}

const files = fs.readdirSync(SHOWS_INDEXES_DIR).filter(f => f.endsWith('.json'));

console.log(`Found ${files.length} show index files\n`);

const emptyIndexes = [];
const populatedIndexes = [];

files.forEach(filename => {
  const filePath = path.join(SHOWS_INDEXES_DIR, filename);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    // Check different structures
    let count = 0;
    if (Array.isArray(data)) {
      count = data.length;
    } else if (data.count !== undefined) {
      count = data.count;
    } else if (data.dogs !== undefined) {
      count = data.dogs.length;
    } else if (data.items !== undefined) {
      count = data.items.length;
    }
    
    if (count === 0) {
      emptyIndexes.push({ name: filename, structure: Array.isArray(data) ? 'array' : 'object' });
    } else {
      populatedIndexes.push({ name: filename, count: count });
    }
  } catch (e) {
    emptyIndexes.push({ name: filename, error: 'parse error' });
  }
});

if (populatedIndexes.length > 0) {
  console.log('✅ Populated indexes:');
  populatedIndexes.forEach(idx => {
    console.log(`   ${idx.name}: ${idx.count} items`);
  });
}

if (emptyIndexes.length > 0) {
  console.log(`\n⚠️  Empty indexes (${emptyIndexes.length}):`);
  emptyIndexes.forEach(idx => {
    console.log(`   ${idx.name}${idx.error ? ` (${idx.error})` : ''}`);
  });
}

console.log(`\nTotal: ${populatedIndexes.length} populated, ${emptyIndexes.length} empty`);