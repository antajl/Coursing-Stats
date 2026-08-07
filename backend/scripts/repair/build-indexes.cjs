const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');

console.log('Building derived indexes...');

try {
  // Try using yarn
  execSync('yarn tsx backend/scripts/build-derived-indexes.ts', { 
    cwd: ROOT, 
    stdio: 'inherit',
    timeout: 120000 
  });
  console.log('✅ Derived indexes built successfully with yarn');
} catch (yarnError) {
  console.log('Yarn failed, trying with npm/npx...');
  try {
    execSync('npx tsx backend/scripts/build-derived-indexes.ts', { 
      cwd: ROOT, 
      stdio: 'inherit',
      timeout: 120000 
    });
    console.log('✅ Derived indexes built successfully with npx');
  } catch (npxError) {
    console.log('Npx failed, trying with node directly...');
    try {
      execSync('node backend/scripts/build-derived-indexes.ts', { 
        cwd: ROOT, 
        stdio: 'inherit',
        timeout: 120000 
      });
      console.log('✅ Derived indexes built successfully with node');
    } catch (nodeError) {
      console.error('❌ All methods failed');
      console.error('Yarn error:', yarnError.message);
      console.error('Npx error:', npxError.message);
      console.error('Node error:', nodeError.message);
      process.exit(1);
    }
  }
}