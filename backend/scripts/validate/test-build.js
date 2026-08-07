const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');

console.log('Testing build process...\n');

try {
  console.log('Step 1: Building derived indexes...');
  execSync('npx tsx backend/scripts/build-derived-indexes.ts', { 
    cwd: ROOT, 
    stdio: 'inherit',
    timeout: 120000 
  });
  console.log('✅ Derived indexes built successfully');
  
  console.log('\nStep 2: Checking top-score-2024.json...');
  const fs = require('fs');
  const indexPath = path.join(ROOT, 'data/v1/indexes/top-score-2024.json');
  const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  console.log(`Count: ${indexData.count}`);
  console.log(`Items: ${indexData.items.length}`);
  
  if (indexData.count > 0) {
    console.log('✅ Index is populated!');
  } else {
    console.log('❌ Index is still empty');
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.error(error.stdout?.toString());
  console.error(error.stderr?.toString());
  process.exit(1);
}