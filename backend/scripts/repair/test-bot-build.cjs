const { spawn } = require('child_process');

console.log('Testing bot build...');

const build = spawn('npm', ['run', 'build'], { 
  cwd: 'D:/Site/CoursingStats/bot',
  shell: true
});

build.stdout.on('data', (data) => {
  console.log(data.toString());
});

build.stderr.on('data', (data) => {
  console.error(data.toString());
});

build.on('close', (code) => {
  console.log(`Build exited with code ${code}`);
});