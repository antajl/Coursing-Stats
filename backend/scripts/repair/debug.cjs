console.log('Starting debug script...');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);

try {
  const fs = require('fs');
  const path = require('path');
  
  const testPath = path.join(process.cwd(), 'data/v1');
  console.log('Test path:', testPath);
  console.log('Path exists:', fs.existsSync(testPath));
  
  console.log('✅ Basic Node.js operations work!');
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
}