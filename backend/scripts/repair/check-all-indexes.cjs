const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const INDEXES_DIR = path.join(ROOT, 'data/v1/indexes');

console.log('Checking all index files for completeness...');

function checkIndexFile(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const count = data.count || 0;
    const items = data.items || [];
    const judges = data.judges || [];
    const dogs = data.dogs || [];
    
    const actualCount = items.length || judges.length || dogs.length;
    const isEmpty = actualCount === 0;
    
    return {
      name: path.basename(filePath),
      count: count,
      actualCount: actualCount,
      isEmpty: isEmpty,
      schema: data.schema || 'unknown'
    };
  } catch (e) {
    return {
      name: path.basename(filePath),
      error: 'Failed to parse',
      isEmpty: true
    };
  }
}

const indexes = fs.readdirSync(INDEXES_DIR).filter(f => f.endsWith('.json'));

console.log(`Found ${indexes.length} index files\n`);

const emptyIndexes = [];
const problematicIndexes = [];

indexes.forEach(filename => {
  const result = checkIndexFile(path.join(INDEXES_DIR, filename));
  
  if (result.isEmpty) {
    emptyIndexes.push(result);
  } else if (result.error) {
    problematicIndexes.push(result);
  } else {
    console.log(`✅ ${result.name}: ${result.actualCount} items (count: ${result.count})`);
  }
});

if (emptyIndexes.length > 0) {
  console.log(`\n⚠️  Empty indexes (${emptyIndexes.length}):`);
  emptyIndexes.forEach(idx => {
    console.log(`   ${idx.name}: ${idx.schema}`);
  });
}

if (problematicIndexes.length > 0) {
  console.log(`\n❌ Problematic indexes (${problematicIndexes.length}):`);
  problematicIndexes.forEach(idx => {
    console.log(`   ${idx.name}: ${idx.error}`);
  });
}

if (emptyIndexes.length === 0 && problematicIndexes.length === 0) {
  console.log(`\n✅ All indexes are populated and valid!`);
}