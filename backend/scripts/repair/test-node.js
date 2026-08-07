console.log('Node.js is working!');
console.log('Current directory:', process.cwd());
const fs = require('fs');
console.log('File system access:', fs.existsSync('data/v1') ? 'OK' : 'FAILED');